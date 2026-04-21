export default class PetHouse extends Phaser.GameObjects.Image {
    constructor(scene, screenWidth, screenHeight) {
        // --- CHUYỂN HẰNG SỐ TỪ constants.js VÀO ĐÂY ---
        const scaleNhaPet = 0.11;
        const xRatio = 0.92;
        const offsetY = -420;
        const depthNhaPet = 2; // Mang từ DEPTHS.NHA_PET sang

        // Tính toán tọa độ
        const x = screenWidth * xRatio;
        const y = screenHeight + offsetY;

        // Khởi tạo Image
        super(scene, x, y, 'nhapet');
        scene.add.existing(this);

        // Thiết lập các thuộc tính
        this.setOrigin(0.5, 1);
        this.setScale(scaleNhaPet);
        this.setDepth(depthNhaPet); 

        // Bật tương tác
        this.setInteractive();
        this.on('pointerdown', () => {
            console.log("Đã click vào Nhà Pet!");
            // Gọi hàm mở bảng mua pet ở đây sau này
        });
    }
}
