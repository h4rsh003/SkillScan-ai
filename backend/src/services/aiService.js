import { ai } from '../config/gemini.js';

export const generateCandidateProfile = async (resumeText) => {
    const prompt = `Analyze the following resume text and extract the professional details.
Return ONLY a valid JSON object matching this exact schema:
{
  "name": "string (Candidate's full name)",
  "role": "string (e.g., MERN Stack Developer, Frontend Engineer)",
  "skills": ["string"],
  "experienceYears": number (extract or estimate based on dates, default to 0),
  "keyProjects": ["string"],
  "potentialWeaknesses": ["string"]
}

Resume Text:
${resumeText}`;

    try {
        const response = await ai.models.generateContent({
            model: 'gemini-3.5-flash-lite',
            contents: prompt,
            config: {
                responseMimeType: 'application/json',
            }
        });

        return JSON.parse(response.text);
    } catch (error) {
        console.error("Profile Gen Error:", error);
        throw new Error('Failed to generate candidate profile from AI');
    }
};

export const generateFirstQuestion = async (profile) => {
    const prompt = `You are a Senior Technical Interviewer. The candidate is ready.
Role: ${profile.role}
Skills: ${profile.skills.join(', ')}
Experience: ${profile.experienceYears} years

Ask the very first technical interview question based on their profile to start the interview.
Keep the question practical and under 30 words.
Return ONLY the question string, no formatting, no extra text.`;

    try {
        const response = await ai.models.generateContent({
            model: 'gemini-3.5-flash-lite',
            contents: prompt,
        });

        return response.text.trim();
    } catch (error) {
        console.error("First Q Gen Error:", error);
        throw new Error('Failed to generate the first question');
    }
};

// Yahan mene currentQuestion add kiya hai taaki AI exact answer evaluate kar sake
export const generateNextQuestion = async (profile, chatHistory, currentQuestion, userAnswer) => {
    const prompt = `You are a Senior Technical Interviewer interviewing a candidate for a ${profile.role} role.
Skills: ${profile.skills.join(', ')}

Here is the conversation history so far:
${chatHistory}

The candidate just answered this question: "${currentQuestion}"
Their answer: "${userAnswer}"

Your task:
1. Briefly evaluate their answer. Provide a constructive "feedback" explaining what was right/wrong and the ideal approach.
2. Ask the NEXT technical interview question based on their skills or as a follow-up. Keep it under 40 words.

Return ONLY a valid JSON object matching this exact schema:
{
  "feedback": "string (Your evaluation of their current answer)",
  "nextQuestion": "string (The next interview question)"
}`;

    try {
        const response = await ai.models.generateContent({
            model: 'gemini-3.5-flash-lite',
            contents: prompt,
            config: {
                // JSON format force kar rahe hain
                responseMimeType: 'application/json',
            }
        });

        return JSON.parse(response.text);
    } catch (error) {
        console.error("Next Q Gen Error:", error);
        throw new Error('Failed to generate the next question');
    }
};

// Yahan bhi currentQuestion aur userAnswer add kiya hai final feedback ke liye
export const generateFinalEvaluation = async (profile, chatHistory, currentQuestion, userAnswer) => {
    const prompt = `You are a Senior Technical Interviewer. The interview is now complete.
Candidate Role: ${profile.role}
Skills: ${profile.skills.join(', ')}

The candidate just answered the final question: "${currentQuestion}"
Their answer: "${userAnswer}"

Here is the complete conversation history:
${chatHistory}

Your task:
1. Evaluate their final answer and provide "feedback" for it.
2. Evaluate their overall performance throughout the interview and provide "overallFeedback" (3-4 lines).
3. Assign an "overallScore" out of 100.

Return ONLY a valid JSON object matching this exact schema:
{
  "feedback": "string (Your evaluation of their final answer)",
  "overallScore": number (Score out of 100),
  "overallFeedback": "string (Overall constructive feedback for the interview)"
}`;

    try {
        const response = await ai.models.generateContent({
            model: 'gemini-3.5-flash-lite',
            contents: prompt,
            config: {
                responseMimeType: 'application/json',
            }
        });

        return JSON.parse(response.text);
    } catch (error) {
        console.error("Final Eval Error:", error);
        throw new Error('Failed to generate final evaluation');
    }
};