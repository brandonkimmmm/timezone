import request from 'supertest';
import { expect } from 'chai';
import app from '../../src/app';
import { truncate } from '../utils/db';
import { name, version } from '../../package.json';
import { getMockUser } from '../utils/mock';

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
			request(app)
				.get('/health')
				.expect(200)
				.end((err, res) => {
					expect(err).to.not.exist;
					expect(res.body).to.eql({ name, version });
					done();
				});
		});
	});

	describe('POST /signup', () => {
		it('it should return new user email, role, and id', (done) => {
			request(app)
				.post('/signup')
				.send({
					email: USER.email,
					password: USER.password,
					password_confirmation: USER.password
				})
				.expect(201)
				.end((err, res) => {
					expect(err).to.not.exist;
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
			request(app)
				.post('/signup')
				.send({
					email: 'nope',
					password: USER.password,
					password_confirmation: USER.password
				})
				.expect(400)
				.end((err, res) => {
					expect(err).to.not.exist;
					expect(res.body).to.eql({
						message: '"email" must be a valid email'
					});
					done();
				});
		});

		it('it should return 400 if password is invalid', (done) => {
			request(app)
				.post('/signup')
				.send({
					email: USER.email,
					password: 'hi',
					password_confirmation: 'hi'
				})
				.expect(400)
				.end((err, res) => {
					expect(err).to.not.exist;
					expect(res.body).to.eql({
						message:
							'"password" with value "hi" fails to match the required pattern: /^[a-zA-Z0-9]{8,20}$/'
					});
					done();
				});
		});

		it('it should return 400 if password_confirmation does not match password', (done) => {
			request(app)
				.post('/signup')
				.send({
					email: USER.email,
					password: USER.password,
					password_confirmation: 'nope1avasdf23'
				})
				.expect(400)
				.end((err, res) => {
					expect(err).to.not.exist;
					expect(res.body).to.eql({
						message:
							'"password_confirmation" must be [ref:password]'
					});
					done();
				});
		});

		it('it should return 400 error if user already exists', (done) => {
			request(app)
				.post('/signup')
				.send({
					email: USER.email,
					password: USER.password,
					password_confirmation: USER.password
				})
				.expect(400)
				.end((err, res) => {
					expect(err).to.not.exist;
					expect(res.body).to.eql({
						message: `User ${USER.email} already exists`
					});
					done();
				});
		});
	});

	describe('POST /login', () => {
		it('it should return bearer token on successful login', (done) => {
			request(app)
				.post('/login')
				.send({
					email: USER.email,
					password: USER.password
				})
				.expect(200)
				.end((err, res) => {
					expect(err).to.not.exist;
					expect(res.body).to.have.all.keys('token');
					expect(res.body.token).to.be.a('string').to.not.be.empty;
					done();
				});
		});

		it('it should return 400 error if email is invalid', (done) => {
			request(app)
				.post('/login')
				.send({
					email: 'nope',
					password: USER.password
				})
				.expect(400)
				.end((err, res) => {
					expect(err).to.not.exist;
					expect(res.body).to.eql({
						message: '"email" must be a valid email'
					});
					done();
				});
		});

		it('it should return 400 error if password is invalid', (done) => {
			request(app)
				.post('/login')
				.send({
					email: USER.email,
					password: 'hi'
				})
				.expect(400)
				.end((err, res) => {
					expect(err).to.not.exist;
					expect(res.body).to.eql({
						message:
							'"password" with value "hi" fails to match the required pattern: /^[a-zA-Z0-9]{8,20}$/'
					});
					done();
				});
		});

		it('it should return 400 error if user is not found', (done) => {
			request(app)
				.post('/login')
				.send({
					email: getMockUser().email,
					password: USER.password
				})
				.expect(400)
				.end((err, res) => {
					expect(err).to.not.exist;
					expect(res.body).to.eql({
						message: 'User not found'
					});
					done();
				});
		});
	});
});
