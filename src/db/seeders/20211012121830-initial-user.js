const { MASTER_ADMIN } = require('../../config/constants');
const { hash } = require('../../utils/bcrypt');

module.exports = {
	up: async (queryInterface, Sequelize) => {
		const hashedPassword = await hash(MASTER_ADMIN.PASSWORD);
		await queryInterface.bulkInsert('Users', [
			{
				email: MASTER_ADMIN.EMAIL,
				id: MASTER_ADMIN.ID,
				password: hashedPassword,
				role: 'admin'
			}
		]);
	},

	down: async (queryInterface, Sequelize) => {
		await queryInterface.bulkDelete('Users');
	}
};
