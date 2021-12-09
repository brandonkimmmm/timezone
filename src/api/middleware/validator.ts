import Joi from 'joi';
import { PASSWORD_REGEX } from '../../config/constants';
import { Request, Response, NextFunction } from 'express';

export const signup = async (req: Request, res: Response, next: NextFunction) => {
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
		return res.status(400).json({ message: err instanceof Error ? err.message : '' });
	}
};

export const login = async (req: Request, res: Response, next: NextFunction) => {
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
		return res.status(400).json({ message: err instanceof Error ? err.message : '' });
	}
};

export const postTimezone = async (req: Request, res: Response, next: NextFunction) => {
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
		return res.status(400).json({ message: err instanceof Error ? err.message : '' });
	}
};

export const putTimezone = async (req: Request, res: Response, next: NextFunction) => {
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
		return res.status(400).json({ message: err instanceof Error ? err.message : '' });
	}
};

export const deleteTimezone = async (req: Request, res: Response, next: NextFunction) => {
	const schema = Joi.object({
		name: Joi.string()
			.required()
			.min(2)
	});

	try {
		await schema.validateAsync(req.body);
		next();
	} catch (err) {
		return res.status(400).json({ message: err instanceof Error ? err.message : '' });
	}
};

export const adminGetTimezones = async (req: Request, res: Response, next: NextFunction) => {
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
		return res.status(400).json({ message: err instanceof Error ? err.message : '' });
	}
};

export const adminPostTimezone = async (req: Request, res: Response, next: NextFunction) => {
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
		return res.status(400).json({ message: err instanceof Error ? err.message : '' });
	}
};

export const adminPutTimezone = async (req: Request, res: Response, next: NextFunction) => {
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
		return res.status(400).json({ message: err instanceof Error ? err.message : '' });
	}
};

export const adminDeleteTimezone = async (req: Request, res: Response, next: NextFunction) => {
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
		return res.status(400).json({ message: err instanceof Error ? err.message : '' });
	}
};

export const adminPutUserRole = async (req: Request, res: Response, next: NextFunction) => {
	const schema = Joi.object({
		user_id: Joi.number()
			.integer()
			.min(0)
			.not(0)
			.required(),
		role: Joi.string()
			.required()
			.valid('admin', 'user')
	});

	try {
		await schema.validateAsync(req.body);
		next();
	} catch (err) {
		return res.status(400).json({ message: err instanceof Error ? err.message : '' });
	}
};

export const adminGetUser = async (req: Request, res: Response, next: NextFunction) => {
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
		return res.status(400).json({ message: err instanceof Error ? err.message : '' });
	}
};

export const adminGetUsers = async (req: Request, res: Response, next: NextFunction) => {
	const schema = Joi.object({
		role: Joi.string()
			.valid('admin', 'user')
	});

	try {
		await schema.validateAsync(req.query);
		next();
	} catch (err) {
		return res.status(400).json({ message: err instanceof Error ? err.message : '' });
	}
};

export const adminDeleteUser = async (req: Request, res: Response, next: NextFunction) => {
	const schema = Joi.object({
		user_id: Joi.number()
			.integer()
			.min(0)
			.not(0)
			.required(),
	});

	try {
		await schema.validateAsync(req.body);
		next();
	} catch (err) {
		return res.status(400).json({ message: err instanceof Error ? err.message : '' });
	}
};