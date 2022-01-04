import { IResolvers } from '@graphql-tools/utils';
import {
	MutationUpdateUserArgs,
	QueryGetTimezonesArgs,
	QueryGetUserArgs,
	User,
	MutationCreateTimezoneArgs,
	MutationDeleteTimezoneArgs,
	MutationUpdateTimezoneArgs,
	MutationCreateUserArgs,
	Timezone,
	MutationDeleteUserArgs
} from '../types/admin';
import { ApolloError } from 'apollo-server-express';
import { UserSchema, TimezoneSchema } from '../../utils/schemas';
import Joi from 'joi';
import {
	createUser,
	deleteUser,
	getUserById,
	getUsers,
	updateUserRole
} from '../../services/UserService';
import {
	createUserTimezone,
	deleteUserTimezone,
	getUserTimezones,
	updateUserTimezone
} from '../../services/TimezoneService';

const GetUserSchema = Joi.object({
	id: UserSchema.extract('id').required()
});

const CreateUserSchema = Joi.object({
	email: UserSchema.extract('email').required(),
	password: UserSchema.extract('password').required(),
	password_confirmation: Joi.required().valid(Joi.ref('password'))
});

const UpdateUserSchema = Joi.object({
	id: UserSchema.extract('id').required(),
	role: UserSchema.extract('role').required()
});

const CreateTimezoneSchema = Joi.object({
	user_id: TimezoneSchema.extract('user_id').required(),
	name: TimezoneSchema.extract('name').required(),
	city: TimezoneSchema.extract('city').required(),
	country: TimezoneSchema.extract('country')
});

const UpdateTimezoneSchema = Joi.object({
	user_id: TimezoneSchema.extract('user_id').required(),
	name: TimezoneSchema.extract('name').required(),
	country: TimezoneSchema.extract('country'),
	updated_name: TimezoneSchema.extract('name').required(),
	updated_city: TimezoneSchema.extract('city').required()
});

const DeleteTimezoneSchema = Joi.object({
	user_id: TimezoneSchema.extract('user_id').required(),
	name: TimezoneSchema.extract('name').required()
});

export const AdminResolvers: IResolvers = {
	Query: {
		async getUser(
			_: void,
			args: QueryGetUserArgs,
			{ user }
		): Promise<User> {
			try {
				if (!user || user.role !== 'admin') {
					throw new Error('Not Authorized');
				}
				const { id } = await GetUserSchema.validateAsync(args);
				const data = await getUserById(id);

				if (!data) {
					throw new Error('User not found');
				}

				return data;
			} catch (err) {
				throw new ApolloError(err instanceof Error ? err.message : '');
			}
		},
		async getUsers(_: void, args: void, { user }): Promise<User[]> {
			try {
				if (!user || user.role !== 'admin') {
					throw new Error('Not Authorized');
				}

				return getUsers();
			} catch (err) {
				throw new ApolloError(err instanceof Error ? err.message : '');
			}
		},
		async getTimezones(
			_: void,
			args: QueryGetTimezonesArgs,
			{ user }
		): Promise<Timezone[]> {
			try {
				if (!user || user.role !== 'admin') {
					throw new Error('Not Authorized');
				}
				const { id } = await GetUserSchema.validateAsync(args);
				return getUserTimezones(id);
			} catch (err) {
				throw new ApolloError(err instanceof Error ? err.message : '');
			}
		}
	},
	Mutation: {
		async updateUser(
			_: void,
			args: MutationUpdateUserArgs,
			{ user }
		): Promise<User> {
			try {
				if (!user || user.role !== 'admin') {
					throw new Error('Not Authorized');
				}
				const { id, role } = await UpdateUserSchema.validateAsync(args);
				return updateUserRole(id, role);
			} catch (err) {
				throw new ApolloError(err instanceof Error ? err.message : '');
			}
		},
		async createUser(
			_: void,
			args: MutationCreateUserArgs,
			{ user }
		): Promise<User> {
			try {
				if (!user || user.role !== 'admin') {
					throw new Error('Not Authorized');
				}
				const { email, password } =
					await CreateUserSchema.validateAsync(args);
				return createUser(email, password);
			} catch (err) {
				throw new ApolloError(err instanceof Error ? err.message : '');
			}
		},
		async deleteUser(
			_: void,
			args: MutationDeleteUserArgs,
			{ user }
		): Promise<User> {
			try {
				if (!user || user.role !== 'admin') {
					throw new Error('Not Authorized');
				}
				const { id } = await GetUserSchema.validateAsync(args);
				return deleteUser(id);
			} catch (err) {
				throw new ApolloError(err instanceof Error ? err.message : '');
			}
		},
		async createTimezone(
			_: void,
			args: MutationCreateTimezoneArgs,
			{ user }
		): Promise<Timezone> {
			try {
				if (!user || user.role !== 'admin') {
					throw new Error('Not Authorized');
				}
				const { user_id, name, city, country } =
					await CreateTimezoneSchema.validateAsync(args);
				return createUserTimezone(user_id, name, city, country);
			} catch (err) {
				throw new ApolloError(err instanceof Error ? err.message : '');
			}
		},
		async updateTimezone(
			_: void,
			args: MutationUpdateTimezoneArgs,
			{ user }
		): Promise<Timezone> {
			try {
				if (!user || user.role !== 'admin') {
					throw new Error('Not Authorized');
				}
				const { user_id, name, updated_name, updated_city, country } =
					await UpdateTimezoneSchema.validateAsync(args);
				return updateUserTimezone(user_id, name, {
					updated_name,
					updated_city,
					country
				});
			} catch (err) {
				throw new ApolloError(err instanceof Error ? err.message : '');
			}
		},
		async deleteTimezone(
			_: void,
			args: MutationDeleteTimezoneArgs,
			{ user }
		): Promise<Timezone> {
			try {
				if (!user || user.role !== 'admin') {
					throw new Error('Not Authorized');
				}
				const { user_id, name } =
					await DeleteTimezoneSchema.validateAsync(args);
				return deleteUserTimezone(user_id, name);
			} catch (err) {
				throw new ApolloError(err instanceof Error ? err.message : '');
			}
		}
	}
};
