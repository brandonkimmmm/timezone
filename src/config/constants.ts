import dotenv from 'dotenv';

dotenv.config();

export const NODE_ENV = process.env.NODE_ENV || 'development';
export const PORT = process.env.PORT || 8080;
export const SALT_ROUNDS = process.env.SALT_ROUNDS
	? parseInt(process.env.SALT_ROUNDS)
	: 10;
export const PASSWORD_REGEX = new RegExp('^[a-zA-Z0-9]{8,20}$');
export const JWT_SECRET = process.env.JWT_SECRET || 'shhh';
export const VALID_ROLES = ['admin', 'user'];
