# Specification: Inspiration Display Card

## Goal
Build a styled card component that displays AI-generated inspirational content with smooth loading animations and responsive typography, maintaining visual consistency with existing UI patterns.

## User Stories
- As a user, I want to see my inspirational content displayed in a clean, readable card format so that I can easily consume the AI-generated message
- As a user, I want visual feedback while content is being generated so that I know the system is working

## Specific Requirements

### 1. InspirationCard Component Structure
- Create new `InspirationCard.tsx` component in `src/components/`
- Accept props: `content: string | null`, `isLoading: boolean`
- Export component for integration with App.tsx
- Self-contained, reusable component following existing component patterns
- Use TypeScript with strict mode for all type definitions

### 2. Card Layout and Positioning
- Center card horizontally on page below MoodSelector
- Maximum width of 600-800px for readability on large screens
- Responsive sizing: full width on mobile with appropriate padding
- Use flexbox or grid for centering within parent container
- Maintain consistent vertical spacing from MoodSelector (matching existing patterns)

### 3. Card Styling with Tailwind CSS
- Rounded corners using Tailwind border-radius utilities (`rounded-xl` or `rounded-2xl`)
- Subtle shadow for depth (`shadow-lg` or similar)
- White background (`bg-white`) matching MoodSelector pattern
- Generous internal padding for content breathing room (`p-6` to `p-8`)
- Border optional but should match existing design language if used

### 4. Loading State Animation
- Display pulsing animation when `isLoading` is true
- Use Tailwind's `animate-pulse` utility class
- Show skeleton/placeholder in card shape during loading
- No text displayed during loading state (purely visual animation)
- Smooth transition from loading to content display

### 5. Content Display Typography
- Clear, readable font size (likely `text-lg` or `text-xl`)
- Appropriate line height for readability (`leading-relaxed` or `leading-loose`)
- Uniform typography - no varying font weights or sizes within content
- Text color should be easily readable (`text-gray-900` or similar)
- Center-aligned or left-aligned text based on readability preference

### 6. Fade-in Transition
- Smooth fade-in animation when content appears after loading
- Use CSS transitions with appropriate duration (200-300ms)
- Apply `transition-opacity` and `duration-[value]` utilities
- Content should fade from transparent to opaque when loaded

### 7. Initial Card Animation
- Subtle scale and fade animation when card first mounts
- Use combination of `scale` and `opacity` transitions
- Keep animation subtle and non-distracting
- Duration should be quick (150-200ms) to feel responsive

### 8. Content Update Transitions
- Smooth transition when content changes (new mood selected)
- Fade out old content, fade in new content
- Brief animation duration to maintain <2s performance target
- Consider using CSS transition utilities or simple opacity changes

### 9. Responsive Design
- Mobile (< 640px): Full width with horizontal padding, smaller text if needed
- Tablet (640px - 1024px): Constrained width, maintain readability
- Desktop (> 1024px): Maximum width constraint (600-800px), centered
- Font sizes should scale appropriately across breakpoints
- Test touch targets and readability on all device sizes

### 10. Integration with App.tsx
- Import and render InspirationCard below MoodSelector
- Pass content from ContentGeneratorAgent result
- Pass loading state based on generation status
- No error state handling in card (delegated to toaster notifications)
- Card should only render when content exists or is loading

## Existing Code to Leverage

### 1. MoodSelector Component Patterns
- File: `src/components/MoodSelector.tsx`
- Reuse Tailwind styling approach: `rounded-xl`, `bg-white`, `shadow` utilities
- Follow same transition pattern: `transition-all duration-200`
- Use similar layout utilities: `grid`, `gap`, padding patterns
- Match focus and interaction state styling conventions

### 2. Tailwind Transition Utilities
- Existing use of `transition-all duration-200` in MoodSelector
- Apply same pattern for opacity and transform transitions
- Use `animate-pulse` for loading state (built-in Tailwind animation)
- Leverage `ease-in-out` timing functions for smooth animations

### 3. Component Props Pattern
- Follow MoodSelector props interface pattern with clear TypeScript types
- Use simple, focused prop interface: content and loading state only
- Export component with named export following project convention

### 4. Typography Scaling
- Reference existing text sizing from App.tsx and MoodSelector
- Maintain consistency with text color (`text-gray-900`)
- Use standard Tailwind line-height utilities for readability

### 5. Responsive Grid Patterns
- MoodSelector uses `grid grid-cols-2 gap-6`
- InspirationCard should integrate naturally within same container approach
- Follow existing responsive breakpoint patterns if any exist

## Out of Scope
- Interactive buttons within card (Generate New, Copy to Clipboard)
- Error state display in card component (use toaster notifications)
- Saving or favoriting content
- Content history or previous messages
- Sharing functionality
- Mood selection within card
- Any controls or inputs beyond displaying text
- Custom animations beyond fade/scale
- Complex skeleton loaders with multiple elements
- Content formatting or rich text display
