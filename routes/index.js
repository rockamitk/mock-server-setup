const express= require('express');
const router = express.Router();

const projectRoute = require('./project.route');
const userRoute = require('./user.route');
const authRoute = require('./auth.route');

/** GET /health-check - Check service health */
router.get('/health-check', (req, res) =>
  res.send('OK')
);

router.use('/v1/projects', projectRoute);
router.use('/v1/users', userRoute);
router.use('/v1/auth', authRoute);
//console.log(router);
module.exports = router;