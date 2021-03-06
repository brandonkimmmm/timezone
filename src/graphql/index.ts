import { ApolloServer } from 'apollo-server-express';
import { AdminSchema, UserSchema } from './schemas';
import { verifyToken } from '../services/auth.service';

export const userServer = new ApolloServer({
	schema: UserSchema,
	context: async ({ req }) => {
		const token = req.get('Authorization') || '';
		return { user: await verifyToken(token.replace('Bearer ', '')) };
	},
	introspection: true
});

export const adminServer = new ApolloServer({
	schema: AdminSchema,
	context: async ({ req }) => {
		const token = req.get('Authorization') || '';
		return { user: await verifyToken(token.replace('Bearer ', '')) };
	},
	introspection: true
});
