// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

/**
 * @title FGOGame
 * @dev FGO老虎机游戏的智能合约，管理入场费和奖励支付
 */
contract FGOGame {
    // 游戏管理员地址
    address public owner;
    
    // 入场费金额（wei）
    uint256 public constant ENTRY_FEE = 0.05 ether; // 0.05 ETH
    
    // 前五轮每轮奖励（wei）
    uint256 public constant LEVEL_REWARD = 0.01 ether; // 0.01 ETH (1/5 of entry fee)
    
    // 五轮后每轮奖励（wei）
    uint256 public constant POST_LEVEL_REWARD = 0.05 ether; // 0.05 ETH (full entry fee)
    
    // 游戏会话结构
    struct GameSession {
        address player;
        uint256 entryFeePaid;
        uint256 totalReward;
        uint256 completedLevels;
        bool isActive;
        bool isCompleted;
    }
    
    // 游戏会话映射
    mapping(bytes32 => GameSession) public gameSessions;
    
    // 玩家总奖励映射
    mapping(address => uint256) public playerTotalRewards;
    
    // 事件
    event GameStarted(bytes32 indexed sessionId, address indexed player, uint256 entryFee);
    event LevelCompleted(bytes32 indexed sessionId, address indexed player, uint256 level, uint256 reward);
    event GameCompleted(bytes32 indexed sessionId, address indexed player, uint256 totalReward);
    event RewardClaimed(address indexed player, uint256 amount);
    event GameFailed(bytes32 indexed sessionId, address indexed player);
    
    // 修饰符：只有管理员可以调用
    modifier onlyOwner() {
        require(msg.sender == owner, "Only owner can call this function");
        _;
    }
    
    constructor() {
        owner = msg.sender;
    }
    
    /**
     * @dev 开始新游戏（支付入场费）
     * @param sessionId 游戏会话ID
     */
    function startGame(bytes32 sessionId) external payable {
        require(msg.value == ENTRY_FEE, "Incorrect entry fee amount");
        require(!gameSessions[sessionId].isActive, "Game session already exists");
        
        gameSessions[sessionId] = GameSession({
            player: msg.sender,
            entryFeePaid: msg.value,
            totalReward: 0,
            completedLevels: 0,
            isActive: true,
            isCompleted: false
        });
        
        emit GameStarted(sessionId, msg.sender, msg.value);
    }
    
    /**
     * @dev 完成一轮游戏（由服务器调用）
     * @param sessionId 游戏会话ID
     * @param level 完成的轮数
     * @param isPostLevel5 是否超过5轮
     */
    function completeLevel(bytes32 sessionId, uint256 level, bool isPostLevel5) external onlyOwner {
        GameSession storage session = gameSessions[sessionId];
        require(session.isActive, "Game session not active");
        require(!session.isCompleted, "Game already completed");
        
        uint256 reward;
        if (isPostLevel5) {
            // 五轮后：全额入场费奖励
            reward = POST_LEVEL_REWARD;
        } else {
            // 前五轮：1/5入场费奖励
            reward = LEVEL_REWARD;
        }
        
        session.totalReward += reward;
        session.completedLevels = level;
        playerTotalRewards[session.player] += reward;
        
        emit LevelCompleted(sessionId, session.player, level, reward);
    }
    
    /**
     * @dev 完成游戏（成功）
     * @param sessionId 游戏会话ID
     */
    function completeGame(bytes32 sessionId) external onlyOwner {
        GameSession storage session = gameSessions[sessionId];
        require(session.isActive, "Game session not active");
        require(!session.isCompleted, "Game already completed");
        
        session.isCompleted = true;
        session.isActive = false;
        
        // 支付奖励给玩家
        if (session.totalReward > 0) {
            payable(session.player).transfer(session.totalReward);
        }
        
        emit GameCompleted(sessionId, session.player, session.totalReward);
    }
    
    /**
     * @dev 游戏失败（玩家失去入场费和奖励）
     * @param sessionId 游戏会话ID
     */
    function failGame(bytes32 sessionId) external onlyOwner {
        GameSession storage session = gameSessions[sessionId];
        require(session.isActive, "Game session not active");
        require(!session.isCompleted, "Game already completed");
        
        // 从玩家总奖励中扣除（如果有）
        if (playerTotalRewards[session.player] >= session.totalReward) {
            playerTotalRewards[session.player] -= session.totalReward;
        }
        
        session.isActive = false;
        session.isCompleted = false;
        
        emit GameFailed(sessionId, session.player);
    }
    
    /**
     * @dev 玩家提取奖励（备用方法）
     */
    function claimReward() external {
        uint256 reward = playerTotalRewards[msg.sender];
        require(reward > 0, "No reward to claim");
        
        playerTotalRewards[msg.sender] = 0;
        payable(msg.sender).transfer(reward);
        
        emit RewardClaimed(msg.sender, reward);
    }
    
    /**
     * @dev 获取游戏会话信息
     * @param sessionId 游戏会话ID
     */
    function getGameSession(bytes32 sessionId) external view returns (
        address player,
        uint256 entryFeePaid,
        uint256 totalReward,
        uint256 completedLevels,
        bool isActive,
        bool isCompleted
    ) {
        GameSession memory session = gameSessions[sessionId];
        return (
            session.player,
            session.entryFeePaid,
            session.totalReward,
            session.completedLevels,
            session.isActive,
            session.isCompleted
        );
    }
    
    /**
     * @dev 获取玩家总奖励
     * @param player 玩家地址
     */
    function getPlayerReward(address player) external view returns (uint256) {
        return playerTotalRewards[player];
    }
    
    /**
     * @dev 提取合约余额（仅管理员）
     */
    function withdraw() external onlyOwner {
        payable(owner).transfer(address(this).balance);
    }
    
    /**
     * @dev 获取合约余额
     */
    function getContractBalance() external view returns (uint256) {
        return address(this).balance;
    }
    
    // 接收ETH
    receive() external payable {}
}
