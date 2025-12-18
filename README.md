# 🏅 OpenBadge

A fully open-source badge issuer and verifier. **GitHub is the single source of truth** - badges are stored as JSON files in your repository.

![OpenBadge](https://img.shields.io/badge/Open%20Badges-v2.0-blue) ![License](https://img.shields.io/badge/license-MIT-green)

## ✨ What It Does

- **Issue Badges** → Fill a form, add skills, custom logo
- **Auto-Create PRs** → Badge JSON + PR to your repo automatically  
- **Verify Badges** → Anyone can verify at `/verify/badge-name`
- **Share on LinkedIn** → One-click add to profile
- **Revoke Badges** → Delete creates a PR too

## 🚀 Quick Start (5 Minutes)

### 1. Fork & Clone

```bash
git clone https://github.com/YOUR_USERNAME/myopenbadge.git
cd myopenbadge
npm install
npm run dev
```

### 2. Create GitHub Token

Go to **https://github.com/settings/tokens/new**
- Name: `OpenBadge App`
- Scope: ✅ `repo`
- Click "Generate token" → Copy it

### 3. Connect in App

1. Open http://localhost:5173
2. Go to **Settings**
3. Paste your token → **Connect**
4. Select your repository

### 4. Issue Your First Badge!

Go to **Issue** → Fill form → **Generate** → **Create PR** → Merge on GitHub → Done!

---

## 📖 Full Documentation

See **[SETUP.md](./SETUP.md)** for:
- Complete setup guide
- Testing locally end-to-end
- Deploying to GitHub Pages
- Deploying to Vercel
- Understanding authentication
- FAQ & Troubleshooting

---

## 🔐 How Authentication Works

**No complex OAuth needed!** Just:
1. Create a Personal Access Token on GitHub
2. Paste it in Settings
3. Token is stored in YOUR browser only
4. Sent directly to GitHub API (never to any other server)

---

## 🌐 Deployment Options

| Platform | Difficulty | Notes |
|----------|------------|-------|
| **Vercel** | ⭐ Easy | One-click deploy, auto SSL |
| **GitHub Pages** | ⭐⭐ Medium | Free, needs workflow setup |
| **Any Static Host** | ⭐⭐ Medium | Netlify, Cloudflare, etc. |

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/saiyam1814/myopenbadge)

---

## 📁 Project Structure

```
myopenbadge/
├── public/
│   └── badges/          # Badge JSON files live here
├── src/
│   ├── pages/
│   │   ├── Home.tsx           # Landing page
│   │   ├── IssuerDashboard.tsx # Create badges
│   │   ├── BadgeGallery.tsx   # View all badges
│   │   ├── BadgeView.tsx      # Verify badge
│   │   └── Settings.tsx       # GitHub connection
│   └── lib/
│       └── github.ts          # GitHub API integration
└── SETUP.md                   # Full documentation
```

---

## 🔄 Badge Workflow

```
Fill Form → Generate JSON → Create PR → Merge → Badge is Live!
                                ↓
                    Your GitHub Repo
                    (Single Source of Truth)
```

---

## 📋 Badge URL Format

When you create a badge:
- **Badge Name**: "Cloud Expert"
- **Recipient**: "John Doe"
- **Result**: `/verify/cloud-expert-john`

Format: `badge-name-firstname` (lowercase, special chars removed)

---

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📄 License

MIT License - feel free to use this for your own badge issuance needs!

## 🙏 Credits

- [Open Badges Specification](https://www.imsglobal.org/sites/default/files/Badges/OBv2p0Final/index.html)
- Built with [React](https://react.dev/), [Vite](https://vitejs.dev/), [Tailwind CSS](https://tailwindcss.com/)
