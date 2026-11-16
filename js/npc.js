class DoraemonNPC {
    constructor(x, y) {
        this.x = x - 450;
        this.y = y - 350;
        this.scale = 0.35; 
        this.radius = 30;  
        this.animTimer = 0; 
        
        // Thêm biến quản lý chớp mắt
        this.blinkTimer = 0; 
        this.isBlinking = false;
        this.isVisible = false;
    }

    update() {
        if (!this.isVisible) return;
        // Cập nhật nhịp thở
        this.animTimer += 0.05;
        
        // Cập nhật thời gian chớp mắt (giả định game chạy ở 60FPS)
        this.blinkTimer++;
        
        // Mỗi ~3 giây (180 frames) sẽ bắt đầu chớp mắt
        if (this.blinkTimer > 180) {
            this.isBlinking = true;
        }
        
        // Mắt nhắm trong khoảng 10 frames (rất nhanh, giống chớp mắt thật)
        if (this.blinkTimer > 190) {
            this.isBlinking = false;
            this.blinkTimer = 0; // Reset lại chu kỳ chớp mắt
        }
    }

    draw() {
        if (!this.isVisible) return;
        // --- 1. TÍNH NHỊP THỞ ---
        let breathScaleY = this.scale + (Math.sin(this.animTimer) * 0.012);

        // --- 2. VẼ BÓNG CHÂN (CỐ ĐỊNH) ---
        let shadowY = this.y + 100 * this.scale;
        gameGraphics.fillStyle(0x000000, 0.15); 
        gameGraphics.fillEllipse(this.x, shadowY, 100 * this.scale, 25 * this.scale);

        // --- 3. KIỂM TRA TRẠNG THÁI CHỚP MẮT ---
        // Giả sử frame 0 là mở mắt, frame 1 là nhắm mắt trong sprite sheet của bạn
        let currentFrame = this.isBlinking ? 1 : 0;

        // --- 4. KỸ THUẬT CẮT ẢNH 3 PHẦN: ĐẦU, BỤNG, CHÂN ---
        let legY = 180;  // Điểm cắt giữa Bụng và Chân
        let neckY = 130; // Điểm cắt giữa Đầu và Bụng (Bạn có thể tinh chỉnh số 130 này cho khớp với sprite)

        // Tính toán tọa độ các khớp nối
        let jointLegsY = this.y + (legY - 128) * this.scale; 
        // Tính vị trí của cổ dựa trên độ co giãn của bụng (bụng giãn thì cổ bị đẩy lên)
        let jointNeckY = jointLegsY - (legY - neckY) * breathScaleY; 

        // BƯỚC 4A: Phần dưới (Chân) - Cố định hoàn toàn
        drawSprite("doraemon", this.x, this.y, {
            w: 256 * this.scale, 
            h: 256 * this.scale, 
            frame: currentFrame,
            isUI: false,
            depth: 10,
            crop: { x: 0, y: legY, w: 256, h: 256 - legY } 
        });

        // BƯỚC 4B: Phần giữa (Bụng) - Phập phồng co giãn lên xuống
        drawSprite("doraemon", this.x, jointLegsY, {
            w: 256 * this.scale, 
            h: 256 * breathScaleY, // CHỈ có bụng dùng breathScaleY để co giãn
            frame: currentFrame,
            isUI: false,
            depth: 10,
            originX: 0.5, 
            originY: legY / 256, // Neo phần dưới của bụng vào chân
            crop: { x: 0, y: neckY, w: 256, h: legY - neckY } 
        });

        // BƯỚC 4C: Phần trên (Đầu) - Không co giãn, di chuyển theo bụng
        drawSprite("doraemon", this.x, jointNeckY, {
            w: 256 * this.scale, 
            h: 256 * this.scale, // Giữ nguyên scale gốc để đầu không bị méo, bóp
            frame: currentFrame,
            isUI: false,
            depth: 10,
            originX: 0.5, 
            originY: neckY / 256, // Neo phần dưới của đầu vào cổ
            crop: { x: 0, y: 0, w: 256, h: neckY } 
        });

        // --- 5. VẼ TÊN NPC ---
        // Đổi tham số cuối cùng (thứ 9) từ true thành false để tên ghim cố định trên đầu Doraemon
        drawText("Doraemon", this.x, this.y - 150 * this.scale, 15, "#4287f5", "center", true, false, false); 
    }

    checkClick(mx, my) {
        if (!this.isVisible) return false;
        let dist = Math.sqrt((mx - this.x)**2 + (my - this.y)**2);
        
        if (dist <= this.radius) {
            return true;
        }
        return false;
    }
}

// --- CLASS Door
class AnywhereDoor {
    constructor(x, y) {
        this.x = x;
        this.y = y - 20; // Nâng cửa lên một chút so với chân Doraemon cho khớp
        this.scale = 0.15; // Kích thước cửa (có thể tùy chỉnh)
        this.isOpen = false; // Trạng thái mặc định là đóng
        this.radius = 50; // Vùng click chuột
    }

    draw() {
        // Nếu cửa mở thì vẽ frame 1 (phải), đóng thì vẽ frame 0 (trái)
        let currentFrame = this.isOpen ? 1 : 0;

        // Vẽ bóng của cánh cửa
        let shadowY = this.y + 350 * this.scale;
        gameGraphics.fillStyle(0x000000, 0.15); 
        gameGraphics.fillEllipse(this.x, shadowY, 500 * this.scale, 100 * this.scale);

        // Vẽ cánh cửa (depth = 9 để nằm ngay sau Doraemon có depth = 10)
        drawSprite("door", this.x, this.y, {
            w: 512 * this.scale, // Giả sử frame gốc là 512x512
            h: 1024 * this.scale,
            frame: currentFrame,
            isUI: false,
            depth: 10 
        });
    }

    checkClick(mx, my) {
        let dist = Math.sqrt((mx - this.x)**2 + (my - this.y)**2);
        if (dist <= this.radius) {
            this.isOpen = !this.isOpen; // Đảo trạng thái đóng/mở
            
            // Đồng bộ trạng thái hiển thị của Doraemon với cánh cửa
            if (doraemon) {
                doraemon.isVisible = this.isOpen;
                if (this.isOpen) {
                    floatingTexts.push(new FloatingText(this.x, this.y - 120, "Tèn ten!!!", "#ffcc00"));
                }
            }
            return true;
        }
        return false;
    }
}
