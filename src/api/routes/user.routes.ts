import express from 'express';
import * as userControllers from '../controllers/user.controllers';
import * as authenticate from '../middleware/authenticate';
import * as validator from '../middleware/validator';
const router = express.Router();

router.get('/user', authenticate.validateJwtToken, userControllers.get);
router.get('/user/timezones', authenticate.validateJwtToken, userControllers.getTimezones);
router.post('/user/timezone', [ authenticate.validateJwtToken, validator.postUserTimezone ], userControllers.postTimezone);
router.put('/user/timezone', [ authenticate.validateJwtToken, validator.putUserTimezone ], userControllers.putTimezone);
router.delete('/user/timezone', [ authenticate.validateJwtToken, validator.deleteUserTimezone ], userControllers.deleteTimezone);

export default router;