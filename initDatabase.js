const mongoose = require('mongoose')
const config = require('./config')
const User = require('./models/User')

const connectUri = `mongodb://${config.dbUser}:${config.dbPassword}@${config.dbHost}:${config.dbPort}/${config.dbName}?authSource=admin&w=1`

console.log("TCL: connectUri", connectUri)
mongoose.connect(
  connectUri,
  { useNewUrlParser: true }
)
  .then(
    () => {
      console.log('Connection with database established')
    },
    err => {
      throw new Error(err)
    }
  )

User.create({
  name: 'SuperUser',
  email: 'admin@admin.com',
  status: 'enabled',
  password: 'adminadmin'
})
  .then(user => {
    console.log(`User ${user.name} created successflully`)
  })
  .catch(err => {
    console.log('There was an error creating the Superuser')
    throw new Error(err)
  })
