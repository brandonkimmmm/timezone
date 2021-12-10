import express from 'express';
import * as userControllers from '../controllers/user.controllers';
import * as authenticate from '../middleware/authenticate';
import * as validator from '../middleware/validator';
const router = express.Router();

router.use(authenticate.validateJwtToken);

router.get('/', userControllers.get);

router.route('/timezone')
	.post(validator.postUserTimezone, userControllers.postTimezone)
	.put(validator.putUserTimezone, userControllers.putTimezone)
	.delete(validator.deleteUserTimezone, userControllers.deleteTimezone);

router.get('/timezones', userControllers.getTimezones);

export default router;