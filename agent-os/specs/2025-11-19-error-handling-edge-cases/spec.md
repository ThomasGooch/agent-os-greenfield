# Specification: Error Handling & Edge Cases

## Goal
Enhance the Daily Inspirational Assistant with comprehensive error handling that provides user-friendly feedback for all failure scenarios including empty responses, interrupted generation, Ollama unavailability, network issues, and offline states.

## User Stories
- As a user, I want to see clear messages when errors occur so that I understand what went wrong and what's happening
- As a user, I want the system to automatically retry when appropriate so that temporary issues don't require manual intervention
- As a user, I want to know when Ollama reconnects so that I'm aware the service is working again
- As a user, I want to know when I'm offline vs when Ollama is down so that I can troubleshoot appropriately
- As a user, I want to see how long until I can retry after circuit breaker opens so that I know when to try again
- As a user, I want protection from accidentally clicking mood buttons multiple times so that I don't trigger duplicate requests

## Specific Requirements

### Toast/Notification Component

**Create reusable Toast component**
- Build `src/components/Toast.tsx` with TypeScript and Tailwind CSS
- Support message types: `error`, `success`, `info`, `warning`
- Position in top-right corner with fixed positioning
- Auto-dismiss after 5 seconds (configurable)
- Smooth slide-in/slide-out animations
- Stack multiple toasts vertically with spacing
- Include close button for manual dismissal
- Provide `ToastProvider` context and `useToast` hook for easy usage

**Toast manager functionality**
- Queue system for multiple simultaneous toasts
- Prevent duplicate messages (dedupe by message content)
- Expose `showToast(message: string, type: ToastType)` function
- Maximum 3 visible toasts at once (older ones dismissed)
- Each toast has unique ID for tracking

**Integration points**
- Replace console.error calls with toast notifications in ContentGeneratorAgent
- Show toasts for all error scenarios
- Show success toast for Ollama connection restoration

### Empty Response Detection

**Validation logic**
- Add validation in ContentGeneratorAgent after `accumulateResponse()`
- Check for null, undefined, empty string, or only whitespace
- Consider response invalid if `content.trim().length === 0`

**User feedback**
- Display toast: "Trying again..." (info type)
- Automatically retry using existing retry logic
- Add new error type: `EMPTY_RESPONSE` to handle separately from other errors

**Retry behavior**
- Treat empty responses as transient errors (include in `isTransientError()`)
- Use same exponential backoff as CONNECTION_FAILED (1s, 2s)
- Respect MAX_RETRIES limit (2 retries = 3 total attempts)
- If all retries return empty, show error toast: "Unable to generate content. Please try again"

### Interrupted Generation Detection

**Detection mechanism**
- Monitor streaming completion in `accumulateResponse()`
- Check for Ollama's "done" flag in stream response (if available)
- Detect if response is suspiciously short (< 10 characters) as heuristic
- Track if stream ends prematurely (exception during iteration)

**User feedback**
- Display toast: "Content generation interrupted" (error type)
- Automatically retry the request
- Add new error type: `INTERRUPTED_GENERATION`

**Retry behavior**
- Treat interrupted generation as transient error
- Use same retry logic with exponential backoff
- After max retries, show: "Generation failed. Please try again"

### Periodic Health Checks

**Health check enhancement**
- Modify `useOllamaHealth` hook to add 30-second interval polling
- Use `setInterval` to call health check every 30000ms
- Clean up interval with `clearInterval` in useEffect cleanup
- Track previous health status to detect status changes

**Status change detection**
- Store previous status in ref: `const prevStatusRef = useRef<boolean | null>(null)`
- Compare current status with previous on each check
- Only trigger restoration message if previous was `false` and current is `true`
- Prevents showing message on initial load when status is already healthy

**Success notification**
- Show toast: "Connection to AI service restored" (success type)
- Only show when transitioning from unhealthy → healthy
- Auto-dismiss after 5 seconds

**Implementation location**
- Update `src/hooks/useOllamaHealth.ts`
- Add interval polling logic inside useEffect
- Return cleanup function to clear interval

### Offline Detection

**Browser event listeners**
- Listen for `window.addEventListener('offline', handler)`
- Listen for `window.addEventListener('online', handler)`
- Create new React hook: `useNetworkStatus` in `src/hooks/useNetworkStatus.ts`
- Return `isOnline: boolean` state

**State management**
- Track offline state separately from Ollama health status
- Use `navigator.onLine` for initial state
- Update state when online/offline events fire
- Clean up event listeners on unmount

**User feedback**
- Show toast: "You appear to be offline" (error type) when offline event fires
- Show toast: "You're back online" (success type) when online event fires
- Give offline state higher priority than Ollama errors in UI

**Integration with App.tsx**
- Import and use `useNetworkStatus` hook
- Display offline message prominently when offline
- Disable mood buttons when offline
- Show network status in UI (optional visual indicator)

### Circuit Breaker Countdown Timer

**Timer calculation**
- Access `circuitOpenUntil` timestamp from ContentGeneratorAgent (needs exposure)
- Calculate remaining time: `Math.max(0, Math.ceil((circuitOpenUntil - Date.now()) / 1000))`
- Update every second with `setInterval`

**Display format**
- Show in error toast: "Service temporarily unavailable. Try again in 25s"
- Update countdown every second: "Try again in 24s", "Try again in 23s", etc.
- When countdown reaches 0, clear timer and allow retry

**Implementation approach**
- Create `useCircuitBreaker` hook to manage timer state
- Accept `circuitOpenUntil` timestamp as prop
- Return `remainingSeconds: number` and `isCircuitOpen: boolean`
- Clear interval when circuit closes or component unmounts

**ContentGeneratorAgent modification**
- Expose read-only getter method: `getCircuitOpenUntil(): number`
- Allow components to access circuit state for UI purposes
- Keep circuit breaker logic internal, only expose timestamp

### Mood Button Debouncing

**Button state management**
- Disable mood buttons while `isLoading` is true
- Add `disabled` prop to MoodSelector component buttons
- Apply disabled styling with Tailwind CSS classes

**Visual feedback**
- Use `opacity-50` and `cursor-not-allowed` when disabled
- Show loading indicator in InspirationCard during generation
- Keep selected mood highlighted even when disabled

**Implementation**
- Update `src/components/MoodSelector.tsx` to accept `disabled` prop
- Pass loading state from App.tsx to MoodSelector
- Prevent onClick events when disabled (button disabled attribute handles this)

**Edge case handling**
- Re-enable buttons after generation completes (success or error)
- Re-enable buttons if circuit breaker opens (allow retry after timeout)
- Ensure buttons don't get stuck in disabled state

## Existing Code to Leverage

**ContentGeneratorAgent**
- Use existing circuit breaker state machine (`circuitState`, `consecutiveFailures`, `circuitOpenUntil`)
- Extend existing retry logic with exponential backoff
- Add empty response and interrupted generation to `isTransientError()` check
- Leverage existing error transformation in `transformError()`
- Build on existing MAX_RETRIES and backoff constants

**useOllamaHealth Hook**
- Extend with interval polling for periodic checks
- Use existing health check endpoint call
- Add status change detection logic
- Maintain existing return type structure

**InspirationCard Component**
- Use existing loading state for button disabling
- Display error messages via toast instead of inline (keeping card clean)
- Leverage existing error state handling

**Type System**
- Add new error types to existing error handling: `EMPTY_RESPONSE`, `INTERRUPTED_GENERATION`
- Extend `GenerationResult` if needed for additional metadata
- Create `ToastType` type: `'error' | 'success' | 'info' | 'warning'`

## Out of Scope

**Explicitly excluded from this milestone:**
- Detailed error logging to console (keep existing minimal logging)
- Error analytics or reporting to external services
- Manual retry button UI (auto-retry only)
- Error history or debugging panel
- Custom error pages or routes
- Configurable retry intervals (use hard-coded values)
- Advanced rate limiting beyond simple button debounce
- Queue system for multiple simultaneous requests
- Persistent error state across page reloads
- Detailed network diagnostics or troubleshooting tools
- Custom error codes for analytics
- Error severity levels beyond toast types
- Retry progress indicators (just show "Trying again...")
- Detailed streaming progress feedback

## Technical Notes

**Testing Strategy**
- Write 2-8 focused tests per task group (TDD approach)
- Test toast component: rendering, auto-dismiss, stacking, deduplication
- Test empty response: detection, retry, final failure message
- Test interrupted generation: detection, retry behavior
- Test periodic health checks: interval firing, status change detection
- Test offline detection: event listeners, state updates
- Test circuit breaker timer: countdown calculation, updates
- Test button debouncing: disabled state during loading

**Performance Considerations**
- Use `clearInterval` to prevent memory leaks from health check polling
- Remove event listeners in cleanup functions
- Optimize toast animations with CSS transforms
- Debounce rapid state changes to prevent excessive re-renders

**Accessibility**
- Toast should be announced to screen readers (ARIA live region)
- Disabled buttons should have `aria-disabled="true"`
- Error messages should be clear and actionable
- Countdown timer should update accessibly

**Browser Compatibility**
- `navigator.onLine` supported in all modern browsers
- Window offline/online events widely supported
- setInterval/clearInterval standard APIs
