# AI Development Rules for Gabinete Digital

This document outlines the rules and conventions for AI-driven development of this project. Following these guidelines ensures consistency, maintainability, and adherence to the established architecture.

## Tech Stack Overview

This project is built with a modern, type-safe, and efficient technology stack:

-   **Framework**: React with Vite for a fast development experience.
-   **Language**: TypeScript for type safety and improved developer experience.
-   **UI Components**: shadcn/ui, providing a set of accessible and composable components.
-   **Styling**: Tailwind CSS for a utility-first styling approach.
-   **Routing**: React Router (`react-router-dom`) for all client-side navigation.
-   **Data Fetching & Caching**: TanStack Query (`@tanstack/react-query`) for managing server state.
-   **Forms**: React Hook Form (`react-hook-form`) for performance and validation, paired with Zod for schema definition.
-   **Icons**: Lucide React (`lucide-react`) for a consistent and clean icon set.
-   **Backend & Database**: Supabase for authentication, database, and serverless functions.

## Library Usage Rules

To maintain a clean and predictable codebase, please adhere to the following library usage rules:

1.  **UI Components**:
    -   **ALWAYS** use components from the `shadcn/ui` library (`@/components/ui/*`).
    -   **DO NOT** install new component libraries (e.g., Material UI, Ant Design).
    -   If a `shadcn/ui` component needs custom functionality, create a new component that wraps it. Do not modify the base `shadcn/ui` files directly.

2.  **Styling**:
    -   **ALWAYS** use Tailwind CSS utility classes for styling.
    -   **AVOID** writing custom CSS in `.css` files unless absolutely necessary for global styles or complex animations not achievable with Tailwind.
    -   Use `clsx` and `tailwind-merge` (via the provided `cn` utility) to conditionally apply classes.

3.  **Routing**:
    -   **ONLY** use `react-router-dom` for all routing and navigation.
    -   Define all application routes within `src/App.tsx`.
    -   Use the `NavLink` component for navigation links to get active styling.

4.  **Data Fetching**:
    -   **ALWAYS** use `TanStack Query` for fetching, caching, and synchronizing data with the backend.
    -   Use `useQuery` for data retrieval and `useMutation` for data creation, updates, or deletion.
    -   **DO NOT** use `useEffect` with `fetch` or `axios` for server-state management.

5.  **State Management**:
    -   For local component state, use React's built-in hooks (`useState`, `useReducer`).
    -   For cross-component state, prefer lifting state up or using React Context for simple cases.
    -   **DO NOT** introduce a global state management library (like Redux or Zustand) without explicit instruction.

6.  **Forms**:
    -   **ALWAYS** use `React Hook Form` for managing form state and submission.
    -   **ALWAYS** use `Zod` to define validation schemas and integrate it with `React Hook Form` using `@hookform/resolvers`.

7.  **Icons**:
    -   **ONLY** use icons from the `lucide-react` package. This ensures visual consistency.

8.  **Backend Interaction**:
    -   **ALWAYS** interact with the Supabase backend using the pre-configured Supabase client found at `src/integrations/supabase/client.ts`.
    -   Use the generated types from `src/integrations/supabase/types.ts` for type-safe database queries.