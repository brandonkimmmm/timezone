import chai, { expect } from 'chai';
import faker from 'faker';
import { create } from '../../src/api/models/user';
import { truncate } from '../utils/db';
import {
	createTimezone,
	getUserTimezone,
	getUserTimezones,
	updateUserTimezone,
	deleteUserTimezone
} from '../../src/api/models/timezone';

const should = chai.should();

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
	city: 'new york',
	name: 'my city new york'
};

describe('Timezone model', () => {
	before(async () => {
		await truncate();
		const user = await create(USERS.user.email, USERS.user.password);
		USERS.user = {
			...USERS.user,
			...user.toJSON()
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
			timezone.should.be.an('object');
			timezone.should.have.property('user_id');
			timezone.should.have.property('timezone');
			timezone.should.have.property('city');
			timezone.should.have.property('name');
			timezone.should.have.property('offset');
			// timezone.user_id.should.equal(USERS.user.id);
			timezone.timezone.should.equal('America/New_York');
			timezone.city.should.equal(TIMEZONES.city.toLowerCase());
			timezone.name.should.equal(TIMEZONES.name.toLowerCase());
			timezone.offset.should.equal('-5:00');
		});

		it('it should throw an error if timezone name exists', async () => {
			try {
				await createTimezone(USERS.user.id, TIMEZONES.name, TIMEZONES.city);
				expect(true, 'promise should fail').eq(false);
			} catch (err) {
				expect(err instanceof Error ? err.message : '').to.eql('Timezone with name already exists for user');
			}
		});

		it('it should throw an error if invalid city is given', async () => {
			try {
				await createTimezone(USERS.user.id, TIMEZONES.name, 'nope');
				expect(true, 'promise should fail').eq(false);
			} catch (err) {
				expect(err instanceof Error ? err.message : '').to.eql('Invalid city');
			}
		});

		it('it should throw an error if user does not exist', async () => {
			try {
				await createTimezone(9999999, TIMEZONES.name, TIMEZONES.city);
				expect(true, 'promise should fail').eq(false);
			} catch (err) {
				expect(err instanceof Error ? err.message : '').to.eql('User not found');
			}
		});
	});

	describe('Timezone get', () => {
		it('it should get a timezone for user', async () => {
			const timezone = await getUserTimezone(USERS.user.id, TIMEZONES.name);

			timezone.should.be.an('object');
			timezone.should.have.property('user_id');
			timezone.should.have.property('timezone');
			timezone.should.have.property('city');
			timezone.should.have.property('name');
			timezone.should.have.property('offset');
			// timezone.user_id.should.equal(USERS.user.id);
			timezone.timezone.should.equal('America/New_York');
			timezone.city.should.equal(TIMEZONES.city.toLowerCase());
			timezone.name.should.equal(TIMEZONES.name.toLowerCase());
			timezone.offset.should.equal('-5:00');
		});

		it('it should throw an error if user does not exist', async () => {
			try {
				await getUserTimezone(9999999, TIMEZONES.name);
				expect(true, 'promise should fail').eq(false);
			} catch (err) {
				expect(err instanceof Error ? err.message : '').to.eql('User not found');
			}
		});

		it('it should return null if timezone does not exist', async () => {
			const timezone = await getUserTimezone(USERS.user.id, 'nope');
			should.not.exist(timezone);
		});
	});

	describe('Timezone get all', () => {
		it('it should get all timezones for user', async () => {
			const timezone = await getUserTimezones(USERS.user.id);

			timezone.should.be.an('array');
			timezone.should.have.length(1);
			timezone[0].should.have.property('user_id');
			timezone[0].should.have.property('timezone');
			timezone[0].should.have.property('city');
			timezone[0].should.have.property('name');
			timezone[0].should.have.property('offset');
			// timezone[0].user_id.should.equal(USERS.user.id);
			timezone[0].timezone.should.equal('America/New_York');
			timezone[0].city.should.equal(TIMEZONES.city.toLowerCase());
			timezone[0].name.should.equal(TIMEZONES.name.toLowerCase());
			timezone[0].offset.should.equal('-5:00');
		});

		it('it should throw an error if user does not exist', async () => {
			try {
				await getUserTimezones(9999999);
				expect(true, 'promise should fail').eq(false);
			} catch (err) {
				expect(err instanceof Error ? err.message : '').to.eql('User not found');
			}
		});
	});

	describe('Timezone update', () => {
		it('it should update an existing timezone for user', async () => {
			const timezone = await updateUserTimezone(USERS.user.id, TIMEZONES.name, { updated_name: 'updated name', updated_city: 'Los Angeles', country: 'US' });

			timezone.should.be.an('object');
			timezone.should.have.property('dataValues');
			timezone.should.be.an('object');
			timezone.should.have.property('user_id');
			timezone.should.have.property('timezone');
			timezone.should.have.property('city');
			timezone.should.have.property('name');
			timezone.should.have.property('offset');
			// timezone.user_id.should.equal(USERS.user.id);
			timezone.timezone.should.equal('America/Los_Angeles');
			timezone.city.should.equal('los angeles');
			timezone.name.should.equal('updated name');
			timezone.offset.should.equal('-8:00');

			TIMEZONES.name = timezone.name;
			TIMEZONES.city = timezone.city;
		});

		it('it should throw an error if user does not exist', async () => {
			try {
				await updateUserTimezone(9999999, 'updated name', { updated_name: 'updated name', updated_city: 'Los Angeles'});
				expect(true, 'promise should fail').eq(false);
			} catch (err) {
				expect(err instanceof Error ? err.message : '').to.eql('User not found');
			}
		});

		it('it should throw an error if update data not given', async () => {
			try {
				await updateUserTimezone(USERS.user.id, 'updated name', { });
				expect(true, 'promise should fail').eq(false);
			} catch (err) {
				expect(err instanceof Error ? err.message : '').to.eql('No fields to update');
			}
		});

		it('it should throw an error if name and city are the same', async () => {
			try {
				await updateUserTimezone(USERS.user.id, 'updated name', { updated_name: TIMEZONES.name, updated_city: TIMEZONES.city, country: 'US' });
				expect(true, 'promise should fail').eq(false);
			} catch (err) {
				expect(err instanceof Error ? err.message : '').to.eql('No fields to update');
			}
		});
	});

	describe('Timezone delete', () => {
		it('it should delete an existing timezone for user', async () => {
			const timezone = await deleteUserTimezone(USERS.user.id, TIMEZONES.name);

			timezone.should.be.an('object');
			timezone.should.have.property('dataValues');
			timezone.should.be.an('object');
			timezone.should.have.property('user_id');
			timezone.should.have.property('timezone');
			timezone.should.have.property('city');
			timezone.should.have.property('name');
			timezone.should.have.property('offset');
			// timezone.user_id.should.equal(USERS.user.id);
			timezone.timezone.should.equal('America/Los_Angeles');
			timezone.city.should.equal('los angeles');
			timezone.name.should.equal('updated name');
			timezone.offset.should.equal('-8:00');

			const deletedTimezone = await getUserTimezone(USERS.user.id, TIMEZONES.name);

			should.not.exist(deletedTimezone);
		});

		it('it should throw an error if user does not exist', async () => {
			try {
				await deleteUserTimezone(9999999, TIMEZONES.name);
				expect(true, 'promise should fail').eq(false);
			} catch (err) {
				expect(err instanceof Error ? err.message : '').to.eql('User not found');
			}
		});

		it('it should throw an error if timezone not found', async () => {
			try {
				await deleteUserTimezone(USERS.user.id, 'nope');
				expect(true, 'promise should fail').eq(false);
			} catch (err) {
				expect(err instanceof Error ? err.message : '').to.eql('Timezone not found');
			}
		});
	});
});