# Task Breakdown: Agent Architecture Foundation

## Overview
Total Tasks: 4 task groups with focused TDD approach

## Task List

### Type Definitions Layer

#### Task Group 1: Agent Type Definitions ✅
**Dependencies:** None

- [x] 1.0 Complete type definitions for agents
  - [x] 1.1 Write 4 focused tests for agent types
    - Test `GenerationResult` with success state (has content, no error)
    - Test `GenerationResult` with error state (has error, no content)
    - Test `CircuitState` type accepts all valid values
    - Test type safety: invalid states are caught by TypeScript
  - [x] 1.2 Create `src/types/agent.ts` with type definitions
    - Define `GenerationResult` interface with `success: boolean`, `content?: string`, `error?: string`
    - Define `CircuitState` type: `'closed' | 'open' | 'half-open'`
    - Add JSDoc comments for each type following `src/types/ollama.ts` pattern
  - [x] 1.3 Export types from `src/types/index.ts`
    - Export all agent types for centralized imports
    - Follow existing pattern from ollama and mood type exports
  - [x] 1.4 Ensure type definition tests pass
    - Run ONLY the 4 tests written in 1.1
    - Verify TypeScript compilation with strict mode
    - Do NOT run the entire test suite at this stage

**Acceptance Criteria:**
- ✅ The 4 tests written in 1.1 pass
- ✅ TypeScript compiles without errors in strict mode
- ✅ Types can be imported using `@/types` path alias
- ✅ JSDoc comments are present for all exported types

### MoodInterpreterAgent Layer

#### Task Group 2: MoodInterpreterAgent Implementation ✅
**Dependencies:** Task Group 1

- [x] 2.0 Complete MoodInterpreterAgent
  - [x] 2.1 Write 6 focused tests for MoodInterpreterAgent
    - Test singleton pattern: `getInstance()` returns same instance
    - Test `getPromptForMood('happy')` returns happy-specific prompt
    - Test `getPromptForMood('calm')` returns calm-specific prompt
    - Test `getPromptForMood('motivated')` returns motivated-specific prompt
    - Test `getPromptForMood('creative')` returns creative-specific prompt
    - Test all prompts are non-empty strings
  - [x] 2.2 Create `src/agents/MoodInterpreterAgent.ts`
    - Implement singleton pattern with private constructor and static `getInstance()`
    - Store singleton instance in private static property
    - Add JSDoc comments with `@example` block following OllamaClient pattern
  - [x] 2.3 Implement `getPromptForMood(mood: Mood): string` method
    - Create 4 private readonly prompt template constants (one per mood)
    - Happy prompt: short, simple, uplifting tone
    - Calm prompt: short, simple, peaceful tone
    - Motivated prompt: short, simple, energizing tone
    - Creative prompt: short, simple, imaginative tone
    - Return appropriate prompt based on mood parameter
  - [x] 2.4 Import `Mood` type from `src/types/mood.ts`
    - Use `@/types` path alias for import
    - No need to duplicate or extend the Mood type
  - [x] 2.5 Ensure MoodInterpreterAgent tests pass
    - Run ONLY the 6 tests written in 2.1
    - Verify all 4 moods return correct prompts
    - Do NOT run the entire test suite at this stage

**Acceptance Criteria:**
- ✅ The 6 tests written in 2.1 pass
- ✅ Singleton pattern works correctly
- ✅ All 4 moods return appropriate prompt strings
- ✅ Prompts are short and simple (< 50 words each)
- ✅ TypeScript compiles without errors

### ContentGeneratorAgent Layer

#### Task Group 3: ContentGeneratorAgent with Error Handling ✅
**Dependencies:** Task Groups 1, 2

- [x] 3.0 Complete ContentGeneratorAgent with retry and circuit breaker
  - [x] 3.1 Write 8 focused tests for ContentGeneratorAgent
    - Test successful content generation: returns `GenerationResult` with success=true and content
    - Test response accumulation: verifies all chunks concatenated into single string
    - Test error transformation: `CONNECTION_FAILED` → user-friendly message
    - Test error transformation: `TIMEOUT` → user-friendly message
    - Test retry logic: retries 2 times on `CONNECTION_FAILED` with exponential backoff
    - Test no retry on permanent errors: `REQUEST_FAILED` should not retry
    - Test circuit breaker opens after 3 consecutive failures
    - Test circuit breaker half-opens after 30 seconds
  - [x] 3.2 Create `src/agents/ContentGeneratorAgent.ts` with singleton pattern
    - Implement private constructor and static `getInstance()` method
    - Store singleton instance in private static property
    - Add JSDoc comments with `@example` block
  - [x] 3.3 Implement `generateContent(prompt: string): Promise<GenerationResult>` method
    - Call `OllamaClient.getInstance().generateStream(prompt)`
    - Iterate through async generator to accumulate all chunks
    - Concatenate chunks into single string
    - Return `GenerationResult` with success=true and content on success
  - [x] 3.4 Implement error transformation
    - Catch all errors from OllamaClient
    - Map `CONNECTION_FAILED` → "Unable to connect to local AI service"
    - Map `TIMEOUT` → "Request timed out. Please try again"
    - Map `REQUEST_FAILED` → "AI service encountered an error"
    - Map all other errors → "Something went wrong. Please try again"
    - Return `GenerationResult` with success=false and error message
  - [x] 3.5 Implement retry logic with exponential backoff
    - Track attempt count (max 2 retries = 3 total attempts)
    - Only retry on `CONNECTION_FAILED` and `TIMEOUT` errors
    - Wait 1 second before first retry, 2 seconds before second retry
    - Log retry attempts for debugging
    - Do not retry on permanent errors
  - [x] 3.6 Implement circuit breaker pattern
    - Track consecutive failure count as private instance property
    - Open circuit after 3 consecutive failures
    - When circuit is open, return error immediately without calling Ollama
    - Half-open circuit after 30 seconds (use setTimeout)
    - Close circuit and reset failure count on successful request
    - Return "Service temporarily unavailable. Please try again in a moment" when circuit open
  - [x] 3.7 Ensure ContentGeneratorAgent tests pass
    - Run ONLY the 8 tests written in 3.1
    - Mock OllamaClient using `vi.mock()` for unit tests
    - Verify retry logic, circuit breaker, and error transformation
    - Do NOT run the entire test suite at this stage

**Acceptance Criteria:**
- ✅ The 8 tests written in 3.1 pass
- ✅ Response accumulation works correctly
- ✅ All error codes transform to user-friendly messages
- ✅ Retry logic retries 2 times with exponential backoff on transient errors
- ✅ Retry logic does NOT retry on permanent errors
- ✅ Circuit breaker opens after 3 failures, half-opens after 30s, closes on success

### Integration Testing

#### Task Group 4: Integration Tests & Gap Analysis ✅
**Dependencies:** Task Groups 1-3

- [x] 4.0 Review existing tests and add integration tests
  - [x] 4.1 Review tests from Task Groups 1-3
    - Review the 4 type tests from Task 1.1
    - Review the 6 MoodInterpreterAgent tests from Task 2.1
    - Review the 8 ContentGeneratorAgent tests from Task 3.1
    - Total existing unit tests: 18 tests
  - [x] 4.2 Analyze test coverage gaps for THIS feature only
    - Identify missing integration tests with actual Ollama instance
    - Check for missing end-to-end workflow tests (mood → prompt → generation)
    - Assess error scenario coverage gaps
    - Focus ONLY on agent architecture feature requirements
  - [x] 4.3 Write 5 integration tests
    - Create `src/agents/ContentGeneratorAgent.integration.test.ts`
    - Test Ollama connection verification
    - Test mood-to-prompt workflow
    - Test singleton pattern consistency
    - Test agent type exports
    - Test all mood types in workflow
  - [x] 4.4 Run feature-specific tests only
    - Run unit tests from Task Groups 1-3 (18 tests)
    - Run integration tests from Task 4.3 (5 tests)
    - Total: 23 tests passing
    - Do NOT run the entire application test suite
    - Verify critical agent workflows pass

**Acceptance Criteria:**
- ✅ All feature-specific tests pass (23 tests total)
- ✅ Integration tests verify workflow integration
- ✅ End-to-end workflow (mood → prompt) is tested
- ✅ 5 integration tests added (under 8 limit)
- ✅ Testing focused exclusively on agent architecture requirements

## Execution Order

Recommended implementation sequence:
1. Type Definitions Layer (Task Group 1)
2. MoodInterpreterAgent Layer (Task Group 2)
3. ContentGeneratorAgent Layer (Task Group 3)
4. Integration Testing (Task Group 4)

## Implementation Notes

**Testing Approach:**
- Use TDD red-green-refactor cycle for all task groups
- Mock OllamaClient in unit tests using `vi.mock()`
- Use actual Ollama instance in integration tests
- Keep unit tests fast (< 100ms), integration tests can be slower

**Code Patterns to Follow:**
- Singleton pattern from `src/services/OllamaClient.ts`
- Type definition structure from `src/types/ollama.ts`
- Error handling patterns from `src/services/OllamaClient.ts`
- Test structure from existing `.test.ts` files

**Performance Targets:**
- Response accumulation should complete in < 2 seconds
- Retry backoff timing: 1s first retry, 2s second retry
- Circuit breaker half-open timeout: 30 seconds
