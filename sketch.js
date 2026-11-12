// 宣告各個圖片精靈變數
let stopSpriteSheet;
let walkSpriteSheet;
let magicSpriteSheet;
let effectSpriteSheet;

// 宣告目前正在使用的精靈貼圖
let currentSpriteSheet;

// 宣告各個精靈圖的總影格數
const stopTotalFrames = 7;
const walkTotalFrames = 9;
const magicTotalFrames = 7;   // 發功圖片精靈共 7 張
const effectTotalFrames = 13; // 特效圖片精靈共 13 張

// 宣告各精靈圖單張影格的寬度與高度
let stopFrameWidth, stopFrameHeight;
let walkFrameWidth, walkFrameHeight;
let magicFrameWidth, magicFrameHeight;
let effectFrameWidth, effectFrameHeight;

// 宣告目前播放的影格計數器
let currentFrame = 0;

// 宣告角色的位置與移動狀態變數
let posX, posY;
let moveDirection = 0; // 0 表示靜止/站立，1 表示向右，-1 表示向左
let moveSpeed = 7;     // 提升移動速度，讓角色走路變快、不卡頓
let lastFacingDirection = 1; // 記錄最後面向（1表示右，-1表示左）

// 宣告狀態變數
let isPerformingMagic = false; // 是否正在發功
let isShowingEffect = false;   // 是否正在顯示特效
let effectFrame = 0;           // 特效專用的影格計數器
let effectPosX = 0;            // 記錄特效觸發時的 X 座標
let effectFacing = 1;          // 記錄特效觸發時的面向

// p5.js 預載資源函數，在 setup() 執行前先載入所有圖片
function preload() {
  stopSpriteSheet = loadImage('1/stop/stop.png');
  walkSpriteSheet = loadImage('1/walk/walk.png');
  magicSpriteSheet = loadImage('1/發功/發功.png');
  effectSpriteSheet = loadImage('1/jump/jump.png');
}

// p5.js 初始化設定函數
function setup() {
  // 建立與瀏覽器視窗同等大小的全螢幕畫布
  createCanvas(windowWidth, windowHeight);
  // 關閉影像平滑化濾鏡，保持像素圖案放大後的清晰銳利邊緣
  noSmooth();
  // 提升畫格率至每秒 15 影格，讓動畫播放更流暢
  frameRate(15);
  
  // 計算各精靈圖單張影格的寬高
  stopFrameWidth = 429 / stopTotalFrames;
  stopFrameHeight = 90;
  
  walkFrameWidth = 562 / walkTotalFrames;
  walkFrameHeight = 83;
  
  magicFrameWidth = 352 / magicTotalFrames; // 發功總寬 352，共 7 張
  magicFrameHeight = 70;                    // 發功高度 70
  
  effectFrameWidth = 1269 / effectTotalFrames; // 特效總寬 1269，共 13 張
  effectFrameHeight = 67;                     // 特效高度 67
  
  // 初始化角色位置：預設 X 軸在畫布 2/3 位置
  posX = (width * 2 / 3);
  
  // 預設使用站立精靈圖
  currentSpriteSheet = stopSpriteSheet;
}

// p5.js 持續繪製畫面的主要迴圈函數
function draw() {
  // 清除背景並設定為淡紫色 (#E6E6FA)
  background(230, 230, 250);
  
  // 計算角色在目前畫布上的目標顯示高度（畫布總高度的 1/3）
  let displayHeight = height / 3;
  let displayWidth, frameWidth, frameHeight, totalFrames;
  
  // 根據目前使用的精靈圖來決定對應的寬高與總影格數
  if (isPerformingMagic) {
    frameWidth = magicFrameWidth;
    frameHeight = magicFrameHeight;
    totalFrames = magicTotalFrames;
    displayWidth = (magicFrameWidth / magicFrameHeight) * displayHeight;
  } else if (currentSpriteSheet === walkSpriteSheet) {
    frameWidth = walkFrameWidth;
    frameHeight = walkFrameHeight;
    totalFrames = walkTotalFrames;
    displayWidth = (walkFrameWidth / walkFrameHeight) * displayHeight;
  } else {
    frameWidth = stopFrameWidth;
    frameHeight = stopFrameHeight;
    totalFrames = stopTotalFrames;
    displayWidth = (stopFrameWidth / stopFrameHeight) * displayHeight;
  }
  
  // 若沒有在發功且沒有在播特效，才處理左右移動與邊界限制
  if (!isPerformingMagic && !isShowingEffect) {
    if (moveDirection === 1) {
      posX += moveSpeed;
      if (posX >= width) {
        posX = width;
        moveDirection = 0;
      }
    } else if (moveDirection === -1) {
      posX -= moveSpeed;
      if (posX <= 0) {
        posX = 0;
        moveDirection = 0;
      }
    }
  }
  
  // 計算角色的 Y 軸座標（使角色最底端剛好貼齊畫布最底端）
  posY = height - displayHeight;
  
  // 計算目前影格在精靈貼圖中的 X 軸裁切起始位置
  let sx = floor(currentFrame) * frameWidth;
  let sy = 0;
  
  // 決定角色繪製時是否需要水平翻轉
  let currentFacing = (moveDirection !== 0) ? moveDirection : lastFacingDirection;
  
  // --- 繪製單一特效（若正在顯示特效） ---
  if (isShowingEffect) {
    let effDisplayH = height / 3;
    let effDisplayW = (effectFrameWidth / effectFrameHeight) * effDisplayH;
    let effSx = floor(effectFrame) * effectFrameWidth;
    
    push();
    translate(effectPosX, posY); // 在特效觸發時的位置繪製
    if (effectFacing === -1) {
      scale(-1, 1); // 若面向左邊，將特效水平鏡射
    }
    image(
      effectSpriteSheet,
      -effDisplayW / 2, // 置中對齊
      0,                // 貼齊底部
      effDisplayW,
      effDisplayH,
      effSx,
      0,
      effectFrameWidth,
      effectFrameHeight
    );
    pop();
    
    // 播放特效動畫影格（共 13 張）
    effectFrame += 1.2;
    if (effectFrame >= effectTotalFrames) {
      // 特效播放完畢，關閉特效狀態
      isShowingEffect = false;
    }
  }
  
  // --- 繪製角色本體（若未顯示特效時顯示） ---
  if (!isShowingEffect) {
    push();
    translate(posX, posY);
    if (currentFacing === -1) {
      scale(-1, 1); // 面向左側時進行水平翻轉
    }
    
    image(
      currentSpriteSheet,
      -displayWidth / 2, 
      0,                 
      displayWidth,
      displayHeight,
      sx,
      sy,
      frameWidth,
      frameHeight
    );
    pop();
  }
  
  // --- 動畫影格與狀態更新邏輯 ---
  if (isPerformingMagic) {
    // 發功動畫：讓影格遞進，直到播完 7 張圖片為止
    currentFrame += 0.8;
    if (currentFrame >= totalFrames) {
      // 發功播放完畢一次
      isPerformingMagic = false;
      currentSpriteSheet = stopSpriteSheet; // 恢復站立精靈
      currentFrame = 0;
      
      // 發功結束瞬間，啟動單一特效，記錄當前位置與面向
      isShowingEffect = true;
      effectFrame = 0;
      effectPosX = posX;
      effectFacing = currentFacing;
    }
  } else if (isShowingEffect) {
    // 正在播放特效時，角色本身暫停動作
  } else if (moveDirection !== 0) {
    // 走路動畫影格推進（配合較快的移動速度調整步伐頻率）
    currentFrame = (currentFrame + 1.2) % totalFrames;
  } else {
    // 站立動畫循環
    currentFrame = (currentFrame + 0.5) % totalFrames;
  }
}

// 監聽鍵盤按下事件
function keyPressed() {
  if (key === ' ' && !isPerformingMagic && !isShowingEffect) {
    isPerformingMagic = true;
    currentSpriteSheet = magicSpriteSheet;
    currentFrame = 0;
    moveDirection = 0;
  } else if (keyCode === RIGHT_ARROW && !isPerformingMagic && !isShowingEffect) {
    if (currentSpriteSheet !== walkSpriteSheet) {
      currentSpriteSheet = walkSpriteSheet;
      currentFrame = 0;
    }
    moveDirection = 1;
    lastFacingDirection = 1;
  } else if (keyCode === LEFT_ARROW && !isPerformingMagic && !isShowingEffect) {
    if (currentSpriteSheet !== walkSpriteSheet) {
      currentSpriteSheet = walkSpriteSheet;
      currentFrame = 0;
    }
    moveDirection = -1;
    lastFacingDirection = -1;
  }
}

// 監聽鍵盤放開事件
function keyReleased() {
  if ((keyCode === RIGHT_ARROW || keyCode === LEFT_ARROW) && !isPerformingMagic && !isShowingEffect) {
    if (!keyIsDown(RIGHT_ARROW) && !keyIsDown(LEFT_ARROW)) {
      moveDirection = 0;
      currentSpriteSheet = stopSpriteSheet;
      currentFrame = 0;
    }
  }
}

// 當使用者調整瀏覽器視窗大小時自動觸發
function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}