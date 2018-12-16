/**
 * @author Amit Kumar Sah
 * @email akamit400@mail.com
 * @create date 2018-12-15 18:48:59
 * @modify date 2018-12-15 18:48:59
 * @desc [description]
*/

const express = require('express');
const router = express.Router();
const { check, validationResult } = require('express-validator/check');
const Controllers = require('../controllers');
const UserModel = require('../models').UserModel;
const jwt = require('jsonwebtoken');

/**
 * Middleware to validate active users 
 */
router.use('*', (req, res, next) => {
    if(req.headers.authorization){
        let decrypt = jwt.decode(req.headers.authorization.split(' ')[1]);
        //Introduce any cache scheme
        UserModel.get(decrypt._id).then(user => {
            if(user){
                /**
                 * assign user to global res.locals obj
                 * accesible from any controller, routes
                 */
                res.locals.user = {
                    _id: user._id,
                    type: user.type
                }
                console.log("\nLogin user details:", res.locals.user, "name:"+ user.name);
                next();
            }else{
                return res.status(httpStatus.FORBIDDEN).json({ status:httpStatus.FORBIDDEN, 
                    message:"Unauthorized access. " 
                });
            }
        });
    }else{
        return res.status(httpStatus.FORBIDDEN).json({ status:httpStatus.FORBIDDEN, 
            message:"Unauthorized access. " 
        });
    }
});


router.route('/:ownerId/:projectIdName/:servicePath*?').get([
    check('ownerId', 'Project\'s owner id has required.').exists(),
    check('projectIdName', 'Project name has required.').exists(),
    check('servicePath', 'Service path has required.').exists()
], Controllers.MockController.getGenericMockData);

router.route('/:ownerId/:projectIdName/:servicePath*?').post([
    check('ownerId', 'Project\'s owner id has required.').exists(),
    check('projectIdName', 'Project name has required.').exists(),
    check('servicePath', 'Service path has required.').exists()
], Controllers.MockController.getGenericMockData);

router.route('/:ownerId/:projectIdName/:servicePath*?').put([
    check('ownerId', 'Project\'s owner id has required.').exists(),
    check('projectIdName', 'Project name has required.').exists(),
    check('servicePath', 'Service path has required.').exists()
], Controllers.MockController.getGenericMockData);

router.route('/:ownerId/:projectIdName/:servicePath*?').delete([
    check('ownerId', 'Project\'s owner id has required.').exists(),
    check('projectIdName', 'Project name has required.').exists(),
    check('servicePath', 'Service path has required.').exists()
], Controllers.MockController.getGenericMockData);

//print available API on terminal
require('../helpers/api.stack')('/api/v1/mock', router.stack, "mock router, generic paths");

module.exports = router;