require("dotenv").config();

const express = require('express');
const rateLimiter = require('./middlewares/globalRateLimiter');
const connectMongoDB = require('./config/connectDB');
const authRoutes=require('./routes/authRoutes');
const adminRoutes=require('./routes/manageUserRoutes');
const transactionRoutes=require('./routes/manageTransactionRoutes');
const transactionAdminRoutes=require('./routes/manageAdminTransactionRoutes');
const dashboardRoutes=require('./routes/dashboardRoutes')

const PORT = process.env.PORT || 5000;
const app = express();

app.use(express.json());

app.use(rateLimiter);


app.use('/health', (req, res) => {
    return res.json({ message: "Good to go chief" })
})

// auth routes
app.use('/api/auth',authRoutes);
app.use('/api/admin',adminRoutes);
app.use('/api/trans/my',transactionRoutes);
app.use('/api/admin/trans',transactionAdminRoutes);
app.use('/api/dashboard',dashboardRoutes)

connectMongoDB().then(() => {
    app.listen(PORT, () => {
        console.log(`Server Running at https://localhost:${PORT}`);
    })
})

