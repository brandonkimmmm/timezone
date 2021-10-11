const chai = require('chai');
const chaiHttp = require('chai-http');
const app = require('../../app');
const should = chai.should();
const faker = require('faker');
const { truncate } = require('../utils/db');
const { create } = require('../../api/models/user');
const { signToken } = require('../../utils/jwt');

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
					res.body.offset.should.equal('-4:00');
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
					res.body[0].offset.should.equal('-4:00');
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
});
