@echo off
chcp 65001 >nul
title Відправка коду на GitHub
echo ===================================================
echo   Надсилання коду до репозиторію yakovenko213/app-comand
echo ===================================================
echo.
git remote set-url origin https://github.com/yakovenko213/app-comand.git

echo Відправляємо на GitHub...
echo Якщо з'явиться вікно авторизації - оберіть "Sign in with your browser"
echo.
git push -u origin main

if errorlevel 1 (
    echo.
    echo ===================================================
    echo Якщо виникла помилка 403 (Permission denied to yakovenko2):
    echo.
    echo Варіант А (найшвидший):
    echo Додайте акаунт yakovenko2 у співавтори репозиторію:
    echo 1. Відкрийте https://github.com/yakovenko213/app-comand/settings/access
    echo 2. Натисніть "Add people" і додайте користувача: yakovenko2
    echo 3. Спробуйте запустити цей скрипт ще раз!
    echo ===================================================
) else (
    echo.
    echo ===================================================
    echo [Успіх] Код завантажено!
    echo Онлайн-збірка APK вже почалася на GitHub!
    echo Перевірте вкладку Actions:
    echo https://github.com/yakovenko213/app-comand/actions
    echo ===================================================
)
pause
