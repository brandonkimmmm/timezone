import logger from '../utils/logger';
import { isString, isEmpty, omit } from 'lodash';
import { getCityTimezone } from '../utils/timezones';
import { getUser } from './user.service';
import Timezone, { FindTimezoneOpts } from '../db/models/timezone';
import { UserAttributes } from '../db/models/user';

export const getTimezone = async (opts: FindTimezoneOpts = {}) => {
	return Timezone.findOne(opts);
};

export const getTimezones = async (opts: FindTimezoneOpts = {}) => {
	return Timezone.findAll(opts);
};

export const createTimezone = async (
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

	const [existingTimezone] = await user.getTimezones({
		where: {
			name,
			city
		}
	});

	if (existingTimezone) {
		throw new Error('Timezone with name already exists for user');
	}

	const { timezone, offset } = await getCityTimezone(city, country);

	return user.createTimezone({
		name,
		city,
		timezone,
		offset
	});
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

export const updateTimezone = async (
	id: number,
	data: UpdateTimezoneData,
	user: Pick<UserAttributes, 'id' | 'role'>
) => {
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

	if (user.role !== 'admin' && user.id !== existingTimezone.user_id) {
		throw new Error('Not Authorized');
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

export const deleteTimezone = async (
	id: number,
	user: Pick<UserAttributes, 'id' | 'role'>
) => {
	logger.debug('api/models/timezone/deleteUserTimezone', 'id:', id);

	const existingTimezone = await getTimezone({ where: { id } });

	// throw an error if timezone is not found
	if (!existingTimezone) {
		throw new Error('Timezone not found');
	}

	if (user.role !== 'admin' && user.id !== existingTimezone.user_id) {
		throw new Error('Not Authorized');
	}

	await existingTimezone.destroy();

	return existingTimezone;
};
