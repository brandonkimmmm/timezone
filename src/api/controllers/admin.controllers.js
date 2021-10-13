const logger = require('../../utils/logger');
const Timezone = require('../models/timezone');
const User = require('../models/user');
const { formatTimezones } = require('../../utils/timezones');
const { isString, omit } = require('lodash');

const getTimezones = async (req, res) => {
	let { user_id } = req.query;

	if (isString(user_id)) {
		user_id = parseInt(user_id);
	}

	logger.info(
		req.nanoid,
		'api/controllers/admin.controllers/getTimezones',
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
			'api/controllers/admin.controllers/getTimezones',
			err.message
		);

		return res.status(400).json({ message: err.message });
	}
};

const postTimezone = async (req, res) => {
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

		return res.status(201).json(timezone);
	} catch (err) {
		logger.error(
			req.nanoid,
			'api/controllers/admin.controllers/postTimezone',
			err.message
		);

		return res.status(400).json({ message: err.message });
	}
};

const putTimezone = async (req, res) => {
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

		return res.status(200).json(timezone);
	} catch (err) {
		logger.error(
			req.nanoid,
			'api/controllers/admin.controllers/putTimezone',
			err.message
		);

		return res.status(400).json({ message: err.message });
	}
};

const deleteTimezone = async (req, res) => {
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

		return res.status(200).json(timezone);
	} catch (err) {
		logger.error(
			req.nanoid,
			'api/controllers/admin.controllers/deleteTimezone',
			err.message
		);

		return res.status(400).json({ message: err.message });
	}
};

const putUserRole = async (req, res) => {
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
		const timezone = await User.updateRole(user_id, role);

		return res.status(200).json(omit(timezone.dataValues, ['password']));
	} catch (err) {
		logger.error(
			req.nanoid,
			'api/controllers/admin.controllers/putUserRole',
			err.message
		);

		return res.status(400).json({ message: err.message });
	}
};

const getUser = async (req, res) => {
	let { user_id } = req.query;

	if (isString(user_id)) {
		user_id = parseInt(user_id);
	}

	logger.info(
		req.nanoid,
		'api/controllers/admin.controllers/getUser',
		'user_id:',
		user_id
	);

	try {
		const user = await User.getById(
			user_id,
			{
				raw: true,
				attributes: {
					exclude: ['password']
				}
			}
		);

		if (!user) {
			throw new Error('User not found');
		}

		return res.json(user);
	} catch (err) {
		logger.error(
			req.nanoid,
			'api/controllers/admin.controllers/getUser',
			err.message
		);

		return res.status(400).json({ message: err.message });
	}
};

const deleteUser = async (req, res) => {
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

		return res.status(200).json(omit(user.dataValues, ['password']));
	} catch (err) {
		logger.error(
			req.nanoid,
			'api/controllers/admin.controllers/deleteUser',
			err.message
		);

		return res.status(400).json({ message: err.message });
	}
};

const getUsers = async (req, res) => {
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
		order: [['id', 'asc']]
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
			err.message
		);

		return res.status(400).json({ message: err.message });
	}
};

module.exports = {
	getTimezones,
	postTimezone,
	putTimezone,
	deleteTimezone,
	putUserRole,
	getUser,
	getUsers,
	deleteUser
};
