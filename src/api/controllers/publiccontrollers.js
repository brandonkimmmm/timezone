const { name, version } = require('../../../package.json');

const getInfo = async (req, res) => {
	return res.json({
		name,
		version
	});
};

module.exports = {
	getInfo
};
