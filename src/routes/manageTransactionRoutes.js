const express=require('express');
const router = express.Router();
const apiLimiter = require('../middlewares/apiLimiter');
const authorizeRole = require('../middlewares/authorizeUserRole');
const verifyToken = require('../middlewares/verifyToken');
const {addMyRecord,getMyRecords,updateMyRecord,deleteMyRecord} = require('../controllers/userTransactionController');

router.post('/add',apiLimiter,verifyToken,addMyRecord);
router.get('/',apiLimiter,verifyToken,getMyRecords);
router.patch('/update/:id', apiLimiter,verifyToken, updateMyRecord); 
router.delete('/delete/:id',apiLimiter, verifyToken, deleteMyRecord);

module.exports=router;