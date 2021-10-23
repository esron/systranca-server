const mongoose = require('mongoose')
const User = require('./models/User')
const dbConfig = require('./config/db.js')

const connectUri = dbConfig.getConnectionURI()

mongoose.connect(
  connectUri,
  { useNewUrlParser: true },
  { useUnifiedTopology: true }
)
  .then(
    () => {
      console.log('Connection with database established')
    },
    err => {
      throw new Error(err)
    }
  )

const adminUser = {
  name: 'SuperUser',
  email: 'admin@admin.com',
  status: 'enabled',
  password: 'adminadmin'
}

User.findOne({ email: adminUser.email })
  .then(user => {
    if (!user) return User.create(adminUser)
    else console.log('Skipping admin user creation, since is already created')
  })
  .then(createdUser => {
    if (createdUser) console.log(`User ${createdUser.name} created successfully`)
  })
  .catch(err => {
    console.log('There was an error creating the Superuser')
    throw new Error(err)
  }).finally(() => {
    process.exit(0)
  })
