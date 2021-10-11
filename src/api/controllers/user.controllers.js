const logger = require('../../utils/logger');
const User = require('../models/user');
const Timezone = require('../models/timezone');
const { formatTimezones } = require('../../utils/timezones');

const get = async (req, res) => {
	const { email } = req.user;

	logger.info(
		req.nanoid,
		'api/controllers/user.controllers/get',
		'email:',
		email
	);

	try {
		const user = await User.getByEmail(
			email,
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
			'api/controllers/user.controllers/get',
			err.message
		);

		return res.status(400).json({ message: err.message });
	}
};

const getTimezones = async (req, res) => {
	const { id } = req.user;

	logger.info(
		req.nanoid,
		'api/controllers/user.controllers/getTimezones',
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
			'api/controllers/user.controllers/getTimezones',
			err.message
		);

		return res.status(400).json({ message: err.message });
	}
};

const postTimezone = async (req, res) => {
	const { id } = req.user;

	const {
		name,
		city,
		country
	} = req.body;

	logger.info(
		req.nanoid,
		'api/controllers/user.controllers/postTimezone',
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
		const timezone = await Timezone.createTimezone(id, name, city, country);

		return res.status(201).json(timezone);
	} catch (err) {
		logger.error(
			req.nanoid,
			'api/controllers/user.controllers/postTimezone',
			err.message
		);

		return res.status(400).json({ message: err.message });
	}
};

const putTimezone = async (req, res) => {
	const { id } = req.user;

	const {
		updated_name,
		updated_city,
		country
	} = req.body;

	const { name } = req.query;

	logger.info(
		req.nanoid,
		'api/controllers/user.controllers/putTimezone',
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

		return res.status(200).json(timezone);
	} catch (err) {
		logger.error(
			req.nanoid,
			'api/controllers/user.controllers/putTimezone',
			err.message
		);

		return res.status(400).json({ message: err.message });
	}
};

const deleteTimezone = async (req, res) => {
	const { id } = req.user;

	const {
		name
	} = req.body;

	logger.info(
		req.nanoid,
		'api/controllers/user.controllers/deleteTimezone',
		'id:',
		id,
		'name:',
		name
	);

	try {
		const timezone = await Timezone.deleteUserTimezone(id, name);

		return res.status(200).json(timezone);
	} catch (err) {
		logger.error(
			req.nanoid,
			'api/controllers/user.controllers/deleteTimezone',
			err.message
		);

		return res.status(400).json({ message: err.message });
	}
};

module.exports = {
	get,
	getTimezones,
	postTimezone,
	putTimezone,
	deleteTimezone
};
