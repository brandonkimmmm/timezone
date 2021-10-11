const chai = require('chai');
const should = chai.should();
const faker = require('faker');
const { expect } = require('chai');
const { signToken, decodeToken } = require('../../utils/jwt');

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

describe('Utils functions', () => {
	describe('JWT Sign', () => {
		it('it should return signed token', async () => {
			const token = await signToken(USERS.user.email, USERS.user.role);
			token.should.be.a('string');
			USERS.user.token = token;
		});
	});

	describe('JWT Sign', () => {
		it('it should return decoded token', async () => {
			const decodedToken = await decodeToken(USERS.user.token);
			decodedToken.should.be.an('object');
			decodedToken.should.have.property('email');
			decodedToken.should.have.property('role');
			decodedToken.email.should.equal(USERS.user.email);
			decodedToken.role.should.equal(USERS.user.role);
		});

		it('it should throw an error if token is invalid', async () => {
			try {
				await decodeToken('nope');
				expect(true, 'promise should fail').eq(false);
			} catch (err) {
				expect(err.message).to.eql('jwt malformed');
			}
		});
	});
});
