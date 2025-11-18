import { describe, it, expect } from 'vitest';
import { MoodInterpreterAgent } from './MoodInterpreterAgent';
import type { Mood } from '@/types/mood';

describe('MoodInterpreterAgent', () => {
  it('should return same instance for multiple getInstance calls', () => {
    const instance1 = MoodInterpreterAgent.getInstance();
    const instance2 = MoodInterpreterAgent.getInstance();

    expect(instance1).toBe(instance2);
  });

  it('should return happy-specific prompt for happy mood', () => {
    const agent = MoodInterpreterAgent.getInstance();
    const prompt = agent.getPromptForMood('happy');

    expect(prompt).toBeTruthy();
    expect(typeof prompt).toBe('string');
    expect(prompt.length).toBeGreaterThan(0);
    expect(prompt.toLowerCase()).toContain('happy');
  });

  it('should return calm-specific prompt for calm mood', () => {
    const agent = MoodInterpreterAgent.getInstance();
    const prompt = agent.getPromptForMood('calm');

    expect(prompt).toBeTruthy();
    expect(typeof prompt).toBe('string');
    expect(prompt.length).toBeGreaterThan(0);
    expect(prompt.toLowerCase()).toContain('calm');
  });

  it('should return motivated-specific prompt for motivated mood', () => {
    const agent = MoodInterpreterAgent.getInstance();
    const prompt = agent.getPromptForMood('motivated');

    expect(prompt).toBeTruthy();
    expect(typeof prompt).toBe('string');
    expect(prompt.length).toBeGreaterThan(0);
    expect(prompt.toLowerCase()).toContain('motivat');
  });

  it('should return creative-specific prompt for creative mood', () => {
    const agent = MoodInterpreterAgent.getInstance();
    const prompt = agent.getPromptForMood('creative');

    expect(prompt).toBeTruthy();
    expect(typeof prompt).toBe('string');
    expect(prompt.length).toBeGreaterThan(0);
    expect(prompt.toLowerCase()).toContain('creativ');
  });

  it('should return non-empty strings for all moods', () => {
    const agent = MoodInterpreterAgent.getInstance();
    const moods: Mood[] = ['happy', 'calm', 'motivated', 'creative'];

    moods.forEach((mood) => {
      const prompt = agent.getPromptForMood(mood);
      expect(prompt).toBeTruthy();
      expect(typeof prompt).toBe('string');
      expect(prompt.length).toBeGreaterThan(0);
      expect(prompt.length).toBeLessThan(250); // Short and simple (< 50 words ~= 250 chars)
    });
  });
});
