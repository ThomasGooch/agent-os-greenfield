# Performance Optimization Specification

**Date:** November 19, 2025  
**Status:** Ready for Implementation  
**Milestone:** 9 of Roadmap  
**Size:** Medium (8-12 hours)

---

## Goal

Optimize application performance to consistently achieve **P50 (median) response time <2 seconds** from mood button click to content display, while maintaining all existing functionality, error handling, and content quality.

---

## User Stories

**As a user**, I want:
- Faster content generation so I don't wait long for inspiration
- Immediate feedback when I click a mood button
- Consistent performance regardless of which mood I select
- The app to feel snappy and responsive

**Success Criteria:**
- ✅ P50 response time <2 seconds (mood click → content displayed)
- ✅ Model stays loaded in memory (no cold start delays)
- ✅ Session caching prevents repeated generation for same mood
- ✅ Faster recovery from transient errors (15s vs 30s)
- ✅ All 134 tests continue passing
- ✅ No degradation in content quality

---

## Current State Analysis

### Performance Bottlenecks Identified

1. **Model Cold Start** - First request after Ollama starts can be slow (5-10s)
2. **No Caching** - Every mood click generates new content, even if clicked multiple times
3. **Slow Error Recovery** - Circuit breaker half-open delay is 30s (too conservative)
4. **No Performance Visibility** - Cannot measure actual response times

### Current Implementation

**OllamaClient (`src/services/OllamaClient.ts`):**
```typescript
- Model: llama3.1:8b (hardcoded)
- Endpoint: http://localhost:11434
- Timeout: 20 seconds
- Streaming: Yes (async generator)
```

**ContentGeneratorAgent (`src/agents/ContentGeneratorAgent.ts`):**
```typescript
- Max retries: 2
- Circuit breaker: 3 failures → open, 30s → half-open
- Error handling: Transient error detection, retry with backoff
```

**Prompt Templates (MoodInterpreterAgent):**
- All prompts request "exactly 3 sentences"
- Currently optimized for conciseness
- No changes needed

---

## Optimization Strategy

### 1. Model Warmup on Startup

**Problem:** First Ollama request can take 5-10s due to model loading into memory.

**Solution:** Ping Ollama with a lightweight warmup request on app startup (after successful health check).

**Implementation:**
- Add `warmupModel()` method to `OllamaClient`
- Call warmup after first successful health check in `useOllamaHealth`
- Use minimal prompt (e.g., "Hi") to load model quickly
- Don't wait for/display warmup response
- Handle warmup failures gracefully (log, don't block app)

**Expected Impact:** Eliminates 5-10s delay on first user request → Moves to <2s consistently

---

### 2. Session-Based Response Caching

**Problem:** Users might click same mood multiple times, generating duplicate content unnecessarily.

**Solution:** Cache generated content per mood during active session, clear on page refresh.

**Implementation:**
- Add in-memory cache to `ContentGeneratorAgent` (Map<Mood, string>)
- Check cache before calling Ollama API
- Return cached response immediately if available
- Clear cache only on page refresh (no TTL)
- Don't cache errors or empty responses
- Cache only successful, complete responses

**Expected Impact:** 0ms response time for repeated mood clicks (instant)

**User Experience:**
- First click: Generate new content (~1-2s)
- Subsequent clicks same mood: Instant cached content
- Clicking different mood: Generate new content
- Refresh page: All caches cleared, fresh content

---

### 3. Faster Circuit Breaker Recovery

**Problem:** 30-second half-open delay means users wait too long after transient errors.

**Solution:** Reduce circuit breaker half-open delay from 30s to 15s.

**Implementation:**
- Change `CIRCUIT_HALF_OPEN_DELAY_MS` constant in `ContentGeneratorAgent`
- Update from `30_000` to `15_000`
- Keep all other circuit breaker logic unchanged
- Maintain 3-failure threshold (already reasonable)

**Expected Impact:** Faster recovery from transient issues, better user experience during error conditions

**Rationale:**
- Most transient errors (network blips, temporary Ollama overload) resolve in <15s
- 30s feels too long for user waiting
- Still provides protection against persistent failures

---

### 4. Performance Measurement Infrastructure

**Problem:** No visibility into actual response times or performance trends.

**Solution:** Add lightweight performance tracking using Performance API.

**Implementation:**
- Add timing marks in `ContentGeneratorAgent.generateContent()`:
  - Mark: `generation-start-${mood}`
  - Mark: `generation-end-${mood}`
  - Measure: `generation-duration-${mood}`
- Log timing to console in development mode
- Track total generation time (API call → complete response)
- Don't track individual token streaming times (too granular)

**Metrics to Track:**
- **Total Generation Time:** API call start → complete response received
- **Per Mood:** Track each mood separately to identify patterns
- **Session Statistics:** Min, max, average across session

**Expected Impact:** 
- Visibility into performance in dev mode
- Ability to validate <2s target
- Foundation for future performance budgets

**Console Output Example:**
```
[Performance] Happy mood: 1847ms
[Performance] Calm mood: 1654ms
[Performance] Session stats: min=1654ms, max=1847ms, avg=1751ms
```

---

## Technical Design

### File Changes Required

#### 1. `src/services/OllamaClient.ts`

**Add warmup method:**
```typescript
/**
 * Warm up the model by sending a minimal request
 * This keeps the model loaded in memory for faster subsequent requests
 */
public async warmupModel(): Promise<void> {
  try {
    console.log('[OllamaClient] Warming up model...');
    const generator = this.generateCompletion('Hi', { stream: true });
    // Consume the generator to complete the request
    for await (const _chunk of generator) {
      // Discard warmup output
    }
    console.log('[OllamaClient] Model warmup complete');
  } catch (error) {
    console.warn('[OllamaClient] Model warmup failed (non-critical):', error);
    // Don't throw - warmup failure shouldn't block app
  }
}
```

**No changes to existing methods** - Keep generateCompletion, healthCheck as-is.

---

#### 2. `src/agents/ContentGeneratorAgent.ts`

**Add cache storage:**
```typescript
private responseCache: Map<Mood, string> = new Map();
```

**Update generateContent method:**
```typescript
public async generateContent(mood: Mood): Promise<string> {
  // Check cache first
  const cached = this.responseCache.get(mood);
  if (cached) {
    console.log(`[ContentGeneratorAgent] Returning cached content for mood: ${mood}`);
    return cached;
  }

  // Performance tracking
  performance.mark(`generation-start-${mood}`);

  // Existing circuit breaker check...
  // Existing generation logic...

  // After successful generation:
  performance.mark(`generation-end-${mood}`);
  performance.measure(
    `generation-duration-${mood}`,
    `generation-start-${mood}`,
    `generation-end-${mood}`
  );
  
  // Log timing in development
  if (process.env.NODE_ENV === 'development') {
    const measure = performance.getEntriesByName(`generation-duration-${mood}`)[0];
    console.log(`[Performance] ${mood} mood: ${Math.round(measure.duration)}ms`);
  }

  // Cache successful response
  this.responseCache.set(mood, content);

  return content;
}
```

**Update circuit breaker constant:**
```typescript
private static readonly CIRCUIT_HALF_OPEN_DELAY_MS = 15_000; // Reduced from 30_000
```

**Add cache clear method (for testing):**
```typescript
public clearCache(): void {
  this.responseCache.clear();
}
```

---

#### 3. `src/hooks/useOllamaHealth.ts`

**Add warmup trigger:**
```typescript
useEffect(() => {
  // Existing health check logic...
  
  // After first successful health check:
  if (isHealthy && !hasWarmedUp.current) {
    hasWarmedUp.current = true;
    ollamaClient.warmupModel().catch(err => {
      console.warn('[useOllamaHealth] Warmup failed:', err);
    });
  }
}, [isHealthy]);
```

**Add ref to track warmup:**
```typescript
const hasWarmedUp = useRef(false);
```

---

## Visual Design

No UI changes required. All optimizations are backend/performance focused.

**Existing UI behavior maintained:**
- Loading spinner during generation
- Error states and toasts
- Content fade-in animation
- Mood button hover effects

---

## Testing Strategy

### Unit Tests

**New Tests to Add (8 focused tests):**

1. **OllamaClient warmup test** (1 test)
   - ✅ `warmupModel()` sends request and completes

2. **ContentGeneratorAgent cache tests** (4 tests)
   - ✅ First call generates new content
   - ✅ Second call with same mood returns cached content
   - ✅ Different moods generate separate content
   - ✅ `clearCache()` removes all cached content

3. **Circuit breaker timing test** (1 test)
   - ✅ Half-open delay is 15 seconds (not 30)

4. **Performance tracking tests** (2 tests)
   - ✅ Performance marks are created for generation
   - ✅ Performance measures are created after completion

**Existing Tests:**
- All 134 existing tests must continue passing
- No changes to existing test assertions
- Mocks may need minor updates for cache behavior

---

### Manual Testing Checklist

**Performance Validation:**
- [ ] Measure first request after app start (<2s target)
- [ ] Measure second request (should be <2s, model already loaded)
- [ ] Measure 3rd-5th requests across different moods (consistent <2s)
- [ ] Check console for performance logs in dev mode

**Caching Validation:**
- [ ] Click "Happy" → generates content (~1-2s)
- [ ] Click "Happy" again → instant (cached)
- [ ] Click "Calm" → generates new content (~1-2s)
- [ ] Click "Calm" again → instant (cached)
- [ ] Refresh page → all caches cleared
- [ ] Click "Happy" → generates new content (not cached after refresh)

**Circuit Breaker Validation:**
- [ ] Stop Ollama service
- [ ] Trigger 3 failures to open circuit
- [ ] Wait 15 seconds
- [ ] Verify circuit enters half-open state (next request allowed)
- [ ] Start Ollama and verify recovery

**Warmup Validation:**
- [ ] Open DevTools console
- [ ] Refresh page
- [ ] Verify "[OllamaClient] Warming up model..." message
- [ ] Verify "[OllamaClient] Model warmup complete" message
- [ ] First mood click should be fast (model already loaded)

---

## Performance Targets

### Primary Goal
- **P50 response time:** <2 seconds (mood click → content displayed)

### Secondary Goals
- **Cached response time:** <100ms (effectively instant)
- **First request after warmup:** <2 seconds (no cold start penalty)
- **Error recovery:** 15 seconds (reduced from 30s)

### Measurement Approach
- Manual timing with browser DevTools Network tab
- Performance API logs in console (development mode)
- 5 samples per mood for statistical confidence
- Calculate P50 (median) across all measurements

---

## Existing Code to Leverage

### Strong Patterns to Maintain

1. **Singleton Agents** - Keep current architecture, just add cache
2. **Circuit Breaker** - Keep all logic, just adjust timing constant
3. **Error Handling** - Keep retry logic, transient error detection
4. **Type Safety** - Maintain strict TypeScript throughout

### Code to Reference

- `src/agents/ContentGeneratorAgent.ts` (lines 1-150) - Circuit breaker, retry logic
- `src/services/OllamaClient.ts` (lines 1-100) - API client patterns
- `src/hooks/useOllamaHealth.ts` (lines 1-80) - Health check lifecycle

---

## Out of Scope

**Explicitly NOT included in this milestone:**

❌ Switching to smaller/faster Ollama models (llama3.1:3b, etc.)  
❌ Prompt optimization or reduction (prompts already concise)  
❌ Streaming display (typewriter effect) - keep current behavior  
❌ React component optimization (rendering already fast)  
❌ Bundle size reduction - already acceptable  
❌ Service worker caching  
❌ Automated performance testing in CI  
❌ Performance budgets or alerts  
❌ Database or persistent caching  
❌ Request queuing or debouncing  

---

## Dependencies

**Required Services:**
- Ollama running locally (localhost:11434)
- `llama3.1:8b` model downloaded

**No New Dependencies:**
- Use native Performance API (available in all modern browsers)
- Use native Map for caching (no external cache library)
- No new npm packages required

---

## Implementation Phases

### Phase 1: Model Warmup (2-3 hours)
- Add `warmupModel()` to OllamaClient
- Integrate warmup into useOllamaHealth hook
- Add unit test for warmup
- Manual testing with console logs

### Phase 2: Response Caching (3-4 hours)
- Add cache Map to ContentGeneratorAgent
- Implement cache lookup before generation
- Add `clearCache()` utility method
- Add 4 unit tests for cache behavior
- Manual testing with multiple mood clicks

### Phase 3: Circuit Breaker Tuning (1 hour)
- Update CIRCUIT_HALF_OPEN_DELAY_MS constant
- Add test to verify 15s timing
- Manual testing with simulated failures

### Phase 4: Performance Tracking (2-3 hours)
- Add Performance API marks/measures
- Add console logging for dev mode
- Add 2 unit tests for performance tracking
- Manual testing to verify logs

### Phase 5: Validation & Documentation (1-2 hours)
- Run full test suite (134 tests)
- Manual performance measurement (5 samples per mood)
- Calculate P50 and verify <2s target
- Update documentation

**Total Estimated Time:** 9-13 hours (Medium milestone)

---

## Success Metrics

### Must Achieve
- ✅ P50 response time <2 seconds
- ✅ All 134 tests passing
- ✅ Warmup eliminates cold start delays
- ✅ Cache provides instant responses for repeated moods
- ✅ Circuit breaker recovers in 15s (not 30s)

### Nice to Have
- Performance logs show consistent <2s times
- Subjective speed improvement noticeable to user
- No console errors or warnings

---

## Rollback Plan

If performance degrades or issues arise:

1. **Remove cache** - Comment out cache lookup, keep generation flow
2. **Revert circuit breaker timing** - Change back to 30s if 15s causes instability
3. **Disable warmup** - Comment out warmup call if it causes issues
4. **Remove performance tracking** - Delete marks/measures if overhead detected

All changes are additive and can be reverted independently without breaking existing functionality.

---

## Documentation Updates

After implementation:

- [ ] Update README.md with performance characteristics
- [ ] Document cache behavior for developers
- [ ] Add performance testing section to README
- [ ] Update CHANGELOG.md with optimization details

---

## Risk Assessment

**Low Risk:**
- ✅ All changes are additive (no breaking changes)
- ✅ Cache is simple Map (no complex cache invalidation)
- ✅ Warmup is fire-and-forget (failures don't block app)
- ✅ Performance API is lightweight (negligible overhead)

**Medium Risk:**
- ⚠️ Circuit breaker timing reduction (15s) - May need tuning based on real-world behavior
- ⚠️ Cache memory usage - Unbounded Map could grow, but limited by 4 moods × small responses

**Mitigation:**
- Monitor circuit breaker behavior during manual testing
- Consider cache size limits if memory becomes concern (future iteration)
- Make circuit breaker timing configurable if needed (future iteration)

---

## Notes

- Model (llama3.1:8b) unchanged - good balance of speed and quality
- Prompts unchanged - already optimized for conciseness
- Streaming behavior unchanged - keeps current UX
- Error handling unchanged - maintains robustness
- All animations and UI polish from previous milestone preserved
