@echo off
chcp 65001 >nul
title Відкриття проєкту в Android Studio
echo ===================================================
echo   Запуск Android проєкту в Android Studio
echo ===================================================

set "JAVA_HOME=D:\saves1\jbr"
set "PATH=%JAVA_HOME%\bin;%PATH%"

echo [1/2] Оновлення та синхронізація коду додатку...
call pnpm run build:android

echo.
echo [2/2] Відкриття Android Studio...
if exist "D:\saves1\bin\studio64.exe" (
    start "" "D:\saves1\bin\studio64.exe" "%~dp0android"
    echo Android Studio успішно відкрито з вашим проєктом!
) else (
    call npx cap open android
)

echo.
echo ===================================================
echo  Як отримати APK файл в Android Studio:
echo  1. Зачекайте завершення Gradle Sync.
echo  2. У верхньому меню оберіть: Build - Build APK
echo  3. Після завершення натисніть locate для копіювання app-debug.apk
echo ===================================================
pause
