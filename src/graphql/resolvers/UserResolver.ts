import { IResolvers } from '@graphql-tools/utils';
import { AuthenticateResponse, QueryLoginArgs, SignupResponse, User, MutationSignupArgs } from '../types';
import { login, signup } from '../../api/controllers/public.controller';

export const UserResolvers: IResolvers = {
	Query: {
		async login(_: void, args: QueryLoginArgs): Promise<AuthenticateResponse> {
			const token = await login(args.email, args.password);
			return { token };
		},
		async getUser(_: void, args: void, { user }): Promise<User> {
			return user;
		}
	},
	Mutation: {
		async signup(_: void, args: MutationSignupArgs): Promise<SignupResponse> {
			const user = await signup(args.email, args.password);
			return user;
		}
	}
};