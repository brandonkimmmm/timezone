import express from 'express';
import * as userControllers from '../controllers/user.controllers';
import * as authenticate from '../middleware/authenticate';
import * as validator from '../middleware/validator';
const router = express.Router();

router.use(authenticate.validateJwtToken);

router.get('/', userControllers.getUser);

router.route('/timezone')
	.post(validator.postUserTimezone, userControllers.postUserTimezone)
	.put(validator.putUserTimezone, userControllers.putUserTimezone)
	.delete(validator.deleteUserTimezone, userControllers.deleteUserTimezone);

router.get('/timezones', userControllers.getUserTimezones);

export default router;