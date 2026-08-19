# Step 1: Add hosts entry
$hostsPath = "C:\Windows\System32\drivers\etc\hosts"
$entry = "127.0.0.1 agenticneuro"
$content = Get-Content $hostsPath -Raw
if ($content -notmatch "agenticneuro") {
    Add-Content -Path $hostsPath -Value "`n$entry" -Force
    Write-Host "[OK] Hosts entry added: $entry" -ForegroundColor Green
} else {
    Write-Host "[OK] Hosts entry already exists." -ForegroundColor Yellow
}

# Step 2: Start server on port 80
Write-Host ""
Write-Host "Starting server at http://agenticneuro ..." -ForegroundColor Cyan
Write-Host "Press Ctrl+C to stop the server." -ForegroundColor Gray
Write-Host ""
Set-Location "c:\Users\mohan\.gemini\antigravity\scratch\enterprise-repo-dashboard"
python -m http.server 80
