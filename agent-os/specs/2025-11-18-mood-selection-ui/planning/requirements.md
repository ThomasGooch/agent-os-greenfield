# Spec Requirements: Mood Selection UI

## Initial Description
**Feature:** Mood Selection UI

**Description from Roadmap:**
Create mood selection interface with four mood options (Happy, Calm, Motivated, Creative) using buttons, implement active state styling, and ensure accessible interaction

**Size:** XS

## Requirements Discussion

### First Round Questions

**Q1: Button Layout**
I'm assuming we should display the four mood buttons (Happy, Calm, Motivated, Creative) in a horizontal row or 2x2 grid layout that's centered on the page below the Ollama connection status. Is that correct, or would you prefer a different arrangement (vertical list, dropdown)?

**Answer:** Yes, horizontal

**Q2: Visual Design**
I'm thinking each mood button should have an icon/emoji + label (e.g., 😊 Happy, 😌 Calm, 💪 Motivated, 🎨 Creative) with distinct colors per mood for quick visual identification. Should we go with this approach, or prefer text-only buttons?

**Answer:** Yes, sounds good

**Q3: Active State**
I assume when a mood is selected, that button should show an active/selected state (different background color, border, or elevation) and stay highlighted while generating content. Should the selection persist after content is displayed, or reset?

**Answer:** Yes

**Q4: Button Interaction**
I'm thinking clicking a mood button should immediately trigger the content generation process (no separate "Generate" button needed). Is that the desired flow, or should users confirm their selection?

**Answer:** Yes, correct immediate

**Q5: Placement**
I assume the mood selector should appear below the current Ollama connection status indicator in the App.tsx component. Should it be hidden/disabled when Ollama is not connected, or always visible with a disabled state?

**Answer:** Yes, below

**Q6: Accessibility**
For keyboard navigation, I'm planning to make buttons focusable with tab key and activatable with Enter/Space. Should we also add keyboard shortcuts (like H, C, M, R for each mood)?

**Answer:** No, not in scope

**Q7: Responsive Design**
On mobile devices, should the buttons stack vertically or remain in a grid layout with smaller touch targets?

**Answer:** Correct, must be responsive

**Q8: Out of Scope**
What should we explicitly NOT include in this feature? For example: mood history, adding custom moods, tooltip descriptions for each mood, mood recommendation based on time of day?

**Answer:** All out of scope

### Existing Code to Reference

No similar existing features identified for reference. This is a new UI component being built from scratch.

### Follow-up Questions

None needed - requirements are clear.

## Visual Assets

### Files Provided:
No visual assets provided.

### Visual Insights:
No visuals to analyze.

## Requirements Summary

### Functional Requirements
- Display four mood buttons: Happy, Calm, Motivated, Creative
- Horizontal row layout (responsive on mobile)
- Each button shows emoji/icon + text label
- Distinct color per mood for visual identification
- Clicking a button immediately triggers content generation
- Active/selected state persists during and after generation
- Position below Ollama connection status in App.tsx
- Standard keyboard navigation (Tab, Enter/Space)
- Buttons should be disabled when Ollama is not connected

### Reusability Opportunities
No existing similar features to reuse - greenfield component.

### Scope Boundaries

**In Scope:**
- Four mood buttons with emoji + label
- Horizontal layout (responsive)
- Active state styling
- Immediate generation trigger on click
- Disabled state when Ollama disconnected
- Basic keyboard accessibility (Tab, Enter/Space)

**Out of Scope:**
- Keyboard shortcuts (H, C, M, R)
- Mood history tracking
- Custom mood creation
- Tooltip descriptions
- Mood recommendations
- Time-based suggestions

### Technical Considerations
- Component should integrate with existing App.tsx structure
- Must check Ollama connection status via useOllamaHealth hook
- Buttons disabled when status is 'disconnected' or 'error'
- Use Tailwind CSS for styling (consistent with project)
- Follow existing TypeScript strict mode patterns
- Responsive breakpoints for mobile/tablet/desktop
- Active state should use existing color scheme from App.tsx
