import { useState } from 'react';
import type { Mood, MoodSelectorProps } from '@/types/mood';
import { MOOD_CONFIGS } from '@/types/mood';

export function MoodSelector({ disabled, onMoodSelect }: MoodSelectorProps) {
  const [selectedMood, setSelectedMood] = useState<Mood | null>(null);

  const handleMoodClick = (mood: Mood) => {
    if (disabled) return;

    setSelectedMood(mood);
    onMoodSelect(mood);
  };

  return (
    <div className="grid grid-cols-2 gap-6">
      {(
        Object.entries(MOOD_CONFIGS) as [Mood, (typeof MOOD_CONFIGS)[Mood]][]
      ).map(([mood, config]) => {
        const isActive = selectedMood === mood;

        return (
          <button
            key={mood}
            type="button"
            onClick={() => handleMoodClick(mood)}
            disabled={disabled}
            className={`
              ${isActive ? 'bg-white ring-2 ring-gray-900' : 'bg-white hover:bg-gray-50'}
              rounded-xl
              p-8
              transition-all
              duration-200
              focus:outline-none
              focus:ring-2
              focus:ring-gray-900
              focus:ring-offset-2
              disabled:opacity-30
              disabled:cursor-not-allowed
            `}
            aria-label={`${config.emoji} ${config.label}`}
            aria-pressed={isActive}
          >
            <div className="text-5xl mb-3">{config.emoji}</div>
            <div className="text-base font-medium text-gray-900">
              {config.label}
            </div>
          </button>
        );
      })}
    </div>
  );
}
