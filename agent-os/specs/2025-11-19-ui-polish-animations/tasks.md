# UI Polish & Animations - Tasks

**Date:** November 19, 2025  
**Spec:** `agent-os/specs/2025-11-19-ui-polish-animations/spec.md`  
**Total Estimated Effort:** 6-10 hours

---

## Task Group 1: Tailwind Configuration & Base Animations

**Effort:** 1-2 hours  
**Dependencies:** None  
**Focus:** Foundation - Set up custom animations in Tailwind

### Tasks

- [x] **1.1** Add custom keyframes to `tailwind.config.js`
  - Add `fade-in-up` keyframe (opacity 0→1, translateY 20px→0)
  - Add `slide-up` keyframe (translateY 10px→0, opacity 0→1)
  - Add `slide-down` keyframe (translateY -10px→0, opacity 0→1)
  - Add `shadow-pulse` keyframe (box-shadow 0.1→0.15 opacity cycle)
  - Add `gentle-pulse` keyframe (opacity 1→0.95 cycle)

- [x] **1.2** Add custom animation utilities to `tailwind.config.js`
  - `animate-fade-in-up`: 0.4s with spring cubic-bezier(0.34, 1.56, 0.64, 1)
  - `animate-slide-up`: 0.3s with spring cubic-bezier(0.34, 1.56, 0.64, 1)
  - `animate-slide-down`: 0.3s with spring cubic-bezier(0.34, 1.56, 0.64, 1)
  - `animate-shadow-pulse`: 3s infinite ease-in-out
  - `animate-gentle-pulse`: 2s infinite ease-in-out

- [x] **1.3** Test Tailwind build
  - Run `npm run build` to verify no config errors
  - Verify new animation classes are generated
  - Check that existing styles still work

### Acceptance Criteria
- ✅ All 5 keyframe animations defined in Tailwind config
- ✅ All 5 animation utilities configured with correct timing
- ✅ Tailwind builds without errors
- ✅ No breaking changes to existing styles

### Files Modified
- `tailwind.config.js`

### Tests
- Manual: Build verification
- Automated: None (configuration only)

---

## Task Group 2: Background & Global Polish

**Effort:** 1 hour  
**Dependencies:** Task Group 1  
**Focus:** Visual foundation - Background gradient and motion preferences

### Tasks

- [x] **2.1** Update App component background
  - Replace `bg-gray-50` with gradient: `bg-gradient-to-br from-gray-50 via-blue-50/30 to-purple-50/20`
  - Test gradient appearance in browser
  - Verify contrast ratios for accessibility (WCAG AA minimum)

- [x] **2.2** Add global reduced-motion styles to `src/index.css`
  - Add `@media (prefers-reduced-motion: reduce)` block
  - Set `animation-duration: 0.01ms !important` for decorative animations
  - Keep functional transitions at 200ms for `.toast` and `.status-message`
  - Add comments explaining accessibility purpose

- [x] **2.3** Test reduced motion
  - Enable "Reduce motion" in browser/OS settings
  - Verify decorative animations are disabled
  - Confirm functional transitions still work
  - Test keyboard navigation unchanged

### Acceptance Criteria
- ✅ Subtle gradient background replaces solid gray
- ✅ Gradient doesn't interfere with readability
- ✅ Reduced motion CSS rules properly implemented
- ✅ All existing tests pass without modification
- ✅ Accessibility maintained (contrast, keyboard nav)

### Files Modified
- `src/App.tsx` - Update background className
- `src/index.css` - Add prefers-reduced-motion rules

### Tests
- Automated: Run `npm test` - all 134 tests should pass
- Manual: Visual check gradient, test reduced motion setting

---

## Task Group 3: Mood Button Enhancements

**Effort:** 2-3 hours  
**Dependencies:** Task Group 1  
**Focus:** Interactive polish - Staggered entrance and hover effects

### Tasks

- [x] **3.1** Add staggered entrance animations
  - Create delay array: `['delay-0', 'delay-75', 'delay-150', 'delay-[225ms]']`
  - Map delays to buttons using index
  - Add `animate-fade-in-up` class to each button
  - Add `motion-reduce:animate-none` for accessibility

- [x] **3.2** Enhance hover effects
  - Add `hover:shadow-xl` for elevated shadow
  - Add `hover:-translate-y-1` for lift effect
  - Add `active:translate-y-0` for press feedback
  - Add `motion-reduce:hover:translate-y-0` to disable for reduced motion

- [x] **3.3** Update transition timing
  - Change `transition-all duration-200` to `duration-300`
  - Add cubic-bezier easing: `cubic-bezier(0.34, 1.56, 0.64, 1)` via inline style or utility
  - Test timing feels bouncy and playful

- [x] **3.4** Update MoodSelector tests
  - Check if tests reference specific classes
  - Update assertions if needed for new animation classes
  - Ensure all button interaction tests pass
  - Verify disabled state still works correctly

### Acceptance Criteria
- ✅ Buttons fade in with stagger on page load (0, 75, 150, 225ms delays)
- ✅ Hover shows lift effect with shadow increase
- ✅ Bouncy cubic-bezier easing applied
- ✅ Motion reduced when user preference set
- ✅ All existing button functionality preserved
- ✅ Tests updated and passing

### Files Modified
- `src/components/MoodSelector.tsx` - Animation classes and hover effects

### Tests
- Automated: `npm test -- src/components/MoodSelector.test.tsx`
- Automated: `npm test -- src/components/MoodSelector.gap.test.tsx`
- Automated: `npm test -- src/components/MoodSelector.disabled.test.tsx`
- Manual: Visual check stagger timing and hover feel

---

## Task Group 4: Inspiration Card & Toast Polish

**Effort:** 1-2 hours  
**Dependencies:** Task Group 1  
**Focus:** Content display - Shadow pulse and gentle pulse effects

### Tasks

- [x] **4.1** Add shadow pulse to InspirationCard
  - Add `animate-shadow-pulse` class when `isVisible` is true
  - Only apply when content is displayed (not loading)
  - Add `motion-reduce:animate-none` to disable pulse
  - Keep existing fade/scale transition

- [x] **4.2** Add gentle pulse to Toast
  - Add `animate-gentle-pulse` class to toast container
  - Keep existing `animate-slide-in` animation
  - Add `motion-reduce:animate-[slide-in]` to keep only slide for reduced motion
  - Ensure pulse doesn't interfere with auto-dismiss

- [x] **4.3** Update InspirationCard tests
  - Check for new animation class in tests
  - Update assertions if needed
  - Verify loading state still shows pulse skeleton
  - Test content display transition

- [x] **4.4** Update Toast tests
  - Check if pulse class affects assertions
  - Verify auto-dismiss timing unchanged
  - Test all toast types (success, error, warning, info)

### Acceptance Criteria
- ✅ InspirationCard shows subtle shadow pulse when displaying content
- ✅ Toast has gentle pulse while visible
- ✅ Loading skeleton remains unchanged (existing pulse)
- ✅ Reduced motion disables decorative pulses
- ✅ All toast functionality preserved (auto-dismiss, types)
- ✅ Tests updated and passing

### Files Modified
- `src/components/InspirationCard.tsx` - Shadow pulse animation
- `src/components/Toast.tsx` - Gentle pulse animation

### Tests
- Automated: `npm test -- src/components/InspirationCard.test.tsx`
- Automated: `npm test -- src/components/Toast.test.tsx`
- Automated: `npm test -- src/contexts/ToastContext.test.tsx`
- Manual: Visual check pulse timing and subtlety

---

## Task Group 5: Status Message Transitions & Final Verification

**Effort:** 1-2 hours  
**Dependencies:** Task Groups 1-4  
**Focus:** Polish completion - Status transitions and comprehensive testing

### Tasks

- [x] **5.1** Implement status message transitions
  - Wrap status messages in a transition container: `<div className="h-6 relative overflow-hidden">`
  - Add `animate-slide-down` to each status message
  - Add `absolute inset-0` positioning for smooth height transitions
  - Add `motion-reduce:animate-none` fallback
  - Test all status types: offline, circuit breaker, Ollama connected/disconnected/error

- [x] **5.2** Verify message priority hierarchy
  - Test offline message appears first when offline
  - Test circuit breaker shows when online but circuit open
  - Test Ollama status shows when online and circuit closed
  - Ensure transitions don't break priority logic

- [x] **5.3** Run full test suite
  - Execute `npm test -- --run` for all 134 tests
  - Fix any failing tests caused by new animation classes
  - Verify no regressions in functionality
  - Ensure test execution time hasn't significantly increased

- [x] **5.4** Cross-browser testing
  - Test in Chrome (latest)
  - Test in Firefox (latest)
  - Test in Safari (latest)
  - Test on mobile (iOS Safari or Chrome Mobile)
  - Verify animations work consistently

- [x] **5.5** Performance verification
  - Open DevTools Performance tab
  - Record page load and interactions
  - Verify 60fps during all animations
  - Check no layout thrashing or forced reflows
  - Ensure page interactive within 300ms

- [x] **5.6** Accessibility audit
  - Test with keyboard navigation only
  - Enable `prefers-reduced-motion` and verify compliance
  - Test with screen reader (VoiceOver or NVDA)
  - Verify focus indicators visible throughout
  - Check color contrast ratios (WCAG AA minimum)

### Acceptance Criteria
- ✅ Status messages slide in/out smoothly
- ✅ No layout shift or jitter during transitions
- ✅ Message priority logic unchanged
- ✅ All 134 tests passing
- ✅ No regressions in functionality
- ✅ 60fps performance in all browsers
- ✅ Full accessibility compliance
- ✅ Works on mobile devices

### Files Modified
- `src/App.tsx` - Status message transition container

### Tests
- Automated: `npm test -- --run` (full suite)
- Automated: `npm run build` (verify production build)
- Automated: `npm run lint` (code quality)
- Manual: Cross-browser testing checklist
- Manual: Performance profiling
- Manual: Accessibility audit

---

## Testing Strategy Summary

### Unit Tests (Automated)
- **Approach:** 2-8 focused tests per task group maximum
- **Focus:** Verify new animation classes don't break existing functionality
- **Files:** Update test assertions only where animation classes affect DOM queries
- **Target:** All 134 existing tests + any minimal new assertions = 100% pass rate

### Integration Tests (Automated)
- Run full test suite after each task group completion
- Verify no regressions in user flows
- Check App.tsx integration tests for status message transitions

### Manual Tests (Visual)
- Animation quality and timing
- Browser compatibility
- Mobile responsiveness
- Reduced motion compliance
- Performance profiling

### Performance Benchmarks
- Page load: <300ms to interactive
- All animations: 60fps (16ms frame time)
- No frame drops during interactions
- Bundle size increase: <5KB

---

## Definition of Done

Each task group is complete when:

✅ All tasks in the group are checked off  
✅ Code follows Tailwind CSS methodology (utility-first)  
✅ All automated tests pass (existing + any updates)  
✅ Manual testing completed and documented  
✅ No accessibility regressions  
✅ Performance targets met  
✅ Code reviewed for quality  
✅ Changes committed with clear message  

---

## Risk Mitigation

**If tests fail after animation changes:**
- Check if tests query by specific class names
- Update test assertions to be more flexible (use `toContain` instead of exact match)
- Add animation classes to test queries if needed
- Ensure test logic unchanged, only DOM selectors updated

**If animations feel "off":**
- Iterate on timing values (try 250ms, 350ms, 450ms)
- Adjust cubic-bezier values for different bounce feel
- Test on different devices/browsers
- Get feedback from manual testing

**If performance degrades:**
- Verify using only transform and opacity (GPU-accelerated)
- Remove or simplify complex animations
- Add `will-change` hints sparingly
- Profile with DevTools to identify bottlenecks

---

## Standards Compliance

- **CSS:** Follow Tailwind utility-first methodology, no custom CSS overrides
- **Testing:** Minimal test additions, focus on verifying no regressions
- **Accessibility:** Full `prefers-reduced-motion` support, maintain keyboard nav and screen reader compatibility
- **Performance:** GPU-accelerated properties only, 60fps target
- **TypeScript:** Maintain strict mode compliance

---

## Implementation Notes

**Key Principles:**
1. Start simple - Get basic animations working first
2. Test frequently - Run tests after each file modification
3. Iterate on feel - Animation timing may need adjustment
4. Accessibility first - Always test reduced motion
5. No breaking changes - Preserve all existing functionality

**Common Patterns:**
```tsx
// Staggered animation
{items.map((item, index) => (
  <div className={`animate-fade-in-up ${delays[index]}`}>

// Conditional animation with motion reduction
<div className={`
  ${isActive ? 'animate-shadow-pulse' : ''}
  motion-reduce:animate-none
`}>

// Hover effects with motion support
<button className="
  hover:shadow-xl hover:-translate-y-1
  motion-reduce:hover:translate-y-0
">
```

**Helpful Commands:**
```bash
# Run tests for specific file
npm test -- src/components/MoodSelector.tsx

# Run all tests
npm test -- --run

# Build for production
npm run build

# Run linter
npm run lint

# Start dev server for manual testing
npm run dev
```

---

**Ready for:** `/implement-tasks` or `/orchestrate-tasks`
