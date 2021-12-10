import Joi from 'joi';
import { Request, Response, NextFunction } from 'express';
import {
	UserSchema,
	TimezoneSchema
} from '../../utils/schemas';

const PostLoginSchema = Joi.object({
	email: UserSchema.extract('email').required(),
	password: UserSchema.extract('password').required()
});

export const postLogin = async (req: Request, res: Response, next: NextFunction) => {
	try {
		req.body = await PostLoginSchema.validateAsync(req.body);
		next();
	} catch (err) {
		return res.status(400).json({ message: err instanceof Error ? err.message : '' });
	}
};

const PostSignupSchema = PostLoginSchema.keys({
	password_confirmation: Joi.required().valid(Joi.ref('password'))
});

export const postSignup = async (req: Request, res: Response, next: NextFunction) => {
	try {
		req.body = await PostSignupSchema.validateAsync(req.body);
		next();
	} catch (err) {
		return res.status(400).json({ message: err instanceof Error ? err.message : '' });
	}
};

const PostUserTimezoneSchema = Joi.object({
	name: TimezoneSchema.extract('name').required(),
	city: TimezoneSchema.extract('city').required(),
	country: TimezoneSchema.extract('country')
});

export const postUserTimezone = async (req: Request, res: Response, next: NextFunction) => {
	try {
		req.body = await PostUserTimezoneSchema.validateAsync(req.body);
		next();
	} catch (err) {
		return res.status(400).json({ message: err instanceof Error ? err.message : '' });
	}
};

const PostAdminTimezoneSchema = PostUserTimezoneSchema.keys({
	user_id: UserSchema.extract('id').required()
});

export const postAdminTimezone = async (req: Request, res: Response, next: NextFunction) => {
	try {
		req.body = await PostAdminTimezoneSchema.validateAsync(req.body);
		next();
	} catch (err) {
		return res.status(400).json({ message: err instanceof Error ? err.message : '' });
	}
};

const PutUserTimezoneSchema = Joi.object({
	name: TimezoneSchema.extract('name').required(),
	country: TimezoneSchema.extract('country'),
	updated_name: TimezoneSchema.extract('name').required(),
	updated_city: TimezoneSchema.extract('city').required()
});

export const putUserTimezone = async (req: Request, res: Response, next: NextFunction) => {
	try {
		req.body = await PutUserTimezoneSchema.validateAsync(req.body);
		next();
	} catch (err) {
		return res.status(400).json({ message: err instanceof Error ? err.message : '' });
	}
};

const PutAdminTimezoneSchema = PutUserTimezoneSchema.keys({
	user_id: UserSchema.extract('id').required()
});

export const putAdminTimezone = async (req: Request, res: Response, next: NextFunction) => {
	try {
		req.body = await PutAdminTimezoneSchema.validateAsync(req.body);
		next();
	} catch (err) {
		return res.status(400).json({ message: err instanceof Error ? err.message : '' });
	}
};

const DeleteUserTimezoneSchema = Joi.object({
	name: TimezoneSchema.extract('name').required()
});

export const deleteUserTimezone = async (req: Request, res: Response, next: NextFunction) => {
	try {
		req.body = await DeleteUserTimezoneSchema.validateAsync(req.body);
		next();
	} catch (err) {
		return res.status(400).json({ message: err instanceof Error ? err.message : '' });
	}
};

const DeleteAdminTimezoneSchema = DeleteUserTimezoneSchema.keys({
	user_id: UserSchema.extract('id').required()
});

export const deleteAdminTimezone = async (req: Request, res: Response, next: NextFunction) => {
	try {
		req.body = await DeleteAdminTimezoneSchema.validateAsync(req.body);
		next();
	} catch (err) {
		return res.status(400).json({ message: err instanceof Error ? err.message : '' });
	}
};

const GetAdminTimezonesSchema = Joi.object({
	user_id: UserSchema.extract('id').required()
});

export const getAdminTimezones = async (req: Request, res: Response, next: NextFunction) => {
	try {
		req.query = await GetAdminTimezonesSchema.validateAsync(req.query);
		next();
	} catch (err) {
		return res.status(400).json({ message: err instanceof Error ? err.message : '' });
	}
};

const PutAdminUserRoleSchema = Joi.object({
	user_id: UserSchema.extract('id').required(),
	role: UserSchema.extract('role').required()
});

export const putAdminUserRole = async (req: Request, res: Response, next: NextFunction) => {
	try {
		req.body = await PutAdminUserRoleSchema.validateAsync(req.body);
		next();
	} catch (err) {
		return res.status(400).json({ message: err instanceof Error ? err.message : '' });
	}
};

const GetAdminUserSchema = Joi.object({
	user_id: UserSchema.extract('id').required()
});

export const getAdminUser = async (req: Request, res: Response, next: NextFunction) => {
	try {
		req.query = await GetAdminUserSchema.validateAsync(req.query);
		next();
	} catch (err) {
		return res.status(400).json({ message: err instanceof Error ? err.message : '' });
	}
};

const GetAdminUsersSchema = Joi.object({
	role: UserSchema.extract('role')
});

export const getAdminUsers = async (req: Request, res: Response, next: NextFunction) => {
	try {
		req.query = await GetAdminUsersSchema.validateAsync(req.query);
		next();
	} catch (err) {
		return res.status(400).json({ message: err instanceof Error ? err.message : '' });
	}
};

const DeleteAdminUserSchema = Joi.object({
	user_id: UserSchema.extract('id').required()
});

export const deleteAdminUser = async (req: Request, res: Response, next: NextFunction) => {
	try {
		req.body = await DeleteAdminUserSchema.validateAsync(req.body);
		next();
	} catch (err) {
		return res.status(400).json({ message: err instanceof Error ? err.message : '' });
	}
};