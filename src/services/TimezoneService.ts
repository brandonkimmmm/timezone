import logger from '../utils/logger';
import { isInteger, isString, isEmpty, omit } from 'lodash';
import { getCityTimezone } from '../utils/timezones';
import { getUserById } from './UserService';
import { FindTimezoneOpts } from '../db/models/timezone';
import { TimezoneSchema } from '../utils/schemas';
import Joi from 'joi';

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

	const user = await getUserById(validatedUserId);

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

	const { timezone, offset } = await getCityTimezone(
		validatedData.city,
		validatedData.country
	);

	const [existingTimezone] = await user.getTimezones({
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
	const validatedData = await Joi.object({
		user_id: TimezoneSchema.extract('user_id').required(),
		id: TimezoneSchema.extract('id').required(),
		data: Joi.object({
			name: TimezoneSchema.extract('name'),
			city: TimezoneSchema.extract('city'),
			country: TimezoneSchema.extract('country')
		})
			.required()
			.min(1)
	}).validateAsync({ user_id, id, data });

	logger.debug(
		'api/models/timezone/updateUserTimezone',
		'user_id:',
		validatedData.user_id,
		'id:',
		validatedData.id,
		'data:',
		validatedData.data
	);

	const user = await getUserById(validatedData.user_id);

	if (!user) {
		throw new Error('User not found');
	}

	const [existingTimezone] = await user.getTimezones({
		where: {
			id: validatedData.id
		}
	});

	// if timezone does not exist, throw an error
	if (!existingTimezone) {
		throw new Error('Timezone not found');
	}

	const country = validatedData.data.country;

	const givenData = omit(validatedData.data, 'country');

	const updateData: UpdateData = {};

	for (const field in givenData) {
		const value = givenData[field].toLowerCase().trim();

		switch (field) {
			case 'name':
				if (value !== existingTimezone.name) {
					// check if user already has a timezone with given name
					const [existingTimezone] = await user.getTimezones({
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
			case 'city':
				if (isString(value)) {
					// Get timezone of city given
					const { timezone, offset } = await getCityTimezone(
						value,
						country as string
					);

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

export const deleteUserTimezone = async (user_id: number, id: number) => {
	const validatedData = await Joi.object({
		user_id: TimezoneSchema.extract('user_id').required(),
		id: TimezoneSchema.extract('id').required()
	}).validateAsync({ user_id, id });

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

	const [existingTimezone] = await user.getTimezones({
		where: {
			id: validatedData.id
		}
	});

	// throw an error if timezone is not found
	if (!existingTimezone) {
		throw new Error('Timezone not found');
	}

	await existingTimezone.destroy();

	return existingTimezone;
};
