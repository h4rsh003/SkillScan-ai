import { User } from '../models/userModel.js';
import { Interview } from '../models/interviewModel.js';
import { generateFirstQuestion, generateNextQuestion, generateFinalEvaluation } from '../services/aiService.js';

export const startInterview = async (req, res) => {
    try {
        const { userId, totalQuestions } = req.body;

        if (!userId) {
            return res.status(400).json({ success: false, error: 'User ID is required' });
        }

        const profile = await User.findById(userId);
        if (!profile) {
            return res.status(404).json({ success: false, error: 'User profile not found' });
        }

        const allowedOptions = [5, 10, 15, 20];
        const finalTotal = allowedOptions.includes(totalQuestions) ? totalQuestions : 5;

        const firstQuestion = await generateFirstQuestion(profile);

        const interview = await Interview.create({
            userId: profile._id,
            totalQuestions: finalTotal,
            qnaList: [{ question: firstQuestion, userAnswer: '', feedback: '' }]
        });

        res.status(200).json({
            success: true,
            interviewId: interview._id,
            totalQuestions: finalTotal,
            question: firstQuestion
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, error: 'Failed to start the interview session' });
    }
};

export const submitAnswer = async (req, res) => {
    try {
        const { interviewId, answer } = req.body;

        if (!interviewId || !answer) {
            return res.status(400).json({ success: false, error: 'interviewId and answer are required' });
        }

        const interview = await Interview.findById(interviewId);
        if (!interview) {
            return res.status(404).json({ success: false, error: 'Interview session not found' });
        }

        if (interview.status === 'COMPLETED') {
            return res.status(400).json({ success: false, error: 'Interview is already completed' });
        }

        const profile = await User.findById(interview.userId);
        const lastIndex = interview.qnaList.length - 1;

        // Save the user's answer
        interview.qnaList[lastIndex].userAnswer = answer;
        const currentQuestion = interview.qnaList[lastIndex].question;

        const chatHistory = interview.qnaList.map(qna => `Q: ${qna.question}\nA: ${qna.userAnswer}`).join('\n\n');

        // Check if this was the last question
        if (interview.qnaList.length >= interview.totalQuestions) {
            const evaluation = await generateFinalEvaluation(profile, chatHistory, currentQuestion, answer);

            // Save feedback for the final question
            interview.qnaList[lastIndex].feedback = evaluation.feedback;

            // Save overall results
            interview.status = 'COMPLETED';
            interview.overallScore = evaluation.overallScore;
            interview.overallFeedback = evaluation.overallFeedback;
            await interview.save();

            return res.status(200).json({
                success: true,
                isCompleted: true,
                message: "Interview finished!",
                result: evaluation
            });
        }

        // If there are more questions left
        const aiResponse = await generateNextQuestion(profile, chatHistory, currentQuestion, answer);

        // Save feedback for the current question
        interview.qnaList[lastIndex].feedback = aiResponse.feedback;

        // Push the new question
        interview.qnaList.push({ question: aiResponse.nextQuestion, userAnswer: '', feedback: '' });
        await interview.save();

        res.status(200).json({
            success: true,
            isCompleted: false,
            question: aiResponse.nextQuestion,
            feedback: aiResponse.feedback
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, error: 'Failed to process answer' });
    }
};

export const getInterviewDetails = async (req, res) => {
    try {
        const { id } = req.params;
        const interview = await Interview.findById(id).populate('userId', 'name role skills');

        if (!interview) {
            return res.status(404).json({ success: false, error: 'Interview not found' });
        }

        res.status(200).json({ success: true, interview });

    } catch (error) {
        console.error('--- FETCH INTERVIEW ERROR ---', error);
        res.status(500).json({ success: false, error: 'Failed to fetch interview details' });
    }
};