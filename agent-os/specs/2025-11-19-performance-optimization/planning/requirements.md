# Performance Optimization - Requirements Gathering

**Date:** November 19, 2025  
**Status:** In Progress - Q&A Phase

---

## Current Implementation Analysis

### Ollama Configuration
- **Model:** `llama3.1:8b` (hardcoded)
- **Endpoint:** `http://localhost:11434`
- **Timeout:** 20 seconds
- **Streaming:** Yes (async generator)

### Agent Architecture
- **ContentGeneratorAgent:** Handles retries (max 2), circuit breaker, error transformation
- **MoodInterpreterAgent:** Maps moods to prompt templates
- **Response accumulation:** Streams are fully collected before displaying

### Current Prompt Templates
From MoodInterpreterAgent:
- Happy: "Generate exactly 3 sentences of inspiring content for someone feeling happy..."
- Calm: "Generate exactly 3 sentences of peaceful content for someone feeling calm..."
- Motivated: "Generate exactly 3 sentences of motivating content..."
- Creative: "Generate exactly 3 sentences of creative inspiration..."

All prompts request exactly 3 sentences and emphasize being concise.

---

## Performance Optimization Questions

### 1. Ollama Model Selection

**Q1.1: Should we optimize model selection for speed vs quality?**
- [X] Keep `llama3.1:8b` (good balance of quality and speed)
- [ ] Switch to smaller model like `llama3.1:3b` (faster but lower quality)
- [ ] Test both and make configurable
- [ ] Investigate other models (mistral, gemma, etc.)

**Q1.2: Should we implement model preloading/warm-up?**
- [X] Yes - Ping model on app startup to keep it loaded in memory
- [ ] Yes - Keep-alive requests to prevent model unloading
- [ ] No - Let Ollama manage model lifecycle
- [ ] Add model warmup on first health check success

**Q1.3: Should we cache model responses?**
- [ ] Yes - Cache responses per mood for instant repeat access
- [ ] Yes - Cache with TTL (e.g., 5 minutes) for freshness
- [ ] No - Always generate fresh content
- [X] Cache only during same session

---

### 2. Prompt Optimization

**Q2.1: Are current prompts optimal for speed?**
- [X] Keep "exactly 3 sentences" constraint
- [ ] Reduce to "1-2 sentences" for faster generation
- [ ] Remove sentence count, just say "brief"
- [ ] Test different prompt formats for speed

**Q2.2: Should we simplify prompt language?**
- [ ] Yes - Remove verbose instructions
- [ ] Yes - Use more direct phrasing
- [X] No - Current prompts are already concise
- [ ] A/B test different prompt styles

**Q2.3: Should we use system prompts for efficiency?**
- [ ] Yes - Set a system prompt once per session
- [ ] Yes - Use system prompt to establish style guidelines
- [X] No - Keep everything in user prompt
- [ ] Investigate if Ollama supports this efficiently

---

### 3. Streaming & Display Strategy

**Q3.1: Should we display content as it streams?**
- [ ] Yes - Show tokens as they arrive (typewriter effect)
- [ ] Yes - Show first sentence immediately, then stream rest
- [X] No - Keep current full accumulation before display
- [ ] Show loading skeleton, then complete content (current)

**Q3.2: Should we optimize streaming accumulation?**
- [ ] Yes - Use more efficient string concatenation
- [ ] Yes - Process chunks in batches
- [X] No - Current implementation is fine
- [ ] Profile and optimize only if bottleneck

**Q3.3: Should we implement progressive rendering?**
- [ ] Yes - Render partial content during generation
- [ ] Yes - Show at least something within 500ms
- [X] No - Wait for complete content
- [ ] Add "still generating..." indicator if >2s

---

### 4. Network & API Optimization

**Q4.1: Should we optimize HTTP configuration?**
- [ ] Yes - Adjust timeout based on model/prompt
- [ ] Yes - Implement connection pooling/keep-alive
- [ ] Yes - Add request prioritization
- [X] No - Current fetch API is sufficient

**Q4.2: Should we implement request queuing?**
- [ ] Yes - Queue rapid requests to prevent overload
- [ ] Yes - Cancel in-flight requests on new mood selection
- [X] No - Let circuit breaker handle overload
- [ ] Add request debouncing on button clicks

**Q4.3: Should we add performance monitoring?**
- [ ] Yes - Track end-to-end timing for each request
- [ ] Yes - Log slow requests for debugging
- [ ] Yes - Display timing in dev mode
- [X] No - Keep implementation simple

---

### 5. Frontend Performance

**Q5.1: Should we optimize React rendering?**
- [ ] Yes - Add React.memo to expensive components
- [ ] Yes - Use useMemo/useCallback for handlers
- [ ] Yes - Implement virtualization if needed
- [X] No - Current rendering is fast enough

**Q5.2: Should we optimize bundle size?**
- [ ] Yes - Lazy load components
- [ ] Yes - Code split by route (if we add routes)
- [ ] Yes - Tree-shake unused Tailwind classes
- [X] No - Current bundle size is acceptable

**Q5.3: Should we implement service worker caching?**
- [ ] Yes - Cache static assets
- [ ] Yes - Cache API responses
- [X] No - Out of scope for this milestone
- [ ] Add offline support with cached content

---

### 6. Error Handling Performance

**Q6.1: Should we optimize retry strategy?**
- [X] Keep current 2 retries with exponential backoff
- [ ] Reduce to 1 retry for faster failure feedback
- [ ] Increase retries but reduce timeout
- [ ] Make retries adaptive based on error type

**Q6.2: Should we optimize circuit breaker timing?**
- [ ] Keep current 30s half-open delay
- [X] Reduce to 15s for faster recovery
- [ ] Increase to 60s to prevent thrashing
- [ ] Make timing configurable

---

### 7. Success Metrics

**Q7.1: How should we measure success?**
- [X] P50 (median) response time <2s
- [ ] P95 response time <2s (more reliable)
- [ ] P99 response time <3s
- [ ] All requests <2s (strict requirement)

**Q7.2: What should we track?**
- [ ] Time to first token
- [X] Total generation time
- [ ] End-to-end user-perceived latency
- [ ] All of the above

**Q7.3: Should we add performance budgets?**
- [ ] Yes - Fail tests if performance regresses
- [ ] Yes - Add bundle size limits
- [ ] Yes - Add render time limits
- [X] No - Manual performance testing only

---

### 8. Testing Strategy

**Q8.1: Should we add performance tests?**
- [ ] Yes - Automated timing tests in test suite
- [ ] Yes - Load testing for concurrent requests
- [ ] Yes - Benchmarks for different scenarios
- [X] No - Manual testing sufficient

**Q8.2: Should we test with different models?**
- [ ] Yes - Test llama3.1:8b vs 3b vs 1b
- [ ] Yes - Test against multiple models
- [X] No - Optimize for current model only
- [ ] Document recommendations for different models

---

## Technical Constraints

**Must maintain:**
- All existing functionality
- All 134 tests passing
- Error handling and circuit breaker
- Streaming capability
- Accessibility and animations

**Must avoid:**
- Breaking changes to agent interfaces
- Removing error recovery features
- Degrading content quality significantly
- Adding heavy dependencies

---

## Out of Scope (Explicitly Not Included)

❌ Server-side rendering (SSR)  
❌ Edge caching or CDN  
❌ Database for caching  
❌ WebSocket connections  
❌ Multiple Ollama instances/load balancing  
❌ GPU optimization (Ollama-level concern)  
❌ Model fine-tuning or training  
❌ Content pre-generation  

---

## Measurement Plan

Before optimization, we need baseline metrics:

### Manual Measurement Steps
1. Start Ollama with `llama3.1:8b` model
2. Open app in browser DevTools
3. Record timing for each mood button click:
   - Click → API call start
   - API call start → First token received
   - First token → Complete response
   - Complete response → Content displayed
4. Repeat 5 times per mood for statistical significance
5. Calculate P50, P95, P99 for each timing

### Automated Measurement
- Add console.time/timeEnd markers
- Create performance profiling utility
- Log key timing milestones

---

## Next Steps

After answering these questions, I will:
1. Establish current performance baseline with measurements
2. Identify top 3-5 highest-impact optimizations
3. Draft formal specification with specific optimization targets
4. Create implementation tasks prioritized by impact

Please answer the questions that matter most to you. I'll make sensible defaults for anything not specified based on performance best practices and the <2s response time goal.
