// js/objects/FishPond.js

export default class FishPond {
    constructor(scene, screenWidth, screenHeight, groundLevelY) {
        this.scene = scene;
        this.fishes = []; // Mảng chứa đàn cá để dễ quản lý trong update()

        // --- MANG HẰNG SỐ TỪ constants.js VÀO ĐÂY ---
        const FISH_SETTINGS = {
            catre: { texture: 'catre', scale: 0.03, startX: 80, startY: 0, speedX: 10, speedY: 10, angle: 3, angleDuration: 700, breathDuration: 250 },
            cavo: { texture: 'cavo', scale: 0.03, startX: -50, startY: 20, speedX: -12, speedY: 8, angle: 4, angleDuration: 600, breathDuration: 280 },
            cataituong: { texture: 'cataituong', scale: 0.03, startX: 30, startY: -40, speedX: 8, speedY: -15, angle: 2, angleDuration: 800, breathDuration: 320 },
            calaukinh: { texture: 'calaukinh', scale: 0.03, startX: -30, startY: 10, speedX: -8, speedY: 12, angle: 3, angleDuration: 750, breathDuration: 300 }
        };
        const INTERACTION_TIMES = { thoiGianBomNuoc: 5000, thoiGianXaNuoc: 3000 };
        
        let pondX = 270; 
        let pondY = groundLevelY - 70;

        // 1. CHIẾC AO
        let pond = scene.add.image(pondX, pondY, 'ao').setOrigin(0.5, 0.5).setDepth(2);

        // 2. GẠCH LÓT ĐƯỜNG
        let gocX = 320; 
        let gocY = groundLevelY - 45; 
        let toaDoX_HienTai = gocX - 205; 
        let toaDoY_HienTai = gocY + 15;  

        for (let i = 1; i <= 25; i++) {
            let gach = scene.add.image(toaDoX_HienTai, toaDoY_HienTai, 'gach').setOrigin(0.5, 0.5).setDepth(1.02).setScale(0.8, 0.5);
            if (i === 1) toaDoY_HienTai += 15;
            else toaDoX_HienTai += 25;
        }

        // 3. TẠO TEXTURE GIỌT NƯỚC (Cho máy bơm)
        let nuocGraphics = scene.make.graphics({x: 0, y: 0, add: false});
        nuocGraphics.fillStyle(0x4FC3F7, 0.9); 
        nuocGraphics.fillCircle(6, 6, 6); 
        nuocGraphics.generateTexture('giotnuoc', 12, 12);

        // 4. Ô ĐẤT & MÁY BƠM
        let oDat = scene.add.sprite(570, groundLevelY - 70, 'odat', 0).setOrigin(0.5, 0.5).setDepth(1.2).setScale(0.38).setInteractive({ useHandCursor: true });
        
        let mayBomX = pondX + 150; 
        let mayBomY = pondY - 20; 
        let mayBom = scene.add.image(mayBomX, mayBomY, 'maybom').setOrigin(0.5, 0.5).setDepth(3.5).setScale(0.07);

        let emitter = scene.add.particles(0, 0, 'giotnuoc', {
            x: mayBomX + 40,
            y: mayBomY - 15,
            angle: { min: 0, max: 0 }, 
            speed: { min: 100, max: 200 }, 
            gravityY: 300,                 
            lifespan: 500,                
            scale: { start: 0.5, end: 0 },   
            quantity: 5,                   
            emitting: false                
        });
        emitter.setDepth(3.6); 

        // 5. LOGIC BƠM NƯỚC
        let isWatering = false, isDraining = false, isFullWater = false; 

        oDat.on('pointerdown', () => {
            if (scene.isUIOpen || isWatering || isDraining) return; 

            if (!isFullWater) {
                isWatering = true; 
                emitter.start(); 
                let textBom = scene.add.text(oDat.x, oDat.y - 40, 'Đang bơm nước...', { fontSize: '18px', fill: '#0288D1', fontStyle: 'bold', stroke: '#ffffff', strokeThickness: 3 }).setOrigin(0.5).setDepth(1.5);
                scene.tweens.add({ targets: textBom, alpha: 0.3, duration: 500, yoyo: true, repeat: -1 });

                scene.time.delayedCall(INTERACTION_TIMES.thoiGianBomNuoc, () => {
                    isWatering = false; isFullWater = true; oDat.setFrame(1);
                    textBom.destroy();  emitter.stop(); 
                    let textDay = scene.add.text(oDat.x, oDat.y - 40, 'Đã đầy!', { fontSize: '20px', fill: '#4CAF50', fontStyle: 'bold', stroke: '#ffffff', strokeThickness: 3 }).setOrigin(0.5).setDepth(1.5);
                    scene.time.delayedCall(2000, () => textDay.destroy());
                });
            } else {
                isDraining = true;
                let textXa = scene.add.text(oDat.x, oDat.y - 40, 'Đang xả nước...', { fontSize: '18px', fill: '#FF9800', fontStyle: 'bold', stroke: '#ffffff', strokeThickness: 3 }).setOrigin(0.5).setDepth(1.5);
                scene.tweens.add({ targets: textXa, alpha: 0.3, duration: 500, yoyo: true, repeat: -1 });

                scene.time.delayedCall(INTERACTION_TIMES.thoiGianXaNuoc, () => {
                    isDraining = false; isFullWater = false; oDat.setFrame(0);
                    textXa.destroy();    
                    let textKho = scene.add.text(oDat.x, oDat.y - 40, 'Đã cạn!', { fontSize: '20px', fill: '#795548', fontStyle: 'bold', stroke: '#ffffff', strokeThickness: 3 }).setOrigin(0.5).setDepth(1.5);
                    scene.time.delayedCall(2000, () => textKho.destroy());
                });
            }
        });

        // 6. CẦU CÁ VÀ RÀO CHẮN VẬT LÝ
        let cauCaTra = scene.physics.add.image(pondX - 110, pondY + 35, 'caucatra').setOrigin(0.5, 1).setDepth(3).setScale(0.12).setImmovable(true); 
        cauCaTra.body.setSize(cauCaTra.width * 0.60, cauCaTra.height * 0.20);
        cauCaTra.body.setOffset(0, cauCaTra.height * 0.95);
        
        let thanhCauHitbox = scene.add.rectangle(pondX - 110 + 35, pondY + 35 - 15, 30, 5, 0x000000, 0);
        scene.physics.add.existing(thanhCauHitbox, true);

        // Tạo khung ranh giới cho hồ (Walls & Corners)
        let wWidth = 370, wHeight = 135; 
        let bX = pondX, bY = pondY - 10;
        
        let walls = [
            scene.add.rectangle(bX, bY - wHeight/2, wWidth, 20, 0x000000, 0),
            scene.add.rectangle(bX, bY + wHeight/2, wWidth, 20, 0x000000, 0),
            scene.add.rectangle(bX - wWidth/2, bY, 20, wHeight, 0x000000, 0),
            scene.add.rectangle(bX + wWidth/2, bY, 20, wHeight, 0x000000, 0),
            scene.add.rectangle((bX - wWidth/2) + 45/2 + 10, (bY - wHeight/2) + 55/2 + 10, 45, 55, 0x000000, 0), // cornerTopLeft
            scene.add.rectangle((bX + wWidth/2) - 40/2 - 10, (bY - wHeight/2) + 25/2 + 10, 40, 25, 0x000000, 0), // cornerTopRight
            scene.add.rectangle((bX - wWidth/2) + 68/2 + 10, (bY + wHeight/2) - 1/2 - 65, 68, 1, 0x000000, 0),   // cornerBottomLeft
            scene.add.rectangle((bX + wWidth/2) - 5/2 - 20, (bY + wHeight/2) - 5/2 - 65, 5, 5, 0x000000, 0),     // cornerBottomRight
            scene.add.rectangle((bX - wWidth/2) + 45/2 + 10 + 45, (bY - wHeight/2) + 55/2 + 10 - 15, 20, 20, 0x000000, 0), // extraTopLeft
            scene.add.rectangle((bX + wWidth/2) - 5/2 - 20 + 5, (bY + wHeight/2) - 5/2 - 65 + 45, 5, 5, 0x000000, 0),      // extraBottomRight
            scene.add.rectangle((bX + wWidth/2) - 40/2 - 10 - 45, (bY - wHeight/2) + 25/2 + 10, 10, 10, 0x000000, 0),      // extraTopRight
            scene.add.rectangle((bX - wWidth/2) + 68/2 + 10 - 15, (bY + wHeight/2) - 1/2 - 65 + 5, 5, 5, 0x000000, 0),     // extraBottomLeft
            scene.add.rectangle(bX - 85, bY - 50, 10, 10, 0xff0000, 0) // oVuongPhiaTren
        ];

        walls.forEach(w => scene.physics.add.existing(w, true));

        let hitboxOngBom = scene.add.rectangle(mayBomX - 25, mayBomY + 20, 5, 5, 0xff0000, 0); 
        scene.physics.add.existing(hitboxOngBom, true);

        // 7. ĐÀN CÁ BƠI LỘI
        Object.keys(FISH_SETTINGS).forEach(loaiCa => {
            let config = FISH_SETTINGS[loaiCa];
            let fish = scene.physics.add.sprite(pondX + config.startX, pondY + config.startY, config.texture, 0);
            
            fish.setDepth(2.5).setScale(config.scale).setBounce(1, 1).setDrag(0).setVelocity(config.speedX, config.speedY);
            fish.body.setCircle(fish.width / 2);

            scene.tweens.add({ targets: fish, angle: { from: -config.angle, to: config.angle }, duration: config.angleDuration, yoyo: true, repeat: -1, ease: 'Sine.easeInOut' });
            scene.tweens.add({ targets: fish, scaleX: config.scale * 0.95, scaleY: config.scale * 1.05, duration: config.breathDuration, yoyo: true, repeat: -1, ease: 'Sine.easeInOut' });

            scene.physics.add.collider(fish, [cauCaTra, thanhCauHitbox]);
            scene.physics.add.collider(fish, walls);
            
            this.fishes.push(fish); // Lưu vào mảng để cập nhật lật ảnh
        });

        // Cá va chạm với nhau
        scene.physics.add.collider(this.fishes);
    }

    // Hàm gọi liên tục ở update() của GameScene để lật mặt cá
    update() {
        this.fishes.forEach(fish => {
            if (fish && fish.active) {
                if (fish.body.velocity.x > 0) fish.setFlipX(true); 
                else if (fish.body.velocity.x < 0) fish.setFlipX(false);
            }
        });
    }
}
