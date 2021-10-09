const bcrypt = require('bcrypt');
const SALT_ROUNDS = process.env.SALT_ROUNDS || 10;

const hash = async (string) => {
	return bcrypt.hash(string, SALT_ROUNDS);
};

module.exports = {
	hash
};
