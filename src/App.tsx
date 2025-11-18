import { useState } from 'react';
import { useOllamaHealth } from '@/hooks/useOllamaHealth';
import { MoodSelector } from '@/components/MoodSelector';
import { InspirationCard } from '@/components/InspirationCard';
import { ContentGeneratorAgent } from '@/agents/ContentGeneratorAgent';
import { MoodInterpreterAgent } from '@/agents/MoodInterpreterAgent';
import type { Mood } from '@/types/mood';

function App() {
  const { status, isChecking } = useOllamaHealth();
  const [content, setContent] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleMoodSelect = async (mood: Mood) => {
    console.log('Selected mood:', mood);

    // Set loading state
    setIsLoading(true);

    try {
      // Get prompt from MoodInterpreterAgent
      const moodAgent = MoodInterpreterAgent.getInstance();
      const prompt = moodAgent.getPromptForMood(mood);

      // Generate content using ContentGeneratorAgent
      const contentAgent = ContentGeneratorAgent.getInstance();
      const result = await contentAgent.generateContent(prompt);

      if (result.success) {
        setContent(result.content);
      } else {
        // Error handled by toaster in ContentGeneratorAgent
        console.error('Content generation failed:', result.error);
      }
    } catch (error) {
      console.error('Unexpected error during content generation:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 px-4 py-12">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-semibold text-gray-900 mb-3">
            Daily Inspiration
          </h1>
          {isChecking && <p className="text-sm text-gray-400">Connecting...</p>}
          {!isChecking && status === 'connected' && (
            <p className="text-sm text-gray-400">How are you feeling today?</p>
          )}
          {!isChecking && status === 'disconnected' && (
            <p className="text-sm text-red-500">Ollama not running</p>
          )}
          {!isChecking && status === 'error' && (
            <p className="text-sm text-amber-500">Connection error</p>
          )}
        </div>

        {/* Mood Selection */}
        <MoodSelector
          disabled={status !== 'connected'}
          onMoodSelect={handleMoodSelect}
        />

        {/* Inspiration Card */}
        <InspirationCard content={content} isLoading={isLoading} />
      </div>
    </div>
  );
}

export default App;
