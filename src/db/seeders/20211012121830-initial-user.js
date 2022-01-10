'use strict';

const bcrypt = require('bcrypt');
require('dotenv').config();

module.exports = {
	up: async (queryInterface) => {
		const hashedPassword = await bcrypt.hash(process.env.MASTER_ADMIN_PASSWORD, parseInt(process.env.SALT_ROUNDS));
		const date = new Date();
		await queryInterface.bulkInsert('Users', [
			{
				email: process.env.MASTER_ADMIN_EMAIL,
				id: 1,
				password: hashedPassword,
				role: 'admin',
				created_at: date,
				updated_at: date
			}
		]);
	},

	down: async (queryInterface) => {
		await queryInterface.bulkDelete('Users');
	}
};
