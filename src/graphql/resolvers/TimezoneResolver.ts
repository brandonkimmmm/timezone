import { IResolvers } from '@graphql-tools/utils';
import { AuthenticateResponse, QueryLoginArgs, User, MutationSignupArgs, Timezone, MutationCreateTimezoneArgs, MutationUpdateTimezoneArgs, MutationDeleteTimezoneArgs } from '../types';
import { ApolloError } from 'apollo-server-express';
import {
	UserSchema,
	TimezoneSchema
} from '../../utils/schemas';
import Joi from 'joi';
import { getUserTimezones, createUserTimezone, updateUserTimezone } from '../services/TimezoneService';

const CreateUserTimezoneSchema = Joi.object({
	name: TimezoneSchema.extract('name').required(),
	country: TimezoneSchema.extract('country'),
	updated_name: TimezoneSchema.extract('name').required(),
	updated_city: TimezoneSchema.extract('city').required()
});

const DeleteUserTimezoneSchema = Joi.object({
	name: TimezoneSchema.extract('name').required()
});

export const TimezoneResolvers: IResolvers = {
	Query: {
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
		async createTimezone(_: void, args: MutationCreateTimezoneArgs, { user }): Promise<Timezone> {
			try {
				if (!user) {
					throw new Error('Not Authorized');
				}
				const { name, city, country } = await CreateUserTimezoneSchema.validateAsync(args);
				return createUserTimezone(user.id, name, city, country);
			} catch (err) {
				throw new ApolloError(err instanceof Error ? err.message : '');
			}
		},
		async updateTimezone(_: void, args: MutationUpdateTimezoneArgs, { user }): Promise<Timezone> {
			try {
				if (!user) {
					throw new Error('Not Authorized');
				}
				const { name, updated_name, updated_city, country } = await CreateUserTimezoneSchema.validateAsync(args);
				return updateUserTimezone(user.id, name, { updated_name, updated_city, country });
			} catch (err) {
				throw new ApolloError(err instanceof Error ? err.message : '');
			}
		},
		async deleteTimezone(_: void, args: MutationDeleteTimezoneArgs, { user }): Promise<Timezone> {
			try {
				if (!user) {
					throw new Error('Not Authorized');
				}
				const { name } = await DeleteUserTimezoneSchema.validateAsync(args);
				return updateUserTimezone(user.id, name);
			} catch (err) {
				throw new ApolloError(err instanceof Error ? err.message : '');
			}
		}
	}
};