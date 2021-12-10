import logger from '../../utils/logger';
import * as User from '../models/user';
import * as Timezone from '../models/timezone';
import { formatTimezones } from '../../utils/timezones';
import { Request, Response } from 'express';

export const getUser = async (req: Request, res: Response) => {
	const { email } = req.user;

	logger.info(
		req.nanoid,
		'api/controllers/user.controllers/getUser',
		'email:',
		email
	);

	try {
		const user = await User.getUserByEmail(
			email,
			{ raw: true, attributes: { exclude: ['password'] }}
		);

		if (!user) {
			throw new Error('User not found');
		}

		return res.json(user);
	} catch (err) {
		logger.error(
			req.nanoid,
			'api/controllers/user.controllers/getUser',
			err instanceof Error ? err.message : ''
		);

		return res.status(400).json({ message: err instanceof Error ? err.message : '' });
	}
};

export const getUserTimezones = async (req: Request, res: Response) => {
	const { id } = req.user;

	logger.info(
		req.nanoid,
		'api/controllers/user.controllers/getUserTimezones',
		'id:',
		id
	);

	try {
		const timezones = await Timezone.getUserTimezones(id, { raw: true });
		const formattedTimezones = await formatTimezones(timezones);

		return res.json(formattedTimezones);
	} catch (err) {
		logger.error(
			req.nanoid,
			'api/controllers/user.controllers/getUserTimezones',
			err instanceof Error ? err.message : ''
		);

		return res.status(400).json({ message: err instanceof Error ? err.message : '' });
	}
};

export const postUserTimezone = async (req: Request, res: Response) => {
	const { id } = req.user;

	const {
		name,
		city,
		country
	} = req.body;

	logger.info(
		req.nanoid,
		'api/controllers/user.controllers/postUserTimezone',
		'id:',
		id,
		'name:',
		name,
		'city:',
		city,
		'country:',
		country
	);

	try {
		const timezone = await Timezone.createUserTimezone(id, name, city, country);

		return res.status(201).json(timezone.toJSON());
	} catch (err) {
		logger.error(
			req.nanoid,
			'api/controllers/user.controllers/postUserTimezone',
			err instanceof Error ? err.message : ''
		);

		return res.status(400).json({ message: err instanceof Error ? err.message : '' });
	}
};

export const putUserTimezone = async (req: Request, res: Response) => {
	const { id } = req.user;

	const {
		updated_name,
		updated_city,
		country,
		name
	} = req.body;

	logger.info(
		req.nanoid,
		'api/controllers/user.controllers/putUserTimezone',
		'id:',
		id,
		'name:',
		name,
		'updated_name:',
		updated_name,
		'updated_city:',
		updated_city,
		'country:',
		country
	);

	try {
		const timezone = await Timezone.updateUserTimezone(id, name, {
			updated_name,
			updated_city,
			country
		});

		return res.status(200).json(timezone.toJSON());
	} catch (err) {
		logger.error(
			req.nanoid,
			'api/controllers/user.controllers/putUserTimezone',
			err instanceof Error ? err.message : ''
		);

		return res.status(400).json({ message: err instanceof Error ? err.message : '' });
	}
};

export const deleteUserTimezone = async (req: Request, res: Response) => {
	const { id } = req.user;

	const {
		name
	} = req.body;

	logger.info(
		req.nanoid,
		'api/controllers/user.controllers/deleteUserTimezone',
		'id:',
		id,
		'name:',
		name
	);

	try {
		const timezone = await Timezone.deleteUserTimezone(id, name);

		return res.status(200).json(timezone.toJSON());
	} catch (err) {
		logger.error(
			req.nanoid,
			'api/controllers/user.controllers/deleteUserTimezone',
			err instanceof Error ? err.message : ''
		);

		return res.status(400).json({ message: err instanceof Error ? err.message : '' });
	}
};