import 'graphql-import-node';
import * as commonTypeDefs from './common.gql';
import * as userTypeDefs from './user.gql';
import { makeExecutableSchema } from '@graphql-tools/schema';
import resolvers from '../resolvers';
import { GraphQLSchema } from 'graphql';

export const UserSchema: GraphQLSchema = makeExecutableSchema({
	typeDefs: [commonTypeDefs, userTypeDefs],
	resolvers
});