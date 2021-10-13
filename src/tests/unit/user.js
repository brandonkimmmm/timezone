const chai = require('chai');
const should = chai.should();
const faker = require('faker');
const { truncate } = require('../utils/db');
const { getByEmail, getById, create, updateRole, deleteUser, getAll } = require('../../api/models/user');
const { createTimezone } = require('../../api/models/timezone');
const { Timezone } = require('../../db/models');
const { expect } = require('chai');

const USERS = {
	user: {
		email: faker.internet.exampleEmail().toLowerCase(),
		password: faker.internet.password(10, false, /^[a-zA-Z0-9]$/),
		role: 'user'
	},
	admin: {
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
			currentUser.dataValues.should.be.an('object');
			currentUser.dataValues.should.have.property('email');
			currentUser.dataValues.should.have.property('id');
			currentUser.dataValues.should.have.property('password');
			currentUser.dataValues.should.have.property('created_at');
			currentUser.dataValues.should.have.property('updated_at');
			currentUser.dataValues.email.should.equal(USERS.user.email);
			currentUser.dataValues.password.should.not.equal(USERS.user.password);
			USERS.user.id = currentUser.dataValues.id;
		});

		it('it should throw an error if invalid email given', async () => {
			try {
				await create('nope', USERS.user.password);
				expect(true, 'promise should fail').eq(false);
			} catch (err) {
				expect(err.message).to.eql('Invalid email given');
			}
		});

		it('it should throw an error if user exists', async () => {
			try {
				await create(USERS.user.email, USERS.user.password);
				expect(true, 'promise should fail').eq(false);
			} catch (err) {
				expect(err.message).to.eql(`User ${USERS.user.email} already exists`);
			}
		});

		it('it should throw an error if invalid password', async () => {
			try {
				await create(faker.internet.exampleEmail(), 'nope');
				expect(true, 'promise should fail').eq(false);
			} catch (err) {
				expect(err.message).to.eql('Invalid password given');
			}
		});
	});

	describe('User get all', () => {
		it('it should get all user data', async () => {
			const users = await getAll();

			users.should.be.an('array');
			users.should.have.length(1);
			users[0].should.have.property('dataValues');
			users[0].dataValues.should.be.an('object');
			users[0].dataValues.should.have.property('email');
			users[0].dataValues.should.have.property('id');
			users[0].dataValues.should.have.property('password');
			users[0].dataValues.should.have.property('created_at');
			users[0].dataValues.should.have.property('updated_at');
			users[0].dataValues.email.should.equal(USERS.user.email);
			users[0].dataValues.password.should.not.equal(USERS.user.password);
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
			users[0].dataValues.should.be.an('object');
			users[0].dataValues.should.have.property('email');
			users[0].dataValues.should.have.property('id');
			users[0].dataValues.should.have.property('password');
			users[0].dataValues.should.have.property('created_at');
			users[0].dataValues.should.have.property('updated_at');
			users[0].dataValues.should.have.property('role');
			users[0].dataValues.email.should.equal(USERS.user.email);
			users[0].dataValues.role.should.equal('user');
			users[0].dataValues.password.should.not.equal(USERS.user.password);
		});
	});

	describe('User get By Email', () => {
		it('it should get user data if user exists', async () => {
			const currentUser = await getByEmail(USERS.user.email);

			currentUser.should.be.an('object');
			currentUser.should.have.property('dataValues');
			currentUser.dataValues.should.be.an('object');
			currentUser.dataValues.should.have.property('email');
			currentUser.dataValues.should.have.property('id');
			currentUser.dataValues.should.have.property('password');
			currentUser.dataValues.should.have.property('created_at');
			currentUser.dataValues.should.have.property('updated_at');
			currentUser.dataValues.email.should.equal(USERS.user.email);
			currentUser.dataValues.password.should.not.equal(USERS.user.password);
		});

		it('it should return null if user does not exist', async () => {
			const currentUser = await getByEmail(faker.internet.exampleEmail());
			should.not.exist(currentUser);
		});
	});

	describe('User get By ID', () => {
		it('it should get user data if user exists', async () => {
			const currentUser = await getById(USERS.user.id);

			currentUser.should.be.an('object');
			currentUser.should.have.property('dataValues');
			currentUser.dataValues.should.be.an('object');
			currentUser.dataValues.should.have.property('email');
			currentUser.dataValues.should.have.property('id');
			currentUser.dataValues.should.have.property('password');
			currentUser.dataValues.should.have.property('created_at');
			currentUser.dataValues.should.have.property('updated_at');
			currentUser.dataValues.email.should.equal(USERS.user.email);
			currentUser.dataValues.id.should.equal(USERS.user.id);
			currentUser.dataValues.password.should.not.equal(USERS.user.password);
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
			user.should.have.property('dataValues');
			user.dataValues.should.be.an('object');
			user.dataValues.should.have.property('email');
			user.dataValues.should.have.property('id');
			user.dataValues.should.have.property('password');
			user.dataValues.should.have.property('role');
			user.dataValues.should.have.property('created_at');
			user.dataValues.should.have.property('updated_at');
			user.dataValues.email.should.equal(USERS.user.email);
			user.dataValues.id.should.equal(USERS.user.id);
			user.dataValues.role.should.equal('admin');
		});

		it('it should update user role to user if user exists', async () => {
			const user = await updateRole(USERS.user.id, 'user');

			user.should.be.an('object');
			user.should.have.property('dataValues');
			user.dataValues.should.be.an('object');
			user.dataValues.should.have.property('email');
			user.dataValues.should.have.property('id');
			user.dataValues.should.have.property('password');
			user.dataValues.should.have.property('role');
			user.dataValues.should.have.property('created_at');
			user.dataValues.should.have.property('updated_at');
			user.dataValues.email.should.equal(USERS.user.email);
			user.dataValues.id.should.equal(USERS.user.id);
			user.dataValues.role.should.equal('user');
		});

		it('it should throw an error if invalid role is given', async () => {
			try {
				await updateRole(USERS.user.id, 'nope');
				expect(true, 'promise should fail').eq(false);
			} catch (err) {
				expect(err.message).to.eql('Invalid role given');
			}
		});

		it('it should throw an error if role is the same', async () => {
			try {
				await updateRole(USERS.user.id, 'user');
				expect(true, 'promise should fail').eq(false);
			} catch (err) {
				expect(err.message).to.eql('User already has role user');
			}
		});

		it('it should throw an error if user not found', async () => {
			try {
				await updateRole(999999, 'user');
				expect(true, 'promise should fail').eq(false);
			} catch (err) {
				expect(err.message).to.eql('User not found');
			}
		});

		it('it should throw an error if user id 1 is given', async () => {
			try {
				await updateRole(1, 'user');
				expect(true, 'promise should fail').eq(false);
			} catch (err) {
				expect(err.message).to.eql('Cannot update master admin role');
			}
		});
	});

	describe('User delete', () => {
		it('it should delete user and timezones for user', async () => {
			await createTimezone(USERS.user.id, TIMEZONES.name, TIMEZONES.city);

			const timezones = await Timezone.findAll({ where: { user_id: USERS.user.id }, raw: true });

			timezones.should.have.lengthOf(1);

			const user = await deleteUser(USERS.user.id);

			user.should.be.an('object');
			user.should.have.property('dataValues');
			user.dataValues.should.be.an('object');
			user.dataValues.should.have.property('email');
			user.dataValues.should.have.property('id');
			user.dataValues.should.have.property('password');
			user.dataValues.should.have.property('role');
			user.dataValues.should.have.property('created_at');
			user.dataValues.should.have.property('updated_at');
			user.dataValues.email.should.equal(USERS.user.email);
			user.dataValues.id.should.equal(USERS.user.id);
			user.dataValues.role.should.equal('user');

			const deletedUser = await getById(USERS.user.id);
			should.not.exist(deletedUser);

			const userTimezones = await Timezone.findAll({ where: { user_id: USERS.user.id }, raw: true });

			userTimezones.should.have.lengthOf(0);
		});

		it('it should throw an error if user does not exist', async () => {
			try {
				await deleteUser(USERS.user.id);
				expect(true, 'promise should fail').eq(false);
			} catch (err) {
				expect(err.message).to.eql('User not found');
			}
		});

		it('it should throw an error if user id is 1', async () => {
			try {
				await deleteUser(1);
				expect(true, 'promise should fail').eq(false);
			} catch (err) {
				expect(err.message).to.eql('Cannot delete master admin');
			}
		});
	});
});
