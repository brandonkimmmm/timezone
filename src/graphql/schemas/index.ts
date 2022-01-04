import 'graphql-import-node';
import * as userTypeDefs from './user.gql';
import * as emptyTypeDefs from './empty.gql';
import * as timezoneTypeDefs from './timezone.gql';
import { makeExecutableSchema } from '@graphql-tools/schema';
import resolvers from '../resolvers';
import { GraphQLSchema } from 'graphql';

const schema: GraphQLSchema = makeExecutableSchema({
	typeDefs: [emptyTypeDefs, userTypeDefs, timezoneTypeDefs],
	resolvers
});

export default schema;