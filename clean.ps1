$lines = Get-Content app.js -Encoding UTF8
$cleanLines = $lines[0..1705]
$cleanLines | Set-Content app_clean.js -Encoding UTF8
Write-Host "File cleaned!"
