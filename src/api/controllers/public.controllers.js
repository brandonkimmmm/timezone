const { name, version } = require('../../../package.json');
const logger = require('../../utils/logger');
const User = require('../models/user');
const { omit } = require('lodash');

const getInfo = async (req, res) => {
	return res.json({
		name,
		version
	});
};

const signup = async (req, res) => {
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
			`User ${user.dataValues.email} created`
		);

		return res.status(201).json(
			omit(user.dataValues, ['password'])
		);
	} catch (err) {
		logger.error(
			req.nanoid,
			'api/controllers/public.controllers/signup',
			err.message
		);

		return res.status(400).json({ message: err.message });
	}
};

module.exports = {
	getInfo,
	signup
};
