# Spec Requirements: Agent Architecture Foundation

## Initial Description
Agent Architecture Foundation — Implement MoodInterpreterAgent to map moods to prompt templates and ContentGeneratorAgent to handle Ollama API communication with error handling

## Requirements Discussion

### First Round Questions

**Q1: Prompt Template Structure**
**Question:** I'm assuming we should create 4 distinct prompt templates (one per mood) that are optimized for generating inspirational content. The templates would be stored as constants in the MoodInterpreterAgent and would include context about the mood (e.g., for "Happy" → prompts that generate uplifting, joyful content; for "Calm" → peaceful, soothing content). Is that correct, or should we use a more dynamic prompt construction approach?
**Answer:** Yes - 4 distinct prompt templates stored as constants, one per mood with mood-specific context.

**Q2: Agent Class Structure**
**Question:** I'm thinking we should create two TypeScript classes:
- `MoodInterpreterAgent` - a simple mapper with a single method like `getPromptForMood(mood: Mood): string`
- `ContentGeneratorAgent` - wraps the existing `OllamaClient` and handles streaming with error transformation

Both would be instantiated as singletons similar to `OllamaClient`. Is this the right approach, or would you prefer different patterns (e.g., functional approach, dependency injection)?
**Answer:** Singletons are good - use the same pattern as OllamaClient.

**Q3: Error Handling Strategy**
**Question:** For the ContentGeneratorAgent's error handling, should we:
- Transform technical Ollama errors into user-friendly messages?
- Add retry logic for transient failures (e.g., 1-2 retries with backoff)?
- Return error states that the UI can display (e.g., "Connection lost", "Timed out")?

Or keep it simpler and just throw errors for the UI to handle?
**Answer:** Yes transform technical errors into user-friendly messages. Use default retry and circuit breaker patterns. Return error states that will be displayed in a toaster implementation.

**Q4: Response Format**
**Question:** I'm assuming the ContentGeneratorAgent should yield/stream the text chunks as they arrive (like the existing `generateStream` method), and it's the UI's responsibility to accumulate them into a complete message. Is that correct, or should the agent accumulate the full response before returning?
**Answer:** Accumulate the full response in the agent before returning. The UI will show a loading spinner while the user waits.

**Q5: Prompt Length & Complexity**
**Question:** For the prompt templates, should we aim for:
- Short, simple prompts (e.g., "Generate an inspiring message for someone feeling happy")
- More detailed prompts with specific instructions about tone, length, format?
- Include system instructions or just user prompts?
**Answer:** Short and simple prompts.

**Q6: Testing Strategy**
**Question:** Since we're following TDD, should we:
- Mock the OllamaClient for ContentGeneratorAgent tests?
- Create integration tests that actually call Ollama?
- Test both streaming behavior and error scenarios?
**Answer:** Wrap services to mock (don't test the Ollama library directly). Test both unit tests with mocks and integration scenarios with error handling.

**Q7: Scope Boundaries**
**Question:** Are there any features we should explicitly exclude from this spec, such as:
- Prompt caching or optimization?
- User customization of prompt templates?
- Support for models other than llama3.1:8b?
- History or conversation context?
**Answer:** All are out of scope.

### Existing Code to Reference

**Similar Features Identified:**
- Feature: OllamaClient - Path: `src/services/OllamaClient.ts`
- Pattern to follow: Singleton pattern with getInstance() method, strict TypeScript typing, comprehensive error handling with specific error codes
- Existing types: `src/types/mood.ts` defines the Mood type and mood configurations
- Service structure: Classes in `src/services/` folder with unit tests and integration tests

No additional similar features identified for reference.

## Visual Assets

### Files Provided:
No visual assets provided.

### Visual Insights:
N/A - No visual files found.

## Requirements Summary

### Functional Requirements

**MoodInterpreterAgent:**
- Single method: `getPromptForMood(mood: Mood): string`
- Returns one of 4 pre-defined prompt templates based on mood
- Templates are simple, short strings optimized for each mood:
  - Happy: Generate uplifting, joyful content
  - Calm: Generate peaceful, soothing content
  - Motivated: Generate energizing, action-oriented content
  - Creative: Generate imaginative, inspiring content
- Singleton pattern with `getInstance()` method
- TypeScript class in `src/agents/` folder

**ContentGeneratorAgent:**
- Wraps `OllamaClient` to handle content generation
- Accumulates full streaming response before returning (not chunk-by-chunk)
- Returns complete inspirational message as a string
- Transforms technical Ollama errors into user-friendly error messages
- Implements retry logic with exponential backoff for transient failures
- Implements circuit breaker pattern to prevent cascading failures
- Returns structured error states for toaster notifications
- Singleton pattern with `getInstance()` method
- TypeScript class in `src/agents/` folder

**Error Transformation:**
- `CONNECTION_FAILED` → "Unable to connect to local AI service"
- `TIMEOUT` → "Request timed out. Please try again"
- `REQUEST_FAILED` → "AI service encountered an error"
- Generic errors → "Something went wrong. Please try again"

**Retry & Circuit Breaker:**
- Default retry: 2 attempts with exponential backoff (1s, 2s)
- Circuit breaker: Open after 3 consecutive failures, half-open after 30s
- Only retry on transient errors (timeouts, connection failures)
- Do not retry on permanent errors (invalid model, parse errors)

### Reusability Opportunities

**Existing Patterns to Follow:**
- `OllamaClient` singleton pattern for both agents
- Comprehensive TypeScript typing with interfaces for all inputs/outputs
- Error handling with specific error codes and user-friendly messages
- Service folder structure: `src/agents/MoodInterpreterAgent.ts` and `src/agents/ContentGeneratorAgent.ts`
- Test structure: Unit tests (`.test.ts`) and integration tests (`.integration.test.ts`)
- Existing `Mood` type from `src/types/mood.ts`

**Services to Wrap/Mock:**
- Wrap `OllamaClient.generateStream()` for testing ContentGeneratorAgent
- Mock the OllamaClient in unit tests
- Create integration tests that test against actual Ollama instance

### Scope Boundaries

**In Scope:**
- MoodInterpreterAgent class with mood-to-prompt mapping
- ContentGeneratorAgent class with full response accumulation
- Error transformation to user-friendly messages
- Retry logic with exponential backoff (2 attempts)
- Circuit breaker pattern (open after 3 failures, half-open after 30s)
- Return structured error states for toaster UI
- Unit tests with mocked OllamaClient
- Integration tests for error handling scenarios
- TypeScript strict typing throughout

**Out of Scope:**
- Prompt caching or optimization
- User customization of prompt templates
- Support for models other than llama3.1:8b
- History or conversation context
- Streaming/chunked responses to UI (full response only)
- Actual toaster UI component (handled in separate spec)
- Loading spinner component (handled in separate spec)

### Technical Considerations

**Integration Points:**
- ContentGeneratorAgent uses existing `OllamaClient.getInstance()` and `generateStream()` method
- Both agents will be called from App.tsx when user selects a mood
- Error states will be passed to future toaster component
- Loading state will trigger spinner in future UI work

**Existing System Constraints:**
- Must work with local Ollama instance at `http://localhost:11434`
- Uses `llama3.1:8b` model (no other models)
- 20-second timeout from OllamaClient must be respected
- Performance target: <2 seconds total response time

**Technology Preferences:**
- TypeScript 5+ with strict mode
- Singleton pattern for agents (matching OllamaClient)
- TDD approach with Vitest + React Testing Library
- Error handling following global standards (user-friendly messages, fail fast, specific error types)
- Class-based approach for agents (not functional)

**Testing Requirements:**
- Unit tests for MoodInterpreterAgent (test all 4 moods return correct prompts)
- Unit tests for ContentGeneratorAgent with mocked OllamaClient
- Test retry logic (should retry on timeout/connection failure)
- Test circuit breaker (should open after 3 failures)
- Test error transformation (technical → user-friendly)
- Integration tests for actual Ollama communication
- Test full response accumulation (not streaming to caller)
- Aim for high test coverage on business logic
