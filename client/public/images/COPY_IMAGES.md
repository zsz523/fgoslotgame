# 如何复制图像文件

## 快速复制脚本（Windows PowerShell）

如果你有图像文件在 `D:\fgochaingame\素材\img\` 目录下，可以使用以下 PowerShell 脚本快速复制：

```powershell
# 设置源目录和目标目录
$sourceDir = "D:\fgochaingame\素材\img"
$targetDir = "D:\fgochaingame\game\client\public\images"

# 复制老虎机图像
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

foreach ($file in $symbolFiles) {
    $source = Join-Path $sourceDir $file
    $target = Join-Path "$targetDir\symbols" $file
    if (Test-Path $source) {
        Copy-Item $source $target -Force
        Write-Host "已复制: $file"
    } else {
        Write-Host "未找到: $file"
    }
}

# 复制从者图像
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

foreach ($file in $servantFiles) {
    $source = Join-Path $sourceDir $file
    $target = Join-Path "$targetDir\servants" $file
    if (Test-Path $source) {
        Copy-Item $source $target -Force
        Write-Host "已复制: $file"
    } else {
        Write-Host "未找到: $file"
    }
}

# 复制货币图像
$currencyFiles = @(
    "圣晶石.png",
    "QP.png"
)

foreach ($file in $currencyFiles) {
    $source = Join-Path $sourceDir $file
    $target = Join-Path "$targetDir\currency" $file
    if (Test-Path $source) {
        Copy-Item $source $target -Force
        Write-Host "已复制: $file"
    } else {
        Write-Host "未找到: $file"
    }
}

Write-Host "`n复制完成！"
```

## 手动复制

如果脚本无法使用，请手动将图片从 `D:\fgochaingame\素材\img\` 复制到对应的文件夹：

1. **老虎机图像** → `client/public/images/symbols/`
2. **从者图像** → `client/public/images/servants/`
3. **货币图像** → `client/public/images/currency/`

## 验证

复制完成后，检查以下文件夹是否有图片：
- `client/public/images/symbols/` - 应该有10个PNG文件
- `client/public/images/servants/` - 应该有33个PNG文件
- `client/public/images/currency/` - 应该有2个PNG文件
