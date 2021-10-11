const { User } = require('../../db/models');
const logger = require('../../utils/logger');
const { isString } = require('lodash');
const { isEmail } = require('validator');
const { PASSWORD_REGEX } = require('../../config/constants');

const get = async (email) => {
	if (!isString(email) || !isEmail(email)) {
		throw new Error('Invalid email given');
	}

	const formattedEmail = email.toLowerCase().trim();

	logger.debug(
		'api/models/user/get',
		'email:',
		email,
		'formattedEmail:',
		formattedEmail
	);

	const user = await User.findOne({
		where: {
			email: formattedEmail
		}
	});

	return user;
};

const create = async (
	email,
	password
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

	const existingUser = await get(formattedEmail);

	if (existingUser) {
		throw new Error(`User ${email} already exists`);
	}

	const user = await User.create({
		email: formattedEmail,
		password
	});

	return user;
};

module.exports = {
	get,
	create
};