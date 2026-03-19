class BootScene extends Phaser.Scene {
    constructor() {
        super('BootScene');
    }

    preload() {
        // Tải ảnh spritesheet khủng long. 
        // BẠN CẦN CHỈNH: frameWidth và frameHeight tương ứng với 1 ô hình khủng long.
        this.load.spritesheet('dino', 'assets/images/dino.png', {
            frameWidth: 32, // THAY ĐỔI SỐ NÀY (Chiều rộng chia 2)
            frameHeight: 32 // THAY ĐỔI SỐ NÀY (Chiều cao chia 2)
        });

        // Tải ảnh xương rồng
        this.load.image('cactus', 'assets/images/cactus.png');
    }

    create() {
        // Sau khi tải xong assets, tự động chuyển sang GameScene
        this.scene.start('GameScene');
    }
}
