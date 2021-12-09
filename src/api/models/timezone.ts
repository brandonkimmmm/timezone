import logger from '../../utils/logger';
import { isInteger, isString, isEmpty, omit } from 'lodash';
import { getCityTimezone } from '../../utils/timezones';
import { getById } from './user';

interface Opts {
	country?: string | null;
	updated_city?: string;
	updated_country?: string;
	[key: string]: any;
}

interface UpdateData {
	name?: string;
	city?: string;
	offset?: string;
	timezone?: string;
}

export const getUserTimezones = async (user_id: number) => {
	if (!isInteger(user_id) || user_id <= 0) {
		throw new Error('Invalid user id given');
	}

	logger.debug(
		'api/models/timezone/getUserTimezones',
		'user_id:',
		user_id
	);

	const user = await getById(user_id);

	// if user with given user_id is not found, throw an error
	if (!user) {
		throw new Error('User not found');
	}

	const timezones = await user.getTimezones();

	return timezones;
};

export const getUserTimezone = async (user_id: number, name: string) => {
	if (!isInteger(user_id) || user_id <= 0) {
		throw new Error('Invalid user id given');
	}

	if (!isString(name) || isEmpty(name)) {
		throw new Error('Invalid name given');
	}

	const user = await getById(user_id);

	if (!user) {
		throw new Error('User not found');
	}

	const formattedName = name.toLowerCase().trim();

	logger.debug(
		'api/models/timezone/getTimezone',
		'user_id:',
		user_id,
		'name:',
		formattedName
	);

	const [ timezone ] = await user.getTimezones({
		where: {
			name: formattedName
		}
	});

	return timezone;
};

export const createTimezone = async (user_id: number, name: string, city: string, country?: string) => {
	if (!isInteger(user_id) || user_id <= 0) {
		throw new Error('Invalid user id given');
	}

	if (!isString(name) || isEmpty(name)) {
		throw new Error('Invalid name given');
	}

	if (!isString(city) || isEmpty(city)) {
		throw new Error('Invalid city given');
	}

	const user = await getById(user_id);

	if (!user) {
		throw new Error('User not found');
	}

	// format name and city given (lower case, trim)
	const formattedName = name.toLowerCase().trim();
	const formattedCity = city.toLowerCase().trim();

	logger.debug(
		'api/models/timezone/createTimezone',
		'user_id:',
		user_id,
		'name:',
		formattedName,
		'city:',
		formattedCity
	);

	const {
		timezone,
		offset
	} = await getCityTimezone(city, country);

	const [ existingTimezone ] = await user.getTimezones({
		where: {
			name: formattedName,
			city: formattedCity
		}
	});

	if (existingTimezone) {
		throw new Error('Timezone with name already exists for user');
	}

	const userTimezone = await user.createTimezone({
		name: formattedName,
		city: formattedCity,
		timezone,
		offset
	});

	return userTimezone;
};

export const updateUserTimezone = async (user_id: number, name: string, data: Opts = { country: null }) => {
	if (!isInteger(user_id) || user_id <= 0) {
		throw new Error('Invalid user id given');
	}

	if (!isString(name) || isEmpty(name)) {
		throw new Error('Invalid name given');
	}

	logger.debug(
		'api/models/timezone/updateUserTimezone',
		'user_id:',
		user_id,
		'name:',
		name
	);

	const user = await getById(user_id);

	if (!user) {
		throw new Error('User not found');
	}

	// format name and city given (lower case, trim)
	const formattedName = name.toLowerCase().trim();

	const [ existingTimezone ] = await user.getTimezones({
		where: {
			name: formattedName
		}
	});

	// if timezone does not exist, throw an error
	if (!existingTimezone) {
		throw new Error('Timezone not found');
	}

	const country = data.country;

	const givenData = omit(data, 'country');

	const updateData: UpdateData = {};

	for (const field in givenData) {
		const value = givenData[field].toLowerCase().trim();

		switch (field) {
		case 'updated_name':
			if (value !== existingTimezone.name) {
				// check if user already has a timezone with given name
				const [ existingTimezone ] = await user.getTimezones({
					where: {
						name: value
					}
				});

				if (existingTimezone) {
					throw new Error('Timezone with name already exists');
				}

				updateData.name = value;
			}
			break;
		case 'updated_city':
			if (isString(value)) {
				// Get timezone of city given
				const {
					timezone,
					offset
				} = await getCityTimezone(value, country as string);

				if (timezone !== existingTimezone.timezone) {
					updateData.city = value;
					updateData.timezone = timezone;
					updateData.offset = offset;
				}
			}
			break;
		}
	}

	if (isEmpty(updateData)) {
		throw new Error('No fields to update');
	}

	const userTimezone = await existingTimezone.update(updateData);

	return userTimezone;
};

export const deleteUserTimezone = async (user_id: number, name: string) => {
	if (!isInteger(user_id) || user_id <= 0) {
		throw new Error('Invalid user id given');
	}

	if (!isString(name) || isEmpty(name)) {
		throw new Error('Invalid name given');
	}

	const user = await getById(user_id);

	if (!user) {
		throw new Error('User not found');
	}

	// format name and city given (lower case, trim)
	const formattedName = name.toLowerCase().trim();

	logger.debug(
		'api/models/timezone/deleteUserTimezone',
		'user_id:',
		user_id,
		'name:',
		formattedName
	);

	const [ existingTimezone ] = await user.getTimezones({
		where: {
			name: formattedName
		}
	});

	// throw an error if timezone is not found
	if (!existingTimezone) {
		throw new Error('Timezone not found');
	}

	await existingTimezone.destroy();

	return existingTimezone;
};