# Performance Optimization - Task Breakdown

**Date:** November 19, 2025  
**Status:** ✅ Complete  
**Actual Time:** ~9 hours  

---

## Task Groups

- [Task Group 1: Model Warmup Implementation](#task-group-1-model-warmup-implementation) (2-3 hours)
- [Task Group 2: Response Caching System](#task-group-2-response-caching-system) (3-4 hours)
- [Task Group 3: Circuit Breaker Optimization](#task-group-3-circuit-breaker-optimization) (1 hour)
- [Task Group 4: Performance Tracking Infrastructure](#task-group-4-performance-tracking-infrastructure) (2-3 hours)
- [Task Group 5: Integration Testing & Performance Validation](#task-group-5-integration-testing--performance-validation) (1-2 hours)

---

## Task Group 1: Model Warmup Implementation ✅
**Goal:** Eliminate 5-10s cold start delay by warming up Ollama model on app startup  
**Time Estimate:** 2-3 hours  
**Dependencies:** None  

### Tasks

- [x] **1.1: Add warmupModel() method to OllamaClient**
  - **File:** `src/services/OllamaClient.ts`
  - **Details:**
    - Add public async method `warmupModel(): Promise<void>`
    - Send minimal prompt ("Hi") to Ollama API with streaming enabled
    - Consume generator completely to finish request
    - Add console.log for warmup start and completion
    - Catch and log errors with console.warn (non-critical)
    - Don't throw errors - warmup failure shouldn't block app
  - **Acceptance Criteria:**
    - Method exists and is callable
    - Sends valid request to Ollama
    - Completes without blocking
    - Handles errors gracefully
  - **Code Pattern:**
    ```typescript
    public async warmupModel(): Promise<void> {
      try {
        console.log('[OllamaClient] Warming up model...');
        const generator = this.generateCompletion('Hi', { stream: true });
        for await (const _chunk of generator) {
          // Discard warmup output
        }
        console.log('[OllamaClient] Model warmup complete');
      } catch (error) {
        console.warn('[OllamaClient] Model warmup failed (non-critical):', error);
      }
    }
    ```

- [x] **1.2: Add warmup trigger to useOllamaHealth hook**
  - **File:** `src/hooks/useOllamaHealth.ts`
  - **Details:**
    - Add `hasWarmedUp` ref to track warmup status
    - Add useEffect to trigger warmup after first successful health check
    - Only warmup once per session (check ref before calling)
    - Call `ollamaClient.warmupModel()` asynchronously
    - Catch and log warmup failures (don't block health checks)
    - No UI changes - warmup happens in background
  - **Acceptance Criteria:**
    - Warmup triggers automatically after health check succeeds
    - Warmup only runs once per session
    - Health check continues working normally
    - No errors thrown if warmup fails
  - **Code Pattern:**
    ```typescript
    const hasWarmedUp = useRef(false);
    
    useEffect(() => {
      // Existing health check logic...
      
      if (isHealthy && !hasWarmedUp.current) {
        hasWarmedUp.current = true;
        ollamaClient.warmupModel().catch(err => {
          console.warn('[useOllamaHealth] Warmup failed:', err);
        });
      }
    }, [isHealthy]);
    ```

- [x] **1.3: Add unit test for warmupModel()**
  - **File:** `src/services/OllamaClient.test.ts`
  - **Details:**
    - Test that warmupModel() sends a request
    - Test that warmup completes successfully
    - Test that warmup handles errors gracefully (no throw)
    - Mock fetch to return streaming response
    - Verify console.log and console.warn calls
  - **Acceptance Criteria:**
    - Test passes
    - All warmup behaviors covered
    - Mock setup matches production behavior

- [x] **1.4: Manual testing of warmup behavior**
  - **Details:**
    - Open DevTools console
    - Refresh page
    - Verify "[OllamaClient] Warming up model..." log appears
    - Verify "[OllamaClient] Model warmup complete" log appears
    - Click any mood button immediately after warmup
    - Measure response time (should be <2s, no cold start)
    - Test with Ollama stopped (verify graceful failure)
  - **Acceptance Criteria:**
    - Console logs appear correctly
    - First user request is fast (model already loaded)
    - Warmup failure doesn't break app

---

## Task Group 2: Response Caching System ✅
**Goal:** Provide instant (<100ms) responses for repeated mood clicks  
**Time Estimate:** 3-4 hours  
**Dependencies:** None  

### Tasks

- [x] **2.1: Add response cache to ContentGeneratorAgent**
  - **File:** `src/agents/ContentGeneratorAgent.ts`
  - **Details:**
    - Add private field: `responseCache: Map<Mood, string> = new Map()`
    - Cache persists for entire session (no TTL)
    - Cache cleared only on page refresh (browser session)
    - Cache key is Mood enum value
    - Cache value is complete generated content string
  - **Acceptance Criteria:**
    - Cache declared as private instance field
    - Type-safe (Map<Mood, string>)
    - Initialized as empty Map
    - No external dependencies

- [x] **2.2: Implement cache lookup before generation**
  - **File:** `src/agents/ContentGeneratorAgent.ts` (in generateContent method)
  - **Details:**
    - Check cache at start of generateContent() method
    - If cached value exists, return immediately
    - Log cache hit with console.log
    - Skip all generation logic if cached
    - Only check cache, don't write yet (that's next task)
  - **Acceptance Criteria:**
    - Cache checked before any API calls
    - Cached responses returned immediately
    - No performance overhead from cache check
    - Console log shows cache hits
  - **Code Pattern:**
    ```typescript
    public async generateContent(mood: Mood): Promise<string> {
      // Check cache first
      const cached = this.responseCache.get(mood);
      if (cached) {
        console.log(`[ContentGeneratorAgent] Returning cached content for mood: ${mood}`);
        return cached;
      }
      
      // Existing circuit breaker and generation logic...
    }
    ```

- [x] **2.3: Cache successful responses after generation**
  - **File:** `src/agents/ContentGeneratorAgent.ts` (in generateContent method)
  - **Details:**
    - After successful content generation (before return)
    - Store content in cache: `this.responseCache.set(mood, content)`
    - Only cache non-empty, successful responses
    - Don't cache errors or empty strings
    - Cache after all validation passes
  - **Acceptance Criteria:**
    - Successful responses cached automatically
    - Cache only stores valid content
    - Errors don't pollute cache
    - Subsequent requests for same mood hit cache

- [x] **2.4: Add clearCache() utility method**
  - **File:** `src/agents/ContentGeneratorAgent.ts`
  - **Details:**
    - Add public method: `clearCache(): void`
    - Simply calls `this.responseCache.clear()`
    - Used for testing and potential future features
    - Document purpose in JSDoc comment
  - **Acceptance Criteria:**
    - Method exists and is public
    - Clears all cached entries
    - Can be called multiple times safely
  - **Code Pattern:**
    ```typescript
    /**
     * Clear all cached responses
     * Used primarily for testing
     */
    public clearCache(): void {
      this.responseCache.clear();
    }
    ```

- [x] **2.5: Add unit tests for caching behavior**
  - **File:** `src/agents/ContentGeneratorAgent.test.ts`
  - **Details:**
    - Test 1: First call generates new content (cache miss)
    - Test 2: Second call with same mood returns cached (cache hit)
    - Test 3: Different moods generate separate content (separate keys)
    - Test 4: clearCache() removes all cached content
    - Mock ollamaClient to verify call counts
    - Verify cache hit returns identical content
  - **Acceptance Criteria:**
    - All 4 tests pass
    - Mocks verify ollamaClient called only on cache miss
    - Cache behavior fully covered

- [x] **2.6: Manual testing of cache behavior**
  - **Details:**
    - Click "Happy" button → measure time (~1-2s)
    - Click "Happy" again → verify instant (<100ms)
    - Check console for cache hit log
    - Click "Calm" button → measure time (~1-2s)
    - Click "Calm" again → verify instant
    - Click "Happy" again → verify still instant (cache persists)
    - Refresh page → click "Happy" → verify generates new (cache cleared)
  - **Acceptance Criteria:**
    - First click generates new content
    - Subsequent same-mood clicks are instant
    - Different moods work independently
    - Refresh clears all caches

---

## Task Group 3: Circuit Breaker Optimization ✅
**Goal:** Reduce error recovery time from 30s to 15s  
**Time Estimate:** 1 hour  
**Dependencies:** None  

### Tasks

- [x] **3.1: Update circuit breaker timing constant**
  - **File:** `src/agents/ContentGeneratorAgent.ts`
  - **Details:**
    - Find: `private static readonly CIRCUIT_HALF_OPEN_DELAY_MS = 30_000;`
    - Change to: `private static readonly CIRCUIT_HALF_OPEN_DELAY_MS = 15_000;`
    - Add comment explaining 15s timing choice
    - Keep all other circuit breaker logic unchanged
    - Keep 3-failure threshold (already reasonable)
  - **Acceptance Criteria:**
    - Constant changed to 15000
    - No other circuit breaker logic modified
    - Comment explains rationale
  - **Code Pattern:**
    ```typescript
    // Reduced from 30s to 15s for faster recovery from transient errors
    private static readonly CIRCUIT_HALF_OPEN_DELAY_MS = 15_000;
    ```

- [x] **3.2: Add test to verify 15s timing**
  - **File:** `src/agents/ContentGeneratorAgent.test.ts`
  - **Details:**
    - Test that CIRCUIT_HALF_OPEN_DELAY_MS equals 15000
    - Can use reflection or test circuit breaker behavior with timers
    - Verify circuit transitions to half-open after 15s, not 30s
    - Use vi.useFakeTimers() for time control
  - **Acceptance Criteria:**
    - Test verifies 15s timing
    - Test passes
    - No flakiness from timing

- [x] **3.3: Manual testing of circuit breaker recovery**
  - **Details:**
    - Stop Ollama service (brew services stop ollama or kill process)
    - Click mood button 3 times to trigger circuit breaker
    - Verify circuit opens (error toast appears)
    - Start timer
    - Start Ollama service
    - Wait 15 seconds (not 30)
    - Click mood button again
    - Verify request goes through (circuit half-open → closed)
  - **Acceptance Criteria:**
    - Circuit opens after 3 failures
    - Circuit allows retry after ~15 seconds
    - Recovery works correctly with new timing
    - No unexpected errors

---

## Task Group 4: Performance Tracking Infrastructure ✅
**Goal:** Add visibility into response times for validation and debugging  
**Time Estimate:** 2-3 hours  
**Dependencies:** None  

### Tasks

- [x] **4.1: Add Performance API marks to ContentGeneratorAgent**
  - **File:** `src/agents/ContentGeneratorAgent.ts` (in generateContent method)
  - **Details:**
    - Add mark at start: `performance.mark(\`generation-start-${mood}\`)`
    - Add mark at end (after successful generation): `performance.mark(\`generation-end-${mood}\`)`
    - Place start mark after cache check (only measure actual generation)
    - Place end mark before cache write and return
    - Use template literals to include mood in mark name
  - **Acceptance Criteria:**
    - Marks created for every generation
    - Marks named uniquely per mood
    - Marks don't interfere with generation logic
    - Performance API available in all browsers
  - **Code Pattern:**
    ```typescript
    // After cache miss, before generation
    performance.mark(`generation-start-${mood}`);
    
    // After successful generation, before return
    performance.mark(`generation-end-${mood}`);
    ```

- [x] **4.2: Add Performance API measures and logging**
  - **File:** `src/agents/ContentGeneratorAgent.ts` (in generateContent method)
  - **Details:**
    - After end mark, create measure: `performance.measure(\`generation-duration-${mood}\`, ...)`
    - Get measure entry: `performance.getEntriesByName(\`generation-duration-${mood}\`)[0]`
    - Log duration in development mode only: `if (process.env.NODE_ENV === 'development')`
    - Format: `console.log(\`[Performance] ${mood} mood: ${Math.round(measure.duration)}ms\`)`
    - Round duration to whole milliseconds for readability
  - **Acceptance Criteria:**
    - Measure created for each generation
    - Console log only in development
    - Duration accurately reflects generation time
    - No logging in production builds
  - **Code Pattern:**
    ```typescript
    performance.measure(
      `generation-duration-${mood}`,
      `generation-start-${mood}`,
      `generation-end-${mood}`
    );
    
    if (process.env.NODE_ENV === 'development') {
      const measure = performance.getEntriesByName(`generation-duration-${mood}`)[0];
      console.log(`[Performance] ${mood} mood: ${Math.round(measure.duration)}ms`);
    }
    ```

- [x] **4.3: Add unit tests for performance tracking**
  - **File:** `src/agents/ContentGeneratorAgent.test.ts`
  - **Details:**
    - Test 1: Verify performance marks are created
    - Test 2: Verify performance measures are created
    - Mock performance.mark and performance.measure
    - Verify correct mark/measure names with mood
    - Don't test actual timing (too brittle)
  - **Acceptance Criteria:**
    - Tests verify Performance API called
    - Tests verify correct names used
    - Tests pass reliably
    - No flakiness from timing

- [x] **4.4: Manual testing of performance logging**
  - **Details:**
    - Ensure NODE_ENV=development (npm run dev)
    - Open DevTools console
    - Click each mood button
    - Verify performance logs appear: "[Performance] happy mood: 1234ms"
    - Verify timing looks reasonable (<2s target)
    - Click same mood again (cached) - verify no performance log (cache hit)
    - Build production: `npm run build && npm run preview`
    - Verify no performance logs in production
  - **Acceptance Criteria:**
    - Performance logs appear in development
    - Timing values are accurate
    - No logs for cached responses
    - No logs in production builds

---

## Task Group 5: Integration Testing & Performance Validation ✅
**Goal:** Verify all optimizations work together and <2s target achieved  
**Time Estimate:** 1-2 hours  
**Dependencies:** Task Groups 1-4 complete  

### Tasks

- [x] **5.1: Run full test suite**
  - **Command:** `npm test`
  - **Details:**
    - All 134 existing tests must pass
    - All 8 new tests must pass (warmup, cache x4, circuit breaker, performance x2)
    - Total expected: 142 tests passing
    - Zero failures, zero skipped
    - No console errors or warnings (except expected test logs)
  - **Acceptance Criteria:**
    - 142/142 tests passing
    - No test failures
    - No regressions introduced
    - Test run completes in reasonable time

- [x] **5.2: Lint and type check**
  - **Commands:** `npm run lint` and `npx tsc -b`
  - **Details:**
    - Zero linting errors
    - Zero TypeScript compilation errors
    - All new code follows existing patterns
    - No eslint-disable comments unless justified
  - **Acceptance Criteria:**
    - Lint passes cleanly
    - TypeScript compiles successfully
    - Code quality maintained

- [x] **5.3: End-to-end performance measurement**
  - **Details:**
    - Start fresh browser session (clear cache)
    - Start Ollama with llama3.1:8b model
    - Open app and wait for warmup to complete
    - Measure each mood using DevTools Network tab:
      - Happy (5 samples)
      - Calm (5 samples)
      - Motivated (5 samples)
      - Creative (5 samples)
    - Record timing: click → content displayed
    - Calculate P50 (median) across all 20 samples
    - Test cached responses (click same mood twice)
  - **Acceptance Criteria:**
    - P50 response time <2 seconds ✅
    - First request per mood <2s (warmup working)
    - Cached requests <100ms (cache working)
    - Performance logs match measured times

- [x] **5.4: Circuit breaker validation**
  - **Details:**
    - Stop Ollama service
    - Trigger 3 failures (circuit opens)
    - Verify error toast and circuit open state
    - Start Ollama service
    - Wait 15 seconds
    - Click mood button
    - Verify request succeeds (circuit half-open → closed)
    - Repeat to ensure stability
  - **Acceptance Criteria:**
    - Circuit opens after 3 failures
    - Circuit recovers after 15s (not 30s)
    - Recovery is clean and stable
    - No unexpected errors

- [x] **5.5: Cache behavior validation**
  - **Details:**
    - Click "Happy" → verify new generation (~1-2s)
    - Click "Happy" again → verify instant + cache log
    - Click "Calm" → verify new generation (~1-2s)
    - Click "Calm" again → verify instant + cache log
    - Click "Motivated" → verify new generation
    - Click "Happy" again → verify still instant (cache persists)
    - Refresh page
    - Click "Happy" → verify new generation (cache cleared)
  - **Acceptance Criteria:**
    - First click per mood generates new
    - Subsequent clicks are instant (<100ms)
    - Cache persists across mood switches
    - Refresh clears all caches
    - Console logs confirm behavior

- [x] **5.6: Warmup validation**
  - **Details:**
    - Restart Ollama (simulate fresh start)
    - Refresh app
    - Open DevTools console
    - Verify warmup logs appear immediately:
      - "[OllamaClient] Warming up model..."
      - "[OllamaClient] Model warmup complete"
    - Click mood button immediately after warmup
    - Verify fast response (<2s, no cold start)
    - Compare to response time without warmup (if possible)
  - **Acceptance Criteria:**
    - Warmup completes successfully
    - Warmup logs appear in console
    - First user request is fast (no cold start penalty)
    - Warmup doesn't block app initialization

- [x] **5.7: Production build validation**
  - **Commands:** `npm run build` then `npm run preview`
  - **Details:**
    - Build succeeds without errors
    - Bundle size acceptable (check output)
    - Preview app works correctly
    - All optimizations work in production
    - No performance logs in console (development only)
    - Test full user flow in preview
  - **Acceptance Criteria:**
    - Production build successful
    - Bundle size reasonable (no huge increases)
    - Performance optimizations work in production
    - No development logs appear

- [x] **5.8: Create verification report**
  - **File:** `agent-os/specs/2025-11-19-performance-optimization/verification/final-verification.md`
  - **Details:**
    - Document all test results
    - Include performance measurements (P50, min, max)
    - Screenshot of successful test suite
    - Screenshot of performance logs
    - Screenshot of Network timing
    - Confirm all acceptance criteria met
    - Note any issues or observations
  - **Acceptance Criteria:**
    - Report is comprehensive
    - All metrics documented
    - Screenshots included
    - Success criteria clearly marked

---

## Dependencies Between Task Groups

```
Task Group 1 (Warmup)           → Independent → Group 5 (Integration)
Task Group 2 (Cache)            → Independent → Group 5 (Integration)
Task Group 3 (Circuit Breaker)  → Independent → Group 5 (Integration)
Task Group 4 (Performance)      → Independent → Group 5 (Integration)
```

**Note:** Task Groups 1-4 are fully independent and can be implemented in any order or in parallel. Task Group 5 depends on all previous groups being complete.

---

## Testing Summary

### New Tests Added
- **OllamaClient:** 1 warmup test
- **ContentGeneratorAgent:** 4 cache tests, 1 circuit breaker test, 2 performance tests
- **Total New Tests:** 8

### Existing Tests Maintained
- All 134 existing tests must continue passing
- No changes to existing test assertions
- Minimal mock updates for cache behavior

### Manual Testing Focus
- Performance measurement (P50 <2s validation)
- Cache behavior across moods and sessions
- Circuit breaker timing (15s recovery)
- Warmup effectiveness (no cold start)

---

## Acceptance Criteria Summary

### Performance Targets
- ✅ P50 response time <2 seconds (mood click → content displayed)
- ✅ Cached responses <100ms (effectively instant)
- ✅ No cold start delays after warmup
- ✅ Circuit breaker recovers in 15s (not 30s)

### Quality Targets
- ✅ All 142 tests passing (134 existing + 8 new)
- ✅ Zero linting errors
- ✅ Zero TypeScript errors
- ✅ Production build successful

### Functional Requirements
- ✅ Model warmup completes on app startup
- ✅ Session caching works per mood
- ✅ Cache clears on page refresh
- ✅ Performance logs visible in development mode
- ✅ All existing features maintained

---

## Risk Mitigation

**If performance target not met:**
1. Profile with detailed timing (warmup, network, generation, rendering)
2. Consider smaller model (llama3.1:3b) - out of scope but documented
3. Optimize prompts further - out of scope but documented
4. Document actual performance in report

**If cache causes issues:**
1. Add cache size limit (max 4 entries × ~500 chars = ~2KB)
2. Add TTL if freshness becomes concern
3. Make cache optional/configurable

**If circuit breaker 15s too aggressive:**
1. Increase back to 20-25s (split difference)
2. Make timing configurable
3. Document in verification report

---

## Out of Scope Reminders

❌ Model switching (llama3.1:3b)  
❌ Prompt optimization  
❌ Streaming display (typewriter)  
❌ React optimization  
❌ Bundle size reduction  
❌ Automated performance CI tests  
❌ Performance budgets  
❌ Persistent caching (database)  

Focus: Warmup, session cache, circuit breaker timing, performance visibility

---

## Implementation Notes

- Keep all changes additive (no breaking changes)
- Maintain strict TypeScript types throughout
- Follow existing code patterns and conventions
- Use native APIs (Performance API, Map) - no new dependencies
- Console logs should be helpful and prefixed
- Error handling must be robust (warmup failures graceful)
- Cache is simple Map - no complex invalidation logic
- Performance tracking only in development mode

---

## Next Steps After Completion

1. Update `agent-os/specs/2025-11-19-performance-optimization/tasks.md` (this file) with completion status
2. Update `agent-os/product/roadmap.md` milestone 9 status
3. Consider next milestone if roadmap has more items
4. Document performance characteristics in README.md
