const { map } = require('lodash');
const models = require('../../db/models');
const { all } = require('bluebird');

const truncate = async () => {
	return all(
		map(Object.keys(models), (key) => {
			if (['sequelize', 'Sequelize'].includes(key)) return null;
			return models[key].destroy({ truncate: true });
		})
	);
};

module.exports = {
	truncate
};
