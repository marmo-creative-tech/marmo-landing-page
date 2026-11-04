const http = require('http');
const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');

const DEFAULT_PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 5500;
const ROOT = path.resolve(__dirname);

const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.mjs': 'application/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
  '.webp': 'image/webp',
  '.ico': 'image/x-icon',
  '.pdf': 'application/pdf',
  '.mp4': 'video/mp4',
  '.webm': 'video/webm',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
  '.ttf': 'font/ttf',
  '.otf': 'font/otf',
  '.txt': 'text/plain; charset=utf-8',
  '.md': 'text/plain; charset=utf-8'
};

const LIVE_RELOAD_SNIPPET = `
<!-- Code injected by Live Server -->
<script type="text/javascript">
  (function() {
    if (!window.EventSource) return;
    var es = new EventSource('/__live_reload');
    es.onmessage = function(e) {
      if (e.data === 'reload') {
        console.log('[Live Server] File changed, reloading page...');
        window.location.reload();
      }
    };
    es.onerror = function() {
      // Reconnection handled automatically
    };
  })();
</script>
`;

let clients = [];

function broadcastReload() {
  console.log(`[Live Server] Change detected, notifying ${clients.length} connected client(s)...`);
  clients.forEach(res => {
    try {
      res.write('data: reload\n\n');
    } catch (_) {}
  });
}

// Watch directory for changes with debounce
let debounceTimer = null;
try {
  fs.watch(ROOT, { recursive: true }, (eventType, filename) => {
    if (!filename) return;
    const normalized = filename.replace(/\\/g, '/');
    if (normalized.startsWith('.') || normalized.includes('/.') || normalized === 'live-server.js') {
      return;
    }
    clearTimeout(debounceTimer);
    debounceTimer = setTimeout(() => {
      console.log(`[Live Server] Change detected in: ${normalized}`);
      broadcastReload();
    }, 120);
  });
} catch (err) {
  console.warn('[Live Server] Recursive watch not supported, watching root:', err.message);
  fs.watch(ROOT, () => {
    clearTimeout(debounceTimer);
    debounceTimer = setTimeout(() => {
      broadcastReload();
    }, 120);
  });
}

const server = http.createServer((req, res) => {
  const parsedUrl = new URL(req.url, `http://${req.headers.host || 'localhost'}`);
  let pathname = decodeURIComponent(parsedUrl.pathname);

  // SSE endpoint for live reload
  if (pathname === '/__live_reload') {
    res.writeHead(200, {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache, no-transform',
      'Connection': 'keep-alive',
      'Access-Control-Allow-Origin': '*'
    });
    res.write('retry: 1000\n\n');
    clients.push(res);

    req.on('close', () => {
      clients = clients.filter(c => c !== res);
    });
    return;
  }

  // Normalize path
  if (pathname.endsWith('/')) {
    pathname += 'index.html';
  }

  const safePath = path.normalize(path.join(ROOT, pathname));

  // Security check: ensure path is within ROOT
  if (!safePath.startsWith(ROOT)) {
    res.writeHead(403, { 'Content-Type': 'text/plain; charset=utf-8' });
    res.end('403 Forbidden');
    return;
  }

  fs.stat(safePath, (err, stats) => {
    let targetPath = safePath;
    if (err) {
      res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
      res.end(`404 Not Found: ${pathname}`);
      return;
    }

    if (stats.isDirectory()) {
      targetPath = path.join(safePath, 'index.html');
      if (!fs.existsSync(targetPath)) {
        res.writeHead(403, { 'Content-Type': 'text/plain; charset=utf-8' });
        res.end('403 Directory listing denied');
        return;
      }
    }

    const ext = path.extname(targetPath).toLowerCase();
    const contentType = MIME_TYPES[ext] || 'application/octet-stream';

    // Inject live reload script into HTML files
    if (ext === '.html') {
      fs.readFile(targetPath, 'utf8', (readErr, content) => {
        if (readErr) {
          res.writeHead(500, { 'Content-Type': 'text/plain; charset=utf-8' });
          res.end('500 Error reading file');
          return;
        }

        let injected = content;
        if (injected.includes('</body>')) {
          injected = injected.replace('</body>', `${LIVE_RELOAD_SNIPPET}</body>`);
        } else {
          injected += LIVE_RELOAD_SNIPPET;
        }

        res.writeHead(200, {
          'Content-Type': contentType,
          'Cache-Control': 'no-cache, no-store, must-revalidate'
        });
        res.end(injected);
      });
      return;
    }

    // Stream other files
    res.writeHead(200, {
      'Content-Type': contentType,
      'Content-Length': stats.size,
      'Cache-Control': 'no-cache'
    });

    const stream = fs.createReadStream(targetPath);
    stream.pipe(res);
    stream.on('error', () => {
      if (!res.headersSent) {
        res.writeHead(500, { 'Content-Type': 'text/plain; charset=utf-8' });
        res.end('500 Stream error');
      }
    });
  });
});

function startServer(port) {
  server.listen(port, () => {
    const url = `http://localhost:${port}`;
    console.log(`\n======================================================`);
    console.log(`  ⚡ Live Server is running at: ${url}`);
    console.log(`  📂 Serving: ${ROOT}`);
    console.log(`  🔄 Auto-reload active on file change`);
    console.log(`======================================================\n`);

    // Attempt to open the URL in the default browser
    const startCmd = process.platform === 'win32' ? `start "" "${url}"` :
                     process.platform === 'darwin' ? `open "${url}"` : `xdg-open "${url}"`;
    exec(startCmd, () => {});
  });

  server.on('error', (err) => {
    if (err.code === 'EADDRINUSE') {
      console.warn(`[Live Server] Port ${port} is in use, attempting port ${port + 1}...`);
      startServer(port + 1);
    } else {
      console.error('[Live Server] Error starting server:', err);
    }
  });
}

startServer(DEFAULT_PORT);
