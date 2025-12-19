const OPENAI_API_KEY = process.env.NEXT_PUBLIC_OPENAI_API_KEY || '';

export const generateTTS = async (text: string): Promise<string> => {
  try {
    if (!OPENAI_API_KEY) {
      throw new Error(
        'Please add NEXT_PUBLIC_OPENAI_API_KEY to your .env.local file'
      );
    }

    const response = await fetch('https://api.openai.com/v1/audio/speech', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: 'tts-1',
        voice: 'alloy', // Options: alloy, echo, fable, onyx, nova, shimmer
        input: text,
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error?.message || 'TTS generation failed');
    }

    const audioBlob = await response.blob();
    const audioUrl = URL.createObjectURL(audioBlob);
    return audioUrl;
  } catch (error: any) {
    throw new Error(`TTS Error: ${error.message}`);
  }
};
