import { expect } from 'chai';
import request from 'supertest';
import app from '../../src/app';
import { truncate } from '../utils/db';
import { createUser, loginUser } from '../../src/services/user.service';
import { createTimezone } from '../../src/services/timezone.service';
import { getMockUser, getMockTimezone } from '../utils/mock';
import { delay } from 'bluebird';
import { omit } from 'lodash';

let ADMIN = {
	...getMockUser('admin'),
	token: '',
	timezone: getMockTimezone()
};
let USER = {
	...getMockUser(),
	token: '',
	timezone: getMockTimezone()
};

describe('Graphql Admin Server', () => {
	before(async () => {
		await truncate();
		const admin = await createUser(ADMIN.email, ADMIN.password, 'admin');
		const user = await createUser(USER.email, USER.password);

		ADMIN = { ...ADMIN, ...admin.toJSON() };
		ADMIN.token = await loginUser(ADMIN.email, ADMIN.password);

		USER = { ...USER, ...user.toJSON() };
		USER.token = await loginUser(USER.email, USER.password);

		const adminTimezone = await createTimezone(
			ADMIN.id,
			ADMIN.timezone.name,
			ADMIN.timezone.city
		);

		const userTimezone = await createTimezone(
			USER.id,
			USER.timezone.name,
			USER.timezone.city
		);

		ADMIN.timezone = adminTimezone.toJSON();
		USER.timezone = userTimezone.toJSON();

		await delay(1000);
	});

	after(async () => {
		await truncate();
	});

	describe('#Query getUsers', () => {
		it('it should return all users data', (done) => {
			request(app)
				.post('/graphql/admin')
				.set({ Authorization: `Bearer ${ADMIN.token}` })
				.send({
					query: '{ getUsers { id email role created_at updated_at }}'
				})
				.expect(200)
				.end((err, res) => {
					if (err) return done(err);
					expect(res.body.data.getUsers)
						.to.be.an('array')
						.to.have.length(2);
					expect(res.body.data.getUsers[0]).to.eql({
						id: ADMIN.id,
						email: ADMIN.email,
						role: ADMIN.role,
						created_at: ADMIN.created_at.toISOString(),
						updated_at: ADMIN.updated_at.toISOString()
					});
					expect(res.body.data.getUsers[1]).to.eql({
						id: USER.id,
						email: USER.email,
						role: USER.role,
						created_at: USER.created_at.toISOString(),
						updated_at: USER.updated_at.toISOString()
					});
					done();
				});
		});

		it('it should send error if bearer token is not sent', (done) => {
			request(app)
				.post('/graphql/admin')
				.send({
					query: '{ getUsers { id email role created_at updated_at }}'
				})
				.expect(200)
				.end((err, res) => {
					if (err) return done(err);
					expect(res.body.errors[0].message).to.equal(
						'Not Authorized'
					);
					done();
				});
		});

		it('it should send error if user makes request', (done) => {
			request(app)
				.post('/graphql/admin')
				.set({ Authorization: `Bearer ${USER.token}` })
				.send({
					query: '{ getUsers { id email role created_at updated_at }}'
				})
				.expect(200)
				.end((err, res) => {
					if (err) return done(err);
					expect(res.body.errors[0].message).to.equal(
						'Not Authorized'
					);
					done();
				});
		});
	});

	describe('#Query getUser', () => {
		it('it should return all user data', (done) => {
			request(app)
				.post('/graphql/admin')
				.set({ Authorization: `Bearer ${ADMIN.token}` })
				.send({
					query: `{ getUser(id: ${USER.id}) { id email role created_at updated_at }}`
				})
				.expect(200)
				.end((err, res) => {
					if (err) return done(err);
					expect(res.body.data.getUser).to.eql({
						id: USER.id,
						email: USER.email,
						role: USER.role,
						created_at: USER.created_at.toISOString(),
						updated_at: USER.updated_at.toISOString()
					});
					done();
				});
		});

		it('it should send error if bearer token is not sent', (done) => {
			request(app)
				.post('/graphql/admin')
				.send({
					query: `{ getUser(id: ${USER.id}) { id email role created_at updated_at }}`
				})
				.expect(200)
				.end((err, res) => {
					if (err) return done(err);
					expect(res.body.errors[0].message).to.equal(
						'Not Authorized'
					);
					done();
				});
		});

		it('it should send error if user makes request', (done) => {
			request(app)
				.post('/graphql/admin')
				.set({ Authorization: `Bearer ${USER.token}` })
				.send({
					query: `{ getUser(id: ${USER.id}) { id email role created_at updated_at }}`
				})
				.expect(200)
				.end((err, res) => {
					if (err) return done(err);
					expect(res.body.errors[0].message).to.equal(
						'Not Authorized'
					);
					done();
				});
		});

		it('it should send error if user does not exist', (done) => {
			request(app)
				.post('/graphql/admin')
				.set({ Authorization: `Bearer ${ADMIN.token}` })
				.send({
					query: '{ getUser(id: 9999) { id email role created_at updated_at }}'
				})
				.expect(200)
				.end((err, res) => {
					if (err) return done(err);
					expect(res.body.errors[0].message).to.equal(
						'User not found'
					);
					done();
				});
		});
	});

	describe('#Query getTimezones', () => {
		it('it should return all timezones data for user', (done) => {
			request(app)
				.post('/graphql/admin')
				.set({ Authorization: `Bearer ${ADMIN.token}` })
				.send({
					query: `{ getTimezones(user_id: ${USER.id}) {
						id
						name
						city
						timezone
						offset
						created_at
						updated_at
					}}`
				})
				.expect(200)
				.end((err, res) => {
					if (err) return done(err);
					expect(res.body.data.getTimezones)
						.to.be.an('array')
						.to.have.length(1);
					expect(res.body.data.getTimezones[0]).to.eql({
						id: USER.timezone.id,
						name: USER.timezone.name,
						city: USER.timezone.city,
						offset: USER.timezone.offset,
						timezone: USER.timezone.timezone,
						created_at: USER.timezone.created_at.toISOString(),
						updated_at: USER.timezone.updated_at.toISOString()
					});
					done();
				});
		});

		it('it should send error if bearer token is not sent', (done) => {
			request(app)
				.post('/graphql/admin')
				.send({
					query: `{ getTimezones(user_id: ${USER.id}) {
						id
					}}`
				})
				.expect(200)
				.end((err, res) => {
					if (err) return done(err);
					expect(res.body.errors[0].message).to.equal(
						'Not Authorized'
					);
					done();
				});
		});

		it('it should send error if user makes request', (done) => {
			request(app)
				.post('/graphql/admin')
				.set({ Authorization: `Bearer ${USER.token}` })
				.send({
					query: `{ getTimezones(user_id: ${ADMIN.id}) {
						id
					}}`
				})
				.expect(200)
				.end((err, res) => {
					if (err) return done(err);
					expect(res.body.errors[0].message).to.equal(
						'Not Authorized'
					);
					done();
				});
		});

		it('it should send error if user is not found', (done) => {
			request(app)
				.post('/graphql/admin')
				.set({ Authorization: `Bearer ${ADMIN.token}` })
				.send({
					query: `{ getTimezones(user_id: 9999) {
						id
					}}`
				})
				.expect(200)
				.end((err, res) => {
					if (err) return done(err);
					expect(res.body.errors[0].message).to.equal(
						'User not found'
					);
					done();
				});
		});
	});
});
