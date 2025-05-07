const mongoose = require('mongoose');
const { v4: uuidv4 } = require('uuid');

const bcrypt = require('bcrypt');

const UserSchema = new mongoose.Schema({
    userId: {
        type: String,
        unique: true,
        default: uuidv4
    },

    userName: {
        type: String,
        required: true,
        trim: true
    },
    email: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        lowercase: true
    },
    password: {
        type: String,
        required: true,
        minlength: 8
    },
    role: {
        type: String,
        enum: ['farmer', 'veterinarian', 'admin'],
        default: 'farmer'
    },
    phoneNumber: {
        type: String,
        required: true,
        trim: true,
        validate: {
            validator: function(v) {
                return /^\d{10}$/.test(v);
            },
            message: props => props.value + " is not a valid phone number! Please enter 10 digits."

        }
    },
    farmerLocation: {
        type: String,
        default: ''
    },
    additionalInfo: {
        type: String,
        default: ''
    },
    specialization: {
        type: String,
        default: ''
    },
    areaOfExpertise: {
        type: String,
        default: ''
    },
    vetLocation: {
        type: String,
        default: ''
    },
    supportDocument: {
        type: String,
        default: ''
    },
    supportDocumentStatus: {
        type: String,
        enum: ['Pending', 'Approved', 'Rejected'],
        default: 'Pending'
    },

    status: {
        type: String,
        enum: ['Pending', 'Active', 'Suspended'],
        default: 'Active'
    },

    isActive: {
        type: Boolean,
        default: true
    }
}, {
    timestamps: true
});


// Hash password before saving
UserSchema.pre('save', async function(next) {
    if (!this.isModified('password')) return next();
    
    try {
        const salt = await bcrypt.genSalt(10);
        this.password = await bcrypt.hash(this.password, salt);
        return next();
    } catch (err) {
        return next(err);
    }
});

// Method to compare passwords
UserSchema.methods.comparePassword = async function(candidatePassword) {
    return bcrypt.compare(candidatePassword, this.password);
};

module.exports = mongoose.model('User', UserSchema);
