const chai = require('chai');
const should = chai.should();
const faker = require('faker');
const { expect } = require('chai');
const { signToken, decodeToken } = require('../../utils/jwt');
const { getCityTimezone } = require('../../utils/timezones');

const USERS = {
	user: {
		id: 1,
		email: faker.internet.exampleEmail().toLowerCase(),
		password: faker.internet.password(10, false, /^[a-zA-Z0-9]$/),
		role: 'user'
	},
	admin: {
		id: 2,
		email: faker.internet.exampleEmail().toLowerCase(),
		password: faker.internet.password(10, false, /^[a-zA-Z0-9]$/),
		role: 'admin'
	}
};

describe('Utils functions', () => {
	describe('JWT Sign', () => {
		it('it should return signed token', async () => {
			const token = await signToken(USERS.user.id, USERS.user.email, USERS.user.role);
			token.should.be.a('string');
			USERS.user.token = token;
		});
	});

	describe('JWT Decode', () => {
		it('it should return decoded token', async () => {
			const decodedToken = await decodeToken(USERS.user.token);
			decodedToken.should.be.an('object');
			decodedToken.should.have.property('email');
			decodedToken.should.have.property('role');
			decodedToken.should.have.property('id');
			decodedToken.email.should.equal(USERS.user.email);
			decodedToken.role.should.equal(USERS.user.role);
			decodedToken.id.should.equal(USERS.user.id);
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

	describe('getCityTimezone', () => {
		it('it should return timezone and offset', async () => {
			const data = await getCityTimezone('new york');
			data.should.be.an('object');
			data.should.have.property('timezone');
			data.should.have.property('offset');
			data.timezone.should.equal('America/New_York');
			data.offset.should.equal('-4:00');
		});

		it('it should return timezone and offset for correct country', async () => {
			const data = await getCityTimezone('los angeles', 'us');
			data.should.be.an('object');
			data.should.have.property('timezone');
			data.should.have.property('offset');
			data.timezone.should.equal('America/Los_Angeles');
			data.offset.should.equal('-7:00');
		});


		it('it should throw an error if city is invalid', async () => {
			try {
				await getCityTimezone('nope');
				expect(true, 'promise should fail').eq(false);
			} catch (err) {
				expect(err.message).to.eql('Invalid city');
			}
		});
	});
});
