# Painel CRM React

This project is a small CRM panel built with [React](https://react.dev/) and [Vite](https://vitejs.dev/). It connects to Supabase to fetch and broadcast chat messages and interacts with a backend API for clinic configuration.

## Required environment variables
Create a `.env.local` file in the project root with the following entries:

```bash
VITE_SUPABASE_URL=<your-supabase-url>
VITE_SUPABASE_ANON_KEY=<your-supabase-anon-key>
VITE_BACKEND_API_URL=<backend-base-url>
```

## Development
Install dependencies and start the development server:

```bash
npm install
npm run dev
```

Open the printed local URL in your browser to see the application running.

## Deployment
The app expects a backend that exposes endpoints used by `Settings.jsx` and broadcasts chat messages via Supabase. For details about the backend implementation see the corresponding backend repository or deployment documentation.
