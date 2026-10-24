# SatyaLens (सत्य Lens)
### Production-Ready Indian News Fact-Checking & Bias Aggregator

> **Inspect Indian media coverage across Left, Center, and Right wings simultaneously. Powered by Google Gemini 1.5 Flash, Google News RSS, and FastAPI.**

---

## 🌟 Overview & Key Features

1. **ChatGPT-Style Dark Homepage**:
   - Clean, centered input inspired by conversational AI interfaces (`bg-zinc-950 text-zinc-100`).
   - Trending Indian news suggestion chips (*"Supreme Court electoral bonds"*, *"ISRO Gaganyaan mission"*, *"Union Budget 2025"*, *"Waqf Amendment Bill"*, *"Farmers MSP protests"*).

2. **New Search `+` Action**:
   - Prominent `+ New Search` button situated above the results view and in the top bar.
   - Clears results smoothly without reloading the page, transitioning back to the centered hero search box.

3. **Multi-Wing 4-Column Perspective Grid**:
   - **Left Wing** (e.g., The Wire, Scroll, The Quint, Maktoob Media, NewsClick, Caravan, Newslaundry)
   - **Center / Neutral** (e.g., The Hindu, Indian Express, Times of India, Hindustan Times, Mint, PTI, LiveLaw)
   - **Right Wing** (e.g., OpIndia, Swarajya, Republic World, Organiser, Firstpost, Zee News, ANI, DailyO)
   - **Unclassified Sources** (Regional dailies, independent blogs, and international coverage)

4. **Live On-the-Fly Reclassification**:
   - Every article card displays an interactive **Classification Badge Dropdown**.
   - Users or editors can change an outlet's wing on the fly (e.g., Unclassified ➔ Center/Right/Left).
   - Updates persist immediately to the database and re-organize the stream in real-time.

5. **AI Perspective Comparison Summary (Gemini 1.5 Flash)**:
   - **Query Expansion**: Extracts key entities from natural user headlines into 2-3 optimal Google News queries.
   - **Framing Discrepancy Breakdown**: Compares Left vs Center vs Right editorial spins.
   - **Core Fact Consensus**: Highlights indisputable verified facts agreed across all wings.
   - **Fallback Domain Classifier**: Analyzes article snippet editorial tone when an outlet is not yet classified.

6. **Authentication & Bookmarks**:
   - Email & Password registration and authentication with Bcrypt password hashing.
   - Stateless JWT tokens.
   - Protected client-side routing.
   - 1-Click Instant Demo login for rapid evaluation.
   - Personal bookmarking of articles with dedicated `/bookmarks` view.

---

## 🏗 Tech Stack & Zero-Cost Architecture

| Layer | Technology | Cost / Free Tier |
|---|---|---|
| **Frontend** | Next.js 14 (App Router, Tailwind CSS, Lucide Icons) | Free on Vercel |
| **Backend** | FastAPI (Python 3.11+), SQLAlchemy, Pydantic v2 | Free on Render / Railway / Fly.io |
| **Database** | SQLite (Local/Docker) or PostgreSQL (Supabase / Neon) | 100% Free |
| **Cache** | Redis or In-Memory TTL Fallback | Built-in zero cost |
| **AI Model** | Google Gemini 1.5 Flash via `google-generativeai` | Free Tier API key (<200ms prompts) |
| **News Feed** | Google News RSS (`hl=en-IN&gl=IN&ceid=IN:en`) via `feedparser` | 100% Free, no keys required |

---

## 🚀 Quick Start

### Option 1: Docker Compose (1 Command)
```bash
docker compose up --build
```
- Frontend: `http://localhost:3000`
- Backend API: `http://localhost:8000`
- Swagger Docs: `http://localhost:8000/docs`

---

### Option 2: Automated Local Setup Script
```bash
chmod +x setup.sh
./setup.sh
```
To also launch both backend and frontend servers automatically:
```bash
./setup.sh --start
```

---

### Option 3: Manual Step-by-Step

#### 1. Backend Setup:
```bash
cd backend
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt

# Run server (initializes SQLite DB and seeds 50+ publications automatically)
uvicorn app.main:app --reload --port 8000
```

#### 2. Frontend Setup:
```bash
cd frontend
npm install
npm run dev
```

Visit `http://localhost:3000`.

---

## 🔑 Environment Configuration

Create a `.env` file in the project root or configure directly:

```env
# Google Gemini API Key (Optional - graceful heuristic fallbacks enabled if empty)
GEMINI_API_KEY=your_gemini_api_key_here
GEMINI_MODEL=gemini-1.5-flash

# JWT Security
JWT_SECRET=super_secret_jwt_key_satyalens_change_in_production_2025
ACCESS_TOKEN_EXPIRE_MINUTES=10080

# Database Persistence
DATABASE_URL=sqlite:///./satyalens.db

# Redis Cache (Optional - automatic in-memory fallback if omitted)
REDIS_URL=redis://localhost:6379/0

# Frontend API Target
NEXT_PUBLIC_API_URL=http://localhost:8000
```

---

## 📡 API Reference

### 1. News & AI Analysis
- `GET /api/news/search?q={query}`: Aggregates, deduplicates, classifies, and generates Gemini comparative summary.

### 2. Domain Classifications (Hardcoded Developer Directory)
- `GET /api/classifications`: List all 50+ mapped publications with optional `?wing=LEFT|CENTER|RIGHT|UNCLASSIFIED` filter.
- *Note*: Publisher classifications are strictly hardcoded by developers to maintain objectivity and prevent user tampering. The directory is read-only.

### 3. Authentication
- `POST /api/auth/register`: Register new account with email & password.
- `POST /api/auth/login`: Authenticate and receive JWT token.
- `GET /api/auth/me`: Retrieve current user profile.

### 4. Bookmarks & History
- `GET /api/bookmarks`: Get saved articles for logged-in user.
- `POST /api/bookmarks`: Save an article.
- `DELETE /api/bookmarks/{id}`: Delete bookmark.
- `GET /api/history`: Retrieve recent search history.
- `DELETE /api/history`: Clear search history.

---

## 🛡 Pre-Seeded Indian News Outlets (50+)

- **Left-Wing**: *The Wire*, *Scroll.in*, *The Quint*, *Maktoob Media*, *NewsClick*, *Newslaundry*, *National Herald*, *The Caravan*, *Article 14*, *Alt News*, *The Federal*, *Countercurrents*.
- **Center / Neutral**: *The Hindu*, *The Indian Express*, *Times of India*, *Hindustan Times*, *Mint*, *PTI*, *ThePrint*, *Deccan Herald*, *The Tribune*, *Business Standard*, *The Economic Times*, *NDTV*, *India Today*, *The Statesman*, *New Indian Express*, *The Telegraph*, *LiveLaw*, *Bar & Bench*, *Supreme Court Observer*, *The South First*, *Moneycontrol*, *Dainik Bhaskar*, *Amar Ujala*.
- **Right-Wing**: *OpIndia*, *Swarajya*, *Republic World*, *Organiser*, *Firstpost*, *Zee News*, *ANI News*, *News18*, *Panchjanya*, *DNA India*, *ABP Live*, *WION*, *DailyO*, *NewsX*, *Dainik Jagran*, *LawBeat*.
