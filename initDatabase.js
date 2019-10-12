const mongoose = require('mongoose')
const config = require('./config')
const User = require('./models/User')

const connectUri = `mongodb://${config.dbUser}:${config.dbPassword}@${config.dbHost}:${config.dbPort}/${config.dbName}?authSource=admin&w=1`

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

const adminUser = {
  name: 'SuperUser',
  email: 'admin@admin.com',
  status: 'enabled',
  password: 'adminadmin'
}

User.findOne({ email: adminUser.email })
  .then(user => {
    if (!user) return User.create(adminUser)
    else console.log(`Skipping admin user creation, since is already created`)
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
