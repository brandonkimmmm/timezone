const logger = require('../../utils/logger');
const User = require('../models/user');

const get = async (req, res) => {
	const { email } = req.user;

	logger.info(
		req.nanoid,
		'api/controllers/user.controllers/get',
		'email:',
		email
	);

	try {
		const user = await User.get(
			email,
			{
				raw: true,
				attributes: {
					exclude: ['password']
				}
			}
		);

		if (!user) {
			throw new Error('User not found');
		}

		return res.json(user);
	} catch (err) {
		logger.error(
			req.nanoid,
			'api/controllers/user.controllers/get',
			err.message
		);

		return res.status(400).json({ message: err.message });
	}
};

module.exports = {
	get
};
