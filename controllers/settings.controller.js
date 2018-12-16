/**
 * @author Amit Kumar Sah
 * @email akamit400@mail.com
 * @create date 2018-12-15 18:35:16
 * @modify date 2018-12-16 20:17:27
 * @desc [description]
*/

const httpStatus = require('http-status');
const { check, validationResult } = require('express-validator/check');
const mongoose = require('mongoose');

const APIError = require('../helpers/APIError');
const models = require('../models');
const ProjectModel = models.ProjectModel;
const APIModel = models.APIModel;
const config = require('../config');

const isValidPath = (str)=> {
    //write regex
    return true;
}

/** Create project having valid user */
const createProject = (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        let er= errors.mapped();
        let data = {};
        if(er.name) {data.name = er.name.msg;}
        return res.status(httpStatus.BAD_REQUEST).json({ status: httpStatus.BAD_REQUEST, message:"Bad Request occured.", data });
    } 
    let project = new ProjectModel({
        name: req.body.name
    });
    
    project.projectIdName =  req.body.name;
    project.projectIdName = project.projectIdName.split(" ").join("").toLowerCase();
    project.ownerId = res.locals.user._id;// extract user(owner of project) object from token
    
    project.save().then(project => {
        return res.status(httpStatus.OK).json({
            name: project.name,
            name: project.projectIdName,
            ownerId: project.ownerId
        });
    })
    .catch(e => {
        console.log(e);
        const err = new APIError(e.message, e.status, true);
        next(err);
    });
};

/**
 * Create mock services(APIs)
 * These dummy apis can be integrate with front end app. 
 */
const createMockServices = (req, res, next) => {
    //Using Package Validation
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        let er= errors.mapped();
        let data = {};
        if(er.projectIdName) {data.projectIdName = er.projectIdName.msg;}
        if(er.mocks) {data.mocks = er.mocks.msg;}
        return res.status(httpStatus.BAD_REQUEST).json({ status: httpStatus.BAD_REQUEST, message:"Bad Request occured.", data });
    }

    let projectIdName = req.body.projectIdName.split(" ").join("").toLowerCase();

    /**
     * Manual validation Validation
     * servicePath: {userId}/{projectId}/[validate remaining paths along with query params]
     * method:["GET","PUT","POST","DELETE"]
     * output: The response on success api call.
     * input: Will be optional in case of GET, DELETE
     */
    let errorsResp = [];
    for(let i in req.body.mocks){
        let mock = req.body.mocks[i];
        let error = {};

        if(!(mock.method && config.CRUD.includes(mock.method.toUpperCase()))){
           error.method = "Method is not valid";
        }
        if(!(mock.servicePath && isValidPath(mock.servicePath))){
            error.servicePath = "API path is not valid";
        }
        if(!mock.output){
            error.output = "output response has required";
        }
        if(Object.keys(error).length)
        errorsResp.push(error);
    }

    if(errorsResp.length){
        return res.status(httpStatus.BAD_REQUEST)
        .json({ status: httpStatus.BAD_REQUEST, 
            message:"Bad Request occured.", 
            data : errorsResp 
        });
    }
    console.log("projectIdName & mocks array has valid data.");
    /** Sequential Query from various collections using promise chain */
    ProjectModel.findOne({projectIdName: projectIdName, isActive:true})
    .then(project =>{
        let path;//buildAPIpath => multiple times has used
        if(!project){
            //return to client
            res.status(httpStatus.NOT_FOUND).json({ status: httpStatus.NOT_FOUND, message:"Not found.", data:{projectIdName: "Project does not is exists."} });
            //Early break promise chain
            throw new Error("Project does not is exists.");
        }
        //Check newAPIs exists or not
        let pathsWithMethod = [];
        req.body.mocks.forEach(mock => {
            mock.servicePath = mock.servicePath.trim();
            //Check servicespath has forward slash
            if(mock.servicePath[0] !== "/"){
                mock.servicePath = `/${mock.servicePath}`;
            }
            path = `/api/mock/${res.locals.user._id.toString()}/${project.projectIdName}${mock.servicePath}`; 
            pathsWithMethod.push({path, methodName: mock.method.toUpperCase()});
        });
        let query = {isActive:true};
        query["$or"] = pathsWithMethod;
        return APIModel.find(query).then(apis => [apis, project]);
    })
    .then(([apis, project]) =>{
        if(apis.length){
            apis = apis.map(api => {
                return {servicePath: api.servicePath, path: api.path, method: api.methodName};
            });
            //Throw conflict Error
            res.status(httpStatus.CONFLICT).json({ status: httpStatus.CONFLICT, 
                message: "APIs path already exists.", 
                data: apis
            });
            //Early break promise chain
            throw new Error("APIs path already exists.");
        }
        /**Every service has validated, now can be insert */

        let docArray = [], input, output;
        req.body.mocks.forEach(mock => {
            path = `/api/mock/${res.locals.user._id.toString()}/${project.projectIdName}${mock.servicePath}`; 

            input = mock.input ? mock.input : null;
            if(input && (typeof input === "object" || Array.isArray(input))){
                input = JSON.stringify(input);
            }            

            //doc.output is string
            //Stringify object or array of obj
            //In case of html or text file must be convert to string utf-8 on client side
            output= mock.output ? mock.output : null;
            if(output && (typeof output === "object" || Array.isArray(output))){
                output = JSON.stringify(output);
            }

            docArray.push({
                methodName: mock.method.toUpperCase(),
                path,
                servicePath: `${mock.servicePath}`,
                input,//either null, string, or utf string
                output,//either JSON.stringify(obj or arrObj) or utf-8(html or text)
                ownerId: res.locals.user._id,
                projectId: project._id,
                accessUsers: [],//later update by admin to allow others,
                isActive: true//Flag used to represent active/delete doc
            });           
        });
        return APIModel.insertMany(docArray).then(apis => apis);
    })
    .then(apis =>{
        console.log(apis.length + " mock services has created successfully." );
        //Everything has executed successfully, now response full url paths
        apis = apis.map(api => {
            return {path: api.path, method: api.methodName, servicePath: api.servicePath};
        });
        return res.status(httpStatus.OK).json({ status: httpStatus.OK, 
            message: "Mock services has created.", 
            data: apis
        });
        /* -----------------DONE --------------------*/
    })
    .catch(e =>{
        console.log(e);
        const err = new APIError(e.message, e.status, true);
        next(err);
    });
};

/**
 * Get list of mock services
 * @param projectIdName: req.queury.projectIdName
 */
const getMockeServiceList = (req, res, next) => {
    //Using 3rd party Validation
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        let er= errors.mapped();
        let data = {};
        if(er.projectIdName) {data.projectIdName = er.projectIdName.msg;}
        return res.status(httpStatus.BAD_REQUEST).json({ status: httpStatus.BAD_REQUEST, message:"Bad Request occured.", data });
    }

    
    let query = {isActive:true};
    //optional
    if(req.query.projectIdName){
        query.projectIdName = req.query.projectIdName.split(" ").join("").toLowerCase();
    }
    //fetch only project._id
    ProjectModel.select(query, {_id:1, projectIdName:1})//call custom method
    .then(projectList =>{
        if(projectList.length == 0){
            //return blank list
            res.status(httpStatus.OK).json({ status: httpStatus.OK, message:"No active project exists", data: []});
            //Early break promise chain
            throw new Error("No active project has exists.");
        }
        query = {isActive:true};
        //Check user type== admin or other
        if(res.locals.user.type !== "admin"){
            //user can be either owner or others
            query["$or"] = [{ownerId: res.locals.user._id}, {accessUsers: res.locals.user._id}];
        }
        let projectIds =[];
        projectList.forEach(project=> projectIds.push(project._id));
        //projectIds has list of active projects
        query.projectId = {$in: projectIds};
        //Trigger API applying query
        return APIModel.find(query).then(apis => [apis, projectList]);
    })
    .then(([apis, projectList]) =>{
        console.log(apis.length + " mock services has fetched." );
        //return only important data
        apis = apis.map(api => {
            let project = projectList.find(project => project._id.equals(api.projectId));
            return {
                projectIdName: project ? project.projectIdName : null,
                path: api.path, 
                method: api.methodName, 
                servicePath: api.servicePath,
                ownerId: api.ownerId
            };
        });
        return res.status(httpStatus.OK).json({ status: httpStatus.OK, 
            message: "List of available mock services, can by trigger standalone", 
            data: apis
        });
        /**---------------------End--------------------- */
    })
    .catch(e =>{
        console.log(e);
        const err = new APIError(e.message, e.status, true);
        next(err);
    });
};

/**
 * Allow api access permissions to others
 * Can be triggered by only admin user's credentials
 * At least one recipient user._id has required
 * Avaialabel mathod will be POST, PUT, GET, DELETE
 */
const permitOtherUsersAccess = (req, res, next) => {
    //User access verified
    if(res.locals.user.type !== "admin"){
        return res.status(httpStatus.FORBIDDEN)
        .json({ status: httpStatus.FORBIDDEN, 
            message: "Access denied", 
            data : "Login-ed user has not allowed."
        });
    }

    //Using 3rd party, params Validation
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        let er= errors.mapped();
        let data = {};
        if(er.projectIdName) {data.projectIdName = er.projectIdName.msg;}
        if(er.users) {data.users = er.users.msg;}
        if(er.methods) {data.methods = er.methods.msg;}
        return res.status(httpStatus.BAD_REQUEST).json({ status: httpStatus.BAD_REQUEST, message:"Bad Request occured.", data });
    }


    //Minimum methods & users length check
    if(req.body.methods.length === 0 || req.body.users.length === 0){
        return res.status(httpStatus.BAD_REQUEST)
        .json({ status: httpStatus.BAD_REQUEST, 
            message:"Bad Request occured.", 
            data : "List users and methods must contains least one."
        });
    }

    let projectIdName = req.body.projectIdName.split(" ").join("").toLowerCase();

    let methods = [];//Filter & formatting
    req.body.methods.forEach(method => {
        method = method.toUpperCase();
        if(config.CRUD.includes(method))
        methods.push(method);
    });

    let userIds = [];//convert string to ObjectId
    req.body.users.forEach(userId => {
        try{
            let objectId = mongoose.Types.ObjectId(userId);
            console.log(objectId);
            userIds.push(objectId);    
        }catch(e){
            console.log(e)    
        }
    });

    /** Sequential Query from various collections using promise chain */
    ProjectModel.findOne({projectIdName: projectIdName, isActive:true})
    .then(project =>{
        if(!project){
            //return to client
            res.status(httpStatus.NOT_FOUND).json({ status: httpStatus.NOT_FOUND, message:"Not found.", data:{projectIdName: "Project does not is exists."} });
            //Early break promise chain
            throw new Error("Project does not is exists.");
        }
        console.log(`projectId: ${project._id} for projectIdName: ${projectIdName}`);

        let query = {projectId: project._id, isActive:true};
        query.methodName = {$in : methods};
        return APIModel.updateMany(query, {
            '$addToSet': {//insert only unique userId
                accessUsers: {
                    '$each': userIds// traverse each id from userIds
                }
            }
        }).then(response => response);
    })
    .then(response =>{
        console.log(response);
        return res.status(httpStatus.OK).json({ status: httpStatus.OK, 
            message: "Query execute successfully", 
            data: {
                totalMockServices: response.nModified,
                message: "Executed successfully.",
                methods,
                users:userIds
            }
        });
        /* -----------------DONE --------------------*/
    })
    .catch(e =>{
        console.log(e);
        const err = new APIError(e.message, e.status, true);
        next(err);
    });
};

module.exports = {
    createProject, createMockServices, getMockeServiceList, permitOtherUsersAccess
};