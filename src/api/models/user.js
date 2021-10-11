const { User } = require('../../db/models');
const logger = require('../../utils/logger');
const { isString, isInteger } = require('lodash');
const { isEmail } = require('validator');
const { PASSWORD_REGEX } = require('../../config/constants');

const getById = async (id, opts = {}) => {
	if (!isInteger(id) || id <= 0) {
		throw new Error('Invalid id');
	}

	logger.debug(
		'api/models/user/getById',
		'id:',
		id
	);

	const user = await User.findOne({
		where: {
			id
		},
		...opts
	});

	return user;
};

const getByEmail = async (email, opts = {}) => {
	if (!isString(email) || !isEmail(email)) {
		throw new Error('Invalid email given');
	}

	const formattedEmail = email.toLowerCase().trim();

	logger.debug(
		'api/models/user/getByEmail',
		'email:',
		email,
		'formattedEmail:',
		formattedEmail
	);

	const user = await User.findOne({
		where: {
			email: formattedEmail
		},
		...opts
	});

	return user;
};

const create = async (
	email,
	password,
	opts = {}
) => {
	if (!isString(email) || !isEmail(email)) {
		throw new Error('Invalid email given');
	}

	if (!isString(password) || !PASSWORD_REGEX.test(password)) {
		throw new Error('Invalid password given');
	}

	const formattedEmail = email.toLowerCase().trim();

	logger.debug(
		'api/models/user/create',
		'email:',
		email,
		'formattedEamil:',
		formattedEmail
	);

	const existingUser = await getByEmail(formattedEmail);

	if (existingUser) {
		throw new Error(`User ${email} already exists`);
	}

	const user = await User.create({
		email: formattedEmail,
		password,
		...opts
	});

	return user;
};

module.exports = {
	getByEmail,
	getById,
	create
};