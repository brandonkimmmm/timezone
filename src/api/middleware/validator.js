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

module.exports = {
	signup
};
