import { extractTextFromPDF } from '../services/pdfService.js';
import { generateCandidateProfile } from '../services/aiService.js';
import { User } from '../models/userModel.js';

export const processResumeUpload = async (req, res, next) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: 'PDF file is required' });
        }

        const rawText = await extractTextFromPDF(req.file.buffer);

        if (rawText.trim().length < 50) {
            return res.status(400).json({ error: 'No readable text found in PDF' });
        }

        const candidateProfile = await generateCandidateProfile(rawText);

        const newUser = await User.create({
            name: candidateProfile.name,
            role: candidateProfile.role,
            skills: candidateProfile.skills,
            experienceYears: candidateProfile.experienceYears,
            keyProjects: candidateProfile.keyProjects,
            potentialWeaknesses: candidateProfile.potentialWeaknesses,
        });

        return res.status(201).json({
            success: true,
            profile: newUser,
        });
    } catch (error) {
        next(error);
    }
};