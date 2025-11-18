# Daily Inspirational Assistant

A local-first web application that provides personalized, AI-generated inspirational content based on your current mood. Built with privacy in mind using Ollama for local AI processing.

## Features

- 🎯 Mood-based inspiration generation
- 🔒 100% local processing (privacy-first)
- ⚡ Fast, optimized with Vite + React + TypeScript
- 🎨 Beautiful UI with Tailwind CSS
- ✅ Test-driven development with Vitest
- 🐳 Docker support

## Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** (v20 or higher)
- **npm** (comes with Node.js)
- **Ollama** (for AI generation - [Install Ollama](https://ollama.ai))
- **Docker** (optional, for containerized development)

## Getting Started

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd daily-inspirational-assistant
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env
   ```

4. **Run the development server**
   ```bash
   npm run dev
   ```

   The app will be available at `http://localhost:5173`

### Docker Development

Run the application in Docker with hot reload:

```bash
docker-compose up
```

## Available Scripts

| Script | Description |
|--------|-------------|
| `npm run dev` | Start development server with hot reload |
| `npm run build` | Build for production (TypeScript compilation + Vite build) |
| `npm run preview` | Preview production build locally |
| `npm run test` | Run tests in watch mode |
| `npm run test:watch` | Explicitly run tests in watch mode |
| `npm run test:coverage` | Run tests with coverage report |
| `npm run lint` | Run ESLint to check code quality |
| `npm run format` | Format code with Prettier |

## Project Structure

```
daily-inspirational-assistant/
├── src/
│   ├── components/       # React components
│   ├── services/         # API and business logic services
│   ├── agents/           # AI agents (MoodInterpreter, ContentGenerator)
│   ├── types/            # TypeScript type definitions
│   ├── hooks/            # Custom React hooks
│   ├── utils/            # Utility functions
│   ├── test/             # Test utilities and setup
│   ├── App.tsx           # Main application component
│   ├── main.tsx          # Application entry point
│   └── index.css         # Global styles (Tailwind directives)
├── agent-os/             # Agent-OS framework files
├── .github/workflows/    # GitHub Actions CI/CD
├── public/               # Static assets
├── Dockerfile            # Production Docker image
├── docker-compose.yml    # Development Docker setup
└── Configuration files (tsconfig, vite.config, etc.)
```

## Technology Stack

- **Framework**: Vite + React 18+ with TypeScript
- **Styling**: Tailwind CSS (utility-first)
- **Testing**: Vitest + React Testing Library
- **Linting**: ESLint with TypeScript rules
- **Formatting**: Prettier
- **Pre-commit Hooks**: Husky + lint-staged
- **AI Runtime**: Ollama (local LLM)
- **Containerization**: Docker + Docker Compose

## Development Workflow - Test-Driven Development (TDD)

This project follows strict TDD practices using the **Red-Green-Refactor** cycle:

1. **Red**: Write a failing test that defines desired behavior
2. **Green**: Write minimal code to make the test pass
3. **Refactor**: Improve code quality while keeping tests green

**Always write tests before implementation.**

### Code Quality & Pre-commit Hooks

The project uses Husky to run checks before each commit:
- **ESLint**: Linting
- **Prettier**: Code formatting
- **TypeScript**: Type checking

These run automatically on staged files.

## Environment Variables

Environment variables must be prefixed with `VITE_` to be accessible:

- `VITE_API_URL`: Ollama API endpoint (default: `http://localhost:11434`)
- `NODE_ENV`: Environment mode (`development` or `production`)

See `.env.example` for the complete list.

## Testing

- **Framework**: Vitest with jsdom environment
- **Library**: React Testing Library
- **Coverage**: 80% threshold for all metrics
- Test files: `*.test.ts` or `*.test.tsx`

```bash
npm run test              # Watch mode
npm run test:coverage     # With coverage report
```

## CI/CD

GitHub Actions automatically run on PRs and pushes to main:
1. Install dependencies
2. Run linter
3. Run type checking
4. Run tests with coverage

## Contributing

1. Follow TDD: write tests first
2. Ensure all tests pass
3. Run linting and formatting
4. Pre-commit hooks will validate your changes

---

## React + TypeScript + Vite Technical Notes

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Babel](https://babeljs.io/) (or [oxc](https://oxc.rs) when used in [rolldown-vite](https://vite.dev/guide/rolldown)) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the ESLint configuration

If you are developing a production application, we recommend updating the configuration to enable type-aware lint rules:

```js
export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      // Other configs...

      // Remove tseslint.configs.recommended and replace with this
      tseslint.configs.recommendedTypeChecked,
      // Alternatively, use this for stricter rules
      tseslint.configs.strictTypeChecked,
      // Optionally, add this for stylistic rules
      tseslint.configs.stylisticTypeChecked,

      // Other configs...
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
])
```

You can also install [eslint-plugin-react-x](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-x) and [eslint-plugin-react-dom](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-dom) for React-specific lint rules:

```js
// eslint.config.js
import reactX from 'eslint-plugin-react-x'
import reactDom from 'eslint-plugin-react-dom'

export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      // Other configs...
      // Enable lint rules for React
      reactX.configs['recommended-typescript'],
      // Enable lint rules for React DOM
      reactDom.configs.recommended,
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
])
```
