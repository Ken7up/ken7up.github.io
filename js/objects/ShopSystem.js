import { SEED_DATA } from './FarmingSystem.js';

const UI_COLORS = { BG_WHITE: 0xffffff, BG_CREAM: 0xf5f0e6, BG_GREEN_LIGHT: 0xe8f5e9, BTN_ORANGE: 0xFF9800, BTN_RED: 0xF44336 };

export default class ShopSystem {
    constructor(scene, width, height, groundLevelY) {
        this.scene = scene;
        this.width = width;
        this.height = height;
        
        this.createClouds(groundLevelY);
        this.createShopUI();
    }

    createClouds(groundLevelY) {
        let yTangMay1 = groundLevelY - 900;
        let shopCloudX = 400;
        let shopCloudY = yTangMay1 + 200;

        // Mây Trắng (Shop)
        let shopCloud = this.scene.add.sprite(shopCloudX, shopCloudY, 'maytrang', 0).setOrigin(0.5, 0.5).setScale(0.15).setDepth(50);
        this.scene.tweens.add({ targets: shopCloud, y: shopCloud.y - 15, duration: 2000, yoyo: true, repeat: -1, ease: 'Sine.easeInOut' });
        this.scene.time.addEvent({ delay: 15000, loop: true, callback: () => {
            shopCloud.setFrame(1); this.scene.time.delayedCall(200, () => shopCloud.setFrame(0));
        }});
        
        shopCloud.setInteractive({ useHandCursor: true });
        shopCloud.on('pointerdown', () => {
            if (this.scene.isUIOpen) return; 
            this.scene.isUIOpen = true;      
            this.dauText.setText('🥜 Đậu: ' + this.scene.soDau); 
            this.shopUI.setVisible(true);
        });

        // Mây Đen (Sự kiện)
        let darkCloud = this.scene.add.sprite(shopCloudX + 150, shopCloudY - 15, 'mayden', 0).setOrigin(0.5, 0.5).setScale(0.17).setDepth(50);
        this.scene.tweens.add({ targets: darkCloud, y: darkCloud.y + 15, duration: 2000, yoyo: true, repeat: -1, ease: 'Sine.easeInOut' });
        this.scene.time.addEvent({ delay: 15000, loop: true, callback: () => {
            darkCloud.setFrame(1); this.scene.time.delayedCall(200, () => darkCloud.setFrame(0));
        }});

        darkCloud.setInteractive({ useHandCursor: true });
        darkCloud.on('pointerdown', () => {
            if (this.scene.isUIOpen) return;
            console.log("Sẵn sàng mở giao diện sự kiện.");
        });
    }

    createShopUI() {
        this.shopUI = this.scene.add.container(this.width / 2, this.height / 2).setDepth(9999).setScrollFactor(0).setVisible(false);
        let overlay = this.scene.add.rectangle(0, 0, this.width, this.height, 0x000000, 0.4).setInteractive().setScrollFactor(0);
        overlay.on('pointerdown', (p, x, y, e) => e.stopPropagation());
        
        let bgGraphics = this.scene.add.graphics().fillStyle(UI_COLORS.BG_WHITE, 1).fillRoundedRect(-300, -400, 600, 800, 30); 
        let titleText = this.scene.add.text(0, -350, '☁️ SHOP MÂY', { fontSize: '32px', fill: '#4CAF50', fontStyle: '900' }).setOrigin(0.5);
        let currencyBg = this.scene.add.graphics().fillStyle(UI_COLORS.BG_CREAM, 1).fillRoundedRect(-250, -310, 500, 50, 25);
        this.dauText = this.scene.add.text(0, -285, '🥜 ' + this.scene.soDau, { fontSize: '24px', fill: '#8B4513', fontStyle: 'bold' }).setOrigin(0.5);
        let subtitleText = this.scene.add.text(-250, -230, '🌱 Danh sách Hạt Giống', { fontSize: '24px', fill: '#8B4513', fontStyle: 'bold' }).setOrigin(0, 0.5);
        
        this.shopUI.add([overlay, bgGraphics, titleText, currencyBg, this.dauText, subtitleText]);

        // Render Hạt Giống
        let shopStartX = -140, startY = -100, khoangCachX = 280, khoangCachY = 240; 
        SEED_DATA.forEach((item, index) => {
            let cardX = shopStartX + ((index % 2) * khoangCachX); 
            let cardY = startY + (Math.floor(index / 2) * khoangCachY);

            let cardBg = this.scene.add.graphics().fillStyle(UI_COLORS.BG_WHITE, 1).lineStyle(2, 0xe0e0e0, 1).fillRoundedRect(cardX - 110, cardY - 100, 220, 220, 20).strokeRoundedRect(cardX - 110, cardY - 100, 220, 220, 20);
            let itemImgBg = this.scene.add.graphics().fillStyle(UI_COLORS.BG_GREEN_LIGHT, 1).fillRoundedRect(cardX - 50, cardY - 80, 100, 100, 20);
            
            let itemImg = this.scene.add.sprite(cardX, cardY - 30, 'hatmay', item.frame);
            itemImg.setScale(Math.min(85 / itemImg.width, 85 / itemImg.height)); 

            let itemName = this.scene.add.text(cardX, cardY + 35, item.name, { fontSize: '18px', fill: '#5D4037', fontStyle: 'bold' }).setOrigin(0.5);
            let itemPrice = this.scene.add.text(cardX, cardY + 65, '🥜 ' + item.price, { fontSize: '18px', fill: '#D32F2F', fontStyle: 'bold' }).setOrigin(0.5);
            let buyBtnBg = this.scene.add.graphics().fillStyle(UI_COLORS.BTN_ORANGE, 1).fillRoundedRect(cardX - 80, cardY + 90, 160, 35, 15);
            let buyBtnText = this.scene.add.text(cardX, cardY + 107, 'Mua', { fontSize: '18px', fill: '#ffffff', fontStyle: 'bold' }).setOrigin(0.5);
            let buyBtnHit = this.scene.add.rectangle(cardX, cardY + 107, 160, 35, 0x000000, 0).setInteractive({ useHandCursor: true }).setScrollFactor(0);

            buyBtnHit.on('pointerdown', () => {
                if (this.scene.soDau >= item.price) {
                    this.scene.soDau -= item.price;
                    this.dauText.setText('🥜 ' + this.scene.soDau);
                    this.scene.farmingSystem.tuiHatGiong[index].count++; 

                    buyBtnText.setText('Đã Mua');
                    this.scene.time.delayedCall(800, () => { buyBtnText.setText('Mua'); });
                } else {
                    buyBtnText.setText('Thiếu 🥜');
                    this.scene.time.delayedCall(800, () => { buyBtnText.setText('Mua'); });
                }
            });

            this.shopUI.add([cardBg, itemImgBg, itemImg, itemName, itemPrice, buyBtnBg, buyBtnText, buyBtnHit]);
        });

        let closeBtnBg = this.scene.add.graphics().fillStyle(UI_COLORS.BTN_RED, 1).fillRoundedRect(-250, 310, 500, 60, 20);
        let closeBtnText = this.scene.add.text(0, 340, 'Đóng', { fontSize: '26px', fill: '#ffffff', fontStyle: 'bold' }).setOrigin(0.5);
        let closeBtnHit = this.scene.add.rectangle(0, 340, 500, 60, 0x000000, 0).setInteractive({ useHandCursor: true }).setScrollFactor(0);
        
        closeBtnHit.on('pointerdown', () => {
            this.scene.isUIOpen = false; 
            this.shopUI.setVisible(false);
        });

        this.shopUI.add([closeBtnBg, closeBtnText, closeBtnHit]);
    }
}
