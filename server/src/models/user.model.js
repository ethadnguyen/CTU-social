const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const userSchema = mongoose.Schema({
    firstName: {
        type: String,
    },
    lastName: {
        type: String,
    },
    email: {
        type: String,
        unique: true,
    },
    password: {
        type: String,
        required: true,
        minLength: 6,
    },
    student_id: {
        type: String,
        required: true,
        unique: true,
    },
    role: {
        type: String,
        enum: ['user', 'admin'],
        default: 'user',
    },
    avatar: {
        type: String,
    },
    gender: {
        type: String,
        enum: ['Male', 'Female', 'Other'],
        default: 'Male'
    },
    phone: {
        type: String,
    },
    dateOfBirth: {
        type: Date,
    },
    bio: {
        type: String,
    },
    faculty: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Faculty',
        required: true
    },
    major: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Major',
        required: true
    },
    facebook: {
        type: String,
    },
    linkedin: {
        type: String,
    },
    github: {
        type: String,
    },
    followers: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            isFriend: { type: Boolean, default: false }
        }
    ],
    following: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            isFriend: { type: Boolean, default: false }
        }
    ],
    friends: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
        }
    ],
    isVerified: {
        type: Boolean,
        default: false
    }
},
    {
        timestamps: true
    }
);

userSchema.virtual('name').get(function () {
    return `${this.firstName} ${this.lastName}`;
});

userSchema.virtual('followersCount').get(function () {
    return this.followers.length;
});

userSchema.virtual('followingCount').get(function () {
    return this.following.length;
});

userSchema.pre('save', async function (next) {
    if (!this.isModified('password')) return next();
    try {
        const salt = await bcrypt.genSalt(10);
        this.password = await bcrypt.hash(this.password, salt);
        next();
    } catch (err) {
        next(err);
    }
});

module.exports = mongoose.model('User', userSchema);