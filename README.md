# 📸 Sapientia — AI Camera Store (Student Project)

> **Summer 2026 Research Project**  
> Built by students at Rangsit University (RSU / RIC).  
> An experimental e-commerce camera shop powered by Next.js and Google Gemini with RAG.

---

## 👋 Hey there! Welcome to Sapientia

Have you ever tried buying a camera and felt completely overwhelmed by all the numbers? *Full-frame vs APS-C, sensor crop factors, 4K 60p vs 10-bit color, autofocus tracking points...* It's a lot.

We built **Sapientia** for our research project to explore how modern generative AI can make camera shopping way less intimidating. Instead of scrolling through endless spec sheets, shoppers can just talk to an AI assistant that actually knows photography and knows what's in our store. 

On the other side, we wanted to build an admin dashboard that listens to these conversations in real-time, extracts customer sentiment, tracks what camera brands people are asking for, and figures out what's trending.

---

## 💡 What Can It Do?

### 1. 🛍️ The Storefront
- **Browse Cameras**: Filter through Mirrorless, DSLRs, lenses, and cinema gear.
- **Real Tech Specs**: Every camera has a detail page showing sensor specs, ISO, battery, weight, and video capabilities.
- **Bilingual (English & Thai 🇹🇭)**: Switch between English and Thai anytime — the UI and the AI assistant both speak both languages!
- **Dark Mode**: Because every student project needs dark mode.

### 2. 🤖 The AI Assistant ("Sapientia Guide")
- **Powered by Google Gemini**: Uses `gemini-3.1-flash-lite` for super snappy responses.
- **RAG (Retrieval-Augmented Generation)**: Uses `gemini-embedding-001` and cosine similarity to match customer questions with actual camera hardware from our database.
- **Inventory-First**: The bot always tells you what we have in stock (`[Available in Shop]`) before comparing other gear.
- **Fun Guardrails**:
  - If you ask something totally unrelated (like how to make noodles or do your math homework), it gently roasts you and brings you back to cameras.
  - If you ask about a made-up camera (like a "Sony A69420"), it politely tells you that model doesn't exist and suggests real ones.

### 3. 📊 Admin & AI Analytics
- **Live Sales Dashboard**: Track monthly revenue, active orders, and sales trends.
- **Conversation Insights**: An AI background worker automatically reads chat logs, categorizes customer mood (Happy 😄 / Neutral 😐 / Frustrated 😤), and tallies brand mentions.
- **Trending Cameras Score**: Uses our custom formula ($0.7 \times \text{User Mentions} + 0.3 \times \text{AI Suggestions}$) to rank which cameras are hot.
- **Easy Inventory Management**: Update stock counts, change Thai Baht prices, and upload new camera photos straight from the browser.

---

## 🛠️ Tech Stack (What We Used)

We wanted to experiment with the newest tools available in 2026:

- **Frontend & Backend**: [Next.js 16](https://nextjs.org/) (App Router, Server Components) + [React 19](https://react.dev/)
- **Styling**: [Tailwind CSS v4](https://tailwindcss.com/)
- **AI & Embeddings**: [Google Generative AI SDK](https://ai.google.dev/) (`gemini-3.1-flash-lite-preview` + `gemini-embedding-001`)
- **Authentication**: [Clerk](https://clerk.com/) (handles sign-in, user accounts, and admin roles so we didn't have to build auth from scratch)
- **Database / Storage**:
  - Local JSON files (`cameras.json`, `inventory.json`, `embeddings.json`) for catalog & vector cache.
  - [Vercel KV](https://vercel.com/docs/storage/vercel-kv) (Redis) for live orders and AI analytics telemetry.
- **Charts & Animations**: [Recharts](https://recharts.org/) and [Framer Motion](https://www.framer.com/motion/)

---

## 🚀 How to Run It on Your Machine

### Prerequisites
- Node.js (v20 or higher)
- A free [Google Gemini API Key](https://aistudio.google.com/app/apikey)
- A free [Clerk](https://clerk.com) account (for login)
- A [Vercel KV](https://vercel.com/docs/storage/vercel-kv) instance (or free Upstash Redis)

### Quick Setup

1. **Clone the repo**:
   ```bash
   git clone https://github.com/your-username/sapientia.git
   cd sapientia
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Set up your environment variables**:
   Copy our example file to `.env.local`:
   ```bash
   cp .env.example .env.local
   ```
   Open `.env.local` and paste in your Gemini API key, Clerk keys, and Vercel KV URLs.

4. **Start the dev server**:
   ```bash
   npm run dev
   ```
   Now open [http://localhost:3000](http://localhost:3000) in your browser and you're good to go! 🎉

---

## 💻 Helpful Scripts We Made

In the `scripts/` folder, we wrote some handy TypeScript tools:

```bash
# Test if your Gemini API key is working
npx ts-node scripts/test-ai.ts

# Generate fresh vector embeddings for cameras (2016 onwards)
npx ts-node scripts/generate-embeddings.ts

# Create 30 days of realistic dummy chat data to test the charts
npx ts-node scripts/seed-analytics.ts

# Sync camera specs from RapidAPI
npx ts-node scripts/sync-cameras.ts
```

---

## 📁 How the Code is Organized

Here's a quick tour of what's where:

```text
Sapientia/
├── docs/                        # Detailed guides and project notes
│   ├── ARCHITECTURE.md          # How the system is designed
│   ├── AI_SYSTEM.md             # How the Gemini bot & RAG work
│   ├── API_REFERENCE.md         # All the backend API endpoints
│   ├── ADMIN_GUIDE.md           # How to use the admin panel
│   ├── DATA_MODELS.md           # What our data looks like
│   └── SCRIPTS_AND_TOOLING.md   # Notes on our maintenance scripts
├── public/                      # Static pictures and uploaded camera photos
├── scripts/                     # Helpful CLI scripts for embeddings & data
├── src/
│   ├── app/                     # Next.js pages and API routes
│   │   ├── admin/               # Admin pages (dashboard, inventory, AI analytics)
│   │   ├── api/                 # API endpoints (chat, inventory, reset, seed)
│   │   ├── product/[id]/        # Camera detail page
│   │   ├── search/              # Search results page
│   │   └── page.tsx             # Storefront homepage
│   ├── components/              # Reusable React components
│   │   ├── admin/               # Charts and tables for admin
│   │   ├── home/                # Hero banner, scroller, categories
│   │   └── layout/              # Navbar, footer, chat popup
│   ├── data/                    # JSON databases (cameras, inventory, orders)
│   └── lib/                     # Helper functions, Gemini setup, data loaders
└── .env.example                 # Template for your environment keys
```

---

## 🔐 Getting into the Admin Panel

The admin panel lives at `/admin`. To try it out:
1. Sign in with your Clerk account.
2. Add your email address to the `ADMIN_EMAILS` list inside `src/lib/config.ts`.
3. Refresh the page, and you'll have full admin access!

---

## 📖 Want to Learn More?

We wrote detailed writeups for different parts of the project inside the [`docs/`](docs/) folder:

- [**System Architecture**](docs/ARCHITECTURE.md) — How the frontend, server, and storage talk to each other.
- [**AI & RAG System**](docs/AI_SYSTEM.md) — How our prompts, vector search, and sentiment extraction work.
- [**API Reference**](docs/API_REFERENCE.md) — The endpoints we built for chat, inventory, and resetting data.
- [**Admin Guide**](docs/ADMIN_GUIDE.md) — How to use the dashboard, upload photos, and read the analytics.
- [**Data Models**](docs/DATA_MODELS.md) — The TypeScript types and JSON schemas.
- [**Scripts & Tooling**](docs/SCRIPTS_AND_TOOLING.md) — How to run the background scripts.

---

## 🎓 The Team & Acknowledgments

Created as part of our 2026 university research work at **Rangsit University (RSU / RIC)**.  
Big thanks to our advisors and classmates for testing the chatbot and giving feedback!

*Feel free to star the repo or use our RAG setup for your own projects!* ⭐
