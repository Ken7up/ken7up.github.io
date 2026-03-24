class BootScene extends Phaser.Scene {
    constructor() {
        super('BootScene');
    }

    preload() {
        // Tải ảnh spritesheet khủng long (64x96) -> Frame 32x32
        this.load.spritesheet('dino', 'assets/images/dino.png', {
            frameWidth: 32, 
            frameHeight: 32 
        });

        // Tải ảnh spritesheet xương rồng (32x64) -> Cắt thành các frame 16x32
        this.load.spritesheet('cactus', 'assets/images/cactus.png', {
            frameWidth: 32, 
            frameHeight: 32
        });
    }

    create() {
        this.scene.start('GameScene');
    }
}
