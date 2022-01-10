import logger from '../../services/logger.service';
import { Request, Response } from 'express';
import { loginUser, createUser } from '../../services/user.service';
import { decodeToken } from '../../services/auth.service';

export const getHealth = async (req: Request, res: Response) => {
	return res.json({
		name: process.env.npm_package_name,
		version: process.env.npm_package_version
	});
};

export const postSignup = async (req: Request, res: Response) => {
	const { email, password } = req.body;

	logger.info(
		req.nanoid,
		'api/controllers/public.controllers/postSignup',
		'email:',
		email
	);

	try {
		const user = await createUser(email, password);

		logger.verbose(
			req.nanoid,
			'api/controllers/public.controllers/postSignup',
			`User ${user.email} created`
		);

		return res.status(201).json(user);
	} catch (err) {
		logger.error(
			req.nanoid,
			'api/controllers/public.controllers/postSignup',
			err instanceof Error ? err.message : ''
		);

		return res
			.status(400)
			.json({ message: err instanceof Error ? err.message : '' });
	}
};

export const postLogin = async (req: Request, res: Response) => {
	const { email, password } = req.body;

	logger.info(
		req.nanoid,
		'api/controllers/public.controllers/postLogin',
		'email:',
		email
	);

	try {
		const data = await loginUser(email, password);

		return res.json(data);
	} catch (err) {
		logger.error(
			req.nanoid,
			'api/controllers/public.controllers/postLogin',
			err instanceof Error ? err.message : ''
		);

		return res
			.status(400)
			.json({ message: err instanceof Error ? err.message : '' });
	}
};

export const getValidateToken = async (req: Request, res: Response) => {
	logger.info(req.nanoid, 'api/controllers/public.controllers/getValidate');

	try {
		const { token } = req.query;

		if (!token) {
			throw new Error('No token found');
		}

		await decodeToken(token as string);

		return res.json({ message: 'Valid' });
	} catch (err) {
		logger.error(
			req.nanoid,
			'api/controllers/public.controllers/getValidate',
			err instanceof Error ? err.message : ''
		);

		return res.status(400).json({ message: 'Invalid' });
	}
};
