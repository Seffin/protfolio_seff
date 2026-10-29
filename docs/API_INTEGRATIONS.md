# API Integrations & Telemetry Reference

This document provides a technical specification of all external APIs, GraphQL queries, pagination strategies, response parsers, and framework detection algorithms implemented in [`app/data.js`](file:///h:/Seffin/Protfolio/portfolio/app/data.js).

---

## 1. Integration Matrix

| Endpoint | Provider | Protocol | Authentication | Cache TTL | Function Name |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `/users/{username}` | GitHub | REST v3 | Optional | 60s | [`getUser`](file:///h:/Seffin/Protfolio/portfolio/app/data.js#L14-L26) |
| `/users/{username}/repos` | GitHub | REST v3 | Optional | 60s | [`getRepos`](file:///h:/Seffin/Protfolio/portfolio/app/data.js#L28-L61) |
| `/users/{username}/social_accounts` | GitHub | REST v3 | Optional | 12 Hours | [`getSocialAccounts`](file:///h:/Seffin/Protfolio/portfolio/app/data.js#L63-L75) |
| `/users/{username}/events` | GitHub | REST v3 | Optional | 5 Minutes | [`getRecentUserActivity`](file:///h:/Seffin/Protfolio/portfolio/app/data.js#L306-L338) |
| `/repos/{owner}/{repo}/traffic/views` | GitHub | REST v3 | **Required (`GH_TOKEN`)** | 1 Hour | [`getTrafficPageViews`](file:///h:/Seffin/Protfolio/portfolio/app/data.js#L340-L359) |
| `/repos/{owner}/{repo}/dependabot/alerts`| GitHub | REST v3 | **Required (`GH_TOKEN`)** | 12 Hours | [`getDependabotAlerts`](file:///h:/Seffin/Protfolio/portfolio/app/data.js#L361-L386) |
| `/repos/{owner}/{repo}/contents/{path}` | GitHub | REST v3 | Optional | 24 Hours | [`checkAppJsxExistence`](file:///h:/Seffin/Protfolio/portfolio/app/data.js#L395-L452) |
| GraphQL Endpoint (`pinnedItems`) | GitHub | GraphQL v4 | **Required (`GH_TOKEN`)** | 5 Minutes | [`getPinnedRepos`](file:///h:/Seffin/Protfolio/portfolio/app/data.js#L77-L98) |
| GraphQL Endpoint (`organizations`) | GitHub | GraphQL v4 | **Required (`GH_TOKEN`)** | 12 Hours | [`getUserOrganizations`](file:///h:/Seffin/Protfolio/portfolio/app/data.js#L100-L123) |
| GraphQL Endpoint (`package.json` Blob) | GitHub | GraphQL v4 | **Required (`GH_TOKEN`)** | 1 Hour | [`getRepositoryPackageJson`](file:///h:/Seffin/Protfolio/portfolio/app/data.js#L275-L304) |
| GraphQL Endpoint (`latestRelease`) | GitHub | GraphQL v4 | **Required (`GH_TOKEN`)** | 1 Hour | [`getFrameworkLatestRelease`](file:///h:/Seffin/Protfolio/portfolio/app/data.js#L230-L266) |
| GraphQL Search (`Copilot PRs repo`) | GitHub | GraphQL v4 | **Required (`GH_TOKEN`)** | 12 Hours | [`getCopilotPRs`](file:///h:/Seffin/Protfolio/portfolio/app/data.js#L462-L527) |
| GraphQL Search (`Copilot PRs global`) | GitHub | GraphQL v4 | **Required (`GH_TOKEN`)** | 12 Hours | [`getCopilotPRsAccountWide`](file:///h:/Seffin/Protfolio/portfolio/app/data.js#L536-L583) |
| `/v9/projects` | Vercel | REST v9 | **Required (`VC_TOKEN`)** | 12 Hours | [`getVercelProjects`](file:///h:/Seffin/Protfolio/portfolio/app/data.js#L125-L164) |
| `/api/contact` | Internal | Next.js API | Public (`POST`) | Real-time | [`POST /api/contact`](file:///h:/Seffin/Protfolio/portfolio/app/api/contact/route.js) |
| `/api/users/[username]` | Internal | Next.js API | Public (`GET`) | Real-time | [`GET /api/users/[username]`](file:///h:/Seffin/Protfolio/portfolio/pages/api/users/%5Busername%5D.js) |

---

## 2. GitHub REST API Integrations

### 2.1 Profile Details (`getUser`)
- **URL**: `https://api.github.com/users/{username}`
- **Purpose**: Fetches basic GitHub profile metadata including avatar URL, display name, public bio, and public repo counts.
- **Handling**: If unauthenticated and rate-limited (HTTP 403), outputs a warning to console and returns error JSON safely handled by components.

### 2.2 Repository List with Pagination (`getRepos`)
- **URL**: `https://api.github.com/users/{username}/repos?per_page=100`
- **Purpose**: Retrieves all public repositories owned by the user.
- **Pagination Strategy**: Inspects the HTTP `Link` header. If `rel="next"` is detected, it loops through consecutive page numbers (`page=2`, `page=3`, ...) until all repositories are accumulated into a single flattened array.

### 2.3 User Activity Stream (`getRecentUserActivity`)
- **URL**: `https://api.github.com/users/{username}/events?per_page=100`
- **Purpose**: Retrieves up to 300 public user events (commits, PRs, comments) over the last 90 days.
- **Data Reduction**: The raw event list is reduced into an aggregated metrics object:
  - `PushEvent`: Sums `payload.size` to count total pushed commits.
  - `PullRequestReviewEvent`: Counts pull request reviews.
  - `IssueCommentEvent`: Counts comment creation events (`payload.action === 'created'`).
  - `PullRequestEvent`: Tracks opened PRs and merged PRs (`action === 'closed' && payload.pull_request.merged`).
  - `CreateEvent`: Counts new tags and branches created.
- **Output**: Formatted natural language sentence displayed on the homepage (e.g., *"In last 90 days on GitHub I pushed 42 commits and opened 3 PRs in public repositories."*).

### 2.4 Repository Traffic Analytics (`getTrafficPageViews`)
- **URL**: `https://api.github.com/repos/{owner}/{repo}/traffic/views`
- **Requirement**: Requires `GH_TOKEN` with repository access.
- **Data Parsing**: Extracts total unique views over the last 14 days (`uniques`), finds the most recent complete 24-hour cycle (yesterday's date `YYYY-MM-DD`), and computes the daily unique visitors count.

### 2.5 Security Telemetry (`getDependabotAlerts`)
- **URL**: `https://api.github.com/repos/{owner}/{repo}/dependabot/alerts`
- **Purpose**: Monitors open vulnerability advisories.
- **Severity Aggregation**: Filters for alerts with `state === 'open'` and aggregates counts by severity level (`critical`, `high`, `medium`, `low`).
- **Visual Display**: Renders a color-coded Dependabot icon (`critical` = red, `high` = orange, `medium` = yellow, `low` = blue, `none` = gray).

### 2.6 Next.js Router Architecture Detection (`checkAppJsxExistence`)
- **URLs**:
  - `https://api.github.com/repos/{owner}/{repo}/contents/pages/_app.jsx`
  - `https://api.github.com/repos/{owner}/{repo}/contents/app/layout.jsx`
  - TSX fallbacks: `pages/_app.tsx`, `app/layout.tsx`
- **Purpose**: Determines whether a repository uses the App Router, Pages Router, or both.
- **Result**: Displayed as a tooltip badge under the Vercel project card.

---

## 3. GitHub GraphQL API Integrations

All GraphQL requests are executed via `POST https://api.github.com/graphql` with `Authorization: Bearer ${GH_TOKEN}`.

### 3.1 Pinned Repositories Query (`getPinnedRepos`)
Fetches up to 6 repositories pinned to the user's profile to render as hero cards on `/projects`:
```graphql
query PinnedRepositories($username: String!) {
  user(login: $username) {
    pinnedItems(first: 6, types: REPOSITORY) {
      nodes {
        ... on Repository {
          name
        }
      }
    }
  }
}
```

### 3.2 Organizations Query (`getUserOrganizations`)
Fetches up to 6 public organizations the user is affiliated with:
```graphql
query UserOrganizations($username: String!) {
  user(login: $username) {
    organizations(first: 6) {
      nodes {
        name
        websiteUrl
        url
        avatarUrl
        description
      }
    }
  }
}
```

### 3.3 Remote `package.json` Inspection (`getRepositoryPackageJson`)
Fetches the content of `package.json` without cloning the repository:
```graphql
query RepositoryPackageJson($username: String!, $reponame: String!) {
  repository(name: $reponame, owner: $username) {
    object(expression: "HEAD:package.json") {
      ... on Blob {
        text
      }
    }
  }
}
```

### 3.4 GitHub Copilot SWE Pull Request Telemetry
Queries merged pull requests generated by GitHub Copilot (`copilot-swe-agent[bot]`):
- **Repository-specific (`getCopilotPRs`)**:
  ```graphql
  query CopilotAuthoredMergedPRs($q: String!, $after: String) {
    search(type: ISSUE, query: "is:pr is:merged author:copilot-swe-agent[bot] involves:{username} repo:{username}/{reponame}", first: 50, after: $after) {
      issueCount
    }
  }
  ```
- **Account-wide (`getCopilotPRsAccountWide`)**:
  ```graphql
  query CopilotAuthoredMergedPRsAccountWide($q: String!) {
    search(type: ISSUE, query: "is:pr is:merged author:copilot-swe-agent[bot] involves:{username}", first: 1) {
      issueCount
    }
  }
  ```

---

## 4. Vercel REST API Integration (`getVercelProjects`)

- **URL**: `https://api.vercel.com/v9/projects?limit=100`
- **Authentication**: `Authorization: Bearer ${VC_TOKEN}`
- **Cursor Pagination**: Supports unlimited Vercel projects via cursor tracking (`data.pagination.next` to query `?until={nextCursor}`).
- **Data Cross-Referencing**: Projects returned from Vercel are matched against GitHub repositories by name. When a match is found:
  - Live deployment domain URL is attached to `repo.homepage`.
  - Detected framework (e.g., `nextjs`, `astro`, `remix`) and Node version are injected into `repo.vercel`.

---

## 5. Automated Framework Detection & Upgrade Engine

The portfolio includes an automated framework detection engine that parses remote `package.json` dependencies and devDependencies:

### 5.1 Supported Frameworks Matrix

| Dependency Key | Framework Name | Official Repository | Release Fetcher |
| :--- | :--- | :--- | :--- |
| `next` | Next.js | `vercel/next.js` | `getNextjsLatestRelease` |
| `astro` | Astro | `withastro/astro` | `getAstroLatestRelease` |
| `nuxt` | Nuxt | `nuxt/nuxt` | `getNuxtLatestRelease` |
| `@sveltejs/kit` | SvelteKit | `sveltejs/kit` | `getSvelteKitLatestRelease` |
| `@remix-run/react` | Remix | `remix-run/remix` | `getRemixLatestRelease` |
| `gatsby` | Gatsby | `gatsbyjs/gatsby` | `getGatsbyLatestRelease` |

### 5.2 Version Comparison Algorithm

The engine parses semantic version strings, strips prefixes (`v`, `^`, `~`, `>=`), and performs numerical array comparisons:
```javascript
function compareVersions(version1, version2) {
    const parseVersion = (v) => v.replace(/^v/, '').split('.').map(num => parseInt(num, 10) || 0);
    const v1 = parseVersion(version1);
    const v2 = parseVersion(version2);
    const maxLength = Math.max(v1.length, v2.length);
    for (let i = 0; i < maxLength; i++) {
        const num1 = v1[i] || 0;
        const num2 = v2[i] || 0;
        if (num1 < num2) return -1; // Upgrade available!
        if (num1 > num2) return 1;
    }
    return 0;
}
```

If `installedVersion < latestVersion`, an upgrade indicator badge (`<MdUpgrade />`) appears next to the project card, notifying the visitor of an available framework update.
