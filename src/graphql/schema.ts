import { gql } from 'apollo-server-express';
import { makeExecutableSchema } from '@graphql-tools/schema';
import Resolvers from './resolver';

const TypeDefs = gql`
	type User {
		name: String
	}
	type Query {
		getAllUsers: [User]
	}
`;

export const schema = makeExecutableSchema({
	typeDefs: TypeDefs,
	resolvers: Resolvers
});
