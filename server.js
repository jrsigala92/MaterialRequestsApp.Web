const express = require('express');
const path = require('path');
const fs = require('fs');

const app = express();

const distPrimary = path.join(__dirname, 'dist', 'MaterialRequestsApp.Web', 'browser');
const distAlt1 = path.join(__dirname, 'dist', 'MaterialRequestsApp.Web');
const distAlt2 = path.join(__dirname, 'dist');
const distDir = [distPrimary, distAlt1, distAlt2].find(p => fs.existsSync(p)) || distPrimary;

app.disable('x-powered-by');

// Serve static files
app.use(express.static(distDir, { maxAge: '1y', etag: false }));

// ✅ Express 5-compatible SPA fallback (matches anything after "/")
app.get('/:path(*)', (_, res) => {
  res.sendFile(path.join(distDir, 'index.html'));
});

const port = process.env.PORT || 8080;
app.listen(port, () => {
  console.log(`✅ Serving ${distDir} on port ${port}`);
});
