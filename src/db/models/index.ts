import { Sequelize } from 'sequelize';
import { NODE_ENV } from '../../config/constants';
import getDbConfig from '../../config/db';

const dbConfig = getDbConfig(NODE_ENV);
const sequelize = new Sequelize(dbConfig);

export { Sequelize, sequelize };