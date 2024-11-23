const express = require('express');
const router = express.Router();
const UserController = require('../controllers/UserControllers/user');
const auth = require('../middleware/auth');

router.get('/getUserById', auth, UserController.getUserById);
router.post('/UserLogin', UserController.UserLogin);
router.post('/createUser',UserController.createUser);
router.put('/updateUser', auth, UserController.updateuser);
router.delete('/deleteUser', auth, UserController.deleteUser);

module.exports = router