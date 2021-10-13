const { decodeToken } = require('../../utils/jwt');
const logger = require('../../utils/logger');
const { pick } = require('lodash');

const validateJwtToken = async (req, res, next) => {
	const { authorization } = req.headers;

	// If authorization header does not exist, throw an error
	if (!authorization) {
		logger.error(
			req.nanoid,
			'api/middleware/authenticate/validateJwtToken',
			'Bearer token required'
		);

		return res.status(401).json({ message: 'Missing headers' });
	}

	const [ key, token ] = authorization.split(' ');

	// Authorization value needs the Bearer prefix
	if (key !== 'Bearer' || !token) {
		logger.error(
			req.nanoid,
			'api/middleware/authenticate/validateJwtToken',
			'Invalid bearer token format'
		);

		return res.status(401).json({ message: 'Invalid token' });
	}

	try {
		// Decoded JWT token will have id, email, and role
		const decodedToken = await decodeToken(token);
		const decodedUser = pick(decodedToken, ['id', 'email', 'role']);

		// If the request is for an admin path, check if token is for admin user
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
