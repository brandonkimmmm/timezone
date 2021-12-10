import User, { Role, FindUserOpts } from '../../db/models/user';
import logger from '../../utils/logger';
import { isString, isInteger, isEmpty } from 'lodash';
import validator from 'validator';
import { PASSWORD_REGEX, VALID_ROLES } from '../../config/constants';

export const getUserById = async (
	id: number,
	opts: FindUserOpts = {}
) => {
	if (!isInteger(id) || id <= 0) {
		throw new Error('Invalid ID');
	}

	logger.debug(
		'api/models/user/getUserById',
		'id:',
		id
	);

	const user = await User.findByPk(id, opts);

	return user;
};

export const getUserByEmail = async (
	email: string,
	opts: FindUserOpts = {}
) => {
	if (!isString(email) || !validator.isEmail(email)) {
		throw new Error('Invalid email given');
	}

	const formattedEmail = email.toLowerCase().trim();

	logger.debug(
		'api/models/user/getUserByEmail',
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

export const getUsers = async (
	opts: FindUserOpts = {}
) => {
	logger.debug(
		'api/models/user/getUsers'
	);

	const users = await User.findAll(opts);

	return users;
};

export const createUser = async (
	email: string,
	password: string,
	role: Role = 'user'
) => {
	if (!isString(email) || !validator.isEmail(email)) {
		throw new Error('Invalid email given');
	}

	if (!isString(password) || !PASSWORD_REGEX.test(password)) {
		throw new Error('Invalid password given');
	}

	const formattedEmail = email.toLowerCase().trim();

	logger.debug(
		'api/models/user/createUser',
		'email:',
		email,
		'formattedEamil:',
		formattedEmail,
		'role:',
		role
	);

	const existingUser = await getUserByEmail(formattedEmail);

	if (existingUser) {
		throw new Error(`User ${email} already exists`);
	}

	const user = await User.create({
		email: formattedEmail,
		password,
		role: role ||= 'user'
	});

	return user;
};

export const updateUserRole = async (
	id: number,
	role: Role = 'user'
) => {
	if (!isInteger(id) || id <= 0) {
		throw new Error('Invalid id given');
	}

	if (id === 1) {
		throw new Error('Cannot update master admin role');
	}

	if (!isString(role) || isEmpty(role)) {
		throw new Error('Invalid role given');
	}

	if (!VALID_ROLES.includes(role)) {
		throw new Error('Invalid role given');
	}

	logger.debug(
		'api/models/user/updateUserRole',
		'id:',
		id,
		'role:',
		role
	);

	const user = await getUserById(id);

	if (!user) {
		throw new Error('User not found');
	}

	if (user.role === role) {
		throw new Error(`User already has role ${role}`);
	}

	await user.update({
		role
	}, { fields: ['role'] });

	return user;
};

export const deleteUser = async (id: number) => {
	if (!isInteger(id) || id <= 0) {
		throw new Error('Invalid id given');
	}

	if (id === 1) {
		throw new Error('Cannot delete master admin');
	}

	logger.debug(
		'api/models/user/deleteUser',
		'id:',
		id
	);

	const user = await getUserById(id);

	if (!user) {
		throw new Error('User not found');
	}

	await user.destroy();

	return user;
};