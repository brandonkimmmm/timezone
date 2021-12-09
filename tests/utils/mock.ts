import faker from 'faker';

export const getMockUser = (role = 'user') => {
	return {
		id: 0,
		email: faker.internet.exampleEmail().toLowerCase(),
		password: faker.internet.password(10, false, /^[a-zA-Z0-9]$/),
		role,
		token: ''
	};
};
