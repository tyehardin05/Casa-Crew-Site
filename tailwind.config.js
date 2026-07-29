# Casa Crew — deployable site

This is your Casa Crew site, packaged as a real project you can deploy to the
open internet. Outside of Claude.ai's artifact sandbox, the Google Forms
integration will work normally (the sandbox was blocking outbound network
requests — a real hosted site has no such restriction).

## Both forms are wired and ready

Both the **cleaner application** and **owner request** forms are fully
connected to their respective Google Forms. You can deploy right away —
no code changes needed before going live.

## Deploy to Vercel (recommended — free, ~10 minutes)

1. **Create a GitHub account** if you don't have one: [github.com](https://github.com)
2. **Create a new repository** on GitHub (name it something like `casa-crew-site`), keep it empty (no README/gitignore — you already have those)
3. **Upload this project's files** to that repo. Easiest way if you're not familiar with git:
   - On the new repo's GitHub page, click "uploading an existing file"
   - Drag in every file and folder from this project (keep the folder structure intact — `src/` should stay a folder)
   - Commit the upload
4. **Go to [vercel.com](https://vercel.com)** and sign up (you can sign up directly with your GitHub account — this is the easiest path)
5. Click **"Add New" → "Project"**
6. Select the `casa-crew-site` repo you just created — Vercel will auto-detect it's a Vite project and fill in the build settings for you (Build Command: `vite build`, Output Directory: `dist`) — you shouldn't need to change anything
7. Click **Deploy**
8. After a minute or two, Vercel gives you a live URL (something like `casa-crew-site.vercel.app`) — that's your real, working site

## Testing after deploy

1. Visit your new live URL
2. Fill out the cleaner application form for real and submit it — check your linked Google Sheet, the row should appear within a few seconds
3. Do the same for the owner request form — check its own linked Google Sheet

## Custom domain (optional, later)

Once you're happy with it, Vercel lets you connect a real domain name (like
`casacrewaustin.com`) under Project Settings → Domains, if you decide to buy one.

## Local development (optional)

If you want to preview changes on your own computer before deploying:

```bash
npm install
npm run dev
```

This starts a local server (usually at `http://localhost:5173`) with live
reloading as you edit files.
