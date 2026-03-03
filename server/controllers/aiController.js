const { GoogleGenerativeAI } = require('@google/generative-ai');
const asyncHandler = require('../utils/asyncHandler');
const ErrorResponse = require('../utils/errorResponse');

// Initialize Gemini
const getModel = () => {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new ErrorResponse('AI service is not configured. Please set GEMINI_API_KEY.', 503);
  }
  const genAI = new GoogleGenerativeAI(apiKey);
  return genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });
};

// @desc    Generate AI message suggestion
// @route   POST /api/ai/generate-message
// @access  Private
exports.generateMessage = asyncHandler(async (req, res, next) => {
  const { prompt, context, tone } = req.body;

  if (!prompt || !prompt.trim()) {
    return next(new ErrorResponse('Please provide a prompt describing what you want to say', 400));
  }

  const model = getModel();

  const toneInstructions = {
    friendly: 'Use a warm, friendly, and casual tone.',
    professional: 'Use a polite, professional, and formal tone.',
    funny: 'Use a humorous, witty, and lighthearted tone.',
    romantic: 'Use a sweet, affectionate, and romantic tone.',
    apologetic: 'Use a sincere, apologetic, and empathetic tone.',
    encouraging: 'Use an uplifting, motivating, and supportive tone.',
  };

  const toneGuide = toneInstructions[tone] || toneInstructions.friendly;

  const systemPrompt = `You are a helpful chat message assistant for a social media platform. 
Your job is to help users compose chat messages based on their description.

Rules:
- Generate ONLY the message text, nothing else. No quotes, no explanations, no prefixes.
- Keep messages concise and natural (1-3 sentences unless the user asks for more).
- ${toneGuide}
- Match the language of the user's prompt (if they write in Spanish, respond in Spanish, etc.).
- Do not include greetings like "Hey!" unless the context suggests it's appropriate.
- Make the message sound like a real person wrote it, not an AI.
${context ? `\nRecent conversation context (for reference only):\n${context}` : ''}`;

  try {
    const result = await model.generateContent({
      contents: [
        { role: 'user', parts: [{ text: `${systemPrompt}\n\nUser's request: ${prompt.trim()}` }] }
      ],
      generationConfig: {
        maxOutputTokens: 300,
        temperature: 0.8,
      },
    });

    const response = result.response;
    const generatedText = response.text().trim();

    if (!generatedText) {
      return next(new ErrorResponse('AI failed to generate a message. Please try again.', 500));
    }

    res.status(200).json({
      success: true,
      data: {
        message: generatedText,
      },
    });
  } catch (error) {
    console.error('AI generation error:', error.message);

    if (error.message?.includes('API_KEY')) {
      return next(new ErrorResponse('AI service configuration error', 503));
    }
    if (error.message?.includes('SAFETY')) {
      return next(new ErrorResponse('The request was blocked for safety reasons. Please rephrase.', 400));
    }

    return next(new ErrorResponse('Failed to generate message. Please try again.', 500));
  }
});
