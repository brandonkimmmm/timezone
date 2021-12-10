import { sequelize } from '.';
import {
	Model,
	Optional,
	DataTypes,
	HasManyGetAssociationsMixin,
	HasManyCreateAssociationMixin,
	HasManyHasAssociationMixin,
	FindOptions
} from 'sequelize';
import Timezone, { TimezoneInstance } from './timezone';
import bcrypt from 'bcrypt';
import { SALT_ROUNDS, VALID_ROLES } from '../../config/constants';

export type Role = 'admin' | 'user';

export interface UserAttributes {
	id: number;
	email: string;
	password: string;
	role: Role
}

export type FindUserOpts = FindOptions<UserAttributes>

interface UserCreationAttributes extends Optional<UserAttributes, 'id' | 'role'> {}

export interface UserInstance extends Model<UserAttributes, UserCreationAttributes>,
	UserAttributes {
		created_at?: Date;
		updated_at?: Date;

		getTimezones: HasManyGetAssociationsMixin<TimezoneInstance>;
		createTimezone: HasManyCreateAssociationMixin<TimezoneInstance>;
		hasTimezone: HasManyHasAssociationMixin<TimezoneInstance, number>;

		verifyPassword: (password: string) => Promise<boolean>;
		prototype: {
			verifyPassword: (password: string) => Promise<boolean>;
		}
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
			type: DataTypes.ENUM(...VALID_ROLES),
			allowNull: false,
			defaultValue: 'user'
		}
	}, {
		tableName: 'Users',
		hooks: {
			beforeCreate: async (user: UserInstance) => {
				const hashedPassword = await bcrypt.hash(user.password, SALT_ROUNDS);
				user.password = hashedPassword;
			}
		}
	}
);

User.prototype.verifyPassword = function (password: string) {
	return bcrypt.compare(password, this.password);
};

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