export default class Environment {
    constructor(scene, width, height, groundLevelY) {
        this.scene = scene;
        this.width = width;
        this.height = height;
        this.groundLevelY = groundLevelY;
        this.groundOffsetY = 0;
        this.daoDat_Y = 400; // Tọa độ tĩnh của Đảo đất

        this.createSky();
        this.createGroundAndRoad(); 
        this.createMountainsAndRocks();
        this.createDaoDat();
        this.createMayBay();
        this.createFencesAndGate();
    }

    createSky() {
        // Fix bầu trời: Cố định giữa màn hình, hiển thị full màn hình
        let sky = this.scene.add.image(this.width / 2, this.height / 2, 'Sky').setOrigin(0.5, 0.5).setDepth(0); 
        sky.setDisplaySize(this.width, this.height);
        sky.setScrollFactor(0); // Giữ nguyên trên camera khi vuốt lên xuống
    }

    createGroundAndRoad() {
        // Fix mặt đất: Đổi depth = 0.4 (Nằm sau đảo đất, nhưng che được chân núi phía xa)
        this.ground = this.scene.add.image(0, this.height + this.groundOffsetY, 'ground').setOrigin(0, 1).setDepth(0.4);
        this.ground.displayWidth = this.width; 
        this.ground.scaleY = this.ground.scaleX;

        let duongHeight = this.scene.textures.get('duong').get().height;
        let scaleConDuong = 0.1; 
        let conDuongOffsetY = this.height; 
        this.scene.add.tileSprite(0, conDuongOffsetY, this.width / scaleConDuong, duongHeight, 'duong')
            .setOrigin(0, 1).setDepth(0.45).setScale(scaleConDuong).setScrollFactor(0, 1);
    }

    createMountainsAndRocks() {
        let groundDisplayHeight = this.ground.height * this.ground.scaleY;
        this.mountainY = (this.height + this.groundOffsetY) - groundDisplayHeight + 50; 
        
        let nui = this.scene.add.image(0, this.mountainY, 'nui').setOrigin(0, 1).setDepth(0.2).setScale(this.width / this.scene.textures.get('nui').get().width).setScrollFactor(0, 1);
        let nui1 = this.scene.add.image(0, this.mountainY, 'nui1').setOrigin(0, 1).setDepth(0.3).setScale(this.width / this.scene.textures.get('nui1').get().width).setScrollFactor(0, 1);

        let heSoScale = this.width / 400;
        let yDaBatDau = this.mountainY - 60;
        let yDaKetThuc = this.height + this.groundOffsetY - 65; 

        const raiDaCoDinh = (fixX, fixedScale) => {
            let index = 0;
            for (let y = yDaBatDau; y < yDaKetThuc; y += 25) {
                let rock = this.scene.add.sprite(fixX, y, 'rock', index % 3);
                
                // FIX: Tăng depth lên 0.6 để đá nằm TRÊN đảo đất (depth 0.5)
                // Cộng thêm (y / 10000) để các viên đá phía dưới đè lên viên phía trên cho tự nhiên
                rock.setDepth(1.3 + (y / 10000)); 
                
                rock.setScale(fixedScale * heSoScale).setRotation(0).setScrollFactor(0, 1);
                if (index % 2 === 0) rock.setFlipX(true);
                index++;
            }
        };

        raiDaCoDinh(15, 0.04);              
        raiDaCoDinh(this.width + 10, 0.04); 
        raiDaCoDinh(5, 0.02);              
        raiDaCoDinh(this.width - 10, 0.04); 
    }

    createDaoDat() {
        let daoDat_X = this.width / 2;
        // Đảo đất nằm trước toàn bộ núi và mặt đất (Depth 0.5)
        this.daodat = this.scene.add.image(daoDat_X, this.daoDat_Y, 'daodat').setScale(0.15).setDepth(0.1); 
        this.scene.tweens.add({
            targets: this.daodat,
            y: this.daoDat_Y - 30, 
            duration: 2500,        
            yoyo: true,
            repeat: -1,
            ease: 'Sine.easeInOut'
        });

        let hangRaoY = this.daoDat_Y + 323; 
        let hrScale = 0.13 * (this.width / 400); 
        let khoangCachCay = 0; 
        let startX = 0; 

        for (let i = 0; i < 3; i++) {
            // FIX: Giảm depth của hàng rào xuống 0.43 để nó nằm dưới lớp đá (đang là 0.46)
            let hangRao = this.scene.add.image(0, hangRaoY, 'hangrao').setOrigin(0.5, 1).setDepth(0.43).setScale(hrScale).setScrollFactor(0, 1);
            if (i === 0) {
                khoangCachCay = hangRao.width * hrScale;
                startX = daoDat_X - (khoangCachCay * 2) / 2;
            }
            hangRao.x = startX + i * khoangCachCay;
        }
    }

    createMayBay() {
        // Mây bay lơ lửng nằm giữa vùng trời (0) và núi (0.2)
        this.maybay = this.scene.add.image(this.width + 150, this.mountainY - 300, 'maybay').setOrigin(0.5, 0.5).setDepth(0.15).setScale(0.3).setScrollFactor(0, 0.75);
    }

    createFencesAndGate() {
        let congRaoScale = 0.22; 
        let hrScaleTruoc = 0.35; 
        let baseOriginY = this.height + this.groundOffsetY; 
        let viTriYCong = baseOriginY - 50;
        let viTriYHangRao = baseOriginY - 25;

        // Depth rất cao vì nó nằm ở tiền cảnh (gần màn hình nhất)
        this.congRao = this.scene.add.sprite(this.width / 2, viTriYCong, 'congrao', 0).setOrigin(0.5, 1).setDepth(2000).setScrollFactor(0, 1).setScale(congRaoScale);
        let congRaoWidth = this.congRao.width * congRaoScale;

        this.scene.add.image((this.width / 2) - (congRaoWidth / 2) + 60, viTriYHangRao, 'hangrao').setOrigin(1, 1).setDepth(1999).setScrollFactor(0, 1).setScale(hrScaleTruoc);
        this.scene.add.image((this.width / 2) + (congRaoWidth / 2) - 60, viTriYHangRao, 'hangrao').setOrigin(0, 1).setDepth(1999).setScrollFactor(0, 1).setScale(hrScaleTruoc);

        this.congRao.setInteractive({ useHandCursor: true });
        let isGateClosed = true;
        
        this.congRao.on('pointerdown', () => {
            if (this.scene.isUIOpen) return; 
            isGateClosed = !isGateClosed; 
            if (isGateClosed) {
                this.congRao.setFrame(0); 
                this.congRao.y = viTriYCong; 
            } else {
                this.congRao.setFrame(1); 
                this.congRao.y = viTriYCong + 43; 
            }
        });
    }

    update() {
        if (this.maybay && this.maybay.active) {
            this.maybay.x -= 0.3;
            let halfWidth = (this.maybay.width * this.maybay.scaleX) / 2;
            if (this.maybay.x < -halfWidth) {
                this.maybay.x = this.width + halfWidth;
            }
        }
    }
}
