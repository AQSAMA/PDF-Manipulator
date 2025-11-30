# PDF Manipulator SPA

A fast, lightweight single-page app for manipulating PDF files **entirely in the browser**. Upload a PDF, tweak page layouts, rotate, add borders, and download the result—no server uploads, everything runs client-side via Web Workers.

## ✨ Features

- **Upload** — drag-and-drop or file picker (PDF only).
- **Pages per sheet** — print multiple logical pages on one physical sheet (1, 2, 4, 6, or 8-up).
- **Rotation** — rotate content 0°, 90°, 180°, or 270°.
- **Borders** — add a visible border around each tile with customizable width and color.
- **Live preview** — see changes instantly before downloading.
- **Mobile-first responsive layout** — works smoothly on phones, tablets, and desktops.
- **GitHub Pages ready** — static build, no backend.

## 🚀 Quick Start

```bash
# Install dependencies
npm install

# Start dev server (http://localhost:3000)
npm run dev

# Production build → dist/
npm run build

# Preview production build locally
npm run serve
```

## 📦 Tech Stack

| Layer | Tool |
|-------|------|
| UI | React 18 + TypeScript |
| Bundler | Vite |
| PDF processing | pdf-lib (runs in a Web Worker) |
| Styling | Vanilla CSS (CSS variables, responsive grid) |

## 🌐 Deploying to GitHub Pages

This repo already contains `.github/workflows/deploy.yml`, so every push to `main` will:

1. Install dependencies with Node 20.
2. Run `npm run build` with the Vite `base` set to `/PDF-Manipulator/`.
3. Publish the contents of `dist/` to the `gh-pages` branch via `peaceiris/actions-gh-pages`.

After the first successful workflow run, open **Settings → Pages** and choose `gh-pages` as the branch with the root (`/`) folder. GitHub Pages will then serve the SPA at `https://aqsama.github.io/PDF-Manipulator/`.

### Manual trigger / first deployment

If you need to publish manually (for example before the first `main` push):

```bash
npm install
npm run build
git worktree add gh-pages
cp -r dist/* gh-pages/
cd gh-pages
git add .
git commit -m "Deploy"
git push origin gh-pages
git worktree remove gh-pages
```

Then configure Pages as described above. Future changes only require pushing to `main`; the workflow takes care of building and deploying.

## 📄 License

MIT