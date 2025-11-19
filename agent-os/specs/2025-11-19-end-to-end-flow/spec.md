# Specification: End-to-End Flow

## Goal
Refine the MoodInterpreterAgent prompt templates to generate concise 3-sentence inspirational messages instead of verbose content, ensuring the complete mood selection to display pipeline produces focused, impactful output.

## User Stories
- As a user, I want to receive exactly 3 sentences of inspiration so that the message is concise and impactful rather than overwhelming
- As a user, I want the AI-generated content to match my selected mood while remaining brief so that I can quickly absorb the inspiration

## Specific Requirements

**Update MoodInterpreterAgent Prompt Templates**
- Modify all 4 prompt template constants (HAPPY_PROMPT, CALM_PROMPT, MOTIVATED_PROMPT, CREATIVE_PROMPT)
- Each prompt must explicitly request exactly 3 sentences in the response
- Prompts should specify concise, focused output format
- Maintain mood-specific tone and context for each template
- Keep prompts clear and direct to guide Ollama toward brief responses
- Example format: "Generate exactly 3 sentences of [mood-type] inspiration..."

**Verify End-to-End Flow**
- Test complete flow: mood selection → MoodInterpreterAgent → ContentGeneratorAgent → Ollama → display
- Ensure updated prompts produce 3-sentence responses consistently
- Verify InspirationCard displays new shorter content correctly
- Confirm loading states work properly with updated prompts
- Validate that streaming accumulation completes successfully

**Maintain Existing Architecture**
- Keep MoodInterpreterAgent singleton pattern unchanged
- Preserve ContentGeneratorAgent streaming and accumulation logic
- No changes to App.tsx state management or handleMoodSelect flow
- No modifications to InspirationCard component
- Retain all existing error handling and circuit breaker functionality

## Existing Code to Leverage

**MoodInterpreterAgent (`src/agents/MoodInterpreterAgent.ts`)**
- Current implementation has 4 prompt constants with simple short prompts
- Singleton pattern already established with getInstance() method
- getPromptForMood() method uses switch statement for mood routing
- Only modification needed: update prompt constant values to request 3 sentences
- Keep all existing structure, imports, and method signatures

**ContentGeneratorAgent (`src/agents/ContentGeneratorAgent.ts`)**
- Streaming accumulation logic already handles full response collection
- No changes needed - will work with updated prompt outputs
- Circuit breaker and retry logic remain unchanged
- Error transformation continues to function as-is

**App.tsx Flow**
- handleMoodSelect orchestrates the complete pipeline correctly
- Loading state management works with existing InspirationCard
- No modifications needed to the end-to-end flow logic

**InspirationCard Component**
- Displays content with transitions and loading skeleton
- Will automatically handle shorter 3-sentence content
- No component changes required

**Testing Patterns**
- Existing MoodInterpreterAgent tests validate prompt generation
- Tests check for mood-specific keywords in prompts
- Update test expectations to verify prompts request 3 sentences

## Out of Scope
- Performance optimization and response time monitoring
- Additional error handling for empty responses
- Automatic retry when Ollama connection status changes
- Message history or storage features
- Content regeneration functionality
- Saving favorite messages
- Customizing mood options
- Progress feedback during streaming
- Changes to loading indicators beyond existing skeleton
- Modifications to ContentGeneratorAgent streaming logic
