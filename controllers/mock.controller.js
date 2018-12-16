/**
 * @author Amit Kumar Sah
 * @email akamit400@mail.com
 * @create date 2018-12-15 18:35:16
 * @modify date 2018-12-15 18:54:23
 * @desc [description]
*/

const httpStatus = require('http-status');
const { check, validationResult } = require('express-validator/check');
const APIError = require('../helpers/APIError');
const models = require('../models');
const ProjectModel = models.ProjectModel;
const APIModel = models.APIModel;
const config = require('../config');
const url = require('url');

const isValidPath = (str)=> {
    //write regex
    return true;
}

/**
 * Generic mock services(APIs)
 */
const getGenericMockData = (req, res, next) => {
    //Using 3rd party Validation
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        let er= errors.mapped();
        let data = {};
        if(er.ownerId) {data.ownerId = er.ownerId.msg;}
        if(er.projectIdName) {data.projectIdName = er.projectIdName.msg;}
        if(er.servicePath) {data.servicePath = er.servicePath.msg;}
        return res.status(httpStatus.BAD_REQUEST).json({ status: httpStatus.BAD_REQUEST, message:"Bad Request occured.", data });
    }

    let projectIdName = req.params.projectIdName.split(" ").join("").toLowerCase();
    console.log("\nCheck project has isActive?true:false");
    /** Sequential Query from various collections using promise chain */
    ProjectModel.findOne({projectIdName: projectIdName, isActive:true})
    .then(project =>{
        let path;//buildAPIpath => multiple times has used
        if(!project){
            //return to client
            res.status(httpStatus.NOT_FOUND).json({ status: httpStatus.NOT_FOUND, message:"Not found", data: {projectIdName: "No active project has exists."} });
            //Early break promise chain
            throw new Error("No active project has exists.");
        }
        console.log(`Project: ${project.projectIdName} is active`);
        const urlObj = url.parse(req.originalUrl);
        //Get data on path, methodName
        return APIModel.findOne({path: urlObj.pathname, methodName: req.method, isActive:true}).then(api => [api, project]);
    })
    .then(([api, project]) =>{
        if(!api){
            //Throw 'not found' Error
            res.status(httpStatus.NOT_FOUND).json({ status: httpStatus.NOT_FOUND, message:"Not found", data: {path: "No active service has found."} });
            //Early break promise chain
            throw new Error("No active service has found.");
        }

        //Parse if JSON
        let output = api.output;
        try {
            output = JSON.parse(api.output);
            console.log("Output: ",output);
        } catch (e) {
            console.log(`Can't parse output for path ${api.path}`);
        }

        if(res.locals.user.type === "admin" || api.ownerId.equals(res.locals.user._id) || api.accessUsers.indexOf(res.locals.user._id) != -1){
            //login ed user has authorized access
            return res.status(httpStatus.OK).json({ status: httpStatus.OK, 
                message: "Mock service executed successfully.",
                data: output
            });
        }else{
            //login ed user hasn't authorized access.
            return res.status(httpStatus.FORBIDDEN).json({ status: httpStatus.FORBIDDEN, 
                message: "Access denied.",
                data: {
                    message: "User access has denied."
                }
            });
        }
        /**---------------------End--------------------- */
    })
    .catch(e =>{
        console.log(e);
        const err = new APIError(e.message, e.status, true);
        next(err);
    });
};

module.exports = {
    getGenericMockData
};