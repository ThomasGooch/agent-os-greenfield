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

  // Stagger delays for entrance animations
  const delays = ['delay-0', 'delay-75', 'delay-150', 'delay-[225ms]'];

  return (
    <div className="grid grid-cols-2 gap-6">
      {(
        Object.entries(MOOD_CONFIGS) as [Mood, (typeof MOOD_CONFIGS)[Mood]][]
      ).map(([mood, config], index) => {
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
              duration-300
              
              animate-fade-in-up
              ${delays[index]}
              
              hover:shadow-xl
              hover:-translate-y-1
              active:translate-y-0
              
              motion-reduce:animate-none
              motion-reduce:hover:translate-y-0
              
              focus:outline-none
              focus:ring-2
              focus:ring-gray-900
              focus:ring-offset-2
              disabled:opacity-50
              disabled:cursor-not-allowed
            `}
            style={{
              transitionTimingFunction: 'cubic-bezier(0.34, 1.56, 0.64, 1)',
            }}
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
