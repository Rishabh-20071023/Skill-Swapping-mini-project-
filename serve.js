/* =============================================================================
   SkillLoom — local development server
   Zero-dependency static file server so the site can be demoed over http://
   (ES-module-free scripts also work from file://, but a server is closer to
   production and avoids browser quirks).

     node serve.js            → http://localhost:4173
     node serve.js 8080       → http://localhost:8080
   ========================================================================== */

const http = require("http");
const fs = require("fs");
const path = require("path");

const ROOT = __dirname;
const PORT = Number(process.argv[2]) || 4173;

const MIME = {
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".svg": "image/svg+xml",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".ico": "image/x-icon",
  ".woff2": "font/woff2",
  ".map": "application/json",
};

const server = http.createServer((req, res) => {
  try {
    const url = decodeURIComponent(req.url.split("?")[0]);
    let filePath = path.normalize(path.join(ROOT, url));

    // No traversal outside the project folder.
    if (!filePath.startsWith(ROOT)) {
      res.writeHead(403).end("Forbidden");
      return;
    }

    if (fs.existsSync(filePath) && fs.statSync(filePath).isDirectory()) {
      filePath = path.join(filePath, "index.html");
    }
    if (!fs.existsSync(filePath)) {
      // Friendly fallback: 404 page for unknown html routes.
      const notFound = path.join(ROOT, "404.html");
      if (fs.existsSync(notFound)) {
        res.writeHead(404, { "Content-Type": "text/html; charset=utf-8" });
        res.end(fs.readFileSync(notFound));
        return;
      }
      res.writeHead(404).end("Not found");
      return;
    }

    const ext = path.extname(filePath).toLowerCase();
    res.writeHead(200, {
      "Content-Type": MIME[ext] || "application/octet-stream",
      "Cache-Control": "no-cache",
    });
    fs.createReadStream(filePath).pipe(res);
  } catch (err) {
    res.writeHead(500).end("Server error");
  }
});

server.listen(PORT, () => {
  console.log(`SkillLoom dev server → http://localhost:${PORT}`);
});
