import axios from 'axios';

const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=AIzaSyByAwoPKn7__AOPVwYoclAUgjPiVlp8EHw';

export async function sendMessageToGemini(message: string, apiKey: string, base64Audio: string | null = null) {
  try {
    const parts: any[] = [{ text: message || (base64Audio ? ' ' : '') }]; // Ensure some text exists if only audio

    if (base64Audio) {
      parts.push({
        inlineData: {
          mimeType: 'audio/m4a',
          data: base64Audio
        }
      });
    }
    const response = await axios.post(
      GEMINI_API_URL,
      {
        contents: [
          {
            parts: parts
          }
        ]
      },
      {
        headers: {
          'Content-Type': 'application/json',
          // Authorization: `Bearer ${apiKey}`
        },
        timeout: 30000
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
