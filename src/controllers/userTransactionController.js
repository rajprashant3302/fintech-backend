const transactionModel = require('../models/transactionModel');
const mongoose = require('mongoose');

require('dotenv').config();

const addMyRecord = async (req, res) => {
    const session = await mongoose.startSession();

    session.startTransaction();
    try {
        const { amount, type, category, notes, transactionDate } = req.body;
        const user = req.user;

        if (!amount || !type || !category) {
            return res.status(400).json({
                success: false,
                message: "Amount, type, and category are required"
            });
        }

        if (amount <= 0) {
            return res.status(400).json({
                success: false,
                message: "Invalid amount. Must be greater than 0."
            });
        }

        const allowedCategory = ['food', 'clothing', 'education', 'rent', 'loan', 'others', 'none'];
        const allowedtype = ['income', 'expense'];

        if (!allowedtype.includes(type) || !allowedCategory.includes(category)) {
            return res.status(400).json({
                success: false,
                message: "Invalid type or category!"
            });
        }

        //balance check
        if (type === 'expense') {
            const balanceCheck = await transactionModel.aggregate([
                {
                    $match: {
                        userId: new mongoose.Types.ObjectId(user.userId),
                        isDeleted: false
                    }
                },
                {
                    $group: {
                        _id: null,
                        totalIncome: { $sum: { $cond: [{ $eq: ["$type", "income"] }, { $toDouble: "$amount" }, 0] } },
                        totalExpense: { $sum: { $cond: [{ $eq: ["$type", "expense"] }, { $toDouble: "$amount" }, 0] } }
                    }
                }
            ]).session(session);

            const stats = balanceCheck[0] || { totalIncome: 0, totalExpense: 0 };
            const currentBalance = stats.totalIncome - stats.totalExpense;

            if (amount > currentBalance) {
                await session.abortTransaction();
                session.endSession();
                return res.status(400).json({
                    success: false,
                    message: `Insufficient balance! Your current balance is ₹${currentBalance}, but you are trying to spend ₹${amount}.`
                });
            }
        }


        const data = await transactionModel.create([
            {
                userId: user.userId,
                type,
                category,
                amount: mongoose.Types.Decimal128.fromString(amount.toString()),
                notes: notes || "",
                transactionDate: transactionDate || Date.now()
            }],
            { session }
        );
        await session.commitTransaction();
        session.endSession();
        console.log(data);

        return res.status(201).json({
            success: true,
            message: "Transaction Successfull!",
            data: {
                _id: data[0]._id,
                userId: data[0].userId,
                amount: data[0].amount,
                type: data[0].type,
                category: data[0].category,
                notes: data[0].notes,
                transactionDate: data[0].transactionDate
            }
        });


    } catch (error) {
        await session.abortTransaction();
        session.endSession();
        console.log("Something went wrong", error);
        return res.status(500).json({
            success: false,
            messsage: "Server not responding"
        });
    }

}


// getMyRecords - GET /api/trans/my?type=expense&category=food&startDate=2026-04-01&endDate=2026-04-04&page=1&limit=10

const getMyRecords = async (req, res) => {
    try {
        const { type, category, startDate, endDate } = req.query;
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;

        if (limit > 20) {
            return res.status(400).json({
                success: false,
                message: "Server can't send more than 20 records at a time."
            });
        }

        let query = {
            userId: req.user.userId,
            isDeleted: false
        };

        if (type) {
            const allowedType = ['income', 'expense'];
            if (!allowedType.includes(type)) {
                return res.status(400).json({ success: false, message: "Invalid type filter" });
            }
            query.type = type;
        }

        if (category) {
            const allowedCategory = ['food', 'clothing', 'education', 'rent', 'loan', 'others', 'none'];
            if (!allowedCategory.includes(category)) {
                return res.status(400).json({ success: false, message: "Invalid category filter" });
            }
            query.category = category;
        }

        if (startDate || endDate) {
            query.transactionDate = {};

            if (startDate) {
                query.transactionDate.$gte = new Date(startDate);
            }
            if (endDate) {
                query.transactionDate.$lte = new Date(endDate);
            }
        }

        const skip = (page - 1) * limit;

        const [records, totalRecords] = await Promise.all([
            transactionModel.find(query).sort({ transactionDate: -1 }).skip(skip).limit(limit),
            transactionModel.countDocuments(query)
        ]);

        return res.status(200).json({
            success: true,
            message: "Records retrieved successfully",
            data: records,
            pagination: {
                totalRecords,
                currentPage: page,
                totalPages: Math.ceil(totalRecords / limit)
            }
        });

    } catch (error) {
        console.error("Error in fetching & filtering transactions", error);
        return res.status(500).json({
            success: false,
            message: "Server not responding"
        });
    }
}

//update record
const updateMyRecord = async (req, res) => {
    try {
        const transactionId = req.params.id;
        const userId = req.user.userId;
        const updates = { ...req.body };


        if (updates.amount) {
            if (updates.amount <= 0) {
                return res.status(400).json({ success: false, message: "Invalid amount. Must be > 0." });
            }

            updates.amount = mongoose.Types.Decimal128.fromString(updates.amount.toString());
        }

        if (updates.type && !['income', 'expense'].includes(updates.type)) {
            return res.status(400).json({ success: false, message: "Invalid type!" });
        }

        const allowedCategory = ['food', 'clothing', 'education', 'rent', 'loan', 'others', 'none'];
        if (updates.category && !allowedCategory.includes(updates.category)) {
            return res.status(400).json({ success: false, message: "Invalid category!" });
        }

        const updatedRecord = await transactionModel.findOneAndUpdate(
            {
                _id: transactionId,
                userId: userId,
                isDeleted: false
            },
            { $set: updates },
            { returnDocument: 'after' }
        );

        if (!updatedRecord) {
            return res.status(404).json({
                success: false,
                message: "Record not found, or you do not have permission to edit it."
            });
        }

        return res.status(200).json({
            success: true,
            message: "Record updated successfully",
            data: {
                _id: data._id,
                userId: updatedRecord.userId,
                amount: updatedRecord.amount,
                type: updatedRecord.type,
                category: updatedRecord.category,
                notes: updatedRecord.notes,
                transactionDate: updatedRecord.transactionDate
            }
        });

    } catch (error) {
        console.error("Error updating record:", error);
        return res.status(500).json({
            success: false,
            message: "Internal Server Error"
        });
    }
}


//delete record
const deleteMyRecord = async (req, res) => {
    try {
        const transactionId = req.params.id;
        const userId = req.user.userId;

        const deletedRecord = await transactionModel.findOneAndUpdate(
            {
                _id: transactionId,
                userId: userId,
                isDeleted: false
            },
            { isDeleted: true },
            { returnDocument: 'after' }
        );

        if (!deletedRecord) {
            return res.status(404).json({
                success: false,
                message: "Record not found, already deleted, or unauthorized."
            });
        }

        return res.status(200).json({
            success: true,
            message: "Record deleted successfully"
        });

    } catch (error) {
        console.error("Error deleting record:", error);
        return res.status(500).json({
            success: false,
            message: "Internal Server Error"
        });
    }
}



module.exports = { addMyRecord, getMyRecords, updateMyRecord, deleteMyRecord }