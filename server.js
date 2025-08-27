// server.js
const express = require('express');
const path = require('path');
const app = express();

const distPath = path.join(__dirname, 'dist'); // adjust if your build outputs elsewhere
app.use(express.static(distPath, { maxAge: '1y', setHeaders: (res, p) => {
  if (p.endsWith('index.html')) res.setHeader('Cache-Control', 'no-store');
}}));

// ✅ Valid catch-all for client routes (Angular)
app.get('/(.*)', (req, res) => {
  res.sendFile(path.join(distPath, 'index.html'));
});

const port = process.env.PORT || 3000;
app.listen(port, () => console.log(`Listening on ${port}`));
