const { decodeToken } = require('../../utils/jwt');
const logger = require('../../utils/logger');
const { pick } = require('lodash');

const validateJwtToken = async (req, res, next) => {
	const { authorization } = req.headers;

	if (!authorization) {
		logger.error(
			req.nanoid,
			'api/middleware/authenticate/validateJwtToken',
			'Bearer token required'
		);

		return res.status(401).json({ message: 'Missing headers' });
	}

	const [ key, token ] = authorization.split(' ');

	if (key !== 'Bearer' || !token) {
		logger.error(
			req.nanoid,
			'api/middleware/authenticate/validateJwtToken',
			'Invalid bearer token format'
		);

		return res.status(401).json({ message: 'Invalid token' });
	}

	try {
		const decodedToken = await decodeToken(token);
		const decodedUser = pick(decodedToken, ['id', 'email', 'role']);

		if (req.path.includes('/admin') && decodedUser.role !== 'admin') {
			return res.status(401).json({ message: 'Invalid token' });
		}

		logger.info(
			req.nanoid,
			'middleware/authenticate/validateJwtToken',
			'authenticated user:',
			decodedUser
		);

		req.user = decodedUser;
		next();
	} catch (err) {
		logger.error(
			req.nanoid,
			'api/middleware/authenticate/validateJwtToken',
			err.message
		);

		return res.status(401).json({ message: 'Invalid token' });
	}
};

module.exports = {
	validateJwtToken
};
