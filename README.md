# mock-server-setup
Application to setup dummy services(APIs) along for various project.

Characteristics
1.Admin (top level task) can :
  >Register self, update his personal details & delete.
  >Add, update, get list and delete user(type: ‘owner’ non-admin)
  >Can grant / revoke project & its service access to/from other users.
  >Can behave as normal user also.

2.User(‘owner’) :
  >Can create projects, became owner default.
  >Can add, update, delete, get services mocks (APIs).
  >Can receive  `output` as response along various HTTP status code depends execution state.

3.System(Application) will
  >Suggest `projectIdName` from project’s name inputted by user.
  >Suggest api `path`& `serviceName` for unique path.
  >Validate standard url path.
  >Prevent duplicate
    ->API urls.
    ->Project name at user level.
    ->phone No, email(optional) used for login.
    ->Query parameters for same methods (Optional)

  >Mark soft delete for every records instead actual delete from database.
  >Accept phone No or email(optional) as userId/username along with password.
  >Switch user’s role by user type while login or extract token.
  >Accept always token in headers to access APIs. (part of API throttling)
  >Not allowed to access API even token is valid but user has deleted.(part of API throttling)
  >Validate every time, active users, projects & mock services. 
  >Response with various status code
    200 - success
    404 - API or data does not exist based on query params
    401 - Unauthorized access(On invalid login, token expires and user deleted)
    403 - Permission denied (Not allowed access by user)
    500 - System error(Syntax error in App.)
    503 - Timeout
    409 - Conflict (Duplicate user’s name, email and phone, project & API names)

Schema Design
  1.Users
    _id: ObjectId //Used as ownerId generic APIs path
    phoneNo: {type: String,unique: true},//login username
    name: {type: String, required: true, trim: true},
    email: {type: String, trim: true},//login username optional
    password: {type: String,required: true,trim: true},
    type: {type: String, default: "owner"},//type:[“admin”,”owner”]
    isActive: {type: Boolean, default: true}//Mark soft deletion
  
  2.Project
     _id: ObjectId
    name: {type: String,required: true},(input by user)
    projectIdName: String,//Used in generic APIs path
    ownerId: Schema.ObjectId,//ref UserModel._id
    isActive: {type: Boolean, default: true}
  
  3.API
    _id: ObjectId
    methodName: {type: String},//GET, PUT, POST, DELETE
    path: {type: String},//api/mock/:ownerId/:projectIdName/:servicePath
    servicePath: {type: String},//:servicePath => at least 1 params, query
    input: {type: String, trim: true},//Req body for POST and POST
    output: {type: String, trim: true},//Expected response from mock api 
    ownerId: Schema.ObjectId,//ref UserModel._id
    projectId: Schema.ObjectId,//ref ProjectModel._id
    accessUsers:[Schema.Types.ObjectId],//ref Other UserModel._id
    isActive: {type: Boolean, default: true}

Modular Application Structure
mock-server-setup
|---controllers	 => Set of methods, processing query, bind response
|---helpers		 => Set of methods used globally
|---models       => Declaration, initilisation schema
|---routes	     => Bind API url to dedicated controller's method
|---.gitignore	 => skip file, dir to push on git
|---config.js	 => Having constant data required for app, ex: database, user role details
|---package.json => App details & 3rd party dependencies along version
|---server.js    => Application starter, bind route connect db, bind middleware

Available APIs. 

**For more details, read method's comments written settings.route.js 
┌────────┬──────────────────────────────────┐
│ Method │ Path                             │
├────────┼──────────────────────────────────┤
│ POST   │ /api/v1/settings/project/create  │
├────────┼──────────────────────────────────┤
│ POST   │ /api/v1/settings/mock/create     │
├────────┼──────────────────────────────────┤
│ GET    │ /api/v1/settings/mock/list       │
├────────┼──────────────────────────────────┤
│ PUT    │ /api/v1/settings/mock/permission │
└────────┴──────────────────────────────────┘

**For more details, read method's comments written users.route.js 
┌────────┬────────────────────────┐
│ Method │ Path                   │
├────────┼────────────────────────┤
│ GET    │ /api/v1/users/get_list │
└────────┴────────────────────────┘

**For more details, read method's comments written auth.route.js 
┌────────┬─────────────────────┐
│ Method │ Path                │
├────────┼─────────────────────┤
│ POST   │ /api/v1/auth/signup │
├────────┼─────────────────────┤
│ POST   │ /api/v1/auth/login  │
└────────┴─────────────────────┘

**For more details, read method's comments written mock.route.js 
┌────────┬─────────────────────────────────────────────────────┐
│ Method │ Path                                                │
├────────┼─────────────────────────────────────────────────────┤
│ GET    │ /api/v1/mock/:ownerId/:projectIdName/:servicePath*? │
├────────┼─────────────────────────────────────────────────────┤
│ POST   │ /api/v1/mock/:ownerId/:projectIdName/:servicePath*? │
├────────┼─────────────────────────────────────────────────────┤
│ PUT    │ /api/v1/mock/:ownerId/:projectIdName/:servicePath*? │
├────────┼─────────────────────────────────────────────────────┤
│ DELETE │ /api/v1/mock/:ownerId/:projectIdName/:servicePath*? │
└────────┴─────────────────────────────────────────────────────┘
