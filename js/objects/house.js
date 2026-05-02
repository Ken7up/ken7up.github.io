export default class House extends Phaser.GameObjects.Image {
    constructor(scene, groundLevelY) {
        const x = 355;
        const y = groundLevelY + 230;

        super(scene, x, y, 'nha');
        scene.add.existing(this);

        this.setOrigin(0.5, 1); 
        this.setDepth(4); 
        this.setScale(0.20);

        this.setInteractive();
        this.on('pointerdown', this.openStorage, this);

        this.storageUI = null;
        this.tabContainer = null;
        this.itemsContainer = null;
        
        // Mặc định mở kho sẽ ở tab Hạt Giống
        this.currentTab = 'hatGiong'; 
    }

    openStorage() {
        if (this.scene.isUIOpen) return;
        this.scene.isUIOpen = true;

        const width = this.scene.scale.width;
        const height = this.scene.scale.height;

        this.storageUI = this.scene.add.container(0, 0);
        this.storageUI.setDepth(9999); 
        this.storageUI.setScrollFactor(0);

        // --- Lớp nền mờ ---
        const overlay = this.scene.add.rectangle(width / 2, height / 2, width, height, 0x000000, 0.6);
        overlay.setInteractive(); 
        overlay.setScrollFactor(0); 
        this.storageUI.add(overlay);

        // --- Bảng UI Nhà Kho ---
        const panelWidth = 600;
        const panelHeight = 800;
        const panelX = (width - panelWidth) / 2;
        const panelY = (height - panelHeight) / 2;

        const panel = this.scene.add.graphics();
        panel.fillStyle(0x8B4513, 1); 
        panel.fillRoundedRect(panelX, panelY, panelWidth, panelHeight, 20);
        panel.lineStyle(6, 0x5C3A21, 1); 
        panel.strokeRoundedRect(panelX, panelY, panelWidth, panelHeight, 20);
        this.storageUI.add(panel);

        // --- Tiêu đề & Đậu ---
        const title = this.scene.add.text(width / 2, panelY + 50, 'NHÀ KHO', {
            fontSize: '46px', fill: '#FFD700', fontStyle: 'bold', stroke: '#000000', strokeThickness: 6
        }).setOrigin(0.5);
        
        const soDauText = this.scene.add.text(width / 2, panelY + 120, `🥜 Đậu: ${this.scene.soDau}`, {
            fontSize: '32px', fill: '#FFFFFF', fontStyle: 'bold', stroke: '#000000', strokeThickness: 4
        }).setOrigin(0.5);
        this.storageUI.add([title, soDauText]);

        // --- Nút Đóng ---
        const closeBtn = this.scene.add.text(panelX + panelWidth - 20, panelY + 20, 'X', {
            fontSize: '36px', fill: '#FF4444', fontStyle: 'bold', stroke: '#000000', strokeThickness: 4, backgroundColor: '#FFCCCC'
        }).setOrigin(1, 0).setPadding(10, 5, 10, 5).setInteractive({ useHandCursor: true });
        
        // ✨ THÊM DÒNG NÀY ĐỂ FIX LỖI NÚT X:
        closeBtn.setScrollFactor(0); 

        closeBtn.on('pointerdown', this.closeStorage, this);
        this.storageUI.add(closeBtn);

        // --- KHỞI TẠO CONTAINER CHO TABS VÀ ITEMS ---
        this.tabContainer = this.scene.add.container(0, 0);
        this.tabContainer.setScrollFactor(0); // ✨ THÊM DÒNG NÀY

        this.itemsContainer = this.scene.add.container(0, 0);
        this.itemsContainer.setScrollFactor(0); // ✨ THÊM DÒNG NÀY
        
        this.storageUI.add(this.tabContainer);
        this.storageUI.add(this.itemsContainer);

        // Vẽ Tabs và Nội dung lần đầu tiên
        this.createTabs(panelX, panelY, panelWidth);
        this.renderTabContent(panelX, panelY, panelWidth);
    }

    createTabs(panelX, panelY, panelWidth) {
        // Xóa các UI tab cũ mỗi khi chuyển đổi để cập nhật màu sắc
        this.tabContainer.removeAll(true);

        const tabs = [
            { id: 'hatGiong', label: 'Hạt Giống' },
            { id: 'chau', label: 'Chậu' },
            { id: 'nguyenLieu', label: 'Nguyên Liệu' }
        ];

        const tabWidth = 160;
        const tabHeight = 45;
        const spacing = 15;
        
        // Căn giữa 3 nút tab
        const totalWidth = (tabWidth * 3) + (spacing * 2);
        const startX = panelX + (panelWidth - totalWidth) / 2 + tabWidth / 2;
        const startY = panelY + 190;

        tabs.forEach((tab, index) => {
            const isActive = this.currentTab === tab.id;
            const bgColor = isActive ? 0xFFD700 : 0xDEB887; // Vàng nếu đang chọn, Gỗ nhạt nếu không
            const textColor = isActive ? '#000000' : '#5C3A21';

            const x = startX + index * (tabWidth + spacing);
            const y = startY;

            let btnBg = this.scene.add.graphics();
            btnBg.fillStyle(bgColor, 1);
            btnBg.fillRoundedRect(x - tabWidth/2, y - tabHeight/2, tabWidth, tabHeight, 10);
            btnBg.lineStyle(3, 0x5C3A21, 1);
            btnBg.strokeRoundedRect(x - tabWidth/2, y - tabHeight/2, tabWidth, tabHeight, 10);

            let btnText = this.scene.add.text(x, y, tab.label, {
                fontSize: '20px', fill: textColor, fontStyle: 'bold'
            }).setOrigin(0.5);

            let hitArea = this.scene.add.rectangle(x, y, tabWidth, tabHeight, 0x000000, 0)
                .setInteractive({ useHandCursor: true });
            
            // ✨ THÊM DÒNG NÀY ĐỂ FIX LỖI CHUYỂN TAB:
            hitArea.setScrollFactor(0);
            
            // Xử lý sự kiện khi bấm chuyển tab
            hitArea.on('pointerdown', () => {
                if (this.currentTab !== tab.id) {
                    this.currentTab = tab.id;
                    this.createTabs(panelX, panelY, panelWidth);     // Cập nhật lại UI Tab
                    this.renderTabContent(panelX, panelY, panelWidth); // Thay đổi danh sách lưới
                }
            });

            this.tabContainer.add([btnBg, btnText, hitArea]);
        });
    }

    renderTabContent(panelX, panelY, panelWidth) {
        // Làm sạch container chứa vật phẩm cũ
        this.itemsContainer.removeAll(true);

        let itemsToDisplay = [];

        // --- LẤY DỮ LIỆU DỰA TRÊN TAB HIỆN TẠI ---
        if (this.currentTab === 'hatGiong') {
            if (this.scene.farmingSystem && this.scene.farmingSystem.tuiHatGiong) {
                this.scene.farmingSystem.tuiHatGiong.forEach(hat => {
                    if (hat.count > 0) {
                        itemsToDisplay.push({
                            textureKey: 'hatmay',
                            frame: hat.frame,
                            count: hat.count,
                            scale: 60 / this.scene.textures.get('hatmay').get().width
                        });
                    }
                });
            }
        } 
        else if (this.currentTab === 'chau') {
            // Xử lý mảng tuiChau [Sọ Dừa, Đồng, Bạc, Vàng] từ GameScene
            if (this.scene.tuiChau) {
                this.scene.tuiChau.forEach((count, index) => {
                    if (count > 0) {
                        itemsToDisplay.push({
                            textureKey: 'chau', // Đã sửa thành 'chau' (key hình ảnh thật của bạn)
                            frame: index, 
                            count: count,
                            scale: 0.1 // Đã tăng từ 0.15 lên 1 để ảnh không bị teo nhỏ thành dấu chấm
                        });
                    }
                });
            }
        }
        else if (this.currentTab === 'nguyenLieu') {
            if (this.scene.khoNguyenLieu) {
                this.scene.khoNguyenLieu.forEach(nl => {
                    if (nl.count > 0) {
                        itemsToDisplay.push({
                            textureKey: 'manh',
                            frame: nl.frame,
                            count: nl.count,
                            scale: 0.05 
                        });
                    }
                });
            }
        }

        // --- TẠO LƯỚI Ô CHỨA & RENDER ---
        const slotSize = 100;
        const cols = 4;
        const rows = 4; // Bạn có thể chỉnh lên 4 hàng hoặc 5 hàng nếu diện tích đủ
        const spacing = 20;

        const gridWidth = cols * slotSize + (cols - 1) * spacing;
        const startX = panelX + (panelWidth - gridWidth) / 2 + slotSize / 2;
        const startY = panelY + 280 + slotSize / 2; // Đẩy lưới xuống dưới hàng Tabs

        let itemIndex = 0;

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
                this.itemsContainer.add(slotBg);

                // 2. Vẽ vật phẩm đè lên
                if (itemIndex < itemsToDisplay.length) {
                    let item = itemsToDisplay[itemIndex];

                    let icon = this.scene.add.sprite(slotX, slotY - 5, item.textureKey, item.frame);
                    icon.setScale(item.scale);
                    this.itemsContainer.add(icon);

                    let countText = this.scene.add.text(slotX + slotSize/2 - 8, slotY + slotSize/2 - 8, `x${item.count}`, {
                        fontSize: '20px', fill: '#FFFFFF', fontStyle: 'bold', stroke: '#000000', strokeThickness: 4
                    }).setOrigin(1, 1);
                    this.itemsContainer.add(countText);
                }
                itemIndex++;
            }
        }
    }

    closeStorage() {
        if (this.storageUI) {
            this.storageUI.destroy();
            this.storageUI = null;
        }
        this.tabContainer = null;
        this.itemsContainer = null;
        this.scene.isUIOpen = false;
    }
}
