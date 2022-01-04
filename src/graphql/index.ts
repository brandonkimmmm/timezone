import { ApolloServer } from 'apollo-server-express';
import schema from './schemas';
import { verifyToken } from '../api/middleware/authenticate';

export const clientServer = new ApolloServer({
	schema,
	context: async ({ req }) => {
		const token = req.get('Authorization') || '';
		return { user: await verifyToken(token.replace('Bearer ', ''))};
	},
	introspection: true
});

// export const adminServer = new 