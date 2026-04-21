export default class BambooSystem extends Phaser.GameObjects.Container {
    constructor(scene, screenWidth, groundLevelY) {
        let bambooX = 110;
        let doiTreLen = 70; 
        let baseBambooY = groundLevelY - doiTreLen; 

        // Khởi tạo Container
        super(scene, bambooX, baseBambooY);
        scene.add.existing(this);

        this.scene = scene; // Lưu lại tham chiếu đến GameScene
        this.danhSachChau = []; // Chứa danh sách các chậu

        // --- MANG HẰNG SỐ VÀO ĐÂY ---
        const BAMBOO_SETTINGS = { soDotTre: 57, chieuCaoMotDot: 100, chau_Scale: 0.1, chau_SpacingX: 100, soChauMoiTang: 5 };
        let baseDepth = 2.8; 
        this.setDepth(baseDepth);

        // 1. TẠO CÁC ĐỐT TRE VÀ MÂY
        for (let i = 0; i < BAMBOO_SETTINGS.soDotTre; i++) {
            let toaDoY = -(i * BAMBOO_SETTINGS.chieuCaoMotDot);
            
            let dotTre = scene.add.image(0, toaDoY, 'bamboo').setOrigin(0.5, 1);
            dotTre.setDepth(baseDepth + i);
            this.add(dotTre);
            
            if (i >= 20 && (i - 20) % 4 === 0 && i <= 54) {
                let cloudX = (screenWidth / 2) - bambooX - 10;
                let cloudY = toaDoY - BAMBOO_SETTINGS.chieuCaoMotDot + 40;

                let cloud = scene.add.image(cloudX, cloudY, 'tangmay').setOrigin(0.5, 0.5);
                cloud.setScale(0.8);
                // Giữ nguyên logic layer: tre xuyên qua mây
                cloud.setDepth(baseDepth + i + 0.5); 
                this.add(cloud);

                let chau_OffsetX = 70;      
                let startChauX = (cloudX + chau_OffsetX) - (BAMBOO_SETTINGS.chau_SpacingX * (BAMBOO_SETTINGS.soChauMoiTang - 1)) / 2;
                let tangIndex = (i - 20) / 4; 

                for (let j = 0; j < BAMBOO_SETTINGS.soChauMoiTang; j++) {
                    let currentChauX = startChauX + (j * BAMBOO_SETTINGS.chau_SpacingX);
                    let chau = scene.add.sprite(currentChauX, cloudY, 'chau', 0);
                    
                    chau.setOrigin(0.5, 1); 
                    chau.setScale(BAMBOO_SETTINGS.chau_Scale);
                    chau.setDepth(baseDepth + i + 0.6);

                    chau.setData('tang', tangIndex);
                    chau.setData('viTri', j);
                    chau.setData('loaiChau', 0); 
                    chau.setData('daTrongCay', false);

                    chau.setInteractive({ useHandCursor: true });
                    chau.on('pointerdown', () => {
                    if (scene.isUIOpen) return; 
                   
                    if (chau.getData('daTrongCay')) {
                    console.log("Chậu này đã trồng cây rồi!");
                    return; 
                    }
    
                    // GỌI HÀM TỪ FARMINGSYSTEM THÔNG QUA GAMESCENE
                    scene.farmingSystem.moTuiHatGiong(chau);
                    });


                    this.add(chau);
                    this.danhSachChau.push(chau);
                }
            }
        }

        // 2. NGỌN TRE VÀ GỐC TRE
        let topY = -(BAMBOO_SETTINGS.soDotTre * BAMBOO_SETTINGS.chieuCaoMotDot);
        this.caoNhatCuaGame = topY - 120; // Lưu thuộc tính này để cấu hình Camera ở GameScene

        let ngontre = scene.add.image(0, topY, 'ngontre').setOrigin(0.5, 1).setDepth(baseDepth + BAMBOO_SETTINGS.soDotTre);
        this.add(ngontre);

        let pandaBase = scene.add.image(0, 10, 'goctre').setOrigin(0.5, 1).setDepth(1000).setScale(0.30);
        this.add(pandaBase);

        this.setScale(0.4);
    }

    // Hiệu ứng phóng to cây tre khi vuốt camera
    update(scrollY) {
        let startY = 0; 
        let endY = -800; 

        let progress = (scrollY - startY) / (endY - startY);
        progress = Phaser.Math.Clamp(progress, 0, 1);
        
        let currentScale = 0.4 + (1.0 - 0.4) * progress;
        this.setScale(currentScale);
    }
}
