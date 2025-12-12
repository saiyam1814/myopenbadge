# Open Badge Issuer & Verifier

An open-source, GitHub-hosted application for issuing and verifying Open Badges (v3.0).

## How it Works

1.  **Hosted on GitHub**: The entire application lives on GitHub Pages.
2.  **No Backend**: Badges are stored as JSON files in the `public/badges` directory.
3.  **Verification**: The application verifies badges by fetching the JSON file from the repository headers and checking the integrity.

## Deployment

To deploy this to your own GitHub repository:

1.  **Fork this repository**.
2.  Enable **GitHub Pages**:
    *   Go to **Settings** > **Pages**.
    *   Select **Source**: `GitHub Actions` (recommended) or `Deploy from a branch`.
    *   If deploying from a branch, push the `dist` folder to `gh-pages` branch.
    *   **Recommended**: Use the included GitHub Actions workflow (create `.github/workflows/deploy.yml`).

## Issuing a Badge

1.  Go to your deployed site's **Issue Badge** page (`/create`).
2.  Fill in the badge details.
3.  Click **Generate JSON**.
4.  Download the JSON file.
5.  Upload the file to `public/badges/` in your repository.
6.  Commit and push the changes.
7.  The badge is now live and verifiable!

## 🏢 Helper Guide for Companies / Organizations

If you want to use this system to issue badges for your company (e.g., "Company X"):

### 1. Setup
1.  **Fork** this repository to your organization's GitHub account.
2.  **Edit `vite.config.ts`**:
    -   Change `base: '/myopenbadge/'` to `base: '/<your-repo-name>/'`.
3.  **Edit `src/components/Layout.tsx`**:
    -   Update the logo/brand name to your company's name.
4.  **Push Changes**: Commit and push these changes.
5.  **Enable GitHub Pages**:
    -   Go to Repository Settings -> Pages.
    -   Set Source to `GitHub Actions` (recommended) or deploy from `gh-pages` branch.

### 2. Issuing Badges (The Admin Workflow)
Since this is a static site without a database, "issuing" a badge means "committing a file".

1.  **Generate**: Use the `/create` page on your deployed site (e.g., `https://company-x.github.io/badges/create`).
    -   *Note: This page is just a helper tool; it doesn't save anything to a server.*
    -   Fill in the Award Details, Recipient Email, etc.
    -   Copy the generated JSON.
2.  **Commit**:
    -   Create a new file in `public/badges/<badge-name>.json` in your repo.
    -   Paste the JSON content.
    -   Commit the file to the `main` branch.
3.  **Verify**:
    -   Send the link `https://company-x.github.io/badges/verify/<badge-name>` to the recipient.

### 3. LinkedIn Integration
When a user clicks "Add to LinkedIn":
-   **What LinkedIn sees**: The Certification Name, Issuing Organization, Issue Date, and a Verification Link (URL).
-   **What User sees**: A standardized text entry on their LinkedIn profile under "Licenses & certifications".
-   **The Badge Image**: LinkedIn *does not* display the badge image directly on the profile. The image is seen when someone clicks "Show Credential" which links back to your verified page.

## Development

```bash
npm install
npm run dev
```

## License

MIT
