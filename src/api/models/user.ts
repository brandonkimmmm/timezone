import User from '../../db/models/user';
import logger from '../../utils/logger';
import { isString, isInteger, isEmpty } from 'lodash';
import validator from 'validator';
import { PASSWORD_REGEX, VALID_ROLES } from '../../config/constants';

export const getById = async (id: number) => {
	if (!isInteger(id) || id <= 0) {
		throw new Error('Invalid ID');
	}

	logger.debug(
		'api/models/user/getById',
		'id:',
		id
	);

	const user = await User.findOne({
		where: {
			id
		}
	});

	return user;
};

export const getByEmail = async (email: string) => {
	if (!isString(email) || !validator.isEmail(email)) {
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
		}
	});

	return user;
};

export const getAll = async (opts = {}) => {
	logger.debug(
		'api/models/user/getAll'
	);

	const users = await User.findAll(opts);

	return users;
};

export const create = async (
	email: string,
	password: string,
	role?: string
) => {
	if (!isString(email) || !validator.isEmail(email)) {
		throw new Error('Invalid email given');
	}

	if (!isString(password) || !PASSWORD_REGEX.test(password)) {
		throw new Error('Invalid password given');
	}

	const formattedEmail = email.toLowerCase().trim();

	logger.debug(
		'api/models/user/create asdfasd',
		'email:',
		email,
		'formattedEamil:',
		formattedEmail,
		'role:',
		role
	);

	const existingUser = await getByEmail(formattedEmail);

	if (existingUser) {
		throw new Error(`User ${email} already exists`);
	}

	const user = await User.create({
		email: formattedEmail,
		password,
		role: role ||= undefined
	});

	return user;
};

export const updateRole = async (
	id: number,
	role: string
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

	const user = await getById(id);

	if (!user) {
		throw new Error('User not found');
	}

	await user.destroy();

	return user;
};