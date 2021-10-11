const jwt = require('jsonwebtoken');
const { JWT_SECRET } = require('../config/constants');
const Promise = require('bluebird');

const signToken = async (id, email, role) => {
	return new Promise((resolve, reject) => {
		jwt.sign(
			{
				id,
				email,
				role
			},
			JWT_SECRET,
			{
				expiresIn: '1d'
			},
			(err, token) => {
				if (err) reject(err);
				resolve(token);
			}
		);
	});
};

const decodeToken = async (token) => {
	return new Promise((resolve, reject) => {
		jwt.verify(token, JWT_SECRET, (err, decoded) => {
			if (err) reject(err);
			resolve(decoded);
		});
	});
};

module.exports = {
	signToken,
	decodeToken
};
