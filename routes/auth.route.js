const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const models = require('../models');
const UserModel = models.UserModel;
const httpStatus = require('http-status');
const { check, validationResult } = require('express-validator/check');

const config = require('../config');
const APIError = require('../helpers/APIError');
const Controllers = require('../controllers');

/**
 * DECLARE ROUTEs ARE OPEN  
 * NO TOKENs HAS REQUIRED 
 */

 /**
  * Signup users
  */
router.route('/signup').post([
    check('email','Invalid email.').optional().isEmail(),
    check('name', 'Name has required with min 3 and max 30 chars').exists().isLength({min: 3, max: 30 })
    .matches(/^([0-9A-z\ \_\.\/\-]+)$/, 'g').withMessage("Name has invalid characters"),
    check('password', 'Passwords has required with 6-10 alphanumerics chars.').exists().isLength({ min: 6, max: 10 }),
    check('phoneNo', 'Phone number has required with min 10 digits.').exists().isLength({ min: 10, max:13 }),
    check('type', 'User type has required.').exists()
], Controllers.UserController.addUser);

//Login api
router.route('/login').post([
    check('username','Ether Phone number or Email.').exists(),
    check('password', 'Passwords has required with 6-10 alphanumeric chars.').exists().isLength({ min: 6, max:10 })
], (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        let er = errors.mapped();
        if(er.username) {message += er.username.msg;}
        if(er.password) {message += er.password.msg;}
        return res.status(httpStatus.BAD_REQUEST).json({status:httpStatus.BAD_REQUEST, message:"" });
    }

    let query = { $or: [ { email: req.body.username.toLowerCase() }, { phoneNo: req.body.username} ] };
    query.isActive = true;//Get active users
    UserModel.findOne(query)
    .then(user => {
        if(!user){
            throw new APIError("username email,phone number or password was wrong.", httpStatus.UNAUTHORIZED, true);
            return null;
        }
        if(!config.USER_TYPE.includes(user.type)){
            throw new APIError("Invalid user's type.", httpStatus.UNAUTHORIZED, true);
            return null;
        }
        //compare password
        return bcrypt.compare(req.body.password, user.password).then(status => [status, user]);
    }).then(([status, user]) =>{
        if(!status) {
            return res.status(httpStatus.UNAUTHORIZED)
            .json({
                status: httpStatus.UNAUTHORIZED,
                
                message: "Phone No. or Email or Password are wrong. "
            });
        }
        //Include object in token
        let access = {
            _id: user._id,
            phoneNo: user.phoneNo,
            email: user.email ? user.email:null,
            type: user.type
        };
        const token = jwt.sign(access, config.JWT_SECRET, {expiresIn: config.TOKEN_DURATION});
        // console.log(`Token (${user._id}): ${token}`);
        return res.status(httpStatus.OK).json({
            status: httpStatus.OK,
            message: "Valid credentials",
            data : {
                token: config.AUTH_SCHEME +' '+ token,//set Headers.Authorization for APIs access
                name: user.name,
                phoneNo: user.phoneNo,
                email: user.email ? user.email: null,
                type: user.type
            }
        });
    })
    .catch(e => {
        const err = new APIError(e.message, e.status, true);
        next(err);
    });
});

module.exports = router;