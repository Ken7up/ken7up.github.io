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
        
        // --- 1. KHỞI TẠO BẢN ĐỒ CỐ ĐỊNH ---
        const MAP_WIDTH = 3000; // Chiều dài cố định của map (bà có thể tùy chỉnh)
        this.MAP_WIDTH = MAP_WIDTH; // THÊM DÒNG NÀY ĐỂ LƯU LẠI
        const groundY = this.scale.height - 300;
        this.groundY = groundY; 

        // Đặt giới hạn vật lý và giới hạn camera bằng với chiều dài của map
        this.physics.world.setBounds(0, 0, MAP_WIDTH, this.scale.height);
        this.cameras.main.setBounds(0, 0, MAP_WIDTH, this.scale.height);
        
        this.clouds = this.add.group();
        this.mountains = this.add.group();
        this.groundDetails = this.add.group();
        this.obstacles = this.physics.add.group();

        // Nền đất chính (Đã xóa + 10)
        this.groundPhysics = this.add.rectangle(0, groundY, MAP_WIDTH, 50, 0x000000, 0).setOrigin(0, 0);

        this.physics.add.existing(this.groundPhysics, true); 

        // --- 2. TẠO SẴN TOÀN BỘ MÔI TRƯỜNG CHO MAP CỐ ĐỊNH ---
        // Sinh toàn bộ chi tiết đất
        this.spawnDirtChunk(0, MAP_WIDTH);
        // Sinh toàn bộ mây và núi
        this.spawnEnvironment(MAP_WIDTH);
        
        // TẠM ẨN XƯƠNG RỒNG (MAP FARM)
        // Comment dòng dưới đây lại để xương rồng không xuất hiện.
        // Sau này làm map khác cần xương rồng, bạn chỉ việc bỏ dấu // đi.
        // this.spawnInitialObstacles(MAP_WIDTH);

        // --- 3. KHỦNG LONG ---
        this.dino = this.physics.add.sprite(100, groundY - 100, 'dino');
        this.dino.setScale(2); 
        this.dino.setCollideWorldBounds(true); // Ngăn nhân vật đi ra khỏi MAP_WIDTH
        
        this.dino.body.setSize(22, 22); 
        this.dino.body.setOffset(5, 5); 
        this.dino.setDepth(10);

        this.anims.create({ key: 'idle', frames: [{ key: 'dino', frame: 0 }], frameRate: 10 });
        this.anims.create({ key: 'dead', frames: [{ key: 'dino', frame: 1 }], frameRate: 10 });
        this.anims.create({ key: 'run', frames: this.anims.generateFrameNumbers('dino', { frames: [2, 3] }), frameRate: 10, repeat: -1 });
        this.anims.create({ key: 'dash_anim', frames: this.anims.generateFrameNumbers('dino', { frames: [4, 5] }), frameRate: 15, repeat: -1 });

        this.dino.play('idle'); 
        this.physics.add.collider(this.dino, this.groundPhysics);

        // --- 4. CAMERA BÁM THEO CHUẨN RPG ---
        this.cameras.main.startFollow(this.dino, true, 0.1, 0.1);
        // Đặt offset X về 0 để nhân vật luôn ở chính giữa, thuận tiện đi lại 2 chiều
        this.cameras.main.setFollowOffset(0, 0); 

        this.createControls();

        this.input.keyboard.on('keydown-SPACE', this.jump, this);
        this.input.keyboard.on('keydown-SHIFT', this.dash, this);

        this.physics.add.overlap(this.dino, this.obstacles, this.hitObstacle, null, this);
    }

    // --- HÀM TẠO SẴN MÂY VÀ NÚI ---
    spawnEnvironment(mapWidth) {
        // 1. RẢI NÚI CỐ ĐỊNH
        // Đã giảm số lượng xuống còn 3 ngọn núi.
        // Bổ sung thêm thuộc tính 'yOffset' để kéo núi xích xuống dưới nền đất.
        const fixedMountains = [
            { x: 180,  scale: 10, yOffset: 100 }, // Núi 1: To, gần đầu map, kéo xuống 40px
            { x: 600, scale: 2, yOffset: -50 }, // Núi 2: Rất to, ở giữa map, kéo xuống 60px
            { x: 1100, scale: 5, yOffset: 20 }  // Núi 3: Nằm gần cuối map, cách mép 3000 một khoảng an toàn
        ];

        fixedMountains.forEach(mountain => {
            this.add.image(mountain.x, this.groundY + mountain.yOffset, 'mountain')
                // Đổi Origin từ (0, 1) thành (0.5, 1).
                // Gốc tọa độ X nằm ở giữa ảnh giúp núi nở đều ra 2 bên khi phóng to (scale), 
                // tránh việc ngọn núi cuối cùng bị tràn và khuất ra khỏi map (width 3000).
                .setOrigin(0.5, 1) 
                .setScrollFactor(0.3) 
                .setScale(mountain.scale)
                .setDepth(-1);
        });
        
        // 2. RẢI MÂY NGẪU NHIÊN
        for (let x = 0; x < mapWidth; x += Phaser.Math.Between(200, 400)) {
            let cloudY = Phaser.Math.Between(20, 150);
            
            // Gán vào biến cloud thay vì add trực tiếp
            let cloud = this.add.image(x, cloudY, 'cloud')
                .setOrigin(0, 0)
                .setScrollFactor(0.1)
                .setScale(Phaser.Math.FloatBetween(3, 5))
                .setDepth(-2);
                
            this.clouds.add(cloud); // THÊM DÒNG NÀY: Cho mây vào group
        }
    }

    // --- HÀM TẠO SẴN CHƯỚNG NGẠI VẬT ---
    spawnInitialObstacles(mapWidth) {
        let currentX = 400; // Bắt đầu sinh xương rồng từ vị trí X = 400
        while (currentX < mapWidth - 400) { // Không sinh quá sát mép phải của map
            this.spawnCactusCluster(currentX);
            currentX += Phaser.Math.Between(600, 1000); // Khoảng cách giữa các cụm
        }
    }

    // Giữ nguyên các hàm cơ bản cũ
    spawnDirtChunk(startX, endX) {
        for (let x = startX; x < endX; x += Phaser.Math.Between(15, 35)) {
            if (Phaser.Math.Between(0, 100) < 50) { 
                const isDot = Phaser.Math.Between(0, 1) === 0;
                const width = isDot ? Phaser.Math.Between(2, 4) : Phaser.Math.Between(6, 15);
                const height = 2; 
                const offsetY = Phaser.Math.Between(6, 30); 

                const dirt = this.add.rectangle(x, this.groundY + offsetY, width, height, 0x535353).setOrigin(0, 0);
                this.groundDetails.add(dirt);
            }
        }

        // Tạo một đường thẳng duy nhất xuyên suốt map
        this.groundDetails.add(this.add.rectangle(startX, this.groundY, endX - startX, 2, 0x535353).setOrigin(0, 0));
    }

    createControls() {
        const joyX = 130;
        const joyY = this.scale.height - 100;
        const joyRadius = 70; 
        
        this.add.circle(joyX, joyY, joyRadius, 0x888888, 0.3).setScrollFactor(0);
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
            // file âm thanh jump:
            this.sound.play('sound_jump'); 
        }
    }

    dash() {
        if (this.isGameOver || this.isDashing) return;
        
        this.isDashing = true;
        this.dino.play('dash_anim');
        // file âm thanh dash:
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

    hitObstacle() {
        this.isGameOver = true;
        this.physics.pause();
        this.dino.play('dead');

        this.add.text(this.cameras.main.scrollX + this.scale.width / 2, this.scale.height / 2 - 150, 'GAME OVER\nChạm màn hình để chơi lại', {
            fontSize: '32px',
            fill: '#535353',
            fontFamily: 'monospace',
            align: 'center'
        }).setOrigin(0.5).setDepth(30); 
    }

    update() {
        if (this.isGameOver) return;

        // --- BẮT ĐẦU PHẦN THÊM MỚI: Xử lý mây tự động trôi ---
        this.clouds.getChildren().forEach(cloud => {
            cloud.x -= 0.3; // Tốc độ trôi (bạn có thể thay đổi số này)
            
            // Nếu mây bay khuất hẳn màn hình bên trái, đưa nó vòng lại phía đuôi map bên phải
            if (cloud.x < -200) {
                cloud.x = this.MAP_WIDTH + 100;
            }
        });

        // --- HÀM UPDATE ĐÃ ĐƯỢC DỌN DẸP SẠCH SẼ ---
        // Không còn các hàm tự động sinh map hay hủy vật thể (destroy) nữa.
        // Map bây giờ cố định 100%.

        const isGrounded = this.dino.body.touching.down;
        if (isGrounded && !this.wasGrounded) {
             // file âm thanh tiếp đất:
              this.sound.play('sound_jumpland');
        }
        this.wasGrounded = isGrounded;

        // Xử lý di chuyển
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

        // Xử lý hướng mặt của nhân vật (lật trái/phải)
        if (!this.isDashing) {
            if (this.joyDir < -0.1) {
                this.dino.setFlipX(true); 
            } else if (this.joyDir > 0.1) {
                this.dino.setFlipX(false); 
            }
        }
    }
}
