const { hash } = require('../../utils/bcrypt');

module.exports = (sequelize, DataTypes) => {
	const User = sequelize.define('User', {
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
	});
	User.associate = function(models) {
		// associations can be defined here
		User.hasMany(models.Timezone, {
			foreignKey: 'user_id',
			as: 'Timezones'
		});
	};

	User.beforeCreate(async (user) => {
		const hashedPassword = await hash(user.password);
		user.password = hashedPassword;
	});

	return User;
};