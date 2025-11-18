import type { Mood } from '@/types/mood';

/**
 * MoodInterpreterAgent - Maps user moods to optimized prompts
 *
 * Translates the four mood states (Happy, Calm, Motivated, Creative) into
 * appropriate prompt templates for AI content generation.
 *
 * @example
 * ```typescript
 * import { MoodInterpreterAgent } from '@/agents/MoodInterpreterAgent';
 *
 * const agent = MoodInterpreterAgent.getInstance();
 * const prompt = agent.getPromptForMood('happy');
 * // Returns: "Generate an inspiring message for someone feeling happy"
 * ```
 */
export class MoodInterpreterAgent {
  private static instance: MoodInterpreterAgent;

  private readonly HAPPY_PROMPT =
    'Generate an inspiring message for someone feeling happy';
  private readonly CALM_PROMPT =
    'Generate a peaceful message for someone feeling calm';
  private readonly MOTIVATED_PROMPT =
    'Generate an energizing message for someone feeling motivated';
  private readonly CREATIVE_PROMPT =
    'Generate an imaginative message for someone feeling creative';

  /**
   * Private constructor enforces singleton pattern
   */
  private constructor() {}

  /**
   * Get singleton instance of MoodInterpreterAgent
   */
  public static getInstance(): MoodInterpreterAgent {
    if (!MoodInterpreterAgent.instance) {
      MoodInterpreterAgent.instance = new MoodInterpreterAgent();
    }
    return MoodInterpreterAgent.instance;
  }

  /**
   * Get optimized prompt for specified mood
   *
   * @param mood - User's current mood state
   * @returns Prompt template string optimized for the mood
   */
  public getPromptForMood(mood: Mood): string {
    switch (mood) {
      case 'happy':
        return this.HAPPY_PROMPT;
      case 'calm':
        return this.CALM_PROMPT;
      case 'motivated':
        return this.MOTIVATED_PROMPT;
      case 'creative':
        return this.CREATIVE_PROMPT;
    }
  }
}
