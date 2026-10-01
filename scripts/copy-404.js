// Cloudflare (not_found_handling: "404-page") busca dist/404.html; Expo exporta +not-found.html.
const fs = require('node:fs');
const path = require('node:path');

const dist = path.join(__dirname, '..', 'dist');
fs.copyFileSync(path.join(dist, '+not-found.html'), path.join(dist, '404.html'));
