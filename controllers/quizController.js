const axios = require('axios');

exports.generateQuiz = async (req, res) => {
    const { locationKeyword } = req.body;
    console.log(process.env.OPENAI_API_KEY)
    // Enhanced logging for debugging
    console.log('Request Details:', {
        locationKeyword,
        apiKey: process.env.PERPLEXITY_API_KEY ? 'Present' : 'Missing'
    });

    try {
        // Detailed axios configuration
        const response = await axios({
            method: 'post',
            url: 'https://api.perplexity.ai/chat/completions',
            data: {
                model: 'llama-3.1-sonar-small-128k-online',
                messages: [
                    {
                        role: 'system',
                        content: 'You are a quiz generator. Create a precise multiple-choice quiz.'
                    },
                    {
                        role: 'user',
                        content: `Generate a 5-question multiple-choice quiz about ${locationKeyword}. 
                        Format EXACTLY like this:
                        1. What is [question]?
                            a) [Option A]
                            b) [Option B]
                            c) [Option C]
                            d) [Option D]
                        Answer: [Correct Answer]`
                    }
                ],
                max_tokens: 500,
                temperature: 0.7,
            },
            headers: {
                'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            timeout: 10000  // 10 second timeout
        });

        // Comprehensive logging of API response
        console.log('API Response Status:', response.status);
        console.log('Response Headers:', response.headers);
        console.log('Response Data:', JSON.stringify(response.data, null, 2));

        // Extract quiz content
        const quizText = response.data.choices[0].message.content;
        console.log('Raw Quiz Text:', quizText);

        // Robust parsing function
        const quizQuestions = parseQuiz(quizText);

        // Send successful response
        res.status(200).json({ 
            questions: quizQuestions,
            rawText: quizText 
        });

    } catch (error) {
        // Comprehensive error logging
        console.error('Full Error Object:', {
            message: error.message,
            code: error.code,
            status: error.response?.status,
            data: error.response?.data,
            headers: error.response?.headers
        });

        // Detailed error response
        res.status(error.response?.status || 500).json({
            error: 'Quiz Generation Failed',
            details: {
                message: error.message,
                apiErrorResponse: error.response?.data
            }
        });
    }
};

function parseQuiz(quizText) {
    try {
        const questions = [];
        const questionRegex = /(\d+\.\s*[^\n]+)\n\s*a\)\s*([^\n]+)\n\s*b\)\s*([^\n]+)\n\s*c\)\s*([^\n]+)\n\s*d\)\s*([^\n]+)\n\s*Answer:\s*\w+\)\s*([^\n]+)/g;

        let match;
        while ((match = questionRegex.exec(quizText)) !== null) {
            questions.push({
                question: match[1].trim(),
                options: {
                    a: match[2].trim(),
                    b: match[3].trim(),
                    c: match[4].trim(),
                    d: match[5].trim()
                },
                answer: match[6].trim() // Only the correct answer text
            });
        }

        console.log('Parsed Questions:', questions);
        return questions;
    } catch (parseError) {
        console.error('Parsing Error:', parseError);
        return [];
    }
}
