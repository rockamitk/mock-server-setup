/**
 * @author Amit Kumar Sah
 * @email akamit400@mail.com
 * @create date 2018-12-15 18:49:32
 * @modify date 2018-12-16 20:18:43
 * @desc [description]
*/

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