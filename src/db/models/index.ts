import { Sequelize } from 'sequelize';
import { NODE_ENV } from '../../config/constants';
import DbConfig from '../../config/db';
import logger from '../../services/logger.service';

const sequelize = new Sequelize({
	...DbConfig[NODE_ENV],
	logging: NODE_ENV === 'test' ? false : (msg) => logger.debug(msg)
});

export { Sequelize, sequelize };
