const express = require('express');
const router = express.Router();
const apiLimiter = require('../middlewares/apiLimiter');
const {registerUser,loginUser}=require('../controllers/authController')

router.post('/register',apiLimiter,registerUser)
router.post('/login',apiLimiter,loginUser)

module.exports=router;