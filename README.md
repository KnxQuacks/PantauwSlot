<div align="center">
  <h1>🌟 JKT48 Slot Tracker (Pantauw Slot)</h1>
  <p>A modern, high-performance web application designed to track JKT48 2-Shot and Meet & Greet ticket slot availability in real-time.</p>
</div>

---

Built with an Apple-inspired glassmorphism UI, this tracker features a dual-engine architecture to ensure users can always see data even during high-traffic "Ticket Wars" when the official site is down or stuck in a Cloudflare Waiting Room.

## ✨ Features

- **Modern UI/UX**: Clean, premium Apple-style design with glassmorphism effects, dynamic gradients, and smooth skeleton loaders.
- **Dual-Engine Architecture (High Availability)**:
  - **Primary**: Fetches data instantly from the official JKT48 API via a secure Vercel proxy.
  - **Fallback**: Automatically detects if JKT48 is down or in "Waiting Room" mode and falls back to a **Supabase** cache database without crashing.
- **Advanced Anti-Scraping Security**: Uses Vercel Edge Middleware to protect the proxy endpoint. Blocks unauthorized cURL, Postman, and VPS bots using custom headers (`x-pantauw-auth`), Referer checks, and Origin validation.
- **Image Hotlink Bypass**: Automatically spoofs `Referer` headers for member photos to bypass JKT48's image hotlinking protection (`403 Forbidden`).
- **Session Grouping & Pin Oshi**: Organize members by session times and pin your favorite "Oshi" to the top of the list for faster tracking during ticket wars.

## 🚀 Tech Stack

- **Frontend**: React 18, TypeScript, Vite, Tailwind CSS
- **Backend/Hosting**: Vercel (Static Hosting + Edge Middleware + Rewrites)
- **Database (Cache)**: Supabase (PostgreSQL)
- **Automation**: cron-job.org (Triggers `/api/sync` to update Supabase)

## 🛠️ Environment Variables

To run this project locally or deploy it to Vercel, you need to configure the following environment variables in a `.env` file:

```env
# Supabase Configuration
VITE_SUPABASE_URL=https://<your-project>.supabase.co
VITE_SUPABASE_ANON_KEY=<your-anon-key>
SUPABASE_SERVICE_ROLE_KEY=<your-service-role-key> # Only used by the /api/sync Vercel function

# Security Configuration
VITE_PANTAUW_SECRET=pantauw-secure-v1-9982 # Used by frontend and Edge Middleware to authenticate requests
```

## 💻 Local Development

1. **Clone the repository**
2. **Install dependencies**:
   ```bash
   npm install
   ```
3. **Run the development server**:
   ```bash
   npm run dev
   ```
4. Access the app at `http://localhost:5173`. 
*(Note: Locally, Vite's `vite.config.ts` handles the API proxy. In production, `vercel.json` handles it).*

## ☁️ Deployment (Vercel)

This application is optimized for Vercel. 
1. Push your code to GitHub.
2. Import the project in Vercel.
3. Add the environment variables in the Vercel Dashboard.
4. Deploy!

### Setting up the Cron Job
Vercel Hobby plan only allows 1 cron job per day. To keep the Supabase database synced every 2 minutes:
1. Create a free account on [cron-job.org](https://cron-job.org).
2. Create a new cron job pointing to `https://<your-domain>.vercel.app/api/sync`.
3. Set the schedule to run every 2 to 5 minutes.

## 🛡️ Architecture & Security
- **`vercel.json`**: Rewrites `/api/v1/*` to `https://jkt48.com/api/v1/*` to bypass CORS.
- **`middleware.ts`**: Intercepts requests to the proxy. If `x-pantauw-auth` is missing or the Origin is wrong, it returns a 403 Forbidden. If it's an image request (`.jpg`), it injects a fake JKT48 referer.
- **`api/sync.ts`**: A Vercel Serverless Function that hits the JKT48 API and updates the Supabase database `jkt48_slots` table.
