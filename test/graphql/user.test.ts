import { expect } from 'chai';
import request from 'supertest';
import app from '../../src/app';
import { truncate } from '../utils/db';
import { createUser } from '../../src/services/user.service';
import { getMockUser, getMockTimezone } from '../utils/mock';
import { delay } from 'bluebird';
import { omit } from 'lodash';
import { signToken } from '../../src/services/auth.service';

let USER = {
	...getMockUser(),
	token: ''
};
let TIMEZONE = getMockTimezone();

describe('Graphql User Server', () => {
	before(async () => {
		await truncate();
		const user = await createUser(USER.email, USER.password);
		USER = { ...USER, ...user.toJSON() };
		USER.token = await signToken(USER.id, USER.email, USER.role);
		await delay(1000);
	});

	after(async () => {
		await truncate();
	});

	describe('#Query getUser', () => {
		it('it should return all user data', (done) => {
			request(app)
				.post('/graphql/user')
				.set({ Authorization: `Bearer ${USER.token}` })
				.send({
					query: '{ getUser { id email role created_at updated_at }}'
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

		it('it should return user email, role', (done) => {
			request(app)
				.post('/graphql/user')
				.set({ Authorization: `Bearer ${USER.token}` })
				.send({
					query: '{ getUser { email role }}'
				})
				.expect(200)
				.end((err, res) => {
					if (err) return done(err);
					expect(res.body.data.getUser).to.eql({
						email: USER.email,
						role: USER.role
					});
					done();
				});
		});

		it('it should send error if bearer token is not sent', (done) => {
			request(app)
				.post('/graphql/user')
				.send({ query: '{ getUser { id email }}' })
				.expect(200)
				.end((err, res) => {
					if (err) return done(err);
					expect(res.body.errors[0].message).to.equal(
						'Not Authorized'
					);
					done();
				});
		});

		it('it should send error if password is requested', (done) => {
			request(app)
				.post('/graphql/user')
				.set({ Authorization: `Bearer ${USER.token}` })
				.send({ query: '{ getUser { password }}' })
				.expect(400)
				.end((err, res) => {
					if (err) return done(err);
					expect(res.body.errors[0].message).to.equal(
						'Cannot query field "password" on type "User".'
					);
					done();
				});
		});
	});

	describe('#Mutation createTimezone', () => {
		it('it should return all data for created timezone', (done) => {
			request(app)
				.post('/graphql/user')
				.set({ Authorization: `Bearer ${USER.token}` })
				.send({
					query: `
						mutation {
							createTimezone(name: "${TIMEZONE.name}", city: "${TIMEZONE.city}") {
								id
								name
								city
								timezone
								offset
								created_at
								updated_at
							}
						}
					`
				})
				.expect(200)
				.end((err, res) => {
					if (err) return done(err);
					expect(res.body.data.createTimezone)
						.to.have.all.keys(
							'id',
							'name',
							'city',
							'timezone',
							'offset',
							'created_at',
							'updated_at'
						)
						.to.include({
							name: TIMEZONE.name,
							city: TIMEZONE.city,
							offset: '-5:00',
							timezone: 'America/New_York'
						});
					TIMEZONE = res.body.data.createTimezone;
					done();
				});
		});

		it('it should send error if invalid bearer token is sent', (done) => {
			request(app)
				.post('/graphql/user')
				.set({ Authorization: `Bearer nope` })
				.send({
					query: `
						mutation {
							createTimezone(name: "${TIMEZONE.name}", city: "${TIMEZONE.city}") {
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

		it('it should send error if timezone exists', (done) => {
			request(app)
				.post('/graphql/user')
				.set({ Authorization: `Bearer ${USER.token}` })
				.send({
					query: `
						mutation {
							createTimezone(name: "${TIMEZONE.name}", city: "${TIMEZONE.city}") {
								id
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

		it('it should send error if invalid city is given', (done) => {
			request(app)
				.post('/graphql/user')
				.set({ Authorization: `Bearer ${USER.token}` })
				.send({
					query: `
						mutation {
							createTimezone(name: "${TIMEZONE.name}", city: "nope123") {
								id
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

	describe('#Query getTimezones', () => {
		it('it should return all timezones data', (done) => {
			request(app)
				.post('/graphql/user')
				.set({ Authorization: `Bearer ${USER.token}` })
				.send({
					query: '{ getTimezones { id name city timezone offset created_at updated_at }}'
				})
				.expect(200)
				.end((err, res) => {
					if (err) return done(err);
					expect(res.body.data.getTimezones)
						.to.be.an('array')
						.to.have.length(1);
					expect(res.body.data.getTimezones[0]).eql(TIMEZONE);
					done();
				});
		});

		it('it should return timezones name', (done) => {
			request(app)
				.post('/graphql/user')
				.set({ Authorization: `Bearer ${USER.token}` })
				.send({
					query: '{ getTimezones { name }}'
				})
				.expect(200)
				.end((err, res) => {
					if (err) return done(err);
					expect(res.body.data.getTimezones)
						.to.be.an('array')
						.to.have.length(1);
					expect(res.body.data.getTimezones[0])
						.to.have.all.keys('name')
						.to.eql({ name: TIMEZONE.name });
					done();
				});
		});

		it('it should send error if bearer token is not sent', (done) => {
			request(app)
				.post('/graphql/user')
				.send({ query: '{ getTimezones { id name }}' })
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

	describe('#Mutation updateTimezone', () => {
		it('it should return all data for updated timezone', (done) => {
			request(app)
				.post('/graphql/user')
				.set({ Authorization: `Bearer ${USER.token}` })
				.send({
					query: `
						mutation {
							updateTimezone(
								id: ${TIMEZONE.id},
								data: {
									name: "test name",
									city: "Los Angeles",
									country: "us"
								}
							) {
								id
								name
								city
								timezone
								offset
								created_at
								updated_at
							}
						}
					`
				})
				.expect(200)
				.end((err, res) => {
					if (err) return done(err);
					expect(res.body.data.updateTimezone)
						.to.have.all.keys(
							'id',
							'name',
							'city',
							'timezone',
							'offset',
							'created_at',
							'updated_at'
						)
						.to.include({
							name: 'test name',
							city: 'los angeles',
							offset: '-8:00',
							timezone: 'America/Los_Angeles'
						});
					TIMEZONE = res.body.data.updateTimezone;
					done();
				});
		});

		it('it should send error if no bearer token is sent', (done) => {
			request(app)
				.post('/graphql/user')
				.send({
					query: `
						mutation {
							updateTimezone(
								id: ${TIMEZONE.id},
								data: {
									name: "test name",
									city: "Los Angeles",
									country: "us"
								}
							) {
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

		it('it should send error if no update data given', (done) => {
			request(app)
				.post('/graphql/user')
				.set({ Authorization: `Bearer ${USER.token}` })
				.send({
					query: `
						mutation {
							updateTimezone(
								id: ${TIMEZONE.id},
								data: {}
							) {
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

		it('it should send error if data with existing data given', (done) => {
			request(app)
				.post('/graphql/user')
				.set({ Authorization: `Bearer ${USER.token}` })
				.send({
					query: `
						mutation {
							updateTimezone(
								id: ${TIMEZONE.id},
								data: {
									name: "test name",
									city: "Los Angeles",
									country: "us"
								}
							) {
								id
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

		it('it should send error if timezone does not exist', (done) => {
			request(app)
				.post('/graphql/user')
				.set({ Authorization: `Bearer ${USER.token}` })
				.send({
					query: `
						mutation {
							updateTimezone(
								id: 9999999,
								data: {
									name: "test name",
									city: "Los Angeles",
									country: "us"
								}
							) {
								id
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

	describe('#Mutation deleteTimezone', () => {
		it('it should return all data for deleted timezone', (done) => {
			request(app)
				.post('/graphql/user')
				.set({ Authorization: `Bearer ${USER.token}` })
				.send({
					query: `
						mutation {
							deleteTimezone(id: ${TIMEZONE.id}) {
								id
								name
								city
								timezone
								offset
								created_at
							}
						}
					`
				})
				.expect(200)
				.end((err, res) => {
					if (err) return done(err);
					expect(res.body.data.deleteTimezone)
						.to.have.all.keys(
							'id',
							'name',
							'city',
							'timezone',
							'offset',
							'created_at'
						)
						.to.eql(omit(TIMEZONE, 'updated_at'));
					done();
				});
		});

		it('it should send error if no bearer token is sent', (done) => {
			request(app)
				.post('/graphql/user')
				.send({
					query: `
						mutation {
							deleteTimezone(id: ${TIMEZONE.id}) {
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

		it('it should send error if timezone does not exist', (done) => {
			request(app)
				.post('/graphql/user')
				.set({ Authorization: `Bearer ${USER.token}` })
				.send({
					query: `
						mutation {
							deleteTimezone(id: ${TIMEZONE.id}) {
								id
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
});
