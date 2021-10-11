module.exports = (sequelize, DataTypes) => {
	const Timezone = sequelize.define('Timezone', {
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
		},
	});
	Timezone.associate = function(models) {
		// associations can be defined here
		Timezone.belongsTo(models.User, {
			onDelete: 'CASCADE',
			foreignKey: 'user_id',
			targetKey: 'id'
		});
	};

	return Timezone;
};