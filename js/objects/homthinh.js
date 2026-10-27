export default class HomThinh extends Phaser.GameObjects.Sprite {
    constructor(scene, x, y) {
        super(scene, x, y, 'homthinh');
        scene.add.existing(this);
        this.setScale(0.25); 

        // 1. TẠO TEXTURE KHÓI ẢO
        if (!scene.textures.exists('pubg_smoke_tex')) {
            let graphics = scene.make.graphics({ x: 0, y: 0, add: false });
            graphics.fillStyle(0xffffff, 1);
            graphics.fillCircle(16, 16, 16); 
            graphics.generateTexture('pubg_smoke_tex', 32, 32);
        }

        // 2. TẠO HIỆU ỨNG CỘT KHÓI ĐỎ (Bay nhanh, cột ngắn)
        this.smokeEmitter = scene.add.particles(this.x, this.y, 'pubg_smoke_tex', {
            gravityY: -250, 
            speedX: { min: -15, max: 15 },
            speedY: { min: -100, max: -150 }, 
            scale: { start: 0.1, end: 0.8 },
            alpha: { start: 0.8, end: 0 },
            lifespan: { min: 600, max: 900 },
            frequency: 20,
            tint: 0xFF1111,
            blendMode: 'NORMAL'
        });

        this.scene.events.on('update', this.update, this);

        // 3. TƯƠNG TÁC
        this.setInteractive();
        this.on('pointerdown', this.moKhungGiftcode, this);
    }

    moKhungGiftcode() {
        if (this.scene.isUIOpen) return;

        let code = window.prompt("🎉 PHÁT HIỆN HÒM THÍNH BÍ ẨN!\nNhập mã Giftcode để mở khóa phần thưởng:");
        
        if (code !== null) {
            code = code.trim().toUpperCase();
            if (code === "GR3XX2R") {
                this.nhanThuong();
            } else if (code !== "") {
                window.alert("❌ Mã Giftcode không chính xác!");
            }
        }
    }

nhanThuong() {
    // 1. Cộng Đậu
    this.scene.soDau += 99999;

    // 2. Cập nhật Kho Nguyên Liệu (Bao gồm cả Vương Miện)
    if (!this.scene.khoNguyenLieu || this.scene.khoNguyenLieu.length === 0) {
        // Khởi tạo cấu trúc mảng nếu chưa có (frame 2 sẽ dành cho Vương Miện)
        this.scene.khoNguyenLieu = [
            { name: "Mảnh nguyên tố", frame: 0, count: 0 },
            { name: "Mảnh kim loại", frame: 1, count: 0 },
            { name: "Vương miện",    frame: 2, count: 0 }, 
            { name: "Túi mật",       frame: 3, count: 0 }
        ];
    }
    
    // Cộng quà vào từng vị trí tương ứng
    this.scene.khoNguyenLieu[0].count += 999; // Mảnh nguyên tố
    this.scene.khoNguyenLieu[1].count += 999; // Mảnh kim loại
    this.scene.khoNguyenLieu[2].count += 999; // Vương miện trong kho
    this.scene.khoNguyenLieu[3].count += 999; // Túi mật
    
    // THÊM DÒNG NÀY: Đồng bộ biến vương miện cho Shop Mây Đen đọc
    this.scene.vuongMien = (this.scene.vuongMien || 0) + 999;

    // --- HIỆU ỨNG THỊ GIÁC ---
    // (Giữ nguyên phần thông báo text và Tween của bạn)
    let textStyle = { 
        fontSize: '24px', fill: '#ffff00', fontStyle: 'bold', 
        stroke: '#000', strokeThickness: 4, align: 'center' 
    };
    
    let rewardText = this.scene.add.text(this.x, this.y - 50, 
        "🎁 QUÀ ĐÃ CHUYỂN VÀO KHO!\n+99k Đậu\n+999 Tất cả Nguyên liệu\n+999 Vương Miện", textStyle)
        .setOrigin(0.5).setDepth(2000);

    this.scene.tweens.add({
        targets: rewardText,
        y: this.y - 300,
        alpha: 0,
        duration: 4000,
        ease: 'Cubic.out',
        onComplete: () => rewardText.destroy()
    });

    if (this.scene.ngoiNha && typeof this.scene.ngoiNha.refreshStorageUI === 'function') {
        this.scene.ngoiNha.refreshStorageUI(); 
    }

    window.alert("🎁 THÀNH CÔNG!\nVương Miện và Nguyên liệu đã được thêm vào Nhà Kho.");
    this.destroy(); 
}

    setDepth(value) {
        super.setDepth(value);
        if (this.smokeEmitter) this.smokeEmitter.setDepth(value + 1); 
        return this;
    }

    update() {
        if (this.smokeEmitter) {
            this.smokeEmitter.setPosition(this.x, this.y - this.displayHeight / 2);
        }
    }

    destroy() {
        if (this.smokeEmitter) this.smokeEmitter.destroy();
        super.destroy();
    }
}
