const mongoose = require('mongoose');

const AnimalDetailsSchema = new mongoose.Schema({
    animalType: {
        type: String,
        required: true,
    },
    breed: {
        type: String,
        required: true,
    },
    age: {
        type: Number,
        required: true,
    },
});

const EmergencySchema = new mongoose.Schema({
    emergencyId: {
        type: String,
        required: true,
        unique: true,
    },
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    animals: {
        type: [AnimalDetailsSchema],
        required: true,
    },
    description: {
        type: String,
        required: true,
    },
    location: {
        type: String,
        required: true,
    },
    status: {
        type: String,
        default: 'Pending',
    },
    images: [{
        type: String, // store image file paths or URLs
    }],
    videos: [{
        type: String, // store video file paths or URLs
    }],
    farmerLocation: {
        type: String,
        required: false,
    },
    farmerName: {
        type: String,
        required: false,
    },
    farmerPhone: {
        type: String,
        required: false,
    },
    farmerEmail: {
        type: String,
        required: false,
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
});

module.exports = mongoose.model('Emergency', EmergencySchema);
