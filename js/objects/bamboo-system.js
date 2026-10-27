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
        const BAMBOO_SETTINGS = { soDotTre: 57, chieuCaoMotDot: 100, chau_Scale: 0.85, chau_SpacingX: 100, soChauMoiTang: 5 };
        let baseDepth = 2.8; 
        this.setDepth(baseDepth);

        // --- Teru Bozu ---
        
        // 1. Tạo "giỏ" trống để chứa các con búp bê
        this.danhSachTeru = []; 

        // 2. Tạo hiệu ứng chuyển động có tên là 'teru_quay'
        if (!scene.anims.exists('teru_quay')) {
            scene.anims.create({
                key: 'teru_quay',
                frames: scene.anims.generateFrameNumbers('terubozu', { start: 0, end: 3 }), // Dùng ảnh số 0, 1, 2, 3
                frameRate: 1, // 1 giây chiếu 6 ảnh
                repeat: -1    // Số -1 nghĩa là lặp lại vô tận
            });
        }

        // --- BỤI TRE (ĐÃ CHỈNH TO LÊN) ---
        
        // Bụi tre trang trí bên trái (Đã lật ngược)
        // Cũ: x=-50, y=15, scale=0.6
        // Mới: Tăng scale lên 1.0, điều chỉnh lại x, y để gốc vẫn nằm gần vị trí cũ
        this.buiTreTrai = scene.add.image(-70, 25, 'buitre').setOrigin(0.5, 1);
        this.buiTreTrai.setDepth(baseDepth - 0.1); // Sửa lỗi cú pháp danhDepth 8 ban đầu
        this.buiTreTrai.setScale(1.0); // <-- TĂNG SCALE Ở ĐÂY (Cũ 0.6)
        this.buiTreTrai.setFlipX(true); 
        this.add(this.buiTreTrai);

        // Bụi tre trang trí bên phải
        // Cũ: x=60, y=10, scale=0.8
        // Mới: Tăng scale lên 1.3, điều chỉnh lại x, y
        this.buiTrePhai = scene.add.image(80, 20, 'buitre').setOrigin(0.5, 1);
        this.buiTrePhai.setDepth(baseDepth - 0.1); 
        this.buiTrePhai.setScale(1.3); // <-- TĂNG SCALE Ở ĐÂY (Cũ 0.8)
        this.add(this.buiTrePhai);

        // --- Giữ nguyên logic khởi tạo các phần khác ---
        // 1. TẠO CÁC ĐỐT TRE VÀ MÂY
        for (let i = 0; i < BAMBOO_SETTINGS.soDotTre; i++) {
            let toaDoY = -(i * BAMBOO_SETTINGS.chieuCaoMotDot);
            
            let dotTre = scene.add.image(0, toaDoY, 'bamboo').setOrigin(0.5, 1);
            dotTre.setDepth(baseDepth + i);
            this.add(dotTre);
            
            if (i >= 20 && (i - 20) % 4 === 0 && i <= 54) {
                // 1. TẠO MÂY
                let cloudX = (screenWidth / 2) - bambooX - 10;
                let cloudY = toaDoY - BAMBOO_SETTINGS.chieuCaoMotDot + 40;

                let cloud = scene.add.image(cloudX, cloudY, 'tangmay').setOrigin(0.49, 0.6);
                cloud.setScale(0.83);
                cloud.setDepth(baseDepth + i + 0.5); 
                this.add(cloud);

                // 2. TÍNH TOÁN VỊ TRÍ X BẮT ĐẦU CỦA DÀN CHẬU
                let chau_OffsetX = 70;      
                let startChauX = (cloudX + chau_OffsetX) - (BAMBOO_SETTINGS.chau_SpacingX * (BAMBOO_SETTINGS.soChauMoiTang - 1)) / 2;
                let tangIndex = (i - 20) / 4; 

                // 3. VÒNG LẶP TẠO 5 CHẬU VÀ 5 BÚP BÊ
                for (let j = 0; j < BAMBOO_SETTINGS.soChauMoiTang; j++) {
                    let currentChauX = startChauX + (j * BAMBOO_SETTINGS.chau_SpacingX);
                    
                    // --- TẠO CHẬU ---
                    let chau = scene.add.sprite(currentChauX, cloudY, 'chau', 0);
                    chau.setOrigin(0.5, 0.98); 
                    chau.setScale(BAMBOO_SETTINGS.chau_Scale);
                    chau.setDepth(baseDepth + i + 0.6);

                    chau.setData('tang', tangIndex);
                    chau.setData('viTri', j);
                    chau.setData('loaiChau', 0); 
                    chau.setData('daTrongCay', false);

                    chau.setInteractive({ useHandCursor: true });
                    chau.on('pointerdown', () => {
                        if (scene.isUIOpen) return; 
                        if (chau.getData('sanSangThuHoach')) {
                            let tang = chau.getData('tang');
                            let pet = scene.danhSachPet && scene.danhSachPet.find(p => p.getData('tang') === tang);
                            if (pet) {
                                scene.farmingSystem.hienThiNutAuto(chau, pet);
                            }
                            return;
                        }
                        if (chau.getData('daTrongCay')) {
                            return; 
                        }
                        scene.farmingSystem.moTuiHatGiong(chau);
                    });

                    this.add(chau);
                    this.danhSachChau.push(chau);

                    // --- TẠO TERU BOZU ---
                    let teruY = cloudY + 10; 

                    let teru = scene.add.sprite(currentChauX, teruY, 'terubozu', 0);
                    teru.setOrigin(0.5, 0); 
                    teru.setScale(1.5); 
                    teru.setDepth(cloud.depth - 0.1); 
                    teru.play('teru_quay');

                    this.add(teru);
                    this.danhSachTeru.push(teru); 
                }
            }
        }

        // 2. NGỌN TRE VÀ GỐC TRE
        let topY = -(BAMBOO_SETTINGS.soDotTre * BAMBOO_SETTINGS.chieuCaoMotDot);
        this.caoNhatCuaGame = topY - 120; 

        let ngontre = scene.add.image(0, topY, 'ngontre').setOrigin(0.5, 1).setDepth(baseDepth + BAMBOO_SETTINGS.soDotTre);
        this.add(ngontre);

        let pandaBase = scene.add.image(0, 10, 'goctre').setOrigin(0.5, 0.8).setDepth(1000).setScale(1.5);
        this.add(pandaBase);

        this.setScale(0.4);
    }

    // Hiệu ứng phóng to cây tre khi vuốt camera
    update(scrollY) {
        let startY = 0; 
        let endY = -800; 

        let progress = (scrollY - startY) / (endY - startY);
        progress = Phaser.Math.Clamp(progress, 0, 1);
        
        // Scale hiện tại của cả cụm tre
        let currentScale = 0.4 + (1.0 - 0.4) * progress;
        this.setScale(currentScale);

        // --- ĐÃ CẬP NHẬT ĐỂ PHÙ HỢP VỚI BỤI TRE TO HƠN ---
        // ĐẢM BẢO BỤI TRE KHÔNG PHÓNG TO THEO CONTAINER VÀ KHÔNG BỊ DI CHUYỂN
        if (this.buiTreTrai && this.buiTrePhai) {
            // 1. Giữ nguyên kích thước thực (bằng cách chia cho scale của cha)
            // Số tử số (ví dụ 0.4, 0.52) là kích thước visual mong muốn khi Container scale = 1
            this.buiTreTrai.setScale(0.8 / currentScale); // Bụi bên trái (Scale gốc mong muốn ~1.0 ở base)
            this.buiTrePhai.setScale(1 / currentScale); // Bụi bên phải (Scale gốc mong muốn ~1.3 ở base)

            // 2. Giữ nguyên vị trí tuyệt đối (chống trượt ra 2 bên)
            // Bụi tre trái (Cũ: x=-30, y=6)
            this.buiTreTrai.x = -30 / currentScale;
            this.buiTreTrai.y = 15 / currentScale;

            // Bụi tre phải (Cũ: x=35, y=20)
            this.buiTrePhai.x = 30 / currentScale;
            this.buiTrePhai.y = 15 / currentScale;
        }
    }
}
