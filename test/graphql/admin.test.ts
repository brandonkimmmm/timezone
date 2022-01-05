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

	describe('#Mutation updateUser', () => {
		it('it should return all data for updated user', (done) => {
			request(app)
				.post('/graphql/admin')
				.set({ Authorization: `Bearer ${ADMIN.token}` })
				.send({
					query: `
						mutation {
							updateUser(id: ${USER.id}, data: { role: "admin" }) {
								id
								email
								role
								created_at
							}
						}
					`
				})
				.expect(200)
				.end((err, res) => {
					if (err) return done(err);
					expect(res.body.data.updateUser).to.eql({
						id: USER.id,
						email: USER.email,
						role: 'admin',
						created_at: USER.created_at.toISOString()
					});
					done();
				});
		});

		it('it should return all data for updated user', (done) => {
			request(app)
				.post('/graphql/admin')
				.set({ Authorization: `Bearer ${ADMIN.token}` })
				.send({
					query: `
						mutation {
							updateUser(id: ${USER.id}, data: { role: "user" }) {
								id
								email
								role
								created_at
							}
						}
					`
				})
				.expect(200)
				.end((err, res) => {
					if (err) return done(err);
					expect(res.body.data.updateUser).to.eql({
						id: USER.id,
						email: USER.email,
						role: USER.role,
						created_at: USER.created_at.toISOString()
					});
					done();
				});
		});

		it('it should send error if invalid bearer token is sent', (done) => {
			request(app)
				.post('/graphql/admin')
				.set({ Authorization: `Bearer nope` })
				.send({
					query: `
						mutation {
							updateUser(id: ${USER.id}, data: { role: "user" }) {
								id
							}
						}
					`
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
					query: `
						mutation {
							updateUser(id: ${USER.id}, data: { role: "user" }) {
								id
							}
						}
					`
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
					query: `
						mutation {
							updateUser(id: 999, data: { role: "user" }) {
								id
							}
						}
					`
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

		it('it should send error if no data is given', (done) => {
			request(app)
				.post('/graphql/admin')
				.set({ Authorization: `Bearer ${ADMIN.token}` })
				.send({
					query: `
						mutation {
							updateUser(id: 999, data: {}) {
								id
							}
						}
					`
				})
				.expect(200)
				.end((err, res) => {
					if (err) return done(err);
					expect(res.body.errors[0].message).to.equal(
						'"data" must have at least 1 key'
					);
					done();
				});
		});

		it('it should send error if user role is the same', (done) => {
			request(app)
				.post('/graphql/admin')
				.set({ Authorization: `Bearer ${ADMIN.token}` })
				.send({
					query: `
						mutation {
							updateUser(id: ${USER.id}, data: { role: "user" }) {
								id
							}
						}
					`
				})
				.expect(200)
				.end((err, res) => {
					if (err) return done(err);
					expect(res.body.errors[0].message).to.equal(
						'User already has role user'
					);
					done();
				});
		});

		it('it should send error if updating admin role', (done) => {
			request(app)
				.post('/graphql/admin')
				.set({ Authorization: `Bearer ${ADMIN.token}` })
				.send({
					query: `
						mutation {
							updateUser(id: ${ADMIN.id}, data: { role: "user" }) {
								id
							}
						}
					`
				})
				.expect(200)
				.end((err, res) => {
					if (err) return done(err);
					expect(res.body.errors[0].message).to.equal(
						'Cannot update master admin role'
					);
					done();
				});
		});
	});

	describe('#Mutation createUser', () => {
		it('it should return all data for created user', (done) => {
			request(app)
				.post('/graphql/admin')
				.set({ Authorization: `Bearer ${ADMIN.token}` })
				.send({
					query: `
						mutation {
							createUser(
								email: "test@test.com",
								password: "${USER.password}",
								password_confirmation: "${USER.password}"
							) {
								email
								role
							}
						}
					`
				})
				.expect(200)
				.end((err, res) => {
					if (err) return done(err);
					expect(res.body.data.createUser).to.eql({
						email: 'test@test.com',
						role: 'user'
					});
					done();
				});
		});

		it('it should send error if invalid bearer token is sent', (done) => {
			request(app)
				.post('/graphql/admin')
				.set({ Authorization: `Bearer nope` })
				.send({
					query: `
						mutation {
							createUser(
								email: "test@test.com",
								password: "${USER.password}",
								password_confirmation: "${USER.password}"
							) {
								email
							}
						}
					`
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
					query: `
						mutation {
							createUser(
								email: "test@test.com",
								password: "${USER.password}",
								password_confirmation: "${USER.password}"
							) {
								email
							}
						}
					`
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

		it('it should send error if user already exists', (done) => {
			request(app)
				.post('/graphql/admin')
				.set({ Authorization: `Bearer ${ADMIN.token}` })
				.send({
					query: `
						mutation {
							createUser(
								email: "test@test.com",
								password: "${USER.password}",
								password_confirmation: "${USER.password}"
							) {
								email
							}
						}
					`
				})
				.expect(200)
				.end((err, res) => {
					if (err) return done(err);
					expect(res.body.errors[0].message).to.equal(
						'User test@test.com already exists'
					);
					done();
				});
		});

		it('it should send error if password doesnt match', (done) => {
			request(app)
				.post('/graphql/admin')
				.set({ Authorization: `Bearer ${ADMIN.token}` })
				.send({
					query: `
						mutation {
							createUser(
								email: "test@test.com",
								password: "${USER.password}",
								password_confirmation: "asdfasdfasdf"
							) {
								email
							}
						}
					`
				})
				.expect(200)
				.end((err, res) => {
					if (err) return done(err);
					expect(res.body.errors[0].message).to.equal(
						'"password_confirmation" must be [ref:password]'
					);
					done();
				});
		});

		it('it should send error if invalid email is given', (done) => {
			request(app)
				.post('/graphql/admin')
				.set({ Authorization: `Bearer ${ADMIN.token}` })
				.send({
					query: `
						mutation {
							createUser(
								email: "hi123",
								password: "${USER.password}",
								password_confirmation: "${USER.password}"
							) {
								email
							}
						}
					`
				})
				.expect(200)
				.end((err, res) => {
					if (err) return done(err);
					expect(res.body.errors[0].message).to.equal(
						'"email" must be a valid email'
					);
					done();
				});
		});
	});

	describe('#Mutation createTimezone', () => {
		it('it should return data for created timezone', (done) => {
			request(app)
				.post('/graphql/admin')
				.set({ Authorization: `Bearer ${ADMIN.token}` })
				.send({
					query: `
						mutation {
							createTimezone(
								user_id: ${USER.id},
								name: "new timezone",
								city: "${USER.timezone.city}"
							) {
								name
								timezone
							}
						}
					`
				})
				.expect(200)
				.end((err, res) => {
					if (err) return done(err);
					expect(res.body.data.createTimezone).to.eql({
						name: 'new timezone',
						timezone: 'America/New_York'
					});
					done();
				});
		});

		it('it should send error if invalid bearer token is sent', (done) => {
			request(app)
				.post('/graphql/admin')
				.set({ Authorization: `Bearer nope` })
				.send({
					query: `
						mutation {
							createTimezone(
								user_id: ${USER.id},
								name: "new timezone",
								city: "${USER.timezone.city}"
							) {
								name
							}
						}
					`
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
					query: `
						mutation {
							createTimezone(
								user_id: ${USER.id},
								name: "new timezone",
								city: "${USER.timezone.city}"
							) {
								name
							}
						}
					`
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

		it('it should send error if user timezone with name already exists', (done) => {
			request(app)
				.post('/graphql/admin')
				.set({ Authorization: `Bearer ${ADMIN.token}` })
				.send({
					query: `
						mutation {
							createTimezone(
								user_id: ${USER.id},
								name: "${USER.timezone.name}",
								city: "${USER.timezone.city}"
							) {
								name
							}
						}
					`
				})
				.expect(200)
				.end((err, res) => {
					if (err) return done(err);
					expect(res.body.errors[0].message).to.equal(
						'Timezone with name already exists for user'
					);
					done();
				});
		});

		it('it should send error if user does not exist', (done) => {
			request(app)
				.post('/graphql/admin')
				.set({ Authorization: `Bearer ${ADMIN.token}` })
				.send({
					query: `
						mutation {
							createTimezone(
								user_id: 9999,
								name: "${USER.timezone.name}",
								city: "${USER.timezone.city}"
							) {
								name
							}
						}
					`
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

		it('it should send error if invalid city is given', (done) => {
			request(app)
				.post('/graphql/admin')
				.set({ Authorization: `Bearer ${ADMIN.token}` })
				.send({
					query: `
						mutation {
							createTimezone(
								user_id: ${USER.id},
								name: "another name",
								city: "${USER.timezone.city}",
								country: "AA"
							) {
								name
							}
						}
					`
				})
				.expect(200)
				.end((err, res) => {
					if (err) return done(err);
					expect(res.body.errors[0].message).to.equal('Invalid city');
					done();
				});
		});
	});

	describe('#Mutation updateTimezone', () => {
		it('it should return data for updated timezone', (done) => {
			request(app)
				.post('/graphql/admin')
				.set({ Authorization: `Bearer ${ADMIN.token}` })
				.send({
					query: `
						mutation {
							updateTimezone(
								id: 3,
								data: {
									name: "updated timezone"
									city: "Los Angeles",
									country: "US"
								}
							) {
								name
								timezone
								offset
							}
						}
					`
				})
				.expect(200)
				.end((err, res) => {
					if (err) return done(err);
					expect(res.body.data.updateTimezone).to.eql({
						name: 'updated timezone',
						timezone: 'America/Los_Angeles',
						offset: '-8:00'
					});
					done();
				});
		});

		it('it should send error if invalid bearer token is sent', (done) => {
			request(app)
				.post('/graphql/admin')
				.set({ Authorization: `Bearer nope` })
				.send({
					query: `
						mutation {
							updateTimezone(
								id: ${USER.timezone.id},
								data: {
									name: "updated timezone"
									city: "Los Angeles",
									country: "US"
								}
							) {
								name
							}
						}
					`
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
					query: `
						mutation {
							updateTimezone(
								id: ${USER.timezone.id},
								data: {
									name: "updated timezone"
									city: "Los Angeles",
									country: "US"
								}
							) {
								name
							}
						}
					`
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

		it('it should send error if user timezone with name already exists', (done) => {
			request(app)
				.post('/graphql/admin')
				.set({ Authorization: `Bearer ${ADMIN.token}` })
				.send({
					query: `
						mutation {
							updateTimezone(
								id: ${USER.timezone.id},
								data: {
									name: "updated timezone"
									city: "Los Angeles",
									country: "US"
								}
							) {
								name
							}
						}
					`
				})
				.expect(200)
				.end((err, res) => {
					if (err) return done(err);
					expect(res.body.errors[0].message).to.equal(
						'Timezone with name already exists'
					);
					done();
				});
		});

		it('it should send error if timezone does not exist', (done) => {
			request(app)
				.post('/graphql/admin')
				.set({ Authorization: `Bearer ${ADMIN.token}` })
				.send({
					query: `
						mutation {
							updateTimezone(
								id: 9999,
								data: {
									name: "updated timezone"
									city: "Los Angeles",
									country: "US"
								}
							) {
								name
							}
						}
					`
				})
				.expect(200)
				.end((err, res) => {
					if (err) return done(err);
					expect(res.body.errors[0].message).to.equal(
						'Timezone not found'
					);
					done();
				});
		});

		it('it should send error if invalid city is given', (done) => {
			request(app)
				.post('/graphql/admin')
				.set({ Authorization: `Bearer ${ADMIN.token}` })
				.send({
					query: `
						mutation {
							updateTimezone(
								id: ${USER.timezone.id},
								data: {
									name: "updated timezone 2"
									city: "asdfasdf"
								}
							) {
								name
							}
						}
					`
				})
				.expect(200)
				.end((err, res) => {
					if (err) return done(err);
					expect(res.body.errors[0].message).to.equal('Invalid city');
					done();
				});
		});

		it('it should send error if no data is given', (done) => {
			request(app)
				.post('/graphql/admin')
				.set({ Authorization: `Bearer ${ADMIN.token}` })
				.send({
					query: `
						mutation {
							updateTimezone(
								id: ${USER.timezone.id},
								data: {}
							) {
								name
							}
						}
					`
				})
				.expect(200)
				.end((err, res) => {
					if (err) return done(err);
					expect(res.body.errors[0].message).to.equal(
						'"data" must have at least 1 key'
					);
					done();
				});
		});

		it('it should send error if update data is the same', (done) => {
			request(app)
				.post('/graphql/admin')
				.set({ Authorization: `Bearer ${ADMIN.token}` })
				.send({
					query: `
						mutation {
							updateTimezone(
								id: ${USER.timezone.id},
								data: {
									name: "${USER.timezone.name}",
									city: "${USER.timezone.city}"
								}
							) {
								name
							}
						}
					`
				})
				.expect(200)
				.end((err, res) => {
					if (err) return done(err);
					expect(res.body.errors[0].message).to.equal(
						'No fields to update'
					);
					done();
				});
		});
	});

	describe('#Mutation deleteTimezone', () => {
		it('it should return data for updated timezone', (done) => {
			request(app)
				.post('/graphql/admin')
				.set({ Authorization: `Bearer ${ADMIN.token}` })
				.send({
					query: `
						mutation {
							deleteTimezone(
								id: ${USER.timezone.id}
							) {
								name
								timezone
								offset
							}
						}
					`
				})
				.expect(200)
				.end((err, res) => {
					if (err) return done(err);
					expect(res.body.data.deleteTimezone).to.eql({
						name: USER.timezone.name,
						timezone: USER.timezone.timezone,
						offset: USER.timezone.offset
					});
					done();
				});
		});

		it('it should send error if invalid bearer token is sent', (done) => {
			request(app)
				.post('/graphql/admin')
				.set({ Authorization: `Bearer nope` })
				.send({
					query: `
						mutation {
							deleteTimezone(
								id: ${USER.timezone.id}
							) {
								name
								timezone
								offset
							}
						}
					`
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
					query: `
						mutation {
							deleteTimezone(
								id: ${USER.timezone.id}
							) {
								name
								timezone
								offset
							}
						}
					`
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

		it('it should send error if timezone does not exist', (done) => {
			request(app)
				.post('/graphql/admin')
				.set({ Authorization: `Bearer ${ADMIN.token}` })
				.send({
					query: `
						mutation {
							deleteTimezone(
								id: 99999
							) {
								name
								timezone
								offset
							}
						}
					`
				})
				.expect(200)
				.end((err, res) => {
					if (err) return done(err);
					expect(res.body.errors[0].message).to.equal(
						'Timezone not found'
					);
					done();
				});
		});
	});

	describe('#Mutation deleteUser', () => {
		it('it should return data for updated timezone', (done) => {
			request(app)
				.post('/graphql/admin')
				.set({ Authorization: `Bearer ${ADMIN.token}` })
				.send({
					query: `
						mutation {
							deleteUser(
								id: ${USER.id}
							) {
								email
							}
						}
					`
				})
				.expect(200)
				.end((err, res) => {
					if (err) return done(err);
					expect(res.body.data.deleteUser).to.eql({
						email: USER.email
					});
					done();
				});
		});

		it('it should send error if invalid bearer token is sent', (done) => {
			request(app)
				.post('/graphql/admin')
				.set({ Authorization: `Bearer nope` })
				.send({
					query: `
						mutation {
							deleteUser(
								id: ${USER.id}
							) {
								email
							}
						}
					`
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
					query: `
						mutation {
							deleteUser(
								id: ${USER.id}
							) {
								email
							}
						}
					`
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
					query: `
						mutation {
							deleteUser(
								id: 99999
							) {
								email
							}
						}
					`
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
