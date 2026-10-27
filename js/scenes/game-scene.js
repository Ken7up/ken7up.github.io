import House from '../objects/house.js';
import PetHouse from '../objects/pet-house.js';
import HeroSlot from '../objects/hero-slot.js';
import Blacksmith from '../objects/blacksmith.js';
import FishPond from '../objects/fish-pond.js';
import BambooSystem from '../objects/bamboo-system.js';
import Environment from '../objects/environment.js';
import ShopSystem from '../objects/shop-system.js';
import FarmingSystem from '../objects/farming-system.js';
import HomThinh from '../objects/homthinh.js';

export default class GameScene extends Phaser.Scene {
    constructor() {
        super('GameScene');
    }

    create() {
        this.isUIOpen = false;
        this.soDau = 1000; // Dữ liệu của người chơi lưu ở Scene chính
        this.khoNguyenLieu = [];
        this.soTeruBozu = 0;
        
        // --- THÊM DỮ LIỆU LÒ RÈN  ---
        // Vị trí mảng tương ứng với: [Sọ dừa, Chậu Đồng, Chậu Bạc, Chậu Vàng]
        this.tuiChau = [0, 0, 0, 0]; 
        this.dangRen = null; // Sẽ chứa thông tin khi đang rèn: { id: 1, timer: Phaser.Time.TimerEvent }

        const width = this.scale.width;
        const height = this.scale.height;
        const groundLevelY = height - 460;

        // 1. Dựng Bối cảnh (Mây, Đất, Cây cối tĩnh)
        this.environment = new Environment(this, width, height, groundLevelY);

        // 2. Dựng Công trình
        this.ngoiNha = new House(this, groundLevelY);
        this.nhaPet = new PetHouse(this, width, height);
        this.oTuong = new HeroSlot(this, width, height);
        this.thoRen = new Blacksmith(this, width, height);
        this.fishPond = new FishPond(this, width, height, groundLevelY);
        this.bambooSystem = new BambooSystem(this, width, groundLevelY);

        // 📦 KHU VỰC ĐIỀU CHỈNH HÒM THÍNH
        
        // SỬA: Truyền trực tiếp tọa độ (100, 1000) vào ngay lúc tạo
        // Điều này giúp khói sinh ra đúng vị trí ngay từ khung hình đầu tiên
        this.homThinh = new HomThinh(this, 520, 560);

        // SỬA: Hòm thính bị thu nhỏ lại còn 5%
        this.homThinh.setScale(0.25);

        // KÍCH HOẠT DEPTH: Khi gọi dòng này, hàm setDepth mới tạo ở file homthinh.js 
        // sẽ tự động chạy, kéo cả hòm thính lên lớp 100 và khói lên lớp 99.
        this.homThinh.setDepth(100);

        // 3. Khởi tạo Hệ thống Gameplay
        this.farmingSystem = new FarmingSystem(this, width, height);
        this.shopSystem = new ShopSystem(this, width, height, groundLevelY);

        // 4. Camera và Tương tác Vuốt
        let caoNhatCuaGame = this.bambooSystem.caoNhatCuaGame; 
        this.cameras.main.setBounds(0, caoNhatCuaGame - 200, width, height - caoNhatCuaGame + 200);

        this.input.on('pointermove', (pointer) => {
            if (this.isUIOpen || !pointer.isDown) return; 
            this.cameras.main.scrollY -= (pointer.y - pointer.prevPosition.y);
        });

        this.input.on('wheel', (pointer, gameObjects, deltaX, deltaY, deltaZ) => {
            if (this.isUIOpen) return; 
            this.cameras.main.scrollY += deltaY * 0.8;
        });
    }
    
    update() {
        if (this.fishPond) this.fishPond.update();
        if (this.bambooSystem) this.bambooSystem.update(this.cameras.main.scrollY);
        if (this.environment) this.environment.update();
    }

    // Hàm dùng chung cho tương lai
    caDopMoi(ca) {
        if (!ca || !ca.active) return;
        ca.setFrame(1);
        this.time.delayedCall(500, () => {
            if (ca && ca.active) ca.setFrame(0); 
        });
    }
}
