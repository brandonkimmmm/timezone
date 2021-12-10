import express from 'express';
import * as userControllers from '../controllers/user.controllers';
import * as authenticate from '../middleware/authenticate';
import * as validator from '../middleware/validator';
const router = express.Router();

router.use(authenticate.validateJwtToken);
router.get('/user', userControllers.get);
router.get('/user/timezones', userControllers.getTimezones);
router.post('/user/timezone', validator.postUserTimezone, userControllers.postTimezone);
router.put('/user/timezone', validator.putUserTimezone, userControllers.putTimezone);
router.delete('/user/timezone', validator.deleteUserTimezone, userControllers.deleteTimezone);

export default router;