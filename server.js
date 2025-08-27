// server.js
const express = require('express');
const path = require('path');
const fs = require('fs');

const app = express();

/**
 * Resolve the Angular build folder robustly.
 * Priority:
 *  1) OUTPUT_DIR env var (set on Heroku if you want to hard-pin)
 *  2) dist/
 *  3) dist/browser (Angular 17+ default)
 *  4) add your project-specific paths if needed
 */
const CANDIDATES = [
  process.env.OUTPUT_DIR && path.resolve(process.env.OUTPUT_DIR),
  path.join(__dirname, 'dist'),
  path.join(__dirname, 'dist', 'browser'),
  // If your project name is known, you can uncomment/add:
  // path.join(__dirname, 'dist', 'material-requests-app.web'),
  // path.join(__dirname, 'dist', 'material-requests-app.web', 'browser'),
].filter(Boolean);

const distPath =
  CANDIDATES.find(p => {
    try { return fs.existsSync(path.join(p, 'index.html')); } catch { return false; }
  }) || CANDIDATES[0];

if (!fs.existsSync(path.join(distPath, 'index.html'))) {
  console.error('❌ Could not find index.html. Checked:');
  CANDIDATES.forEach(p => console.error('  -', p));
  console.error('👉 Ensure your Angular build outputs to one of these or set OUTPUT_DIR=/app/dist[/browser]');
  process.exit(1);
}

console.log('✅ Serving static from:', distPath);

// Static assets (cache aggressively except index.html)
app.use(express.static(distPath, {
  maxAge: '1y',
  setHeaders: (res, filePath) => {
    if (filePath.endsWith('index.html')) {
      res.setHeader('Cache-Control', 'no-store');
    }
  }
}));

// Simple healthcheck
app.get('/healthz', (_req, res) => res.status(200).send('ok'));

// SPA fallback — use RegExp with Express 5 (DO NOT use '/*' or '/(.*)')
// If you need to exclude API routes ho
