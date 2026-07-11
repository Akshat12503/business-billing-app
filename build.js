// build.js
// Automatically updates the service worker cache version before every deploy.
// Run via: node build.js

const fs   = require("fs");
const path = require("path");

const swPath  = path.join(__dirname, "service-worker.js");
const version = `billbook-v${Date.now()}`;

let content = fs.readFileSync(swPath, "utf8");

// Replace whatever the current CACHE_NAME value is with the new one
content = content.replace(
    /const CACHE_NAME\s*=\s*['"`][^'"`]*['"`]/,
    `const CACHE_NAME = '${version}'`
);

fs.writeFileSync(swPath, content, "utf8");

console.log(`✅ Service worker updated to: ${version}`);