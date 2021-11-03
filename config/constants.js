require('dotenv').config()

module.exports = {
  secret: process.env.SECRET,
  dbUser: process.env.DB_USER,
  dbPassword: process.env.DB_PASS,
  dbHost: process.env.DB_HOST,
  dbPort: process.env.DB_PORT,
  dbName: process.env.DB_NAME,
  mqttUri: process.env.MQTT_URI
}
