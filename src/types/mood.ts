/**
 * Mood type representing the four available mood options
 */
export type Mood = 'happy' | 'calm' | 'motivated' | 'creative';

/**
 * Configuration for each mood's visual properties
 */
export interface MoodConfig {
  emoji: string;
  label: string;
  baseColor: string;
  hoverColor: string;
  activeColor: string;
  borderColor: string;
}

/**
 * Props for the MoodSelector component
 */
export interface MoodSelectorProps {
  disabled: boolean;
  onMoodSelect: (mood: Mood) => void;
}

/**
 * Configuration object mapping each mood to its visual properties
 */
export const MOOD_CONFIGS: Record<Mood, MoodConfig> = {
  happy: {
    emoji: '😊',
    label: 'Happy',
    baseColor: 'bg-yellow-100',
    hoverColor: 'hover:bg-yellow-200',
    activeColor: 'bg-yellow-300',
    borderColor: 'border-yellow-300',
  },
  calm: {
    emoji: '😌',
    label: 'Calm',
    baseColor: 'bg-blue-100',
    hoverColor: 'hover:bg-blue-200',
    activeColor: 'bg-blue-300',
    borderColor: 'border-blue-300',
  },
  motivated: {
    emoji: '💪',
    label: 'Motivated',
    baseColor: 'bg-orange-100',
    hoverColor: 'hover:bg-orange-200',
    activeColor: 'bg-orange-300',
    borderColor: 'border-orange-300',
  },
  creative: {
    emoji: '🎨',
    label: 'Creative',
    baseColor: 'bg-purple-100',
    hoverColor: 'hover:bg-purple-200',
    activeColor: 'bg-purple-300',
    borderColor: 'border-purple-300',
  },
};
