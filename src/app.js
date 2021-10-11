const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, 'config', '.env') });

const logger = require('./utils/logger');
const express = require('express');
const app = express();
const { PORT } = require('./config/constants');
const { nanoid } = require('nanoid');
const publicRouter = require('./api/routes/public.routes');
const userRoutes = require('./api/routes/user.routes');
const adminRoutes = require('./api/routes/admin.routes');

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

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

app.use(publicRouter);
app.use(userRoutes);
app.use(adminRoutes);

app.use(async (req, res) => {
	return res.status(400).json({
		message: `Path ${req.path} does not exist`
	});
});

app.listen(PORT, () => {
	logger.info(`Server listening on port ${PORT}`);
});

module.exports = app;
