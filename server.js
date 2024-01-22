const express = require('express');
const { spawn } = require('child_process');
const app = express();
app.use(express.static('public')); // serves static files from the 'public' directory

app.get('/search', (req, res) => {
  const searchTerm = req.query.term;

  const searchProcess = spawn('node', ['search.js', searchTerm]);

  searchProcess.stderr.on('data', (data) => {
    console.error(`stderr: ${data}`);
  });

  searchProcess.on('close', (code) => {
    if (code !== 0) {
      res.status(500).end();
    } else {
      res.redirect('/search.html');
    }
  });
});

app.listen(3000, () => {
  console.log('Server running on port 3000');
});