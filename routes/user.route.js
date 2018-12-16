/**
 * @author Amit Kumar Sah
 * @email akamit400@mail.com
 * @create date 2018-12-15 18:49:17
 * @modify date 2018-12-15 18:49:17
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

/**
 * Get the list owners
 * access by admin
 * Can be used grant permission for mock services as others 
 */
router.route('/get_list').get([
], Controllers.UserController.getOwnerList);

//print available API on terminal
require('../helpers/api.stack')('/api/v1/users', router.stack, "User router.");

module.exports = router;