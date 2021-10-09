const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, 'config', '.env') });

const logger = require('./utils/logger');
const express = require('express');
const app = express();
const PORT = process.env.PORT || 8080;
const { nanoid } = require('nanoid');
const publicRouter = require('./api/routes/public.routes');

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.use(publicRouter);

app.use(async (req, res, next) => {
	req.nanoid = nanoid();

	logger.info(
		req.nanoid,
		'Incoming Request',
		'Host:',
		req.headers.host,
		'IP:',
		req.ip,
		'Origin:',
		req.headers.origin,
		'Route:',
		req.method,
		req.path
	);

	next();
});

app.use(async (req, res) => {
	return res.status(400).json({
		message: `Path ${req.path} does not exist`
	});
});

app.listen(PORT, () => {
	logger.info(`Server listening on port ${PORT}`);
});

module.exports = app;