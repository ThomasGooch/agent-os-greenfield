# Tech Stack

## Framework & Runtime
- **Application Framework:** Vite + React (single-page application)
- **Language/Runtime:** TypeScript 5+ / Node.js
- **Package Manager:** npm or yarn
- **Build Tool:** Vite (fast HMR and optimized builds)

## Frontend
- **JavaScript Framework:** React 18+ with TypeScript
- **CSS Framework:** Tailwind CSS (utility-first styling)
- **UI Components:** Custom components (mood selector, inspiration card)
- **State Management:** React hooks (useState, useEffect)
- **Type Safety:** Full TypeScript coverage with strict mode

## AI & Local Processing
- **AI Runtime:** Ollama (local LLM inference)
- **Model:** TBD (optimized for speed - likely llama2 or mistral variants)
- **API Communication:** HTTP/REST to local Ollama endpoint (default: http://localhost:11434)

## Agent Architecture
- **MoodInterpreterAgent:** TypeScript class for mood-to-prompt mapping
- **ContentGeneratorAgent:** TypeScript class for Ollama API communication
- **Type Definitions:** Strict interfaces for mood types, prompts, and responses

## Database & Storage
- **Database:** None (stateless application)
- **Local Storage:** Browser localStorage (optional for user preferences)
- **Caching:** None initially (may add prompt caching later)

## Testing & Quality
- **Test Framework:** Vitest + React Testing Library
- **Testing Strategy:** TDD (Test-Driven Development) - Red, Green, Refactor cycle
- **Linting/Formatting:** ESLint + Prettier
- **Type Checking:** TypeScript strict mode
- **Coverage:** Aim for high test coverage on business logic

## Deployment & Infrastructure
- **Development Server:** Vite dev server (fast HMR)
- **Production Build:** Vite build (optimized static site)
- **CI/CD:** GitHub Actions (for linting, type checking, and testing)

## Third-Party Services
- **Authentication:** None (no user accounts)
- **Email:** None
- **Monitoring:** None (privacy-first, no external services)
- **Analytics:** None (privacy-first, no tracking)

## Key Technical Constraints
- **Local-Only:** No external API calls or cloud services
- **Performance Target:** <2 second response time from mood selection to display
- **Privacy:** All processing happens on user's machine
- **Ollama Dependency:** Requires Ollama installed and running locally
