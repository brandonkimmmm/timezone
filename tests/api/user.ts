import chai from 'chai';
import chaiHttp from 'chai-http';
import app from '../../src/app';
import faker from 'faker';
import { create } from '../../src/api/models/user';
import { signToken } from '../../src/utils/jwt';
import { truncate } from '../utils/db';

const should = chai.should();

chai.use(chaiHttp);

const USERS = {
	user: {
		id: 0,
		email: faker.internet.exampleEmail().toLowerCase(),
		password: faker.internet.password(10, false, /^[a-zA-Z0-9]$/),
		role: 'user',
		token: ''
	},
	admin: {
		id: 0,
		email: faker.internet.exampleEmail().toLowerCase(),
		password: faker.internet.password(10, false, /^[a-zA-Z0-9]$/),
		role: 'admin',
		token: ''
	}
};

const TIMEZONES = {
	city: 'New York',
	name: 'My city new york'
};

describe('User endpoints', () => {

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

	describe('/POST user/timezone', () => {
		it('it should create a timezone', (done) => {
			chai.request(app)
				.post('/user/timezone')
				.set('authorization', `Bearer ${USERS.user.token}`)
				.send({
					name: TIMEZONES.name,
					city: TIMEZONES.city
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
					res.body.city.should.equal(TIMEZONES.city.toLowerCase());
					res.body.name.should.equal(TIMEZONES.name.toLowerCase());
					res.body.timezone.should.equal('America/New_York');
					res.body.offset.should.equal('-5:00');
					done();
				});
		});

		it('it should return 401 if token is not given', (done) => {
			chai.request(app)
				.post('/user/timezone')
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
				.post('/user/timezone')
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

		it('it should return 400 if invalid city is given', (done) => {
			chai.request(app)
				.post('/user/timezone')
				.set('authorization', `Bearer ${USERS.user.token}`)
				.send({
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
				.post('/user/timezone')
				.set('authorization', `Bearer ${USERS.user.token}`)
				.send({
					name: TIMEZONES.name,
					city: TIMEZONES.city
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
					res.body.should.have.length(1);
					res.body[0].should.be.an('object');
					res.body[0].should.have.property('name');
					res.body[0].should.have.property('city');
					res.body[0].should.have.property('timezone');
					res.body[0].should.have.property('current_time');
					res.body[0].should.have.property('offset');
					res.body[0].name.should.equal(TIMEZONES.name.toLowerCase());
					res.body[0].city.should.equal(TIMEZONES.city.toLowerCase());
					res.body[0].timezone.should.equal('America/New_York');
					res.body[0].offset.should.equal('-5:00');
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

	describe('/PUT user/timezone', () => {
		it('it should return updated timezone', (done) => {
			chai.request(app)
				.put('/user/timezone')
				.set('authorization', `Bearer ${USERS.user.token}`)
				.send({ name: TIMEZONES.name, updated_name: 'updated name', updated_city: 'Los Angeles', country: 'US'})
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

					TIMEZONES.name = res.body.name;
					TIMEZONES.city = res.body.city;
					done();
				});
		});

		it('it should return 400 if all data is the same', (done) => {
			chai.request(app)
				.put('/user/timezone')
				.set('authorization', `Bearer ${USERS.user.token}`)
				.send({ name: TIMEZONES.name, updated_name: TIMEZONES.name, updated_city: TIMEZONES.city, country: 'US'})
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
				.put('/user/timezone')
				.set('authorization', `Bearer ${USERS.user.token}`)
				.send({ name: TIMEZONES.name, updated_name: 'another name', updated_city: 'nope', country: 'US'})
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
				.put('/user/timezone')
				.set('authorization', `Bearer ${USERS.user.token}`)
				.send({ name: 'nope', updated_name: 'another name', updated_city: 'Los Angeles', country: 'US'})
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
				.put('/user/timezone')
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
				.put('/user/timezone')
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

	describe('/DELETE user/timezone', () => {
		it('it should return deleted timezone', (done) => {
			chai.request(app)
				.delete('/user/timezone')
				.set('authorization', `Bearer ${USERS.user.token}`)
				.send({ name: TIMEZONES.name })
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
					res.body.city.should.equal(TIMEZONES.city);
					res.body.name.should.equal(TIMEZONES.name);
					res.body.timezone.should.equal('America/Los_Angeles');
					res.body.offset.should.equal('-8:00');
					done();
				});
		});

		it('it should return 400 if timezone does not exist', (done) => {
			chai.request(app)
				.delete('/user/timezone')
				.set('authorization', `Bearer ${USERS.user.token}`)
				.send({ name: 'nope' })
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
				.delete('/user/timezone')
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
				.put('/user/timezone')
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