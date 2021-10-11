const Joi = require('joi');
const { PASSWORD_REGEX } = require('../../config/constants');

const signup = async (req, res, next) => {
	const schema = Joi.object({
		email: Joi.string()
			.email()
			.required(),
		password: Joi.string()
			.pattern(PASSWORD_REGEX)
			.required(),
		password_confirmation: Joi.ref('password')
	});

	try {
		await schema.validateAsync(req.body);
		next();
	} catch (err) {
		return res.status(400).json({ message: err.message });
	}
};

const login = async (req, res, next) => {
	const schema = Joi.object({
		email: Joi.string()
			.email()
			.required(),
		password: Joi.string()
			.pattern(PASSWORD_REGEX)
			.required()
	});

	try {
		await schema.validateAsync(req.body);
		next();
	} catch (err) {
		return res.status(400).json({ message: err.message });
	}
};

const postTimezone = async (req, res, next) => {
	const schema = Joi.object({
		name: Joi.string()
			.required()
			.min(2),
		city: Joi.string()
			.required()
			.min(2),
		country: Joi.string()
			.length(2)
	});

	try {
		await schema.validateAsync(req.body);
		next();
	} catch (err) {
		return res.status(400).json({ message: err.message });
	}
};

const putTimezone = async (req, res, next) => {
	const schema = Joi.object({
		name: Joi.string()
			.required()
			.min(2),
		updated_name: Joi.string()
			.required()
			.min(2),
		updated_city: Joi.string()
			.required()
			.min(2),
		country: Joi.string()
			.length(2)
	});

	try {
		await schema.validateAsync(req.body);
		next();
	} catch (err) {
		return res.status(400).json({ message: err.message });
	}
};

const deleteTimezone = async (req, res, next) => {
	const schema = Joi.object({
		name: Joi.string()
			.required()
			.min(2)
	});

	try {
		await schema.validateAsync(req.body);
		next();
	} catch (err) {
		return res.status(400).json({ message: err.message });
	}
};

const adminGetTimezones = async (req, res, next) => {
	const schema = Joi.object({
		user_id: Joi.number()
			.integer()
			.min(0)
			.not(0)
			.required(),
	});

	try {
		await schema.validateAsync(req.query);
		next();
	} catch (err) {
		return res.status(400).json({ message: err.message });
	}
};

const adminPostTimezone = async (req, res, next) => {
	const schema = Joi.object({
		user_id: Joi.number()
			.integer()
			.min(0)
			.not(0)
			.required(),
		name: Joi.string()
			.required()
			.min(2),
		city: Joi.string()
			.required()
			.min(2),
		country: Joi.string()
			.length(2)
	});

	try {
		await schema.validateAsync(req.body);
		next();
	} catch (err) {
		return res.status(400).json({ message: err.message });
	}
};

const adminPutTimezone = async (req, res, next) => {
	const schema = Joi.object({
		user_id: Joi.number()
			.integer()
			.min(0)
			.not(0)
			.required(),
		name: Joi.string()
			.required()
			.min(2),
		updated_name: Joi.string()
			.required()
			.min(2),
		updated_city: Joi.string()
			.required()
			.min(2),
		country: Joi.string()
			.length(2)
	});

	try {
		await schema.validateAsync(req.body);
		next();
	} catch (err) {
		return res.status(400).json({ message: err.message });
	}
};

const adminDeleteTimezone = async (req, res, next) => {
	const schema = Joi.object({
		user_id: Joi.number()
			.integer()
			.min(0)
			.not(0)
			.required(),
		name: Joi.string()
			.required()
			.min(2)
	});

	try {
		await schema.validateAsync(req.body);
		next();
	} catch (err) {
		return res.status(400).json({ message: err.message });
	}
};

module.exports = {
	signup,
	login,
	postTimezone,
	putTimezone,
	deleteTimezone,
	adminGetTimezones,
	adminPostTimezone,
	adminPutTimezone,
	adminDeleteTimezone
};
