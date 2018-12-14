const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const models = require('../models');
// const UserModel = models.UserModel;
const httpStatus = require('http-status');
const { check, validationResult } = require('express-validator/check');

const config = require('../config');
const APIError = require('../helpers/APIError');

/**
 * Login api
 */
/*
router.route('/login').post([
    check('userId','Ether Phone number or Email.').exists(),
    check('password', 'Passwords.').exists().isLength({ min: 8, max:15 })
], (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        let er= errors.mapped();
        let message = "";
        if(er.key) {message += er.userId.msg;}
        if(er.password) {message += er.password.msg;}
        return res.status(httpStatus.BAD_REQUEST).json({ 
            status:httpStatus.BAD_REQUEST,
            message 
        });
    }

    let query = { $or: [ { email: req.body.userId.toLowerCase() }, { userId: req.body.userId } ] };
    // console.log(JSON.stringify(query));
    UserModel.list(query)
        .then(users => {
            if(users.length == 0){
                throw new APIError("Email or Phone number or password are wrong.", httpStatus.UNAUTHORIZED, true);
                return null;
            }
            let user = users[0];
            return bcrypt.compare(req.body.password, user.password).then(status => [status, user]);
        }).then(([status, user]) =>{
            if(!status) {
                return res.status(httpStatus.UNAUTHORIZED)
                .json({
                    status: httpStatus.UNAUTHORIZED,
                    
                    message: "Phone No. or Email or Password are wrong. "
                });
            }
            let access = {
                _id: user._id,
                userId: user.userId,
                email: user.email,
                type: user.type
            };
            const token = jwt.sign(access, config.JWT_SECRET, {expiresIn: config.TOKEN_EXPIRES});
            // console.log(`Generated token for _id(${user._id}): ${token}\n`);
            return res.status(httpStatus.OK).json({
                status: httpStatus.OK,
                message:"Login is successful.",
                data : {
                    token: config.AUTH_SCHEME +' '+ token,
                    userId: user.userId,
                    email: user.email ? user.email: null,
                    name: user.name,
                    phoneNo: user.phoneNo,
                    type: user.type,
                }
            });
        })
        .catch(e => {
            const err = new APIError(e.message, e.status, true);
            next(err);
        });
});
*/

module.exports = router;