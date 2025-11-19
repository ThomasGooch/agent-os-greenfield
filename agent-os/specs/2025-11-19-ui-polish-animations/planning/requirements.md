# UI Polish & Animations - Requirements Gathering

**Date:** November 19, 2025  
**Status:** In Progress - Q&A Phase

---

## Current UI Analysis

Based on code review, the current UI has:

### Existing Features
- ✅ Tailwind CSS for styling
- ✅ Basic transitions (`transition-all duration-200`)
- ✅ Hover states on mood buttons (`hover:bg-gray-50`)
- ✅ Loading animation on InspirationCard (`animate-pulse`)
- ✅ Opacity/scale transitions on content display
- ✅ Focus rings for accessibility
- ✅ Disabled state styling (`opacity-50`)
- ✅ Toast notification system with 4 types
- ✅ Basic card shadows (`shadow-lg`)

### Current Layout
- Gray background (`bg-gray-50`)
- White cards with rounded corners (`rounded-xl`, `rounded-2xl`)
- Grid layout for mood buttons (2x2)
- Center-aligned content
- Max-width constraints for readability

### Gaps / Enhancement Opportunities
- ❌ No entrance animations for page load
- ❌ No sophisticated card animations beyond pulse
- ❌ Limited hover effects (only basic background change)
- ❌ No staggered/cascading animations
- ❌ Mood button transitions are basic
- ❌ No micro-interactions or delightful details
- ❌ Toast animations could be enhanced
- ❌ No spring physics or easing curves
- ❌ Status messages are static (no fade-in)
- ❌ Limited use of shadows and depth
- ❌ No dark mode considerations

---

## Requirements Questions

### 1. Animation Scope & Style

**Q1.1: What animation style/personality should the app have?**
- [ ] Professional & Subtle (minimal, smooth, fast)
- [X] Playful & Bouncy (spring physics, overshoots, personality)
- [ ] Elegant & Fluid (graceful, slower, thoughtful)
- [ ] Modern & Snappy (quick, responsive, iOS-like)

**Q1.2: Should animations respect `prefers-reduced-motion`?**
- [ ] Yes, disable all decorative animations for accessibility
- [X] Partial (keep functional animations, disable decorative)
- [ ] No special handling needed

**Q1.3: What should be the typical animation duration?**
- [ ] Fast (100-200ms) - Snappy and responsive
- [ ] Medium (200-400ms) - Balanced
- [ ] Slow (400-600ms) - Theatrical and noticeable

---

### 2. Component-Specific Enhancements

#### 2.1 Mood Selector Buttons

**Q2.1.1: What hover effects do you want?**
- [ ] Scale up slightly (1.02-1.05x)
- [X] Lift with shadow increase
- [ ] Background color change (already have basic)
- [ ] Emoji animation (bounce, rotate, scale)
- [ ] Border glow/pulse
- [ ] All of the above

**Q2.1.2: What should happen when a button is clicked/selected?**
- [X] Current state is fine (ring appears)
- [ ] Add scale-down "press" effect
- [ ] Add ripple effect from click point
- [ ] Subtle shake or bounce
- [ ] Flash/highlight animation

**Q2.1.3: Should mood buttons have entrance animations on page load?**
- [X] Yes - Stagger in from bottom/fade
- [ ] Yes - Scale up from small
- [ ] Yes - Slide in from sides
- [ ] No - Keep instant render

#### 2.2 Inspiration Card

**Q2.2.1: How should the card appear when content loads?**
- [X] Current fade + scale is good
- [ ] Slide up from bottom
- [ ] Expand from center
- [ ] Flip in
- [ ] Typewriter effect for text
- [ ] Enhanced version of current animation

**Q2.2.2: Should the card have any idle animations?**
- [ ] Subtle float/hover effect
- [X] Gentle shadow pulse
- [ ] No idle animations (static when showing content)

**Q2.2.3: Loading skeleton improvements?**
- [X] Current pulse is fine
- [ ] Add shimmer/shine effect
- [ ] Gradient wave animation
- [ ] Staggered pulse for different lines

#### 2.3 Toast Notifications

**Q2.3.1: How should toasts enter/exit?**
- [X] Current behavior is fine
- [ ] Slide in from right with spring
- [ ] Scale in with bounce
- [ ] Fade + slide with easing
- [ ] Drop down from top

**Q2.3.2: Should toasts have any ongoing animation?**
- [ ] Static once displayed
- [ ] Subtle progress bar for auto-dismiss
- [X] Gentle pulse or glow
- [ ] Icon animation (spin, bounce)

#### 2.4 Status Messages

**Q2.4.1: Should status messages animate when they change?**
- [ ] Yes - Fade out old, fade in new
- [X] Yes - Slide up/down transitions
- [ ] No - Keep instant swap

---

### 3. Overall Page Experience

**Q3.1: Should there be a page load sequence/orchestration?**
- [ ] Yes - Stagger all elements (header → buttons → card)
- [X] Partial - Only animate key elements
- [ ] No - Everything appears immediately

**Q3.2: Background enhancements?**
- [ ] Keep solid gray
- [X] Add subtle gradient
- [ ] Add animated particles/shapes
- [ ] Add subtle pattern/texture

**Q3.3: Should we add any "delight" micro-interactions?**
- [ ] Emoji reactions on hover (wiggle, bounce)
- [ ] Confetti or particles on successful generation
- [ ] Sound effects (optional/toggleable)
- [ ] Easter eggs
- [X] Keep it simple - no extras

---

### 4. Color & Visual Polish

**Q4.1: Color palette enhancements?**
- [ ] Keep current gray/white theme
- [ ] Add accent colors for different moods
- [X] Add gradient overlays
- [ ] Introduce brand colors

**Q4.2: Shadow & depth improvements?**
- [ ] Increase shadow complexity (multiple layers)
- [ ] Add colored shadows
- [ ] Add inner shadows for depth
- [X] Keep simple shadows

**Q4.3: Typography improvements?**
- [X] Keep current sizes/weights
- [ ] Enhance heading styles
- [ ] Add gradient text effects
- [ ] Improve spacing/leading

---

### 5. Advanced Features (Optional)

**Q5.1: Dark mode support?**
- [ ] Yes - Add dark mode toggle
- [ ] Yes - Auto-detect system preference
- [X] No - Out of scope for this milestone

**Q5.2: Custom animation library?**
- [ ] Yes - Add Framer Motion for advanced animations
- [ ] Yes - Add GSAP for timeline-based animations
- [X] No - Use CSS + Tailwind only
- [ ] No - Use CSS + minimal JS

**Q5.3: Performance considerations?**
- [ ] Use GPU-accelerated properties only (transform, opacity)
- [ ] Add will-change hints
- [ ] Lazy-load animation heavy components
- [X] No special performance optimization needed

---

## Visual Assets Checklist

Please provide any visual references if available:

- [ ] Screenshots of inspiration from other apps
- [ ] Mockups of desired animations (video/GIF)
- [ ] Color palette preferences
- [ ] Typography samples
- [ ] Example animation libraries/sites you like

Place any visual assets in: `agent-os/specs/2025-11-19-ui-polish-animations/planning/visuals/`

---

## Technical Constraints

Document any technical requirements:

- **Must maintain:** All existing tests must pass (134 tests)
- **Must maintain:** Accessibility (keyboard nav, screen readers, focus management)
- **Must maintain:** Existing functionality unchanged
- **Must avoid:** Breaking responsive design
- **Must avoid:** Performance degradation (<16ms frame time)

---

## Next Steps

After answering these questions, I will:
1. Analyze existing codebase patterns for consistency
2. Check for reusable animation utilities in Tailwind
3. Draft a comprehensive requirements document
4. Create the formal `spec.md` with all implementation details

Please answer as many questions as feel relevant. You can skip questions or say "your choice" for areas where you'd like me to make reasonable decisions based on best practices.
