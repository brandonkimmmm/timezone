import logger from '../utils/logger';
import { isInteger, isString, isEmpty, omit } from 'lodash';
import { getCityTimezone } from '../utils/timezones';
import { getUser } from './UserService';
import Timezone, { FindTimezoneOpts } from '../db/models/timezone';
import { TimezoneSchema } from '../utils/schemas';
import Joi from 'joi';

export const getTimezone = async (opts: FindTimezoneOpts = {}) => {
	return Timezone.findOne(opts);
};

export const getTimezones = async (opts: FindTimezoneOpts = {}) => {
	return Timezone.findAll(opts);
};

export const getUserTimezones = async (
	user_id: number,
	opts: FindTimezoneOpts = {}
) => {
	const validatedUserId = await TimezoneSchema.extract('user_id')
		.required()
		.validateAsync(user_id);

	logger.debug(
		'api/models/timezone/getUserTimezones',
		'user_id:',
		validatedUserId
	);

	const user = await getUser({ where: { id: validatedUserId } });

	if (!user) {
		throw new Error('User not found');
	}

	const timezones = await user.getTimezones(opts);

	return timezones;
};

export const createUserTimezone = async (
	user_id: number,
	name: string,
	city: string,
	country?: string
) => {
	const user = await getUser({ where: { id: user_id } });

	if (!user) {
		throw new Error('User not found');
	}

	logger.debug(
		'api/models/timezone/createUserTimezone',
		'user_id:',
		user_id,
		'name:',
		name,
		'city:',
		city,
		'country:',
		country
	);

	const { timezone, offset } = await getCityTimezone(city, country);

	const [existingTimezone] = await user.getTimezones({
		where: {
			name,
			city
		}
	});

	if (existingTimezone) {
		throw new Error('Timezone with name already exists for user');
	}

	const userTimezone = await user.createTimezone({
		name,
		city,
		timezone,
		offset
	});

	return userTimezone;
};

interface UpdateTimezoneData {
	name: string | null;
	city: string | null;
	country?: string | null;
}

interface UpdateData {
	name?: string;
	city?: string;
	offset?: string;
	timezone?: string;
}

export const updateUserTimezone = async (
	user_id: number,
	id: number,
	data: UpdateTimezoneData
) => {
	logger.debug(
		'api/models/timezone/updateUserTimezone',
		'user_id:',
		user_id,
		'id:',
		id,
		'data:',
		data
	);

	const user = await getUser({ where: { id: user_id } });

	if (!user) {
		throw new Error('User not found');
	}

	const [existingTimezone] = await user.getTimezones({
		where: {
			id
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
		switch (field) {
			case 'name':
				if (givenData[field] !== existingTimezone.name) {
					// check if user already has a timezone with given name
					const [existingTimezone] = await user.getTimezones({
						where: {
							name: givenData[field]
						}
					});

					if (existingTimezone) {
						throw new Error('Timezone with name already exists');
					}

					updateData.name = givenData[field] as string;
				}
				break;
			case 'city':
				if (isString(givenData[field])) {
					// Get timezone of city given
					const { timezone, offset } = await getCityTimezone(
						givenData[field] as string,
						country as string
					);

					if (timezone !== existingTimezone.timezone) {
						updateData.city = givenData[field] as string;
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

export const updateTimezone = async (id: number, data: UpdateTimezoneData) => {
	logger.debug(
		'api/models/timezone/updateUserTimezone',
		'id:',
		id,
		'data:',
		data
	);

	const existingTimezone = await getTimezone({ where: { id } });

	// if timezone does not exist, throw an error
	if (!existingTimezone) {
		throw new Error('Timezone not found');
	}

	const country = data.country;

	const givenData = omit(data, 'country');

	const updateData: UpdateData = {};

	for (const field in givenData) {
		switch (field) {
			case 'name':
				if (givenData[field] !== existingTimezone.name) {
					// check if user already has a timezone with given name
					const timezone = await getTimezone({
						where: {
							name: givenData[field],
							user_id: existingTimezone.user_id
						}
					});

					if (timezone) {
						throw new Error('Timezone with name already exists');
					}

					updateData.name = givenData[field] as string;
				}
				break;
			case 'city':
				if (isString(givenData[field])) {
					// Get timezone of city given
					const { timezone, offset } = await getCityTimezone(
						givenData[field] as string,
						country as string
					);

					if (timezone !== existingTimezone.timezone) {
						updateData.city = givenData[field] as string;
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

export const deleteUserTimezone = async (user_id: number, id: number) => {
	const user = await getUser({ where: { id: user_id } });

	if (!user) {
		throw new Error('User not found');
	}

	logger.debug('api/models/timezone/deleteUserTimezone', 'user_id:', user_id);

	const [existingTimezone] = await user.getTimezones({
		where: {
			id
		}
	});

	// throw an error if timezone is not found
	if (!existingTimezone) {
		throw new Error('Timezone not found');
	}

	await existingTimezone.destroy();

	return existingTimezone;
};

export const deleteTimezone = async (id: number) => {
	logger.debug('api/models/timezone/deleteUserTimezone', 'id:', id);

	const existingTimezone = await getTimezone({ where: { id } });

	// throw an error if timezone is not found
	if (!existingTimezone) {
		throw new Error('Timezone not found');
	}

	await existingTimezone.destroy();

	return existingTimezone;
};
