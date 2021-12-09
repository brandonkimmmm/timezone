import Joi from 'joi';
import { Request, Response, NextFunction } from 'express';
import {
	UserSchema,
	TimezoneSchema
} from '../../utils/schemas';

export const postSignup = async (req: Request, res: Response, next: NextFunction) => {
	try {
		const schema = Joi.object({
			email: UserSchema.extract('email').required(),
			password: UserSchema.extract('password').required(),
			password_confirmation: Joi.required().valid(Joi.ref('password'))
		});

		req.body = await schema.validateAsync(req.body);
		next();
	} catch (err) {
		return res.status(400).json({ message: err instanceof Error ? err.message : '' });
	}
};

export const postLogin = async (req: Request, res: Response, next: NextFunction) => {
	try {
		const schema = Joi.object({
			email: UserSchema.extract('email').required(),
			password: UserSchema.extract('password')
		});

		req.body = await schema.validateAsync(req.body);
		next();
	} catch (err) {
		return res.status(400).json({ message: err instanceof Error ? err.message : '' });
	}
};

export const postUserTimezone = async (req: Request, res: Response, next: NextFunction) => {
	try {
		const schema = Joi.object({
			name: TimezoneSchema.extract('name').required(),
			city: TimezoneSchema.extract('city').required(),
			country: TimezoneSchema.extract('country')
		});

		req.body = await schema.validateAsync(req.body);
		next();
	} catch (err) {
		return res.status(400).json({ message: err instanceof Error ? err.message : '' });
	}
};

export const putUserTimezone = async (req: Request, res: Response, next: NextFunction) => {
	try {
		const schema = Joi.object({
			name: TimezoneSchema.extract('name').required(),
			country: TimezoneSchema.extract('country'),
			updated_name: TimezoneSchema.extract('name').required(),
			updated_city: TimezoneSchema.extract('city').required()
		});

		req.body = await schema.validateAsync(req.body);
		next();
	} catch (err) {
		return res.status(400).json({ message: err instanceof Error ? err.message : '' });
	}
};

export const deleteUserTimezone = async (req: Request, res: Response, next: NextFunction) => {
	try {
		const schema = Joi.object({
			name: TimezoneSchema.extract('name').required()
		});

		req.body = await schema.validateAsync(req.body);
		next();
	} catch (err) {
		return res.status(400).json({ message: err instanceof Error ? err.message : '' });
	}
};

export const getAdminTimezones = async (req: Request, res: Response, next: NextFunction) => {
	try {
		const schema = Joi.object({
			user_id: UserSchema.extract('id').required()
		});

		req.query = await schema.validateAsync(req.query);
		next();
	} catch (err) {
		return res.status(400).json({ message: err instanceof Error ? err.message : '' });
	}
};

export const postAdminTimezone = async (req: Request, res: Response, next: NextFunction) => {
	try {
		const schema = Joi.object({
			user_id: UserSchema.extract('id').required(),
			name: TimezoneSchema.extract('name').required(),
			city: TimezoneSchema.extract('city').required(),
			country: TimezoneSchema.extract('country')
		});

		req.body = await schema.validateAsync(req.body);
		next();
	} catch (err) {
		return res.status(400).json({ message: err instanceof Error ? err.message : '' });
	}
};

export const putAdminTimezone = async (req: Request, res: Response, next: NextFunction) => {
	try {
		const schema = Joi.object({
			user_id: UserSchema.extract('id').required(),
			name: TimezoneSchema.extract('name').required(),
			country: TimezoneSchema.extract('country'),
			updated_name: TimezoneSchema.extract('name').required(),
			updated_city: TimezoneSchema.extract('city').required()
		});

		req.body = await schema.validateAsync(req.body);
		next();
	} catch (err) {
		return res.status(400).json({ message: err instanceof Error ? err.message : '' });
	}
};

export const deleteAdminTimezone = async (req: Request, res: Response, next: NextFunction) => {
	try {
		const schema = Joi.object({
			user_id: UserSchema.extract('id').required(),
			name: TimezoneSchema.extract('name').required()
		});

		req.body = await schema.validateAsync(req.body);
		next();
	} catch (err) {
		return res.status(400).json({ message: err instanceof Error ? err.message : '' });
	}
};

export const putAdminUserRole = async (req: Request, res: Response, next: NextFunction) => {
	try {
		const schema = Joi.object({
			user_id: UserSchema.extract('id').required(),
			role: UserSchema.extract('role').required()
		});

		req.body = await schema.validateAsync(req.body);
		next();
	} catch (err) {
		return res.status(400).json({ message: err instanceof Error ? err.message : '' });
	}
};

export const getAdminUser = async (req: Request, res: Response, next: NextFunction) => {
	try {
		const schema = Joi.object({
			user_id: UserSchema.extract('id').required()
		});

		req.query = await schema.validateAsync(req.query);
		next();
	} catch (err) {
		return res.status(400).json({ message: err instanceof Error ? err.message : '' });
	}
};

export const getAdminUsers = async (req: Request, res: Response, next: NextFunction) => {
	try {
		const schema = Joi.object({
			role: UserSchema.extract('role')
		});

		req.query = await schema.validateAsync(req.query);
		next();
	} catch (err) {
		return res.status(400).json({ message: err instanceof Error ? err.message : '' });
	}
};

export const deleteAdminUser = async (req: Request, res: Response, next: NextFunction) => {
	try {
		const schema = Joi.object({
			user_id: UserSchema.extract('id').required()
		});

		req.body = await schema.validateAsync(req.body);
		next();
	} catch (err) {
		return res.status(400).json({ message: err instanceof Error ? err.message : '' });
	}
};