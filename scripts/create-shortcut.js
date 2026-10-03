const path = require('path');
const os = require('os');
const { execSync } = require('child_process');

const desktopDir = path.join(os.homedir(), 'Desktop');
const projectDir = path.resolve(__dirname, '..');
const shortcutPath = path.join(desktopDir, 'Робочий простір.lnk');
const vbsPath = path.join(projectDir, 'start-silent.vbs');
const iconPath = path.join(projectDir, 'public', 'app-icon.ico');

const b64ShortcutPath = Buffer.from(shortcutPath, 'utf8').toString('base64');
const b64Description = Buffer.from('Робочий простір команди', 'utf8').toString('base64');
const b64VbsPath = Buffer.from(vbsPath, 'utf8').toString('base64');
const b64ProjectDir = Buffer.from(projectDir, 'utf8').toString('base64');
const b64IconPath = Buffer.from(iconPath, 'utf8').toString('base64');

const psScript = `
$shortcutPath = [System.Text.Encoding]::UTF8.GetString([System.Convert]::FromBase64String('${b64ShortcutPath}'))
$desc = [System.Text.Encoding]::UTF8.GetString([System.Convert]::FromBase64String('${b64Description}'))
$vbsPath = [System.Text.Encoding]::UTF8.GetString([System.Convert]::FromBase64String('${b64VbsPath}'))
$projectDir = [System.Text.Encoding]::UTF8.GetString([System.Convert]::FromBase64String('${b64ProjectDir}'))
$iconPath = [System.Text.Encoding]::UTF8.GetString([System.Convert]::FromBase64String('${b64IconPath}'))

$WshShell = New-Object -ComObject WScript.Shell
$Shortcut = $WshShell.CreateShortcut($shortcutPath)
$Shortcut.TargetPath = "wscript.exe"
$Shortcut.Arguments = '"' + $vbsPath + '"'
$Shortcut.WorkingDirectory = $projectDir
$Shortcut.Description = $desc
if (Test-Path $iconPath) {
    $Shortcut.IconLocation = $iconPath + ',0'
}
$Shortcut.Save()
`;

try {
  const encodedCommand = Buffer.from(psScript, 'utf16le').toString('base64');
  execSync(`powershell -NoProfile -ExecutionPolicy Bypass -EncodedCommand ${encodedCommand}`, { stdio: 'inherit' });
  console.log('Ярлик успішно створено:', shortcutPath);
} catch (err) {
  console.error('Помилка при створенні ярлика:', err);
  process.exit(1);
}
