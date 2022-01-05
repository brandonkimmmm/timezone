import { expect } from 'chai';
import { truncate } from '../utils/db';
import {
	createTimezone,
	getTimezones
} from '../../src/services/timezone.service';
import {
	createUser,
	getUser,
	updateUser,
	deleteUser,
	getUsers,
	loginUser
} from '../../src/services/user.service';
import { getMockUser, getMockTimezone } from '../utils/mock';
import { omit } from 'lodash';

let ADMIN = getMockUser('admin');
let USER = getMockUser();
const TIMEZONE = getMockTimezone();

describe('User Helper Functions', () => {
	before(async () => {
		await truncate();
		const admin = await createUser(ADMIN.email, ADMIN.password, ADMIN.role);
		ADMIN = { ...ADMIN, ...admin.toJSON() };
	});

	after(async () => {
		await truncate();
	});

	describe('#createUser', () => {
		it('it should return created user', async () => {
			const data = await createUser(USER.email, USER.password);

			const user = data.toJSON();

			expect(user)
				.to.have.all.keys(
					'id',
					'email',
					'role',
					'created_at',
					'updated_at'
				)
				.to.include({
					id: 2,
					email: USER.email,
					role: USER.role
				});

			USER = { ...USER, ...user };
		});

		it('it should throw an error if user exists', async () => {
			try {
				await createUser(USER.email, USER.password);
				expect(true, 'promise should fail').eq(false);
			} catch (err) {
				expect(err instanceof Error ? err.message : '').to.eql(
					`User ${USER.email} already exists`
				);
			}
		});
	});

	describe('#getUser', () => {
		it('it should get user by email if user exists', async () => {
			const user = await getUser({
				where: { email: USER.email },
				raw: true
			});

			expect(user).to.eql(omit(USER, 'password'));
		});

		it('it should get user by id if user exists', async () => {
			const user = await getUser({
				where: { id: USER.id },
				raw: true
			});

			expect(user).to.eql(omit(USER, 'password'));
		});

		it('it should return null if user does not exist', async () => {
			const user = await getUser({ where: { id: 99999 } });
			expect(user).to.be.null;
		});
	});

	describe('#getUsers', () => {
		it('it should get all user data', async () => {
			const users = await getUsers({
				raw: true,
				order: [['id', 'asc']]
			});

			expect(users).to.be.an('array').to.have.length(2);
			expect(users[0]).to.eql(omit(ADMIN, 'password'));
			expect(users[1]).to.eql(omit(USER, 'password'));
		});

		it('it should get all user data with role admin', async () => {
			const users = await getUsers({
				where: { role: 'admin' },
				raw: true
			});

			expect(users).to.be.an('array').to.have.length(1);
			expect(users[0]).to.eql(omit(ADMIN, 'password'));
		});

		it('it should get all user data with role user', async () => {
			const users = await getUsers({
				where: { role: 'user' },
				raw: true
			});

			expect(users).to.be.an('array').to.have.length(1);
			expect(users[0]).to.eql(omit(USER, 'password'));
		});
	});

	describe('#loginUser', () => {
		it('it should return signed token for existing user', async () => {
			console.log(USER.password);
			const token = await loginUser(USER.email, USER.password);
			expect(token).to.be.a('string').to.not.be.empty;
		});

		it('it should throw an error if user not found', async () => {
			try {
				await loginUser('nope@nope.com', USER.password);
				expect(true, 'promise should fail').eq(false);
			} catch (err) {
				expect(err instanceof Error ? err.message : '').to.eql(
					'User not found'
				);
			}
		});

		it('it should throw an error if invalid password is given', async () => {
			try {
				await loginUser(USER.email, 'notmypassword');
				expect(true, 'promise should fail').eq(false);
			} catch (err) {
				expect(err instanceof Error ? err.message : '').to.eql(
					'Invalid password given'
				);
			}
		});
	});

	describe('#updateUser', () => {
		it('it should update user role to admin if user exists', async () => {
			const data = await updateUser(USER.id, { role: 'admin' });

			const user = data.toJSON();

			expect(omit(user, 'updated_at')).to.eql({
				...omit(USER, ['password', 'updated_at']),
				role: 'admin'
			});

			USER = user;
		});

		it('it should update user role to user if user exists', async () => {
			const data = await updateUser(USER.id, { role: 'user' });

			const user = data.toJSON();

			expect(omit(user, 'updated_at')).to.eql({
				...omit(USER, ['password', 'updated_at']),
				role: 'user'
			});

			USER = user;
		});

		it('it should throw an error if role is the same', async () => {
			try {
				await updateUser(USER.id, { role: 'user' });
				expect(true, 'promise should fail').eq(false);
			} catch (err) {
				expect(err instanceof Error ? err.message : '').to.eql(
					'User already has role user'
				);
			}
		});

		it('it should throw an error if user not found', async () => {
			try {
				await updateUser(999999, { role: 'user' });
				expect(true, 'promise should fail').eq(false);
			} catch (err) {
				expect(err instanceof Error ? err.message : '').to.eql(
					'User not found'
				);
			}
		});

		it('it should throw an error if user id 1 is given', async () => {
			try {
				await updateUser(ADMIN.id, { role: 'user' });
				expect(true, 'promise should fail').eq(false);
			} catch (err) {
				expect(err instanceof Error ? err.message : '').to.eql(
					'Cannot update master admin role'
				);
			}
		});
	});

	describe('#deleteUser', () => {
		it('it should delete user and timezones for user', async () => {
			await createTimezone(USER.id, TIMEZONE.name, TIMEZONE.city);

			const user = await getUser({ where: { id: USER.id } });
			const timezones = await user?.getTimezones();

			expect(timezones).to.be.an('array').to.have.length(1);

			await user?.destroy();

			const deletedUser = await getUser({ where: { id: USER.id } });

			expect(deletedUser).to.be.null;

			const userTimezones = await getTimezones({
				where: { user_id: USER.id }
			});

			expect(userTimezones).to.be.an('array').to.have.length(0);
		});

		it('it should throw an error if user does not exist', async () => {
			try {
				await deleteUser(USER.id);
				expect(true, 'promise should fail').eq(false);
			} catch (err) {
				expect(err instanceof Error ? err.message : '').to.eql(
					'User not found'
				);
			}
		});

		it('it should throw an error if user id is 1', async () => {
			try {
				await deleteUser(ADMIN.id);
				expect(true, 'promise should fail').eq(false);
			} catch (err) {
				expect(err instanceof Error ? err.message : '').to.eql(
					'Cannot delete master admin'
				);
			}
		});
	});
});
