const mongoose = require('mongoose');

const transactionSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        index: true
    },
    amount: {
        type: mongoose.Types.Decimal128,
        required: [true, 'Transaction amount is required'],
        min: [0.01, 'Amount must be greater than zero']
    },
    type: {
        type: String,
        enum: ['income', 'expense'],
        required: true
    },
    category: {
        type: String,
        enum: ['food', 'clothing', 'education', 'rent', 'loan', 'others','none'],
        default:'none',
        required: true,
    },
    transactionDate: {
        type: Date,
        required: true,
        default: Date.now
    },
    notes: {
        type: String,
        trim: true,
        maxlength: [500, 'Notes cannot exceed 500 characters']
    },
    isDeleted: {
        type: Boolean,
        default: false
    }
}, {
    timestamps: true
});

transactionSchema.index({ userId: 1, transactionDate: -1, type: 1 });

module.exports = mongoose.model('Transaction', transactionSchema);