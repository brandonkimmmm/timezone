import chai from 'chai';
import chaiHttp from 'chai-http';
import app from '../../src/app';
import { createUser } from '../../src/api/models/user';
import { signToken } from '../../src/utils/jwt';
import { truncate } from '../utils/db';
import { getMockUser } from '../utils/mock';

const should = chai.should();

chai.use(chaiHttp);

const USERS = {
	user: getMockUser(),
	admin: getMockUser('admin')
};

const TIMEZONE = {
	city: 'new york',
	name: 'my city new york'
};

describe('Admin endpoints', () => {

	before(async () => {
		await truncate();
		const admin = await createUser(USERS.admin.email, USERS.admin.password, 'admin');
		USERS.admin.id = admin.id;
		const adminToken = await signToken(USERS.admin.id, USERS.admin.email, USERS.admin.role);
		USERS.admin.token = adminToken;

		const user = await createUser(USERS.user.email, USERS.user.password);
		USERS.user.id = user.id;
		const token = await signToken(USERS.user.id, USERS.user.email, USERS.user.role);
		USERS.user.token = token;
	});

	after(async () => {
		await truncate();
	});

	describe('/POST admin/user/timezone', () => {
		it('it should create a timezone for a user', (done) => {
			chai.request(app)
				.post('/admin/user/timezone')
				.set('authorization', `Bearer ${USERS.admin.token}`)
				.send({
					user_id: USERS.user.id,
					name: TIMEZONE.name,
					city: TIMEZONE.city
				})
				.end((err, res) => {
					should.not.exist(err);
					res.should.have.status(201);
					res.body.should.be.an('object');
					res.body.should.have.property('user_id');
					res.body.should.have.property('city');
					res.body.should.have.property('name');
					res.body.should.have.property('timezone');
					res.body.should.have.property('offset');
					res.body.user_id.should.equal(USERS.user.id);
					res.body.city.should.equal(TIMEZONE.city);
					res.body.name.should.equal(TIMEZONE.name);
					res.body.timezone.should.equal('America/New_York');
					res.body.offset.should.equal('-5:00');
					done();
				});
		});

		it('it should return 401 if token is not given', (done) => {
			chai.request(app)
				.post('/admin/user/timezone')
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
				.post('/admin/user/timezone')
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

		it('it should return 401 if token is for user', (done) => {
			chai.request(app)
				.post('/admin/user/timezone')
				.set('authorization', `Bearer ${USERS.user.token}`)
				.end((err, res) => {
					should.not.exist(err);
					res.should.have.status(401);
					res.body.should.be.an('object');
					res.body.should.have.property('message');
					res.body.message.should.equal('Invalid token');
					done();
				});
		});

		it('it should return 400 if invalid city is given', (done) => {
			chai.request(app)
				.post('/admin/user/timezone')
				.set('authorization', `Bearer ${USERS.admin.token}`)
				.send({
					user_id: USERS.user.id,
					name: 'another',
					city: 'nope'
				})
				.end((err, res) => {
					should.not.exist(err);
					res.should.have.status(400);
					res.body.should.be.an('object');
					res.body.should.have.property('message');
					res.body.message.should.equal('Invalid city');
					done();
				});
		});

		it('it should return 400 if name already exists', (done) => {
			chai.request(app)
				.post('/admin/user/timezone')
				.set('authorization', `Bearer ${USERS.admin.token}`)
				.send({
					user_id: USERS.user.id,
					name: TIMEZONE.name,
					city: TIMEZONE.city
				})
				.end((err, res) => {
					should.not.exist(err);
					res.should.have.status(400);
					res.body.should.be.an('object');
					res.body.should.have.property('message');
					res.body.message.should.equal('Timezone with name already exists for user');
					done();
				});
		});

		it('it should return 400 if user not found', (done) => {
			chai.request(app)
				.post('/admin/user/timezone')
				.set('authorization', `Bearer ${USERS.admin.token}`)
				.send({
					user_id: 99999,
					name: TIMEZONE.name,
					city: TIMEZONE.city
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

	describe('/GET admin/user/timezones', () => {
		it('it should return user timezones', (done) => {
			chai.request(app)
				.get('/admin/user/timezones')
				.query({ user_id: USERS.user.id })
				.set('authorization', `Bearer ${USERS.admin.token}`)
				.end((err, res) => {
					should.not.exist(err);
					res.body.should.have.length(1);
					res.body[0].should.be.an('object');
					res.body[0].should.have.property('name');
					res.body[0].should.have.property('city');
					res.body[0].should.have.property('timezone');
					res.body[0].should.have.property('current_time');
					res.body[0].should.have.property('offset');
					res.body[0].name.should.equal(TIMEZONE.name);
					res.body[0].city.should.equal(TIMEZONE.city);
					res.body[0].timezone.should.equal('America/New_York');
					res.body[0].offset.should.equal('-5:00');
					done();
				});
		});

		it('it should return 401 if token is not given', (done) => {
			chai.request(app)
				.get('/admin/user/timezones')
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
				.get('/admin/user/timezones')
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

		it('it should return 401 if token is for user', (done) => {
			chai.request(app)
				.get('/admin/user/timezones')
				.query({ user_id: USERS.user.id })
				.set('authorization', `Bearer ${USERS.user.token}`)
				.end((err, res) => {
					should.not.exist(err);
					res.should.have.status(401);
					res.body.should.be.an('object');
					res.body.should.have.property('message');
					res.body.message.should.equal('Invalid token');
					done();
				});
		});

		it('it should return 400 if user not found', (done) => {
			chai.request(app)
				.get('/admin/user/timezones')
				.query({ user_id: 9999 })
				.set('authorization', `Bearer ${USERS.admin.token}`)
				.end((err, res) => {
					should.not.exist(err);
					res.should.have.status(400);
					res.body.should.be.an('object');
					res.body.should.have.property('message');
					res.body.message.should.equal('User not found');
					done();
				});
		});

		it('it should return 400 if user_id not given', (done) => {
			chai.request(app)
				.get('/admin/user/timezones')
				.set('authorization', `Bearer ${USERS.admin.token}`)
				.end((err, res) => {
					should.not.exist(err);
					res.should.have.status(400);
					res.body.should.be.an('object');
					res.body.should.have.property('message');
					res.body.message.should.equal('"user_id" is required');
					done();
				});
		});
	});

	describe('/GET admin/users', () => {
		it('it should return users', (done) => {
			chai.request(app)
				.get('/admin/users')
				.set('authorization', `Bearer ${USERS.admin.token}`)
				.end((err, res) => {
					should.not.exist(err);
					res.should.have.status(200);

					res.body.should.have.length(2);

					res.body[0].should.be.an('object');
					res.body[0].should.have.property('id');
					res.body[0].should.have.property('email');
					res.body[0].should.have.property('role');
					res.body[0].should.have.property('created_at');
					res.body[0].should.have.property('updated_at');
					res.body[0].should.not.have.property('password');
					res.body[0].id.should.equal(USERS.admin.id);
					res.body[0].email.should.equal(USERS.admin.email);
					res.body[0].role.should.equal('admin');


					res.body[1].should.be.an('object');
					res.body[1].should.have.property('id');
					res.body[1].should.have.property('email');
					res.body[1].should.have.property('role');
					res.body[1].should.have.property('created_at');
					res.body[1].should.have.property('updated_at');
					res.body[1].should.not.have.property('password');
					res.body[1].id.should.equal(USERS.user.id);
					res.body[1].email.should.equal(USERS.user.email);
					res.body[1].role.should.equal('user');
					done();
				});
		});

		it('it should only return admin users', (done) => {
			chai.request(app)
				.get('/admin/users')
				.query({ role: 'admin' })
				.set('authorization', `Bearer ${USERS.admin.token}`)
				.end((err, res) => {
					should.not.exist(err);
					res.should.have.status(200);

					res.body.should.have.length(1);

					res.body[0].should.be.an('object');
					res.body[0].should.have.property('id');
					res.body[0].should.have.property('email');
					res.body[0].should.have.property('role');
					res.body[0].should.have.property('created_at');
					res.body[0].should.have.property('updated_at');
					res.body[0].should.not.have.property('password');
					res.body[0].id.should.equal(USERS.admin.id);
					res.body[0].email.should.equal(USERS.admin.email);
					res.body[0].role.should.equal('admin');
					done();
				});
		});

		it('it should return 401 if token is not given', (done) => {
			chai.request(app)
				.get('/admin/users')
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
				.get('/admin/users')
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

		it('it should return 401 if token is for user', (done) => {
			chai.request(app)
				.get('/admin/users')
				.set('authorization', `Bearer ${USERS.user.token}`)
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

	describe('/PUT admin/user/timezone', () => {
		it('it should return updated timezone for user', (done) => {
			chai.request(app)
				.put('/admin/user/timezone')
				.set('authorization', `Bearer ${USERS.admin.token}`)
				.send({ user_id: USERS.user.id, name: TIMEZONE.name, updated_name: 'updated name', updated_city: 'Los Angeles', country: 'US'})
				.end((err, res) => {
					should.not.exist(err);
					res.should.have.status(200);
					res.body.should.be.an('object');
					res.body.should.have.property('user_id');
					res.body.should.have.property('city');
					res.body.should.have.property('name');
					res.body.should.have.property('timezone');
					res.body.should.have.property('offset');
					res.body.user_id.should.equal(USERS.user.id);
					res.body.city.should.equal('los angeles');
					res.body.name.should.equal('updated name');
					res.body.timezone.should.equal('America/Los_Angeles');
					res.body.offset.should.equal('-8:00');

					TIMEZONE.name = res.body.name;
					TIMEZONE.city = res.body.city;
					done();
				});
		});

		it('it should return 400 if all data is the same', (done) => {
			chai.request(app)
				.put('/admin/user/timezone')
				.set('authorization', `Bearer ${USERS.admin.token}`)
				.send({ user_id: USERS.user.id, name: TIMEZONE.name, updated_name: TIMEZONE.name, updated_city: TIMEZONE.city, country: 'US'})
				.end((err, res) => {
					should.not.exist(err);
					res.should.have.status(400);
					res.body.should.be.an('object');
					res.body.should.have.property('message');
					res.body.message.should.equal('No fields to update');
					done();
				});
		});

		it('it should return 400 if city is invalid', (done) => {
			chai.request(app)
				.put('/admin/user/timezone')
				.set('authorization', `Bearer ${USERS.admin.token}`)
				.send({ user_id: USERS.user.id, name: TIMEZONE.name, updated_name: 'another name', updated_city: 'nope', country: 'US'})
				.end((err, res) => {
					should.not.exist(err);
					res.should.have.status(400);
					res.body.should.be.an('object');
					res.body.should.have.property('message');
					res.body.message.should.equal('Invalid city');
					done();
				});
		});

		it('it should return 400 if timezone with name is not found', (done) => {
			chai.request(app)
				.put('/admin/user/timezone')
				.set('authorization', `Bearer ${USERS.admin.token}`)
				.send({ user_id: USERS.user.id, name: 'nope', updated_name: 'another name', updated_city: 'Los Angeles', country: 'US'})
				.end((err, res) => {
					should.not.exist(err);
					res.should.have.status(400);
					res.body.should.be.an('object');
					res.body.should.have.property('message');
					res.body.message.should.equal('Timezone not found');
					done();
				});
		});

		it('it should return 401 if token is not given', (done) => {
			chai.request(app)
				.put('/admin/user/timezone')
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
				.put('/admin/user/timezone')
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

		it('it should return 400 if user not found', (done) => {
			chai.request(app)
				.put('/admin/user/timezone')
				.set('authorization', `Bearer ${USERS.admin.token}`)
				.send({ user_id: 99999, name: TIMEZONE.name, updated_name: TIMEZONE.name, updated_city: TIMEZONE.city, country: 'US'})
				.end((err, res) => {
					should.not.exist(err);
					res.should.have.status(400);
					res.body.should.be.an('object');
					res.body.should.have.property('message');
					res.body.message.should.equal('User not found');
					done();
				});
		});

		it('it should return 400 if timezone does not belong to user', (done) => {
			chai.request(app)
				.put('/admin/user/timezone')
				.set('authorization', `Bearer ${USERS.admin.token}`)
				.send({ user_id: USERS.admin.id, name: TIMEZONE.name, updated_name: TIMEZONE.name, updated_city: TIMEZONE.city, country: 'US'})
				.end((err, res) => {
					should.not.exist(err);
					res.should.have.status(400);
					res.body.should.be.an('object');
					res.body.should.have.property('message');
					res.body.message.should.equal('Timezone not found');
					done();
				});
		});

		it('it should return 401 if token is for user', (done) => {
			chai.request(app)
				.put('/admin/user/timezone')
				.set('authorization', `Bearer ${USERS.user.token}`)
				.send({ user_id: USERS.user.token, name: TIMEZONE.name, updated_name: TIMEZONE.name, updated_city: TIMEZONE.city, country: 'US'})
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

	describe('/DELETE admin/user/timezone', () => {
		it('it should return 400 if timezone does not belong to user', (done) => {
			chai.request(app)
				.delete('/admin/user/timezone')
				.set('authorization', `Bearer ${USERS.admin.token}`)
				.send({ user_id: USERS.admin.id, name: TIMEZONE.name })
				.end((err, res) => {
					should.not.exist(err);
					res.should.have.status(400);
					res.body.should.be.an('object');
					res.body.should.have.property('message');
					res.body.message.should.equal('Timezone not found');
					done();
				});
		});

		it('it should return user deleted timezone', (done) => {
			chai.request(app)
				.delete('/admin/user/timezone')
				.set('authorization', `Bearer ${USERS.admin.token}`)
				.send({ user_id: USERS.user.id, name: TIMEZONE.name })
				.end((err, res) => {
					should.not.exist(err);
					res.should.have.status(200);
					res.body.should.be.an('object');
					res.body.should.have.property('user_id');
					res.body.should.have.property('city');
					res.body.should.have.property('name');
					res.body.should.have.property('timezone');
					res.body.should.have.property('offset');
					res.body.user_id.should.equal(USERS.user.id);
					res.body.city.should.equal(TIMEZONE.city);
					res.body.name.should.equal(TIMEZONE.name);
					res.body.timezone.should.equal('America/Los_Angeles');
					res.body.offset.should.equal('-8:00');
					done();
				});
		});

		it('it should return 401 if token is not given', (done) => {
			chai.request(app)
				.delete('/admin/user/timezone')
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
				.delete('/admin/user/timezone')
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

		it('it should return 400 if user not found', (done) => {
			chai.request(app)
				.delete('/admin/user/timezone')
				.set('authorization', `Bearer ${USERS.admin.token}`)
				.send({ user_id: 99999, name: TIMEZONE.name })
				.end((err, res) => {
					should.not.exist(err);
					res.should.have.status(400);
					res.body.should.be.an('object');
					res.body.should.have.property('message');
					res.body.message.should.equal('User not found');
					done();
				});
		});

		it('it should return 401 if token is for user', (done) => {
			chai.request(app)
				.delete('/admin/user/timezone')
				.set('authorization', `Bearer ${USERS.user.token}`)
				.send({ user_id: USERS.user.id, name: TIMEZONE.name })
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

	describe('/PUT admin/user/role', () => {
		it('it should return updated user role', (done) => {
			chai.request(app)
				.put('/admin/user/role')
				.set('authorization', `Bearer ${USERS.admin.token}`)
				.send({ user_id: USERS.user.id, role: 'admin' })
				.end((err, res) => {
					should.not.exist(err);
					res.should.have.status(200);
					res.body.should.be.an('object');
					res.body.should.have.property('id');
					res.body.should.have.property('email');
					res.body.should.have.property('role');
					res.body.should.have.property('created_at');
					res.body.should.have.property('updated_at');
					res.body.should.not.have.property('password');
					res.body.id.should.equal(USERS.user.id);
					res.body.email.should.equal(USERS.user.email);
					res.body.role.should.equal('admin');
					done();
				});
		});

		it('it should return 401 if token is not given', (done) => {
			chai.request(app)
				.put('/admin/user/role')
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
				.put('/admin/user/role')
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

		it('it should return 400 if user not found', (done) => {
			chai.request(app)
				.put('/admin/user/role')
				.set('authorization', `Bearer ${USERS.admin.token}`)
				.send({ user_id: 99999, role: 'admin' })
				.end((err, res) => {
					should.not.exist(err);
					res.should.have.status(400);
					res.body.should.be.an('object');
					res.body.should.have.property('message');
					res.body.message.should.equal('User not found');
					done();
				});
		});

		it('it should return 401 if token is for user', (done) => {
			chai.request(app)
				.put('/admin/user/role')
				.set('authorization', `Bearer ${USERS.user.token}`)
				.send({ user_id: USERS.user.id, role: 'admin' })
				.end((err, res) => {
					should.not.exist(err);
					res.should.have.status(401);
					res.body.should.be.an('object');
					res.body.should.have.property('message');
					res.body.message.should.equal('Invalid token');
					done();
				});
		});

		it('it should return 400 if user already has role', (done) => {
			chai.request(app)
				.put('/admin/user/role')
				.set('authorization', `Bearer ${USERS.admin.token}`)
				.send({ user_id: USERS.user.id, role: 'admin' })
				.end((err, res) => {
					should.not.exist(err);
					res.should.have.status(400);
					res.body.should.be.an('object');
					res.body.should.have.property('message');
					res.body.message.should.equal('User already has role admin');
					done();
				});
		});

		it('it should return 400 if invalid role is given', (done) => {
			chai.request(app)
				.put('/admin/user/role')
				.set('authorization', `Bearer ${USERS.admin.token}`)
				.send({ user_id: USERS.user.id, role: 'nope' })
				.end((err, res) => {
					should.not.exist(err);
					res.should.have.status(400);
					res.body.should.be.an('object');
					res.body.should.have.property('message');
					res.body.message.should.equal('"role" must be one of [admin, user]');
					done();
				});
		});

		it('it should return 400 if user id is 1', (done) => {
			chai.request(app)
				.put('/admin/user/role')
				.set('authorization', `Bearer ${USERS.admin.token}`)
				.send({ user_id: 1, role: 'user' })
				.end((err, res) => {
					should.not.exist(err);
					res.should.have.status(400);
					res.body.should.be.an('object');
					res.body.should.have.property('message');
					res.body.message.should.equal('Cannot update master admin role');
					done();
				});
		});
	});

	describe('/GET admin/user', () => {
		it('it should return user', (done) => {
			chai.request(app)
				.get('/admin/user')
				.query({ user_id: USERS.user.id })
				.set('authorization', `Bearer ${USERS.admin.token}`)
				.end((err, res) => {
					should.not.exist(err);
					res.should.have.status(200);
					res.body.should.be.an('object');
					res.body.should.have.property('id');
					res.body.should.have.property('email');
					res.body.should.have.property('role');
					res.body.should.have.property('created_at');
					res.body.should.have.property('updated_at');
					res.body.should.not.have.property('password');
					res.body.id.should.equal(USERS.user.id);
					res.body.email.should.equal(USERS.user.email);
					res.body.role.should.equal('admin');
					done();
				});
		});

		it('it should return 401 if token is not given', (done) => {
			chai.request(app)
				.get('/admin/user')
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
				.get('/admin/user')
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

		it('it should return 401 if token is for user', (done) => {
			chai.request(app)
				.get('/admin/user')
				.query({ user_id: USERS.user.id })
				.set('authorization', `Bearer ${USERS.user.token}`)
				.end((err, res) => {
					should.not.exist(err);
					res.should.have.status(401);
					res.body.should.be.an('object');
					res.body.should.have.property('message');
					res.body.message.should.equal('Invalid token');
					done();
				});
		});

		it('it should return 400 if user not found', (done) => {
			chai.request(app)
				.get('/admin/user')
				.query({ user_id: 9999 })
				.set('authorization', `Bearer ${USERS.admin.token}`)
				.end((err, res) => {
					should.not.exist(err);
					res.should.have.status(400);
					res.body.should.be.an('object');
					res.body.should.have.property('message');
					res.body.message.should.equal('User not found');
					done();
				});
		});

		it('it should return 400 if user_id not given', (done) => {
			chai.request(app)
				.get('/admin/user')
				.set('authorization', `Bearer ${USERS.admin.token}`)
				.end((err, res) => {
					should.not.exist(err);
					res.should.have.status(400);
					res.body.should.be.an('object');
					res.body.should.have.property('message');
					res.body.message.should.equal('"user_id" is required');
					done();
				});
		});
	});

	describe('/DELETE admin/user', () => {
		it('it should return user deleted timezone', (done) => {
			chai.request(app)
				.delete('/admin/user')
				.set('authorization', `Bearer ${USERS.admin.token}`)
				.send({ user_id: USERS.user.id })
				.end((err, res) => {
					should.not.exist(err);
					res.should.have.status(200);
					res.body.should.be.an('object');
					res.body.should.have.property('id');
					res.body.should.have.property('email');
					res.body.should.have.property('role');
					res.body.should.have.property('created_at');
					res.body.should.have.property('updated_at');
					res.body.should.not.have.property('password');
					res.body.id.should.equal(USERS.user.id);
					res.body.email.should.equal(USERS.user.email);
					res.body.role.should.equal('admin');
					done();
				});
		});

		it('it should return 401 if token is not given', (done) => {
			chai.request(app)
				.delete('/admin/user')
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
				.delete('/admin/user')
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

		it('it should return 400 if user not found', (done) => {
			chai.request(app)
				.delete('/admin/user')
				.set('authorization', `Bearer ${USERS.admin.token}`)
				.send({ user_id: 99999 })
				.end((err, res) => {
					should.not.exist(err);
					res.should.have.status(400);
					res.body.should.be.an('object');
					res.body.should.have.property('message');
					res.body.message.should.equal('User not found');
					done();
				});
		});

		it('it should return 401 if token is for user', (done) => {
			chai.request(app)
				.delete('/admin/user')
				.set('authorization', `Bearer ${USERS.user.token}`)
				.send({ user_id: USERS.user.id })
				.end((err, res) => {
					should.not.exist(err);
					res.should.have.status(401);
					res.body.should.be.an('object');
					res.body.should.have.property('message');
					res.body.message.should.equal('Invalid token');
					done();
				});
		});

		it('it should return 400 if user id 1 is given', (done) => {
			chai.request(app)
				.delete('/admin/user')
				.set('authorization', `Bearer ${USERS.admin.token}`)
				.send({ user_id: 1 })
				.end((err, res) => {
					should.not.exist(err);
					res.should.have.status(400);
					res.body.should.be.an('object');
					res.body.should.have.property('message');
					res.body.message.should.equal('Cannot delete master admin');
					done();
				});
		});
	});

	describe('/POST admin/user', () => {
		it('it should create a new user', (done) => {
			chai.request(app)
				.post('/admin/user')
				.set('authorization', `Bearer ${USERS.admin.token}`)
				.send({ email: USERS.user.email, password: USERS.user.password, password_confirmation: USERS.user.password })
				.end((err, res) => {
					should.not.exist(err);
					res.should.have.status(201);
					res.body.should.be.an('object');
					res.body.should.have.property('id');
					res.body.should.have.property('email');
					res.body.should.have.property('role');
					res.body.should.have.property('created_at');
					res.body.should.have.property('updated_at');
					res.body.should.not.have.property('password');
					res.body.email.should.equal(USERS.user.email);
					res.body.role.should.equal('user');
					done();
				});
		});

		it('it should return 401 if token is not given', (done) => {
			chai.request(app)
				.post('/admin/user')
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
				.post('/admin/user')
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

		it('it should return 400 if user already exists', (done) => {
			chai.request(app)
				.post('/admin/user')
				.set('authorization', `Bearer ${USERS.admin.token}`)
				.send({ email: USERS.user.email, password: USERS.user.password, password_confirmation: USERS.user.password })
				.end((err, res) => {
					should.not.exist(err);
					res.should.have.status(400);
					res.body.should.be.an('object');
					res.body.should.have.property('message');
					res.body.message.should.equal(`User ${USERS.user.email} already exists`);
					done();
				});
		});

		it('it should return 401 if token is for user', (done) => {
			chai.request(app)
				.post('/admin/user')
				.set('authorization', `Bearer ${USERS.user.token}`)
				.send({ email: USERS.user.email, password: USERS.user.password, password_confirmation: USERS.user.password })
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