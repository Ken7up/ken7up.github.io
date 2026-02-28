import BootScene from './scenes/BootScene.js';
import GameScene from './scenes/GameScene.js';

const config = {
    type: Phaser.AUTO,
    scale: {
        // Đã đổi sang ENVELOP để tràn viền
        mode: Phaser.Scale.ENVELOP, 
        autoCenter: Phaser.Scale.CENTER_BOTH,
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
            // Đổi false sang true để hiện khung va chạm
            debug: false
        }
    }
};

const game = new Phaser.Game(config);
