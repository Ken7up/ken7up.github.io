function preload() {
    // Đã thay đổi đường dẫn tài nguyên hình ảnh sang thư mục "assets/"
    this.load.image("lance", "assets/images/lance.png");
    this.load.image("scythe", "assets/images/scythe.png");
    this.load.image("gun", "assets/images/gun.png");
    this.load.image("power-fist", "assets/images/power-fist.png");
    
    this.load.spritesheet("mana", "assets/images/mana.png", { frameWidth: 64, frameHeight: 64 });
    this.load.spritesheet("skill2", "assets/images/skill2.png", { frameWidth: 32, frameHeight: 32 });
    this.load.spritesheet("life_bar", "assets/images/life.png", { frameWidth: 64, frameHeight: 64 });
    this.load.spritesheet("glass_ball", "assets/images/glass-ball.png", { frameWidth: 64, frameHeight: 64 });
    this.load.spritesheet("joystick_sheet", "assets/images/joystick.png", { frameWidth: 256, frameHeight: 256 });
    this.load.spritesheet("magic-circle", "assets/images/magic-circle.png", { frameWidth: 256, frameHeight: 256 });
    this.load.image("avatar", "assets/images/avatar.png");
    this.load.spritesheet("doraemon", "assets/images/doraemon.png", { frameWidth: 256, frameHeight: 256 });
    this.load.spritesheet("door", "assets/images/door.png", { frameWidth: 512, frameHeight: 1024 });
}

function create() {
    mainScene = this;

    gameCamera = this.cameras.main;
    gameCamera.setBounds(0, 0, WORLD_WIDTH, WORLD_HEIGHT);
    gameCamera.setBackgroundColor('#1e1e24');

    uiCamera = this.cameras.add(0, 0, SCREEN_WIDTH, SCREEN_HEIGHT).setScroll(0, 0);

    gameGraphics = this.add.graphics();
    uiGraphics = this.add.graphics();
    uiGraphics.setScrollFactor(0); 
    uiGraphics.setDepth(100);

    uiCharGraphics = this.add.graphics();
    uiCharGraphics.setScrollFactor(0);
    uiCharGraphics.setDepth(150);

    uiCamera.ignore(gameGraphics);
    gameCamera.ignore(uiGraphics);
    gameCamera.ignore(uiCharGraphics);

    player = new Stickman(WORLD_WIDTH / 2, WORLD_HEIGHT / 2);
    doraemon = new DoraemonNPC(WORLD_WIDTH / 2 + 150, WORLD_HEIGHT / 2 - 50);
    magicDoor = new AnywhereDoor(doraemon.x, doraemon.y);
    joystick = new Joystick();
    inventory = new InventoryPanel();
    charPanel = new CharacterPanel();
    skillPanel = new SkillPanel();
    hud = new BottomHUD();
    attackBtn = new AttackButton();
    dashButton = new DashButton();
    sitButton = new SitButton();
    playerAvatar = new PlayerAvatar();

    inventory.gold = 99999;
    inventory.addItem("POWER_FIST", 1, "power-fist"); 
    inventory.addItem("LANCE", 1, "lance");
    inventory.addItem("SCYTHE", 1, "scythe");
    inventory.addItem("GUN", 1, "gun");
    inventory.addItem("HP_POTION", 99, "mana");
    inventory.addItem("MP_POTION", 99, "mana");
    inventory.addItem("DUAL_POTION", 99, "mana");
    inventory.addItem("STAMINA_POTION", 99, "mana");

    drawGridLinesOnly();

    this.input.addPointer(2);
    this.input.on('pointerdown', (pointer) => handleStart(pointer));
    this.input.on('pointermove', (pointer) => handleMove(pointer));
    this.input.on('pointerup', (pointer) => handleEnd(pointer));

    this.scale.on('resize', function (gameSize) {
        SCREEN_WIDTH = gameSize.width;
        SCREEN_HEIGHT = gameSize.height;
        if (uiCamera) uiCamera.setSize(SCREEN_WIDTH, SCREEN_HEIGHT);
    });
}

function drawGridLinesOnly() {
    let gridW = 40;
    gameGraphics.fillStyle(0xfdfdfb, 1);
    gameGraphics.fillRect(0, 0, WORLD_WIDTH, WORLD_HEIGHT);
    
    gameGraphics.lineStyle(1, COLORS.GRID, 1);
    gameGraphics.beginPath();
    for (let x = 0; x <= WORLD_WIDTH; x += gridW) { gameGraphics.moveTo(x, 0); gameGraphics.lineTo(x, WORLD_HEIGHT); }
    for (let y = 0; y <= WORLD_HEIGHT; y += gridW) { gameGraphics.moveTo(0, y); gameGraphics.lineTo(WORLD_WIDTH, y); }
    gameGraphics.strokePath();

    gameGraphics.lineStyle(2.5, 0xff7b7b, 1);
    gameGraphics.beginPath(); gameGraphics.moveTo(200, 0); gameGraphics.lineTo(200, WORLD_HEIGHT); gameGraphics.strokePath();
}

function update() {
    resetPools(); 
    uiGraphics.clear();
    if(uiCharGraphics) uiCharGraphics.clear();
    
    if(!mainScene.charLayer) {
        mainScene.charLayer = mainScene.add.graphics();
        mainScene.charLayer.setDepth(10);
        uiCamera.ignore(mainScene.charLayer);
    }
    mainScene.charLayer.clear();
    let oldGameGraphics = gameGraphics; 
    gameGraphics = mainScene.charLayer; 

    if (this.input.pointer1.isDown && this.input.pointer2.isDown) {
        let dist = Phaser.Math.Distance.Between(this.input.pointer1.x, this.input.pointer1.y, this.input.pointer2.x, this.input.pointer2.y);
        if (initialPinchDist === 0) { initialPinchDist = dist; startZoom = gameZoom; } 
        else { gameZoom = Phaser.Math.Clamp(startZoom * (dist / initialPinchDist), 0.6, 1.5); }
    } else { initialPinchDist = 0; }
    
    gameCamera.setZoom(gameZoom);

    if (player) gameCamera.startFollow(player, true, 0.1, 0.1);
    player.update(joystick.vector.x, joystick.vector.y);
    
    if (doraemon) doraemon.update();
    
    for (let i = bullets.length - 1; i >= 0; i--) {
        bullets[i].update();
        if (bullets[i].life <= 0) bullets.splice(i, 1);
    }
    for (let i = floatingTexts.length - 1; i >= 0; i--) {
        floatingTexts[i].update();
        if (floatingTexts[i].life <= 0) floatingTexts.splice(i, 1);
    }

    bullets.forEach(b => b.draw());
    if (magicDoor) magicDoor.draw();
    if (doraemon) doraemon.draw();
    player.draw();
    floatingTexts.forEach(t => t.draw());

    gameGraphics = oldGameGraphics; 
    
    hud.draw(player);
    
    let isAnyPanelOpen = charPanel.visible || inventory.visible || skillPanel.visible;

    if (!isAnyPanelOpen) {
        playerAvatar.draw(player);
        joystick.draw();
        attackBtn.draw();
        dashButton.draw();
        sitButton.draw();
    }

    if (charPanel.visible) charPanel.draw(player);
    if (inventory.visible) inventory.draw();
    if (skillPanel.visible) skillPanel.draw();
}

function handleStart(pointer) {
    let px = pointer.x, py = pointer.y;
    if (playerAvatar.checkClick(px, py, charPanel)) return;
    if (charPanel.checkClick(px, py) || inventory.checkClick(px, py) || skillPanel.checkClick(px, py)) return;
    if (charPanel.visible || inventory.visible || skillPanel.visible) return;
    if (attackBtn.checkClick(px, py) || dashButton.checkClick(px, py, player) || sitButton.checkClick(px, py)) return;
    if (hud.checkClick(px, py, charPanel, inventory, skillPanel)) return;
    if (magicDoor && magicDoor.checkClick(pointer.worldX, pointer.worldY)) return;
    if (doraemon && doraemon.checkClick(pointer.worldX, pointer.worldY)) return;
    joystick.handleStart(px, py, pointer.id);
}
function handleMove(pointer) { if (pointer.id === joystick.touchId || pointer.id === 1) joystick.handleMove(pointer.x, pointer.y); }
function handleEnd(pointer) { if (pointer.id === joystick.touchId || pointer.id === 1) joystick.handleEnd(); }
function toggleSit() {
    if (!player) return;
    player.isSitting = !player.isSitting;
    if (player.isSitting) { player.sitTimer = 0; floatingTexts.push(new FloatingText(player.x, player.y - 60, "Tịnh Tâm...", "#00ff00")); }
}