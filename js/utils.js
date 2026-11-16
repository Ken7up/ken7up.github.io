function parseColor(colorStr) {
    if (typeof colorStr === 'number') return { color: colorStr, alpha: 1 };
    if (!colorStr) return { color: 0xffffff, alpha: 1 };
    if (colorStr.startsWith('#')) {
        let hex = colorStr.slice(1);
        if (hex.length === 3) hex = hex[0]+hex[0]+hex[1]+hex[1]+hex[2]+hex[2];
        return { color: parseInt(hex, 16), alpha: 1 };
    }
    if (colorStr.startsWith('rgba')) {
        let parts = colorStr.match(/[\d.]+/g);
        return { color: (parseInt(parts[0])<<16) + (parseInt(parts[1])<<8) + parseInt(parts[2]), alpha: parseFloat(parts[3]) };
    }
    return { color: 0xffffff, alpha: 1 };
}

function drawLine(x1, y1, x2, y2, color, width=1, isUI=false) {
    let g = isUI ? uiGraphics : gameGraphics;
    let c = parseColor(color);
    g.lineStyle(width, c.color, c.alpha);
    g.beginPath(); g.moveTo(x1, y1); g.lineTo(x2, y2); g.strokePath();
}

function drawCircle(x, y, radius, color, isFilled=true, lineWidth=1, isUI=false) {
    let g = isUI ? uiGraphics : gameGraphics;
    let c = parseColor(color);
    g.beginPath();
    if (isFilled) { g.fillStyle(c.color, c.alpha); g.fillCircle(x, y, radius); } 
    else { g.lineStyle(lineWidth, c.color, c.alpha); g.strokeCircle(x, y, radius); }
}

function drawRect(x, y, w, h, color, isFilled=true, radius=0, lineWidth=1, isUI=false) {
    let g = isUI ? uiGraphics : gameGraphics;
    let c = parseColor(color);
    g.beginPath();
    if (isFilled) {
        g.fillStyle(c.color, c.alpha);
        if (radius > 0) g.fillRoundedRect(x, y, w, h, radius); else g.fillRect(x, y, w, h);
    } else {
        g.lineStyle(lineWidth, c.color, c.alpha);
        if (radius > 0) g.strokeRoundedRect(x, y, w, h, radius); else g.strokeRect(x, y, w, h);
    }
}

function drawLimb(start, end, length, color, bendDir=1, width=3, isUI=false) {
    let g = isUI ? uiGraphics : gameGraphics;
    let c = parseColor(color);
    let [x1, y1] = start; let [x2, y2] = end;
    let dist = Math.sqrt((x2 - x1)**2 + (y2 - y1)**2);
    dist = Math.min(dist, length);
    let midX = (x1 + x2) / 2; let midY = (y1 + y2) / 2;
    let bendAmount = (length > dist) ? Math.sqrt((length/2)**2 - (dist/2)**2) : 0;
    let dx = x2 - x1; let dy = y2 - y1;
    let perpX = -dy / dist; let perpY = dx / dist;
    let jointX = midX + perpX * bendAmount * bendDir;
    let jointY = midY + perpY * bendAmount * bendDir;

    g.lineStyle(width, c.color, c.alpha);
    g.beginPath(); g.moveTo(x1, y1); g.lineTo(jointX, jointY); g.lineTo(x2, y2); g.strokePath();
    g.fillStyle(c.color, c.alpha);
    g.fillCircle(x1, y1, width/2); g.fillCircle(jointX, jointY, width/2); g.fillCircle(x2, y2, width/2);
}

function drawText(text, x, y, size, color, align="left", bold=true, isUI=false, shadow=false) {
    let t;
    // Khối lệnh này là nơi game bốc chữ từ trong "kho" (Pool) ra
    if (isUI) {
        if (textUIPoolCount < textUIPool.length) { t = textUIPool[textUIPoolCount]; } 
        else { t = mainScene.add.text(0,0,''); gameCamera.ignore(t); textUIPool.push(t); }
        textUIPoolCount++;
    } else {
        if (textGamePoolCount < textGamePool.length) { t = textGamePool[textGamePoolCount]; } 
        else { t = mainScene.add.text(0,0,''); uiCamera.ignore(t); textGamePool.push(t); }
        textGamePoolCount++;
    }
    
    t.setAlpha(1); 
    t.setText(text)
     .setPosition(Math.round(x), Math.round(y)) 
     .setFontSize(size)
     .setColor(color);
    t.setFontFamily('"Apple Color Emoji", "Segoe UI Emoji", "Noto Color Emoji", Arial, sans-serif');
    t.setResolution(window.devicePixelRatio > 1 ? window.devicePixelRatio : 2);
    if (bold) t.setFontStyle('bold'); else t.setFontStyle('normal');
    if (align === 'center') t.setOrigin(0.5);
    else if (align === 'right') t.setOrigin(1, 0.5);
    else t.setOrigin(0, 0.5);
    if (shadow) t.setShadow(2, 2, 'rgba(0,0,0,0.8)', 2); else t.setShadow(0,0);
    t.setScrollFactor(isUI ? 0 : 1);
    t.setDepth(isUI ? 200 : 50); 
    t.setVisible(true);
}

function drawSprite(key, x, y, opts={}) {
    if (!mainScene.textures.exists(key)) return;
    let img;
    let isUI = opts.isUI || false;

    if (isUI) {
        if (imgUIPoolCount < imgUIPool.length) { img = imgUIPool[imgUIPoolCount]; } 
        else { img = mainScene.add.image(0,0,''); gameCamera.ignore(img); imgUIPool.push(img); }
        imgUIPoolCount++;
    } else {
        if (imgGamePoolCount < imgGamePool.length) { img = imgGamePool[imgGamePoolCount]; } 
        else { img = mainScene.add.image(0,0,''); uiCamera.ignore(img); imgGamePool.push(img); }
        imgGamePoolCount++;
    }

    if (opts.frame !== undefined) {
        img.setTexture(key, opts.frame);
    } else {
        img.setTexture(key);
    }
    img.setPosition(x, y);
    img.setRotation(opts.rotation || 0);
    
    if (opts.crop) { img.setCrop(opts.crop.x, opts.crop.y, opts.crop.w, opts.crop.h); } 
    else { img.setCrop(); }
    
    let scaleX = opts.scaleX !== undefined ? opts.scaleX : 1;
    let scaleY = opts.scaleY !== undefined ? opts.scaleY : 1;
    let dw = opts.w !== undefined ? opts.w : img.width;
    let dh = opts.h !== undefined ? opts.h : img.height;
    
    img.setDisplaySize(dw, dh);
    img.scaleX *= Math.sign(scaleX); 
    img.scaleY *= Math.sign(scaleY);
    
    let originX = opts.originX !== undefined ? opts.originX : 0.5;
    let originY = opts.originY !== undefined ? opts.originY : 0.5;
    img.setOrigin(originX, originY);
    
    img.setAlpha(opts.alpha !== undefined ? opts.alpha : 1);
    img.setTint(opts.tint !== undefined ? opts.tint : 0xffffff);
    
    let d;
    if (isUI) {
        d = opts.depth !== undefined ? (140 + opts.depth) : 160;
    } else {
        d = opts.depth !== undefined ? opts.depth : 10;
    }

    img.setScrollFactor(isUI ? 0 : 1);
    img.setDepth(d);
    img.setVisible(true);
}

function resetPools() {
    for (let i = 0; i < textGamePoolCount; i++) textGamePool[i].setVisible(false);
    for (let i = 0; i < textUIPoolCount; i++) textUIPool[i].setVisible(false);
    for (let i = 0; i < imgGamePoolCount; i++) imgGamePool[i].setVisible(false);
    for (let i = 0; i < imgUIPoolCount; i++) imgUIPool[i].setVisible(false);
    textGamePoolCount = 0;
    textUIPoolCount = 0;
    imgGamePoolCount = 0;
    imgUIPoolCount = 0;
}

function getTextureBounds(key, frameIdx) {
    if (!mainScene || !mainScene.textures.exists(key)) return {w: 100, h: 100};
    let tex = mainScene.textures.get(key);
    if (frameIdx !== undefined && tex.frames[frameIdx]) {
        let f = tex.frames[frameIdx];
        return {w: f.cutWidth || f.width, h: f.cutHeight || f.height};
    }
    let src = tex.getSourceImage();
    if (src && src.width) return {w: src.width, h: src.height};
    return {w: 100, h: 100};
}