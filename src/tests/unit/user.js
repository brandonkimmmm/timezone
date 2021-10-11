const chai = require('chai');
const should = chai.should();
const faker = require('faker');
const { truncate } = require('../utils/db');
const { getByEmail, getById, create } = require('../../api/models/user');
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
});
