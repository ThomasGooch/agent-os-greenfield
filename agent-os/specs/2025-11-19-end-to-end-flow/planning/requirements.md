# Spec Requirements: End-to-End Flow

## Initial Description
Connect mood selection → agent processing → Ollama generation → display pipeline, implement loading indicators, and optimize for <2s response time

## Requirements Discussion

### First Round Questions

**Q1:** You mentioned the inspirational text is "too much and needs to be a single insightful message." Currently, the prompts are very simple (e.g., "Generate an inspiring message for someone feeling happy"). I'm assuming we need to modify the MoodInterpreterAgent prompts to explicitly request concise, single-sentence responses. Should the prompts specify something like "Generate a single, concise inspirational sentence (max 20 words)" for each mood?
**Answer:** Yes, the inspirational text should be 3 sentences

**Q2:** The error shows `src/App.tsx(30,20): error TS2345: Argument of type 'string | undefined' is not assignable to parameter of type 'SetStateAction<string | null>'.` This is at line 30 where `setContent(result.content)` is called. I'm assuming we should add a null check to ensure `result.content` is defined before setting it, or provide a fallback empty string. Is that the right fix?
**Answer:** This was a mis-pasting and to be ignored

**Q3:** Looking at the code, the flow appears to be: User clicks mood → `handleMoodSelect` → MoodInterpreterAgent gets prompt → ContentGeneratorAgent calls Ollama → streams response → accumulates full response → sets content → InspirationCard displays it. Is this working end-to-end right now, just with overly verbose output?
**Answer:** Looks good for flow

**Q4:** The code has `isLoading` state and loading skeleton in InspirationCard. Are these working correctly, or do they need enhancement? Should we add any progress feedback during the streaming response?
**Answer:** Yes looks good

**Q5:** The roadmap mentions "<2s response time." Are you currently meeting this target, or do we need to optimize? Should we add performance monitoring/logging to track actual response times?
**Answer:** That target is out of scope

**Q6:** The ContentGeneratorAgent has circuit breaker and retry logic. Are there specific error scenarios in the end-to-end flow that aren't being handled well? For example, what should happen if Ollama is running but returns an empty response?
**Answer:** Out of scope

**Q7:** The App component checks Ollama health status but doesn't react when status changes from disconnected to connected. Should the health check automatically retry when Ollama becomes available, or is the current behavior sufficient?
**Answer:** Current behavior is sufficient

**Q8:** I'm assuming we're NOT adding features like: message history, ability to regenerate content, saving favorites, or customizing moods. Anything else you want to explicitly exclude from this milestone?
**Answer:** No

### Existing Code to Reference

No similar existing features identified for reference.

## Visual Assets

No visual assets provided.

## Requirements Summary

### Functional Requirements
- Modify MoodInterpreterAgent prompts to request exactly 3 sentences of inspirational content
- Ensure prompts specify concise output format for each mood (Happy, Calm, Motivated, Creative)
- Maintain current end-to-end flow: mood selection → agent processing → Ollama generation → display
- Keep existing loading indicators and loading skeleton functionality
- Preserve current error handling and circuit breaker logic

### Reusability Opportunities
- Use existing MoodInterpreterAgent architecture
- Leverage existing ContentGeneratorAgent streaming and accumulation logic
- Maintain current InspirationCard display component
- Keep existing Ollama health check integration

### Scope Boundaries

**In Scope:**
- Updating prompt templates in MoodInterpreterAgent to request 3-sentence responses
- Ensuring generated content is concise and focused
- Verifying end-to-end flow works with updated prompts

**Out of Scope:**
- Performance optimization and <2s response time monitoring
- Additional error handling scenarios
- Empty response handling
- Automatic retry when Ollama status changes
- Message history
- Content regeneration
- Saving favorites
- Customizing moods
- Progress feedback during streaming

### Technical Considerations
- Changes will be isolated to MoodInterpreterAgent prompt definitions
- No changes to ContentGeneratorAgent streaming logic
- No changes to App.tsx flow or state management
- No changes to InspirationCard display component
- TypeScript error mentioned by user should be ignored (mis-pasting)
