const express = require('express');
const cors = require('cors');
const sqlite3 = require('sqlite3').verbose();
const url = require('url');

const db = new sqlite3.Database('crawldata.db');
const query = `
SELECT url, title, description, backlinks
FROM crawled_data
WHERE title LIKE ? OR description LIKE ?
ORDER BY backlinks DESC
`;

function searchDatabase(term) {
  return new Promise((resolve, reject) => {
    db.all(query, [`%${term}%`, `%${term}%`], (err, rows) => {
      if (err) {
        reject(err);
      } else {
        resolve(rows);
      }
    });
  });
}

const app = express();

app.use(cors());

app.get('/search', async (req, res) => {
  const searchTerm = req.query.q;
  const numResults = Number(req.query.numResults);
  const page = Number(req.query.page) || 1;

  try {
    const results = await searchDatabase(searchTerm, numResults, page);
    res.json(results);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'An error occurred while searching the database.' });
  }
});

async function searchDatabase(term, numResults, page) {
  return new Promise((resolve, reject) => {
    const query = `
      SELECT url, title, description, backlinks
      FROM crawled_data
      WHERE title LIKE ? OR description LIKE ?
      ORDER BY backlinks DESC
      LIMIT ? OFFSET ?
    `;
    const offset = (page - 1) * numResults;
    db.all(query, [`%${term}%`, `%${term}%`, numResults, offset], (err, rows) => {
      if (err) {
        reject(err);
      } else {
        resolve(rows);
      }
    });
  });
}

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`)); // hope this works