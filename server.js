// server.js
const express = require('express');
const path = require('path');
const fs = require('fs');

const app = express();

// Try common Angular output locations (Angular v16/v17+)
const candidates = [
  path.join(__dirname, 'dist', 'browser'),
  path.join(__dirname, 'dist'),                                  // if you force outputPath=dist
  path.join(__dirname, 'dist', 'MaterialRequestsApp.Web', 'browser'), // replace with your project name if known
  path.join(__dirname, 'dist', 'MaterialRequestsApp.Web'),
];

let distPath = candidates.find(p => fs.existsSync(path.join(p, 'index.html')));
if (!distPath) {
  console.error('Could not find index.html. Checked:', candidates);
  process.exit(1);
}

console.log('Serving static from:', distPath);

// Static assets
app.use(express.static(distPath, {
  maxAge: '1y',
  setHeaders: (res, filePath) => {
    if (filePath.endsWith('index.html')) res.setHeader('Cache-Control', 'no-store');
  },
}));

// Valid catch-all for Express 5 / path-to-regexp v6
app.get('/(.*)', (req, res) => {
  res.sendFile(path.join(distPath, 'index.html'));
});

const port = process.env.PORT || 3000;
app.listen(port, () => console.log(`Listening on ${port}`));
