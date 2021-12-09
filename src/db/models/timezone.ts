import { sequelize } from '.';
import {
	DataTypes,
	Model,
	Optional
} from 'sequelize';

interface TimezoneAttributes {
	id: number;
	name: string;
	city: string;
	timezone: string;
	offset: string;
}

interface TimezoneCreationAttributes extends Optional<TimezoneAttributes, 'id'> {}

export interface TimezoneInstance extends Model<TimezoneAttributes, TimezoneCreationAttributes>,
	TimezoneAttributes {
		created_at?: Date;
		updated_at?: Date;
	}

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
			allowNull: false
		},
		city: {
			type: DataTypes.STRING,
			allowNull: false
		},
		timezone: {
			type: DataTypes.STRING,
			allowNull: false
		},
		offset: {
			type: DataTypes.STRING,
			allowNull: false
		}
	}, {
		tableName: 'Timezones'
	}
);

export default Timezone;