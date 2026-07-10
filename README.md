# My GitHub Portfolio

A modern, dynamic personal portfolio website built with [Next.js](https://nextjs.org/) and [Tailwind CSS](https://tailwindcss.com/), designed to automatically showcase GitHub repositories and Vercel deployments.

Based on the original templates by [chronark](https://chronark.com/) and [jirihofman](https://github.com/jirihofman/portfolio).

## Tech Stack
- **Framework**: [Next.js](https://nextjs.org/)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/)
- **UI Components & Icons**: [React Icons](https://react-icons.github.io/react-icons/)
- **Deployment**: [Vercel](https://vercel.com)

## Key Features

- **Automated Repository Showcase**: Fetches repository details, creation dates, descriptions, and star counts directly from GitHub.
- **Analytics & Security Indicators**:
  - Dependabot alerts monitoring
  - Visitor statistics (unique visitors count)
  - Merged Copilot pull requests count
- **Deployment Status**: Checks Vercel deployment status, framework detection, and UI libraries automatically from dependencies.
- **Dynamic Routing**: Built using Next.js App Router.

## Running Locally

1. **Clone the Repository**:
   ```sh
   git clone <your-repository-url>
   cd portfolio
   ```

2. **Configure Environment Variables**:
   Create a `.env.local` file:
   ```sh
   cp .env.example .env.local
   ```
   Add your API tokens:
   ```env
   # Required: GitHub Personal Access Token (for authenticated API limits)
   GH_TOKEN=YOUR_GH_TOKEN

   # Optional: Vercel Token (to query deployment statuses)
   VC_TOKEN=YOUR_VERCEL_TOKEN
   ```

3. **Install Dependencies and Start the Dev Server**:
   ```sh
   npm install
   npm run dev
   ```

4. **Customize Content**:
   Update `data.json` with your own profile description, GitHub username, and project display configurations.
