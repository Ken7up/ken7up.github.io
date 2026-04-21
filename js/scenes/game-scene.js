import House from '../objects/house.js';
import PetHouse from '../objects/pet-house.js';
import HeroSlot from '../objects/hero-slot.js';
import Blacksmith from '../objects/blacksmith.js';
import FishPond from '../objects/fish-pond.js';
import BambooSystem from '../objects/bamboo-system.js';
import Environment from '../objects/environment.js';
import ShopSystem from '../objects/shop-system.js';
import FarmingSystem from '../objects/farming-system.js';

export default class GameScene extends Phaser.Scene {
    constructor() {
        super('GameScene');
    }

    create() {
        this.isUIOpen = false;
        this.soDau = 9999; // Dữ liệu của người chơi lưu ở Scene chính
        
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
