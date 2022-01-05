import Timezone from '../../src/db/models/timezone';
import User from '../../src/db/models/user';

export const truncate = async () => {
	await Timezone.destroy({
		truncate: true,
		cascade: true,
		restartIdentity: true
	});
	await User.destroy({
		truncate: true,
		cascade: true,
		restartIdentity: true
	});
};
