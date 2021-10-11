const chai = require('chai');
const chaiHttp = require('chai-http');
const app = require('../../app');
const should = chai.should();
const faker = require('faker');
const { truncate } = require('../utils/db');
const { create } = require('../../api/models/user');
const { signToken } = require('../../utils/jwt');

chai.use(chaiHttp);

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

describe('Public endpoints', () => {

	before(async () => {
		await truncate();
		const user = await create(USERS.user.email, USERS.user.password);
		USERS.user.id = user.id;
		const token = await signToken(USERS.user.id, USERS.user.email, USERS.user.role);
		USERS.user.token = token;
	});

	after(async () => {
		await truncate();
	});

	describe('/GET user', () => {
		it('it should return user info', (done) => {
			chai.request(app)
				.get('/user')
				.set('authorization', `Bearer ${USERS.user.token}`)
				.end((err, res) => {
					should.not.exist(err);
					res.should.have.status(200);
					res.body.should.be.an('object');
					res.body.should.have.property('email');
					res.body.should.have.property('id');
					res.body.should.have.property('role');
					res.body.should.not.have.property('password');
					res.body.email.should.equal(USERS.user.email);
					res.body.role.should.equal(USERS.user.role);
					res.body.id.should.equal(USERS.user.id);
					done();
				});
		});

		it('it should return 401 if token is not given', (done) => {
			chai.request(app)
				.get('/user')
				.end((err, res) => {
					should.not.exist(err);
					res.should.have.status(401);
					res.body.should.be.an('object');
					res.body.should.have.property('message');
					res.body.message.should.equal('Missing headers');
					done();
				});
		});

		it('it should return 401 if token is invalid', (done) => {
			chai.request(app)
				.get('/user')
				.set('authorization', 'Bearer fasldvkas')
				.end((err, res) => {
					should.not.exist(err);
					res.should.have.status(401);
					res.body.should.be.an('object');
					res.body.should.have.property('message');
					res.body.message.should.equal('Invalid token');
					done();
				});
		});
	});

	describe('/GET user/timezones', () => {
		it('it should return timezones', (done) => {
			chai.request(app)
				.get('/user/timezones')
				.set('authorization', `Bearer ${USERS.user.token}`)
				.end((err, res) => {
					should.not.exist(err);
					res.should.have.status(200);
					res.body.should.be.an('array');
					done();
				});
		});

		it('it should return 401 if token is not given', (done) => {
			chai.request(app)
				.get('/user/timezones')
				.end((err, res) => {
					should.not.exist(err);
					res.should.have.status(401);
					res.body.should.be.an('object');
					res.body.should.have.property('message');
					res.body.message.should.equal('Missing headers');
					done();
				});
		});

		it('it should return 401 if token is invalid', (done) => {
			chai.request(app)
				.get('/user/timezones')
				.set('authorization', 'Bearer fasldvkas')
				.end((err, res) => {
					should.not.exist(err);
					res.should.have.status(401);
					res.body.should.be.an('object');
					res.body.should.have.property('message');
					res.body.message.should.equal('Invalid token');
					done();
				});
		});
	});
});
