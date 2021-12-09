import { all } from 'bluebird';
import Timezone from '../../src/db/models/timezone';
import User from '../../src/db/models/user';

export const truncate = async () => {
	await all([
		User.destroy({ truncate: true }),
		Timezone.destroy({ truncate: true })
	]);
};