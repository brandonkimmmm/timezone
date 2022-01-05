import faker from 'faker';
import { expect } from 'chai';
import { sortBy } from 'lodash';
import { Role, UserAttributes } from '../../src/db/models/user';

export const getMockUser = (role: Role = 'user'): UserAttributes => {
	return {
		id: 0,
		email: faker.internet.exampleEmail().toLowerCase(),
		password: faker.internet.password(10, false, /^[a-zA-Z0-9]$/),
		role,
		created_at: new Date(),
		updated_at: new Date()
	};
};

export const getMockTimezone = () => {
	return {
		id: 0,
		name: 'my city new york',
		city: 'new york',
		timezone: '',
		offset: '',
		user_id: 0,
		created_at: new Date(),
		updated_at: new Date()
	};
};
