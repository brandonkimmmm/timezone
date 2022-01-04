import jwt, { JwtPayload } from 'jsonwebtoken';
import { JWT_SECRET } from '../config/constants';
import P from 'bluebird';

export const signToken = async (
	id: number,
	email: string,
	role: string
): Promise<string> => {
	return new P((resolve, reject) => {
		jwt.sign(
			{
				id,
				email,
				role
			},
			JWT_SECRET,
			{
				expiresIn: '1d'
			},
			(err, token) => {
				if (err) reject(err);
				resolve(token);
			}
		);
	});
};

export const decodeToken = async (
	token: string
): Promise<JwtPayload | undefined> => {
	return new Promise((resolve, reject) => {
		jwt.verify(token, JWT_SECRET, (err, decoded) => {
			if (err) reject(err);
			resolve(decoded);
		});
	});
};
