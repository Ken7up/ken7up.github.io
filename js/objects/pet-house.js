export default class PetHouse extends Phaser.GameObjects.Image {
    constructor(scene, screenWidth, screenHeight) {
        const scaleNhaPet = 0.35;
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
                frames: scene.anims.generateFrameNumbers('nguoida', { start: 6, end: 11 }), 
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

        // 1. NỀN GIAO DIỆN (Được làm rộng hơn: từ 300x400 lên 400x520)
        let bg = scene.add.graphics().fillStyle(0xf5f0e6, 1).fillRoundedRect(-200, -260, 400, 520, 20);
        let title = scene.add.text(0, -220, 'MUA THÚ CƯNG', { fontSize: '28px', fill: '#8B4513', fontStyle: 'bold' }).setOrigin(0.5);

        // --- HIỂN THỊ SỐ ĐẬU VÀ MẢNH HIỆN CÓ ---
        let soManh = (scene.khoNguyenLieu && scene.khoNguyenLieu[0]) ? scene.khoNguyenLieu[0].count : 0;
        this.resourceText = scene.add.text(0, -170, `Đậu: ${scene.soDau || 0} 🥜 | Mảnh: ${soManh} 🔮`, { fontSize: '20px', fill: '#000000', fontStyle: 'bold' }).setOrigin(0.5);

        // 2. KHUNG CHỨA PET (Kéo dài khung xuống chút: cao 300)
        let cardBg = scene.add.graphics().fillStyle(0xffffff, 1).lineStyle(3, 0x4CAF50, 1)
            .fillRoundedRect(-120, -120, 240, 300, 20)
            .strokeRoundedRect(-120, -120, 240, 300, 20);
        
        // Ô nền nhỏ tô màu nhẹ phía sau Pet
        let itemImgBg = scene.add.graphics().fillStyle(0xe8f5e9, 1).fillRoundedRect(-80, -110, 160, 150, 15);

        // 3. ẢNH PET VÀ ÉP KÍCH THƯỚC
        let petImage = scene.add.sprite(0, -35, 'nguoida', 0).setOrigin(0.5, 0.5);
        let maxKichThuoc = 120;
        let scaleFactor = Math.min(maxKichThuoc / petImage.width, maxKichThuoc / petImage.height);
        petImage.setScale(scaleFactor);

        // Cập nhật giá hiển thị (Đẩy xuống y = 90 cho thoáng)
        let priceText = scene.add.text(0, 90, 'Giá: 1000 🥜 + 100 🔮', { fontSize: '18px', fill: '#D32F2F', fontStyle: 'bold' }).setOrigin(0.5);

        // --- Nút Đổi (Xích xuống y = 140, chữ y = 160) ---
        this.buyBtnBg = scene.add.graphics().fillStyle(0x4CAF50, 1).fillRoundedRect(-80, 140, 160, 40, 15);
        this.buyBtnText = scene.add.text(0, 160, 'Đổi', { fontSize: '18px', fill: '#ffffff', fontStyle: 'bold' }).setOrigin(0.5);
        this.buyBtnHit = scene.add.rectangle(0, 160, 160, 40, 0x000000, 0).setInteractive({ useHandCursor: true });
        this.buyBtnHit.on('pointerdown', () => this.buyStoneGolem());

        // --- NÚT ĐÓNG (Xích xuống y = 200, chữ y = 222) ---
        let closeBtnBg = scene.add.graphics().fillStyle(0xF44336, 1).fillRoundedRect(-80, 200, 160, 45, 10);
        let closeBtnText = scene.add.text(0, 222, 'Đóng', { fontSize: '20px', fill: '#ffffff', fontStyle: 'bold' }).setOrigin(0.5);
        let closeBtnHit = scene.add.rectangle(0, 222, 160, 45, 0x000000, 0).setInteractive({ useHandCursor: true });
        
        closeBtnHit.on('pointerdown', () => {
            scene.isUIOpen = false; 
            this.shopUI.setVisible(false);
        });

        // Gom tất cả vào container
        this.shopUI.add([
            overlay, bg, title, this.resourceText, 
            cardBg, itemImgBg, petImage, priceText, // <--- Thêm khung nền vào đây
            this.buyBtnBg, this.buyBtnText, this.buyBtnHit, 
            closeBtnBg, closeBtnText, closeBtnHit
        ]);

        // Fix lỗi Scroll Camera 
        this.shopUI.each(child => {
            child.setScrollFactor(0);
        });
    }

    openShop() {
        this.scene.isUIOpen = true;
        
        // --- CẬP NHẬT LẠI TÀI NGUYÊN MỖI KHI MỞ BẢNG ---
        if (this.resourceText) {
            let soManh = (this.scene.khoNguyenLieu && this.scene.khoNguyenLieu[0]) ? this.scene.khoNguyenLieu[0].count : 0;
            this.resourceText.setText(`Đậu: ${this.scene.soDau || 0} 🥜 | Mảnh: ${soManh} 🔮`);
        }

        // --- KIỂM TRA TRẠNG THÁI SỞ HỮU ĐỂ HIỂN THỊ NÚT ---
        if (this.scene.hasStoneGolem) {
            this.buyBtnText.setText('Đã sở hữu');
            this.buyBtnBg.clear();
            // Cập nhật tọa độ Y = 140
            this.buyBtnBg.fillStyle(0x888888, 1).fillRoundedRect(-80, 140, 160, 40, 15); 
            this.buyBtnHit.disableInteractive(); 
        } else {
            this.buyBtnText.setText('Đổi');
            this.buyBtnBg.clear();
            // Cập nhật tọa độ Y = 140
            this.buyBtnBg.fillStyle(0x4CAF50, 1).fillRoundedRect(-80, 140, 160, 40, 15); 
            this.buyBtnHit.setInteractive({ useHandCursor: true }); 
        }

        this.shopUI.setVisible(true);
    }

    buyStoneGolem() {
        if (this.scene.hasStoneGolem) return; 

        // Lấy số lượng tài nguyên hiện tại
        let soDau = this.scene.soDau || 0;
        let soManh = (this.scene.khoNguyenLieu && this.scene.khoNguyenLieu[0]) ? this.scene.khoNguyenLieu[0].count : 0;

        if (soDau >= 1000 && soManh >= 100) {
            // Trừ tài nguyên
            this.scene.soDau -= 1000;
            this.scene.khoNguyenLieu[0].count -= 100; // Trừ Mảnh nguyên tố trong kho
            
            // Đánh dấu là đã sở hữu pet này
            this.scene.hasStoneGolem = true; 

            this.spawnStoneGolem();

            // Cập nhật lại text tài nguyên hiển thị trên bảng
            if (this.resourceText) {
                let soManhMoi = this.scene.khoNguyenLieu[0].count;
                this.resourceText.setText(`Đậu: ${this.scene.soDau || 0} 🥜 | Mảnh: ${soManhMoi} 🔮`);
            }

            // Chuyển nút sang trạng thái Đã sở hữu
            this.buyBtnText.setText('Đã sở hữu');
            this.buyBtnBg.clear();
            // Cập nhật tọa độ Y = 140
            this.buyBtnBg.fillStyle(0x888888, 1).fillRoundedRect(-80, 140, 160, 40, 15);
            this.buyBtnHit.disableInteractive();
            
        } else {
            alert("Bạn không đủ Đậu hoặc Mảnh nguyên tố!");
        }
    }

    spawnStoneGolem() {
        // Tìm chậu ở tầng mây thứ 9 (index 8), vị trí đầu tiên (index 0)
        let targetChau = this.scene.bambooSystem.danhSachChau.find(c => c.getData('tang') === 8 && c.getData('viTri') === 0);

        if (targetChau) {
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
