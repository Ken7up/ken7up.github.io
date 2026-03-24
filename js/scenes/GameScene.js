class GameScene extends Phaser.Scene {
    constructor() {
        super('GameScene');
    }

    create() {
        this.input.addPointer(2);

        this.isGameOver = false;
        this.isDashing = false;
        this.joyDir = 0; 
        
        // --- 1. DỜI MẶT ĐẤT, KHỦNG LONG VÀ XƯƠNG RỒNG XUỐNG DƯỚI ---
        const groundY = this.scale.height - 300;
        this.groundY = groundY; 

        this.physics.world.setBounds(0, 0, 1000000, this.scale.height);
        this.cameras.main.setBounds(0, 0, 1000000, this.scale.height);
        
        this.groundDetails = this.add.group();
        this.lastDirtSpawnX = 0;
        this.spawnDirtChunk(0, this.scale.width * 2);

        this.groundPhysics = this.add.rectangle(0, groundY + 10, 1000000, 50, 0x000000, 0).setOrigin(0, 0);
        this.physics.add.existing(this.groundPhysics, true); 

        // --- 2. KHỦNG LONG ---
        this.dino = this.physics.add.sprite(100, groundY - 100, 'dino');
        this.dino.setScale(2); 
        this.dino.setCollideWorldBounds(true);
        
        // [SỬA ĐỔI]: Thu nhỏ hitbox và dịch chuyển (offset) cho khớp với hình nhân vật
        this.dino.body.setSize(22, 22); // Chiều rộng 14, chiều cao 22
        this.dino.body.setOffset(5, 5); // Đẩy hitbox xích vào giữa khung ảnh 32x32
        
        this.dino.setDepth(10);

        this.anims.create({ key: 'idle', frames: [{ key: 'dino', frame: 0 }], frameRate: 10 });
        this.anims.create({ key: 'dead', frames: [{ key: 'dino', frame: 1 }], frameRate: 10 });
        this.anims.create({ key: 'run', frames: this.anims.generateFrameNumbers('dino', { frames: [2, 3] }), frameRate: 10, repeat: -1 });
        this.anims.create({ key: 'dash_anim', frames: this.anims.generateFrameNumbers('dino', { frames: [4, 5] }), frameRate: 15, repeat: -1 });

        this.dino.play('idle'); 
        this.physics.add.collider(this.dino, this.groundPhysics);

        // --- CAMERA BÁM THEO KHỦNG LONG ---
        this.cameras.main.startFollow(this.dino, true, 0.1, 0.1);
        this.cameras.main.setFollowOffset(-200, 0); 

        this.obstacles = this.physics.add.group();
        this.lastSpawnX = 400; 

        this.createControls();

        this.input.keyboard.on('keydown-SPACE', this.jump, this);
        this.input.keyboard.on('keydown-SHIFT', this.dash, this);

        this.physics.add.overlap(this.dino, this.obstacles, this.hitObstacle, null, this);
    }

    // --- 3. HÀM TẠO CHI TIẾT NỀN ĐẤT ---
    spawnDirtChunk(startX, endX) {
        for (let x = startX; x < endX; x += Phaser.Math.Between(15, 35)) {
            if (Phaser.Math.Between(0, 100) < 50) { 
                const isDot = Phaser.Math.Between(0, 1) === 0;
                const width = isDot ? Phaser.Math.Between(2, 4) : Phaser.Math.Between(6, 15);
                const height = 2; 
                const offsetY = Phaser.Math.Between(6, 30); 

                const dirt = this.add.rectangle(x, this.groundY + offsetY, width, height, 0x535353).setOrigin(0, 0);
                // Đất mặc định sẽ có depth = 0 nên sẽ nằm dưới Khủng long (depth = 10)
                this.groundDetails.add(dirt);
            }
        }

        let currentX = startX;
        while (currentX < endX) {
            const featureType = Phaser.Math.Between(0, 100);

            if (featureType < 15) {
                // KHE NỨT
                const gapWidth = Phaser.Math.Between(15, 30);
                const craterBottom = this.add.rectangle(currentX + 4, this.groundY + 4, gapWidth - 8, 2, 0x535353).setOrigin(0, 0);
                this.groundDetails.add(craterBottom);
                
                currentX += gapWidth; 
            } 
            else if (featureType < 30) {
                // ĐƯỜNG THẲNG BÌNH THƯỜNG
                const segmentWidth = Phaser.Math.Between(30, 60);
                const line = this.add.rectangle(currentX, this.groundY, segmentWidth, 2, 0x535353).setOrigin(0, 0);
                this.groundDetails.add(line);

                currentX += segmentWidth;
            } 
            else {
                // ĐƯỜNG THẲNG BÌNH THƯỜNG
                const segmentWidth = Phaser.Math.Between(40, 150);
                const line = this.add.rectangle(currentX, this.groundY, segmentWidth, 2, 0x535353).setOrigin(0, 0);
                this.groundDetails.add(line);
                
                currentX += segmentWidth;
            }
        }
        
        this.lastDirtSpawnX = currentX;
    }

    createControls() {
        const joyX = 130;
        const joyY = this.scale.height - 100;
        const joyRadius = 70; 
        
        this.add.circle(joyX, joyY, joyRadius, 0x888888, 0.3).setScrollFactor(0);
        this.joyThumb = this.add.circle(joyX, joyY, 25, 0x555555, 0.8).setScrollFactor(0);
        
        // Tránh Nút điều khiển bị che mất, ta đưa nó lên trên cùng luôn
        this.joyThumb.setDepth(20); 
        
        const largerHitArea = new Phaser.Geom.Circle(25, 25, 60); 
        
        this.joyThumb.setInteractive({ 
            hitArea: largerHitArea, 
            hitAreaCallback: Phaser.Geom.Circle.Contains,
            draggable: true 
        });
        
        this.input.setDraggable(this.joyThumb);
        this.input.on('drag', (pointer, gameObject, dragX, dragY) => {
            if (gameObject !== this.joyThumb || this.isGameOver) return;
            const dist = Phaser.Math.Distance.Between(joyX, joyY, dragX, dragY);
            if (dist <= joyRadius) {
                this.joyThumb.setPosition(dragX, dragY);
            } else {
                const angle = Phaser.Math.Angle.Between(joyX, joyY, dragX, dragY);
                this.joyThumb.setPosition(joyX + Math.cos(angle) * joyRadius, joyY + Math.sin(angle) * joyRadius);
            }
            this.joyDir = (this.joyThumb.x - joyX) / joyRadius;
        });

        this.input.on('dragend', (pointer, gameObject) => {
            if (gameObject !== this.joyThumb) return;
            this.joyThumb.setPosition(joyX, joyY);
            this.joyDir = 0; 
        });

        const btnY = this.scale.height - 100;
        
        const dashBtn = this.add.circle(this.scale.width - 180, btnY, 40, 0x0055ff, 0.4).setInteractive().setScrollFactor(0).setDepth(20);
        this.add.text(this.scale.width - 180, btnY, 'DASH', { fontSize: '16px', fill: '#fff', fontWeight: 'bold' }).setOrigin(0.5).setScrollFactor(0).setDepth(20);
        dashBtn.on('pointerdown', this.dash, this);

        const jumpBtn = this.add.circle(this.scale.width - 70, btnY, 40, 0xff3300, 0.4).setInteractive().setScrollFactor(0).setDepth(20);
        this.add.text(this.scale.width - 70, btnY, 'JUMP', { fontSize: '16px', fill: '#fff', fontWeight: 'bold' }).setOrigin(0.5).setScrollFactor(0).setDepth(20);
        jumpBtn.on('pointerdown', this.jump, this);

        this.input.on('pointerdown', (pointer, currentlyOver) => {
            if (this.isGameOver && currentlyOver.length === 0) this.scene.restart();
        });
    }

    jump() {
        if (this.dino.body.touching.down && !this.isGameOver) {
            this.dino.setVelocityY(-700); 
            this.dino.play('idle');
        }
    }

    dash() {
        if (this.isGameOver || this.isDashing) return;
        
        this.isDashing = true;
        this.dino.play('dash_anim');
        
        // 1. Lấy hướng hiện tại của khủng long
        const isFacingLeft = this.dino.flipX;
        
        // 2. Thu nhỏ hitbox cho dáng khôm
        this.dino.body.setSize(26, 14); 

        // 3. [XỬ LÝ LẬT HITBOX]
        if (isFacingLeft) {
            // Nếu đang quay trái, dùng công thức bù trừ
            this.dino.body.setOffset(2, 13); 
        } else {
            // Nếu quay phải, dùng offset mặc định
            this.dino.body.setOffset(4, 13); 
        }

        // Lướt theo hướng đang nhìn
        const dashDirection = isFacingLeft ? -1 : 1;
        this.dino.setVelocityX(400 * dashDirection); 

        this.time.delayedCall(400, () => {
            if (this.isGameOver) return;
            this.isDashing = false;
            
            // 4. Trả lại hitbox dáng đứng
            this.dino.body.setSize(22, 22); 
            // Dáng đứng nằm giữa nên trái/phải đều chung offset X là 8
            this.dino.body.setOffset(5, 5); 

            if (this.dino.body.touching.down) {
                this.dino.play('run');
            } else {
                this.dino.play('idle');
            }
        }, [], this);
    }

    spawnCactusCluster(startX) {
        const count = Phaser.Math.Between(1, 3);
        const sizes = [1.5, 2.0, 2.5]; 
        let currentX = startX;

        for (let i = 0; i < count; i++) {
            const cactus = this.obstacles.create(currentX, this.groundY + 10, 'cactus');
            
            cactus.setDepth(10);
            cactus.setFrame(Phaser.Math.Between(0, 1)); 
            cactus.setOrigin(0.5, 1);
            
            const randomSize = Phaser.Utils.Array.GetRandom(sizes);
            cactus.setScale(randomSize); 

            // [SỬA ĐỔI]: Thu nhỏ hitbox của xương rồng lại để tránh chạm oan
            // Do xương rồng hẹp theo chiều ngang, ta giảm width xuống đáng kể
            cactus.body.setSize(22, 31); 
            cactus.body.setOffset(5, 1); // Căn giữa hitbox theo chiều ngang

            cactus.body.allowGravity = false;
            cactus.setImmovable(true);

            currentX += (25 * randomSize) + 10; 
        }
    }

    hitObstacle() {
        this.isGameOver = true;
        this.physics.pause();
        this.dino.play('dead');

        this.add.text(this.cameras.main.scrollX + this.scale.width / 2, this.scale.height / 2 - 150, 'GAME OVER\nChạm màn hình để chơi lại', {
            fontSize: '32px',
            fill: '#535353',
            fontFamily: 'monospace',
            align: 'center'
        }).setOrigin(0.5).setDepth(30); // Cho chữ Game Over nổi lên trên cùng
    }

    update() {
        if (this.isGameOver) return;

        if (this.dino.x > this.lastSpawnX - 600) {
            this.spawnCactusCluster(this.lastSpawnX + Phaser.Math.Between(400, 700));
            this.lastSpawnX += Phaser.Math.Between(600, 1000);
        }

        if (this.cameras.main.scrollX + this.scale.width + 500 > this.lastDirtSpawnX) {
            this.spawnDirtChunk(this.lastDirtSpawnX, this.lastDirtSpawnX + 1000);
        }

        if (!this.isDashing) {
            this.dino.setVelocityX(this.joyDir * 200); 

            if (this.dino.body.touching.down) {
                if (Math.abs(this.joyDir) > 0.1) {
                    if (this.dino.anims.currentAnim.key !== 'run') this.dino.play('run', true);
                } else {
                    if (this.dino.anims.currentAnim.key !== 'idle') this.dino.play('idle', true);
                }
            } else {
                if (this.dino.anims.currentAnim.key !== 'idle') this.dino.play('idle', true);
            }
        }

        if (!this.isDashing) {
            if (this.joyDir < -0.1) {
                this.dino.setFlipX(true); 
            } else if (this.joyDir > 0.1) {
                this.dino.setFlipX(false); 
            }
        }

        this.obstacles.getChildren().forEach(obstacle => {
            if (obstacle.x < this.cameras.main.scrollX - 200) {
                obstacle.destroy();
            }
        });

        this.groundDetails.getChildren().forEach(detail => {
            if (detail.x < this.cameras.main.scrollX - 200) {
                detail.destroy();
            }
        });
    }
}
