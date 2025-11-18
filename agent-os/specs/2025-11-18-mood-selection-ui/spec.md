# Specification: Mood Selection UI

## Goal
Create a mood selection interface with four buttons (Happy, Calm, Motivated, Creative) positioned below the Ollama connection status, enabling users to immediately trigger inspirational content generation based on their chosen mood.

## User Stories
1. As a user, I want to select my current mood from four options so that I receive personalized inspirational content matching my emotional state
2. As a user, I want visual feedback showing which mood is currently selected so that I understand the active state of the interface
3. As a user, I want the mood buttons disabled when Ollama is not connected so that I don't attempt to generate content when the system is unavailable

## Specific Requirements

### 1. MoodSelector Component
- Create new `MoodSelector.tsx` component in `src/components/`
- Export component for use in `App.tsx`
- Accept props: `disabled: boolean`, `onMoodSelect: (mood: string) => void`
- Define TypeScript type for mood values: `'happy' | 'calm' | 'motivated' | 'creative'`
- Component should be self-contained and reusable

### 2. Mood Button Design
- Display four buttons in horizontal layout: Happy, Calm, Motivated, Creative
- Each button contains emoji + text label:
  - Happy: 😊 Happy
  - Calm: 😌 Calm
  - Motivated: 💪 Motivated
  - Creative: 🎨 Creative
- Use distinct background colors per mood for visual identification:
  - Happy: warm yellow/gold tones
  - Calm: cool blue/teal tones
  - Motivated: energetic orange/red tones
  - Creative: vibrant purple/pink tones
- All buttons have rounded corners, padding, and subtle shadow for depth
- Buttons should have minimum touch target size (44x44px) for accessibility

### 3. Active State Behavior
- Track currently selected mood in component state
- Active button displays visually distinct styling (darker background, border, or elevated shadow)
- Active state persists after selection and content generation
- Only one mood can be active at a time
- Clicking same mood again keeps it active (idempotent)

### 4. Disabled State Handling
- When `disabled` prop is true, all buttons are non-interactive
- Disabled buttons show reduced opacity (opacity-50)
- Disabled buttons display not-allowed cursor
- Disabled buttons do not respond to clicks or keyboard activation
- Component should check if Ollama status is 'disconnected' or 'error'

### 5. Interaction Behavior
- Clicking mood button immediately calls `onMoodSelect(mood)` callback
- No confirmation dialog or secondary "Generate" button needed
- Provide hover state with subtle color change for better UX
- Provide focus state with visible outline for keyboard navigation

### 6. Layout and Positioning
- Position component below Ollama connection status in `App.tsx`
- Use flexbox for horizontal button layout with gap spacing
- Center-align buttons within container
- Add appropriate vertical spacing (margin) above and below component

### 7. Responsive Design
- On mobile (<640px): Stack buttons vertically with full width
- On tablet (640px-1024px): Maintain horizontal layout, adjust button sizes
- On desktop (>1024px): Full horizontal layout with comfortable spacing
- Use Tailwind responsive classes (sm:, md:, lg:) for breakpoints

### 8. Keyboard Accessibility
- All buttons are keyboard focusable using Tab key
- Buttons activate with Enter or Space key
- Focus indicator clearly visible (ring utility class)
- Tab order follows left-to-right reading order

### 9. Integration with App.tsx
- Import `MoodSelector` component in `App.tsx`
- Pass `disabled={status !== 'connected'}` prop
- Create `handleMoodSelect` callback function (placeholder for now)
- Insert component in JSX after connection status section

### 10. TypeScript Types
- Define `Mood` type in component file or `src/types/`
- Define `MoodSelectorProps` interface with strict typing
- Ensure all props, state, and callbacks are properly typed
- No `any` types permitted (strict mode compliance)

## Visual Design
No visual mockups provided. Design should follow existing App.tsx patterns:
- Match color scheme: blue-indigo gradient background, white container
- Use existing Tailwind utility classes for consistency
- Follow spacing patterns from connection status sections (p-4, rounded-md, etc.)
- Maintain visual hierarchy with appropriate font sizes and weights

## Existing Code to Leverage

### 1. Tailwind CSS Patterns from App.tsx
- Reuse color utility classes: `bg-[color]-50`, `border-[color]-200`, `text-[color]-600/700/800`
- Reuse layout patterns: `flex items-center justify-center space-x-2`
- Reuse interactive states: hover, focus, disabled styling patterns
- Reuse spacing: `p-4`, `mb-6`, `space-x-3` for consistent vertical/horizontal rhythm

### 2. useOllamaHealth Hook Integration
- Already available via `import { useOllamaHealth } from '@/hooks/useOllamaHealth'`
- Returns `{ status, isChecking }` values
- Use `status` to determine disabled state: `disabled={status !== 'connected'}`

### 3. Component Structure Pattern
- Follow App.tsx JSX organization with clear sections and comments
- Use inline SVG pattern for icons if needed (though emojis preferred here)
- Apply consistent className ordering: layout → colors → typography → states

### 4. TypeScript Configuration
- Already set up with strict mode in project
- Use `@/` path alias for imports (configured in vite.config.ts)
- Export default pattern for components

### 5. Testing Setup
- Vitest + React Testing Library already configured
- Import test utilities from `@/test/utils` for consistent render
- Follow TDD workflow: write tests first, then implementation

## Out of Scope
1. Keyboard shortcuts (H, C, M, R keys) for quick mood selection
2. Mood history tracking or persistence across sessions
3. Custom mood creation or user-defined moods beyond the four defaults
4. Tooltip descriptions explaining each mood
5. Mood recommendations based on time of day or user patterns
6. Time-based mood suggestions or smart defaults
7. Animation or transitions beyond basic hover/focus states
8. Multi-select mood combinations
9. Mood intensity levels or sliders
10. Integration with actual content generation (callback will be placeholder)
