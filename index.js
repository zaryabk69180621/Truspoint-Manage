const express = require('express');
const path = require('path');
const compression = require('compression');
const app = express();
const PORT = process.env.PORT || 3000;

// Compression middleware
app.use(compression());

// ADD THIS - Force www to non-www
// SAFE REDIRECT - Only handle www to non-www, don't change protocol
app.use((req, res, next) => {
  const host = req.headers.host;
  
  // Only redirect www to non-www, preserve current protocol
  if (host.startsWith('www.')) {
    const newHost = host.replace('www.', '');
    // Use the current protocol instead of forcing https
    const protocol = req.secure ? 'https' : 'http';
    return res.redirect(301, `${protocol}://${newHost}${req.url}`);
  }
  next();
});
// Essential security headers
app.use((req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  next();
});

// Serve static files from root and fallback to public
app.use(express.static(__dirname));
app.use(express.static(path.join(__dirname, 'public')));

// Sitemap route
app.get('/sitemap.xml', (req, res) => {
  res.setHeader('Content-Type', 'application/xml');
  const sitemapPath = path.join(__dirname, 'sitemap.xml');
  res.sendFile(sitemapPath);
});

// Handle 404
app.use((req, res) => {
  res.status(404).sendFile(path.join(__dirname, '404.html'));
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

module.exports = app;