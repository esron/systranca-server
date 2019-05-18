const express = require('express')
const authController = require('../controllers/AuthController')

const router = express.Router()

router.post(
  '/token',
  authController.issueToken
)

module.exports = router
