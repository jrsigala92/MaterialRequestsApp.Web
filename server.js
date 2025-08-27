const express = require('express');
const path = require('path');

const app = express();

// Adjust this to your actual Angular output path after build
// Angular 17+: usually dist/<project-name>/browser
const distPath = path.join(__dirname, 'dist'); 
app.use(express.static(distPath));

// ✅ Use a RegExp catch-all (works in Express 4 & 5)
app.get(/.*/, (req, res) => {
  res.sendFile(path.join(distPath, 'index.html'));
});

// Heroku port binding
const port = process.env.PORT || 8080;
app.listen(port, () => console.log(`Listening on ${port}`));
