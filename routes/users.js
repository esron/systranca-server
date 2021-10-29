const express = require('express')
const userController = require('../controllers/UserController')
const phoneController = require('../controllers/PhoneController')
const authController = require('../controllers/AuthController')

const router = express.Router()

/* Creates a new user. */
router.post(
  '/',
  authController.validateToken,
  userController.validate('createUser'),
  userController.createUser
)

/* GET users listing. */
router.get(
  '/',
  authController.validateToken,
  userController.listUsers
)

/* GET a user. */
router.get(
  '/:userId',
  authController.validateToken,
  userController.validate('getUser'),
  userController.getUser
)

/* Update a user. */
router.put(
  '/:userId',
  authController.validateToken,
  userController.validate('updateUser'),
  userController.updateUser
)

router.post(
  '/:userId/phones',
  authController.validateToken,
  phoneController.validate('setUserPhones'),
  phoneController.setUserPhones
)

router.post(
  '/:userId/pinCode',
  authController.validateToken,
  userController.createPinCode
)

router.put(
  '/:userId/pinCode',
  authController.validateToken,
  userController.updatePinCode
)

module.exports = router
