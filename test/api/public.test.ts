import chai, { expect } from 'chai';
import chaiHttp from 'chai-http';
import app from '../../src/app';
import { truncate } from '../utils/db';
import { name, version } from '../../package.json';
import { getMockUser } from '../utils/mock';

chai.use(chaiHttp);

const USER = getMockUser();

describe('Public endpoints', () => {
	before(async () => {
		await truncate();
	});

	after(async () => {
		await truncate();
	});

	describe('GET /health', () => {
		it('it should return app version and name', (done) => {
			chai.request(app)
				.get('/health')
				.end((err, res) => {
					expect(err).to.not.exist;
					expect(res).to.have.status(200);
					expect(res.body).to.eql({ name, version });
					done();
				});
		});
	});

	describe('POST /signup', () => {
		it('it should return new user email, role, and id', (done) => {
			chai.request(app)
				.post('/signup')
				.send({
					email: USER.email,
					password: USER.password,
					password_confirmation: USER.password
				})
				.end((err, res) => {
					expect(err).to.not.exist;
					expect(res).to.have.status(201);
					expect(res.body)
						.to.have.all.keys(
							'id',
							'email',
							'role',
							'created_at',
							'updated_at'
						)
						.to.include({
							id: 1,
							email: USER.email,
							role: USER.role
						});
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
					expect(err).to.not.exist;
					expect(res).to.have.status(400);
					expect(res.body).to.eql({
						message: '"email" must be a valid email'
					});
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
					expect(err).to.not.exist;
					expect(res).to.have.status(400);
					expect(res.body).to.eql({
						message:
							'"password" with value "hi" fails to match the required pattern: /^[a-zA-Z0-9]{8,20}$/'
					});
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
					expect(err).to.not.exist;
					expect(res).to.have.status(400);
					expect(res.body).to.eql({
						message:
							'"password_confirmation" must be [ref:password]'
					});
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
					expect(err).to.not.exist;
					expect(res).to.have.status(400);
					expect(res.body).to.eql({
						message: `User ${USER.email} already exists`
					});
					done();
				});
		});
	});

	describe('POST /login', () => {
		it('it should return bearer token on successful login', (done) => {
			chai.request(app)
				.post('/login')
				.send({
					email: USER.email,
					password: USER.password
				})
				.end((err, res) => {
					expect(err).to.not.exist;
					expect(res).to.have.status(200);
					expect(res.body).to.have.all.keys('token');
					expect(res.body.token).to.be.a('string').to.not.be.empty;
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
					expect(err).to.not.exist;
					expect(res).to.have.status(400);
					expect(res.body).to.eql({
						message: '"email" must be a valid email'
					});
					done();
				});
		});

		it('it should return 400 error if password is invalid', (done) => {
			chai.request(app)
				.post('/login')
				.send({
					email: USER.email,
					password: 'hi'
				})
				.end((err, res) => {
					expect(err).to.not.exist;
					expect(res).to.have.status(400);
					expect(res.body).to.eql({
						message:
							'"password" with value "hi" fails to match the required pattern: /^[a-zA-Z0-9]{8,20}$/'
					});
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
					expect(err).to.not.exist;
					expect(res).to.have.status(400);
					expect(res.body).to.eql({
						message: 'User not found'
					});
					done();
				});
		});
	});
});
