# Configuration & Deployment Manual

This manual provides an in-depth reference for configuring, customizing, and deploying the portfolio application.

---

## 1. Profile Configuration (`data.json`)

The file [`data.json`](file:///h:/Seffin/Protfolio/portfolio/data.json) in the project root is the central configuration file. It drives all personal content, social links, resume timelines, and repository presentation rules without requiring code changes.

### Complete Schema Reference

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
      "python-scriptures": "",
      "gundert-translation-editor": "https://gundert-translation-editor-rosy.vercel.app/"
    }
  }
}
```

### Property Details

| Property | Type | Description |
| :--- | :--- | :--- |
| `githubUsername` | `string` | **Required.** Exact GitHub handle used to query repositories, activity, and profile info. |
| `displayName` | `string` | Custom display name used in titles, headers, and metadata. Defaults to GitHub username if blank. |
| `avatarUrl` | `string` | Optional URL override for profile picture. If empty, loads avatar from GitHub profile. |
| `description` | `string` | Bio / tagline displayed on the homepage and projects header. |
| `email` | `string` | Contact email address used in `mailto:` links. |
| `phone` | `string` | Phone number formatted for display and `tel:` links. |
| `locations` | `string` | Cities or regions for Google Maps search link. |
| `socials` | `object` | Key-value pairs for social platforms (`linkedin`, `instagram`, `facebook`, `whatsapp`, `portfolio`). |
| `experience` | `array` | List of career positions (`role`, `company`, `location`, `period`, `highlights`). Rendered in `Resume` component. |
| `education` | `array` | List of educational credentials (`degree`, `institution`, `period`, `score`). Rendered in `Resume` component. |
| `certifications`| `array` | List of certifications or credentials rendered with verification badges. |
| `projects.showForks`| `boolean` | Set to `true` to include forked repositories on the `/projects` page. Defaults to `false`. |
| `projects.blacklist`| `string[]` | Array of repository names to hide from the `/projects` showcase. |
| `projects.heroNames`| `string[]` | Array of repository names to highlight as top Hero projects. |
| `projects.customUrls`| `object` | Explicit deployment URL mappings for repositories whose live URL cannot be automatically detected via Vercel or GitHub homepage. |

---

## 2. Environment Variables Configuration

Create a `.env.local` file in your project root based on [`.env.example`](file:///h:/Seffin/Protfolio/portfolio/.env.example):

```env
# Required for elevated rate limits (5,000 req/hr) and GraphQL queries:
GH_TOKEN=ghp_yourPersonalAccessTokenHere

# Optional for querying Vercel deployment statuses and live preview URLs:
VC_TOKEN=yourVercelAccessTokenHere

# Optional build-time override for GitHub username (falls back to data.json):
# GITHUB_USERNAME=Seffin
```

### 2.1 Generating a GitHub Personal Access Token (`GH_TOKEN`)
1. Go to **GitHub Settings** > **Developer Settings** > **Personal Access Tokens** > **Tokens (classic)**.
2. Click **Generate new token (classic)**.
3. Recommended Scopes:
   - `repo` (Full control of private repositories, traffic views, and Dependabot alerts).
   - `read:user` (Read user profile and email).
   - `read:org` (Read organization memberships).
4. Copy the generated token string into `.env.local` as `GH_TOKEN=...`.

### 2.3 Contact Form Email Delivery (`WEB3FORMS_KEY` or `RESEND_API_KEY`)

When someone sends a message via the **Send a Message** form on the `/contact` page, the portfolio dispatches the message to [`app/api/contact/route.js`](file:///h:/Seffin/Protfolio/portfolio/app/api/contact/route.js).

You can activate live email forwarding to your inbox using either of the following free options:

#### Option 1: Web3Forms (Recommended & Free, Zero Setup)
1. Go to [https://web3forms.com](https://web3forms.com).
2. Enter your email address (`seffintommathew@gmail.com`) to receive your free Access Key.
3. Add the key to `.env.local` (and your Vercel Project Environment Variables):
   ```env
   WEB3FORMS_KEY=your_web3forms_access_key
   ```
4. All messages submitted by visitors will instantly be forwarded directly to your email inbox!

#### Option 2: Resend API
1. Sign up for a free account at [https://resend.com](https://resend.com).
2. Create an API key (`re_...`).
3. Add the key to `.env.local`:
   ```env
   RESEND_API_KEY=re_your_resend_api_key
   ```
4. Messages will be sent through Resend directly to `seffintommathew@gmail.com`.

#### Default Fallback (No Key Configured)
If no key is set yet, the server logs incoming messages to the server console, and the form provides visitors with an instant **"Send via Mail App"** action pre-filled with the subject and body to ensure no inquiry is ever lost.

## 3. Resume Maintenance

The portfolio includes two synchronized representations of the resume:

1. **LaTeX Source (`resume.tex`)**:
   - ATS-friendly standard LaTeX single-page document.
   - Contains complete career experience, technical skills matrix, and key projects.
   - Compile using `pdflatex resume.tex` or any standard LaTeX editor (e.g., Overleaf, TeXShop).
2. **Compiled PDF (`public/Seffin0.1.pdf`)**:
   - The compiled PDF file placed in `public/` is served directly by Next.js when visitors click **Download Resume 📄** on the homepage.
   - Ensure the filename in `public/` matches the reference in [`app/page.jsx`](file:///h:/Seffin/Protfolio/portfolio/app/page.jsx#L78).

---

## 4. Development & Deployment Workflows

### 4.1 Running Locally
```bash
# 1. Install dependencies
npm install

# 2. Start local development server with Turbopack
npm run dev
```
Open `http://localhost:3000` in your browser.

### 4.2 Building for Production
```bash
# Validates types, tree-shakes bundles, and compiles server components
npm run build

# Start production server locally
npm run start
```

### 4.3 Deploying to Vercel

The portfolio is optimized for immediate zero-config deployment on Vercel:

1. **Import Repository**:
   - Connect your GitHub repository to Vercel.
   - Framework preset will automatically detect **Next.js**.
2. **Configure Environment Variables**:
   - In the Vercel project deployment screen, add:
     - `GH_TOKEN`: Your GitHub personal access token.
     - `VC_TOKEN`: Your Vercel personal access token.
3. **Deploy**:
   - Click **Deploy**. Vercel will execute `npm run build` and launch the project globally on edge CDN nodes.
