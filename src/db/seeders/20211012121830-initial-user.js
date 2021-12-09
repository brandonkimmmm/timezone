'use strict';

const path = require('path');
const bcrypt = require('bcrypt');
require('dotenv').config({ path: path.resolve(__dirname, '../../config/.env') });

module.exports = {
	up: async (queryInterface) => {
		const hashedPassword = await bcrypt.hash(process.env.MASTER_ADMIN_PASSWORD, parseInt(process.env.SALT_ROUNDS));
		await queryInterface.bulkInsert('Users', [
			{
				email: process.env.MASTER_ADMIN_EMAIL,
				id: 1,
				password: hashedPassword,
				role: 'admin'
			}
		]);
	},

	down: async (queryInterface) => {
		await queryInterface.bulkDelete('Users');
	}
};
