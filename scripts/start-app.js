const { spawn, exec } = require('child_process');
const fs = require('fs');
const path = require('path');
const { start } = require('../server.js');

const ROOT_DIR = path.resolve(__dirname, '..');
const OUT_DIR = path.join(ROOT_DIR, 'out');

// Common browser locations on Windows
const BROWSER_PATHS = [
  'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe',
  'C:\\Program Files\\Microsoft\\Edge\\Application\\msedge.exe',
  'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
  'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe',
];

function findAppBrowser() {
  for (const p of BROWSER_PATHS) {
    if (fs.existsSync(p)) {
      return p;
    }
  }
  return null;
}

function openAppWindow(appUrl) {
  const browserPath = findAppBrowser();

  if (browserPath) {
    console.log(`Запуск у режимі віконного додатку через: ${path.basename(browserPath)}`);
    const proc = spawn(browserPath, [`--app=${appUrl}`, '--window-size=1200,800'], {
      detached: true,
      stdio: 'ignore',
    });
    proc.unref();
  } else {
    console.log('Відкриття у стандартному браузері...');
    const startCmd = process.platform === 'win32' ? `start "" "${appUrl}"` : `open "${appUrl}"`;
    exec(startCmd);
  }
}

async function main() {
  // 1. Check if build exists
  if (!fs.existsSync(path.join(OUT_DIR, 'index.html'))) {
    console.log('Директорія збірки не знайдена. Виконується збірка проєкту...');
    const buildProcess = spawn(process.platform === 'win32' ? 'pnpm.cmd' : 'pnpm', ['run', 'build'], {
      cwd: ROOT_DIR,
      stdio: 'inherit',
      shell: true,
    });

    await new Promise((resolve, reject) => {
      buildProcess.on('close', (code) => {
        if (code === 0) resolve();
        else reject(new Error(`Збірка завершилась з кодом помилки: ${code}`));
      });
    });
  }

  // 2. Start server
  const port = await start();
  const targetUrl = `http://localhost:${port}/tasks`;

  // 3. Launch window
  openAppWindow(targetUrl);
  console.log(`\nДодаток запущено! Щоб зупинити, натисніть Ctrl+C у цьому вікні.`);
}

main().catch((err) => {
  console.error('Помилка запуску:', err);
  process.exit(1);
});
