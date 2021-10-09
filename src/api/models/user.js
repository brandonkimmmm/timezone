const { User } = require('../../db/models');
const logger = require('../../utils/logger');

const get = async (email) => {
	logger.debug(
		'api/models/user/get',
		'email:',
		email
	);

	const user = await User.findOne({
		where: {
			email
		}
	});

	return user;
};

const create = async (
	email,
	password
) => {
	logger.debug(
		'api/models/user/create',
		'email:',
		email
	);

	const user = await User.create({
		email,
		password
	});

	return user;
};

module.exports = {
	get,
	create
};