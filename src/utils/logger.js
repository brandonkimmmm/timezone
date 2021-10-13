const winston = require('winston');
const DailyRotateFile = require('winston-daily-rotate-file');
const { NODE_ENV } = require('../config/constants');
const level = NODE_ENV === 'production' ? 'info' : 'debug';
const { SPLAT } = require('triple-beam');
const { isPlainObject } = require('lodash');
const path = require('path');

const formatObject = (param) => {
	return isPlainObject(param) ? JSON.stringify(param) : param;
};

const all = winston.format((info) => {
	const splat = info[SPLAT] || [];
	const message = formatObject(info.message);
	const rest = splat.map(formatObject).join(' ');
	info.message = `${message} ${rest}`;
	return info;
});

const logFormat = winston.format.combine(
	all(),
	winston.format.timestamp(),
	winston.format.colorize(),
	winston.format.align(),
	winston.format.printf(
		info => `${info.timestamp} ${info.level}: ${info.message}`
	)
);

const transport = new DailyRotateFile({
	filename: 'toptal-%DATE%.log',
	dirname: path.join(__dirname, '../../', 'logs'),
	datePattern: 'YYYY-MM-DD-HH',
	zippedArchive: true,
	maxSize: '20m',
	maxFiles: '14d',
	prepend: true,
	silent: NODE_ENV === 'test' ? true : false
});

const logger = winston.createLogger({
	format: logFormat,
	transports: [
		transport,
		new winston.transports.Console({
			level,
			silent: NODE_ENV === 'test' ? true : false
		})
	]
});

module.exports = logger;