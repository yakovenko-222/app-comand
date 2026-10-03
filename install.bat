@echo off
chcp 65001 >nul
cd /d "%~dp0"
title Встановлення: Робочий простір

echo ===================================================
echo      ВСТАНОВЛЕННЯ ДОДАТКУ "РОБОЧИЙ ПРОСТІР" НА ПК
echo ===================================================
echo.

:: 1. Перевірка Node.js
where node >nul 2>nul
if %errorlevel% neq 0 (
    echo [ПОМИЛКА] Node.js не знайдено на вашому ПК!
    echo Будь ласка, завантажте та встановіть Node.js: https://nodejs.org/
    echo Після встановлення запустіть цей файл знову.
    echo.
    pause
    exit /b 1
)

echo [1/4] Node.js знайдено.
node -v

:: 2. Перевірка / встановлення pnpm
echo.
echo [2/4] Перевірка менеджера пакетів pnpm...
where pnpm >nul 2>nul
if %errorlevel% neq 0 (
    echo Встановлюємо pnpm...
    call npm install -g pnpm
)

:: 3. Встановлення залежностей
echo.
echo [3/4] Встановлення залежностей...
call pnpm install
if %errorlevel% neq 0 (
    echo [ПОМИЛКА] Не вдалося встановити залежності!
    pause
    exit /b 1
)

:: 4. Збірка проєкту
echo.
echo [4/4] Створення оптимізованої збірки...
call pnpm run build
if %errorlevel% neq 0 (
    echo [ПОМИЛКА] Збірка не вдалася!
    pause
    exit /b 1
)

:: 5. Створення ярлика на робочому столі
echo.
echo Створення ярлика на робочому столі Windows...
node "%~dp0scripts\create-shortcut.js"

echo.
echo ===================================================
echo    ВСТАНОВЛЕННЯ УСПІШНО ЗАВЕРШЕНО!
echo ===================================================
echo.
echo Тепер ви можете запускати додаток:
echo  1. Через ярлик "Робочий простір" на робочому столі
echo  2. Або подвійним кліком на start-app.bat
echo.
pause
