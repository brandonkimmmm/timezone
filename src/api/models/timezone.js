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

const createTimezone = async (user_id, name, city, opts = {}) => {
	if (!isInteger(user_id) || user_id <= 0) {
		throw new Error('Invalid user id given');
	}

	if (!isString(name) || isEmpty(name)) {
		throw new Error('Invalid name given');
	}

	if (!isString(city) || isEmpty(city)) {
		throw new Error('Invalid city given');
	}

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

	const user = await getById(user_id, { raw: true });

	if (!user) {
		throw new Error('User not found');
	}

	const {
		timezone,
		offset
	} = await getCityTimezone(city);

	const existingTimezone = await getUserTimezone(user_id, formattedName, { raw: true });

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

module.exports = {
	getUserTimezones,
	getUserTimezone,
	createTimezone
};