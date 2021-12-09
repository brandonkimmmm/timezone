import Sequelize from 'sequelize/types';
import logger from '../utils/logger';
interface DbConfig {
	[key: string]: Sequelize.Options;
}

const config: DbConfig = {
	development: {
		dialect: 'sqlite',
		storage: './database-dev.sqlite3',
		define: {
			timestamps: true,
			underscored: true,
			createdAt: 'created_at',
			updatedAt: 'updated_at'
		},
		logging: (msg) => logger.debug(msg)
	},
	test: {
		dialect: 'sqlite',
		storage: ':memory',
		define: {
			timestamps: true,
			underscored: true,
			createdAt: 'created_at',
			updatedAt: 'updated_at'
		},
		logging: false
	},
	production: {
		dialect: 'sqlite',
		storage: './database.sqlite3',
		define: {
			timestamps: true,
			underscored: true,
			createdAt: 'created_at',
			updatedAt: 'updated_at'
		},
		logging: (msg) => logger.debug(msg)
	}
};

export default (env: string) => {
	return config[env];
};