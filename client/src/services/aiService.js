import api from './api';

// Generate an AI message suggestion
export const generateAIMessage = async ({ prompt, tone, context }) => {
  const response = await api.post('/ai/generate-message', {
    prompt,
    tone,
    context,
  });
  return response.data;
};
