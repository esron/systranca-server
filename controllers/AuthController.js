const jwt = require('jsonwebtoken')

const User = require('../models/User')

const AuthController = {}

AuthController.issueToken = (req, res) => {
  const { name, password } = req.body

  User.findOne({ name, password }).then(user => {
    if (user) {
      var tokenData = { id: user.id, name: user.name }

      var token = jwt.sign(tokenData, process.env.SECRET, { expiresIn: '1h' })

      res.status(200).send({ token })
    } else {
      res.status(401).send({
        error: 'Invalid username or password'
      })
    }
  })
}

AuthController.validateToken = (req, res) => {
  jwt.verify(req.headers['x-access-token'], process.env.SECRET, function (
    err,
    decoded
  ) {
    if (err) {
      res.json({ status: 'error', message: err.message, data: null })
    } else {
      req.body.userId = decoded.id
      next()
    }
  })
}

module.exports = AuthController
