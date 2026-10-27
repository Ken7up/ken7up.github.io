import BootScene from './scenes/boot-scene.js';
import GameScene from './scenes/game-scene.js';

const config = {
    type: Phaser.AUTO,
    scale: {
        // Sử dụng FIT để Phaser tự co giãn game vừa với màn hình nhưng KHÔNG làm méo tỷ lệ
        mode: Phaser.Scale.FIT, 
        // Căn giữa game trên trình duyệt máy tính
        autoCenter: Phaser.Scale.CENTER_BOTH,
        // Cố định kích thước thiết kế gốc
        width: 720,
        height: 1280
    },
    parent: 'game-container',
    backgroundColor: '#87CEEB',
    scene: [BootScene, GameScene],
    physics: {
        default: 'arcade',
        arcade: {
            gravity: { y: 0 },
            debug: false
        }
    }
};

const game = new Phaser.Game(config);