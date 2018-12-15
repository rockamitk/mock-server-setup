/**
 * @author Amit Kumar Sah
 * @email akamit400@mail.com
 * @create date 2018-12-15 18:48:49
 * @modify date 2018-12-15 18:48:49
 * @desc [description]
*/

const express= require('express');
const router = express.Router();

const settingsRoute = require('./settings.route');
const userRoute = require('./user.route');
const authRoute = require('./auth.route');
const mockRoute = require('./mock.route');

/** GET /health-check - Check service health */
router.get('/health-check', (req, res) =>{
  return res.json({status: 200, data:'OK'});
});

/**
 * Standard API signature
 * This routers has been bind with app on '/api' as base path. 
 * v1 : represent version of API
 * after v1: represent resource of API, indicate nature of Operations
 */
router.use('/v1/settings', settingsRoute);
router.use('/v1/users', userRoute);
router.use('/v1/auth', authRoute);

/** 
 * Created Mock Services, has been bind on below routes
 * Bind 'mock' instead of v1 to pull those 'mock' requests on it.
 * Due to inner paths are generics. 
 * For ex: `/api/mock/user._id/projectIdName/serviceName?*
*/
router.use('/mock', mockRoute);//:userId===UserModel._id

module.exports = router;