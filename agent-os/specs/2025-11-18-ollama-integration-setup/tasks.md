# Task Breakdown: Ollama Integration Setup

## Overview
Total Tasks: 4 task groups with 17 sub-tasks
Focus: Service layer with TypeScript types, health checks, streaming, and TDD testing

## Task List

### Service Layer Foundation

#### Task Group 1: TypeScript Types and Interfaces
**Dependencies:** None
**Effort:** Small (S)

- [x] 1.0 Complete TypeScript type definitions
  - [x] 1.1 Write 2-8 focused tests for type definitions
    - Test type safety with valid Ollama request structures
    - Test ConnectionStatus type guards if applicable
    - Test error type instantiation and properties
    - Limit to 2-8 highly focused tests maximum
  - [x] 1.2 Create `src/types/ollama.ts` with core interfaces
    - `OllamaRequest` interface: `model`, `prompt`, `stream` properties
    - `OllamaStreamChunk` interface: `model`, `created_at`, `response`, `done` properties
    - `OllamaError` interface: `code`, `message`, `details` properties
    - `ConnectionStatus` type: `'connected' | 'disconnected' | 'error'`
  - [x] 1.3 Export all types from `src/types/index.ts`
    - Re-export Ollama types for centralized imports
    - Follow existing types folder pattern
  - [x] 1.4 Ensure type definition tests pass
    - Run ONLY the 2-8 tests written in 1.1
    - Verify type safety and structure
    - Do NOT run the entire test suite at this stage

**Acceptance Criteria:**
- The 2-8 tests written in 1.1 pass
- All interfaces have strict TypeScript definitions
- Types are exported from centralized location
- No `any` types used

### Ollama Client Service

#### Task Group 2: Core Client Implementation
**Dependencies:** Task Group 1
**Effort:** Medium (M)

- [x] 2.0 Complete OllamaClient service
  - [x] 2.1 Write 2-8 focused tests for OllamaClient (TDD - Red phase)
    - Test health check returns 'connected' when Ollama is available
    - Test health check returns 'disconnected' when Ollama is unavailable
    - Test health check returns 'error' when network error occurs
    - Test generateStream yields text chunks from mocked response
    - Test generateStream throws timeout error after 20 seconds
    - Test error messages are descriptive and actionable
    - Mock all Ollama API calls using Vitest mocks
    - Use short test prompts (50-100 characters)
    - Limit to 2-8 highly focused tests maximum
  - [x] 2.2 Create `src/services/OllamaClient.ts` class (TDD - Green phase)
    - Hardcoded endpoint: `http://localhost:11434`
    - Hardcoded model: `llama3.1:8b`
    - 20-second timeout constant
    - Private constructor for singleton pattern
    - Static instance getter method
  - [x] 2.3 Implement `checkHealth()` method
    - Ping `/api/tags` endpoint to verify Ollama is running
    - Return ConnectionStatus: 'connected', 'disconnected', or 'error'
    - Handle network errors gracefully
    - Respect 20-second timeout
  - [x] 2.4 Implement `generateStream(prompt: string)` method
    - Use fetch with streaming for `/api/generate` endpoint
    - Send OllamaRequest with model, prompt, and stream=true
    - Parse JSON streaming response line by line
    - Yield text chunks as AsyncGenerator
    - Handle stream completion when done=true
    - Throw typed OllamaError on failures
  - [x] 2.5 Implement error handling with typed errors
    - Connection failure errors with clear messages
    - Timeout errors after 20 seconds
    - Model unavailable errors
    - No retry logic (out of scope)
  - [x] 2.6 Export singleton instance
    - `export const ollamaClient = OllamaClient.getInstance()`
    - Document usage in JSDoc comments
  - [x] 2.7 Ensure OllamaClient tests pass (TDD - Refactor phase)
    - Run ONLY the 2-8 tests written in 2.1
    - Verify all critical behaviors work
    - Refactor for code quality while keeping tests green
    - Do NOT run the entire test suite at this stage

**Acceptance Criteria:**
- The 2-8 tests written in 2.1 pass
- Health check correctly identifies Ollama status
- Streaming generates and yields chunks properly
- Timeouts trigger after 20 seconds
- Error messages are descriptive
- Singleton pattern implemented correctly
- TDD red-green-refactor cycle followed

### React Integration

#### Task Group 3: Health Check Hook and App Integration
**Dependencies:** Task Group 2
**Effort:** Small (S)

- [x] 3.0 Complete React integration
  - [x] 3.1 Write 2-8 focused tests for health check integration
    - Test useOllamaHealth hook initializes with 'disconnected' status
    - Test hook calls checkHealth on mount
    - Test hook updates status state correctly
    - Test App component displays connection status
    - Mock ollamaClient.checkHealth using Vitest
    - Limit to 2-8 highly focused tests maximum
  - [x] 3.2 Create `src/hooks/useOllamaHealth.ts` custom hook
    - Accept no parameters
    - Return `{ status: ConnectionStatus, isChecking: boolean }`
    - Call ollamaClient.checkHealth() on mount
    - Update state with connection status
    - Handle errors gracefully
  - [x] 3.3 Integrate health check into App.tsx
    - Call useOllamaHealth hook in App component
    - Display connection status indicator in UI
    - Show error message if status is 'error' or 'disconnected'
    - Use conditional rendering based on status
    - Apply Tailwind classes for styling
  - [x] 3.4 Ensure health check integration tests pass
    - Run ONLY the 2-8 tests written in 3.1
    - Verify hook behavior and App integration
    - Test in browser: verify health check runs on app load
    - Do NOT run the entire test suite at this stage

**Acceptance Criteria:**
- The 2-8 tests written in 3.1 pass
- Health check runs automatically on app startup
- Connection status displays in UI
- Clear error messages shown when Ollama unavailable
- Manual browser testing confirms behavior

### Testing

#### Task Group 4: Test Review & Gap Analysis
**Dependencies:** Task Groups 1-3
**Effort:** Small (S)

- [x] 4.0 Review existing tests and fill critical gaps only
  - [x] 4.1 Review tests from Task Groups 1-3
    - Review the 2-8 tests written for type definitions (Task 1.1)
    - Review the 2-8 tests written for OllamaClient (Task 2.1)
    - Review the 2-8 tests written for React integration (Task 3.1)
    - Total existing tests: approximately 6-24 tests
  - [x] 4.2 Analyze test coverage gaps for Ollama integration only
    - Identify critical workflows lacking coverage:
      - End-to-end streaming flow from prompt to chunks
      - Reconnection after Ollama becomes available
      - Multiple concurrent stream requests
    - Focus ONLY on gaps related to Ollama integration spec
    - Prioritize integration and end-to-end workflows
  - [x] 4.3 Write up to 10 additional strategic tests maximum
    - Add maximum of 10 new tests to fill identified critical gaps
    - Potential additions:
      - Integration test: health check → stream generation flow
      - Edge case: empty prompt handling
      - Edge case: malformed JSON in stream response
      - Edge case: stream interruption mid-response
      - Integration test: UI error display when health check fails
    - Focus on integration points between service and React
    - Skip performance tests, load tests, and accessibility tests
  - [x] 4.4 Run feature-specific tests only
    - Run ONLY tests related to Ollama integration (tests from 1.1, 2.1, 3.1, and 4.3)
    - Expected total: approximately 16-34 tests maximum
    - Do NOT run the entire application test suite
    - Verify all critical Ollama workflows pass
    - Verify 80% coverage threshold met for new code

**Acceptance Criteria:**
- All Ollama integration tests pass (approximately 16-34 tests total)
- Critical streaming and health check workflows covered
- No more than 10 additional tests added in gap analysis
- Testing focused exclusively on Ollama integration feature
- 80% code coverage threshold met for new service code

## Execution Order

Recommended implementation sequence:
1. TypeScript Types and Interfaces (Task Group 1) - Foundation
2. Core Client Implementation (Task Group 2) - Service layer with TDD
3. Health Check Hook and App Integration (Task Group 3) - React integration
4. Test Review & Gap Analysis (Task Group 4) - Fill critical testing gaps

## Notes

- **No Backend/API Layer**: This is a frontend-only integration with local Ollama
- **No Database**: Stateless service, no persistence needed
- **TDD Mandatory**: Follow red-green-refactor for Task Group 2
- **Singleton Pattern**: OllamaClient should be app-wide singleton
- **Streaming Focus**: Core value is streaming response handling
- **Manual Testing**: Browser testing required for Task 3.4 to verify real behavior
