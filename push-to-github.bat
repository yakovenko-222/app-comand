@echo off
chcp 65001 >nul
title Відправка коду на GitHub
echo ===================================================
echo   Надсилання коду до репозиторію yakovenko213/app-comand
echo ===================================================
echo.
git remote set-url origin https://github.com/yakovenko213/app-comand.git

echo Зберігаємо зміни у Git...
git add .
git commit -m "Оновлення додатку: розділ замовлень, виправлення навігації та оновлення v1.1" 2>nul

echo.
echo Відправляємо на GitHub...
echo Якщо з'явиться вікно авторизації - оберіть "Sign in with your browser"
echo.
git push -u origin main

if errorlevel 1 (
    echo.
    echo ===================================================
    echo Якщо виникла помилка авторизації (Permission denied):
    echo.
    echo 1. Відкрийте https://github.com/yakovenko213/app-comand/settings/access
    echo 2. Додайте ваш акаунт у співавтори або виконайте вхід
    echo 3. Спробуйте запустити цей скрипт ще раз!
    echo ===================================================
) else (
    echo.
    echo ===================================================
    echo [Успіх] Код завантажено на GitHub!
    echo Онлайн-збірка APK вже почалася на GitHub Actions!
    echo.
    echo 1. Відстежувати процес збірки:
    echo    https://github.com/yakovenko213/app-comand/actions
    echo.
    echo 2. Завантажити готовий оновлений APK на телефон:
    echo    https://github.com/yakovenko213/app-comand/releases
    echo ===================================================
)
pause
