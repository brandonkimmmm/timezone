const { name, version } = require('../../../package.json');
const logger = require('../../utils/logger');
const User = require('../models/user');
const { omit } = require('lodash');
const { compare } = require('../../utils/bcrypt');
const { signToken } = require('../../utils/jwt');

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

const login = async (req, res) => {
	const { email, password } = req.body;

	logger.info(
		req.nanoid,
		'api/controllers/public.controllers/login',
		'email:',
		email
	);

	try {
		const user = await User.get(email, { raw: true });

		if (!user) {
			throw new Error('User not found');
		}

		const isValidPassword = await compare(password, user.password);

		if (!isValidPassword) {
			throw new Error('Invalid password given');
		}

		logger.verbose(
			req.nanoid,
			'api/controllers/public.controllers/login',
			'user logged in'
		);

		const token = await signToken(user.email, user.role);

		return res.json({
			token
		});
	} catch (err) {
		logger.error(
			req.nanoid,
			'api/controllers/public.controllers/login',
			err.message
		);

		return res.status(400).json({ message: err.message });
	}
};

module.exports = {
	getInfo,
	signup,
	login
};
