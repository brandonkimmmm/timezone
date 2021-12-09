import { PORT } from './config/constants';
import logger from './utils/logger';
import express from 'express';
import { nanoid } from 'nanoid';
import publicRouter from './api/routes/public.routes';
import userRouter from './api/routes/user.routes';
import adminRouter from './api/routes/admin.routes';

const app = express();

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
app.use(userRouter);
app.use(adminRouter);

app.use(async (req, res) => {
	return res.status(400).json({
		message: `Path ${req.path} does not exist`
	});
});

app.listen(PORT, () => {
	logger.info(`Server listening on port ${PORT}`);
});

export default app;