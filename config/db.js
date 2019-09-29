const config = require('./constants')
const { dbUser, dbPassword, dbHost, dbPort, dbName } = config;

module.exports = {
    getConnectionURI() {
      let connectUri = '';
      if (dbUser && dbPassword) {
        connectUri = `mongodb://${dbUser}:${dbPassword}@${dbHost}:${dbPort}/${dbName}?authSource=admin&w=1`;
      } else if (dbHost && dbPort && dbName) {
        connectUri = `mongodb://${dbHost}:${dbPort}/${dbName}?authSource=admin&w=1`;
      } else {
        connectUri = 'mongodb://localhost:27017';
      }
      return connectUri;
    }
  }
