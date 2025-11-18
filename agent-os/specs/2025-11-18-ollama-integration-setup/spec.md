# Specification: Ollama Integration Setup

## Goal
Establish reliable connection and communication with local Ollama instance to enable AI-powered content generation with streaming responses.

## User Stories
- As a developer, I want the app to automatically verify Ollama connectivity on startup so that issues are detected early
- As a user, I want to see clear error messages when Ollama is unavailable so I know what went wrong

## Specific Requirements

**Ollama Client Service**
- Create TypeScript class `OllamaClient` to manage all Ollama communication
- Use hardcoded endpoint: `http://localhost:11434`
- Use hardcoded model: `llama3.1:8b`
- Implement 20-second timeout for all requests
- Export singleton instance for app-wide use

**Health Check System**
- Implement `checkHealth()` method that pings Ollama API on app startup
- Return connection status: `connected`, `disconnected`, or `error`
- Automatically execute health check when React app mounts
- Store connection state in React state for UI access

**Streaming Response Implementation**
- Implement `generateStream(prompt: string)` method using fetch with streaming
- Parse Server-Sent Events (SSE) or JSON streaming format from Ollama
- Yield text chunks incrementally as they arrive
- Handle stream completion and errors gracefully

**Request/Response TypeScript Interfaces**
- Define `OllamaRequest` interface with `model`, `prompt`, and `stream` properties
- Define `OllamaStreamChunk` interface for parsing streaming responses
- Define `OllamaError` interface for typed error handling
- Define `ConnectionStatus` type for health check states

**Error Handling**
- Throw typed errors for connection failures with descriptive messages
- Throw typed errors for timeout scenarios after 20 seconds
- Throw typed errors when model is not available
- Do not implement retry logic (out of scope)

**Testing Strategy**
- Write tests before implementation (TDD red-green-refactor)
- Mock Ollama API responses using Vitest mocks
- Test health check returns correct status for available/unavailable scenarios
- Test streaming correctly parses and yields chunks
- Test timeout triggers after 20 seconds
- Test error messages are clear and actionable
- Use short test prompts (50-100 characters)

## Visual Design

No visual assets provided.

## Existing Code to Leverage

No existing code to leverage - greenfield implementation.

## Out of Scope
- Performance requirement testing (<2s response time) - deferred to later optimization spec
- Custom port/host configuration for Ollama endpoint
- Model downloading or installation functionality
- Ollama installation instructions or user setup guides
- Support for multiple models or model switching
- Conversation history or context management
- Response caching mechanisms
- Retry logic for failed requests
- Exponential backoff strategies
- Connection pooling or request queuing
