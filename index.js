require('dotenv').config();
const express = require('express');
const cors = require('cors');
const app = express();
const bodyParser = require('body-parser');
const dns = require('dns');


// Basic Configuration
const port = process.env.PORT || 3000;

app.use(cors());
app.use(bodyParser.urlencoded({ extended: false }));

app.use('/public', express.static(`${process.cwd()}/public`));

app.get('/', function(req, res) {
  res.sendFile(process.cwd() + '/views/index.html');
});

let urlDatabase = {};
let shortUrlCounter = 1;

const isValidUrl = (url, callback) => {
  try {
    let formattedUrl = url;

    // Ensure the URL includes a protocol
    if (!/^https?:\/\//i.test(url)) {
      formattedUrl = 'http://' + url;
    }

    // Extract the hostname (e.g., www.google.com)
    const hostname = new URL(formattedUrl).hostname;

    dns.lookup(hostname, (err) => {
      callback(!err);
    });
  } catch (error) {
    callback(false);
  }
};

// Your first API endpoint
app.get('/api/hello', function(req, res) {
  res.json({ greeting: 'hello API' });
});

app.post('/api/shorturl', (req, res) => {
  const originalUrl = req.body.url;

  isValidUrl(originalUrl, (valid) => {
    if (!valid) {
      return res.json({ error: 'invalid url' });
    }

    // Check if URL is already shortened
    if (!urlDatabase[originalUrl]) {
      urlDatabase[originalUrl] = shortUrlCounter++;
    }

    res.json({
      original_url: originalUrl,
      short_url: urlDatabase[originalUrl],
    });
  });
});

app.get('/api/shorturl/:short_url', (req, res) => {
  const shortUrl = parseInt(req.params.short_url);
  const originalUrl = Object.keys(urlDatabase).find(
    (key) => urlDatabase[key] === shortUrl
  );

  if (originalUrl) {
    res.redirect(originalUrl);
  } else {
    res.json({ error: 'No short URL found' });
  }
});

app.listen(port, function() {
  console.log(`Listening on port ${port}`);
});
