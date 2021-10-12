exports.NODE_ENV = process.env.NODE_ENV || 'development';

exports.PORT = process.env.PORT || 8080;

exports.SALT_ROUNDS = process.env.SALT_ROUNDS ? parseInt(process.env.SALT_ROUNDS) : 10;

exports.PASSWORD_REGEX = new RegExp('^[a-zA-Z0-9]{8,20}$');

exports.JWT_SECRET = process.env.JWT_SECRET || 'shhh';

exports.VALID_ROLES = ['admin', 'user'];