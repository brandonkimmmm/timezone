import { sequelize } from '.';
import { DataTypes, Model, Optional, FindOptions } from 'sequelize';

interface TimezoneAttributes {
	id: number;
	name: string;
	city: string;
	timezone: string;
	offset: string;
	created_at: Date;
	updated_at: Date;
	user_id: number;
}

export type FindTimezoneOpts = FindOptions<TimezoneAttributes>;

interface TimezoneCreationAttributes
	extends Optional<TimezoneAttributes, 'id' | 'created_at' | 'updated_at'> {}

export interface TimezoneInstance
	extends Model<TimezoneAttributes, TimezoneCreationAttributes>,
		TimezoneAttributes {}

const Timezone = sequelize.define<TimezoneInstance>(
	'Timezone',
	{
		id: {
			type: DataTypes.INTEGER,
			autoIncrement: true,
			primaryKey: true
		},
		name: {
			type: DataTypes.STRING,
			allowNull: false,
			validate: {
				isLowercase: true,
				notEmpty: true
			}
		},
		city: {
			type: DataTypes.STRING,
			allowNull: false,
			validate: {
				isLowercase: true,
				notEmpty: true
			}
		},
		timezone: {
			type: DataTypes.STRING,
			allowNull: false
		},
		offset: {
			type: DataTypes.STRING,
			allowNull: false
		},
		created_at: {
			type: DataTypes.DATE,
			allowNull: false,
			defaultValue: DataTypes.NOW
		},
		updated_at: {
			type: DataTypes.DATE,
			allowNull: false,
			defaultValue: DataTypes.NOW
		},
		user_id: {
			type: DataTypes.INTEGER,
			allowNull: false
		}
	},
	{
		tableName: 'Timezones'
	}
);

export default Timezone;
