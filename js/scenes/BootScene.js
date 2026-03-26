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

        // TẢI NỀN NÚI
        this.load.image('mountain', 'assets/images/mountain.png');

        // TẢI NỀN MÂY
        this.load.image('cloud', 'assets/images/cloud.png');

        // TẢI ÂM THANH NHẢY:
        this.load.audio('sound_jump', 'assets/audio/jump.ogg');

        // TẢI ÂM THANH TIẾP ĐẤT
        this.load.audio('sound_jumpland', 'assets/audio/jumpland.wav');

        // ÂM THANH LƯỚT
        this.load.audio('sound_dash', 'assets/audio/dash.wav');
    }

    create() {
        this.scene.start('GameScene');
    }
}
