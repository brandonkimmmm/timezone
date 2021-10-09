const Joi = require('joi');

const signup = async (req, res, next) => {
	const schema = Joi.object({
		email: Joi.string()
			.email()
			.required(),
		password: Joi.string()
			.pattern(new RegExp('^[a-zA-Z0-9]{8,20}$'))
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
