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
		city
	} = req.body;

	logger.info(
		req.nanoid,
		'api/controllers/user.controllers/postTimezone',
		'id:',
		id,
		'name:',
		name,
		'city:',
		city
	);

	try {
		const timezone = await Timezone.createTimezone(id, name, city);

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

module.exports = {
	get,
	getTimezones,
	postTimezone
};
