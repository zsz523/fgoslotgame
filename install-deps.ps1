# 安装所有依赖
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  安装项目依赖" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

$basePath = "D:\fgochaingame\fgoslotgame"

# 安装合约依赖
Write-Host "1. 安装合约依赖..." -ForegroundColor Yellow
Set-Location "$basePath\contracts"
if (Test-Path "package.json") {
    if (-not (Test-Path "node_modules")) {
        npm install
        if ($LASTEXITCODE -eq 0) {
            Write-Host "   ✅ 合约依赖安装成功" -ForegroundColor Green
        } else {
            Write-Host "   ❌ 合约依赖安装失败" -ForegroundColor Red
        }
    } else {
        Write-Host "   ⏭️  合约依赖已存在，跳过" -ForegroundColor Gray
    }
} else {
    Write-Host "   ❌ 未找到 package.json" -ForegroundColor Red
}

Write-Host ""

# 安装后端依赖
Write-Host "2. 安装后端依赖..." -ForegroundColor Yellow
Set-Location "$basePath\server"
if (Test-Path "package.json") {
    if (-not (Test-Path "node_modules")) {
        npm install
        if ($LASTEXITCODE -eq 0) {
            Write-Host "   ✅ 后端依赖安装成功" -ForegroundColor Green
        } else {
            Write-Host "   ❌ 后端依赖安装失败" -ForegroundColor Red
        }
    } else {
        Write-Host "   ⏭️  后端依赖已存在，跳过" -ForegroundColor Gray
    }
} else {
    Write-Host "   ❌ 未找到 package.json" -ForegroundColor Red
}

Write-Host ""

# 安装前端依赖
Write-Host "3. 安装前端依赖..." -ForegroundColor Yellow
Set-Location "$basePath\client"
if (Test-Path "package.json") {
    if (-not (Test-Path "node_modules")) {
        npm install
        if ($LASTEXITCODE -eq 0) {
            Write-Host "   ✅ 前端依赖安装成功" -ForegroundColor Green
        } else {
            Write-Host "   ❌ 前端依赖安装失败" -ForegroundColor Red
        }
    } else {
        Write-Host "   ⏭️  前端依赖已存在，跳过" -ForegroundColor Gray
    }
} else {
    Write-Host "   ❌ 未找到 package.json" -ForegroundColor Red
}

Set-Location $basePath

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "✅ 依赖安装完成!" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Cyan
