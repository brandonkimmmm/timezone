import express from 'express';
import * as adminControllers from '../controllers/admin.controllers';
import * as authenticate from '../middleware/authenticate';
import * as validator from '../middleware/validator';
const router = express.Router();

router.get('/admin/user/timezones', [ authenticate.validateJwtToken, validator.adminGetTimezones ], adminControllers.getTimezones);
router.post('/admin/user/timezone', [ authenticate.validateJwtToken, validator.adminPostTimezone ], adminControllers.postTimezone);
router.put('/admin/user/timezone', [ authenticate.validateJwtToken, validator.adminPutTimezone ], adminControllers.putTimezone);
router.delete('/admin/user/timezone', [ authenticate.validateJwtToken, validator.adminDeleteTimezone ], adminControllers.deleteTimezone);
router.put('/admin/user/role', [ authenticate.validateJwtToken, validator.adminPutUserRole ], adminControllers.putUserRole);
router.get('/admin/user', [ authenticate.validateJwtToken, validator.adminGetUser ], adminControllers.getUser);
router.delete('/admin/user', [ authenticate.validateJwtToken, validator.adminDeleteUser ], adminControllers.deleteUser);
router.get('/admin/users', [ authenticate.validateJwtToken, validator.adminGetUsers ], adminControllers.getUsers);
router.post('/admin/user', [ authenticate.validateJwtToken, validator.signup ], adminControllers.createUser);

export default router;