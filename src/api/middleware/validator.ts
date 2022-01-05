import Joi from 'joi';
import { Request, Response, NextFunction } from 'express';
import { UserSchema } from '../../services/schema.service';

const PostLoginSchema = Joi.object({
	email: UserSchema.extract('email').required(),
	password: UserSchema.extract('password').required()
});

export const postLogin = async (
	req: Request,
	res: Response,
	next: NextFunction
) => {
	try {
		req.body = await PostLoginSchema.validateAsync(req.body);
		next();
	} catch (err) {
		return res
			.status(400)
			.json({ message: err instanceof Error ? err.message : '' });
	}
};

const PostSignupSchema = PostLoginSchema.keys({
	password_confirmation: Joi.required().valid(Joi.ref('password'))
});

export const postSignup = async (
	req: Request,
	res: Response,
	next: NextFunction
) => {
	try {
		req.body = await PostSignupSchema.validateAsync(req.body);
		next();
	} catch (err) {
		return res
			.status(400)
			.json({ message: err instanceof Error ? err.message : '' });
	}
};
