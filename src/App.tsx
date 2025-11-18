import { useOllamaHealth } from '@/hooks/useOllamaHealth';
import { MoodSelector } from '@/components/MoodSelector';
import type { Mood } from '@/types/mood';

function App() {
  const { status, isChecking } = useOllamaHealth();

  // TODO: Replace with actual content generation integration
  const handleMoodSelect = (mood: Mood) => {
    console.log('Selected mood:', mood);
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
      </div>
    </div>
  );
}

export default App;
