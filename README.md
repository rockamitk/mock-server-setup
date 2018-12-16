# Mock Server Setup

Application to setup dummy services(APIs) along for various project.

## Getting Started

These instructions will get you a copy of the project up and running on your local machine for development and testing purposes.

### Prerequisites

```
Install Node, MongoDB
```

### Install

```
npm install
```

```
node server.js
```
#### For more details, read method's comments written settings.route.js 
```
[POST]/api/v1/settings/project/create.
[POST]/api/v1/settings/mock/create.
[GET]/api/v1/settings/mock/list.   
[PUT]/api/v1/settings/mock/permission.
```
#### For more details, read method's comments written users.route.js 
```
/api/v1/users/get_list[GET]
```
#### For more details, read method's comments written auth.route.js 
```
[POST]/api/v1/auth/signup,
[POST]/api/v1/auth/login,
For more details, read method's comments written mock.route.js 
[GET] /api/v1/mock/:ownerId/:projectIdName/:servicePath? │
[POST] /api/v1/mock/:ownerId/:projectIdName/:servicePath? │
[PUT /api/v1/mock/:ownerId/:projectIdName/:servicePath? │
[DELETE] /api/v1/mock/:ownerId/:projectIdName/:servicePath? │
```

#### Characteristics:
1.Admin (top level task) can :
  1.1 Register self, update his personal details & delete.
  1.2 Add, update, get list and delete user(type: ‘owner’ non-admin).
  1.3 Can grant / revoke project & its service access to/from other users.
  1.4 Can behave as normal user also.

2.User(‘owner’) :
  2.2 Can create projects, became owner default.
  2.2 Can add, update, delete, get services mocks (APIs).
  2.2 Can receive  `output` as response along various HTTP status code depends execution state.

3.System(Application) will :
  3.1 Suggest `projectIdName` from project’s name inputted by user.
  3.2 Suggest api `path`& `serviceName` for unique path. 
  3.3 Validate standard url path. 
  3.4 Prevent duplicate. 
    `API urls.`
    `Project name at user level.`
    `phone No, email(optional) used for login.`
    `Query parameters for same methods (Optional).`
  3.5 Mark soft delete for every records instead actual delete from database.
  3.5 Accept phone No or email(optional) as userId/username along with password.
  3.6 Switch user’s role by user type while login or extract token.
  3.7 Accept always token in headers to access APIs. (part of API throttling).
  3.8 Not allowed to access API even token is valid but user has deleted.(part of API throttling).
  3.9 Validate every time, active users, projects & mock services. 
  3.11 Response with various status code
    `200` - success
    `404` - API or data does not exist based on query params
    `401` - Unauthorized access(`On invalid login, token expires and user deleted`).
    `403` - Permission denied (`Not allowed access by user`).
    `500` - System error(Syntax error in App.).
    `503` - Timeout.
    `409` - Conflict (Duplicate user’s name, email and phone, project & API names)

Schema Design

  1.Users
   ` _id: ObjectId //Used as ownerId generic APIs path
    phoneNo: {type: String,unique: true},//login username
    name: {type: String, required: true, trim: true},
    email: {type: String, trim: true},//login username optional
    password: {type: String,required: true,trim: true},
    type: {type: String, default: "owner"},//type:[“admin”,”owner”]
    isActive: {type: Boolean, default: true}//Mark soft deletion`
  
  2.Project
     `_id: ObjectId
    name: {type: String,required: true},(input by user)
    projectIdName: String,//Used in generic APIs path
    ownerId: Schema.ObjectId,//ref UserModel._id
    isActive: {type: Boolean, default: true}`
  
  3.API
    `_id: ObjectId
    methodName: {type: String},//GET, PUT, POST, DELETE
    path: {type: String},//api/mock/:ownerId/:projectIdName/:servicePath
    servicePath: {type: String},//:servicePath => at least 1 params, query
    input: {type: String, trim: true},//Req body for POST and POST
    output: {type: String, trim: true},//Expected response from mock api 
    ownerId: Schema.ObjectId,//ref UserModel._id
    projectId: Schema.ObjectId,//ref ProjectModel._id
    accessUsers:[Schema.Types.ObjectId],//ref Other UserModel._id
    isActive: {type: Boolean, default: true}`

Modular Application Structure
mock-server-setup
`|---controllers`	 => Set of methods, processing query, bind response
`|---helpers`		 => Set of methods used globally
`|---models`       => Declaration, initilisation schema
`|---routes`	     => Bind API url to dedicated controller's method
`|---.gitignore`	 => skip file, dir to push on git
`|---config.js`	 => Having constant data required for app, ex: database, user role details
`|---package.json` => App details & 3rd party dependencies along version
`|---server.js`    => Application starter, bind route connect db, bind middleware

