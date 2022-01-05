import { expect } from 'chai';
import { createUser } from '../../src/services/user.service';
import { truncate } from '../utils/db';
import {
	createTimezone,
	getTimezone,
	getTimezones,
	updateTimezone,
	deleteTimezone
} from '../../src/services/timezone.service';
import { getMockUser, getMockTimezone } from '../utils/mock';
import { omit } from 'lodash';

let USER = getMockUser();
let TIMEZONE = getMockTimezone();

describe('Timezone Helper Functions', () => {
	before(async () => {
		await truncate();
		const user = await createUser(USER.email, USER.password);
		USER = user.toJSON();
	});

	after(async () => {
		await truncate();
	});

	describe('#createTimezone', () => {
		it('it should create a timezone for user', async () => {
			const data = await createTimezone(
				USER.id,
				TIMEZONE.name,
				TIMEZONE.city
			);

			const timezone = data.toJSON();

			expect(timezone).to.have.all.keys(
				'id',
				'user_id',
				'timezone',
				'city',
				'name',
				'offset',
				'created_at',
				'updated_at'
			);

			expect(timezone).to.include({
				id: 1,
				user_id: USER.id,
				city: TIMEZONE.city,
				name: TIMEZONE.name,
				offset: '-5:00',
				timezone: 'America/New_York'
			});

			TIMEZONE = timezone;
		});

		it('it should throw an error if timezone name exists', async () => {
			try {
				await createTimezone(USER.id, TIMEZONE.name, TIMEZONE.city);
				expect(true, 'promise should fail').eq(false);
			} catch (err) {
				expect(err instanceof Error ? err.message : '').to.eql(
					'Timezone with name already exists for user'
				);
			}
		});

		it('it should throw an error if invalid city is given', async () => {
			try {
				await createTimezone(USER.id, TIMEZONE.name, 'nope');
				expect(true, 'promise should fail').eq(false);
			} catch (err) {
				expect(err instanceof Error ? err.message : '').to.eql(
					'Invalid city'
				);
			}
		});

		it('it should throw an error if user does not exist', async () => {
			try {
				await createTimezone(9999999, TIMEZONE.name, TIMEZONE.city);
				expect(true, 'promise should fail').eq(false);
			} catch (err) {
				expect(err instanceof Error ? err.message : '').to.eql(
					'User not found'
				);
			}
		});
	});

	describe('#getTimezone', () => {
		it('it should get timezone created', async () => {
			const timezone = await getTimezone({
				where: { id: TIMEZONE.id },
				raw: true
			});

			expect(timezone).to.eql(TIMEZONE);
		});

		it('it should return null if timezone does not exist', async () => {
			const timezone = await getTimezone({
				where: { id: 999999999 },
				raw: true
			});
			expect(timezone).to.be.null;
		});

		it('it should return null if different user_id is passed', async () => {
			const timezone = await getTimezone({
				where: { id: TIMEZONE.id, user_id: 999999 },
				raw: true
			});
			expect(timezone).to.be.null;
		});
	});

	describe('#getTimezones', () => {
		it('it should get all timezones for user', async () => {
			const timezones = await getTimezones({
				where: { user_id: TIMEZONE.user_id },
				raw: true
			});

			expect(timezones).to.be.an('array');
			expect(timezones).to.have.length(1);
			expect(timezones[0]).to.eql(TIMEZONE);
		});
	});

	describe('#updateTimezone', () => {
		it('it should update an existing timezone for user', async () => {
			const data = await updateTimezone(
				TIMEZONE.id,
				{
					name: 'test name',
					city: 'los angeles',
					country: 'US'
				},
				USER
			);

			const timezone = data.toJSON();

			expect(timezone).to.have.all.keys(
				'id',
				'user_id',
				'timezone',
				'city',
				'name',
				'offset',
				'created_at',
				'updated_at'
			);

			expect(omit(timezone, 'updated_at')).to.eql({
				...omit(TIMEZONE, 'updated_at'),
				name: 'test name',
				city: 'los angeles',
				timezone: 'America/Los_Angeles',
				offset: '-8:00'
			});

			TIMEZONE = timezone;
		});

		it('it should update another user timezone if user is admin', async () => {
			const data = await updateTimezone(
				TIMEZONE.id,
				{
					name: 'updated name'
				},
				{ ...USER, id: 2, role: 'admin' }
			);

			const timezone = data.toJSON();

			expect(timezone).to.have.all.keys(
				'id',
				'user_id',
				'timezone',
				'city',
				'name',
				'offset',
				'created_at',
				'updated_at'
			);

			expect(omit(timezone, 'updated_at')).to.eql({
				...omit(TIMEZONE, 'updated_at'),
				name: 'updated name'
			});

			TIMEZONE = timezone;
		});

		it('it should throw an error if user is not admin and trying to update another user timezone', async () => {
			try {
				await updateTimezone(
					TIMEZONE.id,
					{
						name: 'not going through',
						city: 'paris'
					},
					{ ...USER, id: 2 }
				);
				expect(true, 'promise should fail').eq(false);
			} catch (err) {
				expect(err instanceof Error ? err.message : '').to.eql(
					'Not Authorized'
				);
			}
		});

		it('it should throw an error if update data not given', async () => {
			try {
				await updateTimezone(TIMEZONE.id, {}, USER);
				expect(true, 'promise should fail').eq(false);
			} catch (err) {
				expect(err instanceof Error ? err.message : '').to.eql(
					'No fields to update'
				);
			}
		});

		it('it should throw an error if name is the same', async () => {
			try {
				await updateTimezone(
					TIMEZONE.id,
					{
						name: TIMEZONE.name
					},
					USER
				);
				expect(true, 'promise should fail').eq(false);
			} catch (err) {
				expect(err instanceof Error ? err.message : '').to.eql(
					'No fields to update'
				);
			}
		});
	});

	describe('#deleteTimezone', () => {
		it('it should throw an error if timezone not found', async () => {
			try {
				await deleteTimezone(99999, USER);
				expect(true, 'promise should fail').eq(false);
			} catch (err) {
				expect(err instanceof Error ? err.message : '').to.eql(
					'Timezone not found'
				);
			}
		});

		it('it should throw an error if non admin user is deleting another user timezone', async () => {
			try {
				await deleteTimezone(TIMEZONE.id, { ...USER, id: 2 });
				expect(true, 'promise should fail').eq(false);
			} catch (err) {
				expect(err instanceof Error ? err.message : '').to.eql(
					'Not Authorized'
				);
			}
		});

		it('it should delete an existing timezone for user', async () => {
			const data = await deleteTimezone(TIMEZONE.id, USER);
			const timezone = data.toJSON();

			expect(timezone).to.eql(TIMEZONE);

			const deletedTimezone = await getTimezone({
				where: { id: TIMEZONE.id }
			});

			expect(deletedTimezone).to.be.null;
		});

		it('it should delete a different user timezone if user is admin', async () => {
			const createdTimezone = await createTimezone(
				USER.id,
				TIMEZONE.name,
				TIMEZONE.city
			);

			await deleteTimezone(createdTimezone.id, {
				...USER,
				id: 2,
				role: 'admin'
			});

			const timezone = await getTimezone({
				where: { id: createdTimezone.id }
			});

			expect(timezone).to.be.null;
		});
	});
});
