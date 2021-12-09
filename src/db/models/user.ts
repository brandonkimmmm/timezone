import { sequelize } from '.';
import { hash } from '../../utils/bcrypt';
import {
	Model,
	Optional,
	DataTypes,
	HasManyGetAssociationsMixin,
	HasManyCreateAssociationMixin,
	HasManyHasAssociationMixin
} from 'sequelize';
import Timezone, { TimezoneInstance } from './timezone';

interface UserAttributes {
	id: number;
	email: string;
	password: string;
	role: string;
}

interface UserCreationAttributes extends Optional<UserAttributes, 'id' | 'role'> {}

export interface UserInstance extends Model<UserAttributes, UserCreationAttributes>,
	UserAttributes {
		created_at?: Date;
		updated_at?: Date;

		getTimezones: HasManyGetAssociationsMixin<TimezoneInstance>;
		createTimezone: HasManyCreateAssociationMixin<TimezoneInstance>;
		hasTimezone: HasManyHasAssociationMixin<TimezoneInstance, number>;
	}

const User = sequelize.define<UserInstance>(
	'User',
	{
		id: {
			type: DataTypes.INTEGER,
			autoIncrement: true,
			primaryKey: true
		},
		email: {
			type: DataTypes.STRING,
			allowNull: false,
			unique: true
		},
		password: {
			type: DataTypes.STRING,
			allowNull: false
		},
		role: {
			type: DataTypes.STRING,
			allowNull: false,
			defaultValue: 'user'
		}
	}, {
		tableName: 'Users'
	}
);

User.beforeCreate(async (user: UserInstance) => {
	const hashedPassword = await hash(user.password);
	user.password = hashedPassword;
});

User.hasMany(Timezone, {
	foreignKey: 'user_id',
	as: 'timezones'
});

Timezone.belongsTo(User, {
	onDelete: 'CASCADE',
	foreignKey: 'user_id',
	targetKey: 'id'
});

export default User;