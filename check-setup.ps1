# 检查 Sepolia 设置状态
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  Checking Sepolia Testnet Setup" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

$basePath = Get-Location

# 检查 .env 文件
Write-Host "1. Checking config files:" -ForegroundColor Yellow
$contractsEnv = Test-Path "$basePath\contracts\.env"
$serverEnv = Test-Path "$basePath\server\.env"
$clientEnv = Test-Path "$basePath\client\.env"

if ($contractsEnv) { Write-Host "   [OK] contracts/.env exists" -ForegroundColor Green } 
else { Write-Host "   [X] contracts/.env missing (need to create)" -ForegroundColor Red }

if ($serverEnv) { Write-Host "   [OK] server/.env exists" -ForegroundColor Green } 
else { Write-Host "   [X] server/.env missing (need to create)" -ForegroundColor Red }

if ($clientEnv) { Write-Host "   [OK] client/.env exists" -ForegroundColor Green } 
else { Write-Host "   [X] client/.env missing (need to create)" -ForegroundColor Red }

Write-Host ""

# 检查依赖
Write-Host "2. Checking dependencies:" -ForegroundColor Yellow
$contractsDeps = Test-Path "$basePath\contracts\node_modules"
$serverDeps = Test-Path "$basePath\server\node_modules"
$clientDeps = Test-Path "$basePath\client\node_modules"

if ($contractsDeps) { Write-Host "   [OK] Contract dependencies installed" -ForegroundColor Green } 
else { Write-Host "   [X] Contract dependencies missing (run: cd contracts; npm install)" -ForegroundColor Red }

if ($serverDeps) { Write-Host "   [OK] Server dependencies installed" -ForegroundColor Green } 
else { Write-Host "   [X] Server dependencies missing (run: cd server; npm install)" -ForegroundColor Red }

if ($clientDeps) { Write-Host "   [OK] Client dependencies installed" -ForegroundColor Green } 
else { Write-Host "   [X] Client dependencies missing (run: cd client; npm install)" -ForegroundColor Red }

Write-Host ""

# 检查合约编译
Write-Host "3. Checking contract compilation:" -ForegroundColor Yellow
$contractArtifacts = Test-Path "$basePath\contracts\artifacts\contracts\FGOGame.sol\FGOGame.json"
if ($contractArtifacts) { Write-Host "   [OK] Contract compiled" -ForegroundColor Green } 
else { Write-Host "   [X] Contract not compiled (run: cd contracts; npm run compile)" -ForegroundColor Red }

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Next steps:" -ForegroundColor Yellow

if (-not $contractsEnv) {
    Write-Host "1. Create contracts/.env (copy from contracts/.env.example)" -ForegroundColor White
}
if (-not $serverEnv) {
    Write-Host "2. Create server/.env (copy from server/.env.example)" -ForegroundColor White
}
if (-not $clientEnv) {
    Write-Host "3. Create client/.env (copy from client/.env.example)" -ForegroundColor White
}
if (-not $contractsDeps) {
    Write-Host "4. Install contract deps: cd contracts; npm install" -ForegroundColor White
}
if (-not $contractArtifacts) {
    Write-Host "5. Compile contract: cd contracts; npm run compile" -ForegroundColor White
}
if (-not $serverDeps) {
    Write-Host "6. Install server deps: cd server; npm install" -ForegroundColor White
}
if (-not $clientDeps) {
    Write-Host "7. Install client deps: cd client; npm install" -ForegroundColor White
}

Write-Host ""
Write-Host "See SEPOLIA_SETUP.md for details" -ForegroundColor Cyan
