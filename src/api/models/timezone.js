const { Timezone } = require('../../db/models');
const logger = require('../../utils/logger');
const { isInteger, isString, isEmpty } = require('lodash');
const { getCityTimezone } = require('../../utils/timezones');
const { getById } = require('./user');

const getUserTimezones = async (user_id, opts = {}) => {
	if (!isInteger(user_id) || user_id <= 0) {
		throw new Error('Invalid user id given');
	}

	logger.debug(
		'api/models/timezone/getUserTimezones',
		'user_id:',
		user_id
	);

	const user = await getById(user_id, { raw: true });

	// if user with given user_id is not found, throw an error
	if (!user) {
		throw new Error('User not found');
	}

	const timezones = await Timezone.findAll({
		where: {
			user_id
		},
		...opts
	});

	return timezones;
};

const getUserTimezone = async (user_id, name, opts = {}) => {
	if (!isInteger(user_id) || user_id <= 0) {
		throw new Error('Invalid user id given');
	}

	if (!isString(name) || isEmpty(name)) {
		throw new Error('Invalid name given');
	}

	const user = await getById(user_id, { raw: true });

	// if user with given user_id is not found, throw an error
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

	const timezone = await Timezone.findOne({
		where: {
			user_id,
			name: formattedName
		},
		...opts
	});

	return timezone;
};

const createTimezone = async (user_id, name, city, country, opts = {}) => {
	if (!isInteger(user_id) || user_id <= 0) {
		throw new Error('Invalid user id given');
	}

	if (!isString(name) || isEmpty(name)) {
		throw new Error('Invalid name given');
	}

	if (!isString(city) || isEmpty(city)) {
		throw new Error('Invalid city given');
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

	const existingTimezone = await getUserTimezone(user_id, formattedName, { raw: true });

	// if a user has timezone with the same name, throw an error
	if (existingTimezone) {
		throw new Error('Timezone with name already exists for user');
	}

	const userTimezone = await Timezone.create({
		user_id,
		name: formattedName,
		city: formattedCity,
		timezone,
		offset,
		...opts
	});

	return userTimezone;
};

const updateUserTimezone = async (user_id, name, data = {}) => {
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

	const existingTimezone = await getUserTimezone(user_id, name);

	// if timezone does not exist, throw an error
	if (!existingTimezone) {
		throw new Error('Timezone not found');
	}

	const country = data.country;

	const updateData = {};

	for (const field in data) {
		const value = data[field].toLowerCase().trim();

		switch (field) {
		case 'updated_name':
			if (value !== existingTimezone.name) {
				// check if user already has a timezone with given name
				const existingTimezone = await getUserTimezone(user_id, value, { raw: true });

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
				} = await getCityTimezone(value, country);

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

	const userTimezone = await existingTimezone.update(updateData, { fields: Object.keys(updateData)});

	return userTimezone;
};

const deleteUserTimezone = async (user_id, name) => {
	if (!isInteger(user_id) || user_id <= 0) {
		throw new Error('Invalid user id given');
	}

	if (!isString(name) || isEmpty(name)) {
		throw new Error('Invalid name given');
	}

	const formattedName = name.toLowerCase().trim();

	logger.debug(
		'api/models/timezone/deleteUserTimezone',
		'user_id:',
		user_id,
		'name:',
		formattedName
	);

	const timezone = await getUserTimezone(user_id, formattedName);

	// throw an error if timezone is not found
	if (!timezone) {
		throw new Error('Timezone not found');
	}

	await timezone.destroy();

	return timezone;
};

module.exports = {
	getUserTimezones,
	getUserTimezone,
	createTimezone,
	updateUserTimezone,
	deleteUserTimezone
};