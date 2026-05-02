export default class PetHouse extends Phaser.GameObjects.Image {
    constructor(scene, screenWidth, screenHeight) {
        const scaleNhaPet = 0.11;
        const xRatio = 0.92;
        const offsetY = -420;
        const depthNhaPet = 2; 

        const x = screenWidth * xRatio;
        const y = screenHeight + offsetY;

        // Khởi tạo Image Nhà Pet
        super(scene, x, y, 'nhapet');
        scene.add.existing(this);

        this.setOrigin(0.5, 1);
        this.setScale(scaleNhaPet);
        this.setDepth(depthNhaPet); 

        // 1. TẠO ANIMATION (Nếu chưa có)
        if (!scene.anims.exists('nguoida_idle')) {
            scene.anims.create({
                key: 'nguoida_idle',
                frames: scene.anims.generateFrameNumbers('nguoida', { start: 0, end: 5 }),
                frameRate: 6,
                repeat: -1
            });
        }
        if (!scene.anims.exists('nguoida_harvest')) {
            scene.anims.create({
                key: 'nguoida_harvest',
                frames: scene.anims.generateFrameNumbers('nguoida', { start: 6, end: 11 }), // Khung hình thu hoạch
                frameRate: 6,
                repeat: -1
            });
        }

        // 2. KHỞI TẠO GIAO DIỆN MUA BÁN
        this.createShopUI(scene, screenWidth, screenHeight);

        // 3. SỰ KIỆN CLICK
        this.setInteractive({ useHandCursor: true });
        this.on('pointerdown', () => {
            if (scene.isUIOpen) return; 
            this.openShop();
        });
    }

    createShopUI(scene, width, height) {
        this.shopUI = scene.add.container(width / 2, height / 2).setDepth(9999).setScrollFactor(0).setVisible(false);

        let overlay = scene.add.rectangle(0, 0, width, height, 0x000000, 0.6).setInteractive();
        overlay.on('pointerdown', (p, x, y, e) => e.stopPropagation()); 

        let bg = scene.add.graphics().fillStyle(0xf5f0e6, 1).fillRoundedRect(-150, -200, 300, 400, 20);
        let title = scene.add.text(0, -160, 'MUA THÚ CƯNG', { fontSize: '24px', fill: '#8B4513', fontStyle: 'bold' }).setOrigin(0.5);

        // --- 1. HIỂN THỊ SỐ ĐẬU HIỆN CÓ ---
        this.beanText = scene.add.text(0, -115, `Đậu hiện có: ${scene.soDau || 0} 🥜`, { fontSize: '18px', fill: '#000000', fontStyle: 'bold' }).setOrigin(0.5);

        // Preview Người đá trong Shop
        let petImage = scene.add.sprite(0, 20, 'nguoida', 0).setScale(0.5).setOrigin(0.5, 1);

        let priceText = scene.add.text(0, 35, 'Giá: 1000 Đậu', { fontSize: '20px', fill: '#D32F2F', fontStyle: 'bold' }).setOrigin(0.5);

        // --- Nút Mua ---
        let buyBtnBg = scene.add.graphics().fillStyle(0x4CAF50, 1).fillRoundedRect(-60, 75, 120, 40, 10);
        let buyBtnText = scene.add.text(0, 95, 'Mua Ngay', { fontSize: '18px', fill: '#ffffff', fontStyle: 'bold' }).setOrigin(0.5);
        let buyBtnHit = scene.add.rectangle(0, 95, 120, 40, 0x000000, 0).setInteractive({ useHandCursor: true });
        buyBtnHit.on('pointerdown', () => this.buyStoneGolem());

        // --- 2. SỬA NÚT HỦY THÀNH NÚT ĐÓNG GIỐNG LÒ RÈN ---
        // Dùng mã màu 0xF44336 giống với BTN_RED ở lò rèn
        let closeBtnBg = scene.add.graphics().fillStyle(0xF44336, 1).fillRoundedRect(-60, 130, 120, 40, 10);
        let closeBtnText = scene.add.text(0, 150, 'Đóng', { fontSize: '18px', fill: '#ffffff', fontStyle: 'bold' }).setOrigin(0.5);
        let closeBtnHit = scene.add.rectangle(0, 150, 120, 40, 0x000000, 0).setInteractive({ useHandCursor: true });
        
        closeBtnHit.on('pointerdown', () => this.closeShop());

        // Gom tất cả vào container
        this.shopUI.add([
            overlay, bg, title, this.beanText, petImage, priceText, 
            buyBtnBg, buyBtnText, buyBtnHit, 
            closeBtnBg, closeBtnText, closeBtnHit
        ]);

        // Fix lỗi Scroll Camera (như đã hỗ trợ trước đó)
        this.shopUI.each(child => {
            child.setScrollFactor(0);
        });
    }

    openShop() {
        this.scene.isUIOpen = true;
        
        // --- 3. CẬP NHẬT LẠI SỐ ĐẬU MỖI KHI MỞ BẢNG ---
        if (this.beanText) {
            this.beanText.setText(`Đậu hiện có: ${this.scene.soDau || 0} 🥜`);
        }

        this.shopUI.setVisible(true);
    }

    closeShop() {
        this.scene.isUIOpen = false;
        this.shopUI.setVisible(false);
    }

    buyStoneGolem() {
        if (this.scene.soDau >= 1000) {
            this.scene.soDau -= 1000;
            
            this.spawnStoneGolem();

            // Cập nhật lại text số đậu hiển thị trên bảng ngay lập tức
            if (this.beanText) {
                this.beanText.setText(`Đậu hiện có: ${this.scene.soDau || 0} 🥜`);
            }
            
        } else {
            alert("Bạn không đủ đậu!");
        }
    }

    spawnStoneGolem() {
        // Tìm chậu ở tầng mây thứ 9 (index 8), vị trí đầu tiên (index 0)
        let targetChau = this.scene.bambooSystem.danhSachChau.find(c => c.getData('tang') === 8 && c.getData('viTri') === 0);

        if (targetChau) {
            // --- THAY ĐỔI TẠI ĐÂY ---
            // Tăng khoảng cách trừ đi (ví dụ -110 thay vì -75) để xích qua trái nhiều hơn
            let golemX = targetChau.x - 110; 
            let golemY = targetChau.y + 5;      // Để ngang bằng với chậu

            let nguoiDa = this.scene.add.sprite(golemX, golemY, 'nguoida').setOrigin(0.5, 1);
            
            // Tăng kích thước Người Đá
            nguoiDa.setScale(0.5); 
            
            // Lật nhân vật theo trục X để quay mặt sang phải
            nguoiDa.setFlipX(true);
            
            nguoiDa.setDepth(targetChau.depth + 0.5);
            nguoiDa.play('nguoida_idle');
            // --- THÊM PHẦN NÀY ĐỂ CHUẨN BỊ CHO TÍNH NĂNG AUTO ---
            nguoiDa.setData('tang', 8);            // Lưu lại pet đang ở tầng 8
            nguoiDa.setData('homeX', golemX);      // Vị trí gốc để pet quay về
            nguoiDa.setData('homeDepth', targetChau.depth + 0.5);
            nguoiDa.setData('isBusy', false);      // Trạng thái (đang rảnh rỗi)
            
            if (!this.scene.danhSachPet) this.scene.danhSachPet = [];
            this.scene.danhSachPet.push(nguoiDa);
            // Gắn vào BambooSystem để Người đá di chuyển/scale theo cây tre
            this.scene.bambooSystem.add(nguoiDa);
        } else {
            console.log("Không tìm thấy vị trí tầng 9!");
        }
    }
}
