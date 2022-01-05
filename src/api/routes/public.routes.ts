import express from 'express';
import * as publicControllers from '../controllers/public.controller';
import * as validator from '../middleware/validator';
const router = express.Router();

router.get('/health', publicControllers.getHealth);
router.post('/signup', validator.postSignup, publicControllers.postSignup);
router.post('/login', validator.postLogin, publicControllers.postLogin);

export default router;
