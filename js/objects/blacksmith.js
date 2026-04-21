export default class Blacksmith extends Phaser.GameObjects.Container {
    constructor(scene, screenWidth, screenHeight) {
        // Tọa độ gốc (giữa màn hình lệch trái 240px, gần đáy)
        const x = screenWidth / 2 - 240;
        const y = screenHeight - 160;

        // Khởi tạo Container (Trừ đi khoảng lệch ban đầu của code cũ)
        super(scene, x - 50, y - 380);
        scene.add.existing(this);

        const depthThoRen = 2000; // Mang từ DEPTHS.THO_REN
        this.setDepth(depthThoRen);
        this.setScale(0.5);

        // Gọi các hàm tạo hình
        this.buildStickman(scene);
        this.buildAnvil(scene);
    }

    buildStickman(scene) {
        const mauStickman = 0x222222;

        let bua = scene.add.image(5, 25, 'buachaos').setScale(0.2).setAngle(-45);
        let than = scene.add.rectangle(0, 0, 8, 60, mauStickman).setOrigin(0.5, 0);
        let dau = scene.add.ellipse(0, -15, 30, 30, mauStickman);
        
        let tayPhai = scene.add.rectangle(0, 5, 6, 45, mauStickman).setOrigin(0.5, 0).setAngle(-30);
        let tayTrai = scene.add.rectangle(0, 5, 6, 45, mauStickman).setOrigin(0.5, 0).setAngle(30);
        
        let chanPhai = scene.add.rectangle(0, 55, 7, 50, mauStickman).setOrigin(0.5, 0).setAngle(-15);
        let chanTrai = scene.add.rectangle(0, 55, 7, 50, mauStickman).setOrigin(0.5, 0).setAngle(15);

        // Thêm các bộ phận vào chính Container này (this)
        this.add([bua, tayTrai, chanTrai, than, dau, chanPhai, tayPhai]);

        // Hiệu ứng nhịp thở
        scene.tweens.add({
            targets: [than, dau, tayTrai, tayPhai, bua],
            y: "+=3", 
            duration: 1200, 
            yoyo: true, 
            repeat: -1, 
            ease: 'Sine.easeInOut' 
        });
    }

    buildAnvil(scene) {
        let lechTraiPhai = 0;  
        let lechLenXuong = 50; 
        let tiLeToNho = 0.05;     

        // Tạo cái đe dựa trên tọa độ của container
        let caiDe = scene.add.image(this.x + lechTraiPhai, this.y + lechLenXuong, 'caide');
        caiDe.setScale(tiLeToNho);
        caiDe.setDepth(2005); // Mang từ DEPTHS.CAI_DE
        caiDe.setInteractive();

        caiDe.on('pointerdown', () => {
            scene.tweens.add({
                targets: caiDe,
                scaleY: tiLeToNho * 0.9, 
                y: "+=5",      
                duration: 100,
                yoyo: true,
                ease: 'Power1'
            });
            console.log("Mở lò rèn: Chức năng rèn chậu khi click vào cái đe!");
        });
    }
}
