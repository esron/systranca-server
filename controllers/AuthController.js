const AuthController = {}

AuthController.issueToken = (req, res) => {
  return res.status(200).send('VEm')
}

module.exports = AuthController
