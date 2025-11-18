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
    <div className="flex flex-col sm:flex-row gap-3 justify-center items-stretch sm:items-center">
      {(
        Object.entries(MOOD_CONFIGS) as [Mood, (typeof MOOD_CONFIGS)[Mood]][]
      ).map(([mood, config]) => {
        const isActive = selectedMood === mood;
        const baseClasses = isActive ? config.activeColor : config.baseColor;

        return (
          <button
            key={mood}
            type="button"
            onClick={() => handleMoodClick(mood)}
            disabled={disabled}
            className={`
                ${baseClasses}
                ${config.hoverColor}
                ${config.borderColor}
                border-2
                rounded-lg
                px-6
                py-3
                min-h-[44px]
                flex
                items-center
                justify-center
                gap-2
                text-lg
                font-medium
                transition-all
                duration-200
                focus:outline-none
                focus:ring-2
                focus:ring-offset-2
                focus:ring-blue-500
                disabled:opacity-50
                disabled:cursor-not-allowed
                ${isActive ? 'shadow-lg' : 'shadow-md'}
                ${!disabled && 'hover:shadow-lg'}
              `}
            aria-label={`${config.emoji} ${config.label}`}
            aria-pressed={isActive}
          >
            <span className="text-2xl" aria-hidden="true">
              {config.emoji}
            </span>
            <span className="text-gray-800">{config.label}</span>
          </button>
        );
      })}
    </div>
  );
}
