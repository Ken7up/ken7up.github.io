const config = {
    type: Phaser.AUTO, 
    width: window.innerWidth,
    height: window.innerHeight,
    resolution: window.devicePixelRatio || 1, 
    backgroundColor: '#1e1e24',
    parent: document.body,
    scale: {
        mode: Phaser.Scale.RESIZE,
        autoCenter: Phaser.Scale.CENTER_BOTH
    },
    scene: { preload: preload, create: create, update: update }
};

const game = new Phaser.Game(config);