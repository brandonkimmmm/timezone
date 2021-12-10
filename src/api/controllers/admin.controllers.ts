import logger from '../../utils/logger';
import * as Timezone from '../models/timezone';
import * as User from '../models/user';
import { formatTimezones } from '../../utils/timezones';
import { omit } from 'lodash';
import { Request, Response } from 'express';
import { FindUserOpts } from '../../db/models/user';

export const getAdminTimezones = async (req: Request, res: Response) => {
	const { user_id } = req.query as any;

	logger.info(
		req.nanoid,
		'api/controllers/admin.controllers/getAdminTimezones',
		'user_id:',
		user_id
	);

	try {
		const timezones = await Timezone.getUserTimezones(user_id, { raw: true });
		const formattedTimezones = await formatTimezones(timezones);

		return res.json(formattedTimezones);
	} catch (err) {
		logger.error(
			req.nanoid,
			'api/controllers/admin.controllers/getAdminTimezones',
			err instanceof Error ? err.message : ''
		);

		return res.status(400).json({ message: err instanceof Error ? err.message : '' });
	}
};

export const postAdminTimezone = async (req: Request, res: Response) => {
	const {
		user_id,
		name,
		city,
		country
	} = req.body;

	logger.info(
		req.nanoid,
		'api/controllers/admin.controllers/postAdminTimezone',
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
		const timezone = await Timezone.createUserTimezone(user_id, name, city, country);

		return res.status(201).json(timezone.toJSON());
	} catch (err) {
		logger.error(
			req.nanoid,
			'api/controllers/admin.controllers/postAdminTimezone',
			err instanceof Error ? err.message : ''
		);

		return res.status(400).json({ message: err instanceof Error ? err.message : '' });
	}
};

export const putAdminTimezone = async (req: Request, res: Response) => {
	const {
		user_id,
		updated_name,
		updated_city,
		country,
		name
	} = req.body;

	logger.info(
		req.nanoid,
		'api/controllers/admin.controllers/putAdminTimezone',
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
			'api/controllers/admin.controllers/putAdminTimezone',
			err instanceof Error ? err.message : ''
		);

		return res.status(400).json({ message: err instanceof Error ? err.message : '' });
	}
};

export const deleteAdminTimezone = async (req: Request, res: Response) => {
	const {
		user_id,
		name
	} = req.body;

	logger.info(
		req.nanoid,
		'api/controllers/admin.controllers/deleteAdminTimezone',
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
			'api/controllers/admin.controllers/deleteAdminTimezone',
			err instanceof Error ? err.message : ''
		);

		return res.status(400).json({ message: err instanceof Error ? err.message : '' });
	}
};

export const putAdminUserRole = async (req: Request, res: Response) => {
	const {
		user_id,
		role
	} = req.body;

	logger.info(
		req.nanoid,
		'api/controllers/admin.controllers/putAdminUserRole',
		'user_id:',
		user_id,
		'role:',
		role
	);

	try {
		const user = await User.updateUserRole(user_id, role);

		return res.status(200).json(omit(user.toJSON(), ['password']));
	} catch (err) {
		logger.error(
			req.nanoid,
			'api/controllers/admin.controllers/putAdminUserRole',
			err instanceof Error ? err.message : ''
		);

		return res.status(400).json({ message: err instanceof Error ? err.message : '' });
	}
};

export const getAdminUser = async (req: Request, res: Response) => {
	const { user_id } = req.query as any;

	logger.info(
		req.nanoid,
		'api/controllers/admin.controllers/getAdminUser',
		'user_id:',
		user_id
	);

	try {
		const user = await User.getUserById(
			user_id,
			{ raw: true, attributes: { exclude: ['password'] }}
		);

		if (!user) {
			throw new Error('User not found');
		}

		return res.json(user);
	} catch (err) {
		logger.error(
			req.nanoid,
			'api/controllers/admin.controllers/getAdminUser',
			err instanceof Error ? err.message : ''
		);

		return res.status(400).json({ message: err instanceof Error ? err.message : '' });
	}
};

export const deleteAdminUser = async (req: Request, res: Response) => {
	const {
		user_id
	} = req.body;

	logger.info(
		req.nanoid,
		'api/controllers/admin.controllers/deleteAdminUser',
		'user_id:',
		user_id
	);

	try {
		const user = await User.deleteUser(user_id);

		return res.status(200).json(omit(user.toJSON(), ['password']));
	} catch (err) {
		logger.error(
			req.nanoid,
			'api/controllers/admin.controllers/deleteAdminUser',
			err instanceof Error ? err.message : ''
		);

		return res.status(400).json({ message: err instanceof Error ? err.message : '' });
	}
};

export const getAdminUsers = async (req: Request, res: Response) => {
	const { role } = req.query;

	logger.info(
		req.nanoid,
		'api/controllers/admin.controllers/getAdminUsers',
		'role:',
		role
	);

	const options: FindUserOpts = {
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
		const users = await User.getUsers(options);

		return res.json(users);
	} catch (err) {
		logger.error(
			req.nanoid,
			'api/controllers/admin.controllers/getAdminUsers',
			err instanceof Error ? err.message : ''
		);

		return res.status(400).json({ message: err instanceof Error ? err.message : '' });
	}
};

export const postAdminUser = async (req: Request, res: Response) => {
	const { email, password } = req.body;

	logger.info(
		req.nanoid,
		'api/controllers/admin.controllers/postAdminUser',
		'email:',
		email
	);

	try {
		const user = await User.createUser(email, password);

		logger.verbose(
			req.nanoid,
			'api/controllers/admin.controllers/postAdminUser',
			`User ${user.email} created`
		);

		return res.status(201).json(
			omit(user.toJSON(), ['password'])
		);
	} catch (err) {
		logger.error(
			req.nanoid,
			'api/controllers/admin.controllers/postAdminUser',
			err instanceof Error ? err.message : ''
		);

		return res.status(400).json({ message: err instanceof Error ? err.message : '' });
	}
};