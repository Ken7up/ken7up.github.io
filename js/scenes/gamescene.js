class GameScene extends Phaser.Scene {
    constructor() {
        super('GameScene');
    }

    create() {
        this.input.addPointer(2);

        this.isGameOver = false;
        this.isDashing = false;
        this.joyDir = 0;
        this.wasGrounded = true;
        // Khởi tạo HP và MP
        this.maxHp = 1000;
        this.currentHp = 1000;
        this.maxMp = 100;
        this.currentMp = 100;
        
        // --- 1. KHỞI TẠO BẢN ĐỒ CỐ ĐỊNH ---
        const MAP_WIDTH = 3000; 
        const SKY_HEIGHT = 5500; // Tăng từ 2500 lên 5500 để nới rộng bầu trời
        this.MAP_WIDTH = MAP_WIDTH; 
        const groundY = this.scale.height - 300;
        this.groundY = groundY; 

        // Khởi tạo cameraOffsetY sớm để dùng cho hàm scale tre
        this.cameraOffsetY = 0; 
        const MAX_SKY_VIEW = -5000; // Tăng từ -2200 lên -5000 để cho phép vuốt cao hơn
        this.MAX_SKY_VIEW = MAX_SKY_VIEW;

        this.physics.world.setBounds(0, -SKY_HEIGHT, MAP_WIDTH, this.scale.height + SKY_HEIGHT);
        this.cameras.main.setBounds(0, -SKY_HEIGHT, MAP_WIDTH, this.scale.height + SKY_HEIGHT);
        
        this.clouds = this.add.group();
        this.mountains = this.add.group();
        this.groundDetails = this.add.group();
        this.obstacles = this.physics.add.group();

        this.groundPhysics = this.add.rectangle(0, groundY, MAP_WIDTH, 50, 0x000000, 0).setOrigin(0, 0);
        this.physics.add.existing(this.groundPhysics, true); 

        // --- 2. TẠO SẴN TOÀN BỘ MÔI TRƯỜNG ---
        this.spawnDirtChunk(0, MAP_WIDTH);
        this.spawnEnvironment(MAP_WIDTH);

        // --- TRỒNG TRE VÀO CONTAINER ---
        this.spawnBamboo(100, 57); // Tăng từ 25 lên 57 đốt để đủ độ cao chứa mây

        // --- KHỦNG LONG ---
        this.dino = this.physics.add.sprite(100, groundY - 100, 'dino');
        this.dino.setScale(2); 
        this.dino.setCollideWorldBounds(true); 
        
        this.dino.body.setSize(22, 22); 
        this.dino.body.setOffset(5, 5); 
        this.dino.setDepth(10);

        this.anims.create({ key: 'idle', frames: [{ key: 'dino', frame: 0 }], frameRate: 10 });
        this.anims.create({ key: 'dead', frames: [{ key: 'dino', frame: 1 }], frameRate: 10 });
        this.anims.create({ key: 'run', frames: this.anims.generateFrameNumbers('dino', { frames: [2, 3] }), frameRate: 10, repeat: -1 });
        this.anims.create({ key: 'dash_anim', frames: this.anims.generateFrameNumbers('dino', { frames: [4, 5] }), frameRate: 15, repeat: -1 });

        this.dino.play('idle'); 
        this.physics.add.collider(this.dino, this.groundPhysics);

        // Bỏ 2 dòng cũ này:
        // this.cameras.main.startFollow(this.dino, true, 0.1, 0.1);
        // this.cameras.main.setFollowOffset(0, 0);

        // THÊM VÀO THAY THẾ: Tạo một vùng vô hình làm mục tiêu cho camera
        this.camTarget = this.add.zone(this.dino.x, this.dino.y, 1, 1);
        this.cameras.main.startFollow(this.camTarget, true, 0.1, 0.1);

        this.createControls();

        this.input.keyboard.on('keydown-SPACE', this.jump, this);
        this.input.keyboard.on('keydown-SHIFT', this.dash, this);

        this.physics.add.overlap(this.dino, this.obstacles, this.hitObstacle, null, this);

        // --- HỆ THỐNG VUỐT/LĂN NHÌN LÊN TRỜI ---
        this.input.on('wheel', (pointer, gameObjects, deltaX, deltaY, deltaZ) => {
            this.cameraOffsetY += deltaY * 0.8; 
            this.cameraOffsetY = Phaser.Math.Clamp(this.cameraOffsetY, MAX_SKY_VIEW, 0);
            // BỎ DÒNG: this.cameras.main.setFollowOffset(0, this.cameraOffsetY);
            this.updateBambooScale();
            this.updateUIVisibility();
        });

        this.input.on('pointermove', (pointer) => {
            if (!pointer.isDown) return;
            
            const isTouchJoystick = pointer.x < 300 && pointer.y > this.scale.height - 300;
            const isTouchButtons = pointer.x > this.scale.width - 300 && pointer.y > this.scale.height - 300;
            
            if (!isTouchJoystick && !isTouchButtons) {
                let deltaY = pointer.position.y - pointer.prevPosition.y;
                
                // Lưu ý nhỏ: Hiện tại đang là -=. 
                // Nếu bà thao tác "Vuốt ngón tay LÊN trên màn hình" và muốn camera nhìn LÊN trời, 
                // bà hãy đổi dấu -= thành += nhé.
                // Còn nếu muốn "Kéo màn hình xuống để nhìn lên", thì cứ giữ nguyên -=.
                this.cameraOffsetY -= deltaY * 1.5; 
                
                this.cameraOffsetY = Phaser.Math.Clamp(this.cameraOffsetY, MAX_SKY_VIEW, 0);
                // BỎ DÒNG: this.cameras.main.setFollowOffset(0, this.cameraOffsetY);
                this.updateBambooScale();
                this.updateUIVisibility();
            }
        });
    }

    // --- HÀM TẠO MÂY VÀ NÚI (ĐÃ CHỈNH SỬA PARALLAX CHIỀU DỌC) ---
    spawnEnvironment(mapWidth) {
        const fixedMountains = [
            { x: 180,  scale: 10, yOffset: 100 }, 
            { x: 600, scale: 2, yOffset: -50 }, 
            { x: 1100, scale: 5, yOffset: 20 }  
        ];

        fixedMountains.forEach(mountain => {
            this.add.image(mountain.x, this.groundY + mountain.yOffset, 'mountain')
                .setOrigin(0.5, 1) 
                // Tách biệt: X cuộn 0.3 (chậm), Y cuộn 0.6 (giúp núi tụt xuống khi nhìn lên)
                .setScrollFactor(0.3, 0.6) 
                .setScale(mountain.scale)
                .setDepth(-1);
        });
        
        // Tăng lượng mây và rải từ độ cao -2000 (đỉnh trời) xuống 150 (mặt đất)
        for (let x = -500; x < mapWidth + 500; x += Phaser.Math.Between(150, 350)) {
            let cloudY = Phaser.Math.Between(-2000, 150); 
            
            let cloud = this.add.image(x, cloudY, 'cloud')
                .setOrigin(0, 0)
                // X cuộn 0.1, Y cuộn 0.8 để mây trên cao dần lộ ra rõ rệt
                .setScrollFactor(0.1, 0.8)
                .setScale(Phaser.Math.FloatBetween(2, 5))
                .setAlpha(Phaser.Math.FloatBetween(0.7, 1)) // Tạo độ trong suốt ngẫu nhiên cho đẹp
                .setDepth(-2);
                
            this.clouds.add(cloud); 
        }
    }

    spawnInitialObstacles(mapWidth) {
        let currentX = 400; 
        while (currentX < mapWidth - 400) { 
            this.spawnCactusCluster(currentX);
            currentX += Phaser.Math.Between(600, 1000); 
        }
    }

    spawnDirtChunk(startX, endX) {
        for (let x = startX; x < endX; x += Phaser.Math.Between(15, 35)) {
            if (Phaser.Math.Between(0, 100) < 50) { 
                const isDot = Phaser.Math.Between(0, 1) === 0;
                const width = isDot ? Phaser.Math.Between(2, 4) : Phaser.Math.Between(6, 15);
                const height = 2; 
                const offsetY = Phaser.Math.Between(6, 30); 

                const dirt = this.add.rectangle(x, this.groundY + offsetY, width, height, 0x535353).setOrigin(0, 0);
                
                // THÊM DÒNG NÀY: Chỉnh layer của hạt bụi lên 6 (cao hơn tre là 5)
                dirt.setDepth(6); 
                
                this.groundDetails.add(dirt);
            }
        }
        
        // Tách đường kẻ đất ra một biến riêng để set depth
        const groundLine = this.add.rectangle(startX, this.groundY, endX - startX, 2, 0x535353).setOrigin(0, 0);
        
        // THÊM DÒNG NÀY: Chỉnh layer của đường đất lên 6
        groundLine.setDepth(6); 
        
        this.groundDetails.add(groundLine);
    }

    createControls() {
        const joyX = 130;
        const joyY = this.scale.height - 100;
        const joyRadius = 70; 
        
        // Gán background của joystick vào biến
        const joyBg = this.add.circle(joyX, joyY, joyRadius, 0x888888, 0.3).setScrollFactor(0);
        this.joyThumb = this.add.circle(joyX, joyY, 25, 0x555555, 0.8).setScrollFactor(0);
        
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
        const dashText = this.add.text(this.scale.width - 180, btnY, 'DASH', { fontSize: '16px', fill: '#fff', fontWeight: 'bold' }).setOrigin(0.5).setScrollFactor(0).setDepth(20);
        dashBtn.on('pointerdown', this.dash, this);

        const jumpBtn = this.add.circle(this.scale.width - 70, btnY, 40, 0xff3300, 0.4).setInteractive().setScrollFactor(0).setDepth(20);
        const jumpText = this.add.text(this.scale.width - 70, btnY, 'JUMP', { fontSize: '16px', fill: '#fff', fontWeight: 'bold' }).setOrigin(0.5).setScrollFactor(0).setDepth(20);
        jumpBtn.on('pointerdown', this.jump, this);

        this.input.on('pointerdown', (pointer, currentlyOver) => {
            if (this.isGameOver && currentlyOver.length === 0) this.scene.restart();
        });

        // --- VẼ QUẢ CẦU HP (ĐỎ) VÀ MP (XANH) ---
        const centerX = this.scale.width / 2;
        const orbY = this.scale.height - 35; 

        // Quả HP đỏ (Hàng 5 -> frame bắt đầu là 60)
        this.hpOrb = this.add.sprite(centerX - 80, orbY, 'life', 60)
            .setScrollFactor(0)
            .setDepth(20)
            .setScale(0.35)
            .setAlpha(0.85); // <-- Thêm độ trong suốt để nhìn rõ nước bên trong hơn
        
        this.hpText = this.add.text(centerX - 80, orbY + 30, '1000/1000', { fontSize: '14px', fill: '#ffcccc', fontWeight: 'bold' }).setOrigin(0.5).setScrollFactor(0).setDepth(20);

        // Quả MP xanh lam (Hàng 6 -> frame bắt đầu là 75)
        this.mpOrb = this.add.sprite(centerX + 80, orbY, 'life', 75)
            .setScrollFactor(0)
            .setDepth(20)
            .setScale(0.35)
            .setAlpha(0.85); // <-- Thêm độ trong suốt
            
        this.mpText = this.add.text(centerX + 80, orbY + 30, '100/100', { fontSize: '14px', fill: '#ccccff', fontWeight: 'bold' }).setOrigin(0.5).setScrollFactor(0).setDepth(20);

        // Đưa HP/MP vào mảng UI để ẩn khi vuốt camera lên ngọn tre
        this.uiElements = [
            joyBg, this.joyThumb, dashBtn, dashText, jumpBtn, jumpText,
            this.hpOrb, this.hpText, this.mpOrb, this.mpText
        ];
        this.joyBasePos = { x: joyX, y: joyY };
    }

    jump() {
        if (this.cameraOffsetY < -50) return; // <-- dòng này: Nếu đang nhìn lên trời thì không cho nhảy
        if (this.dino.body.touching.down && !this.isGameOver) {
            this.dino.setVelocityY(-700); 
            this.dino.play('idle');
            this.sound.play('sound_jump'); 
        }
    }

    dash() {
        if (this.cameraOffsetY < -50) return; 
        if (this.isGameOver || this.isDashing) return;
        
        // --- CHỈNH SỬA TẠI ĐÂY: Kiểm tra và Trừ Mana ---
        if (this.currentMp < 20) return; // Không đủ Mana thì không cho dash
        
        this.currentMp -= 20;   // Trừ 20 MP
        this.updateStatsUI();   // Cập nhật lại khung nước của quả MP màu xanh
        // ---------------------------------------------
        
        this.isDashing = true;
        this.dino.play('dash_anim');
        this.sound.play('sound_dash');
        
        const isFacingLeft = this.dino.flipX;
        this.dino.body.setSize(26, 14); 

        if (isFacingLeft) {
            this.dino.body.setOffset(2, 13); 
        } else {
            this.dino.body.setOffset(4, 13); 
        }

        const dashDirection = isFacingLeft ? -1 : 1;
        this.dino.setVelocityX(400 * dashDirection); 

        this.time.delayedCall(400, () => {
            if (this.isGameOver) return;
            this.isDashing = false;
            
            this.dino.body.setSize(22, 22); 
            this.dino.body.setOffset(5, 5); 

            if (this.dino.body.touching.down) {
                if (Math.abs(this.joyDir) > 0.1) {
                    this.dino.play('run');
                } else {
                    this.dino.play('idle');
                }
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
            const cactus = this.obstacles.create(currentX, this.groundY, 'cactus');
            
            cactus.setDepth(10);
            cactus.setFrame(Phaser.Math.Between(0, 1)); 
            cactus.setOrigin(0.5, 1);
            
            const randomSize = Phaser.Utils.Array.GetRandom(sizes);
            cactus.setScale(randomSize); 

            cactus.body.setSize(22, 31); 
            cactus.body.setOffset(5, 1); 

            cactus.body.allowGravity = false;
            cactus.setImmovable(true);

            currentX += (25 * randomSize) + 10; 
        }
    }

    hitObstacle(dino, obstacle) {
        if (this.isGameOver) return; // Nếu chết rồi thì không trừ máu nữa

        // Tính thời gian bất tử (invincibility frame) để không bị trừ máu liên tục 60 lần/giây
        if (this.time.now < this.lastHitTime) return;

        this.currentHp -= 250; // Trừ 250 HP mỗi lần đâm gai
        this.updateStatsUI();  // Gọi hàm nhảy ảnh quả cầu giật nước
        
        // Nháy đỏ khủng long để biết vừa ăn đòn
        this.dino.setTint(0xff0000);
        this.time.delayedCall(200, () => {
            if (this.dino) this.dino.clearTint();
        });
        
        this.lastHitTime = this.time.now + 1000; // Cho 1 giây bất tử sau khi bị gai chích

        // Hết máu -> Game Over
        if (this.currentHp <= 0) {
            this.isGameOver = true;
            this.physics.pause();
            this.dino.play('dead');

            this.add.text(this.cameras.main.scrollX + this.scale.width / 2, this.scale.height / 2 - 150, 'GAME OVER\nChạm màn hình để chơi lại', {
                fontSize: '32px',
                fill: '#ff4444',
                fontFamily: 'monospace',
                align: 'center'
            }).setOrigin(0.5).setDepth(30);
        }
    }

    update() {
        if (this.isGameOver) return;

        this.clouds.getChildren().forEach(cloud => {
            cloud.x -= 0.3; 
            if (cloud.x < -200) {
                cloud.x = this.MAP_WIDTH + 100;
            }
        });

        const isGrounded = this.dino.body.touching.down;
        if (isGrounded && !this.wasGrounded) {
             try {
                 if (!this.sound.locked) {
                     this.sound.play('sound_jumpland');
                 }
             } catch (error) {
                 console.log("Không thể phát âm thanh tiếp đất", error);
             }
        }
        this.wasGrounded = isGrounded;

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

        // THÊM VÀO DƯỚI CÙNG: Cập nhật vị trí mục tiêu ảo liên tục mỗi frame
        if (this.camTarget) {
            this.camTarget.x = this.dino.x;
            this.camTarget.y = this.dino.y + this.cameraOffsetY;
        }
    }

    // --- HÀM TẠO CÂY TRE TRĂM ĐỐT VÀ 9 TẦNG MÂY ---
    spawnBamboo(x, numSegments) {
        const baseScale = 2; 
        const yOffset = 85; 
        
        this.bambooContainer = this.add.container(x, this.groundY + yOffset);
        this.bambooContainer.setDepth(5); 

        let currentRelativeY = 0; 
        let baseDepth = 0; 

        // 1. Gốc tre
        let root = this.add.image(0, currentRelativeY, 'bamboo', 2)
            .setOrigin(0.5, 1)
            .setScale(baseScale)
            .setDepth(baseDepth);
        this.bambooContainer.add(root);
        
        currentRelativeY -= (23 * baseScale);

        // 2. Thân tre và các Tầng mây đan xen
        for (let i = 0; i < numSegments; i++) {
            let frameIndex = (i % 2 === 0) ? 1 : 3;
            let segmentHeight = 23 * baseScale; 
            
            // --- VẼ THÂN TRE TRƯỚC ---
            let part = this.add.image(0, currentRelativeY, 'bamboo', frameIndex)
                .setOrigin(0.5, 1)
                .setScale(baseScale)
                .setDepth(baseDepth + i + 1); // Depth của đốt dưới
            this.bambooContainer.add(part); 

            // --- VẼ 9 TẦNG MÂY THEO LOGIC CỦA KAKA.JS ---
            // Bắt đầu từ đốt 20, cách 4 đốt vẽ 1 mây, kết thúc ở 54
            if (i >= 20 && (i - 20) % 4 === 0 && i <= 54) {
                // Đưa mây ra giữa màn hình, TRỪ ĐI MỘT KHOẢNG ĐỂ XÍCH QUA TRÁI (VD: - 90)
                let cloudOffsetX = (this.scale.width / 2) - x - 90; 
                
                // Nhích mây lên để ôm giữa đốt tre, TRỪ ĐI THÊM ĐỂ MÂY XÍCH LÊN TRÊN (VD: - 40)
                let cloudOffsetY = -(segmentHeight / 2) - 55; 
                
                let cloud = this.add.image(cloudOffsetX, currentRelativeY + cloudOffsetY, 'cloudlayer')
                    .setOrigin(0.5, 0.5) 
                    // TĂNG TỪ 2 LÊN 3.5 HOẶC 4 ĐỂ MÂY TO RA
                    .setScale(1.5)         
                    .setAlpha(0.9)
                    // CHIỀU SÂU ĐÂM XUYÊN: Nằm trên đốt hiện tại (i+1) và nằm dưới đốt tiếp theo (i+2)
                    .setDepth(baseDepth + i + 1.5); 
                
                this.bambooContainer.add(cloud);
            }

            currentRelativeY -= segmentHeight;
        }

        // 3. Ngọn tre
        let top = this.add.image(0, currentRelativeY, 'bamboo', 0)
            .setOrigin(0.5, 1)
            .setScale(baseScale)
            .setDepth(baseDepth + numSegments + 2); // Ngọn tre nằm trên cùng
        this.bambooContainer.add(top);
        
        this.updateBambooScale();
    }

    updateBambooScale() {
        if (!this.bambooContainer) return;
        
        // Mốc offset mà tại đó tầng mây 1 sẽ vừa khít màn hình
        // Bạn có thể tăng/giảm số -1200 này (VD: -1000 hoặc -1500) để căn chỉnh cho chuẩn với điện thoại của bạn
        const MAX_SCALE_OFFSET = -1200; 
        
        // Tạo một biến offset riêng cho việc tính Scale. 
        // Dùng Math.max vì giá trị offset đang là số âm (VD: -1300 sẽ bị chặn lại ở -1200)
        let offsetForScale = Math.max(this.cameraOffsetY || 0, MAX_SCALE_OFFSET); 
        
        // Tính toán tiến trình phóng to dựa trên mốc giới hạn mới
        let progress = Math.abs(offsetForScale) / Math.abs(MAX_SCALE_OFFSET);
        
        // Cây tre sẽ ngừng to ra khi progress đạt mức 1 (tức là khi cameraOffsetY chạm mốc -1200)
        // Nếu muốn khi dừng lại cây tre to hơn nữa, bạn có thể tăng số 0.8 lên (VD: 1.0 hoặc 1.2)
        this.bambooContainer.setScale(1 + progress * 0.8);
    }

    updateUIVisibility() {
        if (!this.uiElements) return;
        
        // Mốc để ẩn/hiện. Nếu kéo lên cao hơn -50 thì coi như rời mặt đất -> Ẩn UI
        const isGroundView = this.cameraOffsetY >= -50; 
        
        this.uiElements.forEach(el => {
            el.setVisible(isGroundView); // Ẩn hoặc hiện hình ảnh/chữ
            
            // Nếu là nút có tương tác (dash, jump, joystick), thì bật/tắt luôn tính năng chạm của nó
            if (el.input) {
                el.input.enabled = isGroundView;
            }
        });

        // Đảm bảo an toàn: Nếu người chơi đang kéo joystick mà lại vuốt camera lên trời,
        // UI bị ẩn đi thì phải ép joystick thả ra, reset hướng di chuyển để khủng long dừng lại.
        if (!isGroundView) {
            this.joyDir = 0;
            if (this.joyThumb && this.joyBasePos) {
                this.joyThumb.setPosition(this.joyBasePos.x, this.joyBasePos.y);
            }
        }
    }

    updateStatsUI() {
        // Khóa HP/MP không cho âm
        this.currentHp = Math.max(0, this.currentHp);
        this.currentMp = Math.max(0, this.currentMp);

        // Tính % nước còn lại
        let hpPercent = this.currentHp / this.maxHp;
        let mpPercent = this.currentMp / this.maxMp;

        // Nếu cạn 100% thì trừ đi 14 frame (ảnh life.png có 15 cột, chạy từ 0 đến 14)
        let hpFrameOffset = Math.round((1 - hpPercent) * 14);
        let mpFrameOffset = Math.round((1 - mpPercent) * 14);

        // Hiển thị khung cắt mới
        this.hpOrb.setFrame(60 + hpFrameOffset);
        this.mpOrb.setFrame(75 + mpFrameOffset);

        // Cập nhật lại số liệu hiển thị trên màn hình
        this.hpText.setText(`${this.currentHp}/${this.maxHp}`);
        this.mpText.setText(`${this.currentMp}/${this.maxMp}`);
    }
}
