import { expect } from 'chai';
import { pick } from 'lodash';
import {
	signToken,
	decodeToken,
	verifyToken
} from '../../src/services/auth.service';
import { getMockUser } from '../utils/mock';

const USER = {
	...getMockUser(),
	token: ''
};

describe('Auth helper fucntions', () => {
	describe('#signToken', () => {
		it('it should return signed token', async () => {
			const token = await signToken(USER.id, USER.email, USER.role);

			expect(token).to.be.a('string').not.empty;
			USER.token = token;
		});
	});

	describe('#decodeToken', () => {
		it('it should return decoded token', async () => {
			const decodedToken = await decodeToken(USER.token);

			expect(decodedToken).to.have.all.keys(
				'id',
				'email',
				'role',
				'iat',
				'exp'
			);

			expect(decodedToken).to.include({
				id: USER.id,
				email: USER.email,
				role: USER.role
			});
		});

		it('it should throw an error if token is invalid', async () => {
			try {
				await decodeToken('nope');
				expect(true, 'promise should fail').eq(false);
			} catch (err) {
				expect(err instanceof Error ? err.message : '').to.eql(
					'jwt malformed'
				);
			}
		});
	});

	describe('#verifyToken', () => {
		it('it should return null if token is not passed', async () => {
			const user = await verifyToken();

			expect(user).to.be.null;
		});

		it('it should return null if invalid token is given', async () => {
			const user = await verifyToken('hi123');

			expect(user).to.be.null;
		});

		it('it should return user if valid token is given', async () => {
			const user = await verifyToken(USER.token);

			expect(user).to.eql(pick(USER, ['id', 'email', 'role']));
		});
	});
});
