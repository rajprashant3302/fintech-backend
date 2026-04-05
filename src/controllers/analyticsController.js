
const Transaction = require('../models/transactionModel');

const getSystemAnalytics = async (req, res) => {
    try {
        const { startDate, endDate } = req.query;
        let matchStage = { isDeleted: false };

        if (startDate || endDate) {
            matchStage.transactionDate = {};
            if (startDate) matchStage.transactionDate.$gte = new Date(startDate);
            if (endDate) matchStage.transactionDate.$lte = new Date(endDate);
        }

        const systemData = await Transaction.aggregate([
            { $match: matchStage },
            {
                $facet: {
                    platformTotals: [
                        {
                            $group: {
                                _id: null,
                                totalTransactions: { $sum: 1 },
                                totalPlatformVolume: { $sum: { $toDouble: "$amount" } }
                            }
                        },
                        { $project: { _id: 0 } }
                    ],
                    topUsersByActivity: [
                        {
                            $group: {
                                _id: "$userId",
                                transactionCount: { $sum: 1 },
                                totalMoneyManaged: { $sum: { $toDouble: "$amount" } }
                            }
                        },
                        { $sort: { transactionCount: -1 } },
                        { $limit: 5 },
                        {
                            $lookup: {
                                from: "User", 
                                localField: "userId",
                                foreignField: "_id",
                                as: "userDetails"
                            }
                        },
                        { $unwind: "$userDetails" },
                        {
                            $project: {
                                email: "$userDetails.email",
                                name:"$userDetails.name",
                                transactionCount: 1,
                                totalMoneyManaged: 1
                            }
                        }
                    ],
                    globalCategoryUsage: [
                        { $match: { type: "expense" } },
                        {
                            $group: {
                                _id: "$category",
                                totalSpentAcrossPlatform: { $sum: { $toDouble: "$amount" } },
                                usageCount: { $sum: 1 }
                            }
                        },
                        { $sort: { totalSpentAcrossPlatform: -1 } }
                    ]
                }
            }
        ]);

        return res.status(200).json({
            success: true,
            data: {
                platformTotals: systemData[0].platformTotals[0] || { totalTransactions: 0, totalPlatformVolume: 0 },
                topUsers: systemData[0].topUsersByActivity,
                globalCategoryTrends: systemData[0].globalCategoryUsage
            }
        });

    } catch (error) {
        console.error("System Analytics Error:", error);
        return res.status(500).json({ success: false, message: "Error generating system analytics" });
    }
};

module.exports={getSystemAnalytics};