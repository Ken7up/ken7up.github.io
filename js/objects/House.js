// js/objects/House.js
export default class House extends Phaser.GameObjects.Image {
    /**
     * @param {Phaser.Scene} scene - Truyền scene hiện tại vào
     * @param {number} groundLevelY - Truyền mức đất vào để nhà tự tính vị trí Y
     */
    constructor(scene, groundLevelY) {
        // Tọa độ X cố định là 355
        const x = 355;
        // Tọa độ Y tự tính toán dựa trên mức đất
        const y = groundLevelY + 230;

        super(scene, x, y, 'nha');

        // Thêm vào scene
        scene.add.existing(this);

        // Các thông số cố định của ngôi nhà
        this.setOrigin(0.5, 1); 
        this.setDepth(4); 
        this.setScale(0.20);
    }
}
