# Portfolio Project Architecture & Developer Guide

Welcome to the comprehensive developer guide for the personal GitHub and Vercel portfolio. This document explains the architecture, directory layout, data pipelines, caching tiers, API integrations, and customization steps.

---

## 1. Directory Structure

The project uses Next.js 16 with the **App Router** for all views, complemented by a dedicated **Pages Router API endpoint** for secure server-side user lookups.

```text
portfolio/
├── .env.example          # Environment variable template
├── .env.local            # Local overrides (GH_TOKEN, VC_TOKEN)
├── data.json             # Central configuration (bio, socials, resume, project filters)
├── package.json          # Dependencies, scripts (Next.js 16, React 19, Tailwind v4)
├── next.config.mjs       # Next.js bundler config, Turbopack, env injection & staleTimes
├── postcss.config.js     # PostCSS styling config
├── tailwind.config.js    # Tailwind theme extensions (keyframes, display font, colors)
├── global.css            # Tailwind CSS v4 import, compatibility layers & text outline
├── resume.tex            # Single-page LaTeX source resume (ATS-friendly)
├── project_guide.md      # This guide
├── project_summary.md    # Executive portfolio and career summary
├── README.md             # Repository entry point and overview
│
├── docs/                 # In-Depth Technical Documentation
│   ├── ARCHITECTURE.md       # RSC boundaries, hybrid routing, caching strategy
│   ├── API_INTEGRATIONS.md   # GitHub REST/GraphQL & Vercel API specifications
│   ├── COMPONENTS.md         # Component catalog, state boundaries & visual specs
│   └── CONFIGURATION.md      # Schema reference, tokens guide & deployment
│
├── public/               # Static assets
│   ├── favicon.ico           # Portfolio favicon
│   ├── Seffin0.1.pdf         # Compiled PDF resume served for direct download
│   ├── fonts/                # Local CalSans font file (CalSans-SemiBold.ttf)
│   └── *.svg                 # Framework branding icons (Astro, Gatsby, Nuxt, Remix, Turbo)
│
├── pages/
│   └── api/
│       └── users/
│           └── [username].js # Pages Router API proxy for GitHub user search
│
└── app/                  # Next.js App Router Root
    ├── layout.jsx        # Root HTML layout, font injection & SEO metadata
    ├── page.jsx          # Homepage (Hero title, bio, activity summary, resume)
    ├── data.js           # Core data-fetching & caching engine
    │
    ├── api/              # API Route Handlers
    │   └── contact/
    │       └── route.js  # Contact form endpoint (Web3Forms, Resend, logging fallback)
    │
    ├── components/       # Shared UI Components
    │   ├── card.jsx           # Reusable styled container card
    │   ├── loading-indicator.jsx # Route change indicator using useLinkStatus
    │   ├── nav.jsx            # Scroll-aware glassmorphic navigation bar
    │   ├── orgs.jsx           # Affiliated organizations resolved via GraphQL
    │   ├── popover.jsx        # Hover tooltip for framework & Turbopack badges
    │   ├── recent-activity.jsx# GitHub 90-day event stream & Copilot PR metrics
    │   ├── resume.jsx         # Visual career experience, education & certifications
    │   ├── search-input.jsx   # Real-time GitHub username lookup input
    │   └── vercel-info.jsx    # Vercel deployment status & framework upgrade badges
    │
    ├── contact/          # Contact Route (/contact)
    │   ├── page.jsx           # Split-screen view (direct contact links + message form)
    │   └── contact-form.jsx   # Interactive message submission form with animated states
    │
    ├── projects/         # Projects Route (/projects)
    │   ├── layout.jsx         # Projects layout wrapper
    │   ├── page.jsx           # Projects page entry with Suspense boundary
    │   ├── projects.jsx       # Multi-column grid & project tier sorting logic
    │   └── article.jsx        # Project card with traffic, Dependabot & Copilot stats
    │
    └── search/           # Search Route (/search)
        └── page.jsx           # User lookup view to preview any GitHub handle
```

---

## 2. Core Architecture & Data Flow

The application functions as a dynamic aggregator that fetches real-time telemetry from multiple sources, caches responses on the server, and renders lightweight HTML using React Server Components.

```mermaid
flowchart TD
    Client([User Browser]) -->|Request /projects or /| NextServer[Next.js 16 App Server]
    
    subgraph Server-Side Data Layer [app/data.js]
        NextServer --> Dispatcher{Check Cache Status}
        Dispatcher -->|Cache Hit| MemoryCache[(Server Cache)]
        Dispatcher -->|Cache Miss| FetchEng[Execute Fetcher]
        
        FetchEng --> CheckTokens{Tokens Available?}
        CheckTokens -->|GH_TOKEN Present| GhAuth[GitHub Auth REST & GraphQL]
        CheckTokens -->|No GH_TOKEN| GhPublic[GitHub Public REST (Rate limit 60/hr)]
        CheckTokens -->|VC_TOKEN Present| VercelAuth[Vercel Projects API]
        CheckTokens -->|No VC_TOKEN| VercelFallback[Fallback to data.json customUrls]
    end

    GhAuth -->|Store in Cache| MemoryCache
    GhPublic -->|Store in Cache| MemoryCache
    VercelAuth -->|Store in Cache| MemoryCache
    
    MemoryCache --> RenderEngine[React 19 Server Components]
    RenderEngine --> StreamHTML[Stream Rendered HTML to Browser]
```

### Key Integrations in `app/data.js`:
1. **GitHub REST API**:
   - `getUser`: User bio, display name, and avatar.
   - `getRepos`: Repositories with automatic `Link` header pagination traversal.
   - `getSocialAccounts`: Resolves linked social media accounts from GitHub profile.
   - `getRecentUserActivity`: 90-day public event stream reduced into natural language activity summaries.
   - `getTrafficPageViews`: 14-day total views and daily unique visitors (requires `GH_TOKEN`).
   - `getDependabotAlerts`: Security advisories grouped by severity level (requires `GH_TOKEN`).
   - `checkAppJsxExistence`: Detects Next.js Router type (App Router vs Pages Router).
2. **GitHub GraphQL API**:
   - `getPinnedRepos`: Pinned items for Hero project placement.
   - `getUserOrganizations`: Affiliated organizations and logos.
   - `getRepositoryPackageJson`: Fetches `HEAD:package.json` blob to inspect dependencies.
   - `getCopilotPRs` & `getCopilotPRsAccountWide`: Search queries tracking pull requests authored by `copilot-swe-agent[bot]`.
   - `getFrameworkLatestRelease`: Resolves upstream releases for Next.js, Astro, Nuxt, SvelteKit, Remix, and Gatsby.
3. **Vercel REST API**:
   - `getVercelProjects`: Cursor-paginated projects matching GitHub repositories to display live deployment URLs and framework metadata.

---

## 3. Tiered Caching & Route Optimization

To ensure blazing-fast performance and prevent hitting GitHub's API rate limits, the portfolio implements a dual caching strategy:

### 3.1 Server Cache (`unstable_cache`)
API responses are cached with distinct revalidation intervals based on data volatility:
- **5 Minutes (`MINUTES_5`)**: Rapidly changing data like GitHub activity streams (`getRecentUserActivity`).
- **1 Hour (`HOURS_1`)**: Upstream framework releases, package dependencies, and traffic views (`getFrameworkLatestRelease`, `getTrafficPageViews`, `getRepositoryPackageJson`).
- **12 Hours (`HOURS_12`)**: Stable data like repository lists, pinned repos, organizations, social accounts, Vercel deployments, and Copilot metrics.
- **24 Hours (`HOURS_24`)**: File structure checks (`checkAppJsxExistence`).

### 3.2 Client Route Cache (`staleTimes`)
Configured in `next.config.mjs`:
```javascript
experimental: {
    staleTimes: {
        dynamic: 300, // Dynamic routes cached on client for 5 minutes
        static: 300   // Static routes cached on client for 5 minutes
    }
}
```
This enables instantaneous back-and-forth navigation between `/`, `/projects`, and `/contact` with zero network latency.

---

## 4. Customizing Content via `data.json`

The portfolio is entirely configured via [`data.json`](file:///h:/Seffin/Protfolio/portfolio/data.json). No manual code modifications are necessary.

### Configuration Schema:
```json
{
  "githubUsername": "Seffin",
  "displayName": "Seffin Tom Mathew",
  "avatarUrl": "",
  "description": "My hobby projects, most of them are Next.js apps deployed to Vercel.",
  "email": "seffintommathew@gmail.com",
  "phone": "+91 9384605370",
  "locations": "Kochi, Trivandrum, Chennai",
  "socials": {
    "linkedin": "https://www.linkedin.com/in/seffin-tom-mathew-9a5b4320b",
    "instagram": "https://www.instagram.com/seffin_mathew/",
    "facebook": "https://www.facebook.com/Seffin.Tom.Mathew",
    "whatsapp": "https://wa.me/919384605370",
    "portfolio": "https://protfolio-seff.vercel.app/"
  },
  "experience": [
    {
      "role": "Prompt Engineer (Contract)",
      "company": "Independent Contractor",
      "location": "Remote",
      "period": "2025 – Present",
      "highlights": [
        "Design and optimize complex prompts using Context Prompting techniques to improve Large Language Model (LLM) output accuracy, structure, and relevance.",
        "Develop prompt templates and workflows to streamline data extraction, text generation, and reasoning tasks."
      ]
    },
    {
      "role": "Full Stack Developer",
      "company": "Twinstep Solutions",
      "location": "Chennai, India",
      "period": "Oct 2024 – Oct 2025",
      "highlights": [
        "Designed and developed enterprise applications using .NET API web services and Windows Applications for industrial levels.",
        "Developed secure RESTful APIs utilizing JWT authentication.",
        "Optimized MySQL queries, successfully reducing API response time."
      ]
    },
    {
      "role": "Junior Software Developer",
      "company": "HiDreamz Solutions",
      "location": "Kottayam, India",
      "period": "Oct 2023 – Sep 2024",
      "highlights": [
        "Developed and deployed full-stack web applications utilizing Python Flask and MySQL."
      ]
    }
  ],
  "education": [
    {
      "degree": "Bachelor of Engineering in Computer Science and Engineering",
      "institution": "Anna University",
      "period": "2017 – 2021",
      "score": "CGPA: 7.56"
    }
  ],
  "certifications": [
    ".NET Full Stack Development, Accord Info Matrix",
    "Java Full Stack Development, Inet Infotech",
    "Angular Certification, Accord Info Matrix"
  ],
  "projects": {
    "showForks": true,
    "blacklist": [],
    "heroNames": [],
    "customUrls": {
      "vachan-study-chat": "https://vachan-study-chat-snpm.vercel.app/",
      "gundert-translation-editor": "https://gundert-translation-editor-rosy.vercel.app/"
    }
  }
}
```

### Key Configuration Fields:
- **`githubUsername`**: Exact GitHub handle used to query all user APIs.
- **`projects.customUrls`**: Maps repository names to custom deployment domains for projects deployed under alternate Vercel project names or external servers.
- **`projects.showForks`**: Whether to display repositories forked from other owners (`true`/`false`).
- **`projects.blacklist`**: Array of repository names to hide from the `/projects` page.
- **`projects.heroNames`**: Array of repository names to force to the top Hero cards.

---

## 5. Development & Build Commands

### Local Development:
```bash
npm run dev
```
Starts development server on `http://localhost:3000` with Turbopack.

### Production Build:
```bash
npm run build
```
Executes Next.js compiler, generates static route optimizations, tree-shakes bundles, and verifies server components.

---

## 6. Deep Dive References

For detailed specifications of individual subsystems, refer to the documents in `docs/`:
- **[System Architecture](docs/ARCHITECTURE.md)**: Server vs Client components, hybrid routing, and caching.
- **[API Integrations](docs/API_INTEGRATIONS.md)**: Full API matrix, GraphQL queries, and version comparison engine.
- **[Component Library](docs/COMPONENTS.md)**: Catalog of every component, props, and styling classes.
- **[Configuration Manual](docs/CONFIGURATION.md)**: Tokens setup, resume maintenance, and Vercel deployment.
