import Joi from 'joi';
import User, { Role, FindUserOpts } from '../../db/models/user';
import logger from '../../utils/logger';
import { UserSchema } from '../../utils/schemas';

export const getUserById = async (
	id: number,
	opts: FindUserOpts = {}
) => {
	const validatedId = await UserSchema.extract('id').required().validateAsync(id);

	logger.debug(
		'api/models/user/getUserById',
		'id:',
		validatedId
	);

	const user = await User.findByPk(validatedId, opts);

	return user;
};

export const getUserByEmail = async (
	email: string,
	opts: FindUserOpts = {}
) => {
	const validatedEmail = await UserSchema.extract('email').required().validateAsync(email);

	logger.debug(
		'api/models/user/getUserByEmail',
		'email:',
		validatedEmail
	);

	const user = await User.findOne({
		where: { email: validatedEmail },
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
	const validatedData = await Joi.object({
		email: UserSchema.extract('email').required(),
		password: UserSchema.extract('password').required(),
		role: UserSchema.extract('role').default('user')
	}).validateAsync({ email, password, role });

	logger.debug(
		'api/models/user/createUser',
		'email:',
		validatedData.email,
		'role:',
		validatedData.role
	);

	const existingUser = await getUserByEmail(validatedData.email);

	if (existingUser) {
		throw new Error(`User ${validatedData.email} already exists`);
	}

	const user = await User.create({
		email: validatedData.email,
		password: validatedData.password,
		role: validatedData.role
	});

	return user;
};

export const updateUserRole = async (
	id: number,
	role: Role
) => {
	const validatedData = await Joi.object({
		id: UserSchema.extract('id').required(),
		role: UserSchema.extract('role').required()
	}).validateAsync({ id, role });

	if (validatedData.id === 1) {
		throw new Error('Cannot update master admin role');
	}

	logger.debug(
		'api/models/user/updateUserRole',
		'id:',
		validatedData.id,
		'role:',
		validatedData.role
	);

	const user = await getUserById(validatedData.id);

	if (!user) {
		throw new Error('User not found');
	}

	if (user.role === validatedData.role) {
		throw new Error(`User already has role ${validatedData.role}`);
	}

	await user.update({
		role: validatedData.role
	}, { fields: ['role'] });

	return user;
};

export const deleteUser = async (id: number) => {
	const validatedId = await UserSchema.extract('id').required().validateAsync(id);

	if (validatedId === 1) {
		throw new Error('Cannot delete master admin');
	}

	logger.debug(
		'api/models/user/deleteUser',
		'id:',
		validatedId
	);

	const user = await getUserById(validatedId);

	if (!user) {
		throw new Error('User not found');
	}

	await user.destroy();

	return user;
};