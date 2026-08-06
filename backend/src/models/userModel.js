import mongoose from 'mongoose';

const userSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
        },
        role: {
            type: String,
            required: true,
        },
        skills: {
            type: [String],
            default: [],
        },
        experienceYears: {
            type: Number,
            default: 0,
        },
        keyProjects: {
            type: [String],
            default: [],
        },
        potentialWeaknesses: {
            type: [String],
            default: [],
        }
    },
    {
        timestamps: true,
    }
);

export const User = mongoose.model('User', userSchema);