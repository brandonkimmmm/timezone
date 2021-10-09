const winston = require('winston');
const DailyRotateFile = require('winston-daily-rotate-file');
const env = process.env.NODE_ENV || 'development';
const level = env === 'production' ? 'info' : 'debug';

const logFormat = winston.format.combine(
	winston.format.timestamp(),
	winston.format.colorize(),
	winston.format.align(),
	winston.format.printf(
		info => `${info.timestamp} ${info.level}: ${info.message}`
	)
);

const transport = new DailyRotateFile({
	filename: 'toptal-%DATE%.log',
	dirname: '../../logs',
	datePattern: 'YYYY-MM-DD-HH',
	zippedArchive: true,
	maxSize: '20m',
	maxFiles: '14d',
	prepend: true
});

const logger = winston.createLogger({
	format: logFormat,
	transports: [
		transport,
		new winston.transports.Console({
			level
		})
	]
});

module.exports = logger;