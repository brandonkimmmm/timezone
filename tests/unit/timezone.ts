import chai, { expect } from 'chai';
import { create } from '../../src/api/models/user';
import { truncate } from '../utils/db';
import {
	createTimezone,
	getUserTimezone,
	getUserTimezones,
	updateUserTimezone,
	deleteUserTimezone
} from '../../src/api/models/timezone';
import { getMockUser } from '../utils/mock';

const should = chai.should();

const USER = getMockUser();

const TIMEZONE = {
	city: 'new york',
	name: 'my city new york'
};

describe('Timezone model', () => {
	before(async () => {
		await truncate();
		const user = await create(USER.email, USER.password);
		USER.id = user.id;
	});

	after(async () => {
		await truncate();
	});

	describe('Timezone create', () => {
		it('it should create a timezone for user', async () => {
			const timezone = await createTimezone(USER.id, TIMEZONE.name, TIMEZONE.city);

			timezone.should.be.an('object');
			timezone.should.have.property('dataValues');
			timezone.should.be.an('object');
			timezone.should.have.property('user_id');
			timezone.should.have.property('timezone');
			timezone.should.have.property('city');
			timezone.should.have.property('name');
			timezone.should.have.property('offset');
			// timezone.user_id.should.equal(USER.id);
			timezone.timezone.should.equal('America/New_York');
			timezone.city.should.equal(TIMEZONE.city);
			timezone.name.should.equal(TIMEZONE.name);
			timezone.offset.should.equal('-5:00');
		});

		it('it should throw an error if timezone name exists', async () => {
			try {
				await createTimezone(USER.id, TIMEZONE.name, TIMEZONE.city);
				expect(true, 'promise should fail').eq(false);
			} catch (err) {
				expect(err instanceof Error ? err.message : '').to.eql('Timezone with name already exists for user');
			}
		});

		it('it should throw an error if invalid city is given', async () => {
			try {
				await createTimezone(USER.id, TIMEZONE.name, 'nope');
				expect(true, 'promise should fail').eq(false);
			} catch (err) {
				expect(err instanceof Error ? err.message : '').to.eql('Invalid city');
			}
		});

		it('it should throw an error if user does not exist', async () => {
			try {
				await createTimezone(9999999, TIMEZONE.name, TIMEZONE.city);
				expect(true, 'promise should fail').eq(false);
			} catch (err) {
				expect(err instanceof Error ? err.message : '').to.eql('User not found');
			}
		});
	});

	describe('Timezone get', () => {
		it('it should get a timezone for user', async () => {
			const timezone = await getUserTimezone(USER.id, TIMEZONE.name);

			timezone.should.be.an('object');
			timezone.should.have.property('user_id');
			timezone.should.have.property('timezone');
			timezone.should.have.property('city');
			timezone.should.have.property('name');
			timezone.should.have.property('offset');
			// timezone.user_id.should.equal(USER.id);
			timezone.timezone.should.equal('America/New_York');
			timezone.city.should.equal(TIMEZONE.city);
			timezone.name.should.equal(TIMEZONE.name);
			timezone.offset.should.equal('-5:00');
		});

		it('it should throw an error if user does not exist', async () => {
			try {
				await getUserTimezone(9999999, TIMEZONE.name);
				expect(true, 'promise should fail').eq(false);
			} catch (err) {
				expect(err instanceof Error ? err.message : '').to.eql('User not found');
			}
		});

		it('it should return null if timezone does not exist', async () => {
			const timezone = await getUserTimezone(USER.id, 'nope');
			should.not.exist(timezone);
		});
	});

	describe('Timezone get all', () => {
		it('it should get all TIMEZONE for user', async () => {
			const timezone = await getUserTimezones(USER.id);

			timezone.should.be.an('array');
			timezone.should.have.length(1);
			timezone[0].should.have.property('user_id');
			timezone[0].should.have.property('timezone');
			timezone[0].should.have.property('city');
			timezone[0].should.have.property('name');
			timezone[0].should.have.property('offset');
			// timezone[0].user_id.should.equal(USER.id);
			timezone[0].timezone.should.equal('America/New_York');
			timezone[0].city.should.equal(TIMEZONE.city);
			timezone[0].name.should.equal(TIMEZONE.name);
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
			const timezone = await updateUserTimezone(USER.id, TIMEZONE.name, { updated_name: 'updated name', updated_city: 'Los Angeles', country: 'US' });

			timezone.should.be.an('object');
			timezone.should.have.property('dataValues');
			timezone.should.be.an('object');
			timezone.should.have.property('user_id');
			timezone.should.have.property('timezone');
			timezone.should.have.property('city');
			timezone.should.have.property('name');
			timezone.should.have.property('offset');
			// timezone.user_id.should.equal(USER.id);
			timezone.timezone.should.equal('America/Los_Angeles');
			timezone.city.should.equal('los angeles');
			timezone.name.should.equal('updated name');
			timezone.offset.should.equal('-8:00');

			TIMEZONE.name = timezone.name;
			TIMEZONE.city = timezone.city;
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
				await updateUserTimezone(USER.id, 'updated name', { });
				expect(true, 'promise should fail').eq(false);
			} catch (err) {
				expect(err instanceof Error ? err.message : '').to.eql('No fields to update');
			}
		});

		it('it should throw an error if name and city are the same', async () => {
			try {
				await updateUserTimezone(USER.id, 'updated name', { updated_name: TIMEZONE.name, updated_city: TIMEZONE.city, country: 'US' });
				expect(true, 'promise should fail').eq(false);
			} catch (err) {
				expect(err instanceof Error ? err.message : '').to.eql('No fields to update');
			}
		});
	});

	describe('Timezone delete', () => {
		it('it should delete an existing timezone for user', async () => {
			const timezone = await deleteUserTimezone(USER.id, TIMEZONE.name);

			timezone.should.be.an('object');
			timezone.should.have.property('dataValues');
			timezone.should.be.an('object');
			timezone.should.have.property('user_id');
			timezone.should.have.property('timezone');
			timezone.should.have.property('city');
			timezone.should.have.property('name');
			timezone.should.have.property('offset');
			// timezone.user_id.should.equal(USER.id);
			timezone.timezone.should.equal('America/Los_Angeles');
			timezone.city.should.equal('los angeles');
			timezone.name.should.equal('updated name');
			timezone.offset.should.equal('-8:00');

			const deletedTimezone = await getUserTimezone(USER.id, TIMEZONE.name);

			should.not.exist(deletedTimezone);
		});

		it('it should throw an error if user does not exist', async () => {
			try {
				await deleteUserTimezone(9999999, TIMEZONE.name);
				expect(true, 'promise should fail').eq(false);
			} catch (err) {
				expect(err instanceof Error ? err.message : '').to.eql('User not found');
			}
		});

		it('it should throw an error if timezone not found', async () => {
			try {
				await deleteUserTimezone(USER.id, 'nope');
				expect(true, 'promise should fail').eq(false);
			} catch (err) {
				expect(err instanceof Error ? err.message : '').to.eql('Timezone not found');
			}
		});
	});
});