// server.js
const express = require('express');
const path = require('path');

const app = express();

// 👉 Angular application builder outputs the SPA to dist/browser
const distPath = path.join(__dirname, 'dist', 'browser');

app.use(express.static(distPath, {
  maxAge: '1y',
  setHeaders: (res, filePath) => {
    if (filePath.endsWith('index.html')) {
      res.setHeader('Cache-Control', 'no-store');
    }
  }
}));

// Valid catch-all for Express 5
app.get('/(.*)', (req, res) => {
  res.sendFile(path.join(distPath, 'index.html'));
});

const port = process.env.PORT || 3000;
app.listen(port, () => console.log(`Listening on ${port}`));
