$ErrorActionPreference = "Stop"

$scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$projectDir = (Resolve-Path (Join-Path $scriptDir "..")).Path
$desktopDir = [Environment]::GetFolderPath("Desktop")

$shortcutPath = Join-Path $desktopDir "Робочий простір.lnk"
$vbsPath = Join-Path $projectDir "start-silent.vbs"
$batPath = Join-Path $projectDir "start-app.bat"
$iconPath = Join-Path $projectDir "public\app-icon.ico"

# Use WScript.Shell COM object
$WshShell = New-Object -ComObject WScript.Shell
$Shortcut = $WshShell.CreateShortcut($shortcutPath)

if (Test-Path $vbsPath) {
    $Shortcut.TargetPath = "wscript.exe"
    $Shortcut.Arguments = "`"$vbsPath`""
} else {
    $Shortcut.TargetPath = $batPath
}

$Shortcut.WorkingDirectory = $projectDir
$Shortcut.Description = "Робочий простір команди"

if (Test-Path $iconPath) {
    $Shortcut.IconLocation = "$iconPath,0"
}

$Shortcut.Save()
Write-Host "Ярлик успішно створено на робочому столі: $shortcutPath" -ForegroundColor Green
