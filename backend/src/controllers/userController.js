import { User } from '../models/userModel.js';
import { generateCandidateProfile } from '../services/aiService.js';
import pdfParse from 'pdf-parse'; // PDF read karne ke liye

export const parseResume = async (req, res) => {
    try {
        // 1. Check karo ki file aayi hai ya nahi
        if (!req.file) {
            return res.status(400).json({ success: false, error: 'Resume PDF file is required' });
        }

        // 2. PDF file (buffer) se text extract karo
        const pdfData = await pdfParse(req.file.buffer);
        const resumeText = pdfData.text;

        if (!resumeText || !resumeText.trim()) {
            return res.status(400).json({ success: false, error: 'Could not extract text from the PDF.' });
        }

        // 3. AI ko call karke actual resume se data nikalna
        const extractedData = await generateCandidateProfile(resumeText);

        // 4. AI ke dynamic data se User profile banana
        const newUser = await User.create({
            name: extractedData.name || "Candidate",
            role: extractedData.role || "Software Engineer",
            skills: extractedData.skills || [],
            experienceYears: extractedData.experienceYears || 0,
            keyProjects: extractedData.keyProjects || [],
            potentialWeaknesses: extractedData.potentialWeaknesses || []
        });

        res.status(200).json({
            success: true,
            user: newUser
        });

    } catch (error) {
        console.error('Resume Parse Error:', error);
        res.status(500).json({ success: false, error: 'Failed to process resume via AI' });
    }
};

export const getUserProfile = async (req, res) => {
    try {
        const user = await User.findById(req.params.id);
        if (!user) {
            return res.status(404).json({ success: false, error: 'User not found' });
        }
        res.status(200).json({ success: true, user });
    } catch (error) {
        console.error('Fetch User Error:', error);
        res.status(500).json({ success: false, error: 'Failed to fetch user profile' });
    }
};