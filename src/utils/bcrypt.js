const bcrypt = require('bcrypt');
const { SALT_ROUNDS } = require('../config/constants');

const hash = async (string) => {
	return bcrypt.hash(string, SALT_ROUNDS);
};

module.exports = {
	hash
};
