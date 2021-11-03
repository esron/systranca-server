const express = require('express')
const authController = require('../controllers/AuthController')
const doorController = require('../controllers/DoorController')

const router = express.Router()

router.post(
  '/',
  authController.validateToken,
  doorController.validate(),
  doorController.openDoor
)

module.exports = router
