const { Timezone } = require('../../db/models');
const logger = require('../../utils/logger');
const { isInteger } = require('lodash');

const getUserTimezones = async (id, opts = {}) => {
	if (!isInteger(id) || id <= 0) {
		throw new Error('Invalid user id given');
	}

	logger.debug(
		'api/models/timezone/getUserTimezones',
		'id:',
		id
	);

	const timezones = await Timezone.findAll({
		where: {
			user_id: id
		},
		...opts
	});

	return timezones;
};

module.exports = {
	getUserTimezones
};