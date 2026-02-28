export default class BootScene extends Phaser.Scene {
    constructor() {
        super('BootScene');
    }

    preload() {
        let loadingText = this.add.text(this.cameras.main.centerX, this.cameras.main.centerY, 'Đang tải...', {
            fontSize: '32px',
            fill: '#ffffff'
        }).setOrigin(0.5);

        // Tải ảnh bầu trời và mặt đất
        this.load.image('Sky', 'assets/images/canh.png');
        this.load.image('ground', 'assets/images/nen.png');
        // Tải ảnh tầng mây
        this.load.image('tangmay', 'assets/images/tangmay.png');
        // Tải ảnh gốc tre (gấu trúc)
        this.load.image('goctre', 'assets/images/goctre.png');
        // Tải ảnh cái ao
        this.load.image('ao', 'assets/images/ao.png');
        // Tải ảnh ngôi nhà
        this.load.image('nha', 'assets/images/nha.png');
        // Tải ảnh cầu cá tra
        this.load.image('caucatra', 'assets/images/caucatra.png');
        // Tải ảnh mây trắng
        this.load.spritesheet('maytrang', 'assets/images/maytrang.png', { 
            frameWidth: 728,  
            frameHeight: 720 
        });
        // Tải ảnh mây đen
        this.load.spritesheet('mayden', 'assets/images/mayden.png', { 
            frameWidth: 736,
            frameHeight: 720
        });
        // Tải spritesheet Hạt Mây (Lưu ý: Chỉnh frameWidth/frameHeight theo đúng 1/2 kích thước thật của ảnh)
        this.load.spritesheet('hatmay', 'assets/images/hatmay.png', {
            frameWidth: 2048,  // Kích thước chiều rộng 1 hạt
            frameHeight: 2048  // Kích thước chiều cao 1 hạt
        });
        // Tải ảnh cá trê
        this.load.spritesheet('catre', 'assets/images/catre.png', {
            frameWidth: 2048, 
            frameHeight: 2048 
       });
        // Tải ảnh cá vồ
        this.load.spritesheet('cavo', 'assets/images/cavo.png', {
            frameWidth: 2048, 
            frameHeight: 2048
        });
        // Tải ảnh cá tai tượng
        this.load.spritesheet('cataituong', 'assets/images/cataituong.png', {
            frameWidth: 2048, 
            frameHeight: 2048 
        });
    }

    create() {
        // --- VẼ THÂN TRE ---
        let graphics = this.make.graphics({x: 0, y: 0, add: false});

        graphics.fillStyle(0x4caf50, 1); 
        graphics.fillRect(5, 10, 60, 80); 

        graphics.fillStyle(0x8bc34a, 1);
        graphics.fillRoundedRect(0, 0, 70, 15, 5); 

        graphics.fillStyle(0x388e3c, 1);
        graphics.fillRoundedRect(0, 85, 70, 15, 5);

        graphics.fillStyle(0x81c784, 0.5);
        graphics.fillRect(20, 15, 5, 70);

        graphics.generateTexture('bamboo', 70, 100);

        // --- VẼ NGỌN TRE VÀ LÁ TỰ ĐỘNG ---
        let graphicsTip = this.make.graphics({x: 0, y: 0, add: false});

        // 1. Thân ngọn (vuốt nhọn lên trên)
        graphicsTip.fillStyle(0x4caf50, 1);
        graphicsTip.beginPath();
        graphicsTip.moveTo(50, 120);  // Đáy trái
        graphicsTip.lineTo(100, 120); // Đáy phải
        graphicsTip.lineTo(75, 20);   // Đỉnh nhọn
        graphicsTip.closePath();
        graphicsTip.fillPath();

        // 2. Lá tre (màu xanh sáng hơn, chỉa ra các hướng)
        graphicsTip.fillStyle(0x8bc34a, 1);

        // Lá 1 (Trái, dưới)
        graphicsTip.beginPath();
        graphicsTip.moveTo(60, 90);  
        graphicsTip.lineTo(10, 70);  // Mũi lá
        graphicsTip.lineTo(50, 100); 
        graphicsTip.closePath();
        graphicsTip.fillPath();

        // Lá 2 (Phải, dưới)
        graphicsTip.beginPath();
        graphicsTip.moveTo(90, 80);
        graphicsTip.lineTo(140, 50); // Mũi lá
        graphicsTip.lineTo(100, 90);
        graphicsTip.closePath();
        graphicsTip.fillPath();

        // Lá 3 (Trái, trên)
        graphicsTip.beginPath();
        graphicsTip.moveTo(65, 50);
        graphicsTip.lineTo(20, 20);  // Mũi lá
        graphicsTip.lineTo(55, 60);
        graphicsTip.closePath();
        graphicsTip.fillPath();

        // Lá 4 (Phải, đỉnh)
        graphicsTip.beginPath();
        graphicsTip.moveTo(80, 40);
        graphicsTip.lineTo(130, 10); // Mũi lá
        graphicsTip.lineTo(85, 50);
        graphicsTip.closePath();
        graphicsTip.fillPath();

        // Đóng gói thành Texture 'ngontre' (Rộng 150, Cao 120 để chứa đủ lá)
        graphicsTip.generateTexture('ngontre', 150, 120);

        // Chuyển sang cảnh chơi chính
        this.scene.start('GameScene');
    }
}
