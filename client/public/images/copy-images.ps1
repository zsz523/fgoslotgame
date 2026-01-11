# 图像复制脚本
# 使用方法：在PowerShell中运行此脚本

# 设置源目录和目标目录
$sourceDir = "D:\fgochaingame\素材\img"
$targetDir = Join-Path $PSScriptRoot "."

# 检查源目录是否存在
if (-not (Test-Path $sourceDir)) {
    Write-Host "错误: 源目录不存在: $sourceDir" -ForegroundColor Red
    Write-Host "请修改脚本中的 `$sourceDir 变量为正确的路径" -ForegroundColor Yellow
    exit 1
}

Write-Host "开始复制图像文件..." -ForegroundColor Green
Write-Host "源目录: $sourceDir" -ForegroundColor Cyan
Write-Host "目标目录: $targetDir" -ForegroundColor Cyan
Write-Host ""

# 复制老虎机图像
Write-Host "复制老虎机图像..." -ForegroundColor Yellow
$symbolFiles = @(
    "愚人节_卡面_FFJ_002.png",
    "愚人节_卡面_FFJ_012.png",
    "愚人节_卡面_FFJ_069.png",
    "愚人节_卡面_FFJ_106.png",
    "愚人节_卡面_FFJ_142.png",
    "愚人节_卡面_FFJ_175.png",
    "愚人节_卡面_FFJ_302.png",
    "愚人节_卡面_FFJ_431.png",
    "愚人节_卡面_FFJ_163.png",
    "愚人节_卡面_FFJ_083.png"
)

$symbolsDir = Join-Path $targetDir "symbols"
$copiedSymbols = 0
foreach ($file in $symbolFiles) {
    $source = Join-Path $sourceDir $file
    $target = Join-Path $symbolsDir $file
    if (Test-Path $source) {
        Copy-Item $source $target -Force
        Write-Host "  ✓ $file" -ForegroundColor Green
        $copiedSymbols++
    } else {
        Write-Host "  ✗ 未找到: $file" -ForegroundColor Red
    }
}
Write-Host "老虎机图像: $copiedSymbols/$($symbolFiles.Count) 已复制`n" -ForegroundColor Cyan

# 复制从者图像
Write-Host "复制从者图像..." -ForegroundColor Yellow
$servantFiles = @(
    "BB迪拜_status_1.png",
    "Servant143正面2.png",
    "Servant198正面2.png",
    "Servant215正面1.png",
    "バーヴァン・シー_status_1.png",
    "モルガン_status_1.png",
    "阿尔托莉雅·卡斯特_status_2.png",
    "阿摩耳〔卡莲〕_status_2.png",
    "埃列什基伽勒(Beast)_status_1.png",
    "奥伯龙_status_1.png",
    "超级青子_status.png",
    "Servant011正面1.png",
    "花嫁头像2.png",
    "魁札尔·科亚特尔头像3.png",
    "莉莉丝_status_1.png",
    "芦屋道满_status_1.png",
    "罗穆路斯·奎里努斯_status_2.png",
    "梅柳齐娜(Ruler)_status_1.png",
    "谜之代行者C.I.E.L_status_2.png",
    "魔王信长_status_1.png",
    "秦始皇_正面1.png",
    "清少纳言_status_1.png",
    "司马懿_status_1.png",
    "太公望_status_1.png",
    "太空伊什塔尔_status_2.png",
    "特斯卡特利波卡_status_1.png",
    "王哈头像3.png",
    "武藏头像3.png",
    "刑部姬头像2.png",
    "亚瑟·潘德拉贡-头像-2.png",
    "岩窟王_基督山_status_3.png",
    "杨贵妃_status_2.png",
    "伊丽莎白·巴托里(SSR)_status_1.png"
)

$servantsDir = Join-Path $targetDir "servants"
$copiedServants = 0
foreach ($file in $servantFiles) {
    $source = Join-Path $sourceDir $file
    $target = Join-Path $servantsDir $file
    if (Test-Path $source) {
        Copy-Item $source $target -Force
        Write-Host "  ✓ $file" -ForegroundColor Green
        $copiedServants++
    } else {
        Write-Host "  ✗ 未找到: $file" -ForegroundColor Red
    }
}
Write-Host "从者图像: $copiedServants/$($servantFiles.Count) 已复制`n" -ForegroundColor Cyan

# 复制货币图像
Write-Host "复制货币图像..." -ForegroundColor Yellow
$currencyFiles = @(
    "圣晶石.png",
    "QP.png"
)

$currencyDir = Join-Path $targetDir "currency"
$copiedCurrency = 0
foreach ($file in $currencyFiles) {
    $source = Join-Path $sourceDir $file
    $target = Join-Path $currencyDir $file
    if (Test-Path $source) {
        Copy-Item $source $target -Force
        Write-Host "  ✓ $file" -ForegroundColor Green
        $copiedCurrency++
    } else {
        Write-Host "  ✗ 未找到: $file" -ForegroundColor Red
    }
}
Write-Host "货币图像: $copiedCurrency/$($currencyFiles.Count) 已复制`n" -ForegroundColor Cyan

Write-Host "=" * 50 -ForegroundColor Cyan
Write-Host "复制完成！" -ForegroundColor Green
Write-Host "总计: $($copiedSymbols + $copiedServants + $copiedCurrency) 个文件" -ForegroundColor Cyan
Write-Host "=" * 50 -ForegroundColor Cyan
