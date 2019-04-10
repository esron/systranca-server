const express = require('express');
const router = express.Router();
const userController = require('../controllers/UserController');

/* Creates a new user */
router.post(
  '/',
  userController.validate('createUser'),
  userController.createUser
);

/* GET users listing. */
router.get(
  '/',
  userController.listUsers
);


router.get(
  '/:userId',
  userController.validate('getUser'),
  userController.getUser
)
module.exports = router;
