import logger from '../../utils/logger';
import { Request, Response } from 'express';
import { loginUser, createUser } from '../../services/UserService';

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
		const token = await loginUser(email, password);

		return res.json({
			token
		});
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
