# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Build Commands
- `npm run dev` - Start development server
- `npm run build` - Build for production (runs TypeScript compiler then Vite build)
- `npm run lint` - Run ESLint for code quality checks
- `npm run preview` - Preview production build locally

## Code Style Guidelines
- **TypeScript**: Use strict type checking. Explicit typing for props, state, and functions.
- **Components**: React functional components with explicit type annotations (React.FC<Props>).
- **Imports**: Group imports - React first, then libraries, then local components/utilities.
- **Error Handling**: Use try/catch blocks with specific error typing (error: any) when possible.
- **Naming**: PascalCase for components, camelCase for functions/variables, ALL_CAPS for constants.
- **Formatting**: Semi-colons required, 2-space indentation, explicit return types.
- **CSS**: Use Tailwind utility classes for styling with className="" attribute.
- **API**: Use the common request utilities from src/common/api.tsx for all API calls.
- **State Management**: Redux for global state, local state with useState for component-level state.