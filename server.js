// server.js
const express = require('express');
const path = require('path');
const app = express();

const dist = path.join(__dirname, 'dist'); // fallback; adjust below if needed

// Try common Angular 15–18 output folders
const candidates = [
  path.join(__dirname, 'dist', 'browser'),            // Angular 17/18 builder
  path.join(__dirname, 'dist', 'material-requests-app.web', 'browser'), // project-name guess
  path.join(__dirname, 'dist', 'material-requests-app.web'),            // classic
  dist
];

const staticRoot = candidates.find(p => require('fs').existsSync(p)) || candidates[0];
console.log('Serving static from:', staticRoot);

// Static files
app.use(express.static(staticRoot));

// SPA fallback
app.get('*', (_req, res) => {
  res.sendFile(path.join(staticRoot, 'index.html'));
});

// Bind to the port Heroku provides
const port = process.env.PORT || 8080;
app.listen(port, () => console.log(`Server running on port ${port}`));
