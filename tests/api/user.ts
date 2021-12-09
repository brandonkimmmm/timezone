import chai from 'chai';
import chaiHttp from 'chai-http';
import app from '../../src/app';
import { create } from '../../src/api/models/user';
import { signToken } from '../../src/utils/jwt';
import { truncate } from '../utils/db';
import { getMockUser } from '../utils/mock';

const should = chai.should();

chai.use(chaiHttp);

const USER = getMockUser();
const TIMEZONE = {
	city: 'new york',
	name: 'my city new york'
};

describe('User endpoints', () => {

	before(async () => {
		await truncate();
		const user = await create(USER.email, USER.password);
		USER.id = user.id;
		const token = await signToken(USER.id, USER.email, USER.role);
		USER.token = token;
	});

	after(async () => {
		await truncate();
	});

	describe('/GET user', () => {
		it('it should return user info', (done) => {
			chai.request(app)
				.get('/user')
				.set('authorization', `Bearer ${USER.token}`)
				.end((err, res) => {
					should.not.exist(err);
					res.should.have.status(200);
					res.body.should.be.an('object');
					res.body.should.have.property('email');
					res.body.should.have.property('id');
					res.body.should.have.property('role');
					res.body.should.not.have.property('password');
					res.body.email.should.equal(USER.email);
					res.body.role.should.equal(USER.role);
					res.body.id.should.equal(USER.id);
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
				.set('authorization', `Bearer ${USER.token}`)
				.send({
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
					res.body.user_id.should.equal(USER.id);
					res.body.city.should.equal(TIMEZONE.city);
					res.body.name.should.equal(TIMEZONE.name);
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
				.set('authorization', `Bearer ${USER.token}`)
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
				.set('authorization', `Bearer ${USER.token}`)
				.send({
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
	});

	describe('/GET user/timezones', () => {
		it('it should return timezones', (done) => {
			chai.request(app)
				.get('/user/timezones')
				.set('authorization', `Bearer ${USER.token}`)
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
					res.body[0].name.should.equal(TIMEZONE.name);
					res.body[0].city.should.equal(TIMEZONE.city);
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
				.set('authorization', `Bearer ${USER.token}`)
				.send({ name: TIMEZONE.name, updated_name: 'updated name', updated_city: 'Los Angeles', country: 'US'})
				.end((err, res) => {
					should.not.exist(err);
					res.should.have.status(200);
					res.body.should.be.an('object');
					res.body.should.have.property('user_id');
					res.body.should.have.property('city');
					res.body.should.have.property('name');
					res.body.should.have.property('timezone');
					res.body.should.have.property('offset');
					res.body.user_id.should.equal(USER.id);
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
				.put('/user/timezone')
				.set('authorization', `Bearer ${USER.token}`)
				.send({ name: TIMEZONE.name, updated_name: TIMEZONE.name, updated_city: TIMEZONE.city, country: 'US'})
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
				.set('authorization', `Bearer ${USER.token}`)
				.send({ name: TIMEZONE.name, updated_name: 'another name', updated_city: 'nope', country: 'US'})
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
				.set('authorization', `Bearer ${USER.token}`)
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
				.set('authorization', `Bearer ${USER.token}`)
				.send({ name: TIMEZONE.name })
				.end((err, res) => {
					should.not.exist(err);
					res.should.have.status(200);
					res.body.should.be.an('object');
					res.body.should.have.property('user_id');
					res.body.should.have.property('city');
					res.body.should.have.property('name');
					res.body.should.have.property('timezone');
					res.body.should.have.property('offset');
					res.body.user_id.should.equal(USER.id);
					res.body.city.should.equal(TIMEZONE.city);
					res.body.name.should.equal(TIMEZONE.name);
					res.body.timezone.should.equal('America/Los_Angeles');
					res.body.offset.should.equal('-8:00');
					done();
				});
		});

		it('it should return 400 if timezone does not exist', (done) => {
			chai.request(app)
				.delete('/user/timezone')
				.set('authorization', `Bearer ${USER.token}`)
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
