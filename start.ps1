# Microfrontends Startup Script (PowerShell)

Write-Host ""
Write-Host "🚀 Starting Microfrontends Demo..." -ForegroundColor Green
Write-Host ""
Write-Host "Host App:     http://localhost:3000" -ForegroundColor Cyan
Write-Host "Products:     http://localhost:3001" -ForegroundColor Cyan
Write-Host "Cart:         http://localhost:3002" -ForegroundColor Cyan
Write-Host ""
Write-Host "Press Ctrl+C to stop all applications" -ForegroundColor Yellow
Write-Host ""

pnpm run dev
