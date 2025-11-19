# Task Breakdown: Error Handling & Edge Cases

## Overview
Total Task Groups: 4
Estimated Effort: Medium (M) - 4-6 days

## Task List

### UI Components Layer

#### Task Group 1: Toast Notification System
**Dependencies:** None

- [x] 1.0 Complete toast notification component
  - [x] 1.1 Write 2-8 focused tests for Toast component
    - Test toast renders with message and type (error, success, info, warning)
    - Test auto-dismiss after 5 seconds
    - Test manual close button dismissal
    - Test toast queue with multiple toasts (max 3 visible)
    - Test duplicate message deduplication
    - Test toast animations (slide-in/slide-out)
    - Limit to 2-8 highly focused tests maximum
  - [x] 1.2 Create toast types in `src/types/toast.ts`
    - Define `ToastType = 'error' | 'success' | 'info' | 'warning'`
    - Define `Toast` interface with `id: string`, `message: string`, `type: ToastType`, `duration?: number`
    - Define `ToastContextType` with `showToast(message: string, type: ToastType): void`
    - Export all types
  - [x] 1.3 Create `src/components/Toast.tsx` component
    - Accept props: `id`, `message`, `type`, `onClose`
    - Use Tailwind CSS for styling (fixed positioning, top-right corner)
    - Apply type-specific colors (error: red, success: green, info: blue, warning: yellow)
    - Add close button with X icon
    - Implement slide-in animation on mount
    - Implement slide-out animation on dismiss
    - Use semantic HTML (role="alert", aria-live="polite")
  - [x] 1.4 Create `src/components/ToastContainer.tsx` component
    - Manage toast queue state with useState
    - Stack toasts vertically with spacing (gap-4)
    - Render max 3 toasts at once (dismiss oldest when exceeding)
    - Handle auto-dismiss with setTimeout (5 seconds default)
    - Implement deduplication by message content
    - Generate unique IDs with crypto.randomUUID()
  - [x] 1.5 Create `src/contexts/ToastContext.tsx`
    - Create ToastProvider component wrapping ToastContainer
    - Implement `showToast(message: string, type: ToastType)` function
    - Export `useToast` custom hook
    - Manage toast state at context level
  - [x] 1.6 Integrate ToastProvider in `src/App.tsx`
    - Wrap app content with ToastProvider
    - Import and use ToastProvider as outermost wrapper
    - Ensure toast context available to all child components
  - [x] 1.7 Ensure toast component tests pass
    - Run ONLY the 2-8 tests written in 1.1
    - Verify toasts render, dismiss, and queue correctly
    - Do NOT run the entire test suite at this stage

**Acceptance Criteria:**
- ✅ The 2-8 tests written in 1.1 pass
- ✅ Toast component renders with all 4 types
- ✅ Auto-dismiss works after 5 seconds
- ✅ Manual close button works
- ✅ Max 3 toasts visible, older ones dismissed
- ✅ Duplicate messages deduplicated
- ✅ Animations smooth and performant
- ✅ useToast hook accessible from any component

### Backend Agent Layer

#### Task Group 2: Empty Response & Interrupted Generation Detection
**Dependencies:** Task Group 1

- [x] 2.0 Complete enhanced error detection in ContentGeneratorAgent
  - [x] 2.1 Write 2-8 focused tests for enhanced error detection
    - Test empty response detection (null, undefined, empty string, whitespace-only)
    - Test empty response triggers retry with "Trying again..." toast
    - Test interrupted generation detection (< 10 characters)
    - Test interrupted generation triggers retry with "Content generation interrupted" toast
    - Test retry exhaustion shows final error toast
    - Test isTransientError includes new error types
    - Limit to 2-8 highly focused tests maximum
  - [x] 2.2 Add new error types to `src/types/agent.ts`
    - Add `EMPTY_RESPONSE` constant or type
    - Add `INTERRUPTED_GENERATION` constant or type
    - Export new error types
  - [x] 2.3 Enhance `accumulateResponse` method in `src/agents/ContentGeneratorAgent.ts`
    - After accumulation, validate response is not empty
    - Check: `if (!content || content.trim().length === 0)`
    - Throw new error with EMPTY_RESPONSE indicator
    - Check if response suspiciously short: `if (content.trim().length < 10)`
    - Throw new error with INTERRUPTED_GENERATION indicator
    - Preserve existing streaming logic
  - [x] 2.4 Update `isTransientError` method
    - Add check for EMPTY_RESPONSE error messages
    - Add check for INTERRUPTED_GENERATION error messages
    - Return true for these new error types (make them retryable)
    - Preserve existing transient error checks
  - [x] 2.5 Update `transformError` method
    - Map EMPTY_RESPONSE → "Unable to generate content. Please try again"
    - Map INTERRUPTED_GENERATION → "Generation failed. Please try again"
    - Keep existing error transformations
  - [x] 2.6 Integrate toast notifications in `generateContent` method
    - Import `useToast` is not possible in non-component, so inject toast function via parameter OR use event emitter
    - Alternative: Return additional metadata in GenerationResult for UI to show toasts
    - Add `isRetrying?: boolean` flag to GenerationResult
    - Add `retryMessage?: string` field to GenerationResult
    - On retry, set `isRetrying: true` and `retryMessage: "Trying again..."` or "Content generation interrupted"
  - [x] 2.7 Ensure enhanced error detection tests pass
    - Run ONLY the 2-8 tests written in 2.1
    - Verify empty response and interrupted generation detection works
    - Do NOT run the entire test suite at this stage

**Acceptance Criteria:**
- ✅ The 2-8 tests written in 2.1 pass
- ✅ Empty responses detected and trigger retry
- ✅ Interrupted generation detected and triggers retry
- ✅ Both new error types treated as transient
- ✅ Proper error messages returned
- ✅ Retry logic respects MAX_RETRIES limit

### Hooks & State Management Layer

#### Task Group 3: Health Checks, Offline Detection, Circuit Breaker Timer
**Dependencies:** Task Group 1

- [ ] 3.0 Complete health monitoring and state management hooks
  - [ ] 3.1 Write 2-8 focused tests for hooks
    - Test useOllamaHealth periodic polling (30s interval)
    - Test useOllamaHealth status change detection and toast on restoration
    - Test useNetworkStatus offline/online event listeners
    - Test useNetworkStatus initial state from navigator.onLine
    - Test useCircuitBreaker countdown timer calculation
    - Test useCircuitBreaker updates every second
    - Limit to 2-8 highly focused tests maximum
  - [ ] 3.2 Enhance `src/hooks/useOllamaHealth.ts`
    - Add `setInterval` for 30-second polling
    - Store previous status in `useRef<boolean | null>(null)`
    - Compare previous vs current status on each check
    - Call `showToast("Connection to AI service restored", "success")` when transitioning disconnected → connected
    - Clean up interval in useEffect cleanup function
    - Accept optional `onStatusChange` callback prop
  - [ ] 3.3 Create `src/hooks/useNetworkStatus.ts`
    - Initialize state with `navigator.onLine`
    - Add event listener for `window.addEventListener('offline', handler)`
    - Add event listener for `window.addEventListener('online', handler)`
    - Update state when events fire
    - Call `showToast("You appear to be offline", "error")` on offline
    - Call `showToast("You're back online", "success")` on online
    - Clean up event listeners in useEffect cleanup
    - Return `{ isOnline: boolean }`
  - [ ] 3.4 Create `src/hooks/useCircuitBreaker.ts`
    - Accept `circuitOpenUntil: number` as parameter
    - Calculate remaining seconds: `Math.max(0, Math.ceil((circuitOpenUntil - Date.now()) / 1000))`
    - Update countdown every 1 second with `setInterval`
    - Clear interval when countdown reaches 0 or component unmounts
    - Return `{ remainingSeconds: number, isCircuitOpen: boolean }`
  - [ ] 3.5 Add getter method to `src/agents/ContentGeneratorAgent.ts`
    - Add public method: `getCircuitOpenUntil(): number`
    - Return `this.circuitOpenUntil`
    - Keep circuit breaker state management private
  - [ ] 3.6 Ensure hooks tests pass
    - Run ONLY the 2-8 tests written in 3.1
    - Verify periodic polling, status detection, and countdown work
    - Do NOT run the entire test suite at this stage

**Acceptance Criteria:**
- ✅ The 2-8 tests written in 3.1 pass
- ✅ Health check polls every 30 seconds
- ✅ Status restoration shows success toast
- ✅ Offline detection works with browser events
- ✅ Circuit breaker countdown updates every second
- ✅ All intervals and listeners cleaned up properly

### Frontend Integration Layer

#### Task Group 4: UI Integration & Button Debouncing
**Dependencies:** Task Groups 1, 2, 3

- [x] 4.0 Complete UI integration and mood button protection
  - [x] 4.1 Write 2-8 focused tests for UI integration
    - Test MoodSelector disabled prop disables all buttons
    - Test disabled buttons have proper styling (opacity-50, cursor-not-allowed)
    - Test App.tsx disables mood buttons while loading
    - Test App.tsx shows offline message when useNetworkStatus detects offline
    - Test App.tsx displays circuit breaker countdown when circuit open
    - Test toast notifications appear for error scenarios
    - Limit to 2-8 highly focused tests maximum
  - [x] 4.2 Update `src/components/MoodSelector.tsx`
    - Add `disabled: boolean` prop to MoodSelectorProps interface
    - Add `disabled` attribute to all mood buttons
    - Apply disabled styling: `disabled:opacity-50 disabled:cursor-not-allowed`
    - Prevent onClick when disabled (handled by button disabled attribute)
    - Preserve active state styling even when disabled
    - Update tests to verify disabled behavior
  - [x] 4.3 Update `src/App.tsx` for offline detection
    - Import and use `useNetworkStatus` hook
    - Disable mood buttons when `!isOnline`
    - Display prominent offline message when offline
    - Give offline state higher priority than Ollama errors
  - [x] 4.4 Update `src/App.tsx` for circuit breaker countdown
    - Import and use `useCircuitBreaker` hook
    - Get `circuitOpenUntil` from ContentGeneratorAgent.getInstance().getCircuitOpenUntil()
    - Display countdown timer when circuit is open
    - Show message: "Service temporarily unavailable. Try again in {remainingSeconds}s"
    - Update countdown every second
  - [x] 4.5 Update `src/App.tsx` to handle retry messages
    - Check GenerationResult for `isRetrying` flag
    - Show info toast with `retryMessage` when retrying
    - Handle error toasts for final failures
  - [x] 4.6 Update `src/App.tsx` to pass loading state
    - Pass `disabled={isLoading || !isOnline || isCircuitOpen}` prop to MoodSelector
    - Ensure buttons re-enable after generation completes (success or error)
    - Ensure buttons re-enable when circuit breaker allows retry
  - [x] 4.7 Ensure UI integration tests pass
    - Run ONLY the 2-8 tests written in 4.1
    - Verify mood buttons disable during loading and offline
    - Verify toast notifications appear correctly
    - Do NOT run the entire test suite at this stage

**Acceptance Criteria:**
- ✅ The 7 tests written in 4.1 pass
- ✅ Mood buttons disabled while loading
- ✅ Mood buttons disabled when offline
- ✅ Mood buttons disabled when circuit breaker open
- ✅ Disabled styling applied correctly
- ✅ Offline message displayed prominently
- ✅ Circuit breaker countdown shown and updates
- ✅ Toast notifications appear for all error scenarios
- ✅ Buttons re-enable after generation completes

### Testing & Verification

#### Task Group 5: Test Review & Gap Analysis
**Dependencies:** Task Groups 1-4

- [x] 5.0 Review existing tests and fill critical gaps only
  - [x] 5.1 Review tests from Task Groups 1-4
    - Review the 2-8 tests written for toast system (Task 1.1)
    - Review the 2-8 tests written for error detection (Task 2.1)
    - Review the 2-8 tests written for hooks (Task 3.1)
    - Review the 2-8 tests written for UI integration (Task 4.1)
    - Total existing tests: 37 tests
  - [x] 5.2 Analyze test coverage gaps for THIS feature only
    - Identify critical error handling workflows lacking coverage
    - Focus ONLY on gaps related to error handling requirements
    - Prioritize end-to-end error scenarios (empty response → retry → success)
    - Identify integration gaps (toast + agent + UI)
    - Do NOT assess entire application test coverage
  - [x] 5.3 Write up to 10 additional strategic tests maximum
    - Add maximum of 10 new tests to fill identified critical gaps
    - Focus on end-to-end error workflows
    - Test integration between toast system and agent errors
    - Test complete offline detection flow (offline → toast → buttons disabled → online → buttons enabled)
    - Test complete circuit breaker flow (3 failures → circuit open → countdown → half-open → retry)
    - Test health check restoration flow (disconnected → polling → connected → toast)
    - Do NOT write comprehensive coverage for all edge cases
    - Skip performance tests, stress tests, and minor edge cases
  - [x] 5.4 Run feature-specific tests only
    - Run ONLY tests related to error handling feature (tests from 1.1, 2.1, 3.1, 4.1, and 5.3)
    - Expected total: approximately 18-42 tests maximum
    - Do NOT run the entire application test suite
    - Verify all critical error handling workflows pass
  - [ ] 5.5 Browser verification of error handling
    - Manually test toast notifications appear correctly
    - Verify offline detection by disabling network
    - Verify circuit breaker by forcing 3 failures
    - Test empty response handling (mock Ollama to return empty)
    - Verify health check restoration message
    - Verify mood button debouncing during loading
    - Take screenshots if needed for verification report

**Acceptance Criteria:**
- ✅ All feature-specific tests pass (47 tests total: 37 existing + 10 new)
- ✅ Critical error handling workflows covered
- ✅ Exactly 10 additional tests added to fill gaps
- ✅ Testing focused exclusively on error handling requirements
- ⏳ Manual browser verification pending

## Execution Order

Recommended implementation sequence:
1. **Toast Notification System** (Task Group 1) - Foundation for all error feedback
2. **Enhanced Error Detection** (Task Group 2) - Core agent error handling
3. **Health & State Hooks** (Task Group 3) - Monitoring and circuit breaker UI
4. **UI Integration** (Task Group 4) - Connect all pieces in App.tsx
5. **Test Review & Verification** (Task Group 5) - Ensure comprehensive coverage

## Technical Notes

**Toast Implementation:**
- Use React Context API for global toast access
- Tailwind CSS for styling (no custom CSS)
- CSS transforms for animations (hardware accelerated)
- ARIA attributes for accessibility

**Agent Modifications:**
- Keep circuit breaker logic private, expose only read-only access
- Return metadata in GenerationResult instead of side effects
- Maintain backwards compatibility with existing tests

**Hook Patterns:**
- All hooks must clean up intervals/listeners
- Use useRef for tracking previous values
- Use optional callbacks for flexibility

**App.tsx Integration:**
- Multiple state sources: useNetworkStatus, useOllamaHealth, useCircuitBreaker
- Priority: offline > circuit open > Ollama disconnected > loading
- Pass combined disabled state to MoodSelector

**Testing Strategy:**
- Mock window.addEventListener for offline detection tests
- Mock setInterval/clearInterval for polling and countdown tests
- Use vi.useFakeTimers() for time-dependent tests
- Test toast deduplication with identical messages
- Test auto-dismiss with fake timers
