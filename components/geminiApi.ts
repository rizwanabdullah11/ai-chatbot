import axios from 'axios';

const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=AIzaSyAc7h6wv6LfzdSiQe-oFlwsun6u2jFLcnU';

export async function sendMessageToGemini(message: string, apiKey: string) {
  try {
    const response = await axios.post(
      GEMINI_API_URL,
      {
        contents: [
          {
            parts: [{ text: message }]
          }
        ]
      },
      {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${apiKey}`
        },
        timeout: 20000
      }
    );

    // Safely extract text from response
    const candidate = response?.data?.candidates?.[0];
    const text = candidate?.content?.parts?.[0]?.text;
    return text ?? 'No response from Gemini.';
  } catch (error) {
    const axiosError = axios.isAxiosError(error) ? error : null;
    console.error('Gemini API error:', axiosError?.response ?? (error as any)?.message ?? error);
    return 'Sorry, something went wrong contacting Gemini.';
  }
}
