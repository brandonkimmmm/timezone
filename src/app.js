const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, 'config', '.env') });

const logger = require('./utils/logger');
const express = require('express');

const app = express();
const PORT = process.env.PORT || 8080;

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.get('/hello-world', (req, res) => {
	logger.info('hello world', req.path);
	return res.json({ message: 'hello world' });
});

app.listen(PORT, () => {
	logger.info(`Server listening on port ${PORT}`);
});
