const express=require('express');
const router = express.Router();
const apiLimiter = require('../middlewares/apiLimiter');
const authorizeRole = require('../middlewares/authorizeUserRole');
const verifyToken = require('../middlewares/verifyToken');
const {blockUser,listUsers ,updateRole,searchUser}= require('../controllers/mangeUserController')


router.patch('/user/status',apiLimiter,verifyToken , authorizeRole('admin'),blockUser);
router.get('/all-users',apiLimiter,verifyToken , authorizeRole('admin'),listUsers);
router.patch('/update-role',apiLimiter,verifyToken , authorizeRole('admin'),updateRole);
router.get('/search',apiLimiter,verifyToken , authorizeRole('admin'),searchUser);

module.exports=router;