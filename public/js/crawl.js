const axios = require('axios');
const cheerio = require('cheerio');
const sqlite3 = require('sqlite3').verbose();
const robots = require('robots');
const process = require('process');
const { URL } = require('url');

// Create and connect to a SQLite database
const db = new sqlite3.Database('crawldata.db');

// Create a table to store crawled data
db.serialize(() => {
  db.run("CREATE TABLE IF NOT EXISTS crawled_data (url TEXT, title TEXT, description TEXT, backlinks INTEGER DEFAULT 1)");
});

// Extract the starting URL from the command line arguments
const startUrl = process.argv[2];

if (!startUrl) {
  console.error('Usage: node index.js <starting-url>');
  process.exit(1);
}

const visitedUrls = new Set();
const robotsParser = new robots.RobotsParser();

async function crawl(url) {
  const backlinks = [];
  try {
    // Check if the URL has already been visited
    if (visitedUrls.has(url)) {
      // Increment the backlink count
      db.run("UPDATE crawled_data SET backlinks = backlinks + 1 WHERE url = ?", [url]);
      return;
    }

    console.log(`Crawling: ${url}`); // Log the current URL
    visitedUrls.add(url);

    try {
      // Fetch and parse robots.txt for the current URL
      const domainUrl = new URL(url);
      const robotsUrl = `${domainUrl.protocol}//${domainUrl.hostname}/robots.txt`;
      await new Promise((resolve, reject) => {
        robotsParser.setUrl(robotsUrl, (parser, success) => {
          if (success) {
            resolve();
          } else {
            // Treat failure to fetch or parse robots.txt as if everything is allowed
            console.warn(`Failed to fetch or parse robots.txt for ${url}. Treating as allowed.`);
            resolve();
          }
        });
      });
    } catch (robotsError) {
      console.warn(`Error fetching or parsing robots.txt for ${url}: ${robotsError.message}. Treating as allowed.`);
    }

    // URL is allowed since robots.txt fetch or parse was successful or failed
    const response = await axios.get(url, {
      maxRedirects: 5, // Set the maximum number of redirects to follow
      validateStatus: status => status < 400, // Allow following redirects for 4xx errors
    });

    const $ = cheerio.load(response.data);

    // Extract metadata
    const title = $('head title').text();
    let description = $('head meta[name="description"]').attr('content');

    // Replace null description with a generic error message
    if (!description) {
      description = 'Error: Description not available';
    }

    // Save data to SQLite database
    description = description.substring(0, 200);

    db.run("INSERT INTO crawled_data (url, title, description, backlinks) VALUES (?, ?, ?, ?)", [url, title, description, backlinks]);
    console.log(`Saved to database: ${url}`)

    // Extract links and crawl recursively
    const links = [];
    $('a').each((_, element) => {
      const link = $(element).attr('href');
      if (link && link.startsWith('http')) {
        links.push(link);
      }
    });

    // Use Promise.all to crawl links concurrently
    await Promise.all(links.map(link => crawl(link)));
  } catch (error) {
    console.error(`Error crawling ${url}: ${error.message}`);
  }
}

// Start crawling
crawl(startUrl)
  .then(() => {
    console.log('Crawling completed.');
    db.close(); // Close the SQLite database connection after crawling is completed
    process.exit(0); // Exit with code 0 on successful completion
  })
  .catch(error => {
    console.error(`Crawling failed: ${error.message}`);
    db.close(); // Close the SQLite database connection if crawling fails
    process.exit(1); // Exit with code 1 on failure
  });
