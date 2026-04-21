export default class Environment {
    constructor(scene, width, height, groundLevelY) {
        this.scene = scene;
        this.width = width;
        this.height = height;
        this.groundLevelY = groundLevelY;
        this.groundOffsetY = 0;
        this.daoDat_Y = 400; // Thay thế LAYOUT_SETTINGS.DAO_DAT.y

        this.createSky();
        this.createDaoDat();
        this.createGroundAndRoad();
        this.createMountainsAndRocks();
        this.createMayBay();
        this.createFencesAndGate();
    }

    createSky() {
        let skyOffsetY = -3000; 
        let sky = this.scene.add.image(0, skyOffsetY, 'Sky').setOrigin(0, 0).setDepth(0); 
        sky.setDisplaySize(this.width, this.height * 3.5);
        sky.setScrollFactor(0, 0.5);
    }

    createDaoDat() {
        let daoDat_X = this.width / 2;
        this.daodat = this.scene.add.image(daoDat_X, this.daoDat_Y, 'daodat').setScale(0.15).setDepth(0.5); // Depth 0.5, Scale 0.15
        this.scene.tweens.add({
            targets: this.daodat,
            y: this.daoDat_Y - 30, // Thay thế tweenOffset
            duration: 2500,        // Thay thế tweenDuration
            yoyo: true,
            repeat: -1,
            ease: 'Sine.easeInOut'
        });

        // Hàng rào ngang bên chân núi trên đảo
        let hangRaoY = this.daoDat_Y + 323; 
        let hrScale = 0.13 * (this.width / 400); 
        let khoangCachCay = 0; 
        let startX = 0; 

        for (let i = 0; i < 3; i++) {
            let hangRao = this.scene.add.image(0, hangRaoY, 'hangrao').setOrigin(0.5, 1).setDepth(1.05).setScale(hrScale).setScrollFactor(0, 1);
            if (i === 0) {
                khoangCachCay = hangRao.width * hrScale;
                startX = daoDat_X - (khoangCachCay * 2) / 2;
            }
            hangRao.x = startX + i * khoangCachCay;
        }
    }

    createGroundAndRoad() {
        this.ground = this.scene.add.image(0, this.height + this.groundOffsetY, 'ground').setOrigin(0, 1).setDepth(1);
        this.ground = this.scene.add.image(0, this.height + this.groundOffsetY, 'ground').setOrigin(0, 1).setDepth(1);
        this.ground.displayWidth = this.width; 
        this.ground.scaleY = this.ground.scaleX; // Tự động co giãn đều

        let duongHeight = this.scene.textures.get('duong').get().height;
        let scaleConDuong = 0.1; 
        let conDuongOffsetY = this.height; 
        this.scene.add.tileSprite(0, conDuongOffsetY, this.width / scaleConDuong, duongHeight, 'duong')
            .setOrigin(0, 1).setDepth(2).setScale(scaleConDuong).setScrollFactor(0, 1);
    }

    createMountainsAndRocks() {
        let groundDisplayHeight = this.ground.height * this.scaleRatio;
        this.mountainY = (this.height + this.groundOffsetY) - groundDisplayHeight + 50; 
        
        let nui = this.scene.add.image(0, this.mountainY, 'nui').setOrigin(0, 1).setDepth(0.5).setScale(this.width / this.scene.textures.get('nui').get().width).setScrollFactor(0, 1);
        let nui1 = this.scene.add.image(0, this.mountainY, 'nui1').setOrigin(0, 1).setDepth(0.6).setScale(this.width / this.scene.textures.get('nui1').get().width).setScrollFactor(0, 1);

        // Rải đá
        let heSoScale = this.width / 400;
        let yDaBatDau = this.mountainY - 60;
        let yDaKetThuc = this.height + this.groundOffsetY - 65; 

        const raiDaCoDinh = (fixX, fixedScale) => {
            let index = 0;
            for (let y = yDaBatDau; y < yDaKetThuc; y += 25) {
                let rock = this.scene.add.sprite(fixX, y, 'rock', index % 3);
                rock.setScale(fixedScale * heSoScale).setRotation(0).setDepth(2.5 + (y / 10000)).setScrollFactor(0, 1);
                if (index % 2 === 0) rock.setFlipX(true);
                index++;
            }
    };

        // Thay vì để (this.width + 10) hay (this.width - 10), hãy thu vào:
        raiDaCoDinh(15, 0.04);              // Khối đá sát lề trái
        raiDaCoDinh(this.width + 10, 0.04); // Khối đá sát lề phải
        raiDaCoDinh(5, 0.02);              // Khối đá nhỏ bên trái
        raiDaCoDinh(this.width - 10, 0.04); // Khối đá nhỏ bên phải
    }

    createMayBay() {
        this.maybay = this.scene.add.image(this.width + 150, this.mountainY - 300, 'maybay').setOrigin(0.5, 0.5).setDepth(0.7).setScale(0.3).setScrollFactor(0, 0.75);
    }

    createFencesAndGate() {
        let congRaoScale = 0.22; 
        let hrScaleTruoc = 0.35; 
        let baseOriginY = this.height + this.groundOffsetY; 
        let viTriYCong = baseOriginY - 50;
        let viTriYHangRao = baseOriginY - 25;

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
