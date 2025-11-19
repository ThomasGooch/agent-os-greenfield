# Spec Requirements: Error Handling & Edge Cases

## Initial Description
Error Handling & Edge Cases — Add comprehensive error handling for Ollama unavailability, timeout scenarios, and network issues with user-friendly error messages

## Requirements Discussion

### First Round Questions

**Q1:** Currently, if Ollama returns an empty/null response, it's not explicitly handled. Should we add validation to check for empty responses and display a message like "No content generated. Please try again"? Or should empty responses be treated as valid (unlikely but possible)?
**Answer:** It should display "trying again" and retry llm

**Q2:** If streaming starts successfully but stops mid-generation (e.g., Ollama crashes during generation), the current implementation accumulates whatever was received. Should we detect incomplete responses and either retry or show a specific error like "Content generation interrupted. Please try again"?
**Answer:** "Content generation interrupted" and retry llm

**Q3:** Currently errors return to ContentGeneratorAgent which logs them, but there's no visible error UI component. Should we create a toast/notification component to display errors to users? Or add error state to InspirationCard to show errors inline where content would appear?
**Answer:** Create a toast/notification component to display errors

**Q4:** The health check runs on mount but doesn't auto-retry or show recovery when Ollama becomes available. Should we add periodic health checks (every 30s?) and show a success message when connection is restored? Or keep current behavior where user must refresh/retry manually?
**Answer:** Add periodic health checks (every 30s?) and show a success message when connection is restored

**Q5:** Should we detect when the user goes offline (browser offline event) and show a different message than Ollama unavailability? For example, "You appear to be offline" vs "Cannot connect to Ollama"?
**Answer:** "You appear to be offline"

**Q6:** When circuit breaker opens, users get "Service temporarily unavailable" but don't know how long to wait. Should we show countdown/timer ("Try again in 25s") or button to force retry before 30s elapses?
**Answer:** Show countdown/timer

**Q7:** Should we prevent users from spam-clicking mood buttons? Add debouncing or show "Please wait for current generation to complete" message? Or allow queuing multiple requests?
**Answer:** Prevent users from spam-clicking mood buttons

**Q8:** I'm assuming we're NOT adding: detailed error logging to console, error analytics/reporting, retry button UI, error history/debugging panel, or custom error pages. Anything else to explicitly exclude?
**Answer:** Looks good

### Existing Code to Reference

No similar existing features identified for reference.

## Visual Assets

No visual assets provided.

## Requirements Summary

### Functional Requirements

**Empty Response Handling**
- Detect when Ollama returns empty/null response
- Display "Trying again..." message to user
- Automatically retry the LLM request
- Limit retries to prevent infinite loops

**Interrupted Generation Handling**
- Detect when streaming stops mid-generation (incomplete response)
- Display "Content generation interrupted" message
- Automatically retry the LLM request
- Track generation state to determine if response is complete

**Toast/Notification Component**
- Create reusable toast notification component for error display
- Show error messages from ContentGeneratorAgent
- Auto-dismiss after appropriate duration
- Support different message types (error, success, info)
- Position in non-intrusive location (top-right or bottom-right)

**Periodic Health Checks**
- Implement 30-second interval health checks for Ollama status
- Show success toast when connection is restored after being lost
- Update UI status indicator when connection changes
- Only show restoration message if connection was previously lost

**Offline Detection**
- Listen for browser offline/online events
- Display "You appear to be offline" message when offline
- Distinguish offline state from Ollama unavailability
- Update UI when user comes back online

**Circuit Breaker Countdown**
- Display countdown timer when circuit breaker is open
- Show remaining seconds until retry is allowed ("Try again in 25s")
- Update timer every second
- Clear timer when circuit half-opens or closes

**Mood Button Debouncing**
- Prevent spam-clicking mood buttons during generation
- Disable mood buttons while content is loading
- Show visual feedback that buttons are disabled
- Re-enable buttons after generation completes or errors

### Reusability Opportunities

- Use existing ContentGeneratorAgent circuit breaker logic
- Leverage existing useOllamaHealth hook for health status
- Extend existing loading states in InspirationCard
- Follow existing TypeScript patterns and component structure

### Scope Boundaries

**In Scope:**
- Empty response detection and automatic retry
- Interrupted generation detection and retry
- Toast/notification component creation
- Periodic health checks (30s interval)
- Success toast on connection restoration
- Browser offline/online detection
- "You appear to be offline" message
- Circuit breaker countdown timer display
- Mood button debouncing/disabling during generation

**Out of Scope:**
- Detailed error logging to console
- Error analytics or reporting to external services
- Manual retry button UI
- Error history or debugging panel
- Custom error pages
- Configurable retry intervals
- Advanced rate limiting beyond simple debounce
- Queue system for multiple requests
- Persistent error state across page reloads

### Technical Considerations

**Empty Response Detection:**
- Add validation in ContentGeneratorAgent after accumulation
- Check for null, undefined, or empty string
- Retry automatically using existing retry logic
- Add new error type for empty responses

**Interrupted Generation Detection:**
- Monitor streaming chunks for expected completion markers
- Detect if stream ends without "done" flag from Ollama
- Consider minimum expected response length
- Use timeout or completion indicators

**Toast Component:**
- Create Toast.tsx component with TypeScript
- Use Tailwind CSS for styling
- Implement toast queue/manager for multiple messages
- Add transitions for show/hide animations
- Support auto-dismiss with configurable duration

**Health Check Enhancement:**
- Modify useOllamaHealth hook to add interval polling
- Track previous status to detect status changes
- Trigger toast on restoration (disconnected → connected)
- Clean up interval on unmount

**Offline Detection:**
- Add event listeners for window.offline and window.online
- Create separate offline state from Ollama status
- Show offline message with higher priority than Ollama errors
- Remove listeners on cleanup

**Circuit Breaker Timer:**
- Calculate remaining time from circuitOpenUntil timestamp
- Update UI every second with remaining countdown
- Display in error message or dedicated UI element
- Clear interval when circuit state changes

**Button Debouncing:**
- Use loading state to disable mood buttons
- Add disabled prop to MoodSelector component
- Visual feedback (opacity, cursor) when disabled
- Prevent onClick events during loading state
