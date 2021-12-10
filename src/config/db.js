'use strict';

const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '.env') });

module.exports = {
	development: {
		dialect: 'postgres',
		database: `${process.env.DB_NAME}_dev`,
		host: process.env.DB_HOST,
		port: process.env.DB_PORT,
		username: process.env.DB_USER,
		password: process.env.DB_PASSWORD,
		define: {
			timestamps: true,
			underscored: true,
			createdAt: 'created_at',
			updatedAt: 'updated_at'
		},
		logging: false
	},
	test: {
		dialect: 'postgres',
		database: `${process.env.DB_NAME}_test`,
		host: process.env.DB_HOST,
		port: process.env.DB_PORT,
		username: process.env.DB_USER,
		password: process.env.DB_PASSWORD,
		define: {
			timestamps: true,
			underscored: true,
			createdAt: 'created_at',
			updatedAt: 'updated_at'
		},
		logging: false
	},
	production: {
		dialect: 'postgres',
		database: process.env.DB_NAME,
		host: process.env.DB_HOST,
		port: process.env.DB_PORT,
		username: process.env.DB_USER,
		password: process.env.DB_PASSWORD,
		define: {
			timestamps: true,
			underscored: true,
			createdAt: 'created_at',
			updatedAt: 'updated_at'
		},
		logging: false
	}
};
