export default class House extends Phaser.GameObjects.Image {
    /**
     * @param {Phaser.Scene} scene - Truyền scene hiện tại vào
     * @param {number} groundLevelY - Truyền mức đất vào để nhà tự tính vị trí Y
     */
    constructor(scene, groundLevelY) {
        // Tọa độ X cố định là 355
        const x = 355;
        // Tọa độ Y tự tính toán dựa trên mức đất
        const y = groundLevelY + 230;

        super(scene, x, y, 'nha');

        // Thêm vào scene
        scene.add.existing(this);

        // Các thông số cố định của ngôi nhà
        this.setOrigin(0.5, 1); 
        this.setDepth(4); 
        this.setScale(0.20);

        // 1. Bật tương tác cho ngôi nhà
        this.setInteractive();

        // 2. Lắng nghe sự kiện click/chạm
        this.on('pointerdown', this.openStorage, this);

        // Biến lưu trữ Container chứa giao diện nhà kho
        this.storageUI = null;
    }

    openStorage() {
        // Nếu một UI khác đang mở thì bỏ qua (tránh mở chồng chéo)
        if (this.scene.isUIOpen) return;
        this.scene.isUIOpen = true;

        const width = this.scene.scale.width;
        const height = this.scene.scale.height;

        // Tạo Container chứa toàn bộ UI nhà kho
        this.storageUI = this.scene.add.container(0, 0);
        
        // Đẩy Depth lên 9999 để đè lên các UI khác
        this.storageUI.setDepth(9999); 
        this.storageUI.setScrollFactor(0); // Cố định UI không bị trôi theo camera

        // --- A. Lớp nền mờ (Overlay) ---
        const overlay = this.scene.add.rectangle(width / 2, height / 2, width, height, 0x000000, 0.6);
        overlay.setInteractive(); 
        overlay.setScrollFactor(0); 
        this.storageUI.add(overlay);

        // --- B. Bảng UI Nhà Kho ---
        const panelWidth = 600;
        const panelHeight = 800;
        const panelX = (width - panelWidth) / 2;
        const panelY = (height - panelHeight) / 2;

        const panel = this.scene.add.graphics();
        panel.fillStyle(0x8B4513, 1); // Màu nền nâu gỗ
        panel.fillRoundedRect(panelX, panelY, panelWidth, panelHeight, 20);
        panel.lineStyle(6, 0x5C3A21, 1); // Viền bảng
        panel.strokeRoundedRect(panelX, panelY, panelWidth, panelHeight, 20);
        this.storageUI.add(panel);

        // --- C. Tiêu đề ---
        const title = this.scene.add.text(width / 2, panelY + 50, 'NHÀ KHO', {
            fontSize: '46px',
            fill: '#FFD700',
            fontStyle: 'bold',
            stroke: '#000000',
            strokeThickness: 6
        }).setOrigin(0.5);
        this.storageUI.add(title);

        // --- D. Hiển thị số lượng Đậu ---
        const soDauText = this.scene.add.text(width / 2, panelY + 130, `🥜 Đậu: ${this.scene.soDau}`, {
            fontSize: '32px',
            fill: '#FFFFFF',
            fontStyle: 'bold',
            stroke: '#000000',
            strokeThickness: 4
        }).setOrigin(0.5);
        this.storageUI.add(soDauText);

        // --- E. THU THẬP DỮ LIỆU VẬT PHẨM ---
        let allItems = [];

        // 1. Lấy Hạt giống từ FarmingSystem
        if (this.scene.farmingSystem && this.scene.farmingSystem.tuiHatGiong) {
            this.scene.farmingSystem.tuiHatGiong.forEach(hat => {
                if (hat.count > 0) {
                    allItems.push({
                        textureKey: 'hatmay',
                        frame: hat.frame,
                        count: hat.count,
                        // Tính toán scale chuẩn theo width gốc giống trong farming-system
                        scale: 60 / this.scene.textures.get('hatmay').get().width
                    });
                }
            });
        }

        // 2. Lấy Nguyên liệu (Mảnh) từ GameScene
        if (this.scene.khoNguyenLieu) {
            this.scene.khoNguyenLieu.forEach(nl => {
                if (nl.count > 0) {
                    allItems.push({
                        textureKey: 'manh',
                        frame: nl.frame,
                        count: nl.count,
                        scale: 0.05 // Scale to hơn lúc rớt ra một chút để dễ nhìn trong kho
                    });
                }
            });
        }

        // --- F. TẠO LƯỚI Ô CHỨA & RENDER VẬT PHẨM ---
        const slotSize = 100; // Kích thước mỗi ô
        const cols = 4;       // Số cột
        const rows = 4;       // Số hàng
        const spacing = 20;   // Khoảng cách giữa các ô

        // Tính toán vị trí bắt đầu
        const gridWidth = cols * slotSize + (cols - 1) * spacing;
        const startX = panelX + (panelWidth - gridWidth) / 2 + slotSize / 2;
        const startY = panelY + 250 + slotSize / 2;

        let itemIndex = 0; // Biến chạy để theo dõi vật phẩm

        for (let row = 0; row < rows; row++) {
            for (let col = 0; col < cols; col++) {
                let slotX = startX + col * (slotSize + spacing);
                let slotY = startY + row * (slotSize + spacing);

                // 1. Vẽ ô nền trống
                let slotBg = this.scene.add.graphics();
                slotBg.fillStyle(0xDEB887, 0.8);
                slotBg.fillRoundedRect(slotX - slotSize/2, slotY - slotSize/2, slotSize, slotSize, 12);
                slotBg.lineStyle(3, 0x5C3A21, 1);
                slotBg.strokeRoundedRect(slotX - slotSize/2, slotY - slotSize/2, slotSize, slotSize, 12);
                this.storageUI.add(slotBg);

                // 2. Nếu còn vật phẩm trong mảng allItems, vẽ nó đè lên ô
                if (itemIndex < allItems.length) {
                    let item = allItems[itemIndex];

                    // Vẽ Icon
                    let icon = this.scene.add.sprite(slotX, slotY - 5, item.textureKey, item.frame);
                    icon.setScale(item.scale);
                    this.storageUI.add(icon);

                    // Vẽ Số lượng (góc dưới bên phải)
                    let countText = this.scene.add.text(slotX + slotSize/2 - 8, slotY + slotSize/2 - 8, `x${item.count}`, {
                        fontSize: '20px',
                        fill: '#FFFFFF',
                        fontStyle: 'bold',
                        stroke: '#000000',
                        strokeThickness: 4
                    }).setOrigin(1, 1);
                    this.storageUI.add(countText);
                }

                itemIndex++;
            }
        }

        // --- G. Nút Đóng (Nút X) ---
        const closeBtn = this.scene.add.text(panelX + panelWidth - 20, panelY + 20, 'X', {
            fontSize: '36px',
            fill: '#FF4444',
            fontStyle: 'bold',
            stroke: '#000000',
            strokeThickness: 4,
            backgroundColor: '#FFCCCC'
        }).setOrigin(1, 0).setPadding(10, 5, 10, 5);
        
        closeBtn.setInteractive({ useHandCursor: true }); 
        closeBtn.setScrollFactor(0); 
        closeBtn.on('pointerdown', this.closeStorage, this);
        this.storageUI.add(closeBtn);
    }

    closeStorage() {
        if (this.storageUI) {
            this.storageUI.destroy();
            this.storageUI = null;
        }
        this.scene.isUIOpen = false;
    }
}
