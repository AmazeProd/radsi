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
  return genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });
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
Your job is to help users compose well-written, complete chat messages based on their description.

Rules:
- Generate ONLY the message text, nothing else. No quotes, no explanations, no prefixes like "Here's a message:".
- Write 2-4 complete sentences. NEVER leave a sentence unfinished or cut off mid-word.
- Always end with a proper sentence that has a period, question mark, or exclamation mark.
- Keep the total message under 60 words so it fits naturally in a chat.
- Use 1-3 relevant, professional emojis naturally within the message (e.g., 😊 👋 🎉 💡 🙏 ✨ 👍 💪 🤝 ❤️). Don't overdo it — place them where they feel natural.
- ${toneGuide}
- Match the language of the user's prompt (if they write in Spanish, respond in Spanish, etc.).
- Make the message sound like a real person wrote it — natural, flowing, and conversational.
- If the user's request is short or vague, expand it into a thoughtful, well-rounded message.
${context ? `\nRecent conversation context (for reference only):\n${context}` : ''}`;

  try {
    const result = await model.generateContent({
      contents: [
        { role: 'user', parts: [{ text: `${systemPrompt}\n\nUser's request: ${prompt.trim()}` }] }
      ],
      generationConfig: {
        maxOutputTokens: 200,
        temperature: 0.7,
        topP: 0.9,
      },
    });

    const response = result.response;
    let generatedText = response.text().trim();

    // Ensure message ends with complete sentence (not cut off)
    if (generatedText && !/[.!?]$/.test(generatedText)) {
      const lastSentenceEnd = Math.max(
        generatedText.lastIndexOf('.'),
        generatedText.lastIndexOf('!'),
        generatedText.lastIndexOf('?')
      );
      if (lastSentenceEnd > 0) {
        generatedText = generatedText.substring(0, lastSentenceEnd + 1);
      }
    }

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
    if (error.message?.includes('429') || error.message?.includes('quota') || error.message?.includes('Too Many Requests')) {
      return next(new ErrorResponse('AI rate limit reached. Please wait a minute and try again.', 429));
    }

    return next(new ErrorResponse('Failed to generate message. Please try again.', 500));
  }
});
