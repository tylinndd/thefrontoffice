# PROJECT: "The Syndicate" - Quantitative NBA Betting Suite

## 1. Project Objective
**The Front Office** is a high-performance analytics platform designed for sports betting professionals. The application functions as a "Quantitative Hedge Fund" for NBA betting, utilizing machine learning and historical data to identify market inefficiencies and calculate the true probability of player props and parlays.

## 2. Technical Stack
- **Frontend:** React (Vite), Tailwind CSS, Recharts, Lucide-React.
- **Backend:** Python (FastAPI), `nba_api` (Historical data), `The Odds API` (Real-time market lines).
- **Database & Auth:** **Supabase** (PostgreSQL + pgvector for similarity search + Supabase Auth).
- **AI Integration:** Dynamic generation of The Front Office brand assets.
    - **LLM (Gemini):** Natural Language Querying (NLQ) for trend analysis.

## 3. Core Features & System Logic

### 3.1 Syndicate Onboarding & Identity
- **Branding:** Users define a "Team Name" upon registration.
- **AI Asset Generation:** Users provide a description (e.g., "A minimalist gold phoenix, luxury sports style") which triggers the Gemini API to generate a unique logo.
- **Persistence:** Logos are stored in Supabase Storage and associated with the user’s executive profile.

### 3.2 The "Edge" Discovery Feed
- **Objective:** Surface bets where the AI model disagrees most with the Vegas line.
- **Algorithm:** - Fetch current player props from **The Odds API**.
    - Backend generates an "Expected Value" (EV) by running a regression model on the player’s last 15 games, opponent defensive efficiency, and rest days via **nba_api**.
    - Display results sorted by "Probability Edge" (the delta between model projection and market price).

### 3.3 Manual Bet Analyzer Dashboard
- **Function:** A dedicated interface where users input any bet found on external apps (FanDuel, DraftKings, etc.).
- **Inputs:** Player, Category (PTS/REB/AST/3PM), Line (e.g., 22.5), Direction (Over/Under).
- **Output:** Instant calculation of "Historical Hit Rate" and "Projected Confidence Score."
- **Persistence:** Users can click "Add to Syndicate Parlay" to save the leg to a pending session.

### 3.4 Parlay Probability Simulator
- **Logic:** Unlike standard calculators, this simulates the joint probability of multiple legs while accounting for correlation (e.g., adjusting probabilities if two players on the same team are both projected for "Overs").
- **Success Metrics:** Visualizes the "Simulated Win Chance" vs. "Implied Market Odds."

### 3.5 Performance & ROI Tracker
- **Tracking:** Visualizes the "Net Worth" of the Syndicate based on the success of placed bets.
- **Analytics:** Recharts-driven graphs showing win/loss trends and model accuracy over time.

## 4. UI/UX Design Specifications
The interface should feel like a premium, modern financial terminal.

- **Visual Theme:** - **Background:** Clean White (`#FFFFFF`).
    - **Typography:** **Geist Font** (Sans-serif) for all UI elements.
    - **Accents:** Emerald Green (`#10B981`) for positive EV/Success, Slate Gray (`#334155`) for primary text, and Subtle Bordering (`#E2E8F0`).
- **Layout (Section 8.1 Ref):**
    - **Framework:** React (Vite) for ultra-fast HMR.
    - **Styling:** Tailwind CSS for utility-first responsive design.
    - **Navigation:** React Router for seamless transitions between the Dashboard, Analyzer, and ROI Tracker.
    - **Visualizations:** Recharts for data-heavy player performance and probability gauges.
    - **Iconography:** Lucide React for consistent, lightweight executive icons.

## 5. Implementation Roadmap
1. **Infrastructure:** Initialize Supabase project with `profiles`, `bets`, and `parlays` tables.
2. **Data Pipeline:** Create `nba_api` wrapper to fetch and cache player game logs in Postgres.
3. **Probability Engine:** Build the FastAPI service to calculate hit rates and edge percentages.
4. **Dashboard Build:** Construct the "Syndicate" main feed and the Manual Analyzer tool.
5. **AI Integration:** Implement DALL-E logo generation and the NLQ chat interface.

 

## 8. Documentation Links 

 

### 8.1 Frontend 

- **React**: [react.dev](https://react.dev) 

- **Vite**: [vite.dev/guide](https://vite.dev/guide/) 

- **Tailwind CSS**: [tailwindcss.com/docs](https://tailwindcss.com/docs) 

- **React Router**: [reactrouter.com](https://reactrouter.com/) 

- **Recharts**: [recharts.org/en-US/api](https://recharts.org/en-US/api) 

- **Lucide React**: [lucide.dev/guide/packages/lucide-react](https://lucide.dev/guide/packages/lucide-react) 

 

### 8.2 Backend 

- **Python**: [docs.python.org/3](https://docs.python.org/3/) 

- **FastAPI**: [fastapi.tiangolo.com](https://fastapi.tiangolo.com/) 

- **Uvicorn**: [www.uvicorn.org](https://www.uvicorn.org/) 

- **nba_api**: [github.com/swar/nba_api](https://github.com/swar/nba_api) 

- **Scikit-learn**: [scikit-learn.org/stable/user_guide.html](https://scikit-learn.org/stable/user_guide.html) 

- **Pandas**: [pandas.pydata.org/docs](https://pandas.pydata.org/docs/) 

- **NumPy**: [numpy.org/doc](https://numpy.org/doc/) 

- **OddsAPI**: [the-odds-api.com/liveapi/guides/v4/](https://the-odds-api.com/liveapi/guides/v4/)

 

### 8.3 Database 

- **Supabase**: [supabase.com/docs](https://supabase.com/docs) 

- **Supabase Python Client**: [supabase.com/docs/reference/python/introduction](https://supabase.com/docs/reference/python/introduction) 

- **pgvector**: [github.com/pgvector/pgvector](https://github.com/pgvector/pgvector) 

- **PostgreSQL**: [www.postgresql.org/docs](https://www.postgresql.org/docs/) 

 

### 8.4 AI / LLM 

- **OpenAI API**: [platform.openai.com/docs](https://platform.openai.com/docs) 

- **Google Gemini**: [ai.google.dev/gemini-api/docs](https://ai.google.dev/gemini-api/docs) 