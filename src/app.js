const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, 'config', '.env') });

const logger = require('./utils/logger');
const express = require('express');
const app = express();
const PORT = process.env.PORT || 8080;
const publicRouter = require('./api/routes/public.routes');

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.use(publicRouter);

app.listen(PORT, () => {
	logger.info(`Server listening on port ${PORT}`);
});

module.exports = app;
