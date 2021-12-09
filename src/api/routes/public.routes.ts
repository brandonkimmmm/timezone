import express from 'express';
import * as publicControllers from '../controllers/public.controller';
import * as validator from '../middleware/validator';
const router = express.Router();

router.get('/info', publicControllers.getInfo);
router.post('/signup', validator.signup, publicControllers.signup);
router.post('/login', validator.login, publicControllers.login);

export default router;