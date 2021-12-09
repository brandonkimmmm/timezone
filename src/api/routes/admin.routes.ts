import express from 'express';
import * as adminControllers from '../controllers/admin.controllers';
import * as authenticate from '../middleware/authenticate';
import * as validator from '../middleware/validator';
const router = express.Router();

router.get('/admin/user/timezones', [ authenticate.validateJwtToken, validator.getAdminTimezones ], adminControllers.getTimezones);
router.post('/admin/user/timezone', [ authenticate.validateJwtToken, validator.postAdminTimezone ], adminControllers.postTimezone);
router.put('/admin/user/timezone', [ authenticate.validateJwtToken, validator.putAdminTimezone ], adminControllers.putTimezone);
router.delete('/admin/user/timezone', [ authenticate.validateJwtToken, validator.deleteAdminTimezone ], adminControllers.deleteTimezone);
router.put('/admin/user/role', [ authenticate.validateJwtToken, validator.putAdminUserRole ], adminControllers.putUserRole);
router.get('/admin/user', [ authenticate.validateJwtToken, validator.getAdminUser ], adminControllers.getUser);
router.delete('/admin/user', [ authenticate.validateJwtToken, validator.deleteAdminUser ], adminControllers.deleteUser);
router.get('/admin/users', [ authenticate.validateJwtToken, validator.getAdminUsers ], adminControllers.getUsers);
router.post('/admin/user', [ authenticate.validateJwtToken, validator.postSignup ], adminControllers.createUser);

export default router;