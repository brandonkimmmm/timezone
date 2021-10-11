const chai = require('chai');
const chaiHttp = require('chai-http');
const app = require('../../app');
const should = chai.should();
const faker = require('faker');
const { truncate } = require('../utils/db');

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
	});

	after(async () => {
		await truncate();
	});

	describe('/GET info', () => {
		it('it should return app version and name', (done) => {
			const { name, version } = require('../../../package.json');
			chai.request(app)
				.get('/info')
				.end((err, res) => {
					should.not.exist(err);
					res.should.have.status(200);
					res.body.should.be.an('object');
					res.body.should.have.property('name', name);
					res.body.should.have.property('version', version);
					done();
				});
		});
	});

	describe('/POST signup', () => {
		it('it should return new user email, role, and id', (done) => {
			chai.request(app)
				.post('/signup')
				.send({
					email: USERS.user.email,
					password: USERS.user.password,
					password_confirmation: USERS.user.password
				})
				.end((err, res) => {
					should.not.exist(err);
					res.should.have.status(201);
					res.body.should.be.an('object');
					res.body.should.have.property('email');
					res.body.should.have.property('id');
					res.body.should.have.property('role');
					res.body.should.not.have.property('password');
					res.body.email.should.equal(USERS.user.email);
					res.body.role.should.equal(USERS.user.role);
					done();
				});
		});

		it('it should return 400 if email is invalid', (done) => {
			chai.request(app)
				.post('/signup')
				.send({
					email: 'nope',
					password: USERS.user.password,
					password_confirmation: USERS.user.password
				})
				.end((err, res) => {
					should.not.exist(err);
					res.should.have.status(400);
					res.body.should.be.an('object');
					res.body.should.have.property('message');
					res.body.message.should.equal('"email" must be a valid email');
					done();
				});
		});

		it('it should return 400 if password is invalid', (done) => {
			chai.request(app)
				.post('/signup')
				.send({
					email: USERS.user.email,
					password: 'hi',
					password_confirmation: 'hi'
				})
				.end((err, res) => {
					should.not.exist(err);
					res.should.have.status(400);
					res.body.should.be.an('object');
					res.body.should.have.property('message');
					res.body.message.should.equal('"password" with value "hi" fails to match the required pattern: /^[a-zA-Z0-9]{8,20}$/');
					done();
				});
		});

		it('it should return 400 if password_confirmation does not match password', (done) => {
			chai.request(app)
				.post('/signup')
				.send({
					email: USERS.user.email,
					password: USERS.user.password,
					password_confirmation: 'nope1avasdf23'
				})
				.end((err, res) => {
					should.not.exist(err);
					res.should.have.status(400);
					res.body.should.be.an('object');
					res.body.should.have.property('message');
					res.body.message.should.equal('"password_confirmation" must be [ref:password]');
					done();
				});
		});

		it('it should return 400 error if user already exists', (done) => {
			chai.request(app)
				.post('/signup')
				.send({
					email: USERS.user.email,
					password: USERS.user.password,
					password_confirmation: USERS.user.password
				})
				.end((err, res) => {
					should.not.exist(err);
					res.should.have.status(400);
					res.body.should.be.an('object');
					res.body.should.have.property('message');
					res.body.message.should.equal(`User ${USERS.user.email} already exists`);
					done();
				});
		});
	});

	describe('/POST login', () => {
		it('it should return bearer token on successful login', (done) => {
			chai.request(app)
				.post('/login')
				.send({
					email: USERS.user.email,
					password: USERS.user.password
				})
				.end((err, res) => {
					should.not.exist(err);
					res.should.have.status(200);
					res.body.should.be.an('object');
					res.body.should.have.property('token');
					done();
				});
		});

		it('it should return 400 error if email is invalid', (done) => {
			chai.request(app)
				.post('/login')
				.send({
					email: 'nope',
					password: USERS.user.password
				})
				.end((err, res) => {
					should.not.exist(err);
					res.should.have.status(400);
					res.body.should.be.an('object');
					res.body.should.have.property('message');
					res.body.message.should.equal('"email" must be a valid email');
					done();
				});
		});

		it('it should return 400 error if password is invalid', (done) => {
			chai.request(app)
				.post('/login')
				.send({
					email: USERS.user.email,
					password: 'hi',
				})
				.end((err, res) => {
					should.not.exist(err);
					res.should.have.status(400);
					res.body.should.be.an('object');
					res.body.should.have.property('message');
					res.body.message.should.equal('"password" with value "hi" fails to match the required pattern: /^[a-zA-Z0-9]{8,20}$/');
					done();
				});
		});

		it('it should return 400 error if user is not found', (done) => {
			chai.request(app)
				.post('/login')
				.send({
					email: faker.internet.exampleEmail(),
					password: USERS.user.password
				})
				.end((err, res) => {
					should.not.exist(err);
					res.should.have.status(400);
					res.body.should.be.an('object');
					res.body.should.have.property('message');
					res.body.message.should.equal('User not found');
					done();
				});
		});
	});
});
