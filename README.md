# React + Vite

This project uses Vite with React. The default configuration provides hot module reloading and a basic ESLint setup.

## Development setup

1. Install dependencies:
   ```bash
   npm install
   ```
2. Copy `.env.example` to `.env.local` and set the values for the environment variables.
3. Start the development server:
   ```bash
   npm run dev
   ```

## Environment variables

The application expects the following variables. See `.env.example` for the template:

- `VITE_SUPABASE_URL` – URL of your Supabase instance.
- `VITE_SUPABASE_ANON_KEY` – Supabase anon API key.
- `VITE_BACKEND_API_URL` – Base URL of the backend API used by the settings page.

Create a `.env.local` file based on the example before running the project.

## Build

To generate a production build run:

```bash
npm run build
```

## Lint

To run ESLint checks locally execute:

```bash
npm run lint
```


