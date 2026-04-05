const express = require('express');
const router = express.Router();
const verifyToken = require('../middlewares/verifyToken');
const authorizeRole = require('../middlewares/authorizeUserRole');
const apiLimiter=require('../middlewares/apiLimiter')
const { getPersonalDashboard } = require('../controllers/userDashboardController');
const { getSystemAnalytics } = require('../controllers/analyticsController');

router.get('/my', apiLimiter,verifyToken, getPersonalDashboard);

router.get(
    '/analytics', 
    apiLimiter,
    verifyToken, 
    authorizeRole('admin', 'analyst'), 
    getSystemAnalytics
);

module.exports = router;