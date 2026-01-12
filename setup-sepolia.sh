#!/bin/bash

# Sepolia 测试网快速设置脚本
# 使用方法: ./setup-sepolia.sh

echo "========================================"
echo "  Sepolia 测试网快速设置"
echo "========================================"
echo ""

# 检查是否已存在 .env 文件
if [ -f "contracts/.env" ] || [ -f "server/.env" ] || [ -f "client/.env" ]; then
    echo "⚠️  警告: 检测到已存在的 .env 文件"
    read -p "是否覆盖现有文件? (y/n) " overwrite
    if [ "$overwrite" != "y" ] && [ "$overwrite" != "Y" ]; then
        echo "已取消操作"
        exit
    fi
fi

echo "步骤 1/5: 配置合约部署..."

# 创建 contracts/.env
if [ ! -f "contracts/.env" ] || [ "$overwrite" = "y" ] || [ "$overwrite" = "Y" ]; then
    echo "请输入合约部署配置:"
    read -p "部署者私钥 (0x...): " private_key
    read -p "Sepolia RPC URL (https://sepolia.infura.io/v3/...): " sepolia_rpc
    
    cat > contracts/.env << EOF
# Sepolia 测试网配置
PRIVATE_KEY=$private_key
SEPOLIA_RPC_URL=$sepolia_rpc
MAINNET_RPC_URL=https://mainnet.infura.io/v3/YOUR_INFURA_KEY
EOF
    
    echo "✅ contracts/.env 已创建"
else
    echo "⏭️  跳过 contracts/.env (已存在)"
fi

echo ""
echo "步骤 2/5: 部署合约..."
echo "⚠️  请手动执行以下命令部署合约:"
echo "  cd contracts"
echo "  npm install"
echo "  npm run compile"
echo "  npm run deploy:sepolia"
echo ""
read -p "请输入部署后的合约地址 (0x...): " contract_address

echo ""
echo "步骤 3/5: 配置后端服务器..."

# 创建 server/.env
if [ ! -f "server/.env" ] || [ "$overwrite" = "y" ] || [ "$overwrite" = "Y" ]; then
    echo "请输入后端服务器配置:"
    read -p "RPC URL (与部署时相同): " server_rpc
    read -p "服务器私钥 (必须是部署者地址的私钥): " server_private_key
    
    cat > server/.env << EOF
# 后端服务器配置
CONTRACT_ADDRESS=$contract_address
RPC_URL=$server_rpc
SERVER_PRIVATE_KEY=$server_private_key
PORT=3001
EOF
    
    echo "✅ server/.env 已创建"
else
    echo "⏭️  跳过 server/.env (已存在)"
fi

echo ""
echo "步骤 4/5: 配置前端客户端..."

# 创建 client/.env
if [ ! -f "client/.env" ] || [ "$overwrite" = "y" ] || [ "$overwrite" = "Y" ]; then
    cat > client/.env << EOF
# 前端客户端配置
REACT_APP_CONTRACT_ADDRESS=$contract_address
REACT_APP_GAME_RECIPIENT_ADDRESS=
EOF
    
    echo "✅ client/.env 已创建"
else
    echo "⏭️  跳过 client/.env (已存在)"
fi

echo ""
echo "步骤 5/5: 安装依赖..."

# 安装合约依赖
if [ -f "contracts/package.json" ]; then
    echo "安装合约依赖..."
    cd contracts && npm install && cd ..
fi

# 安装后端依赖
if [ -f "server/package.json" ]; then
    echo "安装后端依赖..."
    cd server && npm install && cd ..
fi

echo ""
echo "========================================"
echo "✅ 配置完成!"
echo "========================================"
echo ""
echo "下一步操作:"
echo "1. 如果还没部署合约，执行: cd contracts && npm run deploy:sepolia"
echo "2. 启动后端: cd server && npm start"
echo "3. 启动前端: cd client && npm start"
echo "4. 配置 MetaMask 连接到 Sepolia 网络"
echo "5. 访问 http://localhost:3000 开始测试"
echo ""
echo "详细说明请查看: SEPOLIA_SETUP.md"
