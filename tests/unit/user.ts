import chai, { expect } from 'chai';
import { truncate } from '../utils/db';
import { createUserTimezone } from '../../src/api/models/timezone';
import {
	createUser,
	getUserByEmail,
	getUserById,
	updateUserRole,
	deleteUser,
	getUsers
} from '../../src/api/models/user';
import Timezone from '../../src/db/models/timezone';
import { getMockUser } from '../utils/mock';

const should = chai.should();
const USER = getMockUser();
const TIMEZONE = {
	city: 'new york',
	name: 'my city new york'
};

describe('User Helper Functions', () => {

	before(async () => {
		await truncate();
	});

	after(async () => {
		await truncate();
	});

	describe('#createUser', () => {
		it('it should return created user', async () => {
			const currentUser = await createUser(USER.email, USER.password);

			currentUser.should.be.an('object');
			currentUser.should.have.property('dataValues');
			currentUser.should.be.an('object');
			currentUser.should.have.property('email');
			currentUser.should.have.property('id');
			currentUser.should.have.property('password');
			currentUser.should.have.property('created_at');
			currentUser.should.have.property('updated_at');
			currentUser.email.should.equal(USER.email);
			currentUser.password.should.not.equal(USER.password);
			USER.id = currentUser.id;
		});

		it('it should throw an error if invalid email given', async () => {
			try {
				await createUser('nope', USER.password);
				expect(true, 'promise should fail').eq(false);
			} catch (err) {
				expect(err instanceof Error ? err.message : '').to.eql('"email" must be a valid email');
			}
		});

		it('it should throw an error if user exists', async () => {
			try {
				await createUser(USER.email, USER.password);
				expect(true, 'promise should fail').eq(false);
			} catch (err) {
				expect(err instanceof Error ? err.message : '').to.eql(`User ${USER.email} already exists`);
			}
		});

		it('it should throw an error if invalid password', async () => {
			try {
				await createUser(getMockUser().email, 'nope');
				expect(true, 'promise should fail').eq(false);
			} catch (err) {
				expect(err instanceof Error ? err.message : '').to.eql('"password" with value "nope" fails to match the required pattern: /^[a-zA-Z0-9]{8,20}$/');
			}
		});
	});

	describe('#getUsers', () => {
		it('it should get all user data', async () => {
			const users = await getUsers();

			users.should.be.an('array');
			users.should.have.length(1);
			users[0].should.have.property('dataValues');
			users[0].should.be.an('object');
			users[0].should.have.property('email');
			users[0].should.have.property('id');
			users[0].should.have.property('password');
			users[0].should.have.property('created_at');
			users[0].should.have.property('updated_at');
			users[0].email.should.equal(USER.email);
			users[0].password.should.not.equal(USER.password);
		});

		it('it should get all user data with role admin', async () => {
			const users = await getUsers({ where: { role: 'admin' }, order: [['id', 'asc']]});

			users.should.be.an('array');
			users.should.have.length(0);
		});

		it('it should get all user data with role user', async () => {
			const users = await getUsers({ where: { role: 'user' }, order: [['id', 'asc']]});

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
			users[0].email.should.equal(USER.email);
			users[0].role.should.equal('user');
			users[0].password.should.not.equal(USER.password);
		});
	});

	describe('#getUserByEmail', () => {
		it('it should get user data if user exists', async () => {
			const currentUser = await getUserByEmail(USER.email);

			currentUser?.should.be.an('object');
			// currentUser.should.have.property('dataValues');
			currentUser?.should.be.an('object');
			currentUser?.should.have.property('email');
			currentUser?.should.have.property('id');
			currentUser?.should.have.property('password');
			currentUser?.should.have.property('created_at');
			currentUser?.should.have.property('updated_at');
			currentUser?.email.should.equal(USER.email);
			currentUser?.password.should.not.equal(USER.password);
		});

		it('it should return null if user does not exist', async () => {
			const currentUser = await getUserByEmail(getMockUser().email);
			should.not.exist(currentUser);
		});
	});

	describe('#getUserById', () => {
		it('it should get user data if user exists', async () => {
			const currentUser = await getUserById(USER.id);

			currentUser?.should.be.an('object');
			// currentUser.should.have.property('dataValues');
			currentUser?.should.be.an('object');
			currentUser?.should.have.property('email');
			currentUser?.should.have.property('id');
			currentUser?.should.have.property('password');
			currentUser?.should.have.property('created_at');
			currentUser?.should.have.property('updated_at');
			currentUser?.email.should.equal(USER.email);
			currentUser?.id.should.equal(USER.id);
			currentUser?.password.should.not.equal(USER.password);
		});

		it('it should return null if user does not exist', async () => {
			const currentUser = await getUserById(99999999999999);
			should.not.exist(currentUser);
		});
	});

	describe('#updateUserRole', () => {
		it('it should update user role to admin if user exists', async () => {
			const user = await updateUserRole(USER.id, 'admin');

			user.should.be.an('object');
			// user.should.have.property('dataValues');
			user.should.be.an('object');
			user.should.have.property('email');
			user.should.have.property('id');
			user.should.have.property('password');
			user.should.have.property('role');
			user.should.have.property('created_at');
			user.should.have.property('updated_at');
			user.email.should.equal(USER.email);
			user.id.should.equal(USER.id);
			user.role.should.equal('admin');
		});

		it('it should update user role to user if user exists', async () => {
			const user = await updateUserRole(USER.id, 'user');

			user.should.be.an('object');
			// user.should.have.property('dataValues');
			user.should.be.an('object');
			user.should.have.property('email');
			user.should.have.property('id');
			user.should.have.property('password');
			user.should.have.property('role');
			user.should.have.property('created_at');
			user.should.have.property('updated_at');
			user.email.should.equal(USER.email);
			user.id.should.equal(USER.id);
			user.role.should.equal('user');
		});

		it('it should throw an error if invalid role is given', async () => {
			try {
				// @ts-expect-error: Testing invalid role passed
				await updateUserRole(USER.id, 'nope');
				expect(true, 'promise should fail').eq(false);
			} catch (err) {
				expect(err instanceof Error ? err.message : '').to.eql('"role" must be one of [admin, user]');
			}
		});

		it('it should throw an error if role is the same', async () => {
			try {
				await updateUserRole(USER.id, 'user');
				expect(true, 'promise should fail').eq(false);
			} catch (err) {
				expect(err instanceof Error ? err.message : '').to.eql('User already has role user');
			}
		});

		it('it should throw an error if user not found', async () => {
			try {
				await updateUserRole(999999, 'user');
				expect(true, 'promise should fail').eq(false);
			} catch (err) {
				expect(err instanceof Error ? err.message : '').to.eql('User not found');
			}
		});

		it('it should throw an error if user id 1 is given', async () => {
			try {
				await updateUserRole(1, 'user');
				expect(true, 'promise should fail').eq(false);
			} catch (err) {
				expect(err instanceof Error ? err.message : '').to.eql('Cannot update master admin role');
			}
		});
	});

	describe('#deleteUser', () => {
		it('it should delete user and timezones for user', async () => {
			await createUserTimezone(USER.id, TIMEZONE.name, TIMEZONE.city);

			const user = await getUserById(USER.id);
			const timezones = await user?.getTimezones();

			timezones?.should.have.lengthOf(1);

			user?.should.be.an('object');
			user?.should.have.property('dataValues');
			user?.should.be.an('object');
			user?.should.have.property('email');
			user?.should.have.property('id');
			user?.should.have.property('password');
			user?.should.have.property('role');
			user?.should.have.property('created_at');
			user?.should.have.property('updated_at');
			user?.email.should.equal(USER.email);
			user?.id.should.equal(USER.id);
			user?.role.should.equal('user');

			await user?.destroy();

			const deletedUser = await getUserById(USER.id);
			should.not.exist(deletedUser);

			const userTimezones = await Timezone.findOne({ where: { name: TIMEZONE.name }, raw: true });

			userTimezones?.should.have.lengthOf(0);
		});

		it('it should throw an error if user does not exist', async () => {
			try {
				await deleteUser(USER.id);
				expect(true, 'promise should fail').eq(false);
			} catch (err) {
				expect(err instanceof Error ? err.message : '').to.eql('User not found');
			}
		});

		it('it should throw an error if user id is 1', async () => {
			try {
				await deleteUser(1);
				expect(true, 'promise should fail').eq(false);
			} catch (err) {
				expect(err instanceof Error ? err.message : '').to.eql('Cannot delete master admin');
			}
		});
	});
});
