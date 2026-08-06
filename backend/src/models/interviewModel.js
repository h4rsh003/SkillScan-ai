import mongoose from 'mongoose';

const interviewSchema = new mongoose.Schema(
    {
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },
        totalQuestions: {
            type: Number,
            enum: [5, 10, 15, 20],
            default: 5,
        },
        qnaList: [
            {
                question: { type: String },
                userAnswer: { type: String, default: '' },
                feedback: { type: String, default: '' },
                score: { type: Number, default: 0 },
            }
        ],
        status: {
            type: String,
            enum: ['IN_PROGRESS', 'COMPLETED'],
            default: 'IN_PROGRESS',
        },
        overallScore: { type: Number, default: 0 },
        overallFeedback: { type: String, default: '' }
    },
    {
        timestamps: true,
    }
);

export const Interview = mongoose.model('Interview', interviewSchema);