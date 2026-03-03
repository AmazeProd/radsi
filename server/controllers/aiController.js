const { GoogleGenerativeAI } = require('@google/generative-ai');
const asyncHandler = require('../utils/asyncHandler');
const ErrorResponse = require('../utils/errorResponse');

// Ordered list of models to try — if one hits rate limit, move to the next
const MODELS = [
  'gemini-2.5-flash',
  'gemini-2.0-flash',
  'gemini-2.0-flash-lite',
  'gemini-1.5-flash',
];

// Initialize Gemini
const getGenAI = () => {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new ErrorResponse('AI service is not configured. Please set GEMINI_API_KEY.', 503);
  }
  return new GoogleGenerativeAI(apiKey);
};

// Check if error is a rate limit / quota error
const isRateLimitError = (error) => {
  const msg = error.message || '';
  return msg.includes('429') || msg.includes('quota') || msg.includes('Too Many Requests') || msg.includes('RESOURCE_EXHAUSTED');
};

// @desc    Generate AI message suggestion
// @route   POST /api/ai/generate-message
// @access  Private
exports.generateMessage = asyncHandler(async (req, res, next) => {
  const { prompt, context, tone } = req.body;

  if (!prompt || !prompt.trim()) {
    return next(new ErrorResponse('Please provide a prompt describing what you want to say', 400));
  }

  const genAI = getGenAI();

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

  const requestContents = {
    contents: [
      { role: 'user', parts: [{ text: `${systemPrompt}\n\nUser's request: ${prompt.trim()}` }] }
    ],
    generationConfig: {
      maxOutputTokens: 200,
      temperature: 0.7,
      topP: 0.9,
    },
  };

  // Try each model in order — fallback on rate limit
  let lastError = null;
  for (const modelName of MODELS) {
    try {
      console.log(`Trying model: ${modelName}`);
      const model = genAI.getGenerativeModel({ model: modelName });
      const result = await model.generateContent(requestContents);

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
        continue; // Try next model if empty response
      }

      console.log(`Success with model: ${modelName}`);
      return res.status(200).json({
        success: true,
        data: {
          message: generatedText,
          model: modelName,
        },
      });
    } catch (error) {
      lastError = error;
      console.warn(`Model ${modelName} failed: ${error.message}`);

      if (isRateLimitError(error)) {
        console.log(`Rate limit hit on ${modelName}, trying next model...`);
        continue; // Try next model
      }

      // For non-rate-limit errors, don't try other models
      if (error.message?.includes('API_KEY')) {
        return next(new ErrorResponse('AI service configuration error', 503));
      }
      if (error.message?.includes('SAFETY')) {
        return next(new ErrorResponse('The request was blocked for safety reasons. Please rephrase.', 400));
      }

      return next(new ErrorResponse('Failed to generate message. Please try again.', 500));
    }
  }

  // All models exhausted
  console.error('All AI models rate limited:', lastError?.message);
  return next(new ErrorResponse('AI service is temporarily busy. Please try again in a minute.', 429));
});
