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
	const { email, password, password_confirmation } = req.body;
	const formattedEmail = email.toLowerCase().trim();

	logger.info(
		req.nanoid,
		'api/controllers/public.controllers/signup',
		'email:',
		formattedEmail
	);

	if (password !== password_confirmation) {
		logger.error(
			req.nanoid,
			'api/controllers/public.controllers/signup',
			'Password confirmation does not match password'
		);
		return res.status(400).json({ message: 'Password confirmation does not match password' });
	}

	const existingUser = await User.get(formattedEmail);

	if (existingUser) {
		logger.error(
			req.nanoid,
			'api/controllers/public.controllers/signup',
			`User with email ${email} already exists`
		);
		return res.status(400).json({ message: `User with email ${email} already exists` });
	}

	const user = await User.create(formattedEmail, password);

	logger.verbose(
		req.nanoid,
		'api/controllers/public.controllers/signup',
		`User ${email} created`
	);

	return res.status(201).json(
		omit(user, ['password'])
	);
};

module.exports = {
	getInfo,
	signup
};
