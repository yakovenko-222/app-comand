@echo off
chcp 65001 >nul
title Збірка Android APK
echo ===================================================
echo   Збірка Android APK для встановлення на телефон
echo ===================================================

set "JAVA_HOME=D:\saves1\jbr"
set "PATH=%JAVA_HOME%\bin;%PATH%"

echo [1/3] Перевірка та компіляція Next.js додатку...
call pnpm run build:android
if errorlevel 1 (
    echo [Помилка] Не вдалося скомпілювати Next.js.
    pause
    exit /b 1
)

echo.
echo [2/3] Збірка APK через Gradle...
cd /d "%~dp0android"

call gradlew.bat assembleDebug
if errorlevel 1 (
    echo.
    echo ===================================================
    echo Порада: для автоматичної безкоштовної онлайн-збірки
    echo запустіть скрипт push-to-github.bat!
    echo ===================================================
    pause
    exit /b 1
)

echo.
echo [3/3] APK успішно створено!
set "APK_PATH=%~dp0android\app\build\outputs\apk\debug\app-debug.apk"
echo Файл: %APK_PATH%
echo.
if exist "%APK_PATH%" (
    echo Відкриваємо папку з готовим APK...
    explorer /select,"%APK_PATH%"
)
echo ===================================================
pause
