import Joi from 'joi';
import { PASSWORD_REGEX } from '../config/constants';

export const IdSchema: Joi.Schema = Joi
	.number()
	.integer()
	.min(0)
	.not(0);

export const UserSchema: Joi.ObjectPropertiesSchema = Joi
	.object({
		id: IdSchema,
		email: Joi.string()
			.email()
			.trim()
			.lowercase(),
		password: Joi.string()
			.pattern(PASSWORD_REGEX)
			.trim(),
		role: Joi.string()
			.trim()
			.valid('admin', 'user')
	});

export const TimezoneSchema: Joi.ObjectPropertiesSchema = Joi
	.object({
		id: IdSchema,
		name: Joi.string()
			.min(2)
			.trim()
			.lowercase(),
		city: Joi.string()
			.min(2)
			.trim()
			.lowercase(),
		country: Joi.string()
			.length(2)
			.trim()
			.uppercase()
	});
