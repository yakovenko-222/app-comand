@echo off
chcp 65001 >nul
cd /d "%~dp0"
title Робочий простір

echo ===================================================
echo           ЗАПУСК: РОБОЧИЙ ПРОСТІР
echo ===================================================
echo.

node scripts\start-app.js

if %errorlevel% neq 0 (
    echo.
    echo [ПОМИЛКА] Не вдалося запустити додаток!
    echo Перевірте, чи встановлено Node.js та чи виконано встановлення (install.bat).
    pause
)
