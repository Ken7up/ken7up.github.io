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

        // TẢI ẢNH CÂY TRE (Giả sử kích thước 1 ô là 64x64, hãy sửa lại cho đúng với ảnh thực tế)
        this.load.spritesheet('bamboo', 'assets/images/bamboo.png', {
            frameWidth: 64, 
            frameHeight: 64
        });

        // TẢI NỀN NÚI
        this.load.image('mountain', 'assets/images/mountain.png');

        // TẢI NỀN MÂY
        this.load.image('cloud', 'assets/images/cloud.png');

        // TẢI TẦNG MÂY CHO CÂY TRE
        this.load.image('cloudlayer', 'assets/images/cloudlayer.png');

        // TẢI ẢNH CẦU HP/MP (Kích thước mỗi frame khoảng 212x212)
        this.load.spritesheet('life', 'assets/images/life.png', {
            frameWidth: 128, 
            frameHeight: 128
        });

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
