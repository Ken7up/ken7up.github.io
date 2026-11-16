class BasePanel {
    drawCloseBtn(x, y, w, h) {
        drawRect(x, y, w, h, "#962828", true, 4, 1, true);
        drawText("X", x + w/2, y + h/2, 14, "#fff", "center", true, true);
    }
    checkCloseClick(mx, my) {
        return (mx >= this.closeBtn.x && mx <= this.closeBtn.x + this.closeBtn.w && my >= this.closeBtn.y && my <= this.closeBtn.y + this.closeBtn.h);
    }
}

class InventoryPanel extends BasePanel {
    constructor() {
        super();
        this.visible = false; 
        this.slotSize = 50; 
        this.gap = 6; 
        this.cols = 6; 
        this.rows = 6;
        this.w = 360; 
        this.h = 450; 
        this.x = 0; 
        this.y = 0;
        this.items = Array(this.rows).fill().map(() => Array(this.cols).fill(null));
        this.gold = 99999; 
        this.selectedSlot = null;
        this.rect = {}; 
        this.closeBtn = {}; 
        this.useBtnRect = {};
    }
    addItem(type, count, img) {
        for(let r=0; r<this.rows; r++) {
            for(let c=0; c<this.cols; c++) {
                if (!this.items[r][c]) { 
                    this.items[r][c] = { type: type, count: count, img: img }; 
                    return true; 
                }
            }
        } 
        return false; 
    }
    toggle() { 
        this.visible = !this.visible; 
        this.selectedSlot = null; 
        if(this.visible) this.updatePos(); 
    }
    updatePos() {
        let sw = typeof SCREEN_WIDTH !== 'undefined' ? SCREEN_WIDTH : window.innerWidth;
        let sh = typeof SCREEN_HEIGHT !== 'undefined' ? SCREEN_HEIGHT : window.innerHeight;
        this.w = Math.min(400, sw - 40); 
        this.slotSize = Math.floor((this.w - 50) / 6);
        this.x = (sw - this.w) / 2; 
        this.y = (sh - this.h) / 2;
        this.rect = {x: this.x, y: this.y, w: this.w, h: this.h};
        this.closeBtn = {x: this.x + this.w - 30, y: this.y + 8, w: 22, h: 22};
        this.useBtnRect = {x: this.x + this.w - 125, y: this.y + this.h - 55, w: 100, h: 35};
    }
    checkClick(mx, my) {
        if (!this.visible) return false;
        if (this.checkCloseClick(mx, my)) { this.visible = false; return true; }
        
        if (this.selectedSlot) {
            let item = this.items[this.selectedSlot.r][this.selectedSlot.c];
            let uBtn = this.useBtnRect;
            if (item && mx>=uBtn.x && mx<=uBtn.x+uBtn.w && my>=uBtn.y && my<=uBtn.y+uBtn.h) {
                if (["LANCE", "SCYTHE", "GUN", "POWER_FIST"].includes(item.type)) {
                    if (player.equippedWeapon) {
                        let imgD = player.equippedWeapon==="SCYTHE"?"scythe":player.equippedWeapon==="GUN"?"gun":player.equippedWeapon==="POWER_FIST"?"power-fist":"lance";
                        this.addItem(player.equippedWeapon, 1, imgD);
                    }
                    player.equippedWeapon = item.type;
                    floatingTexts.push(new FloatingText(player.x, player.y - 80, "Trang bị!", "#ffff00"));
                    this.items[this.selectedSlot.r][this.selectedSlot.c] = null; this.selectedSlot = null; return true;
                }
                else if (item.type.includes("POTION")) {
                    if (item.type === "HP_POTION" || item.type === "DUAL_POTION") player.hp = player.maxHp;
                    if (item.type === "MP_POTION" || item.type === "DUAL_POTION") player.mp = player.maxMp;
                    if (item.type === "STAMINA_POTION") player.stamina = player.maxStamina;
                    floatingTexts.push(new FloatingText(player.x, player.y - 80, "Sử dụng!", "#00ff00"));
                    item.count--;
                    if(item.count<=0) { this.items[this.selectedSlot.r][this.selectedSlot.c] = null; this.selectedSlot = null; }
                } return true;
            }
        }
        
        let startX = this.x + (this.w - (this.cols*this.slotSize + (this.cols-1)*this.gap))/2;
        for (let r=0; r<this.rows; r++) {
            for (let c=0; c<this.cols; c++) {
                let ox = startX + c * (this.slotSize + this.gap), oy = this.y + 55 + r * (this.slotSize + this.gap);
                if (mx>=ox && mx<=ox+this.slotSize && my>=oy && my<=oy+this.slotSize) {
                    this.selectedSlot = this.items[r][c] ? {r:r, c:c} : null; return true;
                }
            }
        }
        return mx >= this.x && mx <= this.x + this.w && my >= this.y && my <= this.y + this.h;
    }
    
    drawItemIcon(x, y, size, item) {
        if (!item) return;
        let pad = 6; let ds = size - pad*2;
        if (["LANCE", "SCYTHE", "GUN", "POWER_FIST"].includes(item.type)) {
            let rot = item.type === "SCYTHE" ? 0 : -Math.PI/6; 
            let frameIdx = undefined; 
            let bounds = getTextureBounds(item.img, frameIdx);
            let scale = Math.min(ds / bounds.w, ds / bounds.h);
            drawSprite(item.img, x+size/2, y+size/2, {w: bounds.w * scale, h: bounds.h * scale, rotation: rot, isUI: true, frame: frameIdx});
        } 
        else if (item.type.includes("POTION")) {
            let frameIdx = 0;
            if (item.type === "HP_POTION") frameIdx = 0;
            else if (item.type === "MP_POTION") frameIdx = 1;
            else if (item.type === "DUAL_POTION") frameIdx = 2;
            else if (item.type === "STAMINA_POTION") frameIdx = 3;
            
            drawSprite("mana", x+size/2, y+size/2, {w: ds, h: ds, frame: frameIdx, isUI: true});
        }
        if (item.count > 1) drawText(item.count, x + size - 10, y + size - 10, 11, "#fff", "center", true, true);
    }
    
    draw() {
        if (!this.visible) return; this.updatePos();
        let sw = typeof SCREEN_WIDTH !== 'undefined' ? SCREEN_WIDTH : window.innerWidth;
        let sh = typeof SCREEN_HEIGHT !== 'undefined' ? SCREEN_HEIGHT : window.innerHeight;
        drawRect(0, 0, sw, sh, "rgba(0,0,0,0.5)", true, 0, 1, true); 
        drawRect(this.x, this.y, this.w, this.h, COLORS.THEME_JADE_BG, true, 8, 1, true);
        drawRect(this.x, this.y, this.w, this.h, 0x0a1e23, false, 8, 4, true);

        drawRect(this.x, this.y, this.w, 40, 0x234b50, true, 8, 1, true); 
        drawText("HÀNH TRANG", this.x + this.w/2, this.y + 20, 18, COLORS.THEME_TEXT_WHITE, "center", true, true);
        this.drawCloseBtn(this.closeBtn.x, this.closeBtn.y, this.closeBtn.w, this.closeBtn.h);

        let gridW = this.cols * this.slotSize + (this.cols - 1) * this.gap;
        let startX = this.x + (this.w - gridW) / 2;
        let startY = this.y + 55;

        for (let r=0; r<this.rows; r++) {
            for (let c=0; c<this.cols; c++) {
                let ox = startX + c * (this.slotSize + this.gap), oy = startY + r * (this.slotSize + this.gap);
                drawRect(ox, oy, this.slotSize, this.slotSize, COLORS.THEME_SLOT_BG, true, 0, 1, true);
                drawRect(ox, oy, this.slotSize, this.slotSize, COLORS.THEME_SLOT_BORDER, false, 0, 1, true);
                if (this.items[r][c]) this.drawItemIcon(ox, oy, this.slotSize, this.items[r][c]);
                if (this.selectedSlot && this.selectedSlot.r === r && this.selectedSlot.c === c) drawRect(ox-2, oy-2, this.slotSize+4, this.slotSize+4, 0xffff00, false, 2, 3, true);
            }
        }
        if (this.selectedSlot) {
            drawRect(this.useBtnRect.x, this.useBtnRect.y, this.useBtnRect.w, this.useBtnRect.h, COLORS.BTN_USE_BG, true, 8, 1, true);
            drawText("SỬ DỤNG", this.useBtnRect.x + this.useBtnRect.w/2, this.useBtnRect.y + this.useBtnRect.h/2, 14, COLORS.BTN_USE_TEXT, "center", true, true);
        }
        
        drawRect(this.x+25, this.y+this.h-55, 100, 32, "rgba(0, 0, 0, 0.6)", true, 6, 1, true);
        drawText(`${this.gold} 🥜`, this.x+75, this.y+this.h-39, 15, "#ffd700", "center", true, true);
    }
}

class CharacterPanel extends BasePanel {
    constructor() {
        super();
        this.visible = false; 
        this.w = 360; 
        this.h = 450; // Chiều cao giữ nguyên 450
        this.x = 0; 
        this.y = 0; 
        this.activeTab = 0; 
        this.selectedEquipSlot = null;
        this.rect = {}; this.closeBtn = {}; this.unequipBtnRect = {};
    }
    
    toggle(targetTab = 0) { 
        if (this.visible && this.activeTab === targetTab) {
            this.visible = false; 
        } else {
            this.visible = true; 
            this.activeTab = targetTab;
            this.selectedEquipSlot = null; 
            this.updatePos();
        }
    }
    
    updatePos() {
        let sw = typeof SCREEN_WIDTH !== 'undefined' ? SCREEN_WIDTH : window.innerWidth;
        let sh = typeof SCREEN_HEIGHT !== 'undefined' ? SCREEN_HEIGHT : window.innerHeight;
        this.w = Math.min(420, sw - 40); this.x = (sw - this.w)/2; this.y = (sh - this.h)/2;
        this.rect = {x:this.x, y:this.y, w:this.w, h:this.h};
        this.closeBtn = {x:this.x + this.w - 30, y:this.y + 8, w:22, h:22};
        this.unequipBtnRect = {x: this.x + (this.w - 160)/2, y: this.y + this.h - 60, w: 160, h: 40};
    }
    
    checkClick(mx, my) {
        if (!this.visible) return false;
        let inR = (r) => mx>=r.x && mx<=r.x+r.w && my>=r.y && my<=r.y+r.h;
        if (this.checkCloseClick(mx, my)) { this.visible = false; return true; }

        if (this.activeTab === 0) {
            if (this.selectedEquipSlot === 4 && inR(this.unequipBtnRect) && player.equippedWeapon) {
                let imgID = player.equippedWeapon==="SCYTHE"?"scythe":player.equippedWeapon==="GUN"?"gun":player.equippedWeapon==="POWER_FIST"?"power-fist":"lance";
                if (inventory.addItem(player.equippedWeapon, 1, imgID)) { player.equippedWeapon = null; this.selectedEquipSlot = null; }
                else alert("Hành trang đã đầy!");
                return true;
            }
            if (this.selectedEquipSlot === 5 && inR(this.unequipBtnRect) && player.equippedBook) {
                if (inventory.addItem(player.equippedBook, 1, "book")) { player.equippedBook = null; this.selectedEquipSlot = null; }
                else alert("Hành trang đã đầy!");
                return true;
            }
            if (this.selectedEquipSlot === 6 && inR(this.unequipBtnRect) && player.equippedHorse) {
                if (inventory.addItem(player.equippedHorse, 1, "horse")) { player.equippedHorse = null; this.selectedEquipSlot = null; }
                else alert("Hành trang đã đầy!");
                return true;
            }
            
            for (let i=0; i<7; i++) {
                let sx = this.x + 30;
                let sy = this.y + 70 + i * 54;
                
                // Ô Sách (i=5) nằm dưới ô Vũ Khí (i=4). Ô Ngựa (i=6) nằm bên phải ô Sách.
                if (i === 6) { sx = this.x + 30 + 54; sy = this.y + 70 + 5 * 54; }

                if (mx>=sx && mx<=sx+42 && my>=sy && my<=sy+42) {
                    if (i === 4 && player.equippedWeapon) this.selectedEquipSlot = i;
                    else if (i === 5 && player.equippedBook) this.selectedEquipSlot = i;
                    else if (i === 6 && player.equippedHorse) this.selectedEquipSlot = i;
                    else this.selectedEquipSlot = null; 
                    return true;
                }
            }
        }
        return inR(this.rect);
    }
    
    draw(playerRef) {
        if (!this.visible) return; this.updatePos();
        let sw = typeof SCREEN_WIDTH !== 'undefined' ? SCREEN_WIDTH : window.innerWidth;
        let sh = typeof SCREEN_HEIGHT !== 'undefined' ? SCREEN_HEIGHT : window.innerHeight;
        drawRect(0, 0, sw, sh, "rgba(0,0,0,0.4)", true, 0, 1, true);
        drawRect(this.x, this.y, this.w, this.h, COLORS.THEME_JADE_BG, true, 5, 1, true);
        drawRect(this.x, this.y, this.w, this.h, 0x0a1e23, false, 5, 4, true);

        drawRect(this.x, this.y, this.w, 40, 0x234b50, true, 5, 1, true); 
        let titleText = this.activeTab === 0 ? "TRANG BỊ" : "THÔNG TIN NHÂN VẬT";
        drawText(titleText, this.x + this.w/2, this.y + 20, 18, COLORS.THEME_TEXT_WHITE, "center", true, true);

        this.drawCloseBtn(this.closeBtn.x, this.closeBtn.y, this.closeBtn.w, this.closeBtn.h);

        if (this.activeTab === 0) {
            let names = ["Nón", "Áo", "Quần", "Nhẫn", "Vũ Khí", "Sách", "Ngựa"];
            for (let i=0; i<7; i++) {
                let sx = this.x + 30;
                let sy = this.y + 70 + i * 54;
                
                // Đồng bộ tọa độ vẽ Sách và Ngựa nằm dưới ô Vũ khí
                if (i === 6) { sx = this.x + 30 + 54; sy = this.y + 70 + 5 * 54; }

                drawRect(sx, sy, 42, 42, COLORS.THEME_SLOT_BG, true, 0, 1, true);
                drawRect(sx, sy, 42, 42, COLORS.THEME_SLOT_BORDER, false, 0, 1, true);
                
                if (i===4 && playerRef.equippedWeapon) {
                    let imgID = "lance"; let rot = -Math.PI/6; let f = undefined;
                    if (playerRef.equippedWeapon==="SCYTHE"){imgID="scythe"; rot=0;}
                    if (playerRef.equippedWeapon==="GUN"){imgID="gun"; rot=-Math.PI/6;}
                    if (playerRef.equippedWeapon==="POWER_FIST"){imgID="power-fist"; rot=0; f=undefined;}
                    
                    let bounds = getTextureBounds(imgID, f);
                    let scale = Math.min(36 / bounds.w, 36 / bounds.h);
                    drawSprite(imgID, sx+21, sy+21, {w: bounds.w * scale, h: bounds.h * scale, rotation: rot, isUI: true, frame: f});
                } 
                else if (i===5 && playerRef.equippedBook) {
                    let bounds = getTextureBounds("book", undefined);
                    let scale = Math.min(36 / bounds.w, 36 / bounds.h);
                    drawSprite("book", sx+21, sy+21, {w: bounds.w * scale, h: bounds.h * scale, isUI: true});
                }
                else if (i===6 && playerRef.equippedHorse) {
                    let bounds = getTextureBounds("horse", undefined);
                    let scale = Math.min(36 / bounds.w, 36 / bounds.h);
                    drawSprite("horse", sx+21, sy+21, {w: bounds.w * scale, h: bounds.h * scale, isUI: true});
                }
                else {
                    drawText(names[i], sx+21, sy+21, 10, "rgba(255, 255, 255, 0.3)", "center", false, true);
                }
                
                if (this.selectedEquipSlot === i) drawRect(sx-2, sy-2, 46, 46, 0xffff00, false, 2, 3, true);
            }
            if (this.selectedEquipSlot !== null) {
                drawRect(this.unequipBtnRect.x, this.unequipBtnRect.y, this.unequipBtnRect.w, this.unequipBtnRect.h, 0xd24628, true, 8, 1, true);
                drawText("GỠ BỎ", this.unequipBtnRect.x + this.unequipBtnRect.w/2, this.unequipBtnRect.y + 20, 16, "#fff", "center", true, true);
            }
            
            let oldUIGraphics = uiGraphics;
            uiGraphics = uiCharGraphics; 
            playerRef.drawUIPreview(this.x + this.w - 110, this.y + 220, 1.6);
            uiGraphics = oldUIGraphics;

        } else {
            let cx = this.x + 20; let cy = this.y + 70; let wf = this.w - 40;
            const drawBar = (y, cur, max, c) => {
                drawRect(cx+100, y-8, wf-100, 16, 0x0f1e23, true, 4, 1, true);
                if (cur>0) drawRect(cx+100, y-8, (wf-100)*(cur/max), 16, c, true, 4, 1, true);
                drawText(`${Math.floor(cur)}/${Math.floor(max)}`, cx+100+(wf-100)/2, y, 11, "#fff", "center", true, true);
            };
            drawText("Họ tên:", cx, cy+10, 14, "#8daab4", "left", false, true); drawText(playerRef.name, cx+70, cy+10, 16, COLORS.THEME_GOLD_ACTIVE, "left", true, true);
            drawText("Cấp độ:", cx+180, cy+10, 14, "#8daab4", "left", false, true); drawText(playerRef.level, cx+240, cy+10, 16, "#fff", "left", true, true);
            drawText("Sinh Lực (HP)", cx, cy+=40, 13, "#8daab4", "left", false, true); drawBar(cy, playerRef.hp, playerRef.maxHp, 0xc83232);
            drawText("Nội Lực (MP)", cx, cy+=35, 13, "#8daab4", "left", false, true); drawBar(cy, playerRef.mp, playerRef.maxMp, 0x3232c8);
            drawText("Thể Lực", cx, cy+=35, 13, "#8daab4", "left", false, true); drawBar(cy, playerRef.stamina, playerRef.maxStamina, 0x46c846);
            drawText("Kinh Nghiệm", cx, cy+=35, 13, "#8daab4", "left", false, true); drawBar(cy, playerRef.exp, playerRef.maxExp, 0xdcb432);
            
            drawText("Tấn công:", cx, cy+=50, 13, "#8daab4", "left", false, true);
            let powVal = 10 + (playerRef.equippedWeapon==="LANCE"?50:playerRef.equippedWeapon==="SCYTHE"?75:playerRef.equippedWeapon==="GUN"?110:playerRef.equippedWeapon==="POWER_FIST"?90:0);
            drawText(powVal, cx+70, cy, 14, "#fff", "left", true, true);

            let displayedSpeed = playerRef.speed;
            if (playerRef.equippedWeapon === "SCYTHE") displayedSpeed = 2.2; 
            drawText("Tốc độ:", cx+wf/2, cy, 13, "#8daab4", "left", false, true); drawText(displayedSpeed, cx+wf/2+60, cy, 14, "#fff", "left", true, true);
            
            // Các dòng code hiển thị Vũ Khí, Sách, và Ngựa đã được xoá đi
        }
    }
}

class SkillPanel extends BasePanel {
    constructor() { super(); this.visible = false; this.w = 360; this.h = 450; this.x = 0; this.y = 0; this.rect = {}; this.closeBtn = {}; }
    toggle() { this.visible = !this.visible; if(this.visible) this.updatePos(); }
    updatePos() { 
        let sw = typeof SCREEN_WIDTH !== 'undefined' ? SCREEN_WIDTH : window.innerWidth;
        let sh = typeof SCREEN_HEIGHT !== 'undefined' ? SCREEN_HEIGHT : window.innerHeight;
        this.w = Math.min(400, sw-40); this.x=(sw-this.w)/2; this.y=(sh-this.h)/2; this.rect={x:this.x,y:this.y,w:this.w,h:this.h}; this.closeBtn={x:this.x+this.w-30,y:this.y+8,w:22,h:22}; 
    }
    checkClick(mx, my) {
        if (!this.visible) return false;
        if (this.checkCloseClick(mx, my)) { this.visible = false; return true; }
        return mx >= this.rect.x && mx <= this.rect.x + this.rect.y && my >= this.rect.y && my <= this.rect.y + this.rect.h;
    }
    draw() {
        if (!this.visible) return; this.updatePos();
        let sw = typeof SCREEN_WIDTH !== 'undefined' ? SCREEN_WIDTH : window.innerWidth;
        let sh = typeof SCREEN_HEIGHT !== 'undefined' ? SCREEN_HEIGHT : window.innerHeight;
        drawRect(0, 0, sw, sh, "rgba(0,0,0,0.5)", true, 0, 1, true);
        drawRect(this.x, this.y, this.w, this.h, COLORS.THEME_JADE_BG, true, 8, 1, true);
        drawRect(this.x, this.y, this.w, 40, 0x234b50, true, 8, 1, true);
        drawText("KỸ NĂNG VŨ KHÍ", this.x+this.w/2, this.y+20, 18, COLORS.THEME_TEXT_WHITE, "center", true, true);
        this.drawCloseBtn(this.closeBtn.x, this.closeBtn.y, this.closeBtn.w, this.closeBtn.h);

        let cx = this.x + 20; let cy = this.y + 70; let cw = this.w - 40;
        if (player.equippedWeapon) {
            drawRect(cx, cy, cw, 100, COLORS.THEME_SLOT_BG, true, 5, 1, true); drawRect(cx, cy, cw, 100, COLORS.THEME_SLOT_BORDER, false, 5, 1, true);
            drawRect(cx+15, cy+18, 64, 64, 0x000000, true, 2, 1, true);
            let tx = cx+95;
            
            let normalSkillColorText = "#aaaaaa"; 
            let normalSkillColorBorder = 0xaaaaaa;
            
            if (player.equippedWeapon === "LANCE") {
                drawText("✒️", cx+47, cy+50, 42, "#ffffff", "center", false, true);
                drawRect(cx+15, cy+18, 64, 64, normalSkillColorBorder, false, 2, 2, true);
                drawText("Thọt", tx, cy+33, 18, normalSkillColorText, "left", true, true);
                drawText("Loại: Cận Chiến", tx, cy+56, 12, "#8daab4", "left", false, true);
                drawText("Tốc độ nhanh, sát thương thấp.", tx, cy+72, 12, "#fff", "left", false, true);
            } else if (player.equippedWeapon === "SCYTHE") {
                drawText("⛏️", cx+47, cy+50, 42, "#ffffff", "center", false, true);
                drawRect(cx+15, cy+18, 64, 64, normalSkillColorBorder, false, 2, 2, true);
                drawText("Chém", tx, cy+33, 18, normalSkillColorText, "left", true, true);
                drawText("Loại: Cận chiến", tx, cy+56, 12, "#8daab4", "left", false, true);
                drawText("Sát thương cao, tốc độ chậm.", tx, cy+72, 12, "#fff", "left", false, true);
            } else if (player.equippedWeapon === "GUN") {
                drawText("🔫", cx+47, cy+50, 42, "#ffffff", "center", false, true);
                drawRect(cx+15, cy+18, 64, 64, normalSkillColorBorder, false, 2, 2, true);
                drawText("Bắn", tx, cy+33, 18, normalSkillColorText, "left", true, true);
                drawText("Loại: Tầm xa", tx, cy+56, 12, "#8daab4", "left", false, true);
                drawText("Xả đạn từ xa, độ chính sát thấp.", tx, cy+72, 12, "#fff", "left", false, true);
            } else if (player.equippedWeapon === "POWER_FIST") {
                drawText("🥊", cx+47, cy+50, 42, "#ffffff", "center", false, true);
                drawRect(cx+15, cy+18, 64, 64, normalSkillColorBorder, false, 2, 2, true);
                drawText("Đấm", tx, cy+33, 18, normalSkillColorText, "left", true, true);
                drawText("Loại: Cận chiến", tx, cy+56, 12, "#8daab4", "left", false, true);
                drawText("Tung một cú đấm cực mạnh.", tx, cy+72, 12, "#fff", "left", false, true);
            }
            drawText("[Đang kích hoạt]", cx+cw-10, cy+85, 11, "#46c846", "right", true, true);
        } else drawText("Chưa trang bị vũ khí!", this.x+this.w/2, this.y+150, 16, "#ff5555", "center", true, true);
    }
}

class Joystick {
    constructor() {
        this.x = 65; 
        this.y = (typeof SCREEN_HEIGHT !== 'undefined' ? SCREEN_HEIGHT : window.innerHeight) - 120; 
        this.radius = 28; 
        this.visualBorderSize = 80; 
        this.visualKnobSize = 80;   
        this.knobX = this.x; this.knobY = this.y; 
        this.dragging = false; 
        this.vector = {x: 0, y: 0}; 
        this.touchId = null;
    }
    updatePos() { 
        let sh = typeof SCREEN_HEIGHT !== 'undefined' ? SCREEN_HEIGHT : window.innerHeight;
        this.y = sh - 120; 
        if(!this.dragging){
            this.knobX = this.x; 
            this.knobY = this.y + 1; 
        } 
    }
    handleStart(x, y, id) {
        if (Math.sqrt((x-this.x)**2 + (y-this.y)**2) < this.visualBorderSize) { 
            this.dragging = true; this.touchId = id; 
            this.handleMove(x, y); 
            return true; 
        } 
        return false;
    }
    handleMove(x, y) {
        if (!this.dragging) return;
        let dx = x - this.x; let dy = y - this.y; let dist = Math.sqrt(dx*dx + dy*dy);
        if (dist <= this.radius) { 
            this.knobX = x; this.knobY = y; 
        } else { 
            let ang = Math.atan2(dy, dx); 
            this.knobX = this.x + this.radius*Math.cos(ang); 
            this.knobY = this.y + this.radius*Math.sin(ang); 
        }
        this.vector.x = (this.knobX - this.x) / this.radius; 
        this.vector.y = (this.knobY - this.y) / this.radius;
    }
    handleEnd() { 
        this.dragging = false; 
        this.knobX = this.x; this.knobY = this.y; 
        this.vector = {x:0, y:0}; 
        this.touchId = null; 
    }
    draw() {
        this.updatePos();
        
        // Vẽ viền ngoài của Joystick (Ảnh phía trên - frame: 0)
        drawSprite("joystick_sheet", this.x, this.y, {
            w: this.visualBorderSize, h: this.visualBorderSize, 
            frame: 0, isUI: true, alpha: 0.8
        });
        
        // Vẽ nút điều khiển bên trong (Ảnh phía dưới - frame: 1)
        drawSprite("joystick_sheet", this.knobX, this.knobY + (this.dragging ? 0 : -1), {
            w: this.visualKnobSize, h: this.visualKnobSize, 
            frame: 1, isUI: true
        });
    }
}

class AttackButton {
    constructor() { 
        this.radius = 20; 
        this.x = 0; 
        this.y = 0; 
        this.pressed = false; 
        this.cooldown = 0; 
    }
    updatePos() { 
        let sw = typeof SCREEN_WIDTH !== 'undefined' ? SCREEN_WIDTH : window.innerWidth;
        let sh = typeof SCREEN_HEIGHT !== 'undefined' ? SCREEN_HEIGHT : window.innerHeight;
        this.x = sw - 60; 
        this.y = sh - 100; 
    }
    checkClick(x, y) {
        if (player && player.isSitting) return false;
        if (Math.sqrt((x - this.x)**2 + (y - this.y)**2) <= this.radius*2.5) { 
            this.pressed = true; setTimeout(() => this.pressed = false, 150);
            this.triggerAttack(); return true;
        } return false;
    }
    triggerAttack() {
        if (this.cooldown > 0) return;
        if (player.equippedWeapon === "LANCE") { 
            this.cooldown = 30; player.startAttack(); 
        } 
        else if (player.equippedWeapon === "SCYTHE") { 
            this.cooldown = 45; 
            player.startAttack(); 
            player.attackTimer = 30; 
        } 
        else if (player.equippedWeapon === "GUN") {
            this.cooldown = 15; 
            player.startAttack();
            let s = player.scale;
            let bulletY = player.y - 27 * s; 
            let bulletX = player.x + (65 * s * (player.facingRight ? 1 : -1));
            bullets.push(new Bullet(bulletX, bulletY, player.facingRight));
        } 
        else if (player.equippedWeapon === "POWER_FIST") {
            this.cooldown = 45; 
            player.startPowerFistAttack();
        }
        else { 
            this.cooldown = 12; 
            player.startPunchAttack();
        }
    }
    draw() {
        this.updatePos();
        if (this.cooldown > 0) this.cooldown--;
        let icon = "👊"; 
        if (player.equippedWeapon === "LANCE") icon = "✒️";
        else if (player.equippedWeapon === "SCYTHE") icon = "⛏️";
        else if (player.equippedWeapon === "GUN") icon = "🔫";
        else if (player.equippedWeapon === "POWER_FIST") icon = "🥊";

        let r = this.radius * 1.15; 
        if (this.pressed) r *= 0.9;
        drawCircle(this.x, this.y, r, COLORS.THEME_SLOT_BG, true, 1, true);
        drawCircle(this.x, this.y, r, COLORS.THEME_GOLD_ACTIVE, false, 2, true);
        drawText(icon, this.x, this.y, r * 1.2, "#ffffff", "center", false, true);
        if (this.cooldown > 0 || (player && player.isSitting)) {
            drawCircle(this.x, this.y, r, "rgba(0,0,0,0.6)", true, 1, true);
        }
    }
}

class DashButton {
    constructor() { this.radius = 12; this.x = 0; this.y = 0; this.pressed = false; }
    updatePos() { 
        let sw = typeof SCREEN_WIDTH !== 'undefined' ? SCREEN_WIDTH : window.innerWidth;
        let sh = typeof SCREEN_HEIGHT !== 'undefined' ? SCREEN_HEIGHT : window.innerHeight;
        this.y = sh - 72; 
        this.x = sw - 115; 
    }
    checkClick(x, y, player) {
        if (player && player.isSitting) return false;
        if (Math.sqrt((x - this.x)**2 + (y - this.y)**2) <= this.radius * 2.5) { 
            this.pressed = true; player.dash(joystick.vector.x, joystick.vector.y);
            setTimeout(() => this.pressed = false, 150); return true;
        } return false;
    }
    draw() {
        this.updatePos();
        let scale = this.pressed ? 0.9 : 1.0;
        let iconSize = 28 * scale;
        drawSprite("skill2", this.x, this.y, { w: iconSize, h: iconSize, frame: 1, isUI: true });
        if (player && player.isSitting) {
            drawCircle(this.x, this.y, this.radius * 1.2, "rgba(0,0,0,0.5)", true, 1, true);
        }
    }
}

class SitButton {
    constructor() { this.radius = 12; this.x = 0; this.y = 0; this.pressed = false; }
    updatePos() { 
        let sh = typeof SCREEN_HEIGHT !== 'undefined' ? SCREEN_HEIGHT : window.innerHeight;
        this.x = 115; 
        this.y = sh - 72; 
    }
    checkClick(x, y) {
        if (Math.sqrt((x - this.x)**2 + (y - this.y)**2) <= this.radius * 2.5) { 
            this.pressed = true; toggleSit();
            setTimeout(() => this.pressed = false, 150); return true;
        } return false;
    }
    draw() {
        this.updatePos();
        let scale = this.pressed ? 0.9 : 1.0;
        if (player && player.isSitting) scale = 1.1;
        let iconSize = 28 * scale;
        drawSprite("skill2", this.x, this.y, { w: iconSize, h: iconSize, frame: 0, isUI: true });
    }
}

class BottomHUD {
    constructor() { this.btns = {}; this.orbCenter = {hp: {}, mp: {}}; this.expRect = {}; this.staminaRect = {}; }
    updateLayout() {
        let sw = typeof SCREEN_WIDTH !== 'undefined' ? SCREEN_WIDTH : window.innerWidth;
        let sh = typeof SCREEN_HEIGHT !== 'undefined' ? SCREEN_HEIGHT : window.innerHeight;
        let cx = sw/2; let s = 35, gap = 6; let totW = s*4 + gap*3; let sx = cx - totW/2; let y = sh - 40;
        this.btns = { char: {x:sx,y:y,w:s,h:s}, bag: {x:sx+s+gap,y:y,w:s,h:s}, skill: {x:sx+(s+gap)*2,y:y,w:s,h:s}, quest: {x:sx+(s+gap)*3,y:y,w:s,h:s} };
        this.expRect = {x:sx-2, y:y-12, w:totW+4, h:4}; this.staminaRect = {x:sx-2, y:y-6, w:totW+4, h:4};
        this.orbCenter.hp = {x: sx-32, y: y+12}; this.orbCenter.mp = {x: sx+totW+32, y: y+12};
    }
    
    checkClick(mx, my, charP, invP, skillP) {
        let inR = (r) => mx>=r.x && mx<=r.x+r.w && my>=r.y && my<=r.y+r.h;
        if (inR(this.btns.char)) { invP.visible=false; skillP.visible=false; charP.toggle(0); return true; }
        if (inR(this.btns.bag)) { charP.visible=false; skillP.visible=false; invP.toggle(); return true; }
        if (inR(this.btns.skill)) { charP.visible=false; invP.visible=false; skillP.toggle(); return true; }
        return false;
    }
    
    drawSpriteBar(x, y, size, cur, max, rowIndex, totalCols) {
        let pct = Math.max(0, Math.min(1, cur / max));
        let colIndex = Math.round((1 - pct) * (totalCols - 1));
        let frameIndex = (rowIndex * totalCols) + colIndex;
        drawSprite("life_bar", x, y, {w: size, h: size, frame: frameIndex, isUI: true});
        drawText(`${Math.floor(pct * 100)}%`, x, y, 10, "#ffffff", "center", true, true);
    }
    draw(player) {
        this.updateLayout();
        drawLine(this.orbCenter.hp.x, this.orbCenter.hp.y, this.expRect.x, this.expRect.y+2, 0x461414, 2, true);
        drawLine(this.orbCenter.mp.x, this.orbCenter.mp.y, this.expRect.x+this.expRect.w, this.expRect.y+2, 0x141446, 2, true);
        drawRect(this.expRect.x, this.expRect.y, this.expRect.w, this.expRect.h, 0x1e1919, true, 2, 1, true);
        if(player.exp>0) drawRect(this.expRect.x, this.expRect.y, this.expRect.w*(player.exp/player.maxExp), this.expRect.h, 0xdcb432, true, 2, 1, true);
        drawRect(this.staminaRect.x, this.staminaRect.y, this.staminaRect.w, this.staminaRect.h, 0x1e1919, true, 2, 1, true);
        if(player.stamina>0) drawRect(this.staminaRect.x, this.staminaRect.y, this.staminaRect.w*(player.stamina/player.maxStamina), this.staminaRect.h, 0x46c846, true, 2, 1, true);

        let totalCols = 15; 
        this.drawSpriteBar(this.orbCenter.hp.x, this.orbCenter.hp.y, 55, player.hp, player.maxHp, 4, totalCols); 
        drawSprite("glass_ball", this.orbCenter.hp.x, this.orbCenter.hp.y, {w: 55, h: 55, frame: 2, isUI: true});
        this.drawSpriteBar(this.orbCenter.mp.x, this.orbCenter.mp.y, 55, player.mp, player.maxMp, 5, totalCols);
        drawSprite("glass_ball", this.orbCenter.mp.x, this.orbCenter.mp.y, {w: 55, h: 55, frame: 2, isUI: true});

        let b = this.btns; 
        let emojiSize = 24; 
        drawText("🙂", Math.round(b.char.x+b.char.w/2), Math.round(b.char.y+b.char.h/2), emojiSize, "#ffffff", "center", false, true);
        drawText("🎒", Math.round(b.bag.x+b.bag.w/2), Math.round(b.bag.y+b.bag.h/2), emojiSize, "#ffffff", "center", false, true);
        drawText("📘", Math.round(b.skill.x+b.skill.w/2), Math.round(b.skill.y+b.skill.h/2), emojiSize, "#ffffff", "center", false, true);
        drawText("📜", Math.round(b.quest.x+b.quest.w/2), Math.round(b.quest.y+b.quest.h/2), emojiSize, "#ffffff", "center", false, true);
    }
}

class PlayerAvatar {
    constructor() {
        this.x = 32;       
        this.y = 32;       
        this.radius = 22;  
    }

    checkClick(mx, my, charPanelRef) {
        if (Math.sqrt((mx - this.x)**2 + (my - this.y)**2) <= this.radius * 1.5) {
            charPanelRef.toggle(1); 
            return true;
        }
        return false;
    }

    draw(playerRef) {
        if (!playerRef) return;
        drawSprite("avatar", this.x, this.y, { w: 60, h: 60, isUI: true });
        let badgeX = this.x + 19;
        let badgeY = this.y + 19;
        drawCircle(badgeX, badgeY, 9, 0xd24628, true, 1, true); 
        drawCircle(badgeX, badgeY, 9, 0xffffff, false, 1.5, true); 
        drawText(playerRef.level.toString(), badgeX, badgeY, 10, "#ffffff", "center", true, true);
    }
}
