import { ApolloError } from 'apollo-server-express';


const Resolvers = {
	Query: {
		getAllUsers: async (_: any, args: any) => {
			try {
				const mockUsers = [{ name: 'xyz' }, { name: 'abc' }];
				return mockUsers;
			} catch (err) {
				console.log(err);
			}
		}
	}
};

export default Resolvers;