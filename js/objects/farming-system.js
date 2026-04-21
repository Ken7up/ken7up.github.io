export const SEED_DATA = [
    { id: 0, name: 'Hạt Nguyên Tố', frame: 0, price: 100, textureKey: 'caynguyento' },
    { id: 1, name: 'Hạt Kim Loại',  frame: 1, price: 100, textureKey: 'caykimloai' },
    { id: 2, name: 'Hạt Tình Yêu',  frame: 2, price: 100, textureKey: 'caytinhyeu' },
    { id: 3, name: 'Hạt Mật',       frame: 3, price: 100, textureKey: 'caymat' }
];

const PLANT_SETTINGS = {
    'caynguyento': { truongThanh: { scale: 0.05, offsetX: 0, offsetY: -52 }, thuHoach: { scale: 0.05, offsetX: -4, offsetY: -61 } },
    'caykimloai':  { truongThanh: { scale: 0.05, offsetX: 0, offsetY: -40 }, thuHoach: { scale: 0.05, offsetX: -1, offsetY: -53 } },
    'caymat':      { truongThanh: { scale: 0.04, offsetX: -5, offsetY: -67 }, thuHoach: { scale: 0.04, offsetX: -5, offsetY: -67 } },
    'caytinhyeu':  { truongThanh: { scale: 0.045, offsetX: 0, offsetY: -58 }, thuHoach: { scale: 0.045, offsetX: 0, offsetY: -58 } }
};

const REWARD_DATA = {
    'caynguyento': { manhFrame: 0, seedId: 0, seedName: 'Hạt Nguyên Tố' }, // Frame 0: Góc trên trái
    'caykimloai':  { manhFrame: 1, seedId: 1, seedName: 'Hạt Kim Loại' },  // Frame 1: Góc trên phải
    'caytinhyeu':  { manhFrame: 2, seedId: 2, seedName: 'Hạt Tình Yêu' },  // Frame 2: Góc dưới trái
    'caymat':      { manhFrame: 3, seedId: 3, seedName: 'Hạt Mật' }        // Frame 3: Góc dưới phải
};

const TIME_SETTINGS = { hatSangMam: 10000, mamSangTruongThanh: 30000, truongThanhSangThuHoach: 30000, thoiGianNhayMat: 10000 };
const UI_COLORS = { BG_WHITE: 0xffffff, BG_CREAM: 0xf5f0e6, BTN_GREEN: 0x4CAF50, BTN_RED: 0xF44336 };

export default class FarmingSystem {
    constructor(scene, width, height) {
        this.scene = scene;
        this.width = width;
        this.height = height;
        this.tuiHatGiong = SEED_DATA.map(seed => ({ ...seed, count: 2 }));
        this.chauDangChon = null;

        this.createInventoryUI();
    }

    createInventoryUI() {
        this.inventoryUI = this.scene.add.container(this.width / 2, this.height / 2).setDepth(9999).setScrollFactor(0).setVisible(false);
        let invOverlay = this.scene.add.rectangle(0, 0, this.width, this.height, 0x000000, 0.5).setInteractive().setScrollFactor(0);
        invOverlay.on('pointerdown', (p, x, y, e) => e.stopPropagation());
        
        let invBg = this.scene.add.graphics().fillStyle(UI_COLORS.BG_WHITE, 1).fillRoundedRect(-250, -300, 500, 600, 20);
        let invTitle = this.scene.add.text(0, -250, '🎒 CHỌN HẠT GIỐNG', { fontSize: '28px', fill: '#8B4513', fontStyle: 'bold' }).setOrigin(0.5);

        let closeInvBg = this.scene.add.graphics().fillStyle(UI_COLORS.BTN_RED, 1).fillRoundedRect(-100, 230, 200, 50, 15);
        let closeInvText = this.scene.add.text(0, 255, 'Hủy', { fontSize: '22px', fill: '#ffffff', fontStyle: 'bold' }).setOrigin(0.5);
        let closeInvHit = this.scene.add.rectangle(0, 255, 200, 50, 0x000000, 0).setInteractive({ useHandCursor: true }).setScrollFactor(0);
        
        closeInvHit.on('pointerdown', () => {
            this.inventoryUI.setVisible(false);
            this.scene.isUIOpen = false;
            this.chauDangChon = null;
        });

        this.inventoryUI.add([invOverlay, invBg, invTitle, closeInvBg, closeInvText, closeInvHit]);
        this.inventoryItemsGroup = this.scene.add.group();
    }

    moTuiHatGiong(chauDuocChon) {
        this.scene.isUIOpen = true;
        this.chauDangChon = chauDuocChon;
        this.inventoryItemsGroup.clear(true, true);

        let startY = -150;
        let indexHienThi = 0; 

        this.tuiHatGiong.forEach((hat, index) => {
            if (hat.count > 0) {
                let rowY = startY + (indexHienThi * 90);
                let rowBg = this.scene.add.graphics().fillStyle(UI_COLORS.BG_CREAM, 1).fillRoundedRect(-200, rowY - 40, 400, 80, 15);
                let icon = this.scene.add.sprite(-150, rowY, 'hatmay', hat.frame).setScale(60 / this.scene.textures.get('hatmay').get().width);
                let nameText = this.scene.add.text(-100, rowY - 15, hat.name, { fontSize: '20px', fill: '#5D4037', fontStyle: 'bold' });
                let countText = this.scene.add.text(-100, rowY + 10, 'Số lượng: ' + hat.count, { fontSize: '16px', fill: '#4CAF50', fontStyle: 'bold' });

                let plantBtnBg = this.scene.add.graphics().fillStyle(UI_COLORS.BTN_GREEN, 1).fillRoundedRect(80, rowY - 20, 100, 40, 10);
                let plantBtnText = this.scene.add.text(130, rowY, 'Trồng', { fontSize: '18px', fill: '#ffffff', fontStyle: 'bold' }).setOrigin(0.5);
                let plantBtnHit = this.scene.add.rectangle(130, rowY, 100, 40, 0x000000, 0).setInteractive({ useHandCursor: true }).setScrollFactor(0);

                plantBtnHit.on('pointerdown', () => {
                    this.tuiHatGiong[index].count--;
                    this.inventoryUI.setVisible(false);
                    this.scene.isUIOpen = false;
                    this.trongCayNguyento(this.chauDangChon, hat);
                });

                let elements = [rowBg, icon, nameText, countText, plantBtnBg, plantBtnText, plantBtnHit];
                elements.forEach(el => { this.inventoryItemsGroup.add(el); this.inventoryUI.add(el); });
                indexHienThi++;
            }
        });

        if (indexHienThi === 0) {
            let emptyText = this.scene.add.text(0, -50, 'Bạn không có hạt giống nào!\nHãy vào Shop Mây để mua.', { fontSize: '20px', fill: '#D32F2F', align: 'center' }).setOrigin(0.5);
            this.inventoryItemsGroup.add(emptyText);
            this.inventoryUI.add(emptyText);
        }
        this.inventoryUI.setVisible(true);
    }

    trongCayNguyento(chau, thongTinHat) {
        chau.setData('daTrongCay', true);
        let cay = this.scene.add.sprite(chau.x, chau.y - 65, 'hatmay', thongTinHat.frame).setOrigin(0.5, 1);
        cay.setDepth(chau.depth + 0.1); // Sử dụng depth động theo vị trí chậu
        cay.setScale(70 / cay.width);
        
        let textureKeyCuaHat = SEED_DATA.find(s => s.id === thongTinHat.id).textureKey;
        cay.setData('loaiHat', thongTinHat.id); 
        cay.setData('loaiCayTexture', textureKeyCuaHat); 

        if (this.scene.bambooSystem) this.scene.bambooSystem.add(cay);
        this.scene.tweens.add({ targets: cay, y: "-=5", duration: 800, yoyo: true, repeat: -1 });

        this.scene.time.delayedCall(TIME_SETTINGS.hatSangMam, () => {
            if (cay && cay.active) { 
                this.scene.tweens.killTweensOf(cay); 
                cay.setScale(90 / 2048); 
                this.giaiDoanMam(cay, chau); 
            }
        });
    }

    giaiDoanMam(cay, chau) {
        cay.setTexture('caymam').setFrame(0).setOrigin(0.5, 1);
        cay.y = chau.y - 65; 

        let blinkTimer = this.scene.time.addEvent({
            delay: TIME_SETTINGS.thoiGianNhayMat, 
            callback: () => {
                cay.setFrame(1);
                this.scene.time.delayedCall(1000, () => { if (cay.texture.key === 'caymam') cay.setFrame(0); });
            }, loop: true
        });

        this.scene.time.delayedCall(TIME_SETTINGS.mamSangTruongThanh, () => {
            blinkTimer.remove(); 
            this.giaiDoanTruongThanh(cay, chau);
        });
    }

    giaiDoanTruongThanh(cay, chau) {
        let textureKey = cay.getData('loaiCayTexture') || 'caynguyento';
        let settings = PLANT_SETTINGS[textureKey].truongThanh; 
        
        cay.setTexture(textureKey).setFrame(0).setOrigin(0.5, 1);
        cay.x = chau.x + settings.offsetX; 
        cay.y = chau.y + settings.offsetY; 
        cay.setScale(settings.scale);

        let blinkTimer = this.scene.time.addEvent({
            delay: TIME_SETTINGS.thoiGianNhayMat,
            callback: () => {
                cay.setFrame(1); 
                this.scene.time.delayedCall(1000, () => { if (cay.texture && cay.texture.key === textureKey && cay.frame.name <= 1) cay.setFrame(0); });
            }, loop: true
        });

        this.scene.time.delayedCall(TIME_SETTINGS.truongThanhSangThuHoach, () => {
            blinkTimer.remove();
            this.giaiDoanThuHoach(cay, chau);
        });
    }

    giaiDoanThuHoach(cay, chau) {
        let textureKey = cay.getData('loaiCayTexture') || 'caynguyento';
        let settings = PLANT_SETTINGS[textureKey].thuHoach; 
        
        cay.setTexture(textureKey).setFrame(2).setOrigin(0.5, 1);
        cay.x = chau.x + settings.offsetX;
        cay.y = chau.y + settings.offsetY;
        cay.setScale(settings.scale);

        let blinkTimer = this.scene.time.addEvent({
            delay: 10000,
            callback: () => {
                cay.setFrame(3); 
                this.scene.time.delayedCall(1000, () => { if (cay.texture && cay.texture.key === textureKey && cay.frame.name >= 2) cay.setFrame(2); });
            }, loop: true
        });

        cay.setInteractive({ useHandCursor: true });
        cay.once('pointerdown', () => {
            blinkTimer.remove();
            
            // 1. Xác định phần thưởng dựa trên loại cây
            let rewardInfo = REWARD_DATA[textureKey];
            
            // 2. Cộng EXP cho nhân vật (Lưu tạm vào Scene chính)
            this.scene.soEXP = (this.scene.soEXP || 0) + 100;
            
            // 3. Cộng x2 hạt giống vào túi
            let seedInBag = this.tuiHatGiong.find(s => s.id === rewardInfo.seedId);
            if (seedInBag) {
                seedInBag.count += 2;
            }

            // (Tùy chọn) Lưu số lượng mảnh/vương miện/hũ mật vào một biến inventory khác ở đây
            
            // 4. Chạy hiệu ứng bay lên và mờ dần
            // Truyền đối tượng 'cay' vào thay vì tọa độ x, y của chậu
            this.taoHieuUngThuHoach(cay, rewardInfo);

            console.log(`Thu hoạch ${textureKey}! Nhận 100 EXP, 2 ${rewardInfo.seedName}, 1 mảnh frame ${rewardInfo.manhFrame}`);
            
            cay.destroy(); 
            chau.setData('daTrongCay', false);
        });
    }

    taoHieuUngThuHoach(cay, rewardInfo) {
        // 1. Lấy tọa độ thực tế của cây trên toàn thế giới (World Coordinates)
        // Điều này khắc phục lỗi lệch vị trí khi cây nằm trong Container (bambooSystem)
        let matrix = cay.getWorldTransformMatrix();
        let worldX = matrix.tx;
        let worldY = matrix.ty;

        // 2. Tính vị trí xuất hiện (ở khoảng giữa thân cây)
        let startY = worldY - (cay.displayHeight / 2); 

        // 3. Sắp xếp các phần thưởng ngay tại tọa độ thực của cây
        let expText = this.scene.add.text(worldX, startY - 20, '+100 EXP', { 
            fontSize: '14px', fill: '#FFD700', fontStyle: 'bold', stroke: '#000', strokeThickness: 2 
        }).setOrigin(0.5).setDepth(9999);

        let seedText = this.scene.add.text(worldX, startY, '+2 ' + rewardInfo.seedName, { 
            fontSize: '13px', fill: '#4CAF50', fontStyle: 'bold', stroke: '#000', strokeThickness: 2 
        }).setOrigin(0.5).setDepth(9999);

        let itemSprite = this.scene.add.sprite(worldX, startY + 20, 'manh', rewardInfo.manhFrame)
            .setScale(0.025) 
            .setDepth(9999); 

        // 4. Hiệu ứng bay lên và mờ dần
        this.scene.tweens.add({
            targets: [expText, seedText, itemSprite],
            y: '-=40',            
            alpha: 0,             
            duration: 1500,       
            ease: 'Sine.easeOut', 
            onComplete: () => {
                expText.destroy();
                seedText.destroy();
                itemSprite.destroy();
            }
        });
    }
}