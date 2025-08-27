// server.js
const express = require('express');
const path = require('path');
const fs = require('fs');

const app = express();

/**
 * Resolve the Angular build folder robustly:
 * - Prefer ENV OUTPUT_DIR if you want to hard-pin it
 * - Else try common Angular output locations
 */
const CANDIDATES = [
  process.env.OUTPUT_DIR && path.resolve(process.env.OUTPUT_DIR),
  path.join(__dirname, 'dist'),
  path.join(__dirname, 'dist', 'browser'),
  // if your project folder name is known, you can add these two lines:
  // path.join(__dirname, 'dist', 'material-requests-app.web'),
  // path.join(__dirname, 'dist', 'material-requests-app.web', 'browser'),
].filter(Boolean);

const distPath =
  CANDIDATES.find(p => {
    try { return fs.existsSync(path.join(p, 'index.html')); } catch { return false; }
  }) || CANDIDATES[0]; // fallback so we can print a helpful error

if (!fs.existsSync(path.join(distPath, 'index.html'))) {
  console.error('❌ Could not find index.html. Checked:', CANDIDATES);
  console.error('👉 Make sure your Angular build outputs to one of these folders, or set OUTPUT_DIR.');
  process.exit(1);
}

console.log('✅ Serving static from:', distPath);

// Serve static assets (cache everything except index.html)
app.use(express.static(distPath, {
  maxAge: '1y',
  setHeaders: (res, filePath) => {
    if (filePath.endsWith('index.html')) {
      res.setHeader('Cache-Control', 'no-store');
    }
  }
}));

// Healthcheck (optional, handy with uptime monitors)
app.get('/healthz', (_req, res) => res.status(200).send('ok'));

// SPA fallback — Express 5 safe pattern (do NOT use "/*" or "*")
app.get('/(.*)', (_req, res) => {
  res.sendFile(path.join(distPath, 'index.html'));
});

const port = process.env.PORT || 3000;
app.listen(port, () => console.log(`🚀 Listening on ${port}`));
