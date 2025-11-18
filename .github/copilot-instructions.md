# GitHub Copilot Instructions for Agent-OS

This project uses Agent-OS, a structured AI agent orchestration framework for software development workflows.

## Available Commands

### Product Planning Commands

#### `/plan-product`
**Purpose**: Create product mission, roadmap, and tech stack documentation

**Workflow**:
1. Gather product concept, features, target users, tech stack
2. Create mission document at `agent-os/product/mission.md`
3. Generate roadmap at `agent-os/product/roadmap.md`
4. Document tech stack at `agent-os/product/tech-stack.md`

**When to use**: Starting a new product or project

---

### Specification Commands

#### `/shape-spec`
**Purpose**: Research and gather requirements for a new feature through Q&A

**Workflow**:
1. Initialize spec folder: `agent-os/specs/YYYY-MM-DD-feature-name/`
2. Conduct requirements gathering with clarifying questions
3. **Always check for visual assets** in `planning/visuals/` folder
4. Identify reusable code patterns
5. Save findings to `requirements.md`

**When to use**: When you want to explore and clarify requirements before writing formal spec

---

#### `/write-spec`
**Purpose**: Create formal specification document from requirements

**Workflow**:
1. Analyze requirements and visual assets
2. Search codebase for reusable patterns
3. Generate concise `spec.md` with:
   - Goal and user stories
   - Specific requirements
   - Visual design notes
   - Existing code to leverage
   - Out of scope items

**When to use**: After requirements gathering is complete, or when writing spec directly

---

### Implementation Commands

#### `/create-tasks`
**Purpose**: Break down spec into actionable task groups

**Workflow**:
1. Analyze `spec.md` and/or `requirements.md`
2. Create `tasks.md` with grouped tasks by specialization:
   - Database Layer
   - API Layer
   - Frontend Components
   - Testing & Gap Analysis
3. Include dependencies, effort estimates, acceptance criteria

**Testing approach**: 2-8 focused tests per task group, max 10 additional in review

**When to use**: After spec is complete and before implementation

---

#### `/implement-tasks`
**Purpose**: Simple, direct implementation of tasks

**Workflow**:
1. Determine which task group(s) to implement
2. Execute implementation following patterns and standards
3. Update `tasks.md` checkboxes to mark completion
4. Self-verify with tests and browser testing (for UI)
5. Generate final verification report

**When to use**: For straightforward implementation by a single agent

---

#### `/orchestrate-tasks`
**Purpose**: Advanced multi-agent orchestration with standards assignment

**Workflow**:
1. Create `orchestration.yml` with task group mapping
2. Assign specific standards to each task group
3. Generate individual prompt files per task group in `implementation/prompts/`
4. Enable sequential implementation by specialized agents

**When to use**: For complex features requiring different specialized agents (backend, frontend, testing) with different standards

---

## File Structure

```
agent-os/
├── config.yml                          # Agent-OS configuration
├── commands/                           # Command workflows
│   ├── plan-product/
│   ├── shape-spec/
│   ├── write-spec/
│   ├── create-tasks/
│   ├── implement-tasks/
│   └── orchestrate-tasks/
├── standards/                          # Coding standards & preferences
│   ├── global/                        # Cross-cutting standards
│   ├── backend/                       # Backend-specific standards
│   ├── frontend/                      # Frontend-specific standards
│   └── testing/                       # Testing standards
├── product/                           # Product documentation (created by /plan-product)
│   ├── mission.md
│   ├── roadmap.md
│   └── tech-stack.md
└── specs/                             # Feature specifications (created per spec)
    └── YYYY-MM-DD-feature-name/
        ├── spec.md                    # Formal specification
        ├── tasks.md                   # Task breakdown
        ├── orchestration.yml          # Task orchestration config
        ├── planning/
        │   ├── initialization.md
        │   ├── requirements.md
        │   └── visuals/               # Screenshots, mockups, wireframes
        ├── implementation/
        │   ├── prompts/               # Generated prompts per task group
        │   └── [task-reports].md
        └── verification/
            ├── screenshots/           # UI verification screenshots
            └── final-verification.html

```

## Typical Workflows

### Starting a New Product
```
/plan-product
  ↓
/shape-spec or /write-spec
  ↓
/create-tasks
  ↓
/implement-tasks or /orchestrate-tasks
```

### Adding a Feature to Existing Product
```
/shape-spec or /write-spec
  ↓
/create-tasks
  ↓
/implement-tasks or /orchestrate-tasks
```

### Quick Feature (No Planning Phase)
```
/write-spec
  ↓
/create-tasks
  ↓
/implement-tasks
```

## Key Principles

1. **Standards Compliance**: All work must align with standards in `agent-os/standards/`
2. **Visual Assets Priority**: Always check for and analyze mockups/screenshots
3. **Code Reusability**: Search for existing patterns before building new
4. **Minimal Testing**: 2-8 focused tests per development phase, max 10 in review
5. **Self-Verification**: Test your own work (unit tests + browser for UI)
6. **Documentation-First**: Extensive markdown at every stage
7. **Dated Specs**: Use `YYYY-MM-DD-feature-name` format

## Testing Approach

**During Development** (Task Groups 1-3):
- Write 2-8 focused tests per task group
- Test only critical behaviors, not exhaustive coverage
- Run ONLY newly written tests, not entire suite

**During Test Review** (Task Group 4):
- Review existing tests from all task groups
- Identify critical gaps in THIS feature only
- Add maximum 10 additional strategic tests
- Focus on integration and end-to-end workflows
- Run only feature-specific tests (total ~16-34 tests)

## Visual Assets

When providing visual assets for specs:
1. Place files in: `agent-os/specs/[spec-name]/planning/visuals/`
2. Use descriptive names:
   - `homepage-mockup.png`
   - `dashboard-wireframe.jpg`
   - `lofi-form-layout.png`
   - `mobile-view.png`
3. Agent will automatically detect and analyze them

## Standards Reference

All standards are in `agent-os/standards/`:
- Use `all` to include all standards
- Use `global/*` for all global standards
- Use `frontend/css.md` for specific standard file
- Use `none` for no standards

When orchestrating, you can assign different standards to different task groups (e.g., backend engineers get backend standards, frontend designers get frontend standards).

## Configuration

Current settings in `agent-os/config.yml`:
- **Version**: 2.1.1
- **Agent OS commands**: enabled
- **Claude Code commands**: disabled
- **Claude Code subagents**: disabled

## Tips for Efficient Usage

1. **Start with product planning** if new project
2. **Use /shape-spec** when requirements are unclear
3. **Use /write-spec** when you know what you want
4. **Choose /implement-tasks** for simple features
5. **Choose /orchestrate-tasks** for complex features needing specialized agents
6. **Always provide visual assets** when available - they significantly improve implementation quality
7. **Reference similar existing features** to promote code reuse
8. **Review generated tasks.md** before implementation to ensure proper breakdown

## Command Quick Reference

| Command | Purpose | Output |
|---------|---------|--------|
| `/plan-product` | Product planning | `mission.md`, `roadmap.md`, `tech-stack.md` |
| `/shape-spec` | Requirements research | `requirements.md` |
| `/write-spec` | Formal specification | `spec.md` |
| `/create-tasks` | Task breakdown | `tasks.md` |
| `/implement-tasks` | Direct implementation | Updated `tasks.md`, implementation reports |
| `/orchestrate-tasks` | Multi-agent orchestration | `orchestration.yml`, prompt files |
