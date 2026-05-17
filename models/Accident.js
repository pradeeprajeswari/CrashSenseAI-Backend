const mongoose = require("mongoose");

const accidentSchema = new mongoose.Schema({
    location: {
        type: String,
        required: true
    },

    severity: {
        type: String,
        required: true
    },

    timestamp: {
        type: Date,
        default: Date.now
    },

    status: {
        type: String,
        default: "Pending"
    },

    ambulanceAssigned: {
    type: String,
    default: "Not Assigned"
    }
});

module.exports = mongoose.model("Accident", accidentSchema);