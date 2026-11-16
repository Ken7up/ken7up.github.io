class FloatingText {
    constructor(x, y, text, color) {
        this.x = x; this.y = y; this.text = text; this.color = color;
        this.life = 60; this.vy = -2;   
    }
    update() {
        this.x += (Math.random() - 0.5) * 1; 
        this.y += this.vy;
        this.vy *= 0.9; 
        this.life--;
    }
    draw() {
        let alpha = Math.max(0, this.life / 60);
        let tColor = (typeof this.color === 'string' && this.color.startsWith('#')) ? this.color : '#ffffff';
        drawText(this.text, this.x, this.y, 20, tColor, "center", true, false, true);
        if(textGamePoolCount > 0) textGamePool[textGamePoolCount-1].setAlpha(alpha);
    }
}

class Bullet {
    constructor(x, y, isRight) {
        this.x = x; this.y = y; this.speed = 18; 
        this.vx = isRight ? this.speed : -this.speed;
        this.life = 45; this.size = 5; 
    }
    update() { this.x += this.vx; this.life--; }
    draw() {
        drawCircle(this.x, this.y, this.size, 0xffe600, true); 
        drawCircle(this.x, this.y, this.size - 2, 0xffffff, true); 
        drawCircle(this.x, this.y, this.size, 0xff7b00, false, 1.5);
        drawLine(this.x, this.y, this.x - this.vx * 2, this.y, "rgba(255, 230, 0, 0.6)", 4);
    }
}

class Stickman {
    constructor(x, y) {
        this.x = x; this.y = y; this.name = "Ken";
        this.speed = 3.5; this.animTimer = 0; this.scale = 0.6; 
        this.facingRight = true; this.leanAngle = 0; this.strideIntensity = 0;
        this.equippedWeapon = null; this.isAttacking = false; this.attackTimer = 0;
        
        this.unarmedAttackTimer = 0;
        this.punchSide = 'LEFT'; 
        this.punchProgress = 0; 

        this.level = 1; this.exp = 0; this.maxExp = 200;
        this.maxHp = 1000; this.hp = 1000; this.mp = 1000; this.maxMp = 1000;
        this.stamina = 100; this.maxStamina = 100;
        this.isDashing = false; this.dashTimer = 0; this.dashVec = {x: 0, y: 0};
        this.isSitting = false; this.sitTimer = 0;
    }
    dash(dx, dy) {
        if (this.isSitting) return;

        if (this.stamina >= 10 && !this.isDashing) {
            this.stamina -= 10; this.isDashing = true; this.dashTimer = 10;
            if (Math.abs(dx) > 0.1 || Math.abs(dy) > 0.1) this.dashVec = {x: dx, y: dy};
            else this.dashVec = {x: this.facingRight ? 1 : -1, y: 0};
        }
    }
    startAttack() { 
        if (this.isSitting) return; 
        this.isAttacking = true; this.attackTimer = 15; 
    }
    
    startPowerFistAttack() {
        if (this.isSitting) return;
        this.isAttacking = true;
        this.attackTimer = 30; // 30 frames cho 1 cú đấm mạnh
    }

    startPunchAttack() {
        if (this.isSitting) return; 
        this.isAttacking = true;
        this.unarmedAttackTimer = 10; 
        this.attackTimer = 10;
        this.punchSide = (this.punchSide === 'LEFT') ? 'RIGHT' : 'LEFT';
        
        let hits = ["Bốp!", "Binh!", "Chát!", "Bùm!"];
        let randomHit = hits[Math.floor(Math.random() * hits.length)];
        let punchX = this.x + (this.facingRight ? 35 : -35);
        floatingTexts.push(new FloatingText(punchX, this.y - 45, randomHit, "#ffcc00"));
    }

    update(dx, dy) {
        if (this.isSitting) {
            if (Math.abs(dx) > 0.1 || Math.abs(dy) > 0.1) { this.isSitting = false; this.sitTimer = 0; }
            else {
                this.sitTimer += 1/60; 
                if (this.sitTimer >= 10) {
                    let oldHp = this.hp;
                    let oldMp = this.mp;
                    let oldStamina = this.stamina;

                    // Hồi phục chỉ số
                    this.hp = Math.min(this.hp + 100, this.maxHp); 
                    this.mp = Math.min(this.mp + 100, this.maxMp);
                    this.stamina = Math.min(this.stamina + 10, this.maxStamina);
                    
                    // Hiển thị text bay lên cho từng chỉ số
                    if (this.hp > oldHp) {
                        floatingTexts.push(new FloatingText(this.x, this.y - 60, `+${this.hp - oldHp} HP`, "#00ff00"));
                    }
                    if (this.mp > oldMp) {
                        floatingTexts.push(new FloatingText(this.x, this.y - 80, `+${this.mp - oldMp} MP`, "#00ffff"));
                    }
                    if (this.stamina > oldStamina) {
                        floatingTexts.push(new FloatingText(this.x, this.y - 100, `+${this.stamina - oldStamina} Năng lượng`, "#ffcc00"));
                    }
                    
                    this.sitTimer = 0; 
                } return;
            }
        }

        // Logic lướt/co giật vật lý khi dùng Power Fist
        if (this.isAttacking && this.equippedWeapon === "POWER_FIST") {
            let pDir = this.facingRight ? 1 : -1;
            
            if (this.attackTimer > 20) {
                // Giai đoạn 1 (Tụ lực - kéo tay về sau): Giật nhẹ cơ thể về sau lấy đà
                this.x -= pDir * 1.5;
            } else if (this.attackTimer > 10 && this.attackTimer <= 20) {
                // Giai đoạn 2 (Tung đấm cực mạnh): Cơ thể lướt nhanh về phía trước để tăng độ uy lực
                this.x += pDir * 10; 
            } else {
                // Giai đoạn 3 (Thu thế): Cơ thể giảm tốc độ, hãm phanh nhẹ
                this.x += pDir * 1.5;
            }
        }

        if (this.isDashing) {
            this.x += this.dashVec.x * 15; this.y += this.dashVec.y * 15;
            
            this.x = Math.max(20, Math.min(this.x, WORLD_WIDTH - 20));
            this.y = Math.max(20, Math.min(this.y, WORLD_HEIGHT - 20));
            
            this.dashTimer--; if (this.dashTimer <= 0) this.isDashing = false; return; 
        }

        let currentSpeed = this.speed;
        if (this.equippedWeapon === "SCYTHE") currentSpeed = 2.2; 
        
        this.x += dx * currentSpeed; this.y += dy * currentSpeed;
        
        this.x = Math.max(20, Math.min(this.x, WORLD_WIDTH - 20));
        this.y = Math.max(20, Math.min(this.y, WORLD_HEIGHT - 20));
        
        if (dx > 0.1) this.facingRight = true; else if (dx < -0.1) this.facingRight = false;

        let isMoving = (Math.abs(dx) > 0.1 || Math.abs(dy) > 0.1);
        this.leanAngle += ((isMoving ? dx * 12 : 0) - this.leanAngle) * 0.1;
        this.strideIntensity += ((isMoving ? 1.0 : 0.0) - this.strideIntensity) * 0.1;

        let animSpeed = isMoving ? 0.2 : 0.05;
        if (isMoving && this.equippedWeapon === "SCYTHE") animSpeed = 0.13; 
        this.animTimer += animSpeed;

        if (this.isAttacking) { 
            this.attackTimer--; 
            if (this.unarmedAttackTimer > 0) {
                this.unarmedAttackTimer--;
                let halfLife = 5;
                if (this.unarmedAttackTimer > halfLife) {
                    this.punchProgress = (10 - this.unarmedAttackTimer) / halfLife; 
                } else {
                    this.punchProgress = this.unarmedAttackTimer / halfLife; 
                }
            }
            if (this.attackTimer <= 0) {
                this.isAttacking = false;
                this.unarmedAttackTimer = 0;
                this.punchProgress = 0;
            }
        }
    }

    drawPowerFistPiece(x, y, scale, facingRight, isUI=false) {
        // Vẽ bao tay đơn duy nhất (đã bỏ logic frame)
        let bounds = getTextureBounds("power-fist");
        
        let drawW = 100 * scale; 
        let drawH = 100 * (bounds.h / bounds.w) * scale;

        let rot = 0;
        let sx = facingRight ? 1 : -1;
        
        let d = isUI ? 155 : 15; // Luôn vẽ đè lên trên nhân vật (tay ngoài)

        if (this.isAttacking) {
            rot = facingRight ? 0 : 0; 
        } else {
            rot = facingRight ? 0.3 : -0.3; 
        }

        let finalX = x;
        let finalY = y;
        if (!this.isAttacking) {
            finalY += 4 * scale; // Trễ tay xuống 1 chút khi đứng yên
        }

        drawSprite("power-fist", finalX, finalY, {
            w: drawW, h: drawH,
            rotation: rot, scaleX: sx, isUI: isUI, depth: d,
            originX: 0.3, originY: 0.5 
        });
    }

    drawBronzeFistPiece(x, y, scale, facingRight, isUI=false) {
        // Placeholder nếu có thêm vũ khí
    }

    drawLance(x, y, scale, type, facingRight, isUI=false) {
        let img = mainScene.textures.get("lance").getSourceImage();
        const w = 140 * scale; const h = 140 * (img.height/img.width) * scale;
        let rot = 0, sx = 1;
        let finalX = x, finalY = y;
        let d = 15;

        if (type === "BACK") { 
            rot = facingRight ? -Math.PI / 4 : Math.PI / 4; 
            sx = facingRight ? 1 : -1;
            d = 5; 
        }
        else if (type === "HAND") {
            if (this.isAttacking) {
                sx = facingRight ? -1 : 1; 
                let recoil = (this.attackTimer > 10) ? 5 : 0;
                let offset = w * 0.4; 
                finalX += facingRight ? (offset - recoil) : -(offset - recoil);
                
                let tipX = finalX + (facingRight ? w * 0.5 : -w * 0.5);
                if (!isUI) {
                    let alpha = this.attackTimer / 15;
                    drawLine(tipX, y, tipX + (facingRight?60:-60)*scale, y, `rgba(255,255,255,${alpha})`, 2*scale);
                }
            } else {
                rot = facingRight ? -Math.PI/3 : Math.PI/3;
                sx = facingRight ? 1 : -1;
                finalY += h * 0.05; 
            }
        }
        drawSprite("lance", finalX, finalY, {w: w, h: h, rotation: rot, scaleX: sx, isUI: isUI, depth: d});
    }

    drawScythe(x, y, scale, type, facingRight, isUI=false) {
        let img = mainScene.textures.get("scythe").getSourceImage();
        const w = 140 * scale; const h = 140 * (img.height/img.width) * scale;
        let rot = 0, sx = facingRight ? 1 : -1;
        let d = 15;
        let oX = 0.5, oY = 0.5;

        if (type === "BACK") { rot = 0; d = 5; }
        else if (type === "HAND") {
            oX = 0.7; oY = 0.6; 
            if (this.isAttacking) {
                let progress = 1 - (this.attackTimer / 30);
                let startAngle = -Math.PI * 0.95; 
                let endAngle = Math.PI * 0.55; 
                rot = startAngle + (endAngle - startAngle) * progress;
                if (!facingRight) rot = -rot; 
                
                if (!isUI && this.attackTimer > 5 && this.attackTimer < 25) {
                    let alpha = (this.attackTimer) / 30 * 0.4;
                    let trailR = 48 * scale;
                    for(let step = 0; step < 4; step++) {
                        let tPct = progress - (step * 0.08);
                        if (tPct < 0) break;
                        let tAngle = startAngle + (endAngle - startAngle) * tPct;
                        let swingRot = facingRight ? tAngle : -tAngle;
                        let tx = x + Math.cos(swingRot - Math.PI / 2) * trailR;
                        let ty = y + Math.sin(swingRot - Math.PI / 2) * trailR;
                        drawCircle(tx, ty, (5 - step) * scale, `rgba(162, 213, 242, ${alpha * (1 - step*0.2)})`, true, 1, false);
                    }
                }
            } else {
                rot = facingRight ? (-Math.PI + 0.45) : (Math.PI - 0.45);
                if (this.strideIntensity > 0.1) {
                    let swingAngle = Math.cos(this.animTimer) * 0.3 * this.strideIntensity;
                    rot -= swingAngle;
                }
            }
        }
        
        drawSprite("scythe", x, y, { w: w, h: h, rotation: rot, scaleX: sx, isUI: isUI, depth: d, originX: oX, originY: oY });
    }

    drawGun(x, y, scale, type, facingRight, isMoving, isUI=false) {
        let tex = mainScene.textures.get("gun");
        let src = tex.getSourceImage();
        let fw = src ? src.width : 250;
        let fh = src ? src.height : 80;
        
        const w = 150 * scale; const h = 150 * (fh / fw) * scale;
        let rot = 0, sx = facingRight ? 1 : -1;
        let finalX = x, finalY = y;
        let d = 15;
        let oX = 0.5, oY = 0.5;

        if (type === "BACK") {
            sx = facingRight ? 1 : -1; 
            rot = facingRight ? -Math.PI/3 : Math.PI/3;
            d = 5;
            oX = 0.5; oY = 0.5;
        } else if (type === "HAND") {
            if (this.isAttacking) {
                sx = facingRight ? 1 : -1;
                oX = 0.25; oY = 0.55;
                
                let recoilProgress = Math.sin((this.attackTimer / 15) * Math.PI);
                let recoilX = -12 * scale * recoilProgress;
                let recoilRot = -0.06 * recoilProgress * (facingRight ? 1 : -1);
                
                rot = recoilRot;
                finalX += facingRight ? recoilX : -recoilX;
                
                if (this.attackTimer > 10 && !isUI) {
                    let muzzleX = finalX + (w * 0.7 * (facingRight ? 1 : -1));
                    let muzzleY = finalY - (6.5 * scale);
                    drawCircle(muzzleX, muzzleY, 10 * scale, "rgba(255, 180, 0, 0.8)", true, 1, false);
                    drawCircle(muzzleX, muzzleY, 5 * scale, "rgba(255, 255, 255, 0.95)", true, 1, false);
                    drawLine(muzzleX, muzzleY, muzzleX + (facingRight ? 35 : -35) * scale, muzzleY, "#ffffff", 4 * scale, false);
                }
            } else {
                sx = facingRight ? -1 : 1; 
                oX = 0.35; oY = 0.5;
                rot = facingRight ? (-Math.PI / 10) : (Math.PI / 10);
                
                finalY -= 4 * scale;
                finalX -= 8 * scale * (facingRight ? 1 : -1);

                if (isMoving) {
                    let bobAmt = Math.sin(this.animTimer * 2) * 0.05 * (facingRight ? 1 : -1);
                    rot += bobAmt;
                    finalY += Math.cos(this.animTimer * 2) * 1.5 * scale;
                }
            }
        }
        
        drawSprite("gun", finalX, finalY, { w: w, h: h, rotation: rot, scaleX: sx, isUI: isUI, depth: d, originX: oX, originY: oY });
    }

    _drawInternal(cx, cy, s, t, facingRight, leanAngle, strideIntensity, isUI=false) {
        let shadowY = cy + (this.isSitting ? 33*s : 34*s); 
        let g = isUI ? uiCharGraphics : mainScene.charLayer;
        g.fillStyle(0x000000, 0.15);
        g.fillEllipse(cx, shadowY, 36*s, 14*s); 

        let walkDir = facingRight ? 1 : -1; let color = COLORS.INK_BLACK;
        let isMoving = strideIntensity > 0.1; 
        let breathY = (!isMoving && !this.isSitting && !this.isAttacking) ? Math.sin(Date.now() / 250) * 1.5 * s : 0;
        let runBob = (Math.sin(t)**2) * 4 * s * strideIntensity;
        
        let hipX = cx, hipY = cy + runBob;
        let shoulderX = cx + leanAngle; let shoulderY = cy - 25 * s + runBob + breathY;
        let headX = shoulderX + leanAngle * 0.2; let headY = shoulderY - 15 * s;
        let handLX = cx, handLY = cy, handRX = cx, handRY = cy;
        let armLen = 30 * s; let legLen = 35 * s; let kneeDir = facingRight ? -1 : 1;

        if (this.isSitting) {
            let dir = facingRight ? 1 : -1;
            let sitY = cy + 28 * s;
            let sitHipX = cx; let sitHipY = sitY;
            let sitShoulderX = sitHipX - dir * 8 * s; let sitShoulderY = sitHipY - 24 * s; 
            
            // Đã xóa hiệu ứng magic-circle ở đây

            if (this.equippedWeapon === "LANCE") this.drawLance(sitShoulderX, sitShoulderY + 10*s, s, "BACK", facingRight, isUI);
            else if (this.equippedWeapon === "SCYTHE") this.drawScythe(sitShoulderX, sitShoulderY + 5*s, s, "BACK", facingRight, isUI);
            else if (this.equippedWeapon === "GUN") this.drawGun(sitShoulderX, sitShoulderY + 5*s, s, "BACK", facingRight, false, isUI);

            let kneeLX = sitHipX + dir * 16 * s; let kneeLY = sitHipY + 2 * s; 
            let footLX = sitHipX + dir * 32 * s; let footLY = sitHipY + 4 * s; 

            drawLine(sitHipX, sitHipY, kneeLX, kneeLY, color, 3, isUI);
            drawCircle(kneeLX, kneeLY, 1.5, color, true, 1, isUI);
            drawLine(kneeLX, kneeLY, footLX, footLY, color, 3, isUI);
            drawCircle(footLX, footLY, 1.5, color, true, 1, isUI);

            let kneeRX = sitHipX + dir * 12 * s; let kneeRY = sitHipY - 12 * s;       
            let footRX = sitHipX + dir * 26 * s; let footRY = sitHipY + 4 * s; 

            drawLine(sitHipX, sitHipY, kneeRX, kneeRY, color, 3, isUI);
            drawCircle(kneeRX, kneeRY, 1.5, color, true, 1, isUI);
            drawLine(kneeRX, kneeRY, footRX, footRY, color, 3, isUI);
            drawCircle(footRX, footRY, 1.5, color, true, 1, isUI);

            drawLine(sitHipX, sitHipY, sitShoulderX, sitShoulderY, color, 3, isUI);
            
            let handLX_sit = sitShoulderX - dir * 10 * s; let handLY_sit = sitHipY + 2 * s;
            let handRX_sit = kneeRX + dir * 2 * s; let handRY_sit = kneeRY - 2 * s; 
            
            drawLimb([sitShoulderX, sitShoulderY], [handLX_sit, handLY_sit], armLen, color, dir, 3, isUI); 
            drawLimb([sitShoulderX, sitShoulderY], [handRX_sit, handRY_sit], armLen, color, dir, 3, isUI); 
            drawCircle(sitShoulderX + dir * 1.5 * s, sitShoulderY - 12*s, 10*s, color, false, 3, isUI); 

            if (this.equippedWeapon === "POWER_FIST") {
                this.drawPowerFistPiece(handRX_sit, handRY_sit, s, facingRight, isUI);
            }
        } else {
            let strideW = Math.cos(t) * 16 * s * walkDir * strideIntensity;
            let lift = Math.sin(t) * 8 * s * strideIntensity;
            let footLX = cx + strideW; let footLY = cy + 30 * s + (strideIntensity > 0.1 ? Math.min(0, lift) : 0);
            let footRX = cx - strideW; let footRY = cy + 30 * s + (strideIntensity > 0.1 ? Math.min(0, -lift) : 0);
            
            if (strideIntensity < 0.05) { 
                let dir = facingRight ? 1 : -1;
                footLX = cx - dir * 4 * s; footRX = cx + dir * 6 * s; footLY = footRY = cy + 34 * s; 
            }

            drawLimb([hipX, hipY], [footRX, footRY], legLen, color, kneeDir, 3, isUI);
            drawLimb([hipX, hipY], [footLX, footLY], legLen, color, kneeDir, 3, isUI);
            drawLine(hipX, hipY, shoulderX, shoulderY, color, 3, isUI);

            if (this.equippedWeapon === "LANCE" && this.isAttacking) {
                let angleVal = Math.PI / 4; let maxReach = 50 * s; 
                let currentReach = maxReach * (this.attackTimer <= 10 ? (0.5 + 0.5*(this.attackTimer/10)) : 1);
                let dx = currentReach * Math.cos(angleVal); let dy = currentReach * Math.sin(angleVal); 
                handRX = shoulderX + (facingRight ? dx : -dx); handRY = shoulderY + dy; 
                handLX = shoulderX + (facingRight ? -10*s : 10*s); handLY = shoulderY + 15 * s;
            } else if (this.equippedWeapon === "SCYTHE" && this.isAttacking) {
                let progress = 1 - (this.attackTimer / 30);
                let startAngle = -Math.PI * 0.95; let endAngle = Math.PI * 0.55;
                let rot = startAngle + (endAngle - startAngle) * progress;
                let actualRot = facingRight ? rot : -rot;
                
                let dx = Math.cos(actualRot - Math.PI / 2) * 26 * s; let dy = Math.sin(actualRot - Math.PI / 2) * 26 * s;

                handRX = shoulderX + dx; handRY = shoulderY + dy;
                
                if (!isMoving) { handLX = shoulderX + (facingRight ? -5 * s : 5 * s); handLY = shoulderY + 25 * s; } 
                else { handLX = shoulderX + (facingRight ? -12 * s : 12 * s); handLY = shoulderY + 18 * s; }
                
            } else if (this.equippedWeapon === "GUN") {
                let pDir = facingRight ? 1 : -1;
                if (this.isAttacking) {
                    let recoilEffect = Math.sin((this.attackTimer / 15) * Math.PI) * 4 * s;
                    handRX = shoulderX + (28 * s - recoilEffect) * pDir; handRY = shoulderY + 5 * s; 
                    handLX = shoulderX + (42 * s - recoilEffect) * pDir; handLY = shoulderY + 8 * s;
                } else {
                    handRX = shoulderX + 10 * s * pDir; handRY = shoulderY + 2 * s; 
                    if (isMoving) {
                        let armSwing = Math.cos(t) * 14 * s * strideIntensity;
                        handLX = shoulderX - armSwing - 4 * s * pDir; handLY = shoulderY + 18 * s;
                    } else {
                        handLX = shoulderX - 4 * s * pDir; handLY = shoulderY + 24 * s;
                    }
                }
            } else if (this.equippedWeapon === "POWER_FIST") {
                let pDir = facingRight ? 1 : -1;
                if (this.isAttacking) {
                    // Cú đấm thép tụ lực và vươn tới
                    let progress = 0;
                    if (this.attackTimer > 20) {
                        // Tụ lực: Kéo sâu tay ra sau một cách cân đối
                        progress = (30 - this.attackTimer) / 10 * -0.55; 
                    } else if (this.attackTimer > 10) {
                        // Đấm vươn ra (Được giới hạn tối đa ở mức 0.85 để giữ khuỷu tay cong nhẹ tự nhiên, không bao giờ bị duỗi dãn cơ thể)
                        progress = (20 - this.attackTimer) / 10 * 0.85; 
                    } else {
                        // Thu tay về
                        progress = (this.attackTimer) / 10 * 0.85;
                    }

                    // Tay trong (BACK) đưa ra sau làm điểm tựa thăng bằng
                    handLX = shoulderX - 6 * s * pDir; 
                    handLY = shoulderY + 12 * s;
                    
                    // Tay ngoài (FRONT) đấm vút tới với độ dài được giới hạn (tối đa ~33px so với vai)
                    handRX = shoulderX + (12 * s + progress * 24 * s) * pDir;
                    handRY = shoulderY + 10 * s;

                } else {
                    // Đứng yên hoặc di chuyển bình thường
                    handRX = shoulderX + 10 * s * pDir;
                    handRY = shoulderY + 12 * s;
                    if (isMoving) {
                        let armSwing = Math.cos(t) * 14 * s * strideIntensity;
                        handLX = shoulderX - armSwing - 4 * s * pDir; handLY = shoulderY + 18 * s;
                        handRX = shoulderX + armSwing + 10 * s * pDir;
                    } else {
                        handLX = shoulderX - 4 * s * pDir; handLY = shoulderY + 14 * s;
                    }
                }
            } else if (!this.equippedWeapon && this.isAttacking && this.unarmedAttackTimer > 0) {
                let punchDist = 32 * s * this.punchProgress;
                let punchDir = facingRight ? 1 : -1;
                if (this.punchSide === 'LEFT') {
                    handLX = shoulderX + punchDir * (25 * s + punchDist); handLY = shoulderY + 2 * s; 
                    handRX = shoulderX + punchDir * (-10 * s); handRY = shoulderY + 12 * s;
                    if (!isUI) { let windAlpha = this.punchProgress * 0.4; drawLine(shoulderX, handLY, handLX + punchDir * 10 * s, handLY, `rgba(162, 213, 242, ${windAlpha})`, 2 * s); }
                } else {
                    handRX = shoulderX + punchDir * (25 * s + punchDist); handRY = shoulderY + 2 * s;
                    handLX = shoulderX + punchDir * (-10 * s); handLY = shoulderY + 12 * s;
                    if (!isUI) { let windAlpha = this.punchProgress * 0.4; drawLine(shoulderX, handRY, handRX + punchDir * 10 * s, handRY, `rgba(162, 213, 242, ${windAlpha})`, 2 * s); }
                }
            } else {
                let armSwing = Math.cos(t) * 15 * s * strideIntensity;

                if (this.equippedWeapon === "LANCE") {
                    handRX = shoulderX + (facingRight ? -30*s : 30*s); handRY = shoulderY + 5*s;
                    handLX = shoulderX + (facingRight ? 20*s : -20*s); handLY = shoulderY + 15 * s;
                } else if (this.equippedWeapon === "SCYTHE") {
                    let ruleArmSwing = Math.cos(t) * 10 * s * strideIntensity;
                    handRX = shoulderX + (facingRight ? -15*s : 15*s) + ruleArmSwing; handRY = shoulderY + 22 * s; 
                    handLX = shoulderX + (facingRight ? 15*s : -15*s); handLY = shoulderY + 24 * s;
                } else if (isMoving) {
                    handLX = shoulderX + armSwing * 1.2 + 2*s*walkDir; handLY = shoulderY + 14 * s;
                    handRX = shoulderX - armSwing * 1.2 - 2*s*walkDir; handRY = shoulderY + 14 * s;
                } else {
                    let dir = facingRight ? 1 : -1;
                    handLX = shoulderX - dir * 3 * s; handRX = shoulderX + dir * 5 * s; handLY = handRY = shoulderY + 28 * s;
                }
            }

            drawLimb([shoulderX, shoulderY], [handRX, handRY], armLen, color, -kneeDir, 3, isUI); 
            drawLimb([shoulderX, shoulderY], [handLX, handLY], armLen, color, -kneeDir, 3, isUI); 
            drawCircle(headX, headY, 10 * s, color, false, 3, isUI); 
        }

        if (!this.isSitting && (isMoving || this.isAttacking || !isMoving)) {
            if (this.equippedWeapon === "LANCE") this.drawLance(handRX, handRY, s, "HAND", facingRight, isUI);
            else if (this.equippedWeapon === "SCYTHE") this.drawScythe(handRX, handRY, s, "HAND", facingRight, isUI);
            else if (this.equippedWeapon === "GUN") this.drawGun(handRX, handRY, s, "HAND", facingRight, isMoving, isUI);
            else if (this.equippedWeapon === "POWER_FIST") {
                // CHỈ VẼ 1 BAO TAY PHÍA NGOÀI (TAY TRƯỚC)
                this.drawPowerFistPiece(handRX, handRY, s, facingRight, isUI);
            }
        }
    }
    
    draw() { this._drawInternal(this.x, this.y, this.scale, this.animTimer, this.facingRight, this.leanAngle, this.strideIntensity, false); }
    
    drawUIPreview(x, y, scale) { 
        let oldSit = this.isSitting;
        this.isSitting = true; 
        this._drawInternal(x, y, scale, Date.now()/500, true, 0, 0, true); 
        this.isSitting = oldSit;
    }
}