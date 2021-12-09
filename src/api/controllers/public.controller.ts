import logger from '../../utils/logger';
import * as User from '../models/user';
import { omit } from 'lodash';
import { signToken } from '../../utils/jwt';
import { Request, Response } from 'express';

export const getInfo = async (req: Request, res: Response) => {
	return res.json({
		name: process.env.npm_package_name,
		version: process.env.npm_package_version
	});
};

export const signup = async (req: Request, res: Response) => {
	const { email, password } = req.body;

	logger.info(
		req.nanoid,
		'api/controllers/public.controllers/signup',
		'email:',
		email
	);

	try {
		const user = await User.create(email, password);

		logger.verbose(
			req.nanoid,
			'api/controllers/public.controllers/signup',
			`User ${user.email} created`
		);

		return res.status(201).json(
			omit(user.toJSON(), ['password'])
		);
	} catch (err) {
		logger.error(
			req.nanoid,
			'api/controllers/public.controllers/signup',
			err instanceof Error ? err.message : ''
		);

		return res.status(400).json({ message: err instanceof Error ? err.message : '' });
	}
};

export const login = async (req: Request, res: Response) => {
	const { email, password } = req.body;

	logger.info(
		req.nanoid,
		'api/controllers/public.controllers/login',
		'email:',
		email
	);

	try {
		const user = await User.getByEmail(email);

		if (!user) {
			throw new Error('User not found');
		}

		const isValidPassword = await user.verifyPassword(password);

		if (!isValidPassword) {
			throw new Error('Invalid password given');
		}

		logger.verbose(
			req.nanoid,
			'api/controllers/public.controllers/login',
			'user logged in'
		);

		const token = await signToken(user.id, user.email, user.role);

		return res.json({
			token
		});
	} catch (err) {
		logger.error(
			req.nanoid,
			'api/controllers/public.controllers/login',
			err instanceof Error ? err.message : ''
		);

		return res.status(400).json({ message: err instanceof Error ? err.message : '' });
	}
};