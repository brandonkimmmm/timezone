import winston from 'winston';
import DailyRotateFile from 'winston-daily-rotate-file';
import { NODE_ENV } from '../config/constants';
import { SPLAT } from 'triple-beam';
import { isObject } from 'lodash';
import path from 'path';

const level = NODE_ENV === 'production' ? 'info' : 'debug';

const formatObject = (data: string | object): string => isObject(data) ? JSON.stringify(data) : data;

const customFormat = winston.format((info: winston.LogEntry): winston.LogEntry => {
	const splat = info[SPLAT as any] || [];
	const message = formatObject(info.message);
	const rest = splat.map(formatObject).join(' ');
	info.message = `${message} ${rest}`;
	return info;
});

const logFormat = winston.format.combine(
	customFormat(),
	winston.format.timestamp(),
	winston.format.colorize(),
	winston.format.align(),
	winston.format.printf((info) => `${info.timestamp} ${info.level}: ${formatObject(info.message)}`)
);

const rotateTransport: DailyRotateFile = new DailyRotateFile({
	filename: 'timezone-%DATE%.log',
	dirname: path.join(__dirname, '../../', 'logs'),
	datePattern: 'YYYY-MM-DD-HH',
	zippedArchive: true,
	maxSize: '20m',
	maxFiles: '14d'
});

const logger: winston.Logger = winston.createLogger({
	format: logFormat,
	transports: [
		rotateTransport,
		new winston.transports.Console({
			level,
			silent: NODE_ENV === 'test'
		})
	],
	silent: NODE_ENV === 'test'
});

export default logger;
