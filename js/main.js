// Tính toán tỷ lệ thật của màn hình thiết bị
const screenRatio = window.innerHeight / window.innerWidth;

// Khóa chiều rộng ở mốc 600 để giữ nguyên khoảng cách các nút UI không bị đè
const gameWidth = 600; 

// Tự động kéo giãn chiều cao theo tỷ lệ của máy để xóa viền trắng
const gameHeight = gameWidth * screenRatio;

const config = {
    type: Phaser.AUTO,
    scale: {
        mode: Phaser.Scale.FIT, // Quay lại FIT
        autoCenter: Phaser.Scale.CENTER_BOTH,
        width: gameWidth,
        height: gameHeight,
        parent: 'game-container'
    },
    physics: {
        default: 'arcade',
        arcade: {
            gravity: { y: 1200 }, 
            debug: false
        }
    },
    backgroundColor: '#f7f7f7',
    scene: [BootScene, GameScene]
};

const game = new Phaser.Game(config);
