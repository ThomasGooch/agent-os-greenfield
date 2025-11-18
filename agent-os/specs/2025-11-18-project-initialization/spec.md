# Specification: Project Initialization

## Goal
Set up a complete Vite + React + TypeScript development environment with testing, linting, Docker, and CI/CD to provide a solid foundation for building the Daily Inspirational Assistant.

## User Stories
- As a developer, I want a fully configured TypeScript project so I can write type-safe code from day one
- As a developer, I want TDD tooling set up so I can follow red-green-refactor workflow immediately

## Specific Requirements

**Vite Project Setup**
- Initialize project with `npm create vite@latest` using React + TypeScript template
- Configure package.json with scripts: dev, build, preview, test, test:watch, test:coverage, lint, format
- Set up .gitignore for node_modules/, dist/, .env, coverage/

**TypeScript Configuration**
- Enable strict mode in tsconfig.json
- Configure path aliases: `@/` maps to `src/`
- Set target to ES2020 or higher
- Enable JSX preservation for React
- Configure separate tsconfig for tests if needed

**Folder Structure**
- Create `src/components/` for React components
- Create `src/services/` for API and business logic services
- Create `src/agents/` for MoodInterpreterAgent and ContentGeneratorAgent
- Create `src/types/` for TypeScript type definitions and interfaces
- Create `src/hooks/` for custom React hooks
- Create `src/utils/` for utility functions and helpers

**Tailwind CSS Integration**
- Install tailwindcss, postcss, autoprefixer
- Create tailwind.config.js with default theme
- Create postcss.config.js
- Add Tailwind directives to main CSS file
- Configure content paths to scan src/ directory

**Vitest + React Testing Library**
- Install vitest, @testing-library/react, @testing-library/jest-dom, jsdom
- Create vitest.config.ts with jsdom environment
- Configure coverage reporting with thresholds (statements: 80%, branches: 80%, functions: 80%, lines: 80%)
- Set up test utilities file with custom render function
- Create example test file to verify setup works

**ESLint Configuration**
- Install eslint, @typescript-eslint/parser, @typescript-eslint/eslint-plugin
- Install eslint-plugin-react, eslint-plugin-react-hooks
- Create .eslintrc.json with recommended React + TypeScript rules
- Configure to work with Prettier (no formatting conflicts)

**Prettier Configuration**
- Install prettier, eslint-config-prettier
- Create .prettierrc with standard config (semi: true, singleQuote: true, trailingComma: 'es5')
- Create .prettierignore for dist/, coverage/, node_modules/

**Docker Setup**
- Create Dockerfile for production builds
- Create docker-compose.yml for development with hot reload
- Mount src/ as volume for live code updates
- Expose appropriate ports (default: 5173 for Vite)
- Include NODE_ENV environment variable handling

**GitHub Actions CI/CD**
- Create .github/workflows/ci.yml
- Run on pull requests and pushes to main branch
- Jobs: install dependencies, run linter, run type checking, run tests with coverage
- Configure caching for node_modules to speed up builds

**Pre-commit Hooks**
- Install husky and lint-staged
- Configure husky pre-commit hook
- Configure lint-staged to run ESLint and Prettier on staged files
- Run TypeScript type checking on commit

**Environment Variables**
- Create .env.example with template variables (VITE_API_URL, etc.)
- Document environment variable naming convention (VITE_ prefix)
- Add .env to .gitignore

**Basic Application Shell**
- Create minimal App.tsx with "Hello World" text
- Create main.tsx entry point
- Create index.html with proper meta tags
- Add basic global styles with Tailwind

**Documentation**
- Create comprehensive README.md with setup instructions
- Document all npm scripts and their purposes
- Include Docker usage instructions
- Document folder structure and conventions
- Add contributing guidelines for TDD workflow

## Visual Design

No visual assets provided.

## Existing Code to Leverage

No existing code to leverage - greenfield implementation.

## Out of Scope
- Application features (mood selection, Ollama integration, etc.)
- Custom UI components beyond basic Hello World
- Authentication or user management
- Database setup or ORM configuration
- Deployment to production hosting
- Advanced Docker orchestration (Kubernetes, etc.)
- Integration testing infrastructure beyond unit/component tests
- Performance monitoring or error tracking services
- Internationalization (i18n) setup
