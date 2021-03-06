import { PORT } from './config/constants';
import logger from './services/logger.service';
import morgan from 'morgan';
import express from 'express';
import { nanoid } from 'nanoid';
import publicRouter from './api/routes/public.routes';
import { userServer, adminServer } from './graphql';
import cors from 'cors';

const app = express();

app.use(cors());
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.use(
	morgan('tiny', { stream: { write: (message) => logger.info(message) } })
);

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

(async () => {
	await userServer.start();
	await adminServer.start();

	userServer.applyMiddleware({ app, path: '/graphql/user' });
	adminServer.applyMiddleware({ app, path: '/graphql/admin' });

	app.use(async (req, res) => {
		return res.status(400).json({
			message: `Path ${req.path} does not exist`
		});
	});
	app.listen(PORT, () => {
		logger.info(`Server listening on port ${PORT}`);
	});
})();

export default app;
