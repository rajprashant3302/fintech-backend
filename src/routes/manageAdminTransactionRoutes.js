const express=require('express');
const router = express.Router();
const apiLimiter = require('../middlewares/apiLimiter');
const authorizeRole = require('../middlewares/authorizeUserRole');
const verifyToken = require('../middlewares/verifyToken');
const {addRecord,getAllRecords, updateRecord, deleteRecord} = require('../controllers/adminTransactionController');

router.post('/add',apiLimiter,verifyToken,authorizeRole('admin'),addRecord);
router.get('/all',apiLimiter,verifyToken,authorizeRole('admin','analyst'),getAllRecords);
router.patch('/update/:id',apiLimiter,verifyToken,authorizeRole('admin'),updateRecord);
router.delete('/delete/:id',apiLimiter,verifyToken,authorizeRole('admin'),deleteRecord);

module.exports=router;