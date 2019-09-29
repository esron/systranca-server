const mongoose = require('mongoose')
const User = require('./models/User')
const dbConfig = require('./config/db.js')

const connectUri = dbConfig.getConnectionURI();

mongoose.connect(
  connectUri,
  { useNewUrlParser: true },
  { useUnifiedTopology: true },
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
