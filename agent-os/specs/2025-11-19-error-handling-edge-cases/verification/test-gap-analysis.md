# Test Gap Analysis - Error Handling Feature

## Current Test Coverage (37 tests)

### Task Group 1: Toast System (7 tests)
**File:** `src/components/Toast.test.tsx` (3 tests)
- ✅ Renders toast with message and correct type styling
- ✅ Calls onClose when close button clicked
- ✅ Renders with correct ARIA attributes

**File:** `src/contexts/ToastContext.test.tsx` (4 tests)
- ✅ Shows toast with correct message and type
- ✅ Auto-dismisses toast after duration
- ✅ Prevents duplicate toasts with same message
- ✅ Limits to max 3 visible toasts

### Task Group 2: Enhanced Error Detection (7 tests)
**File:** `src/agents/ContentGeneratorAgent.enhanced.test.ts` (7 tests)
- ✅ Detects empty response and marks as retryable
- ✅ Detects whitespace-only response as empty
- ✅ Detects interrupted generation (< 10 characters)
- ✅ Treats empty response as transient error and retries
- ✅ Treats interrupted generation as transient error and retries
- ✅ Returns final error after max retries on empty response
- ✅ Maps empty response to user-friendly error message

### Task Group 3: Health & State Hooks (12 tests)
**File:** `src/hooks/useOllamaHealth.enhanced.test.tsx` (3 tests)
- ✅ Polls health check at 30-second intervals
- ✅ Shows success toast when status changes from disconnected to connected
- ✅ Does not show toast when status remains unchanged

**File:** `src/hooks/useNetworkStatus.test.tsx` (4 tests)
- ✅ Initializes with navigator.onLine value
- ✅ Updates state when offline event fires
- ✅ Updates state when online event fires
- ✅ Cleans up event listeners on unmount

**File:** `src/hooks/useCircuitBreaker.test.ts` (5 tests)
- ✅ Calculates remaining seconds correctly
- ✅ Returns isCircuitOpen true when time not elapsed
- ✅ Returns isCircuitOpen false when time elapsed
- ✅ Updates countdown every second
- ✅ Cleans up interval on unmount

### Task Group 4: UI Integration (11 tests)
**File:** `src/App.integration.test.tsx` (7 tests)
- ✅ Disables mood selection when offline
- ✅ Shows circuit breaker countdown when circuit open
- ✅ Disables mood selection when circuit breaker open
- ✅ Shows error toast when content generation fails
- ✅ Enables mood selection when online, not loading, and Ollama connected
- ✅ Prioritizes offline message over other status messages
- ✅ Shows Ollama disconnected message when online but Ollama not running

**File:** `src/components/MoodSelector.disabled.test.tsx` (4 tests)
- ✅ Disables all buttons when disabled prop true
- ✅ Applies disabled styling correctly
- ✅ Prevents onClick when disabled
- ✅ Enables buttons when disabled prop false

## Gap Analysis

### Critical Gaps Identified

#### 1. End-to-End Error Recovery Flows (HIGH PRIORITY)
**Missing:** Complete flow from error → retry → success
- Empty response → auto retry → successful generation
- Interrupted generation → auto retry → successful generation
- Network failure → reconnect → retry → success

**Impact:** These are the primary user-facing workflows. Need to verify the complete happy path after error recovery.

#### 2. Toast + Agent Integration (MEDIUM PRIORITY)
**Missing:** Verify toast notifications actually appear from agent errors in real scenarios
- Circuit breaker opens → toast appears with countdown
- Empty response during retry → no duplicate toasts
- Multiple rapid errors → toast deduplication works

**Impact:** Critical for UX - users need visual feedback on what's happening.

#### 3. Multiple Simultaneous Error Conditions (MEDIUM PRIORITY)
**Missing:** Behavior when multiple error conditions occur simultaneously
- Offline + circuit breaker open
- Offline + Ollama disconnected
- Loading + circuit breaker opens mid-generation

**Impact:** Edge cases that could confuse users if not handled properly.

#### 4. Circuit Breaker State Transitions (LOW PRIORITY)
**Missing:** Detailed circuit breaker state machine testing
- Open → Half-Open → Closed on success
- Open → Half-Open → Open again on failure

**Impact:** Already tested in previous spec, but integration with new UI could have gaps.

### Gaps NOT Worth Testing (Out of Scope)
- ❌ Performance/stress testing with many rapid requests
- ❌ Memory leak testing for long-running sessions
- ❌ Browser compatibility testing across different browsers
- ❌ Accessibility testing beyond basic ARIA attributes
- ❌ Visual regression testing for toast animations
- ❌ Localization/internationalization of error messages

## Recommended Additional Tests (Max 10)

### Priority 1: End-to-End Recovery Flows (4 tests)
1. **Empty response recovery flow**
   - Generate content → empty response → auto retry → success
   - Verify: No user-facing error, content appears after retry

2. **Interrupted generation recovery flow**
   - Generate content → very short response → auto retry → success
   - Verify: No user-facing error, content appears after retry

3. **Network recovery flow**
   - Start generation → go offline → fail → come online → retry → success
   - Verify: Offline toast → online toast → successful generation

4. **Circuit breaker recovery flow**
   - 3 failures → circuit open → countdown → countdown reaches 0 → retry → success
   - Verify: Circuit breaker message → countdown updates → buttons re-enable → success

### Priority 2: Toast Integration (3 tests)
5. **Multiple rapid errors show deduplicated toasts**
   - Trigger same error 3 times rapidly
   - Verify: Only 1 toast appears (deduplication works)

6. **Different error types show different toasts**
   - Trigger empty response, then network error, then timeout
   - Verify: 3 different toasts appear with correct messages

7. **Toast auto-dismiss during error recovery**
   - Show error toast → wait 3 seconds → retry succeeds
   - Verify: Error toast still visible, then success (or toast dismisses naturally)

### Priority 3: Multiple Error Conditions (3 tests)
8. **Offline during circuit breaker countdown**
   - Open circuit → go offline during countdown
   - Verify: Offline message takes priority, buttons stay disabled

9. **Come online with circuit breaker still open**
   - Circuit open → go offline → come online before countdown ends
   - Verify: Circuit breaker message shows, countdown continues

10. **Generation starts when circuit breaker about to close**
    - Circuit breaker at 1 second remaining → user clicks mood
    - Verify: Button disabled, generation waits until circuit closes

## Implementation Plan

### Step 1: Create Integration Test Suite
Create `src/App.e2e.test.tsx` with the 10 additional tests above.

### Step 2: Mock Strategy
- Use fake timers for circuit breaker countdown
- Mock network events for offline/online
- Mock OllamaClient responses for empty/interrupted
- Mock agent retry logic for end-to-end flows

### Step 3: Run Feature Tests
Run all 37 existing + 10 new = 47 total tests to verify complete coverage.

### Step 4: Browser Verification
Manually test in browser:
1. Empty response handling (mock Ollama to return empty)
2. Interrupted generation (mock Ollama to return short text)
3. Offline detection (disable network in DevTools)
4. Circuit breaker countdown (force 3 failures)
5. Health check restoration (stop/start Ollama)
6. Toast notifications for all error types
7. Button disabling in all error conditions

### Step 5: Verification Report
Document browser testing results with screenshots.

## Expected Final Coverage

**Total Tests:** 47 (37 existing + 10 new)
**Distribution:**
- Toast System: 7 tests
- Enhanced Error Detection: 7 tests
- Health & State Hooks: 12 tests
- UI Integration: 11 tests
- End-to-End Flows: 10 tests

**Coverage Areas:**
- ✅ Unit tests for individual components/hooks
- ✅ Integration tests for component interactions
- ✅ End-to-end tests for complete user workflows
- ✅ Error recovery flows
- ✅ Multiple error condition handling
