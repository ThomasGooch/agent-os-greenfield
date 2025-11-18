# Specification: Agent Architecture Foundation

## Goal
Create two singleton agent classes that enable mood-based AI content generation: MoodInterpreterAgent maps user moods to optimized prompts, and ContentGeneratorAgent handles Ollama communication with retry logic, circuit breaker, and user-friendly error handling.

## User Stories
- As a user, I want the system to generate mood-appropriate inspirational content so that I receive relevant messages matching my emotional state
- As a user, I want the system to handle errors gracefully so that I understand what went wrong and can retry without technical jargon

## Specific Requirements

**MoodInterpreterAgent Class**
- Create TypeScript class in `src/agents/MoodInterpreterAgent.ts`
- Implement singleton pattern with private constructor and `getInstance()` method
- Single public method: `getPromptForMood(mood: Mood): string`
- Store 4 prompt templates as private readonly constants mapping to each mood
- Prompts should be short, simple strings (e.g., "Generate an inspiring message for someone feeling happy")
- Return appropriate prompt string based on mood parameter
- Use existing `Mood` type from `src/types/mood.ts`

**ContentGeneratorAgent Class**
- Create TypeScript class in `src/agents/ContentGeneratorAgent.ts`
- Implement singleton pattern matching OllamaClient structure
- Wrap `OllamaClient.getInstance().generateStream()` for content generation
- Single public method: `generateContent(prompt: string): Promise<GenerationResult>`
- Accumulate full streaming response internally before returning (not chunk-by-chunk)
- Return complete message as string with success/error state

**Response Accumulation**
- Internally iterate through `OllamaClient.generateStream()` async generator
- Concatenate all text chunks into single string
- Only return to caller once streaming completes
- UI will show loading spinner while waiting (implemented in future spec)

**Error Transformation**
- Catch all OllamaClient errors and transform to user-friendly messages
- Map `CONNECTION_FAILED` → "Unable to connect to local AI service"
- Map `TIMEOUT` → "Request timed out. Please try again"
- Map `REQUEST_FAILED` → "AI service encountered an error"
- Map all other errors → "Something went wrong. Please try again"
- Return structured error object with `success: false` and `error: string`

**Retry Logic with Exponential Backoff**
- Implement 2 retry attempts for transient errors (timeouts, connection failures)
- Use exponential backoff: wait 1 second before first retry, 2 seconds before second retry
- Only retry on `CONNECTION_FAILED` and `TIMEOUT` error codes
- Do not retry on permanent errors (`REQUEST_FAILED`, `PARSE_ERROR`)
- Track attempt count and log retry attempts

**Circuit Breaker Pattern**
- Track consecutive failure count across all requests
- Open circuit after 3 consecutive failures (reject immediately without calling Ollama)
- Half-open circuit after 30 seconds (allow 1 test request)
- Close circuit on successful request (reset failure count)
- Return user-friendly error when circuit is open: "Service temporarily unavailable. Please try again in a moment"

**Type Definitions**
- Create `src/types/agent.ts` for agent-specific types
- Define `GenerationResult` interface with `success: boolean`, `content?: string`, `error?: string`
- Define `CircuitState` type: `'closed' | 'open' | 'half-open'`
- Export all types for use in tests and future components

**Comprehensive Testing**
- Follow TDD red-green-refactor cycle for all implementation
- Unit tests for MoodInterpreterAgent: verify all 4 moods return correct prompts
- Unit tests for ContentGeneratorAgent with mocked OllamaClient
- Test successful content generation and full response accumulation
- Test retry logic: should retry on timeout/connection failure, not on permanent errors
- Test circuit breaker: opens after 3 failures, half-opens after 30s, closes on success
- Test error transformation: verify all error codes map to user-friendly messages
- Create integration tests in `.integration.test.ts` files for actual Ollama communication

## Existing Code to Leverage

**`src/services/OllamaClient.ts` - Singleton Pattern**
- Follow exact same singleton structure with private constructor
- Use `getInstance()` static method returning cached instance
- Match JSDoc comment style with `@example` blocks
- Store singleton instance in private static property

**`src/services/OllamaClient.ts` - Error Handling**
- Replicate comprehensive try-catch patterns with AbortController for timeouts
- Use typed error objects with `code`, `message`, and optional `details` properties
- Follow pattern of checking `error instanceof Error` before accessing properties
- Clear timeout handlers in all code paths (try and catch blocks)

**`src/types/ollama.ts` - Type Definitions**
- Follow structure for defining interfaces (OllamaRequest, OllamaStreamChunk, OllamaError)
- Include JSDoc comments explaining each property
- Export all types from index for centralized imports
- Create similar structure for agent types in `src/types/agent.ts`

**`src/types/mood.ts` - Mood Type**
- Use existing `Mood` union type ('happy' | 'calm' | 'motivated' | 'creative')
- Import from `@/types` using path alias
- No need to duplicate or extend this type

**Test Structure Pattern**
- Follow naming convention: `ClassName.test.ts` for unit tests, `ClassName.integration.test.ts` for integration
- Use Vitest with `describe`, `it`, `expect`, `vi.fn()` for mocks
- Mock external dependencies (OllamaClient) in unit tests using `vi.mock()`
- Keep unit tests fast (< 100ms each), integration tests can be slower
- Use `beforeEach` to reset mocks and state between tests

## Out of Scope
- Prompt caching or optimization mechanisms
- User customization of prompt templates
- Support for AI models other than llama3.1:8b
- Conversation history or context persistence
- Streaming/chunked responses to UI (full response only)
- Toaster UI component for displaying errors (separate spec)
- Loading spinner component (separate spec)
- Integration with App.tsx component (separate spec)
- Performance monitoring or telemetry
- Configurable retry attempts or circuit breaker thresholds
