import {
	getUserByEmail,
	createUser
} from '../services/UserService';
import { signToken } from '../../utils/jwt';

export const login = async (email: string, password: string) => {
	const user = await getUserByEmail(email);

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

export const signup = async (email: string, password: string) => {
	const user = await createUser(email, password);

	return user.toJSON();
};
