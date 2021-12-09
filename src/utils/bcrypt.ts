import bcrypt from 'bcrypt';
import { SALT_ROUNDS } from '../config/constants';

export const hash = async (string: string): Promise<string> => {
	return bcrypt.hash(string, SALT_ROUNDS);
};

export const compare = async (value: string, hash: string): Promise<boolean>=> {
	return bcrypt.compare(value, hash);
};