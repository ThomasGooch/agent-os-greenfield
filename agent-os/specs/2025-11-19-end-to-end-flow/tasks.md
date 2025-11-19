# Task Breakdown: End-to-End Flow

## Overview
Total Tasks: 2 task groups

## Task List

### Prompt Engineering Layer

#### Task Group 1: Update MoodInterpreterAgent Prompts
**Dependencies:** None

- [ ] 1.0 Update prompt templates for concise 3-sentence output
  - [ ] 1.1 Write 2-8 focused tests for updated prompts
    - Test that each prompt explicitly requests 3 sentences
    - Test that prompts maintain mood-specific keywords (happy, calm, motivated, creative)
    - Test that prompts are clear and direct
    - Limit to critical prompt validation tests only
  - [ ] 1.2 Update HAPPY_PROMPT constant
    - Modify prompt to explicitly request exactly 3 sentences
    - Maintain joyful, uplifting tone
    - Format: "Generate exactly 3 sentences of inspiring content for someone feeling happy..."
    - Keep prompt clear and directive for Ollama
  - [ ] 1.3 Update CALM_PROMPT constant
    - Modify prompt to explicitly request exactly 3 sentences
    - Maintain peaceful, serene tone
    - Format: "Generate exactly 3 sentences of peaceful content for someone feeling calm..."
    - Keep prompt clear and directive for Ollama
  - [ ] 1.4 Update MOTIVATED_PROMPT constant
    - Modify prompt to explicitly request exactly 3 sentences
    - Maintain energizing, inspiring tone
    - Format: "Generate exactly 3 sentences of motivating content for someone feeling motivated..."
    - Keep prompt clear and directive for Ollama
  - [ ] 1.5 Update CREATIVE_PROMPT constant
    - Modify prompt to explicitly request exactly 3 sentences
    - Maintain imaginative, innovative tone
    - Format: "Generate exactly 3 sentences of creative inspiration for someone feeling creative..."
    - Keep prompt clear and directive for Ollama
  - [ ] 1.6 Ensure MoodInterpreterAgent tests pass
    - Run ONLY the tests written in 1.1 and existing MoodInterpreterAgent tests
    - Verify all 4 prompts request 3 sentences
    - Verify mood-specific keywords remain present
    - Do NOT run the entire test suite at this stage

**Acceptance Criteria:**
- All 4 prompt constants explicitly request 3 sentences
- Prompts maintain mood-specific tone and keywords
- Tests written in 1.1 pass
- Existing MoodInterpreterAgent unit tests pass
- No changes to class structure, singleton pattern, or method signatures

### End-to-End Verification

#### Task Group 2: Test Complete Flow with Updated Prompts
**Dependencies:** Task Group 1

- [ ] 2.0 Verify end-to-end flow with 3-sentence output
  - [ ] 2.1 Write 2-8 focused integration tests for end-to-end flow
    - Test mood selection → MoodInterpreterAgent → ContentGeneratorAgent flow
    - Test that generated content is appropriately concise (integration test with real/mocked Ollama)
    - Test that InspirationCard handles shorter content correctly
    - Limit to critical end-to-end workflow tests only
  - [ ] 2.2 Manual browser testing for each mood
    - Test Happy mood: verify 3-sentence output displays correctly
    - Test Calm mood: verify 3-sentence output displays correctly
    - Test Motivated mood: verify 3-sentence output displays correctly
    - Test Creative mood: verify 3-sentence output displays correctly
  - [ ] 2.3 Verify loading states work correctly
    - Confirm loading skeleton displays during generation
    - Confirm smooth transition to content display
    - Verify no UI issues with shorter content length
  - [ ] 2.4 Verify streaming accumulation completes
    - Confirm ContentGeneratorAgent accumulates full 3-sentence response
    - Verify no truncation or streaming issues
    - Test that all content reaches InspirationCard
  - [ ] 2.5 Run feature-specific tests
    - Run tests from 1.1 (prompt validation)
    - Run tests from 2.1 (end-to-end flow)
    - Run existing MoodInterpreterAgent unit tests
    - Expected total: approximately 10-20 tests maximum
    - Do NOT run the entire application test suite

**Acceptance Criteria:**
- All 4 moods produce concise 3-sentence inspirational content
- End-to-end flow works: mood selection → agent → Ollama → display
- InspirationCard displays shorter content correctly
- Loading states and transitions work properly
- Feature-specific tests pass (approximately 10-20 tests)
- No changes required to ContentGeneratorAgent, App.tsx, or InspirationCard

## Execution Order

Recommended implementation sequence:
1. Prompt Engineering Layer (Task Group 1) - Update prompts and validate with tests
2. End-to-End Verification (Task Group 2) - Test complete flow and verify in browser
