export default class GameScene extends Phaser.Scene {
    constructor() {
        super('GameScene');
    }

    create() {
        this.isUIOpen = false;
        const width = this.scale.width;
        const height = this.scale.height;

        // --- CHỈNH BẦU TRỜI ---
        let skyOffsetY = 0; 
        let sky = this.add.image(0, skyOffsetY, 'Sky').setOrigin(0, 0).setDepth(0); 
        sky.setDisplaySize(width, height + Math.abs(skyOffsetY));
        sky.setScrollFactor(0); 

        // --- CHỈNH MẶT ĐẤT ---
        let groundOffsetY = 0; 
        let ground = this.add.image(0, height + groundOffsetY, 'ground').setOrigin(0, 1).setDepth(1);
        const scaleRatio = width / ground.width;
        ground.setScale(scaleRatio);

        // ---> CHIẾC AO <---
        let groundLevelY = height + groundOffsetY - 460;
        let pondX = 500;
        let pondY = groundLevelY + -30;
        
        // 2. Hiển thị ảnh ra màn hình:
        let pond = this.add.image(pondX, pondY, 'ao');
        
        // 3. Căn chỉnh tâm và lớp hiển thị:
        pond.setOrigin(0.5, 0.5);
        pond.setDepth(2);
        
        // 4. Chỉnh kích thước (To/Nhỏ):
        pond.setScale(1.2);

        // =====================================
        // CẦU CÁ TRA (Đã bật Vật lý để va chạm)
        // =====================================
        let cauCaTraX = pondX + -90;
        let cauCaTraY = pondY + 55;

        let cauCaTra = this.physics.add.image(cauCaTraX, cauCaTraY, 'caucatra');
        cauCaTra.setOrigin(0.5, 1); 
        cauCaTra.setDepth(3); // Cầu nằm đè lên cá (cá là 2.5)
        cauCaTra.setScale(0.15);
        cauCaTra.setImmovable(true); 

        // TẠO HITBOX CHO CHÂN CẦU:
        // SetSize: Chiều ngang vùng va chạm = 50% ảnh, Chiều cao = 15% ảnh (chỉ lấy phần chân)
        // SetOffset: Đẩy vùng va chạm dời sang phải 25% (để ra giữa) và đẩy xuống tận cùng đáy (85%)
        cauCaTra.body.setSize(cauCaTra.width * 0.65, cauCaTra.height * 0.10);
        cauCaTra.body.setOffset(cauCaTra.width * 0, cauCaTra.height * 0.95);
        // TẠO THÊM 1 KHUNG CHỮ NHẬT LÀM VA CHẠM CHO THANH CẦU XÉO
        // ---------------------------------------------------------
        
        // 1. Xác định vị trí (X, Y) của khung: Dịch sang trái và nhấc lên cao một chút so với chân cầu
        let thanhCauX = cauCaTraX + 40; 
        let thanhCauY = cauCaTraY - 15; 
        
        // 2. Tạo hình chữ nhật vô hình (Đã tăng chiều dài)
        // Thay đổi số 80 (chiều dài) và 15 (độ dày) cho đến khi vừa ý
        let chieuDaiThanhCau = 45; // <-- Tăng số này để làm ô va chạm dài ra
        let doDayThanhCau = 10;    // <-- Tăng số này nếu muốn thanh này dày hơn một chút

        let thanhCauHitbox = this.add.rectangle(thanhCauX, thanhCauY, chieuDaiThanhCau, doDayThanhCau, 0x000000, 0);

        
        // 3. Bật vật lý cho nó và chốt chặt nó lại (setImmovable) để cá không húc bay nó đi
        this.physics.add.existing(thanhCauHitbox, true);
        // =====================================
        // TẠO GIỚI HẠN AO CÁ (Tường vô hình - Đã thu nhỏ vừa ao)
        // =====================================
        let wWidth = 430;  
        let wHeight = 160; 
        
        // Đưa tâm của bức tường về lại chính giữa cái ao
        let boundaryCenterX = pondX + 0; 
        let boundaryCenterY = pondY - 10;
        
        // 1. TẠO 4 BỨC TƯỜNG BAO QUANH CHÍNH
        let wallTop = this.add.rectangle(boundaryCenterX, boundaryCenterY - wHeight/2, wWidth, 20, 0x000000, 0);
        let wallBottom = this.add.rectangle(boundaryCenterX, boundaryCenterY + wHeight/2, wWidth, 20, 0x000000, 0);
        let wallLeft = this.add.rectangle(boundaryCenterX - wWidth/2, boundaryCenterY, 20, wHeight, 0x000000, 0);
        let wallRight = this.add.rectangle(boundaryCenterX + wWidth/2, boundaryCenterY, 20, wHeight, 0x000000, 0);

        this.physics.add.existing(wallTop, true);
        this.physics.add.existing(wallBottom, true);
        this.physics.add.existing(wallLeft, true);
        this.physics.add.existing(wallRight, true);

        // 2. TẠO 2 Ô VUÔNG Ở GÓC TRÊN (Đã tách riêng Trái và Phải)
        
        // --- GÓC TRÊN BÊN TRÁI (ĐÃ CHỈNH DÀI XUỐNG) ---
        let chieuDaiGocTraiTren = 40; // Chiều ngang giữ nguyên
        let chieuCaoGocTraiTren = 65; // <-- Tăng số này để ô va chạm dài tuột xuống dưới
        
        let gocTraiTrenX = (boundaryCenterX - wWidth/2) + chieuDaiGocTraiTren / 2 + 10;
        let gocTraiTrenY = (boundaryCenterY - wHeight/2) + chieuCaoGocTraiTren / 2 + 10;
        
        let cornerTopLeft = this.add.rectangle(gocTraiTrenX, gocTraiTrenY, chieuDaiGocTraiTren, chieuCaoGocTraiTren, 0x000000, 0);
        this.physics.add.existing(cornerTopLeft, true);

        // --- GÓC TRÊN BÊN PHẢI (ĐÃ TĂNG CHIỀU NGANG) ---
        let chieuDaiGocPhaiTren = 40; // <-- Tăng/giảm số này để chỉnh chiều ngang dài ra hoặc ngắn lại
        let chieuCaoGocPhaiTren = 25; // Giữ nguyên chiều cao cũ
        
        let gocPhaiTrenX = (boundaryCenterX + wWidth/2) - chieuDaiGocPhaiTren / 2 - 10;
        let gocPhaiTrenY = (boundaryCenterY - wHeight/2) + chieuCaoGocPhaiTren / 2 + 10;
        
        let cornerTopRight = this.add.rectangle(gocPhaiTrenX, gocPhaiTrenY, chieuDaiGocPhaiTren, chieuCaoGocPhaiTren, 0x000000, 0);
        this.physics.add.existing(cornerTopRight, true);

        // 3. TẠO 2 Ô VUÔNG Ở GÓC DƯỚI (Đã tách riêng Trái và Phải)
        
        // --- GÓC DƯỚI BÊN TRÁI (ĐÃ CHỈNH DÀI RA VÀ DỊCH SANG TRÁI) ---
        let chieuDaiGocTraiDuoi = 70; 
        let chieuCaoGocTraiDuoi = 1; 
        
        let gocTraiDuoiY = (boundaryCenterY + wHeight/2) - chieuCaoGocTraiDuoi / 2 - 78; 
        
        // ĐỂ DỊCH SANG TRÁI: Mình đã giảm số "+ 55" xuống thành "+ 20".
        // Bạn có thể tiếp tục hạ số này xuống (ví dụ: 0, -10, -30) để nó dịch sang trái đúng ý bạn nhất.
        let gocTraiDuoiX = (boundaryCenterX - wWidth/2) + chieuDaiGocTraiDuoi / 2 + 10;
        
        let cornerBottomLeft = this.add.rectangle(gocTraiDuoiX, gocTraiDuoiY, chieuDaiGocTraiDuoi, chieuCaoGocTraiDuoi, 0x000000, 0);
        this.physics.add.existing(cornerBottomLeft, true);

        // --- GÓC DƯỚI BÊN PHẢI (GIỮ NGUYÊN NHỎ) ---
        let kichThuocGocPhaiDuoi = 5; // <-- Giữ nguyên 20
        let gocPhaiDuoiY = (boundaryCenterY + wHeight/2) - kichThuocGocPhaiDuoi / 2 - 75; 
        let gocPhaiDuoiX = (boundaryCenterX + wWidth/2) - kichThuocGocPhaiDuoi / 2 - 20;
        
        let cornerBottomRight = this.add.rectangle(gocPhaiDuoiX, gocPhaiDuoiY, kichThuocGocPhaiDuoi, kichThuocGocPhaiDuoi, 0x000000, 0);
        this.physics.add.existing(cornerBottomRight, true);
        // THÊM 2 Ô VUÔNG PHỤ ĐỂ BO GÓC MƯỢT HƠN
        // ==========================================
        
        // 1. Ô phụ kế góc TRÊN BÊN TRÁI (Dịch sang phải và xích xuống một chút)
        let sizePhuTraiTren = 10; 
        let phuTraiTrenX = gocTraiTrenX + 55; // Cộng thêm để dịch sang phải
        let phuTraiTrenY = gocTraiTrenY - 15; // Cộng thêm để dịch xuống dưới
        
        let extraTopLeft = this.add.rectangle(phuTraiTrenX, phuTraiTrenY, sizePhuTraiTren, sizePhuTraiTren, 0x000000, 0);
        this.physics.add.existing(extraTopLeft, true);

        // 2. Ô phụ kế góc DƯỚI BÊN PHẢI (Dịch sang trái và nhấc lên cao một chút)
        let sizePhuPhaiDuoi = 5; 
        let phuPhaiDuoiX = gocPhaiDuoiX - 0; // Trừ đi để dịch sang trái
        let phuPhaiDuoiY = gocPhaiDuoiY + 60; // Trừ đi để nhấc lên cao
        
        let extraBottomRight = this.add.rectangle(phuPhaiDuoiX, phuPhaiDuoiY, sizePhuPhaiDuoi, sizePhuPhaiDuoi, 0x000000, 0);
        this.physics.add.existing(extraBottomRight, true);
        // 3. Ô phụ kế góc TRÊN BÊN PHẢI (Dịch sang trái và xích xuống một chút)
        let sizePhuPhaiTren = 5; 
        let phuPhaiTrenX = gocPhaiTrenX - 50; // Trừ đi để dịch sang trái
        let phuPhaiTrenY = gocPhaiTrenY + 0; // Cộng thêm để nhích xuống dưới
        
        let extraTopRight = this.add.rectangle(phuPhaiTrenX, phuPhaiTrenY, sizePhuPhaiTren, sizePhuPhaiTren, 0x000000, 0);
        this.physics.add.existing(extraTopRight, true);
        // 4. Ô phụ kế góc DƯỚI BÊN TRÁI (Dịch sang phải và xích xuống một chút)
        let sizePhuTraiDuoi = 5; 
        let phuTraiDuoiX = gocTraiDuoiX - 10; // Cộng thêm để dịch sang phải (bạn có thể tinh chỉnh số này)
        let phuTraiDuoiY = gocTraiDuoiY + 60; // Cộng thêm để dịch xuống dưới
        
        let extraBottomLeft = this.add.rectangle(phuTraiDuoiX, phuTraiDuoiY, sizePhuTraiDuoi, sizePhuTraiDuoi, 0x000000, 0);
        this.physics.add.existing(extraBottomLeft, true);
        // 4. GOM TẤT CẢ VÀO CHUNG 1 MẢNG ĐỂ CÁ VA CHẠM (Đã bổ sung đủ 4 ô phụ)
        let walls = [wallTop, wallBottom, wallLeft, wallRight, cornerTopLeft, cornerTopRight, cornerBottomLeft, cornerBottomRight, extraTopLeft, extraBottomRight, extraTopRight, extraBottomLeft];

        // CÁ TRÊ BƠI LỘI 
        this.catre = this.physics.add.sprite(pondX + 80, pondY, 'catre', 0);
        this.catre.setDepth(2.5); 
        this.catre.setScale(0.02); // Hoặc kích thước bạn đã chọn
        
        // Tạo viền va chạm hình tròn ôm vừa khít đường kính của ảnh gốc
        this.catre.body.setCircle(this.catre.width / 2); 
        
        this.catre.setBounce(1, 1); 
        this.catre.setDrag(0);      
        
        let speed = 10; 
        this.catre.setVelocity(speed, speed);
        let gocScale = 0.02; // Kích thước gốc của cá trê

        // Thêm hiệu ứng lắc lư (quẫy đuôi)
        this.tweens.add({
            targets: this.catre,
            angle: { from: -3, to: 3 },
            duration: 700,
            yoyo: true,
            repeat: -1,
            ease: 'Sine.easeInOut'
        });

        // Thêm hiệu ứng co giãn (thở/bơi)
        this.tweens.add({
            targets: this.catre,
            scaleX: gocScale * 0.95,  // Ép ngang
            scaleY: gocScale * 1.05,  // Phình dọc
            duration: 250,
            yoyo: true,
            repeat: -1,
            ease: 'Sine.easeInOut'
        });

        // Bật va chạm cho cá với cả chân cầu và thanh cầu xéo
        this.physics.add.collider(this.catre, [cauCaTra, thanhCauHitbox]);
        this.physics.add.collider(this.catre, walls);

        // CÁ VỒ BƠI LỘI
        // Đặt vị trí xuất hiện hơi lệch so với cá trê một chút để không dính vào nhau
        this.cavo = this.physics.add.sprite(pondX - 50, pondY + 20, 'cavo', 0);
        this.cavo.setDepth(2.5); 
        this.cavo.setScale(0.02); 
        
        this.cavo.body.setCircle(this.cavo.width / 2); 
        this.cavo.setBounce(1, 1); 
        this.cavo.setDrag(0);      
        
        // Tốc độ bơi khác cá trê một chút
        this.cavo.setVelocity(-12, 8); 

        // Hiệu ứng lắc lư và thở cho Cá Vồ
        this.tweens.add({ targets: this.cavo, angle: { from: -4, to: 4 }, duration: 600, yoyo: true, repeat: -1, ease: 'Sine.easeInOut' });
        this.tweens.add({ targets: this.cavo, scaleX: 0.02 * 0.95, scaleY: 0.02 * 1.05, duration: 280, yoyo: true, repeat: -1, ease: 'Sine.easeInOut' });

        this.physics.add.collider(this.cavo, [cauCaTra, thanhCauHitbox]);
        this.physics.add.collider(this.cavo, walls);

        // CÁ TAI TƯỢNG BƠI LỘI
        this.cataituong = this.physics.add.sprite(pondX + 30, pondY - 40, 'cataituong', 0);
        this.cataituong.setDepth(2.5); 
        this.cataituong.setScale(0.02); 
        
        this.cataituong.body.setCircle(this.cataituong.width / 2); 
        this.cataituong.setBounce(1, 1); 
        this.cataituong.setDrag(0);      
        
        // Tốc độ bơi khác đi một chút
        this.cataituong.setVelocity(8, -15); 

        // Hiệu ứng lắc lư và thở cho Cá Tai Tượng
        this.tweens.add({ targets: this.cataituong, angle: { from: -2, to: 2 }, duration: 800, yoyo: true, repeat: -1, ease: 'Sine.easeInOut' });
        this.tweens.add({ targets: this.cataituong, scaleX: 0.02 * 0.95, scaleY: 0.02 * 1.05, duration: 320, yoyo: true, repeat: -1, ease: 'Sine.easeInOut' });

        this.physics.add.collider(this.cataituong, [cauCaTra, thanhCauHitbox]);
        this.physics.add.collider(this.cataituong, walls);

        // CHO CÁC CON CÁ TỰ VA CHẠM (DỘI VÀO NHAU)
        this.physics.add.collider([this.catre, this.cavo, this.cataituong]);

        // ---> NGÔI NHÀ <---
        // Đặt vị trí X gần khu vực ao, Y lùi xuống dưới ao (cộng thêm px)
        let nhaX = pondX - 220; 
        let nhaY = pondY + 220; 

        let nha = this.add.image(nhaX, nhaY, 'nha');
        
        // Đặt tâm ở giữa cạnh đáy để dễ canh tọa độ nằm trên mặt đất
        nha.setOrigin(0.5, 1); 
        
        // Đặt Depth cao hơn ao (2) và cầu cá tra (3) để không bị che lấp
        nha.setDepth(4); 
        
        // Scale lại cho vừa màn hình (bạn có thể tăng/giảm số này nếu nhà to/nhỏ quá)
        nha.setScale(0.18);

        // --- TRỒNG CÂY TRE, MÂY VÀ NGỌN TRE ---
        let bambooX = 150;
        
        let soDotTre = 33; 
        let chieuCaoMotDot = 100; 
        let baseDepth = 10; 

        for (let i = 0; i < soDotTre; i++) {
            let toaDoY = groundLevelY - (i * chieuCaoMotDot);
            
            // Vẽ thân tre
            this.add.image(bambooX, toaDoY, 'bamboo')
                .setOrigin(0.5, 1)
                .setDepth(baseDepth + i);
            
            // TỰ ĐỘNG THÊM TẦNG MÂY:
            if (i >= 5 && (i - 5) % 3 === 0 && i <= 29) {
                let cloud = this.add.image(width / 2, toaDoY - chieuCaoMotDot, 'tangmay').setOrigin(0.5, 0.5);
                cloud.setScale((width / cloud.width) * 0.95);
                
                cloud.setDepth(baseDepth + i + 0.5); 
            }
        }

        // CẮM NGỌN TRE VÀO ĐỐT CUỐI CÙNG
        let topY = groundLevelY - (soDotTre * chieuCaoMotDot);
        this.add.image(bambooX, topY, 'ngontre')
            .setOrigin(0.5, 1)
            .setDepth(baseDepth + soDotTre);
        
        // ---> MÂY TRẮNG (SHOP) <---
        let yTangMay1 = groundLevelY - (5 * chieuCaoMotDot); 
        let shopCloudX = 400;
        let shopCloudY = yTangMay1 + 200;

        // 2. Tạo Sprite mây trắng
        let shopCloud = this.add.sprite(shopCloudX, shopCloudY, 'maytrang', 0);
        shopCloud.setOrigin(0.5, 0.5);
        shopCloud.setScale(0.15);
        shopCloud.setDepth(50);

        // 3. Hiệu ứng bay lơ lửng (Yoyo)
        this.tweens.add({
            targets: shopCloud,
            y: shopCloud.y - 15,
            duration: 2000,
            yoyo: true,
            repeat: -1,
            ease: 'Sine.easeInOut'
        });

        // 4. Hiệu ứng chớp mắt mỗi 15 giây
        this.time.addEvent({
            delay: 15000,
            loop: true,
            callback: () => {
                shopCloud.setFrame(1);
                this.time.delayedCall(200, () => {
                    shopCloud.setFrame(0);
                });
            }
        });

        // 5. Mở giao diện Cửa hàng khi click vào Mây Trắng
        shopCloud.setInteractive({ useHandCursor: true });
        shopCloud.on('pointerdown', () => {
            if (this.isUIOpen) return; // Chặn click nếu UI khác đang mở
            this.isUIOpen = true;      // Đánh dấu là Shop đã mở

            // 1. Cập nhật lại dòng chữ hiển thị số 🥜 Đậu hiện tại
            dauText.setText('🥜 Đậu: ' + this.soDau); 
            
            // 2. Hiển thị toàn bộ nhóm Giao diện Shop lên màn hình
            shopUI.setVisible(true);
            
            // 3. (Tùy chọn) In ra log để dễ kiểm tra lỗi
            console.log("Đã mở Shop Mây thành công!");
        });

        // ---> MÂY ĐEN (SỰ KIỆN) <---
        // 1. Tính toán vị trí: Nằm bên phải mây trắng, cùng độ cao
        let darkCloudX = shopCloudX + 150; // Cộng thêm 150px để dịch sang phải
        let darkCloudY = shopCloudY - 15;       

        // 2. Tạo Sprite mây đen
        let darkCloud = this.add.sprite(darkCloudX, darkCloudY, 'mayden', 0);
        darkCloud.setOrigin(0.5, 0.5);
        darkCloud.setScale(0.17); // Kích thước bằng mây trắng
        darkCloud.setDepth(50);

        // 3. Hiệu ứng bay lơ lửng NGƯỢC với mây trắng
        this.tweens.add({
            targets: darkCloud,
            y: darkCloud.y + 15,    // Mây trắng là trừ 15 (bay lên), mây đen là cộng 15 (bay xuống)
            duration: 2000,
            yoyo: true,
            repeat: -1,
            ease: 'Sine.easeInOut'
        });

        // 4. Hiệu ứng chớp mắt mỗi 15 giây
        this.time.addEvent({
            delay: 15000,
            loop: true,
            callback: () => {
                darkCloud.setFrame(1);
                this.time.delayedCall(200, () => {
                    darkCloud.setFrame(0);
                });
            }
        });

        // 5. Chuẩn bị cho chức năng Sự kiện (Bật tương tác click)
        darkCloud.setInteractive({ useHandCursor: true });
        darkCloud.on('pointerdown', () => {
            if (this.isUIOpen) return; // Chặn click nếu UI khác đang mở

            console.log("Đã click vào Mây Đen! Sẵn sàng mở giao diện sự kiện.");
            // Code mở UI Sự kiện của bạn sẽ viết ở đây sau này
        });

        // --- GỐC TRE ---
        let pandaY = groundLevelY + 10; 
        
        // Sử dụng this.add.image để thêm ảnh tĩnh
        let pandaBase = this.add.image(bambooX, pandaY, 'goctre')
            .setOrigin(0.5, 1)
            .setDepth(1000); 
            
        // Giữ nguyên tỉ lệ scale cũ, bạn có thể điều chỉnh số 0.5 này nếu ảnh mới quá to hoặc nhỏ
        pandaBase.setScale(0.3);

        // ==========================================
        // HỆ THỐNG TIỀN TỆ VÀ GIAO DIỆN SHOP (CHUẨN UI)
        // ==========================================
        
        this.soDau = 86869; // Cấp số lượng Đậu giống ảnh mẫu để test

        let shopUI = this.add.container(width / 2, height / 2);
        shopUI.setDepth(9999); 
        shopUI.setScrollFactor(0); 
        shopUI.setVisible(false);

        // 1. Phông nền tối mờ chặn click xuyên thấu
        let overlay = this.add.rectangle(0, 0, width, height, 0x000000, 0.4).setInteractive().setScrollFactor(0);
        // overlay nuốt trọn các click, không cho lọt xuống dưới
        overlay.on('pointerdown', (pointer, localX, localY, event) => {
            event.stopPropagation();
        });
        
        shopUI.add(overlay);

        // 2. Nền trắng bo góc của khung Shop
        let bgGraphics = this.add.graphics();
        bgGraphics.fillStyle(0xffffff, 1);
        bgGraphics.fillRoundedRect(-300, -400, 600, 800, 30); // Rộng 600, Cao 800, Bo góc 30
        shopUI.add(bgGraphics);

        // 3. Tiêu đề
        let titleText = this.add.text(0, -350, '☁️ SHOP MÂY', { fontSize: '32px', fill: '#4CAF50', fontStyle: '900' }).setOrigin(0.5);
        
        // 4. Thanh hiển thị Tiền tệ (Nền màu kem)
        let currencyBg = this.add.graphics();
        currencyBg.fillStyle(0xf5f0e6, 1);
        currencyBg.fillRoundedRect(-250, -310, 500, 50, 25); // Bo góc 25 tạo hình viên thuốc
        // (Để đơn giản, mình hiển thị 1 loại tiền 🥜 như bạn yêu cầu trước đó, nhưng format giống ảnh)
        let dauText = this.add.text(0, -285, '🥜 ' + this.soDau, { fontSize: '24px', fill: '#8B4513', fontStyle: 'bold' }).setOrigin(0.5);
        
        // 5. Phân mục "Danh sách Hạt Giống"
        let subtitleText = this.add.text(-250, -230, '🌱 Danh sách Hạt Giống', { fontSize: '24px', fill: '#8B4513', fontStyle: 'bold' }).setOrigin(0, 0.5);
        
        shopUI.add([titleText, currencyBg, dauText, subtitleText]);

        // ==========================================
        // 6. DANH SÁCH THẺ VẬT PHẨM (LƯỚI 2x2)
        // ==========================================
        
        // 1. TẠO DANH SÁCH HẠT GIỐNG (Đã đổi sang dùng frame của spritesheet)
        const shopItems = [
            { name: 'Hạt Nguyên Tố', price: 100, frame: 0 }, // Góc trên trái
            { name: 'Hạt Kim Loại',  price: 100, frame: 1 }, // Góc trên phải
            { name: 'Hạt Tình Yêu',  price: 100, frame: 2 }, // Góc dưới trái
            { name: 'Hạt Mật',       price: 100, frame: 3 }  // Góc dưới phải
        ];

        // 2. Tọa độ bắt đầu cho thẻ đầu tiên (Góc trái trên)
        let startX = -140; 
        let startY = -100; 
        let khoangCachX = 280; // Khoảng cách giữa 2 cột
        let khoangCachY = 240; // Khoảng cách giữa 2 hàng

        // 3. DÙNG VÒNG LẶP ĐỂ VẼ 4 THẺ TỰ ĐỘNG
        shopItems.forEach((item, index) => {
            let col = index % 2; 
            let row = Math.floor(index / 2); 

            let cardX = startX + (col * khoangCachX);
            let cardY = startY + (row * khoangCachY);

            // a. Viền và nền trắng của thẻ
            let cardBg = this.add.graphics();
            cardBg.fillStyle(0xffffff, 1);
            cardBg.lineStyle(2, 0xe0e0e0, 1); 
            cardBg.fillRoundedRect(cardX - 110, cardY - 100, 220, 220, 20);
            cardBg.strokeRoundedRect(cardX - 110, cardY - 100, 220, 220, 20);

            // b. Nền màu xanh lá nhạt đằng sau hình hạt giống (kích thước 100x100)
            let itemImgBg = this.add.graphics();
            itemImgBg.fillStyle(0xe8f5e9, 1); 
            itemImgBg.fillRoundedRect(cardX - 50, cardY - 80, 100, 100, 20);

            // THÊM DÒNG MỚI: Dùng sprite và truyền item.frame vào
            let itemImg = this.add.sprite(cardX, cardY - 30, 'hatmay', item.frame);
            
            let maxSize = 85; 
            let scaleX = maxSize / itemImg.width;   
            let scaleY = maxSize / itemImg.height;  
            let finalScale = Math.min(scaleX, scaleY); // Lấy tỷ lệ nhỏ hơn để ảnh không bị méo hay tràn viền
            
            itemImg.setScale(finalScale); 

            // d. Tên và Giá
            let itemName = this.add.text(cardX, cardY + 35, item.name, { fontSize: '18px', fill: '#5D4037', fontStyle: 'bold' }).setOrigin(0.5);
            let itemPrice = this.add.text(cardX, cardY + 65, '🥜 ' + item.price, { fontSize: '18px', fill: '#D32F2F', fontStyle: 'bold' }).setOrigin(0.5);

            // e. Nút "Mua"
            let buyBtnBg = this.add.graphics();
            buyBtnBg.fillStyle(0xFF9800, 1); 
            buyBtnBg.fillRoundedRect(cardX - 80, cardY + 90, 160, 35, 15);
            let buyBtnText = this.add.text(cardX, cardY + 107, 'Mua', { fontSize: '18px', fill: '#ffffff', fontStyle: 'bold' }).setOrigin(0.5);
            
            // f. Vùng Hitbox để click
            let buyBtnHit = this.add.rectangle(cardX, cardY + 107, 160, 35, 0x000000, 0).setInteractive({ useHandCursor: true }).setScrollFactor(0);

            // Gộp tất cả chi tiết vào ShopUI
            shopUI.add([cardBg, itemImgBg, itemImg, itemName, itemPrice, buyBtnBg, buyBtnText, buyBtnHit]);

            // g. Xử lý khi nhấn nút Mua
            buyBtnHit.on('pointerdown', () => {
                if (this.soDau >= item.price) {
                    this.soDau -= item.price;
                    dauText.setText('🥜 ' + this.soDau);
                    buyBtnText.setText('Đã Mua');
                    this.time.delayedCall(800, () => { buyBtnText.setText('Mua'); });
                } else {
                    buyBtnText.setText('Thiếu 🥜');
                    this.time.delayedCall(800, () => { buyBtnText.setText('Mua'); });
                }
            });
        });

        // ==========================================
        // 7. NÚT ĐÓNG (Màu đỏ bên dưới cùng)
        // ==========================================
        let closeBtnBg = this.add.graphics();
        closeBtnBg.fillStyle(0xF44336, 1); 
        closeBtnBg.fillRoundedRect(-250, 310, 500, 60, 20);
        let closeBtnText = this.add.text(0, 340, 'Đóng', { fontSize: '26px', fill: '#ffffff', fontStyle: 'bold' }).setOrigin(0.5);
        
        let closeBtnHit = this.add.rectangle(0, 340, 500, 60, 0x000000, 0).setInteractive({ useHandCursor: true }).setScrollFactor(0);
        closeBtnHit.on('pointerdown', () => {
            
            // Báo cho game biết Shop đã đóng, mở lại các tương tác khác
            this.isUIOpen = false; 
            
            shopUI.setVisible(false);
        });

        shopUI.add([closeBtnBg, closeBtnText, closeBtnHit]);

        // --- CAMERA & VUỐT MÀN HÌNH ---
        // Cho phép camera cuộn lên nhìn qua cả ngọn tre
        let caoNhatCuaGame = topY - 120; // Trừ đi chiều cao ngọn tre
        this.cameras.main.setBounds(0, caoNhatCuaGame - 200, width, height - caoNhatCuaGame + 200);

        this.input.on('pointermove', (pointer) => {
            
            // Nếu Shop đang mở thì ngắt ngay, không cho chạy code vuốt bên dưới
            if (this.isUIOpen) return; 
            
            if (!pointer.isDown) return; 
            this.cameras.main.scrollY -= (pointer.y - pointer.prevPosition.y);
        });
    }
    
    update() {
        // CÁ TRÊ QUAY ĐẦU (Code cũ)
        if (this.catre && this.catre.active) {
            if (this.catre.body.velocity.x > 0) {
                this.catre.setFrame(1); 
            } else if (this.catre.body.velocity.x < 0) {
                this.catre.setFrame(0); 
            }
        }

        // ---> THÊM: CÁ VỒ QUAY ĐẦU <---
        if (this.cavo && this.cavo.active) {
            if (this.cavo.body.velocity.x > 0) {
                this.cavo.setFrame(1); 
            } else if (this.cavo.body.velocity.x < 0) {
                this.cavo.setFrame(0); 
            }
        }

        // ---> THÊM: CÁ TAI TƯỢNG QUAY ĐẦU <---
        if (this.cataituong && this.cataituong.active) {
            if (this.cataituong.body.velocity.x > 0) {
                this.cataituong.setFrame(1); 
            } else if (this.cataituong.body.velocity.x < 0) {
                this.cataituong.setFrame(0); 
            }
        }
    }
}
