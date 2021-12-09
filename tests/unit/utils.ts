import { expect } from 'chai';
import { signToken, decodeToken } from '../../src/utils/jwt';
import { getCityTimezone } from '../../src/utils/timezones';
import { getMockUser } from '../utils/mock';

const USER = getMockUser();

describe('Utils functions', () => {
	describe('JWT Sign', () => {
		it('it should return signed token', async () => {
			const token = await signToken(USER.id, USER.email, USER.role);
			token.should.be.a('string');
			USER.token = token;
		});
	});

	describe('JWT Decode', () => {
		it('it should return decoded token', async () => {
			const decodedToken = await decodeToken(USER.token);
			decodedToken?.should.be.an('object');
			decodedToken?.should.have.property('email');
			decodedToken?.should.have.property('role');
			decodedToken?.should.have.property('id');
			decodedToken?.email.should.equal(USER.email);
			decodedToken?.role.should.equal(USER.role);
			decodedToken?.id.should.equal(USER.id);
		});

		it('it should throw an error if token is invalid', async () => {
			try {
				await decodeToken('nope');
				expect(true, 'promise should fail').eq(false);
			} catch (err) {
				expect(err instanceof Error ? err.message : '').to.eql('jwt malformed');
			}
		});
	});

	describe('getCityTimezone', () => {
		it('it should return timezone and offset', async () => {
			const data = await getCityTimezone('new york');
			data.should.be.an('object');
			data.should.have.property('timezone');
			data.should.have.property('offset');
			data.timezone.should.equal('America/New_York');
			data.offset.should.equal('-5:00');
		});

		it('it should return timezone and offset for correct country', async () => {
			const data = await getCityTimezone('los angeles', 'us');
			data.should.be.an('object');
			data.should.have.property('timezone');
			data.should.have.property('offset');
			data.timezone.should.equal('America/Los_Angeles');
			data.offset.should.equal('-8:00');
		});


		it('it should throw an error if city is invalid', async () => {
			try {
				await getCityTimezone('nope');
				expect(true, 'promise should fail').eq(false);
			} catch (err) {
				expect(err instanceof Error ? err.message : '').to.eql('Invalid city');
			}
		});
	});
});