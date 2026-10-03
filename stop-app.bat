@echo off
chcp 65001 >nul
cd /d "%~dp0"
title Зупинка: Робочий простір

echo ===================================================
echo           ЗУПИНКА: РОБОЧИЙ ПРОСТІР
echo ===================================================
echo.

node -e "
const { execSync } = require('child_process');
try {
  const output = execSync('netstat -aon', { encoding: 'utf8' });
  const lines = output.split('\n');
  const pids = new Set();
  for (const line of lines) {
    if (line.includes(':3000') && line.includes('LISTENING')) {
      const parts = line.trim().split(/\s+/);
      const pid = parts[parts.length - 1];
      if (pid && pid !== '0') pids.add(pid);
    }
  }
  for (const pid of pids) {
    console.log('Зупинка процесу з PID:', pid);
    try { execSync('taskkill /F /PID ' + pid); } catch (e) {}
  }
  if (pids.size === 0) {
    console.log('Активних процесів на порту 3000 не знайдено.');
  } else {
    console.log('Додаток успішно зупинено.');
  }
} catch (err) {
  console.log('Помилка при перевірці процесів:', err.message);
}
"

echo.
timeout /t 3
