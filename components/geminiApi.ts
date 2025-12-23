import axios from 'axios';

const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=AIzaSyCREjQzrKawpWc3PHhNOPxT8MgElqC7zCE';

export async function sendMessageToGemini(message: string, apiKey: string, audioBase64?: string) {
  try {
    const parts: any[] = [];
    if (audioBase64) {
      parts.push({
        inline_data: {
          mime_type: 'audio/mp4',
          data: audioBase64
        }
      });
    }
    // Add text part (even if empty string, though usually you'd have one or the other or both)
    // If we have audio, text might be empty or a prompt like "Listen to this audio".
    if (message) {
      parts.push({ text: message });
    } else if (!audioBase64) {
      // Fallback if nothing
      parts.push({ text: 'Hello' });
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
        timeout: 60000 // Increased timeout for audio processing
      }
    );

    // Safely extract text from response
    const candidate = response?.data?.candidates?.[0];
    const text = candidate?.content?.parts?.[0]?.text;
    return text ?? 'No response from Gemini.';
  } catch (error) {
    const axiosError = axios.isAxiosError(error) ? error : null;
    console.error('Gemini API error:', axiosError?.response?.data ?? (error as any)?.message ?? error);
    return 'Sorry, something went wrong contacting Gemini.';
  }
}
