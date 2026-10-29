# Component Library & UI Guide

This document details all UI components, rendering types (Server vs. Client), props, state handling, and interactive behaviors across the portfolio application.

---

## 1. Component Hierarchy & System Overview

```mermaid
graph TD
    RootLayout[RootLayout: app/layout.jsx]
    
    subgraph Home Route [/]
        HomePage[Home: app/page.jsx]
        UserIcon[UserIcon: RSC]
        UserText[UserText: RSC]
        ProfileOrgs[ProfileOrganizations: RSC]
        RecentAct[RecentActivity: RSC]
        CopilotAct[CopilotActivity: RSC]
        ResumeSection[Resume: RSC]
        ResumeDown[Download Resume Button]
    end
    
    subgraph Projects Route [/projects]
        ProjectsPage[ProjectsPage: app/projects/page.jsx]
        ProjectsComp[ProjectsComponent: app/projects/projects.jsx]
        HeroCards[Hero Projects: Card]
        HostedCards[Hosted Projects: Card]
        OtherCards[Other Projects: Card]
        ArticleCard[Article: app/projects/article.jsx]
        VercelInfoBadge[VercelInfo: app/components/vercel-info.jsx]
        PopoverComp[Popover: Client Component]
    end
    
    subgraph Contact Route [/contact]
        ContactPage[Contact: app/contact/page.jsx]
        SocialCards[Contact Cards: Card]
        ContactFormComp[ContactForm: Client Component]
    end
    
    subgraph Search Route [/search]
        SearchPage[Search: app/search/page.jsx]
        UserSearchComp[UserSearch: Client Component]
    end
    
    subgraph Global Shell
        NavBar[Navigation: Client Component]
        LoadingInd[LoadingIndicator: Client Component]
    end

    RootLayout --> HomePage
    RootLayout --> ProjectsPage
    RootLayout --> ContactPage
    RootLayout --> SearchPage
    
    HomePage --> NavBar
    HomePage --> UserIcon
    HomePage --> UserText
    HomePage --> ProfileOrgs
    HomePage --> RecentAct
    HomePage --> CopilotAct
    HomePage --> ResumeSection
    HomePage --> ResumeDown

    ProjectsPage --> NavBar
    ProjectsPage --> ProjectsComp
    ProjectsComp --> ArticleCard
    ArticleCard --> VercelInfoBadge
    VercelInfoBadge --> PopoverComp

    ContactPage --> NavBar
    ContactPage --> SocialCards
    ContactPage --> ContactFormComp

    SearchPage --> UserSearchComp
    NavBar --> LoadingInd
```

---

## 2. Core Layout & Global Components

### 2.1 `RootLayout` ([`app/layout.jsx`](file:///h:/Seffin/Protfolio/portfolio/app/layout.jsx))
- **Type**: Server Component (RSC)
- **Role**: Global HTML envelope, font declarations, and dynamic search engine optimization (SEO) tags.
- **Key Features**:
  - Injects **CalSans-SemiBold** font via `next/font/local` using CSS variable `--font-calsans`.
  - Configures dynamic title template: `"%s | Seffin Tom Mathew's portfolio"`.
  - Sets Googlebot meta instructions: `max-video-preview: -1`, `max-image-preview: large`.
  - Attaches `global.css` with Tailwind CSS v4 layers and edge outlines (`.text-edge-outline`).

### 2.2 `Navigation` ([`app/components/nav.jsx`](file:///h:/Seffin/Protfolio/portfolio/app/components/nav.jsx))
- **Type**: Client Component (`"use client"`)
- **Role**: Dynamic top navigation bar with scroll-aware glassmorphic styling.
- **State & Hooks**:
  - `isIntersecting`: Tracks an `IntersectionObserver` sentinel placed on the page header.
  - When scrolled past the top boundary, transitions from transparent to `bg-zinc-900/500 border-zinc-800 backdrop-blur`.
  - Preserves active user preview query (`?customUsername=...`) across route transitions.

### 2.3 `LoadingIndicator` ([`app/components/loading-indicator.jsx`](file:///h:/Seffin/Protfolio/portfolio/app/components/loading-indicator.jsx))
- **Type**: Client Component (`"use client"`)
- **Role**: Micro-animation indicating route transition status.
- **Hook**: Utilizes Next.js `useLinkStatus()`. While a target route is pending, renders an animated pulsing accent line (`animate-pulse h-0.5 bg-zinc-400`).

### 2.4 `Card` ([`app/components/card.jsx`](file:///h:/Seffin/Protfolio/portfolio/app/components/card.jsx))
- **Type**: Server Component (Presentation)
- **Role**: Standardized container for repository cards, social account links, and stats.
- **Styling**: `border border-zinc-600 rounded-xl hover:bg-zinc-800/10 hover:border-zinc-400/50 transition duration-700`.

---

## 3. Landing & Home Components

### 3.1 `LandingComponent` ([`app/page.jsx`](file:///h:/Seffin/Protfolio/portfolio/app/page.jsx))
- **Type**: Server Component (RSC)
- **Role**: Main showcase displaying the owner handle with typography animations, profile details, organizations, recent activity summary, and resume timeline.
- **Key Sub-components**:
  - `UserIcon`: Asynchronously resolves and renders avatar image via `next/image` with round clipping.
  - `UserText`: Displays headline introduction with bio pulled from GitHub.
  - Direct Resume Download: Streamlined button linking to `/Seffin0.1.pdf` with `download="Seffin_Tom_Mathew_Resume.pdf"`.

### 3.2 `Resume` ([`app/components/resume.jsx`](file:///h:/Seffin/Protfolio/portfolio/app/components/resume.jsx))
- **Type**: Server Component (RSC)
- **Role**: Visual interactive career timeline rendered directly on the homepage.
- **Data Source**: Reads `data.json` sections:
  - `experience`: Renders vertical timeline with round indicators, role title, company name, location, dates, and bulleted accomplishment highlights.
  - `education`: Renders academic degrees, university/school names, dates, and score badges (CGPA/percentages).
  - `certifications`: Renders two-column grid with verified badges (`GoVerified`) highlighting specialized full-stack credentials (.NET, Java, Angular).

### 3.3 `RecentActivity` & `CopilotActivity` ([`app/components/recent-activity.jsx`](file:///h:/Seffin/Protfolio/portfolio/app/components/recent-activity.jsx))
- **Type**: Server Component (RSC)
- **Role**: Real-time GitHub productivity summary and AI agent collaboration metric.
- **Features**:
  - Renders aggregated sentence summarizing pushed commits, PR reviews, PRs merged, and comments made over the past 90 days.
  - Renders account-wide count of merged GitHub Copilot pull requests (`<SiGithubcopilot />`).

---

## 4. Projects Showcase Components

### 4.1 `ProjectsComponent` ([`app/projects/projects.jsx`](file:///h:/Seffin/Protfolio/portfolio/app/projects/projects.jsx))
- **Type**: Server Component (RSC)
- **Role**: Orchestrates repository filtering, grouping, sorting, and multi-column grid layout.
- **Logic**:
  1. Queries repositories, pinned repository names, and Vercel projects concurrently via `Promise.all`.
  2. Resolves custom URLs defined in `data.json`'s `projects.customUrls`.
  3. Sorts into three distinct tiers:
     - **Heroes / Pinned**: Pinned repositories sorted by star count in large 2-column format.
     - **Hosted Projects**: Repositories linked to a live Vercel deployment or custom URL.
     - **Other Projects**: Remaining open-source repositories without live hostings.
  4. Distributes items evenly across a 3-column responsive grid using `lodash/chunk`.

### 4.2 `Article` ([`app/projects/article.jsx`](file:///h:/Seffin/Protfolio/portfolio/app/projects/article.jsx))
- **Type**: Server Component (RSC)
- **Role**: Individual project card presenting repository telemetry.
- **Metrics Rendered**:
  - **Creation Date**: Extracted from `project.created_at` in ISO format (`YYYY-MM-DD`).
  - **Stars Count**: Total GitHub stargazers formatted via `Intl.NumberFormat`.
  - **Live Vercel / App Link**: Gradient header directing to deployment URL (or GitHub repo).
  - **Traffic Analytics**: 14-day total unique visitors and yesterday's unique visitors (`GoEye`).
  - **Dependabot Status**: Color-coded security shield indicating open vulnerabilities (`GoDependabot`).
  - **Copilot PRs**: Merged Copilot pull requests link targeting GitHub PR query (`SiGithubcopilot`).

### 4.3 `VercelInfo` ([`app/components/vercel-info.jsx`](file:///h:/Seffin/Protfolio/portfolio/app/components/vercel-info.jsx))
- **Type**: Server Component (RSC)
- **Role**: Deployment details, framework badges, Turbopack detection, and upgrade advisories.
- **Badges**:
  - Detects Next.js, Astro, Nuxt, SvelteKit, Remix, Gatsby.
  - Displays Turbopack icon if Next.js version >= 16 or `--turbo` dev flag is found.
  - Compares installed version with upstream GitHub release; renders `<MdUpgrade />` badge if an update is available.
  - Displays router architecture: App Router, Pages Router, or Both.

### 4.4 `Popover` ([`app/components/popover.jsx`](file:///h:/Seffin/Protfolio/portfolio/app/components/popover.jsx))
- **Type**: Client Component (`"use client"`)
- **Role**: Hover tooltip presenting detailed metadata popup (such as framework version or Turbopack status) without layout shift.

---

## 5. Contact & Search Components

### 5.1 `Contacts` ([`app/contact/page.jsx`](file:///h:/Seffin/Protfolio/portfolio/app/contact/page.jsx))
- **Type**: Server Component (RSC)
- **Role**: Split-screen communication dashboard.
- **Left Column**: Interactive cards for Phone (`tel:`), Location (Google Maps query), Email (`mailto:`), GitHub, LinkedIn, Instagram, Facebook, WhatsApp (`wa.me`), and live Portfolio link.
- **Right Column**: Embedded interactive `ContactForm`.

### 5.2 `ContactForm` ([`app/contact/contact-form.jsx`](file:///h:/Seffin/Protfolio/portfolio/app/contact/contact-form.jsx))
- **Type**: Client Component (`"use client"`)
- **Role**: User-facing message submission interface with realistic transition states.
- **States**:
  - `idle`: Form inputs for Name, Email, and Message.
  - `loading`: Disabled submit button with spinning loader.
  - `success`: Animated checkmark card with *"Message Sent!"* and *"Send another message"* reset action.
  - `error`: Inline validation warnings.

### 5.3 `UserSearch` ([`app/components/search-input.jsx`](file:///h:/Seffin/Protfolio/portfolio/app/components/search-input.jsx))
- **Type**: Client Component (`"use client"`)
- **Role**: Real-time GitHub user lookup engine for `/search`.
- **Interactions**:
  - Captures input keystrokes and `Enter` key events.
  - Calls internal API route `api/users/${username}`.
  - If user exists, presents link to preview portfolio with that user's data (`/?customUsername=${username}`).
  - If user does not exist, presents a red notification.
