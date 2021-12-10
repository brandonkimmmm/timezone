import logger from '../../utils/logger';
import { isInteger, isString, isEmpty, omit } from 'lodash';
import { getCityTimezone } from '../../utils/timezones';
import { getUserById } from './user';
import { FindTimezoneOpts } from '../../db/models/timezone';
import { TimezoneSchema } from '../../utils/schemas';
import Joi from 'joi';

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

export const getUserTimezones = async (
	user_id: number,
	opts: FindTimezoneOpts = {}
) => {
	const validatedUserId = await TimezoneSchema.extract('user_id').required().validateAsync(user_id);

	logger.debug(
		'api/models/timezone/getUserTimezones',
		'user_id:',
		validatedUserId
	);

	const user = await getUserById(validatedUserId);

	// if user with given user_id is not found, throw an error
	if (!user) {
		throw new Error('User not found');
	}

	const timezones = await user.getTimezones(opts);

	return timezones;
};

export const getUserTimezone = async (
	user_id: number,
	name: string,
	opts: FindTimezoneOpts = {}
) => {
	const validatedData = await Joi.object({
		user_id: TimezoneSchema.extract('user_id').required(),
		name: TimezoneSchema.extract('name').required()
	}).validateAsync({ user_id, name });

	const user = await getUserById(validatedData.user_id);

	if (!user) {
		throw new Error('User not found');
	}

	logger.debug(
		'api/models/timezone/getTimezone',
		'user_id:',
		validatedData.user_id,
		'name:',
		validatedData.name
	);

	const [ timezone ] = await user.getTimezones({
		where: {
			name: validatedData.name
		},
		...opts
	});

	return timezone;
};

export const createUserTimezone = async (
	user_id: number,
	name: string,
	city: string,
	country?: string
) => {
	const validatedData = await Joi.object({
		user_id: TimezoneSchema.extract('user_id').required(),
		name: TimezoneSchema.extract('name').required(),
		city: TimezoneSchema.extract('city').required(),
		country: TimezoneSchema.extract('country')
	}).validateAsync({ user_id, name, city, country });

	const user = await getUserById(validatedData.user_id);

	if (!user) {
		throw new Error('User not found');
	}

	logger.debug(
		'api/models/timezone/createUserTimezone',
		'user_id:',
		validatedData.user_id,
		'name:',
		validatedData.name,
		'city:',
		validatedData.city,
		'country:',
		validatedData.country
	);

	const { timezone, offset } = await getCityTimezone(validatedData.city, validatedData.country);

	const [ existingTimezone ] = await user.getTimezones({
		where: {
			name: validatedData.name,
			city: validatedData.city
		}
	});

	if (existingTimezone) {
		throw new Error('Timezone with name already exists for user');
	}

	const userTimezone = await user.createTimezone({
		name: validatedData.name,
		city: validatedData.city,
		timezone,
		offset
	});

	return userTimezone;
};

export const updateUserTimezone = async (
	user_id: number,
	name: string,
	data: Opts = { country: null }
) => {
	if (!isInteger(user_id) || user_id <= 0) {
		throw new Error('Invalid user id given');
	}

	if (!isString(name) || isEmpty(name)) {
		throw new Error('Invalid name given');
	}

	const validatedData = await Joi.object({
		user_id: TimezoneSchema.extract('user_id').required(),
		name: TimezoneSchema.extract('name').required(),
		country: TimezoneSchema.extract('country')
	}).validateAsync({ user_id, name, country: data.country });

	logger.debug(
		'api/models/timezone/updateUserTimezone',
		'user_id:',
		validatedData.user_id,
		'name:',
		validatedData.name,
		'country:',
		validatedData.country
	);

	const user = await getUserById(validatedData.user_id);

	if (!user) {
		throw new Error('User not found');
	}

	const [ existingTimezone ] = await user.getTimezones({
		where: {
			name: validatedData.name
		}
	});

	// if timezone does not exist, throw an error
	if (!existingTimezone) {
		throw new Error('Timezone not found');
	}

	const country = validatedData.country;

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

export const deleteUserTimezone = async (
	user_id: number,
	name: string
) => {
	const validatedData = await Joi.object({
		user_id: TimezoneSchema.extract('user_id').required(),
		name: TimezoneSchema.extract('name').required(),
	}).validateAsync({ user_id, name });

	const user = await getUserById(validatedData.user_id);

	if (!user) {
		throw new Error('User not found');
	}

	logger.debug(
		'api/models/timezone/deleteUserTimezone',
		'user_id:',
		validatedData.user_id,
		'name:',
		validatedData.name
	);

	const [ existingTimezone ] = await user.getTimezones({
		where: {
			name: validatedData.name
		}
	});

	// throw an error if timezone is not found
	if (!existingTimezone) {
		throw new Error('Timezone not found');
	}

	await existingTimezone.destroy();

	return existingTimezone;
};