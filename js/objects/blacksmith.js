const UI_COLORS = { BG_WHITE: 0xffffff, BG_CREAM: 0xf5f0e6, BTN_GREEN: 0x4CAF50, BTN_RED: 0xF44336, BTN_ORANGE: 0xFF9800, BTN_GREY: 0x9E9E9E };

// Dữ liệu cấu hình cho các loại chậu trong Lò rèn
const BLACKSMITH_RECIPES = [
    { id: 0, name: 'Sọ Dừa',   frame: 0, costDau: 1000, reqChauId: null, reqChauCount: 0, costManh: 0,  time: 0 },
    { id: 1, name: 'Chậu Đồng', frame: 1, costDau: 2000, reqChauId: 0,    reqChauCount: 2, costManh: 20, time: 2 * 60 * 1000 },
    { id: 2, name: 'Chậu Bạc',  frame: 2, costDau: 3000, reqChauId: 1,    reqChauCount: 2, costManh: 30, time: 3 * 60 * 1000 },
    { id: 3, name: 'Chậu Vàng', frame: 3, costDau: 4000, reqChauId: 2,    reqChauCount: 2, costManh: 40, time: 4 * 60 * 1000 } 
];

export default class Blacksmith extends Phaser.GameObjects.Container {
    constructor(scene, screenWidth, screenHeight) {
        const x = screenWidth / 2 - 240;
        const y = screenHeight - 160;

        // 1. CHỈNH THỢ RÈN XÍCH LÊN: Thay đổi y từ -395 thành -425 (Kéo toàn bộ nhân vật lên 30px)
        super(scene, x - 50, y - 400);
        scene.add.existing(this);

        this.scene = scene;
        this.screenWidth = screenWidth;
        this.screenHeight = screenHeight;

        this.setDepth(2000);
        this.setScale(0.5);

        this.buildStickman(scene);
        this.buildAnvil(scene);
        
        this.createBlacksmithUI();
        this.scene.events.on('update', this.updateTimerUI, this);
    }

    buildStickman(scene) {
        const mauStickman = 0x222222;

        let than = scene.add.rectangle(0, 0, 8, 60, mauStickman).setOrigin(0.5, 0);
        let dau = scene.add.ellipse(0, -15, 30, 30, mauStickman);
        
        let tayTrai = scene.add.rectangle(0, 5, 6, 45, mauStickman).setOrigin(0.5, 0).setAngle(30);
        let chanPhai = scene.add.rectangle(0, 55, 7, 50, mauStickman).setOrigin(0.5, 0).setAngle(-15);
        let chanTrai = scene.add.rectangle(0, 55, 7, 50, mauStickman).setOrigin(0.5, 0).setAngle(15);

        // --- TẠO CÁNH TAY CẦM BÚA ---
        this.tayCamBua = scene.add.container(0, 5); 
        
        // Vẽ cánh tay dài 45px
        let tayPhai = scene.add.rectangle(0, 0, 6, 45, mauStickman).setOrigin(0.5, 0);
        
        // 2. CẦM NGAY CÁN BÚA: 
        // - Dời Origin Y về 0.95 (điểm gốc nằm ở cuối cán búa thay vì 0.8 như cũ)
        // - Đặt búa ở y = 42 (thu lại 3px so với chiều dài tay 45px để bàn tay đè lên cán búa tạo cảm giác cầm nắm)
        let bua = scene.add.image(- 15, 80, 'buachaos').setScale(0.2).setOrigin(0.5, 0.95).setAngle(90);
        
        this.tayCamBua.add([tayPhai, bua]);
        this.tayCamBua.setAngle(-30); 

        this.add([chanTrai, tayTrai, than, dau, chanPhai, this.tayCamBua]);

        this.thoRenParts = [than, dau, tayTrai, chanTrai, chanPhai, this.tayCamBua];
        this.thoRenParts.forEach(part => part.setData('startY', part.y));

        this.idleTween = scene.tweens.add({
            targets: this.thoRenParts,
            y: "+=3", 
            duration: 1200, 
            yoyo: true, 
            repeat: -1, 
            ease: 'Sine.easeInOut' 
        });
    }

    buildAnvil(scene) {
        let lechTraiPhai = 0;  
        
        // 3. GIỮ NGUYÊN CÁI ĐE: Tăng lệch y thêm 30px (từ 50 lên 80) để bù trừ cho việc thợ rèn bị kéo lên bên trên.
        // Như vậy thợ rèn sẽ cao hơn đe, khoảng cách đập búa sẽ chuẩn hơn.
        let lechLenXuong = 80; 
        
        let tiLeToNho = 0.05;     

        let caiDe = scene.add.image(this.x + lechTraiPhai, this.y + lechLenXuong, 'caide');
        caiDe.setScale(tiLeToNho);
        caiDe.setDepth(2005); 
        caiDe.setInteractive({ useHandCursor: true });

        this.chauTrenDe = scene.add.sprite(this.x + lechTraiPhai, this.y + lechLenXuong - 25, 'chau', 0);
        this.chauTrenDe.setScale(0.04); 
        this.chauTrenDe.setDepth(2006); 
        this.chauTrenDe.setVisible(false); 
        this.chauTrenDeY = this.chauTrenDe.y; 

        caiDe.on('pointerdown', () => {
            if (scene.isUIOpen) return;

            scene.tweens.add({
                targets: caiDe, scaleY: tiLeToNho * 0.9, y: "+=5", duration: 100, yoyo: true, ease: 'Power1'
            });
            
            this.openBlacksmithUI();
        });
    }

    // --- HỆ THỐNG ANIMATION RÈN ---

    startHammering(reqFrame) {
        if (this.idleTween) this.idleTween.pause();

        this.thoRenParts.forEach(p => p.y = p.getData('startY'));

        if (this.chauTrenDe) {
            this.chauTrenDe.setFrame(reqFrame);
            this.chauTrenDe.y = this.chauTrenDeY;
            this.chauTrenDe.setVisible(true);
        }

        // 1. Hoạt ảnh xoay nguyên cánh tay vung búa từ sau lưng tới trước
        if (!this.swingTween) {
            this.swingTween = this.scene.tweens.add({
                targets: this.tayCamBua,
                angle: { from: -150, to: 45 }, // -150: tít sau lưng, 45: gõ xuống đe
                duration: 200,  // Đập rất nhanh cho có lực
                yoyo: true,
                repeat: -1,
                ease: 'Cubic.easeIn' // Nhanh dần khi giáng búa xuống
            });
            
            // 2. Cả người cũng giật nhẹ theo nhịp búa
            this.hammerBodyTween = this.scene.tweens.add({
                targets: this.thoRenParts,
                y: "+=3",
                duration: 200,
                yoyo: true,
                repeat: -1,
                ease: 'Sine.easeIn'
            });
        } else {
            this.swingTween.resume();
            this.hammerBodyTween.resume();
        }
    }

    stopHammering(resultFrame) {
        if (this.swingTween) {
            this.swingTween.pause();
            this.hammerBodyTween.pause();
            
            // Trả tay cầm búa về tư thế vác búa sau khi rèn xong
            this.tayCamBua.setAngle(-30);
            this.thoRenParts.forEach(p => p.y = p.getData('startY'));
        }

        if (this.idleTween) {
            this.idleTween.resume();
        }

        if (this.chauTrenDe) {
            this.chauTrenDe.setFrame(resultFrame);
            
            this.scene.tweens.add({
                targets: this.chauTrenDe,
                y: "-=25",
                duration: 250,
                yoyo: true,
                repeat: 1, 
                onComplete: () => {
                    this.scene.time.delayedCall(1500, () => {
                        this.chauTrenDe.setVisible(false);
                    });
                }
            });
        }
    }

    // --- HỆ THỐNG GIAO DIỆN LÒ RÈN ---

    createBlacksmithUI() {
        this.uiContainer = this.scene.add.container(this.screenWidth / 2, this.screenHeight / 2).setDepth(9999).setScrollFactor(0).setVisible(false);
        
        let overlay = this.scene.add.rectangle(0, 0, this.screenWidth, this.screenHeight, 0x000000, 0.7).setInteractive().setScrollFactor(0);
        let bg = this.scene.add.graphics().fillStyle(UI_COLORS.BG_WHITE, 1).fillRoundedRect(-300, -350, 600, 700, 20);
        let title = this.scene.add.text(0, -310, '⚒️ LÒ RÈN CHẬU ⚒️', { fontSize: '30px', fill: '#8B4513', fontStyle: 'bold' }).setOrigin(0.5);

        let closeHit = this.scene.add.rectangle(0, 300, 200, 50, UI_COLORS.BTN_RED, 1).setInteractive({ useHandCursor: true }).setScrollFactor(0);
        let closeText = this.scene.add.text(0, 300, 'Đóng', { fontSize: '22px', fill: '#ffffff', fontStyle: 'bold' }).setOrigin(0.5);
        closeHit.on('pointerdown', () => {
            this.uiContainer.setVisible(false);
            this.scene.isUIOpen = false;
        });

        this.statusBoxBg = this.scene.add.graphics().fillStyle(0x333333, 1).fillRoundedRect(-250, -260, 500, 40, 10);
        this.statusText = this.scene.add.text(0, -240, 'Lò rèn đang rảnh rỗi', { fontSize: '18px', fill: '#4CAF50', fontStyle: 'bold' }).setOrigin(0.5);

        this.uiContainer.add([overlay, bg, title, this.statusBoxBg, this.statusText, closeHit, closeText]);
        this.uiItemsGroup = this.scene.add.group(); 
    }

    openBlacksmithUI() {
        this.scene.isUIOpen = true;
        this.refreshUI();
        this.uiContainer.setVisible(true);
    }

    refreshUI() {
        this.uiItemsGroup.clear(true, true); 

        let manhKimLoai = this.getMetalShards();
        let resText = this.scene.add.text(-250, -280, `Đậu: ${this.scene.soDau} 🥜 | Mảnh Kim Loại: ${manhKimLoai} ⚙️`, { fontSize: '16px', fill: '#000', fontStyle: 'bold' });
        this.uiItemsGroup.add(resText);
        this.uiContainer.add(resText);

        let startY = -160;
        
        BLACKSMITH_RECIPES.forEach((recipe, index) => {
            let rowY = startY + (index * 110);
            
            let rowBg = this.scene.add.graphics().fillStyle(UI_COLORS.BG_CREAM, 1).fillRoundedRect(-270, rowY - 45, 540, 100, 15);
            let icon = this.scene.add.sprite(-210, rowY, 'chau', recipe.frame).setScale(80 / 1080);
            
            let slHienCo = this.scene.tuiChau[recipe.id] || 0;
            let nameText = this.scene.add.text(-150, rowY - 30, `${recipe.name} (Sở hữu: ${slHienCo})`, { fontSize: '22px', fill: '#5D4037', fontStyle: 'bold' });

            let reqStr = `- ${recipe.costDau} 🥜`;
            if (recipe.costManh > 0) reqStr += `\n- ${recipe.costManh} Mảnh Kim Loại`;
            if (recipe.reqChauId !== null) reqStr += `\n- ${recipe.reqChauCount} ${BLACKSMITH_RECIPES[recipe.reqChauId].name}`;
            
            let reqText = this.scene.add.text(-150, rowY - 5, reqStr, { fontSize: '14px', fill: '#D32F2F', lineSpacing: 5 });

            let btnActionText = recipe.time === 0 ? 'MUA' : 'RÈN';
            let btnColor = this.scene.dangRen ? UI_COLORS.BTN_GREY : UI_COLORS.BTN_ORANGE; 
            
            let btnHit = this.scene.add.rectangle(180, rowY, 100, 45, btnColor, 1).setInteractive({ useHandCursor: !this.scene.dangRen });
            let btnLabel = this.scene.add.text(180, rowY, btnActionText, { fontSize: '18px', fill: '#ffffff', fontStyle: 'bold' }).setOrigin(0.5);

            btnHit.on('pointerdown', () => {
                if (!this.scene.dangRen) this.handleCrafting(recipe);
            });

            let elements = [rowBg, icon, nameText, reqText, btnHit, btnLabel];
            elements.forEach(el => {
                this.uiItemsGroup.add(el);
                this.uiContainer.add(el);
            });
        });
    }

    // --- LOGIC RÈN VÀ TÀI NGUYÊN ---

    getMetalShards() {
        if (!this.scene.khoNguyenLieu) return 0;
        let manh = this.scene.khoNguyenLieu.find(m => m.frame === 1);
        return manh ? manh.count : 0;
    }

    deductMetalShards(amount) {
        let manh = this.scene.khoNguyenLieu.find(m => m.frame === 1);
        if (manh) manh.count -= amount;
    }

    handleCrafting(recipe) {
        let currentBeans = this.scene.soDau || 0;
        let currentShards = this.getMetalShards();
        let neededChau = recipe.reqChauId !== null ? (this.scene.tuiChau[recipe.reqChauId] || 0) : 0;

        if (currentBeans < recipe.costDau) {
            this.showToast("Không đủ hạt đậu!");
            return;
        }
        if (recipe.costManh > 0 && currentShards < recipe.costManh) {
            this.showToast("Không đủ mảnh Kim Loại!");
            return;
        }
        if (recipe.reqChauId !== null && neededChau < recipe.reqChauCount) {
            this.showToast(`Cần có đủ ${recipe.reqChauCount} ${BLACKSMITH_RECIPES[recipe.reqChauId].name}!`);
            return;
        }

        this.scene.soDau -= recipe.costDau;
        if (recipe.costManh > 0) this.deductMetalShards(recipe.costManh);
        if (recipe.reqChauId !== null) this.scene.tuiChau[recipe.reqChauId] -= recipe.reqChauCount;

        if (recipe.time === 0) {
            this.scene.tuiChau[recipe.id] += 1;
            this.showToast(`Đã mua 1 ${recipe.name}!`);
            this.refreshUI();
        } else {
            let reqFrame = BLACKSMITH_RECIPES[recipe.reqChauId].frame;
            this.startHammering(reqFrame);

            let timerEvent = this.scene.time.addEvent({
                delay: recipe.time,
                callback: () => {
                    this.scene.tuiChau[recipe.id] += 1;
                    this.scene.dangRen = null;
                    if (this.uiContainer.visible) this.refreshUI();
                    
                    this.stopHammering(recipe.frame);
                }
            });

            this.scene.dangRen = {
                id: recipe.id,
                timer: timerEvent
            };
            this.refreshUI(); 
            
            this.uiContainer.setVisible(false);
            this.scene.isUIOpen = false;
        }
    }

    updateTimerUI() {
        if (!this.uiContainer || !this.uiContainer.visible) return;

        if (this.scene.dangRen && this.scene.dangRen.timer) {
            let remaining = Math.ceil(this.scene.dangRen.timer.getRemainingSeconds());
            let m = Math.floor(remaining / 60);
            let s = remaining % 60;
            let timeStr = `${m}:${s < 10 ? '0' : ''}${s}`;
            
            let tenChau = BLACKSMITH_RECIPES[this.scene.dangRen.id].name;
            this.statusText.setText(`🔥 Đang rèn: ${tenChau} - Còn lại: ${timeStr} 🔥`);
            this.statusText.setFill('#FF9800');
        } else {
            this.statusText.setText('Lò rèn đang rảnh rỗi');
            this.statusText.setFill('#4CAF50');
        }
    }

    showToast(message) {
        let toast = this.scene.add.text(this.screenWidth / 2, this.screenHeight / 2 + 200, message, {
            fontSize: '20px', fill: '#FFF', backgroundColor: '#D32F2F', padding: { x: 10, y: 10 }
        }).setOrigin(0.5).setDepth(10000).setScrollFactor(0);

        this.scene.tweens.add({
            targets: toast,
            y: "-=50",
            alpha: 0,
            duration: 2000,
            ease: 'Power2',
            onComplete: () => toast.destroy()
        });
    }
}
