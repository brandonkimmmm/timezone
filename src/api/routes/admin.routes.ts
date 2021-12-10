import express from 'express';
import * as adminControllers from '../controllers/admin.controllers';
import * as authenticate from '../middleware/authenticate';
import * as validator from '../middleware/validator';
const router = express.Router();

router.use(authenticate.validateJwtToken);
router.put('/user/role', validator.putAdminUserRole, adminControllers.putUserRole);
router.get('/users', validator.getAdminUsers, adminControllers.getUsers);
router.get('/user/timezones', validator.getAdminTimezones, adminControllers.getTimezones);

router.route('/user')
	.get(validator.getAdminUser, adminControllers.getUser)
	.post(validator.postSignup, adminControllers.createUser)
	.delete(validator.deleteAdminUser, adminControllers.deleteUser);

router.route('/user/timezone')
	.post(validator.postAdminTimezone, adminControllers.postTimezone)
	.put(validator.putAdminTimezone, adminControllers.putTimezone)
	.delete(validator.deleteAdminTimezone, adminControllers.deleteTimezone);

export default router;