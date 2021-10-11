const bcrypt = require('bcrypt');
const { SALT_ROUNDS } = require('../config/constants');

const hash = async (string) => {
	return bcrypt.hash(string, SALT_ROUNDS);
};

const compare = async (value, hash) => {
	return bcrypt.compare(value, hash);
};

module.exports = {
	hash,
	compare
};
