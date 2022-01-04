import { ApolloServer } from 'apollo-server-express';
import { UserSchema } from './schemas';
import { verifyToken } from '../api/middleware/authenticate';

export const userServer = new ApolloServer({
	schema: UserSchema,
	context: async ({ req }) => {
		const token = req.get('Authorization') || '';
		return { user: await verifyToken(token.replace('Bearer ', ''))};
	},
	introspection: true
});

// export const adminServer = new 