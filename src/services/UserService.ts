import User, { Role, FindUserOpts } from '../db/models/user';
import logger from '../utils/logger';
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
	logger.debug('api/models/user/createUser', 'email:', email, 'role:', role);

	const existingUser = await getUser({
		where: { email }
	});

	if (existingUser) {
		throw new Error(`User ${email} already exists`);
	}

	const user = await User.create({
		email,
		password,
		role
	});

	return user;
};

export const updateUserRole = async (id: number, role: Role) => {
	if (id === 1) {
		throw new Error('Cannot update master admin role');
	}

	logger.debug('api/models/user/updateUserRole', 'id:', id, 'role:', role);

	const user = await getUser({ where: { id } });

	if (!user) {
		throw new Error('User not found');
	}

	if (user.role === role) {
		throw new Error(`User already has role ${role}`);
	}

	await user.update(
		{
			role
		},
		{ fields: ['role'] }
	);

	return user;
};

export const deleteUser = async (id: number) => {
	if (id === 1) {
		throw new Error('Cannot delete master admin');
	}

	logger.debug('api/models/user/deleteUser', 'id:', id);

	const user = await getUser({ where: { id } });

	if (!user) {
		throw new Error('User not found');
	}

	await user.destroy();

	return user;
};

export const loginUser = async (email: string, password: string) => {
	const user = await getUser({ where: { email } });

	if (!user) {
		throw new Error('User not found');
	}

	const isValidPassword = await user.verifyPassword(password);

	if (!isValidPassword) {
		throw new Error('Invalid password given');
	}

	const token = await signToken(user.id, user.email, user.role);

	return token;
};
