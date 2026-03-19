class GameScene extends Phaser.Scene {
    constructor() {
        super('GameScene');
    }

    create() {
        this.isGameOver = false;
        this.score = 0;
        this.gameSpeed = 6;
        const groundY = 250; // Vị trí mặt đất

        // 1. Vẽ mặt đất (Đường thẳng cổ điển)
        this.ground = this.add.graphics();
        this.ground.lineStyle(2, 0x535353, 1);
        this.ground.beginPath();
        this.ground.moveTo(0, groundY);
        this.ground.lineTo(this.scale.width, groundY);
        this.ground.strokePath();

        // Tạo body vật lý tàng hình làm mặt đất để khủng long đứng lên
        this.groundPhysics = this.physics.add.staticGroup();
        this.groundPhysics.create(400, groundY + 10, 'cactus').setScale(20, 0.5).refreshBody().setVisible(false);

        // 2. Tạo Khủng long
        this.dino = this.physics.add.sprite(100, groundY - 50, 'dino');
        this.dino.setCollideWorldBounds(true);

        // Tạo hiệu ứng chuyển động (Animation) dựa theo spritesheet
        // Hình đứng yên: vị trí số 0 (trên cùng bên trái)
        this.anims.create({
            key: 'idle',
            frames: [{ key: 'dino', frame: 0 }],
            frameRate: 10
        });
        
        // Hình đang chạy: vị trí số 2 và 3 (2 hình ở hàng dưới)
        this.anims.create({
            key: 'run',
            frames: this.anims.generateFrameNumbers('dino', { frames: [2, 3] }),
            frameRate: 10,
            repeat: -1
        });

        this.dino.play('run');

        // Bật va chạm giữa khủng long và mặt đất
        this.physics.add.collider(this.dino, this.groundPhysics);

        // 3. Tạo nhóm Xương rồng
        this.obstacles = this.physics.add.group();

        // 4. Lắng nghe thao tác người dùng (Space trên PC, Chạm trên Mobile)
        this.input.keyboard.on('keydown-SPACE', this.jump, this);
        this.input.on('pointerdown', this.jump, this); 

        // 5. Hiển thị điểm số
        this.scoreText = this.add.text(16, 16, 'Score: 0', { fontSize: '20px', fill: '#535353', fontFamily: 'monospace' });

        // 6. Tự động tạo xương rồng mỗi 1.5 giây
        this.time.addEvent({
            delay: 1500,
            callback: this.spawnObstacle,
            callbackScope: this,
            loop: true
        });

        // 7. Cài đặt va chạm: Nếu khủng long chạm xương rồng -> gọi hàm hitObstacle
        this.physics.add.overlap(this.dino, this.obstacles, this.hitObstacle, null, this);
    }

    jump() {
        // Chỉ cho phép nhảy nếu khủng long đang chạm đất và game chưa kết thúc
        if (this.dino.body.touching.down && !this.isGameOver) {
            this.dino.setVelocityY(-650);
            this.dino.play('idle'); // Tạm dùng ảnh đứng yên khi đang trên không
        } else if (this.isGameOver) {
            this.scene.restart(); // Chạm để chơi lại nếu đã chết
        }
    }

    spawnObstacle() {
        if (this.isGameOver) return;

        // Đặt xương rồng bên mép phải màn hình
        const cactus = this.obstacles.create(this.scale.width + 50, 250, 'cactus');
        cactus.setOrigin(0.5, 1); // Căn tâm hình ở dưới cùng
        cactus.body.allowGravity = false;
        cactus.setVelocityX(-this.gameSpeed * 60); // Di chuyển về bên trái
        cactus.setImmovable(true);
    }

    hitObstacle() {
        this.isGameOver = true;
        this.physics.pause(); // Dừng mọi chuyển động vật lý
        this.dino.play('idle');
        this.dino.setTint(0xff0000); // Nhuộm đỏ con khủng long

        this.add.text(this.scale.width / 2, this.scale.height / 2, 'GAME OVER\nChạm để chơi lại', {
            fontSize: '32px',
            fill: '#535353',
            fontFamily: 'monospace',
            align: 'center'
        }).setOrigin(0.5);
    }

    update() {
        if (this.isGameOver) return;

        // Cập nhật điểm số
        this.score += 0.1;
        this.scoreText.setText('Score: ' + Math.floor(this.score));

        // Nếu chạm đất thì chạy tiếp animation chạy
        if (this.dino.body.touching.down && this.dino.anims.currentAnim.key !== 'run') {
            this.dino.play('run');
        }

        // Xóa xương rồng khi đã trôi ra khỏi màn hình bên trái để tối ưu bộ nhớ
        this.obstacles.getChildren().forEach(obstacle => {
            if (obstacle.x < -50) {
                obstacle.destroy();
            }
        });
    }
}
