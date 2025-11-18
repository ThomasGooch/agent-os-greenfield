import { describe, it, expect } from 'vitest';
import type { Mood, MoodConfig, MoodSelectorProps } from './mood';
import { MOOD_CONFIGS } from './mood';

describe('Mood Types', () => {
  it('should have valid Mood union type inference', () => {
    const validMoods: Mood[] = ['happy', 'calm', 'motivated', 'creative'];

    validMoods.forEach((mood) => {
      expect(['happy', 'calm', 'motivated', 'creative']).toContain(mood);
    });
  });

  it('should have correctly structured MoodConfig interface', () => {
    const happyConfig: MoodConfig = MOOD_CONFIGS.happy;

    expect(happyConfig).toHaveProperty('emoji');
    expect(happyConfig).toHaveProperty('label');
    expect(happyConfig).toHaveProperty('baseColor');
    expect(happyConfig).toHaveProperty('hoverColor');
    expect(happyConfig).toHaveProperty('activeColor');
    expect(happyConfig).toHaveProperty('borderColor');

    expect(typeof happyConfig.emoji).toBe('string');
    expect(typeof happyConfig.label).toBe('string');
    expect(typeof happyConfig.baseColor).toBe('string');
  });

  it('should have all four mood configurations defined', () => {
    expect(MOOD_CONFIGS).toHaveProperty('happy');
    expect(MOOD_CONFIGS).toHaveProperty('calm');
    expect(MOOD_CONFIGS).toHaveProperty('motivated');
    expect(MOOD_CONFIGS).toHaveProperty('creative');

    expect(MOOD_CONFIGS.happy.emoji).toBe('😊');
    expect(MOOD_CONFIGS.calm.emoji).toBe('😌');
    expect(MOOD_CONFIGS.motivated.emoji).toBe('💪');
    expect(MOOD_CONFIGS.creative.emoji).toBe('🎨');
  });

  it('should validate MoodSelectorProps interface structure', () => {
    const mockCallback = (mood: Mood) => {
      expect(['happy', 'calm', 'motivated', 'creative']).toContain(mood);
    };

    const props: MoodSelectorProps = {
      disabled: false,
      onMoodSelect: mockCallback,
    };

    expect(props.disabled).toBe(false);
    expect(typeof props.onMoodSelect).toBe('function');

    // Test callback with valid mood
    props.onMoodSelect('happy');
  });
});
