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
		req.user = pick(decodedToken, ['email', 'role']);
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
