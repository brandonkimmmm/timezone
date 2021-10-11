const chai = require('chai');
const should = chai.should();
const faker = require('faker');
const { truncate } = require('../utils/db');
const { createTimezone, getUserTimezone, getUserTimezones } = require('../../api/models/timezone');
const { create } = require('../../api/models/user');
const { expect } = require('chai');

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

describe('Timezone model', () => {
	before(async () => {
		await truncate();
		const user = await create(USERS.user.email, USERS.user.password);
		USERS.user = {
			...USERS.user,
			...user.dataValues
		};
	});

	after(async () => {
		await truncate();
	});

	describe('Timezone create', () => {
		it('it should create a timezone for user', async () => {
			const timezone = await createTimezone(USERS.user.id, TIMEZONES.name, TIMEZONES.city);

			timezone.should.be.an('object');
			timezone.should.have.property('dataValues');
			timezone.dataValues.should.be.an('object');
			timezone.dataValues.should.have.property('user_id');
			timezone.dataValues.should.have.property('timezone');
			timezone.dataValues.should.have.property('city');
			timezone.dataValues.should.have.property('name');
			timezone.dataValues.should.have.property('offset');
			timezone.dataValues.user_id.should.equal(USERS.user.id);
			timezone.dataValues.timezone.should.equal('America/New_York');
			timezone.dataValues.city.should.equal(TIMEZONES.city.toLowerCase());
			timezone.dataValues.name.should.equal(TIMEZONES.name.toLowerCase());
			timezone.dataValues.offset.should.equal('-4:00');
		});

		it('it should throw an error if timezone name exists', async () => {
			try {
				await createTimezone(USERS.user.id, TIMEZONES.name, TIMEZONES.city);
				expect(true, 'promise should fail').eq(false);
			} catch (err) {
				expect(err.message).to.eql('Timezone with name already exists for user');
			}
		});

		it('it should throw an error if invalid city is given', async () => {
			try {
				await createTimezone(USERS.user.id, TIMEZONES.name, 'nope');
				expect(true, 'promise should fail').eq(false);
			} catch (err) {
				expect(err.message).to.eql('Invalid city');
			}
		});

		it('it should throw an error if user does not exist', async () => {
			try {
				await createTimezone(9999999, TIMEZONES.name, TIMEZONES.city);
				expect(true, 'promise should fail').eq(false);
			} catch (err) {
				expect(err.message).to.eql('User not found');
			}
		});
	});

	describe('Timezone get', () => {
		it('it should get a timezone for user', async () => {
			const timezone = await getUserTimezone(USERS.user.id, TIMEZONES.name, { raw: true });

			timezone.should.be.an('object');
			timezone.should.have.property('user_id');
			timezone.should.have.property('timezone');
			timezone.should.have.property('city');
			timezone.should.have.property('name');
			timezone.should.have.property('offset');
			timezone.user_id.should.equal(USERS.user.id);
			timezone.timezone.should.equal('America/New_York');
			timezone.city.should.equal(TIMEZONES.city.toLowerCase());
			timezone.name.should.equal(TIMEZONES.name.toLowerCase());
			timezone.offset.should.equal('-4:00');
		});

		it('it should throw an error if user does not exist', async () => {
			try {
				await getUserTimezone(9999999, TIMEZONES.name);
				expect(true, 'promise should fail').eq(false);
			} catch (err) {
				expect(err.message).to.eql('User not found');
			}
		});

		it('it should return null if timezone does not exist', async () => {
			const timezone = await getUserTimezone(USERS.user.id, 'nope');
			should.not.exist(timezone);
		});
	});

	describe('Timezone get all', () => {
		it('it should get all timezones for user', async () => {
			const timezone = await getUserTimezones(USERS.user.id, { raw: true });

			timezone.should.be.an('array');
			timezone.should.have.length(1);
			timezone[0].should.have.property('user_id');
			timezone[0].should.have.property('timezone');
			timezone[0].should.have.property('city');
			timezone[0].should.have.property('name');
			timezone[0].should.have.property('offset');
			timezone[0].user_id.should.equal(USERS.user.id);
			timezone[0].timezone.should.equal('America/New_York');
			timezone[0].city.should.equal(TIMEZONES.city.toLowerCase());
			timezone[0].name.should.equal(TIMEZONES.name.toLowerCase());
			timezone[0].offset.should.equal('-4:00');
		});

		it('it should throw an error if user does not exist', async () => {
			try {
				await getUserTimezones(9999999);
				expect(true, 'promise should fail').eq(false);
			} catch (err) {
				expect(err.message).to.eql('User not found');
			}
		});
	});
});