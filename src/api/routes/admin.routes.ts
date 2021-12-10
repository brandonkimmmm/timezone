import express from 'express';
import * as adminControllers from '../controllers/admin.controllers';
import * as authenticate from '../middleware/authenticate';
import * as validator from '../middleware/validator';
const router = express.Router();

router.use(authenticate.validateJwtToken);
router.get('/admin/user/timezones', validator.getAdminTimezones, adminControllers.getTimezones);
router.post('/admin/user/timezone', validator.postAdminTimezone, adminControllers.postTimezone);
router.put('/admin/user/timezone', validator.putAdminTimezone, adminControllers.putTimezone);
router.delete('/admin/user/timezone', validator.deleteAdminTimezone, adminControllers.deleteTimezone);
router.put('/admin/user/role', validator.putAdminUserRole, adminControllers.putUserRole);
router.get('/admin/user', validator.getAdminUser, adminControllers.getUser);
router.delete('/admin/user', validator.deleteAdminUser, adminControllers.deleteUser);
router.get('/admin/users', validator.getAdminUsers, adminControllers.getUsers);
router.post('/admin/user', validator.postSignup, adminControllers.createUser);

export default router;