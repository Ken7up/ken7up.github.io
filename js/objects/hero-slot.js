export default class HeroSlot extends Phaser.GameObjects.Image {
    constructor(scene, screenWidth, screenHeight) {
        // --- CHUYỂN HẰNG SỐ TỪ constants.js VÀO ĐÂY ---
        const oTuongScale = 0.5;
        const oTuongDepth = 20; // Mang từ DEPTHS.O_TUONG
        
        // Tính toán tọa độ
        const x = screenWidth / 2;
        const y = (screenHeight / 2) + 405;

        // Khởi tạo Image
        super(scene, x, y, 'otuong');
        scene.add.existing(this);

        this.setScale(oTuongScale);
        this.setDepth(oTuongDepth);

        // --- CÀI ĐẶT TƯƠNG TÁC ---
        this.setInteractive();
        
        this.on('pointerover', () => {
            this.setScale(oTuongScale + 0.05); 
            scene.input.setDefaultCursor('pointer'); 
        });

        this.on('pointerout', () => {
            this.setScale(oTuongScale);
            scene.input.setDefaultCursor('default');
        });

        this.on('pointerdown', () => {
            console.log("Đã chạm vào Ô tướng! Sẵn sàng mở giao diện nâng cấp...");
        });
    }
}
