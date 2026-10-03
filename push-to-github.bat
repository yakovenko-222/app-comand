@echo off
chcp 65001 >nul
title Публікація на GitHub для онлайн збірки APK
echo ===================================================
echo   Публікація на GitHub для автоматичної збірки APK
echo ===================================================
echo.
echo 1. Створіть новий порожній репозиторій на https://github.com/new
echo    (не додавайте README, .gitignore чи ліцензію, просто назвіть його).
echo.
echo 2. Скопіюйте посилання на ваш репозиторій.
echo    Приклад: https://github.com/ваш_логін/назва_репозиторію.git
echo.
set /p REPO_URL="Введіть або вставте URL вашого репозиторію: "

if "%REPO_URL%"=="" (
    echo [Помилка] URL не введено.
    pause
    exit /b 1
)

echo.
echo Налаштування віддаленого репозиторію...
git remote remove origin 2>nul
git remote add origin %REPO_URL%
git branch -M main

echo.
echo Надсилання коду на GitHub...
git push -u origin main

if errorlevel 1 (
    echo.
    echo [Помилка] Не вдалося відправити код. Перевірте посилання або авторизацію в Git.
    pause
    exit /b 1
)

echo.
echo ===================================================
echo [Успіх] Код успішно завантажено на GitHub!
echo.
echo Онлайн збірка APK вже запустилася автоматично!
echo.
echo Що робити далі:
echo 1. Відкрийте ваш репозиторій на GitHub.
echo 2. Перейдіть у вкладку "Actions" (зверху).
echo 3. Оберіть запуск "Build Android APK" - за 2-3 хвилини
echo    у розділі "Artifacts" або "Releases" з'явиться готовий
echo    файл app-debug.apk для встановлення на телефон!
echo ===================================================
pause
