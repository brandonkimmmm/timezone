import { IResolvers } from '@graphql-tools/utils';
import { AuthenticateResponse, QueryLoginArgs, User, MutationSignupArgs } from '../types';
import { login, signup } from '../controllers/UserController';
import { ApolloError } from 'apollo-server-express';
import {
	UserSchema,
	TimezoneSchema
} from '../../utils/schemas';
import Joi from 'joi';

const LoginSchema = Joi.object({
	email: UserSchema.extract('email').required(),
	password: UserSchema.extract('password').required()
});

const SignupSchema = LoginSchema.keys({
	password_confirmation: Joi.required().valid(Joi.ref('password'))
});

export const UserResolvers: IResolvers = {
	Query: {
		async login(_: void, args: QueryLoginArgs): Promise<AuthenticateResponse> {
			try {
				const { email, password } = await LoginSchema.validateAsync(args);
				const token = await login(email, password);
				return { token };
			} catch (err) {
				throw new ApolloError(err instanceof Error ? err.message : '');
			}
		},
		async getUser(_: void, args: void, { user }): Promise<User> {
			return user;
		}
	},
	Mutation: {
		async signup(_: void, args: MutationSignupArgs): Promise<User> {
			try {
				const { email, password } = await SignupSchema.validateAsync(args);
				return signup(email, password);
			} catch (err) {
				throw new ApolloError(err instanceof Error ? err.message : '');
			}
		}
	}
};