'use client';

import { useState } from 'react';
import { extractRedditData } from './services/redditService';
import { generateTTS } from './services/ttsService';
import { splitIntoSegments } from './utils/textProcessor';

interface Result {
  title: string;
  fullText: string;
  segments: string[];
  audioUrl: string;
  metadata: {
    author: string;
    subreddit: string;
  };
}

export default function Home() {
  const [url, setUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [result, setResult] = useState<Result | null>(null);

  const handleGenerate = async () => {
    if (!url.trim()) {
      setError('Please enter a Reddit URL');
      return;
    }

    setLoading(true);
    setError('');
    setResult(null);

    try {
      // Extract Reddit data
      const redditData = await extractRedditData(url);

      // Combine title and text
      const fullText = `${redditData.title}. ${redditData.text}`;

      // Truncate to ~180 words for ~1 minute
      const words = fullText.split(' ').slice(0, 180).join(' ');

      // Split into caption segments
      const segments = splitIntoSegments(words);

      // Generate TTS audio
      const audioUrl = await generateTTS(words);

      setResult({
        title: redditData.title,
        fullText: words,
        segments,
        audioUrl,
        metadata: {
          author: redditData.author,
          subreddit: redditData.subreddit,
        },
      });
    } catch (err: any) {
      setError(err.message || 'Failed to generate TTS');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const downloadJSON = () => {
    if (!result) return;
    const dataStr = JSON.stringify(result, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'story-data.json';
    link.click();
  };

  const downloadAudio = () => {
    if (!result) return;
    const link = document.createElement('a');
    link.href = result.audioUrl;
    link.download = 'tts-audio.mp3';
    link.click();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 p-6">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white/10 backdrop-blur-lg rounded-2xl shadow-2xl p-8 mb-6">
          <h1 className="text-4xl font-bold text-white mb-2">
            Reddit Story TTS Generator
          </h1>
          <p className="text-gray-300 mb-8">
            Generate voiceovers for TikTok/YouTube shorts
          </p>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-200 mb-2">
                Reddit Post URL
              </label>
              <input
                type="text"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="https://www.reddit.com/r/AskReddit/comments/..."
                className="w-full px-4 py-3 bg-white/20 border border-white/30 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>

            <button
              onClick={handleGenerate}
              disabled={!url || loading}
              className="w-full bg-gradient-to-r from-purple-600 to-blue-600 text-white font-semibold py-3 px-6 rounded-lg hover:from-purple-700 hover:to-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              {loading ? 'Generating...' : 'Generate TTS & Captions'}
            </button>
          </div>

          {error && (
            <div className="mt-4 bg-red-500/20 border border-red-500/50 rounded-lg p-4">
              <p className="text-red-200 font-medium">Error</p>
              <p className="text-red-300 text-sm">{error}</p>
            </div>
          )}
        </div>

        {result && (
          <div className="bg-white/10 backdrop-blur-lg rounded-2xl shadow-2xl p-8 space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold text-white">Generated Content</h2>
              <div className="flex gap-2">
                <button
                  onClick={downloadAudio}
                  className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition-colors text-sm"
                >
                  ⬇ Audio
                </button>
                <button
                  onClick={downloadJSON}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors text-sm"
                >
                  ⬇ JSON
                </button>
              </div>
            </div>

            <div className="space-y-4">
              <div className="bg-white/5 rounded-lg p-4">
                <h3 className="text-sm font-semibold text-gray-300 mb-2">
                  Title
                </h3>
                <p className="text-white">{result.title}</p>
              </div>

              <div className="bg-white/5 rounded-lg p-4">
                <h3 className="text-sm font-semibold text-gray-300 mb-2">
                  Audio
                </h3>
                <audio controls className="w-full" src={result.audioUrl}>
                  Your browser does not support the audio element.
                </audio>
              </div>

              <div className="bg-white/5 rounded-lg p-4">
                <h3 className="text-sm font-semibold text-gray-300 mb-2">
                  Caption Segments ({result.segments.length})
                </h3>
                <div className="space-y-2 max-h-96 overflow-y-auto">
                  {result.segments.map((segment, idx) => (
                    <div key={idx} className="bg-white/5 rounded p-3">
                      <span className="text-purple-400 font-mono text-sm mr-2">
                        [{idx + 1}]
                      </span>
                      <span className="text-gray-200">{segment}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-white/5 rounded-lg p-4">
                <h3 className="text-sm font-semibold text-gray-300 mb-2">
                  Metadata
                </h3>
                <div className="text-gray-300 text-sm space-y-1">
                  <p>Author: u/{result.metadata.author}</p>
                  <p>Subreddit: r/{result.metadata.subreddit}</p>
                </div>
              </div>
            </div>

            <div className="bg-blue-500/20 border border-blue-500/50 rounded-lg p-4">
              <p className="text-blue-200 text-sm">
                <strong>Next Steps:</strong> Download the audio and JSON files. Import
                the audio into your video editor, then use the caption segments to add
                text overlays synced with the voiceover.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}