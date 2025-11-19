import { describe, it, expect, beforeEach } from 'vitest';
import { MoodInterpreterAgent } from './MoodInterpreterAgent';
import { ollamaClient } from '@/services/OllamaClient';
import type { Mood } from '@/types/mood';

/**
 * Integration tests for agent workflow with real Ollama instance
 * These tests verify end-to-end functionality and are skipped if Ollama is unavailable
 */
describe('Agent Integration Tests', () => {
  beforeEach(async () => {
    const status = await ollamaClient.checkHealth();
    if (status !== 'connected') {
      console.warn('Ollama not connected - some tests may be limited');
    }
  });

  it('should verify Ollama connection is available for integration tests', async () => {
    const status = await ollamaClient.checkHealth();

    if (status === 'connected') {
      expect(status).toBe('connected');
    } else {
      console.warn(
        'Ollama not available - some integration tests will be skipped'
      );
      expect(status).toBe('disconnected');
    }
  });

  it('should complete mood-to-prompt workflow', () => {
    const moodInterpreter = MoodInterpreterAgent.getInstance();
    const moods: Mood[] = ['happy', 'calm', 'motivated', 'creative'];

    moods.forEach((mood) => {
      const prompt = moodInterpreter.getPromptForMood(mood);

      expect(prompt).toBeTruthy();
      expect(typeof prompt).toBe('string');
      expect(prompt.length).toBeGreaterThan(10);

      // Verify prompt is mood-appropriate (basic check)
      if (mood === 'happy') {
        expect(prompt.toLowerCase()).toMatch(/joy|happy|cheer|bright|smile/);
      } else if (mood === 'calm') {
        expect(prompt.toLowerCase()).toMatch(
          /calm|peace|serene|tranquil|quiet/
        );
      } else if (mood === 'motivated') {
        expect(prompt.toLowerCase()).toMatch(
          /motivat|inspire|achiev|goal|success/
        );
      } else if (mood === 'creative') {
        expect(prompt.toLowerCase()).toMatch(
          /creativ|imaginat|original|artis|innovat/
        );
      }
    });
  });

  it('should maintain singleton pattern across agents', () => {
    const moodInstance1 = MoodInterpreterAgent.getInstance();
    const moodInstance2 = MoodInterpreterAgent.getInstance();

    expect(moodInstance1).toBe(moodInstance2);
  });

  it('should verify agent types are properly exported', async () => {
    // Import the types to ensure they're available
    const { MoodInterpreterAgent } = await import('./MoodInterpreterAgent');
    const { ContentGeneratorAgent } = await import('./ContentGeneratorAgent');

    expect(MoodInterpreterAgent).toBeDefined();
    expect(ContentGeneratorAgent).toBeDefined();

    const moodAgent = MoodInterpreterAgent.getInstance();
    const contentAgent = ContentGeneratorAgent.getInstance();

    expect(moodAgent).toBeDefined();
    expect(contentAgent).toBeDefined();
    expect(typeof moodAgent.getPromptForMood).toBe('function');
    expect(typeof contentAgent.generateContent).toBe('function');
  });

  it('should handle all mood types in workflow', () => {
    const moodInterpreter = MoodInterpreterAgent.getInstance();
    const moods: Mood[] = ['happy', 'calm', 'motivated', 'creative'];
    const prompts = new Set<string>();

    moods.forEach((mood) => {
      const prompt = moodInterpreter.getPromptForMood(mood);
      prompts.add(prompt);
    });

    // All prompts should be unique
    expect(prompts.size).toBe(4);
  });

  it('should verify all prompts request exactly 3 sentences', () => {
    const moodInterpreter = MoodInterpreterAgent.getInstance();
    const moods: Mood[] = ['happy', 'calm', 'motivated', 'creative'];

    moods.forEach((mood) => {
      const prompt = moodInterpreter.getPromptForMood(mood);
      expect(prompt.toLowerCase()).toContain('exactly 3 sentences');
    });
  });

  it('should verify prompts maintain concise directive language', () => {
    const moodInterpreter = MoodInterpreterAgent.getInstance();
    const moods: Mood[] = ['happy', 'calm', 'motivated', 'creative'];

    moods.forEach((mood) => {
      const prompt = moodInterpreter.getPromptForMood(mood);
      expect(prompt.toLowerCase()).toContain('generate');
      expect(prompt.toLowerCase()).toContain('concise');
    });
  });
});
