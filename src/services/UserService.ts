import User, { Role, FindUserOpts } from '../db/models/user';
import logger from '../utils/logger';
import { UserSchema } from '../utils/schemas';
import Joi from 'joi';
import { signToken } from '../utils/jwt';

export const getUser = async (opts: FindUserOpts = {}) => {
	logger.debug('api/models/user/getUserById', 'opts:', opts);
	return User.findOne(opts);
};

export const getUsers = async (opts: FindUserOpts = {}) => {
	logger.debug('api/models/user/getUsers');
	return User.findAll(opts);
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

	const existingUser = await getUser({
		where: { email: validatedData.email }
	});

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

export const updateUserRole = async (id: number, role: Role) => {
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

	const user = await getUser({ where: { id: validatedData.id } });

	if (!user) {
		throw new Error('User not found');
	}

	if (user.role === validatedData.role) {
		throw new Error(`User already has role ${validatedData.role}`);
	}

	await user.update(
		{
			role: validatedData.role
		},
		{ fields: ['role'] }
	);

	return user;
};

export const deleteUser = async (id: number) => {
	const validatedId = await UserSchema.extract('id')
		.required()
		.validateAsync(id);

	if (validatedId === 1) {
		throw new Error('Cannot delete master admin');
	}

	logger.debug('api/models/user/deleteUser', 'id:', validatedId);

	const user = await getUser({ where: { id: validatedId } });

	if (!user) {
		throw new Error('User not found');
	}

	await user.destroy();

	return user;
};

export const loginUser = async (email: string, password: string) => {
	const validatedData = await Joi.object({
		id: UserSchema.extract('email').required(),
		role: UserSchema.extract('password').required()
	}).validateAsync({ email, password });

	const user = await getUser({ where: { email: validatedData.email } });

	if (!user) {
		throw new Error('User not found');
	}

	const isValidPassword = await user.verifyPassword(validatedData.password);

	if (!isValidPassword) {
		throw new Error('Invalid password given');
	}

	const token = await signToken(user.id, user.email, user.role);

	return token;
};

export const signupUser = async (email: string, password: string) => {
	const validatedData = await Joi.object({
		id: UserSchema.extract('email').required(),
		role: UserSchema.extract('password').required()
	}).validateAsync({ email, password });

	const user = await createUser(validatedData.email, validatedData.password);

	return user;
};
