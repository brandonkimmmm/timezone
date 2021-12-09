import chai from 'chai';
import chaiHttp from 'chai-http';
import app from '../../src/app';
import { truncate } from '../utils/db';
import { name, version } from '../../package.json';
import { getMockUser } from '../utils/mock';

const should = chai.should();

chai.use(chaiHttp);

const USER = getMockUser();

describe('Public endpoints', () => {

	before(async () => {
		await truncate();
	});

	after(async () => {
		await truncate();
	});

	describe('/GET info', () => {
		it('it should return app version and name', (done) => {
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
					email: USER.email,
					password: USER.password,
					password_confirmation: USER.password
				})
				.end((err, res) => {
					should.not.exist(err);
					res.should.have.status(201);
					res.body.should.be.an('object');
					res.body.should.have.property('email');
					res.body.should.have.property('id');
					res.body.should.have.property('role');
					res.body.should.not.have.property('password');
					res.body.email.should.equal(USER.email);
					res.body.role.should.equal(USER.role);
					done();
				});
		});

		it('it should return 400 if email is invalid', (done) => {
			chai.request(app)
				.post('/signup')
				.send({
					email: 'nope',
					password: USER.password,
					password_confirmation: USER.password
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
					email: USER.email,
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
					email: USER.email,
					password: USER.password,
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
					email: USER.email,
					password: USER.password,
					password_confirmation: USER.password
				})
				.end((err, res) => {
					should.not.exist(err);
					res.should.have.status(400);
					res.body.should.be.an('object');
					res.body.should.have.property('message');
					res.body.message.should.equal(`User ${USER.email} already exists`);
					done();
				});
		});
	});

	describe('/POST login', () => {
		it('it should return bearer token on successful login', (done) => {
			chai.request(app)
				.post('/login')
				.send({
					email: USER.email,
					password: USER.password
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
					password: USER.password
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
					email: USER.email,
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
					email: getMockUser().email,
					password: USER.password
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
