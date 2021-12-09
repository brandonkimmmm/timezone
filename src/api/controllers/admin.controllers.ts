import logger from '../../utils/logger';
import * as Timezone from '../models/timezone';
import * as User from '../models/user';
import { formatTimezones } from '../../utils/timezones';
import { isString, omit } from 'lodash';
import { Request, Response } from 'express';

export const getTimezones = async (req: Request, res: Response) => {
	const user_id = isString(req.query.user_id) ? parseInt(req.query.user_id) : 0;

	logger.info(
		req.nanoid,
		'api/controllers/admin.controllers/getTimezones',
		'user_id:',
		user_id
	);

	try {
		const timezones = await Timezone.getUserTimezones(user_id);
		const formattedTimezones = await formatTimezones(timezones);

		return res.json(formattedTimezones);
	} catch (err) {
		logger.error(
			req.nanoid,
			'api/controllers/admin.controllers/getTimezones',
			err instanceof Error ? err.message : ''
		);

		return res.status(400).json({ message: err instanceof Error ? err.message : '' });
	}
};

export const postTimezone = async (req: Request, res: Response) => {
	const {
		user_id,
		name,
		city,
		country
	} = req.body;

	logger.info(
		req.nanoid,
		'api/controllers/admin.controllers/postTimezone',
		'user_id:',
		user_id,
		'name:',
		name,
		'city:',
		city,
		'country:',
		country
	);

	try {
		const timezone = await Timezone.createTimezone(user_id, name, city, country);

		return res.status(201).json(timezone.toJSON());
	} catch (err) {
		logger.error(
			req.nanoid,
			'api/controllers/admin.controllers/postTimezone',
			err instanceof Error ? err.message : ''
		);

		return res.status(400).json({ message: err instanceof Error ? err.message : '' });
	}
};

export const putTimezone = async (req: Request, res: Response) => {
	const {
		user_id,
		updated_name,
		updated_city,
		country,
		name
	} = req.body;

	logger.info(
		req.nanoid,
		'api/controllers/admin.controllers/putTimezone',
		'user_id:',
		user_id,
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
		const timezone = await Timezone.updateUserTimezone(user_id, name, {
			updated_name,
			updated_city,
			country
		});

		return res.status(200).json(timezone.toJSON());
	} catch (err) {
		logger.error(
			req.nanoid,
			'api/controllers/admin.controllers/putTimezone',
			err instanceof Error ? err.message : ''
		);

		return res.status(400).json({ message: err instanceof Error ? err.message : '' });
	}
};

export const deleteTimezone = async (req: Request, res: Response) => {
	const {
		user_id,
		name
	} = req.body;

	logger.info(
		req.nanoid,
		'api/controllers/admin.controllers/deleteTimezone',
		'user_id:',
		user_id,
		'name:',
		name
	);

	try {
		const timezone = await Timezone.deleteUserTimezone(user_id, name);

		return res.status(200).json(timezone.toJSON());
	} catch (err) {
		logger.error(
			req.nanoid,
			'api/controllers/admin.controllers/deleteTimezone',
			err instanceof Error ? err.message : ''
		);

		return res.status(400).json({ message: err instanceof Error ? err.message : '' });
	}
};

export const putUserRole = async (req: Request, res: Response) => {
	const {
		user_id,
		role
	} = req.body;

	logger.info(
		req.nanoid,
		'api/controllers/admin.controllers/putUserRole',
		'user_id:',
		user_id,
		'role:',
		role
	);

	try {
		const user = await User.updateRole(user_id, role);

		return res.status(200).json(omit(user.toJSON(), ['password']));
	} catch (err) {
		logger.error(
			req.nanoid,
			'api/controllers/admin.controllers/putUserRole',
			err instanceof Error ? err.message : ''
		);

		return res.status(400).json({ message: err instanceof Error ? err.message : '' });
	}
};

export const getUser = async (req: Request, res: Response) => {
	const user_id = isString(req.query.user_id) ? parseInt(req.query.user_id) : 0;

	logger.info(
		req.nanoid,
		'api/controllers/admin.controllers/getUser',
		'user_id:',
		user_id
	);

	try {
		const user = await User.getById(user_id);

		if (!user) {
			throw new Error('User not found');
		}

		return res.json(omit(user.toJSON(), ['password']));
	} catch (err) {
		logger.error(
			req.nanoid,
			'api/controllers/admin.controllers/getUser',
			err instanceof Error ? err.message : ''
		);

		return res.status(400).json({ message: err instanceof Error ? err.message : '' });
	}
};

export const deleteUser = async (req: Request, res: Response) => {
	const {
		user_id
	} = req.body;

	logger.info(
		req.nanoid,
		'api/controllers/admin.controllers/deleteUser',
		'user_id:',
		user_id
	);

	try {
		const user = await User.deleteUser(user_id);

		return res.status(200).json(omit(user.toJSON(), ['password']));
	} catch (err) {
		logger.error(
			req.nanoid,
			'api/controllers/admin.controllers/deleteUser',
			err instanceof Error ? err.message : ''
		);

		return res.status(400).json({ message: err instanceof Error ? err.message : '' });
	}
};

export const getUsers = async (req: Request, res: Response) => {
	const { role } = req.query;

	logger.info(
		req.nanoid,
		'api/controllers/admin.controllers/getUsers',
		'role:',
		role
	);

	const options = {
		raw: true,
		attributes: {
			exclude: ['password']
		},
		order: [['id', 'asc']],
		where: {}
	};

	if (role) {
		options.where = { role };
	}

	try {
		const users = await User.getAll(options);

		return res.json(users);
	} catch (err) {
		logger.error(
			req.nanoid,
			'api/controllers/admin.controllers/getUsers',
			err instanceof Error ? err.message : ''
		);

		return res.status(400).json({ message: err instanceof Error ? err.message : '' });
	}
};

export const createUser = async (req: Request, res: Response) => {
	const { email, password } = req.body;

	logger.info(
		req.nanoid,
		'api/controllers/admin.controllers/createUser',
		'email:',
		email
	);

	try {
		const user = await User.create(email, password);

		logger.verbose(
			req.nanoid,
			'api/controllers/admin.controllers/createUser',
			`User ${user.email} created`
		);

		return res.status(201).json(
			omit(user.toJSON(), ['password'])
		);
	} catch (err) {
		logger.error(
			req.nanoid,
			'api/controllers/admin.controllers/createUser',
			err instanceof Error ? err.message : ''
		);

		return res.status(400).json({ message: err instanceof Error ? err.message : '' });
	}
};