const express = require('express');
const path = require('path');
const fs = require('fs');

const app = express();

// Primary output path for your project name:
const distPrimary = path.join(__dirname, 'dist', 'MaterialRequestsApp.Web', 'browser');

// Fallbacks in case outputPath is changed in the future:
const distAlt1 = path.join(__dirname, 'dist', 'MaterialRequestsApp.Web');
const distAlt2 = path.join(__dirname, 'dist');

const distDir = [distPrimary, distAlt1, distAlt2].find(p => fs.existsSync(p)) || distPrimary;

app.disable('x-powered-by');

// Serve static assets with caching for hashed files
app.use(express.static(distDir, { maxAge: '1y', etag: false }));

// SPA fallback for Angular router (deep links)
app.get('*', (_, res) => {
  res.sendFile(path.join(distDir, 'index.html'));
});

const port = process.env.PORT || 8080;
app.listen(port, () => {
  console.log(`✅ Angular app is running. Serving from: ${distDir}. Port: ${port}`);
});
