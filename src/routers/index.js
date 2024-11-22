const router = require("express").Router();
const UserRouters = require('./userRouters')

router.use('/user', UserRouters);

module.exports = router