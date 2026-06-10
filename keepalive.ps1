# LucX dev keep-alive watchdog.
# Keeps the Express server (port 3000) AND the ngrok tunnel alive,
# auto-restarting whichever goes down. Runs until you stop it.
# Stop with:  Get-Process pwsh,ngrok,node -ErrorAction SilentlyContinue | Stop-Process -Force
$dir = "c:\projetos\lucx auto detailing"
$log = Join-Path $dir "keepalive.log"
"[{0}] keep-alive started" -f (Get-Date -Format "u") | Out-File $log -Append

while ($true) {
  # --- ensure server ---
  $serverUp = $false
  try {
    $r = Invoke-WebRequest -UseBasicParsing -Uri "http://localhost:3000/" -TimeoutSec 5
    $serverUp = ($r.StatusCode -eq 200)
  } catch { $serverUp = $false }
  if (-not $serverUp) {
    "[{0}] server down -> restarting" -f (Get-Date -Format "u") | Out-File $log -Append
    Start-Process -FilePath "node" -ArgumentList "index.js" -WorkingDirectory $dir -WindowStyle Hidden
    Start-Sleep -Seconds 3
  }

  # --- ensure ngrok tunnel ---
  $ngrokUp = $false
  try {
    $t = Invoke-WebRequest -UseBasicParsing -Uri "http://127.0.0.1:4040/api/tunnels" -TimeoutSec 5
    $ngrokUp = ($t.Content -match "public_url")
  } catch { $ngrokUp = $false }
  if (-not $ngrokUp) {
    "[{0}] tunnel down -> restarting ngrok" -f (Get-Date -Format "u") | Out-File $log -Append
    Get-Process ngrok -ErrorAction SilentlyContinue | Stop-Process -Force
    Start-Sleep -Seconds 1
    Start-Process -FilePath "ngrok" -ArgumentList "http","3000","--log=stdout" -WindowStyle Hidden
    Start-Sleep -Seconds 4
  }

  Start-Sleep -Seconds 30
}
