# Sepolia 测试网快速设置脚本
# 使用方法: .\setup-sepolia.ps1

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  Sepolia 测试网快速设置" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# 检查是否已存在 .env 文件
$contractsEnvExists = Test-Path "contracts\.env"
$serverEnvExists = Test-Path "server\.env"
$clientEnvExists = Test-Path "client\.env"

if ($contractsEnvExists -or $serverEnvExists -or $clientEnvExists) {
    Write-Host "⚠️  警告: 检测到已存在的 .env 文件" -ForegroundColor Yellow
    $overwrite = Read-Host "是否覆盖现有文件? (y/n)"
    if ($overwrite -ne "y" -and $overwrite -ne "Y") {
        Write-Host "已取消操作" -ForegroundColor Yellow
        exit
    }
}

Write-Host "步骤 1/5: 配置合约部署..." -ForegroundColor Green

# 创建 contracts/.env
if (-not $contractsEnvExists -or $overwrite -eq "y" -or $overwrite -eq "Y") {
    Write-Host "请输入合约部署配置:" -ForegroundColor Yellow
    $privateKey = Read-Host "部署者私钥 (0x...)"
    $sepoliaRpc = Read-Host "Sepolia RPC URL (https://sepolia.infura.io/v3/...)"
    
    $contractsEnv = @"
# Sepolia 测试网配置
PRIVATE_KEY=$privateKey
SEPOLIA_RPC_URL=$sepoliaRpc
MAINNET_RPC_URL=https://mainnet.infura.io/v3/YOUR_INFURA_KEY
"@
    
    $contractsEnv | Out-File -FilePath "contracts\.env" -Encoding utf8 -NoNewline
    Write-Host "✅ contracts/.env 已创建" -ForegroundColor Green
} else {
    Write-Host "⏭️  跳过 contracts/.env (已存在)" -ForegroundColor Gray
}

Write-Host ""
Write-Host "步骤 2/5: 部署合约..." -ForegroundColor Green
Write-Host "⚠️  请手动执行以下命令部署合约:" -ForegroundColor Yellow
Write-Host "  cd contracts" -ForegroundColor White
Write-Host "  npm install" -ForegroundColor White
Write-Host "  npm run compile" -ForegroundColor White
Write-Host "  npm run deploy:sepolia" -ForegroundColor White
Write-Host ""
$contractAddress = Read-Host "请输入部署后的合约地址 (0x...)"

Write-Host ""
Write-Host "步骤 3/5: 配置后端服务器..." -ForegroundColor Green

# 创建 server/.env
if (-not $serverEnvExists -or $overwrite -eq "y" -or $overwrite -eq "Y") {
    Write-Host "请输入后端服务器配置:" -ForegroundColor Yellow
    $serverRpc = Read-Host "RPC URL (与部署时相同)"
    $serverPrivateKey = Read-Host "服务器私钥 (必须是部署者地址的私钥)"
    
    $serverEnv = @"
# 后端服务器配置
CONTRACT_ADDRESS=$contractAddress
RPC_URL=$serverRpc
SERVER_PRIVATE_KEY=$serverPrivateKey
PORT=3001
"@
    
    $serverEnv | Out-File -FilePath "server\.env" -Encoding utf8 -NoNewline
    Write-Host "✅ server/.env 已创建" -ForegroundColor Green
} else {
    Write-Host "⏭️  跳过 server/.env (已存在)" -ForegroundColor Gray
}

Write-Host ""
Write-Host "步骤 4/5: 配置前端客户端..." -ForegroundColor Green

# 创建 client/.env
if (-not $clientEnvExists -or $overwrite -eq "y" -or $overwrite -eq "Y") {
    $clientEnv = @"
# 前端客户端配置
REACT_APP_CONTRACT_ADDRESS=$contractAddress
REACT_APP_GAME_RECIPIENT_ADDRESS=
"@
    
    $clientEnv | Out-File -FilePath "client\.env" -Encoding utf8 -NoNewline
    Write-Host "✅ client/.env 已创建" -ForegroundColor Green
} else {
    Write-Host "⏭️  跳过 client/.env (已存在)" -ForegroundColor Gray
}

Write-Host ""
Write-Host "步骤 5/5: 安装依赖..." -ForegroundColor Green

# 检查并安装合约依赖
if (Test-Path "contracts\package.json") {
    Write-Host "安装合约依赖..." -ForegroundColor Yellow
    Set-Location contracts
    npm install
    Set-Location ..
}

# 检查并安装后端依赖
if (Test-Path "server\package.json") {
    Write-Host "安装后端依赖..." -ForegroundColor Yellow
    Set-Location server
    npm install
    Set-Location ..
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "✅ 配置完成!" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "下一步操作:" -ForegroundColor Yellow
Write-Host "1. 如果还没部署合约，执行: cd contracts && npm run deploy:sepolia" -ForegroundColor White
Write-Host "2. 启动后端: cd server && npm start" -ForegroundColor White
Write-Host "3. 启动前端: cd client && npm start" -ForegroundColor White
Write-Host "4. 配置 MetaMask 连接到 Sepolia 网络" -ForegroundColor White
Write-Host "5. 访问 http://localhost:3000 开始测试" -ForegroundColor White
Write-Host ""
Write-Host "详细说明请查看: SEPOLIA_SETUP.md" -ForegroundColor Cyan
