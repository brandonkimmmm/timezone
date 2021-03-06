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
import {
	PASSWORD_REGEX,
	SALT_ROUNDS,
	VALID_ROLES
} from '../../config/constants';
import { omit } from 'lodash';

export type Role = 'admin' | 'user';

export interface UserAttributes {
	id: number;
	email: string;
	password: string;
	role: Role;
	created_at: Date;
	updated_at: Date;
}

export type FindUserOpts = FindOptions<UserAttributes>;

interface UserCreationAttributes
	extends Optional<
		UserAttributes,
		'id' | 'role' | 'created_at' | 'updated_at'
	> {}

export interface UserInstance
	extends Model<UserAttributes, UserCreationAttributes>,
		UserAttributes {
	timezones: [TimezoneInstance];

	getTimezones: HasManyGetAssociationsMixin<TimezoneInstance>;
	createTimezone: HasManyCreateAssociationMixin<TimezoneInstance>;
	hasTimezone: HasManyHasAssociationMixin<TimezoneInstance, number>;

	verifyPassword: (password: string) => Promise<boolean>;
	prototype: {
		verifyPassword: (password: string) => Promise<boolean>;
	};
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
			unique: true,
			validate: {
				isLowercase: true,
				isEmail: true
			}
		},
		password: {
			type: DataTypes.STRING,
			allowNull: false,
			validate: {
				is: PASSWORD_REGEX
			}
		},
		role: {
			type: DataTypes.ENUM(...VALID_ROLES),
			allowNull: false,
			defaultValue: 'user'
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
		}
	},
	{
		tableName: 'Users',
		hooks: {
			beforeCreate: async (user: UserInstance) => {
				const hashedPassword = await bcrypt.hash(
					user.password,
					SALT_ROUNDS
				);
				user.password = hashedPassword;
			}
		},
		defaultScope: {
			attributes: { exclude: ['password'] }
		},
		scopes: {
			validation: {
				attributes: { include: ['password'] }
			}
		}
	}
);

User.prototype.verifyPassword = function (password: string) {
	return bcrypt.compare(password, this.password);
};

const toJSON = User.prototype.toJSON;

User.prototype.toJSON = function () {
	const data = toJSON.call(this);
	return omit(data, 'password');
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
