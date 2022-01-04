// import { IResolvers } from '@graphql-tools/utils';
// import { AuthenticateResponse, QueryLoginArgs, User, MutationSignupArgs, QueryGetUserArgs } from '../types/admin';
// import { ApolloError } from 'apollo-server-express';
// import {
// 	UserSchema,
// 	TimezoneSchema
// } from '../../utils/schemas';
// import Joi from 'joi';
// import { getUserById, loginUser, signupUser } from '../services/UserService';

// export const AdminResolvers: IResolvers = {
// 	Query: {
// 		async getUsers(_: void, args: void, { user }): Promise<User[]> {
// 			try {
// 				if (!user || user.role !== 'admin') {
// 					throw new Error('Not Authorized');
// 				}
// 				const { email, password } = await LoginSchema.validateAsync(args);
// 				const token = await loginUser(email, password);
// 				return { token };
// 			} catch (err) {
// 				throw new ApolloError(err instanceof Error ? err.message : '');
// 			}
// 		},
// 		async getUser(_: void, args: QueryGetUserArgs, { user }): Promise<User>
// 	},
// 	Mutation: {}
// };
