# 🚀 OpenBadge Complete Setup Guide

This guide explains **everything** you need to know to set up OpenBadge, test it locally, and deploy it anywhere.

## 📋 Table of Contents

1. [How It Works](#how-it-works)
2. [Quick Start (5 Minutes)](#quick-start)
3. [Testing Locally](#testing-locally)
4. [Deploying to GitHub Pages](#deploying-to-github-pages)
5. [Deploying to Vercel](#deploying-to-vercel)
6. [Understanding GitHub Authentication](#understanding-github-authentication)
7. [FAQ](#faq)

---

## 🔄 How It Works

**GitHub is the single source of truth.** Here's the workflow:

```
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│  Fill Badge     │ ──► │  Create PR to   │ ──► │  Merge PR =     │
│  Form           │     │  GitHub Repo    │     │  Badge is Live! │
└─────────────────┘     └─────────────────┘     └─────────────────┘
         │                       │                       │
         │                       │                       ▼
         │                       │              ┌─────────────────┐
         │                       │              │  Badge JSON in  │
         │                       │              │  public/badges/ │
         └───────────────────────┴──────────────┴─────────────────┘
                         GitHub = Single Source of Truth
```

1. **Create Badge**: Fill out the form with recipient details, skills, badge logo
2. **Generate JSON**: App creates Open Badges v2.0 compliant JSON
3. **Create PR**: App automatically creates a Pull Request to your repo
4. **Merge**: You review and merge the PR
5. **Live!**: Badge is now verifiable at `/verify/badge-name-firstname`

---

## ⚡ Quick Start

### Step 1: Fork the Repository

```bash
# Fork on GitHub, then clone
git clone https://github.com/YOUR_USERNAME/myopenbadge.git
cd myopenbadge
npm install
```

### Step 2: Create a GitHub Personal Access Token

1. Go to: **https://github.com/settings/tokens/new**
2. Fill in:
   - **Note**: `OpenBadge App`
   - **Expiration**: Choose what you prefer (90 days recommended)
   - **Scopes**: Check ✅ `repo` (Full control of private repositories)
3. Click **"Generate token"**
4. **Copy the token** (starts with `ghp_...`) - you won't see it again!

### Step 3: Run Locally

```bash
npm run dev
```

Open http://localhost:5173

### Step 4: Connect GitHub

1. Go to **Settings** in the app
2. Paste your Personal Access Token
3. Click **"Connect with Token"**
4. Select your repository from the dropdown

**Done!** You can now issue badges that automatically create PRs.

---

## 🧪 Testing Locally (End-to-End)

Here's how to test the complete flow on your machine:

### Prerequisites
- Node.js 20.19+ or 22.12+
- Git
- A GitHub account

### Step-by-Step Test

```bash
# 1. Clone and install
git clone https://github.com/YOUR_USERNAME/myopenbadge.git
cd myopenbadge
npm install

# 2. Start the dev server
npm run dev
# Opens at http://localhost:5173
```

**In the browser:**

1. **Settings Page** → Paste your GitHub Personal Access Token → Connect
2. **Select your repository** from the dropdown
3. **Go to "Issue" page** → Fill out the form:
   - Recipient: Your name & email
   - Badge: "Test Badge"
   - Description: "Testing the badge system"
   - Skills: Add some skills like "Testing"
   - Issuer: Your org name, URL, email
4. **Click "Generate Badge JSON"** → You'll see the JSON
5. **Click "Create Pull Request"** → Opens PR on GitHub
6. **Merge the PR** on GitHub
7. **Go to "Badges" page** → Your badge appears!
8. **Click "View & Verify"** → Badge verification page works!

### Testing Without GitHub Connection

If you just want to test badge creation without PRs:

1. Fill the form and click "Generate Badge JSON"
2. Click the download button to get the JSON file
3. Manually commit it to `public/badges/` in your repo
4. Navigate to `/verify/your-badge-name` to verify

---

## 📄 Deploying to GitHub Pages

GitHub Pages is **free** and works great for OpenBadge!

### Step 1: Enable GitHub Pages

1. Go to your repo on GitHub
2. **Settings** → **Pages**
3. Source: **GitHub Actions**

### Step 2: Create GitHub Actions Workflow

Create `.github/workflows/deploy.yml`:

```yaml
name: Deploy to GitHub Pages

on:
  push:
    branches: [main]
  workflow_dispatch:

permissions:
  contents: read
  pages: write
  id-token: write

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      
      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Build
        run: npm run build
        env:
          VITE_BASE_URL: https://YOUR_USERNAME.github.io/myopenbadge
      
      - name: Setup Pages
        uses: actions/configure-pages@v4
      
      - name: Upload artifact
        uses: actions/upload-pages-artifact@v3
        with:
          path: './dist'
  
  deploy:
    needs: build
    runs-on: ubuntu-latest
    environment:
      name: github-pages
      url: ${{ steps.deployment.outputs.page_url }}
    steps:
      - name: Deploy to GitHub Pages
        id: deployment
        uses: actions/deploy-pages@v4
```

### Step 3: Update vite.config.ts

```typescript
export default defineConfig({
  plugins: [react()],
  base: '/myopenbadge/', // Your repo name
})
```

### Step 4: Push and Deploy

```bash
git add .
git commit -m "Add GitHub Pages deployment"
git push
```

Your app will be live at: `https://YOUR_USERNAME.github.io/myopenbadge`

---

## 🔺 Deploying to Vercel

Vercel is the easiest option with automatic deployments!

### One-Click Deploy

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/saiyam1814/myopenbadge)

### Manual Deploy

```bash
# Install Vercel CLI
npm install -g vercel

# Login
vercel login

# Deploy
vercel --prod
```

### Custom Domain on Vercel

1. Go to Vercel Dashboard → Your Project → Settings → Domains
2. Add your custom domain
3. Follow DNS configuration instructions
4. SSL is automatic!

Your badges will be verifiable at: `https://yourdomain.com/verify/badge-name`

---

## 🔐 Understanding GitHub Authentication

### What is a Personal Access Token (PAT)?

A **Personal Access Token** is like a password that lets apps access your GitHub account. It's:
- Created by you on GitHub
- Has specific permissions (scopes) you control
- Can be revoked anytime
- Never shared with any third party in our app

### Where is my token stored?

Your token is stored **only in your browser's localStorage**. It is:
- ✅ Sent directly to GitHub's API (api.github.com)
- ❌ Never sent to our servers
- ❌ Never shared with anyone
- ✅ Deleted when you click "Disconnect"

### Why do I need the "repo" scope?

The `repo` scope lets the app:
- Read your repository list
- Create branches
- Create/update files (badge JSON)
- Create Pull Requests

Without it, the app can't create PRs for you.

### How to revoke access?

1. Go to https://github.com/settings/tokens
2. Find your "OpenBadge App" token
3. Click "Delete"

Your app will no longer work until you create a new token.

---

## ❓ FAQ

### What are those environment variables I see mentioned?

For the **Personal Access Token method** (recommended), you don't need any environment variables! Just:
1. Create a token on GitHub
2. Paste it in the Settings page
3. Done!

The environment variables (`VITE_GITHUB_CLIENT_ID`, `GITHUB_CLIENT_SECRET`) are only needed if you want to set up the **OAuth method**, which is more complex and requires server-side code.

### What's the difference between OAuth and Personal Access Token?

| Feature | Personal Access Token | OAuth |
|---------|----------------------|-------|
| Setup complexity | Easy - just create token | Complex - needs OAuth app + server |
| Works on GitHub Pages | ✅ Yes | ❌ No (needs server) |
| Works on Vercel | ✅ Yes | ✅ Yes |
| Token management | User manages | Automatic |
| Best for | Most users | Enterprise apps |

**Recommendation**: Use Personal Access Token. It's simpler and works everywhere.

### Can I use this without any GitHub integration?

Yes! You can:
1. Fill the form
2. Download the JSON
3. Manually commit to your repo

The GitHub integration just automates steps 2-3.

### Where should the badges folder be?

Badges must be in: `public/badges/`

This folder is served statically and badges are accessed at:
- Local: `http://localhost:5173/badges/badge-name.json`
- Production: `https://yourdomain.com/badges/badge-name.json`

### How do verification URLs work?

When you create a badge for "John Doe" with badge name "Cloud Expert":
- **Filename**: `cloud-expert-john.json`
- **Verification URL**: `/verify/cloud-expert-john`

The URL is based on: `badge-name-firstname` (all lowercase, special chars removed)

### Can multiple people use this app?

Yes! Each person who wants to issue badges:
1. Forks the repo
2. Creates their own PAT
3. Deploys to their own domain/subdomain
4. Issues badges to their own repo

### Is my data secure?

- **Your GitHub token**: Stored only in YOUR browser, sent only to GitHub
- **Badge data**: Stored in YOUR GitHub repository
- **No backend**: This is a static app with no server collecting data

### What if I lose my token?

1. Create a new token at https://github.com/settings/tokens
2. Enter it in Settings
3. Continue working

Your badges in the repo are unaffected.

---

## 🆘 Troubleshooting

### "Invalid token" error

- Make sure you copied the entire token (starts with `ghp_`)
- Check that the token has `repo` scope
- Token might have expired - create a new one

### PRs not being created

- Make sure you selected a repository in Settings
- Check the repository has `public/badges/` folder
- Verify your token hasn't been revoked

### Badge shows "Verification Failed"

- The JSON file doesn't exist in `public/badges/`
- The PR hasn't been merged yet
- There's a typo in the badge ID

### Page not found after deployment

- Check `vite.config.ts` has correct `base` path
- For GitHub Pages: base should be `/repo-name/`
- For Vercel: base should be `/`

---

## 📚 More Resources

- [Open Badges Specification](https://www.imsglobal.org/sites/default/files/Badges/OBv2p0Final/index.html)
- [GitHub Personal Access Tokens](https://docs.github.com/en/authentication/keeping-your-account-and-data-secure/creating-a-personal-access-token)
- [Vercel Documentation](https://vercel.com/docs)
- [GitHub Pages Documentation](https://docs.github.com/en/pages)
