import 'graphql-import-node';
import * as commonTypeDefs from './common.schema.gql';
import * as userTypeDefs from './user.schema.gql';
import * as adminTypeDefs from './admin.schema.gql';
import { makeExecutableSchema } from '@graphql-tools/schema';
import { userResolvers, adminResolvers } from '../resolvers';
import { GraphQLSchema } from 'graphql';

export const UserSchema: GraphQLSchema = makeExecutableSchema({
	typeDefs: [commonTypeDefs, userTypeDefs],
	resolvers: userResolvers
});

export const AdminSchema: GraphQLSchema = makeExecutableSchema({
	typeDefs: [commonTypeDefs, adminTypeDefs],
	resolvers: adminResolvers
});
