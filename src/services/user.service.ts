import User, { Role, FindUserOpts } from '../db/models/user';
import logger from './logger.service';
import { signToken } from './auth.service';

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

	return User.create({
		email,
		password,
		role
	});
};

interface UpdateUserData {
	role?: Role;
}

export const updateUser = async (id: number, data: UpdateUserData) => {
	if (id === 1) {
		throw new Error('Cannot update master admin role');
	}

	logger.debug('api/models/user/updateUserRole', 'id:', id, 'data:', data);

	const user = await getUser({ where: { id } });

	if (!user) {
		throw new Error('User not found');
	}

	if (user.role === data.role) {
		throw new Error(`User already has role ${data.role}`);
	}

	await user.update(
		{
			role: data.role
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
	const user = await User.scope('validation').findOne({ where: { email } });

	if (!user) {
		throw new Error('User not found');
	}

	const isValidPassword = await user.verifyPassword(password);

	if (!isValidPassword) {
		throw new Error('Invalid password given');
	}

	return signToken(user.id, user.email, user.role);
};
