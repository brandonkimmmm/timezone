import express from 'express';
import * as adminControllers from '../controllers/admin.controllers';
import * as authenticate from '../middleware/authenticate';
import * as validator from '../middleware/validator';
const router = express.Router();

router.use(authenticate.validateJwtToken);
router.put('/user/role', validator.putAdminUserRole, adminControllers.putAdminUserRole);
router.get('/users', validator.getAdminUsers, adminControllers.getAdminUsers);
router.get('/user/timezones', validator.getAdminTimezones, adminControllers.getAdminTimezones);

router.route('/user')
	.get(validator.getAdminUser, adminControllers.getAdminUser)
	.post(validator.postSignup, adminControllers.postAdminUser)
	.delete(validator.deleteAdminUser, adminControllers.deleteAdminUser);

router.route('/user/timezone')
	.post(validator.postAdminTimezone, adminControllers.postAdminTimezone)
	.put(validator.putAdminTimezone, adminControllers.putAdminTimezone)
	.delete(validator.deleteAdminTimezone, adminControllers.deleteAdminTimezone);

export default router;