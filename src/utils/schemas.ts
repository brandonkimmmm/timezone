import Joi from 'joi';
import { PASSWORD_REGEX } from '../config/constants';

const IdSchema = Joi.number()
	.integer()
	.min(0)
	.not(0)
	.label('id');

const EmailSchema = Joi.string()
	.email()
	.trim()
	.lowercase()
	.label('email');

const PasswordSchema = Joi.string()
	.pattern(PASSWORD_REGEX)
	.label('password');

const RoleSchema = Joi.string()
	.trim()
	.lowercase()
	.valid('admin', 'user')
	.label('role');

const TimezoneNameSchema = Joi.string()
	.min(2)
	.trim()
	.lowercase()
	.label('name');

const CitySchema = Joi.string()
	.min(2)
	.trim()
	.lowercase()
	.label('city');

const CountrySchema = Joi.string()
	.length(2)
	.trim()
	.uppercase()
	.label('country');

export const UserSchema = Joi
	.object({
		id: IdSchema,
		email: EmailSchema,
		password: PasswordSchema,
		role: RoleSchema
	});

export const TimezoneSchema = Joi
	.object({
		id: IdSchema,
		name: TimezoneNameSchema,
		city: CitySchema,
		country: CountrySchema,
		user_id: IdSchema.label('user_id')
	});
