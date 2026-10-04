const http = require('http');
const fs = require('fs');
const path = require('path');
const url = require('url');

const DEFAULT_PORT = parseInt(process.env.PORT, 10) || 3000;
const OUT_DIR = path.resolve(__dirname, 'out');

const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.mjs': 'application/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.webmanifest': 'application/manifest+json; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.gif': 'image/gif',
  '.ico': 'image/x-icon',
  '.webp': 'image/webp',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
  '.ttf': 'font/ttf',
  '.otf': 'font/otf',
  '.txt': 'text/plain; charset=utf-8',
  '.xml': 'application/xml',
};

function resolveFilePath(reqPath) {
  const cleanPath = decodeURIComponent(reqPath.split('?')[0].split('#')[0]);
  const relativePath = cleanPath === '/' ? '/index.html' : cleanPath;
  const fullPath = path.join(OUT_DIR, relativePath);

  // Security check: ensure path is inside OUT_DIR
  if (!fullPath.startsWith(OUT_DIR)) {
    return null;
  }

  // 1. Direct file match
  if (fs.existsSync(fullPath) && fs.statSync(fullPath).isFile()) {
    return fullPath;
  }

  // 2. Clean URL match: /tasks -> /tasks.html
  const htmlPath = fullPath + '.html';
  if (fs.existsSync(htmlPath) && fs.statSync(htmlPath).isFile()) {
    return htmlPath;
  }

  // 3. Directory index: /tasks/ -> /tasks/index.html
  const indexPath = path.join(fullPath, 'index.html');
  if (fs.existsSync(indexPath) && fs.statSync(indexPath).isFile()) {
    return indexPath;
  }

  // 4. Fallback 404
  const notFoundPath = path.join(OUT_DIR, '404.html');
  if (fs.existsSync(notFoundPath)) {
    return notFoundPath;
  }

  return null;
}

const os = require('os');

function getLocalIpAddresses() {
  const interfaces = os.networkInterfaces();
  const ips = [];
  for (const name of Object.keys(interfaces)) {
    for (const iface of interfaces[name]) {
      if (iface.family === 'IPv4' && !iface.internal) {
        ips.push(iface.address);
      }
    }
  }
  return ips;
}

function createServer(port) {
  return new Promise((resolve, reject) => {
    const server = http.createServer((req, res) => {
      // CORS and security headers for local app
      res.setHeader('Access-Control-Allow-Origin', '*');
      res.setHeader('X-Content-Type-Options', 'nosniff');

      if (req.method !== 'GET' && req.method !== 'HEAD') {
        res.statusCode = 405;
        res.end('Method Not Allowed');
        return;
      }

      const filePath = resolveFilePath(req.url);
      if (!filePath) {
        res.statusCode = 404;
        res.setHeader('Content-Type', 'text/plain; charset=utf-8');
        res.end('404 - Сторінку не знайдено');
        return;
      }

      const ext = path.extname(filePath).toLowerCase();
      const contentType = MIME_TYPES[ext] || 'application/octet-stream';
      const is404 = filePath.endsWith('404.html') && !req.url.includes('404');

      res.statusCode = is404 ? 404 : 200;
      res.setHeader('Content-Type', contentType);

      // Caching: cache static hashed assets, revalidate HTML
      if (ext === '.html') {
        res.setHeader('Cache-Control', 'no-cache');
      } else {
        res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');
      }

      const stream = fs.createReadStream(filePath);
      stream.on('error', (err) => {
        if (!res.headersSent) {
          res.statusCode = 500;
          res.end('Internal Server Error');
        }
      });
      stream.pipe(res);
    });

    server.listen(port, '0.0.0.0', () => {
      resolve({ server, port });
    });

    server.on('error', (err) => {
      if (err.code === 'EADDRINUSE') {
        resolve(createServer(port + 1));
      } else {
        reject(err);
      }
    });
  });
}

async function start() {
  if (!fs.existsSync(OUT_DIR)) {
    console.error('Помилка: директорія out/ відсутня. Спочатку виконайте збірку: pnpm run build');
    process.exit(1);
  }

  const { port } = await createServer(DEFAULT_PORT);
  const localIps = getLocalIpAddresses();

  console.log('====================================================');
  console.log(`[Робочий простір] Сервер успішно запущено!`);
  console.log(`💻 Локально на ПК:     http://localhost:${port}`);
  if (localIps.length > 0) {
    localIps.forEach((ip) => {
      console.log(`📱 На телефоні (Wi-Fi): http://${ip}:${port}`);
    });
  } else {
    console.log(`📱 На телефоні (Wi-Fi): http://<ВАШ_IP_КОМП'ЮТЕРА>:${port}`);
  }
  console.log('====================================================');
  return port;
}

if (require.main === module) {
  start().catch((err) => {
    console.error('Не вдалося запустити сервер:', err);
    process.exit(1);
  });
}

module.exports = { start, createServer };
