# Run this script from the repository root: C:\projetos\lucx auto detailing
Set-Location -Path "$PSScriptRoot"
Write-Host "Installing dependencies..."
npm install
Write-Host "Starting site at http://localhost:3000"
node index.js