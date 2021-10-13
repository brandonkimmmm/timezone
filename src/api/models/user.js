const { User } = require('../../db/models');
const logger = require('../../utils/logger');
const { isString, isInteger, isEmpty } = require('lodash');
const { isEmail } = require('validator');
const { PASSWORD_REGEX, VALID_ROLES, MASTER_ADMIN } = require('../../config/constants');

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

	// format given email (lowercase, trim)
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

	// If user exists with given email, throw an error
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

const updateRole = async (
	id,
	role
) => {
	if (!isInteger(id) || id <= 0) {
		throw new Error('Invalid id given');
	}

	if (id === MASTER_ADMIN) {
		throw new Error('Cannot update master admin role');
	}

	if (!isString(role) || isEmpty(role)) {
		throw new Error('Invalid role given');
	}

	// format given role
	const formattedRole = role.toLowerCase().trim();

	if (!VALID_ROLES.includes(formattedRole)) {
		throw new Error('Invalid role given');
	}

	logger.debug(
		'api/models/user/updateUserRole',
		'id:',
		id,
		'role:',
		formattedRole
	);

	const user = await getById(id);

	if (!user) {
		throw new Error('User not found');
	}

	if (user.role === formattedRole) {
		throw new Error(`User already has role ${formattedRole}`);
	}

	await user.update({
		role: formattedRole
	}, { fields: ['role'] });

	return user;
};

const deleteUser = async (id) => {
	if (!isInteger(id) || id <= 0) {
		throw new Error('Invalid id given');
	}

	if (id === MASTER_ADMIN) {
		throw new Error('Cannot delete master admin');
	}

	logger.debug(
		'api/models/user/deleteUser',
		'id:',
		id
	);

	const user = await getById(id);

	if (!user) {
		throw new Error('User not found');
	}

	await user.destroy();

	return user;
};

module.exports = {
	getByEmail,
	getById,
	create,
	updateRole,
	deleteUser
};