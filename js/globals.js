let SCREEN_WIDTH = window.innerWidth;
let SCREEN_HEIGHT = window.innerHeight;
const WORLD_WIDTH = 800; 
const WORLD_HEIGHT = 1200; 

let mainScene;
let gameCamera, uiCamera;
let gameGraphics, uiGraphics, uiCharGraphics;

let gameZoom = 1.0;
let initialPinchDist = 0;
let startZoom = 1.0;

const imgGamePool = [];
let imgGamePoolCount = 0;
const imgUIPool = [];
let imgUIPoolCount = 0;

const textGamePool = [];
let textGamePoolCount = 0;
const textUIPool = [];
let textUIPoolCount = 0;

let player, joystick, inventory, charPanel, skillPanel, hud, attackBtn, dashButton, sitButton, playerAvatar;
let doraemon;
let magicDoor;
const floatingTexts = [];
const bullets = [];

const COLORS = {
    GRID: 0xa2d5f2,
    JOYSTICK_OUT: "rgba(200, 200, 200, 0.5)",
    JOYSTICK_IN: "rgba(100, 100, 100, 0.8)",
    INK_BLACK: 0x141414,
    THEME_JADE_BG: 0x193c41,
    THEME_JADE_BORDER: 0x78b4b4,
    THEME_SLOT_BG: 0x0f1e23,
    THEME_SLOT_BORDER: 0x3c5a5a,
    THEME_GOLD_ACTIVE: "#dcbe8c",
    THEME_TEXT_WHITE: "#f0f5f5",
    BTN_USE_BG: 0xffcc00,
    BTN_USE_BORDER: 0xffaa00,
    BTN_USE_TEXT: "#5c4008"
};