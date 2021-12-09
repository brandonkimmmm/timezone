import chai, { expect } from 'chai';
import faker from 'faker';
import { truncate } from '../utils/db';
import { createTimezone } from '../../src/api/models/timezone';
import {
	create,
	getByEmail,
	getById,
	updateRole,
	deleteUser,
	getAll
} from '../../src/api/models/user';
import Timezone from '../../src/db/models/timezone';

const should = chai.should();

const USERS = {
	user: {
		id: 0,
		email: faker.internet.exampleEmail().toLowerCase(),
		password: faker.internet.password(10, false, /^[a-zA-Z0-9]$/),
		role: 'user'
	},
	admin: {
		id: 0,
		email: faker.internet.exampleEmail().toLowerCase(),
		password: faker.internet.password(10, false, /^[a-zA-Z0-9]$/),
		role: 'admin'
	}
};

const TIMEZONES = {
	city: 'New York',
	name: 'My city new york'
};

describe('User model', () => {

	before(async () => {
		await truncate();
	});

	after(async () => {
		await truncate();
	});

	describe('User create', () => {
		it('it should return created user', async () => {
			const currentUser = await create(USERS.user.email, USERS.user.password);

			currentUser.should.be.an('object');
			currentUser.should.have.property('dataValues');
			currentUser.should.be.an('object');
			currentUser.should.have.property('email');
			currentUser.should.have.property('id');
			currentUser.should.have.property('password');
			currentUser.should.have.property('created_at');
			currentUser.should.have.property('updated_at');
			currentUser.email.should.equal(USERS.user.email);
			currentUser.password.should.not.equal(USERS.user.password);
			USERS.user.id = currentUser.id;
		});

		it('it should throw an error if invalid email given', async () => {
			try {
				await create('nope', USERS.user.password);
				expect(true, 'promise should fail').eq(false);
			} catch (err) {
				expect(err instanceof Error ? err.message : '').to.eql('Invalid email given');
			}
		});

		it('it should throw an error if user exists', async () => {
			try {
				await create(USERS.user.email, USERS.user.password);
				expect(true, 'promise should fail').eq(false);
			} catch (err) {
				expect(err instanceof Error ? err.message : '').to.eql(`User ${USERS.user.email} already exists`);
			}
		});

		it('it should throw an error if invalid password', async () => {
			try {
				await create(faker.internet.exampleEmail(), 'nope');
				expect(true, 'promise should fail').eq(false);
			} catch (err) {
				expect(err instanceof Error ? err.message : '').to.eql('Invalid password given');
			}
		});
	});

	describe('User get all', () => {
		it('it should get all user data', async () => {
			const users = await getAll();

			users.should.be.an('array');
			users.should.have.length(1);
			users[0].should.have.property('dataValues');
			users[0].should.be.an('object');
			users[0].should.have.property('email');
			users[0].should.have.property('id');
			users[0].should.have.property('password');
			users[0].should.have.property('created_at');
			users[0].should.have.property('updated_at');
			users[0].email.should.equal(USERS.user.email);
			users[0].password.should.not.equal(USERS.user.password);
		});

		it('it should get all user data with role admin', async () => {
			const users = await getAll({ where: { role: 'admin' }, order: [['id', 'asc']]});

			users.should.be.an('array');
			users.should.have.length(0);
		});

		it('it should get all user data with role user', async () => {
			const users = await getAll({ where: { role: 'user' }, order: [['id', 'asc']]});

			users.should.be.an('array');
			users.should.have.length(1);
			users[0].should.have.property('dataValues');
			users[0].should.be.an('object');
			users[0].should.have.property('email');
			users[0].should.have.property('id');
			users[0].should.have.property('password');
			users[0].should.have.property('created_at');
			users[0].should.have.property('updated_at');
			users[0].should.have.property('role');
			users[0].email.should.equal(USERS.user.email);
			users[0].role.should.equal('user');
			users[0].password.should.not.equal(USERS.user.password);
		});
	});

	describe('User get By Email', () => {
		it('it should get user data if user exists', async () => {
			const currentUser = await getByEmail(USERS.user.email);

			currentUser?.should.be.an('object');
			// currentUser.should.have.property('dataValues');
			currentUser?.should.be.an('object');
			currentUser?.should.have.property('email');
			currentUser?.should.have.property('id');
			currentUser?.should.have.property('password');
			currentUser?.should.have.property('created_at');
			currentUser?.should.have.property('updated_at');
			currentUser?.email.should.equal(USERS.user.email);
			currentUser?.password.should.not.equal(USERS.user.password);
		});

		it('it should return null if user does not exist', async () => {
			const currentUser = await getByEmail(faker.internet.exampleEmail());
			should.not.exist(currentUser);
		});
	});

	describe('User get By ID', () => {
		it('it should get user data if user exists', async () => {
			const currentUser = await getById(USERS.user.id);

			currentUser?.should.be.an('object');
			// currentUser.should.have.property('dataValues');
			currentUser?.should.be.an('object');
			currentUser?.should.have.property('email');
			currentUser?.should.have.property('id');
			currentUser?.should.have.property('password');
			currentUser?.should.have.property('created_at');
			currentUser?.should.have.property('updated_at');
			currentUser?.email.should.equal(USERS.user.email);
			currentUser?.id.should.equal(USERS.user.id);
			currentUser?.password.should.not.equal(USERS.user.password);
		});

		it('it should return null if user does not exist', async () => {
			const currentUser = await getById(99999999999999);
			should.not.exist(currentUser);
		});
	});

	describe('User update role', () => {
		it('it should update user role to admin if user exists', async () => {
			const user = await updateRole(USERS.user.id, 'admin');

			user.should.be.an('object');
			// user.should.have.property('dataValues');
			user.should.be.an('object');
			user.should.have.property('email');
			user.should.have.property('id');
			user.should.have.property('password');
			user.should.have.property('role');
			user.should.have.property('created_at');
			user.should.have.property('updated_at');
			user.email.should.equal(USERS.user.email);
			user.id.should.equal(USERS.user.id);
			user.role.should.equal('admin');
		});

		it('it should update user role to user if user exists', async () => {
			const user = await updateRole(USERS.user.id, 'user');

			user.should.be.an('object');
			// user.should.have.property('dataValues');
			user.should.be.an('object');
			user.should.have.property('email');
			user.should.have.property('id');
			user.should.have.property('password');
			user.should.have.property('role');
			user.should.have.property('created_at');
			user.should.have.property('updated_at');
			user.email.should.equal(USERS.user.email);
			user.id.should.equal(USERS.user.id);
			user.role.should.equal('user');
		});

		it('it should throw an error if invalid role is given', async () => {
			try {
				await updateRole(USERS.user.id, 'nope');
				expect(true, 'promise should fail').eq(false);
			} catch (err) {
				expect(err instanceof Error ? err.message : '').to.eql('Invalid role given');
			}
		});

		it('it should throw an error if role is the same', async () => {
			try {
				await updateRole(USERS.user.id, 'user');
				expect(true, 'promise should fail').eq(false);
			} catch (err) {
				expect(err instanceof Error ? err.message : '').to.eql('User already has role user');
			}
		});

		it('it should throw an error if user not found', async () => {
			try {
				await updateRole(999999, 'user');
				expect(true, 'promise should fail').eq(false);
			} catch (err) {
				expect(err instanceof Error ? err.message : '').to.eql('User not found');
			}
		});

		it('it should throw an error if user id 1 is given', async () => {
			try {
				await updateRole(1, 'user');
				expect(true, 'promise should fail').eq(false);
			} catch (err) {
				expect(err instanceof Error ? err.message : '').to.eql('Cannot update master admin role');
			}
		});
	});

	// describe('User delete', () => {
	// 	it('it should delete user and timezones for user', async () => {
	// 		await createTimezone(USERS.user.id, TIMEZONES.name, TIMEZONES.city);

	// 		const timezones = await Timezone.findAll({ where: { user_id: USERS.user.id }, raw: true });

	// 		timezones.should.have.lengthOf(1);

	// 		const user = await deleteUser(USERS.user.id);

	// 		user.should.be.an('object');
	// 		user.should.have.property('dataValues');
	// 		user.should.be.an('object');
	// 		user.should.have.property('email');
	// 		user.should.have.property('id');
	// 		user.should.have.property('password');
	// 		user.should.have.property('role');
	// 		user.should.have.property('created_at');
	// 		user.should.have.property('updated_at');
	// 		user.email.should.equal(USERS.user.email);
	// 		user.id.should.equal(USERS.user.id);
	// 		user.role.should.equal('user');

	// 		const deletedUser = await getById(USERS.user.id);
	// 		should.not.exist(deletedUser);

	// 		const userTimezones = await Timezone.findAll({ where: { user_id: USERS.user.id }, raw: true });

	// 		userTimezones.should.have.lengthOf(0);
	// 	});

	// 	it('it should throw an error if user does not exist', async () => {
	// 		try {
	// 			await deleteUser(USERS.user.id);
	// 			expect(true, 'promise should fail').eq(false);
	// 		} catch (err) {
	// 			expect(err instanceof Error ? err.message : '').to.eql('User not found');
	// 		}
	// 	});

	// 	it('it should throw an error if user id is 1', async () => {
	// 		try {
	// 			await deleteUser(1);
	// 			expect(true, 'promise should fail').eq(false);
	// 		} catch (err) {
	// 			expect(err instanceof Error ? err.message : '').to.eql('Cannot delete master admin');
	// 		}
	// 	});
	// });
});
