const express = require('express');
const router = express.Router();
const UserController = require('../controllers/UserControllers/user');

router.get('/getUserById', UserController.getUserById);
router.post('/createUser',UserController.createUser);
router.put('/updateUser', UserController.updateuser);
router.delete('/deleteUser', UserController.deleteUser);

module.exports = router