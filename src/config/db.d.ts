import { Options } from 'sequelize/types';

interface DatabaseConfigs {
	[key: string]: Options;
}

declare const DbConfig: DatabaseConfigs;

export = DbConfig;
