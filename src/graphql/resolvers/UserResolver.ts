import { IResolvers } from '@graphql-tools/utils';
import {
	User,
	Timezone,
	MutationCreateTimezoneArgs,
	MutationUpdateTimezoneArgs,
	MutationDeleteTimezoneArgs
} from '../types/user';
import { ApolloError } from 'apollo-server-express';
import { TimezoneSchema } from '../../utils/schemas';
import Joi from 'joi';
import { getUserById } from '../../services/UserService';
import {
	getUserTimezones,
	createUserTimezone,
	updateUserTimezone,
	deleteUserTimezone
} from '../../services/TimezoneService';

const CreateUserTimezoneSchema = Joi.object({
	name: TimezoneSchema.extract('name').required(),
	city: TimezoneSchema.extract('city').required(),
	country: TimezoneSchema.extract('country')
});

const UpdateUserTimezoneSchema = Joi.object({
	id: TimezoneSchema.extract('id').required(),
	data: Joi.object({
		name: TimezoneSchema.extract('name'),
		city: TimezoneSchema.extract('city'),
		country: TimezoneSchema.extract('country')
	})
		.required()
		.min(1)
});

const DeleteUserTimezoneSchema = Joi.object({
	id: TimezoneSchema.extract('id').required()
});

export const UserResolvers: IResolvers = {
	Query: {
		async getUser(_: void, args: void, { user }): Promise<User> {
			try {
				if (!user) {
					throw new Error('Not Authorized');
				}

				const data = await getUserById(user.id);

				if (!data) {
					throw new Error('User not found');
				}

				return data;
			} catch (err) {
				throw new ApolloError(err instanceof Error ? err.message : '');
			}
		},
		async getTimezones(_: void, args: void, { user }): Promise<Timezone[]> {
			try {
				if (!user) {
					throw new Error('Not Authorized');
				}

				return getUserTimezones(user.id);
			} catch (err) {
				throw new ApolloError(err instanceof Error ? err.message : '');
			}
		}
	},
	Mutation: {
		async createTimezone(
			_: void,
			args: MutationCreateTimezoneArgs,
			{ user }
		): Promise<Timezone> {
			try {
				if (!user) {
					throw new Error('Not Authorized');
				}
				const { name, city, country } =
					await CreateUserTimezoneSchema.validateAsync(args);
				return createUserTimezone(user.id, name, city, country);
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
				if (!user) {
					throw new Error('Not Authorized');
				}
				const { id, data } =
					await UpdateUserTimezoneSchema.validateAsync(args);
				return updateUserTimezone(user.id, id, data);
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
				if (!user) {
					throw new Error('Not Authorized');
				}
				const { id } = await DeleteUserTimezoneSchema.validateAsync(
					args
				);
				return deleteUserTimezone(user.id, id);
			} catch (err) {
				throw new ApolloError(err instanceof Error ? err.message : '');
			}
		}
	}
};
