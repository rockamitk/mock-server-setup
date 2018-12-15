const config = {
  PORT: '3000',
  JWT_SECRET: '1e119878-fe9f-11e8-8eb2-f2801f1b9fd1',//APP key
  AUTH_SCHEME: "Bearer", 
  MONGO: {
    HOST: '127.0.0.1',
    PORT: '27017',
    DB: 'mockup_db'
  },
  TOKEN_DURATION: 60*60*24*10,//10days
  HASH_LEVEL: 8,//encryption has level,
  USER_TYPE: ["owner","admin"],
  CRUD: ["GET","PUT","POST","DELETE"]
};

module.exports = config;