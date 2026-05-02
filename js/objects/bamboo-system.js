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
        const BAMBOO_SETTINGS = { soDotTre: 57, chieuCaoMotDot: 100, chau_Scale: 0.11, chau_SpacingX: 100, soChauMoiTang: 5 };
        let baseDepth = 2.8; 
        this.setDepth(baseDepth);

        // --- Teru Bozu ---
        
        // 1. Tạo "giỏ" trống để chứa các con búp bê
        this.danhSachTeru = []; 

        // 2. Tạo hiệu ứng chuyển động có tên là 'teru_quay'
        // Lệnh if giúp kiểm tra: nếu game chưa có hiệu ứng này thì mới tạo, tránh lỗi tạo trùng.
        if (!scene.anims.exists('teru_quay')) {
            scene.anims.create({
                key: 'teru_quay',
                frames: scene.anims.generateFrameNumbers('terubozu', { start: 0, end: 3 }), // Dùng ảnh số 0, 1, 2, 3
                frameRate: 1, // 1 giây chiếu 6 ảnh (bạn có thể tăng số này lên nếu muốn búp bê lắc nhanh hơn)
                repeat: -1    // Số -1 nghĩa là lặp lại vô tận
            });
        }

        // --- BỤI TRE ---
        
        // Bụi tre trang trí bên trái (Bụi nhỏ hơn, bị lật ngược)
        this.buiTreTrai = scene.add.image(-50, 15, 'buitre').setOrigin(0.5, 1);
        this.buiTreTrai.setDepth(baseDepth - 1.5); 
        this.buiTreTrai.setScale(0.6); 
        this.buiTreTrai.setFlipX(true); 
        this.add(this.buiTreTrai);

        // Bụi tre trang trí bên phải (Bụi lớn hơn)
        this.buiTrePhai = scene.add.image(60, 10, 'buitre').setOrigin(0.5, 1);
        this.buiTrePhai.setDepth(baseDepth - 1); 
        this.buiTrePhai.setScale(0.8); 
        this.add(this.buiTrePhai);

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

                let cloud = scene.add.image(cloudX, cloudY, 'tangmay').setOrigin(0.5, 0.5);
                cloud.setScale(0.8);
                cloud.setDepth(baseDepth + i + 0.5); 
                this.add(cloud);

                // 2. TÍNH TOÁN VỊ TRÍ X BẮT ĐẦU CỦA DÀN CHẬU
                let chau_OffsetX = 70;      
                let startChauX = (cloudX + chau_OffsetX) - (BAMBOO_SETTINGS.chau_SpacingX * (BAMBOO_SETTINGS.soChauMoiTang - 1)) / 2;
                let tangIndex = (i - 20) / 4; 

                // 3. VÒNG LẶP TẠO 5 CHẬU VÀ 5 BÚP BÊ
                for (let j = 0; j < BAMBOO_SETTINGS.soChauMoiTang; j++) {
                    // Tọa độ X chung cho cả chậu và búp bê tại vị trí j
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

                        // Nếu chậu đang có cây đã chín (Sẵn sàng thu hoạch)
                        if (chau.getData('sanSangThuHoach')) {
                            let tang = chau.getData('tang');
                            // Tìm xem tầng này có con Pet nào không
                            let pet = scene.danhSachPet && scene.danhSachPet.find(p => p.getData('tang') === tang);
                            if (pet) {
                                scene.farmingSystem.hienThiNutAuto(chau, pet);
                            }
                            return; // Ngăn lệnh phía dưới
                        }

                        if (chau.getData('daTrongCay')) {
                            console.log("Chậu này đã trồng cây rồi!");
                            return; 
                        }
                        scene.farmingSystem.moTuiHatGiong(chau);
                    });

                    this.add(chau);
                    this.danhSachChau.push(chau);

                    // --- TẠO TERU BOZU ---
                    // Tâm mây là cloudY. Búp bê treo xuống một chút (cộng 15 pixel).
                    // Nếu muốn búp bê xích lên nữa, đổi 15 thành 10 hoặc 5.
                    let teruY = cloudY + 10; 

                    let teru = scene.add.sprite(currentChauX, teruY, 'terubozu', 0);
                    teru.setOrigin(0.5, 0); 
                    teru.setScale(1.5); 
                    teru.setDepth(cloud.depth - 0.1); 
                    teru.play('teru_quay');

                    this.add(teru);
                    this.danhSachTeru.push(teru); // Đưa vào mảng để hàm update() xử lý phóng to/thu nhỏ
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
        
        // Scale hiện tại của cả cụm tre
        let currentScale = 0.4 + (1.0 - 0.4) * progress;
        this.setScale(currentScale);

        // ĐẢM BẢO BỤI TRE KHÔNG PHÓNG TO VÀ KHÔNG BỊ DI CHUYỂN
        if (this.buiTreTrai && this.buiTrePhai) {
            // 1. Giữ nguyên kích thước
            this.buiTreTrai.setScale(0.24 / currentScale); // Bụi bên trái (Scale gốc 0.6)
            this.buiTrePhai.setScale(0.32 / currentScale); // Bụi bên phải (Scale gốc 0.8)

            // 2. Giữ nguyên vị trí tuyệt đối (chống trượt ra 2 bên)
            // Bụi tre trái
            this.buiTreTrai.x = - 30 / currentScale;
            this.buiTreTrai.y = 6 / currentScale;

            // Bụi tre phải
            this.buiTrePhai.x = 35 / currentScale;
            this.buiTrePhai.y = 20 / currentScale;
        }
    }
}
