'use strict';
module.exports = {
	up: async (queryInterface, Sequelize) => {
		await queryInterface.createTable('Timezones', {
			id: {
				allowNull: false,
				autoIncrement: true,
				primaryKey: true,
				type: Sequelize.INTEGER
			},
			user_id: {
				type: Sequelize.INTEGER,
				allowNull: false,
				onDelete: 'CASCADE',
				references: {
					model: 'Users',
					key: 'id'
				}
			},
			name: {
				type: Sequelize.STRING,
				allowNull: false
			},
			city: {
				type: Sequelize.STRING,
				allowNull: false
			},
			created_at: {
				allowNull: false,
				type: Sequelize.DATE
			},
			updated_at: {
				allowNull: false,
				type: Sequelize.DATE
			}
		});
	},
	down: async (queryInterface, Sequelize) => {
		await queryInterface.dropTable('Timezones');
	}
};