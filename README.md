# CRM Frontend

This repository contains the React interface of the CRM built with Vite. It uses Supabase for data access and communicates with a backend API.

## Prerequisites
- Node.js 18 or newer

## Setup

1. Install dependencies:
   ```bash
   npm install
   ```
2. Copy `.env.example` to `.env.local` and fill in the environment variables.
3. Start the development server:
   ```bash
   npm run dev
   ```

The `.env.local` file stores variables like `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`, and `VITE_BACKEND_API_URL` that originate from `.env.example`.
