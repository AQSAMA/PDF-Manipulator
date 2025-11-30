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

1. Build the project:
   ```bash
   npm run build
   ```
2. Push the contents of `dist/` to the `gh-pages` branch, or configure GitHub Actions to do it automatically.
3. In the repo settings, set **Pages** source to `gh-pages` branch, root folder.

Alternatively, add a workflow file (`.github/workflows/deploy.yml`) using `peaceiris/actions-gh-pages`:

```yaml
name: Deploy
on:
  push:
    branches: [main]
jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 20
      - run: npm ci && npm run build
      - uses: peaceiris/actions-gh-pages@v4
        with:
          github_token: ${{ secrets.GITHUB_TOKEN }}
          publish_dir: ./dist
```

## 📄 License

MIT