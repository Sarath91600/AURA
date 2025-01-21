const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    fullName: {
        type: String,
        required: true
    },
    mobile: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true
    },status: {
        type: String,
        default: 'Active', // Default status is Active
        enum: ['Active', 'Blocked'], // Only these two statuses allowed
      },
});

const User = mongoose.model('User', userSchema);
module.exports = User;

