const express = require('express')
const authController = require('../controllers/AuthController')

const router = express.Router()

/** Issues a JWT */
router.post(
  '/token',
  authController.validate('issueToken'),
  authController.issueToken
)

module.exports = router
