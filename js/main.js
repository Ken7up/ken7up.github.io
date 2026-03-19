const config = {
    type: Phaser.AUTO,
    scale: {
        mode: Phaser.Scale.FIT, // Tự động co giãn vừa với màn hình (rất quan trọng cho mobile)
        autoCenter: Phaser.Scale.CENTER_BOTH,
        width: 800,
        height: 300,
        parent: 'game-container'
    },
    physics: {
        default: 'arcade',
        arcade: {
            gravity: { y: 1200 }, // Trọng lực kéo khủng long xuống
            debug: false
        }
    },
    backgroundColor: '#f7f7f7',
    scene: [BootScene, GameScene]
};

const game = new Phaser.Game(config);
