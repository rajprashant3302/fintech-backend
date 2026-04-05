const mongoose = require('mongoose');
const Transaction = require('../models/transactionModel');

const getPersonalDashboard = async (req, res) => {
    try {
        const userId = req.user.userId;

        const dashboardData = await Transaction.aggregate([
            { 
                $match: { userId: userId, isDeleted: false } 
            },
            {
                $facet: {
                    overview: [
                        {
                            $group: {
                                _id: null,
                                totalIncome: { $sum: { $cond: [{ $eq: ["$type", "income"] }, { $toDouble: "$amount" }, 0] } },
                                totalExpense: { $sum: { $cond: [{ $eq: ["$type", "expense"] }, { $toDouble: "$amount" }, 0] } }
                            }
                        },
                        {
                            $project: {
                                _id: 0,
                                totalIncome: 1,
                                totalExpense: 1,
                                netBalance: { $subtract: ["$totalIncome", "$totalExpense"] }
                            }
                        }
                    ],
                    expenseByCategory: [
                        { $match: { type: "expense" } },
                        { $group: { _id: "$category", total: { $sum: { $toDouble: "$amount" } } } },
                        { $sort: { total: -1 } }
                    ],
                    monthlyTrends: [
                        {
                            $group: {
                                _id: { 
                                    year: { $year: "$transactionDate" }, 
                                    month: { $month: "$transactionDate" } 
                                },
                                income: { $sum: { $cond: [{ $eq: ["$type", "income"] }, { $toDouble: "$amount" }, 0] } },
                                expense: { $sum: { $cond: [{ $eq: ["$type", "expense"] }, { $toDouble: "$amount" }, 0] } }
                            }
                        },
                        { $sort: { "_id.year": -1, "_id.month": -1 } },
                        { $limit: 6 }
                    ],
                    recentActivity: [
                        { $sort: { transactionDate: -1 } },
                        { $limit: 5 },
                        { $project: { amount: { $toDouble: "$amount" }, type: 1, category: 1, transactionDate: 1, notes: 1 } }
                    ]
                }
            }
        ]);

        const result = dashboardData[0];

        return res.status(200).json({
            success: true,
            data: {
                overview: result.overview[0] || { totalIncome: 0, totalExpense: 0, netBalance: 0 },
                expenseByCategory: result.expenseByCategory,
                monthlyTrends: result.monthlyTrends,
                recentActivity: result.recentActivity
            }
        });

    } catch (error) {
        console.error("Personal Dashboard Error:", error);
        return res.status(500).json({ success: false, message: "Error generating dashboard" });
    }
};

module.exports={getPersonalDashboard}