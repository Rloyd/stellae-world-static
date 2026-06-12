const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");
ctx.imageSmoothingEnabled = false;

const gameWrap = document.querySelector(".game-wrap");
const hpText = document.getElementById("hpText");
const hpPips = document.getElementById("hpPips");
const hudStrip = document.querySelector(".hud-strip");
const shieldText = document.getElementById("shieldText");
const shieldPips = document.getElementById("shieldPips");
const stellaText = document.getElementById("stellaText");
const stellaLevelPips = document.getElementById("stellaLevelPips");
const energyText = document.getElementById("energyText");
const energyPips = document.getElementById("energyPips");
const ultReady = document.getElementById("ultReady");
const weaponText = document.getElementById("weaponText");
const weaponBars = document.getElementById("weaponBars");
const scoreText = document.getElementById("scoreText");
const chargeFill = document.getElementById("chargeFill");
const routeText = document.getElementById("routeText");
const routeFill = document.getElementById("routeFill");
const stageText = document.getElementById("stageText");
const bgm = document.getElementById("bgm");
const audioButton = document.getElementById("audioButton");
const bootScreen = document.getElementById("bootScreen");
const selectScreen = document.getElementById("selectScreen");
const enterSelectButton = document.getElementById("enterSelectButton");
const launchButton = document.getElementById("launchButton");
const characterSelect = document.getElementById("characterSelect");
const stageSelect = document.getElementById("stageSelect");
const difficultySelect = document.getElementById("difficultySelect");
const leaderboardButton = document.getElementById("leaderboardButton");
const leaderboardPanel = document.getElementById("leaderboardPanel");
const leaderboardCloseButton = document.getElementById("leaderboardCloseButton");
const leaderboardList = document.getElementById("leaderboardList");
const touchControls = document.getElementById("touchControls");
const touchStick = document.getElementById("touchStick");
const touchStickKnob = document.getElementById("touchStickKnob");
const mobileMenuButton = document.getElementById("mobileMenuButton");
const mobileAudioButton = document.getElementById("mobileAudioButton");
const mobileHelpButton = document.getElementById("mobileHelpButton");
const mobileFullscreenButton = document.getElementById("mobileFullscreenButton");
const mobileResetButton = document.getElementById("mobileResetButton");
const desktopMenuButton = document.getElementById("desktopMenuButton");
const desktopAudioButton = document.getElementById("desktopAudioButton");
const desktopHelpButton = document.getElementById("desktopHelpButton");
const helpPanel = document.getElementById("helpPanel");
const helpCloseButton = document.getElementById("helpCloseButton");
const frameSize = document.getElementById("frameSize");

const sheets = {
  player: loadSprite("./assets/runtime/characters-v4/vanguard-sprite-v4.png"),
  playerAim: loadSprite("./assets/runtime/characters-v4/vanguard-aim-v4.png"),
  projectiles: loadSprite("./assets/projectile-sprites.svg"),
  stella: loadSprite("./assets/stellae-option-game.png"),
  enemies: loadSprite("./assets/enemy-unit-game.png"),
  boss: loadSprite("./assets/production/boss-zero-hour-game.png"),
  items: loadSprite("./assets/production/item-icons-game.png"),
  terrain: loadSprite("./assets/production/terrain-props-game.png"),
  effects: loadSprite("./assets/production/effects-game.png"),
  health: loadSprite("./assets/production/health-pickup.png"),
  cutins: [
    loadSprite("./assets/cutins/stellae-lv1-transparent.png"),
    loadSprite("./assets/cutins/stellae-lv2-transparent.png"),
    loadSprite("./assets/cutins/stellae-lv3-transparent.png"),
    loadSprite("./assets/cutins/stellae-lv4-transparent.png"),
    loadSprite("./assets/cutins/stellae-lv5-transparent.png"),
  ],
};

const characterSheets = {
  vanguard: sheets.player,
  arcblade: loadSprite("./assets/runtime/characters-v4/arcblade-sprite-v4.png"),
  railgunner: loadSprite("./assets/runtime/characters-v4/railgunner-sprite-v4.png"),
};

const characterAimSheets = {
  vanguard: sheets.playerAim,
  arcblade: loadSprite("./assets/runtime/characters-v4/arcblade-aim-v4.png"),
  railgunner: loadSprite("./assets/runtime/characters-v4/railgunner-aim-v4.png"),
};

const characterActionSheets = {
  vanguard: loadSprite("./assets/runtime/characters-v4/actions/vanguard-actions-v1.png"),
  arcblade: loadSprite("./assets/runtime/characters-v4/actions/arcblade-actions-v1.png"),
  railgunner: loadSprite("./assets/runtime/characters-v4/actions/railgunner-actions-v1.png"),
};

const stageBackgrounds = {
  rooftop: loadSprite("./assets/stage-rooftop-bg-v2.png"),
  slum: loadSprite("./assets/production/v2/stage-slum-bg-preview.png"),
  virtual: loadSprite("./assets/production/v2/stage-virtual-bg-preview.png"),
};

const stageEnemySheets = {
  rooftop: sheets.enemies,
  slum: loadSprite("./assets/runtime/v2/enemy-pack-slum-clean.png"),
  virtual: loadSprite("./assets/runtime/v2/enemy-pack-virtual-clean.png"),
};

const stageTerrainSheets = {
  rooftop: sheets.terrain,
  slum: loadSprite("./assets/runtime/v2/slum-terrain-props-clean.png"),
  virtual: loadSprite("./assets/runtime/v2/virtual-terrain-props-clean.png"),
};

const stageBossSheets = {
  rooftop: sheets.boss,
  slum: loadSprite("./assets/runtime/v2/boss-slum-recycler-clean.png"),
  virtual: loadSprite("./assets/runtime/v2/boss-virtual-mirror-clean.png"),
};

let transparentPlayerSheet = null;
let transparentAimSheet = null;
let transparentActionSheet = null;
let transparentEnemySheet = null;
let transparentTerrainSheet = null;
let transparentBossSheet = null;

const W = canvas.width;
const H = canvas.height;
const FLOOR = 438;
const VOID_Y = H + 90;
const GRAVITY = 0.82;
const ROUTE_LENGTH_SCALE = 1.5;

const keys = new Set();
const virtualKeyHolds = new Map();
const touchStickState = {
  active: false,
  pointerId: null,
  x: 0,
  y: 0,
  aimX: 0,
  aimY: 0,
};
let last = performance.now();
let time = 0;
let spawnTimer = 0;
let pickupTimer = 2.4;
let weaponPickupTimer = 4.2;
let healPickupTimer = 18;
let obstacleTimer = 6.5;
let terrainTimer = 0;
let runTime = 0;
let bossSpawned = false;
let bossWarningTimer = 0;
let bossWarningStarted = false;
let victory = false;
let screenShake = 0;
let gameOverTimer = 0;
let ultimateSequence = null;
let bgmWanted = false;
let bgmMutedByUser = false;
let bgmIndex = 0;
let gameMode = "boot";
let isPaused = false;
let selectedCharacter = "vanguard";
let selectedStage = "rooftop";
let bgmStage = selectedStage;
let selectedDifficulty = "hard";
let bossClears = 0;
const stageOrder = ["rooftop", "slum", "virtual"];
let campaignStages = [];
let campaignIndex = 0;
let campaignStartStage = selectedStage;
let routeScoreStart = 0;
let isEndlessHell = false;
let endlessRound = 0;
let scoreRecorded = false;
let lastPaint = 0;

const LEADERBOARD_KEY = "stellae-run-gun-scores-v1";
const LEADERBOARD_META_KEY = "stellae-run-gun-meta-v1";

const defaultBgmTracks = [
  "./assets/bgm-shell-rush.mp3",
  "./assets/bgm-shell-dash-1.mp3",
  "./assets/bgm-shell-dash-2.mp3",
];

const stageBgmTracks = {
  rooftop: defaultBgmTracks,
  slum: [
    "./assets/audio/slum-neon-chase.mp3",
    "./assets/audio/slum-alley-chase.mp3",
    "./assets/audio/slum-neon-chase-alt.mp3",
  ],
  virtual: [
    "./assets/audio/virtual-domain-breakout.mp3",
  ],
};

if ("serviceWorker" in navigator && location.protocol.startsWith("http")) {
  const isLocalDev = ["localhost", "127.0.0.1", "::1"].includes(location.hostname);
  if (isLocalDev && navigator.serviceWorker.getRegistrations) {
    navigator.serviceWorker.getRegistrations()
      .then((registrations) => registrations.forEach((registration) => registration.unregister()))
      .catch(() => {});
  } else {
    navigator.serviceWorker.register("./service-worker.js").catch(() => {});
  }
}

function preventTouchZoom(event) {
  event.preventDefault();
}

document.addEventListener("gesturestart", preventTouchZoom, { passive: false });
document.addEventListener("gesturechange", preventTouchZoom, { passive: false });
document.addEventListener("gestureend", preventTouchZoom, { passive: false });
document.addEventListener("dblclick", preventTouchZoom, { passive: false });
document.addEventListener("touchmove", (event) => {
  if (event.touches.length > 1 || event.target.closest("#touchControls, canvas, .game-stage")) {
    event.preventDefault();
  }
}, { passive: false });

if (frameSize) {
  const updateFrameSize = () => {
    const rect = frameSize.closest(".game-wrap").getBoundingClientRect();
    frameSize.textContent = `FRAME ${Math.round(rect.width)} x ${Math.round(rect.height)}`;
  };
  const frameObserver = new ResizeObserver(updateFrameSize);
  frameObserver.observe(frameSize.closest(".game-wrap"));
  updateFrameSize();
}

const characterConfigs = {
  vanguard: {
    name: "断刃者",
    maxHp: 6,
    speed: 210,
    jump: -470,
    fireBase: 0.15,
    power: 1,
    type: "rifle",
    visualScale: 1.04,
  },
  arcblade: {
    name: "弧焰技师",
    maxHp: 5,
    speed: 238,
    jump: -495,
    fireBase: 0.12,
    power: 0.82,
    type: "arc",
    visualScale: 1.04,
  },
  railgunner: {
    name: "霁线游侠",
    maxHp: 7,
    speed: 188,
    jump: -445,
    fireBase: 0.24,
    power: 1.55,
    type: "rail",
    visualScale: 1.04,
  },
};

const stageConfigs = {
  rooftop: { name: "夜城天台 01", progress: 0.22, enemy: 1, boss: 1, bossName: "零点巡逻艇", terrain: "rooftop" },
  slum: { name: "霓虹贫民窟 02", progress: 0.21, enemy: 1.04, boss: 1.05, bossName: "雨巷回收机", terrain: "slum" },
  virtual: { name: "虚拟深层 03", progress: 0.205, enemy: 1.08, boss: 1.08, bossName: "镜像守门者", terrain: "virtual" },
};

const difficultyConfigs = {
  normal: {
    label: "普通",
    rank: "NORMAL",
    routeLength: 0.94,
    spawnInterval: 1.28,
    extraChance: 0.42,
    enemyHp: 0.72,
    enemySpeed: 0.9,
    enemyFire: 1.26,
    enemyDamage: 0.72,
    bossHp: 1.55,
    bossFire: 1.24,
    bossCount: 1,
    hpBonus: 2,
    score: 0.85,
    leftRushMultiplier: 1,
  },
  hard: {
    label: "困难",
    rank: "HARD",
    routeLength: 1,
    spawnInterval: 1,
    extraChance: 1,
    enemyHp: 1,
    enemySpeed: 1,
    enemyFire: 1.08,
    enemyDamage: 1,
    bossHp: 2,
    bossFire: 1,
    bossCount: 1,
    hpBonus: 0,
    score: 1,
    leftRushMultiplier: 2,
  },
  hell: {
    label: "地狱",
    rank: "HELL",
    routeLength: 1.08,
    spawnInterval: 0.68,
    extraChance: 1.55,
    enemyHp: 1.34,
    enemySpeed: 1.13,
    enemyFire: 0.88,
    enemyDamage: 1.28,
    bossHp: 3,
    bossFire: 0.86,
    bossCount: 2,
    hpBonus: 0,
    score: 1.28,
    leftRushMultiplier: 3,
  },
};

const player = {
  x: 128,
  y: FLOOR - 58,
  w: 32,
  h: 58,
  vx: 0,
  vy: 0,
  hp: 6,
  maxHp: 6,
  facing: 1,
  onGround: true,
  crouching: false,
  invuln: 0,
  fireCd: 0,
  charge: 0,
  score: 0,
  stageProgress: 0,
  weapon: { power: 0, wide: 0, rapid: 0 },
};

const stella = {
  active: false,
  level: 0,
  x: 84,
  y: 280,
  shotCd: 0,
  pulseCd: 0,
  ultCd: 0,
  shield: 0,
  burstGlow: 0,
  chargePips: 0,
};

const bullets = [];
const enemyBullets = [];
const enemies = [];
const pickups = [];
const obstacles = [];
const particles = [];
const effects = [];
const bossBeams = [];

const platforms = [];
const movingTerrain = [];

const enemyTypes = [
  { kind: "drone", hp: 3, speed: 78, y: 190, score: 80, fire: 1.35 },
  { kind: "fastDrone", hp: 2, speed: 128, y: 150, score: 90, fire: 1.15 },
  { kind: "trooper", hp: 5, speed: 46, y: FLOOR - 52, score: 120, fire: 1.8 },
  { kind: "runner", hp: 3, speed: 118, y: FLOOR - 50, score: 105, fire: 2.4 },
  { kind: "shield", hp: 8, speed: 34, y: FLOOR - 58, score: 170, fire: 2.25 },
  { kind: "turret", hp: 6, speed: 18, y: FLOOR - 44, score: 150, fire: 1.55 },
  { kind: "heavy", hp: 12, speed: 24, y: FLOOR - 58, score: 230, fire: 1.35 },
  { kind: "bomber", hp: 4, speed: 62, y: 245, score: 150, fire: 1.9 },
];

const pickupTypes = ["power", "wide", "rapid", "stella", "health"];
const groundedEnemyKinds = new Set(["trooper", "runner", "shield", "turret", "heavy"]);
const enemyVisualBottoms = {
  rooftop: { 1: 436, 2: 441, 3: 425, 5: 373, 6: 381, 7: 425 },
  slum: { 1: 425, 2: 425, 3: 425, 5: 425, 6: 425, 7: 425 },
  virtual: { 1: 425, 2: 425, 3: 426, 5: 425, 6: 425, 7: 426 },
};
const bossVisualBottoms = {
  rooftop: { 0: 425, 1: 425, 2: 425, 3: 425 },
  slum: { 0: 425, 1: 425, 2: 426, 3: 425 },
  virtual: { 0: 459, 1: 459, 2: 459, 3: 425 },
};
const TERRAIN_SCROLL_SPEED = -72;
const obstacleConfigs = {
  crate: { frame: 0, w: 46, h: 48, drawW: 88, drawH: 88, drawX: -18, drawY: -28, hp: 4, damage: 1, platform: true },
  barrel: { frame: 1, w: 30, h: 42, drawW: 72, drawH: 88, drawX: -18, drawY: -28, hp: 2, damage: 2, platform: true },
  generator: { frame: 2, w: 58, h: 54, drawW: 96, drawH: 88, drawX: -18, drawY: -30, hp: 6, damage: 1, platform: true },
  laserGate: { frame: 3, w: 54, h: 88, drawW: 112, drawH: 112, drawX: -30, drawY: -24, hp: 5, damage: 2, platform: false },
};
const obstacleKinds = ["crate", "barrel", "generator", "laserGate"];

function isRooftopLowHoverKind(kind) {
  return selectedStage === "rooftop" && (kind === "shield" || kind === "heavy");
}

window.addEventListener("keydown", (event) => {
  keys.add(event.key.toLowerCase());
  startBgmFromGesture();
  if ([" ", "arrowup", "arrowdown", "arrowleft", "arrowright"].includes(event.key.toLowerCase())) {
    event.preventDefault();
  }
  if (event.key === "Enter" && gameMode === "boot") {
    showSelectScreen();
    return;
  }
  if (event.key === "Enter" && gameMode === "select") {
    startRun();
    return;
  }
  if (event.key.toLowerCase() === "p") togglePause();
  if (event.key.toLowerCase() === "r" && (player.hp <= 0 || victory)) handleRetryOrContinue();
  if (event.key === "Escape") hideHelpPanel();
});

window.addEventListener("keyup", (event) => {
  const key = event.key.toLowerCase();
  keys.delete(key);
  if (key === " " && player.vy < -160) player.vy *= 0.58;
  if (key === "k") releaseCharge();
});

canvas.addEventListener("pointerdown", startBgmFromGesture);

if (touchControls) {
  touchControls.addEventListener("contextmenu", (event) => event.preventDefault());
  touchControls.addEventListener("pointerdown", (event) => {
    const button = event.target.closest("[data-keys]");
    if (!button) return;
    event.preventDefault();
    button.setPointerCapture?.(event.pointerId);
    pressVirtualKeys(button);
  });
  for (const type of ["pointerup", "pointercancel", "pointerleave"]) {
    touchControls.addEventListener(type, (event) => {
      const button = event.target.closest("[data-keys]");
      if (!button) return;
      event.preventDefault();
      releaseVirtualKeys(button);
    });
  }
}

if (touchStick) {
  touchStick.addEventListener("contextmenu", (event) => event.preventDefault());
  touchStick.addEventListener("pointerdown", (event) => {
    event.preventDefault();
    event.stopPropagation();
    touchStick.setPointerCapture?.(event.pointerId);
    touchStickState.active = true;
    touchStickState.pointerId = event.pointerId;
    startBgmFromGesture();
    updateTouchStick(event);
  });
  touchStick.addEventListener("pointermove", (event) => {
    if (!touchStickState.active || touchStickState.pointerId !== event.pointerId) return;
    event.preventDefault();
    updateTouchStick(event);
  });
  for (const type of ["pointerup", "pointercancel", "lostpointercapture"]) {
    touchStick.addEventListener(type, (event) => {
      if (touchStickState.pointerId !== null && touchStickState.pointerId !== event.pointerId) return;
      event.preventDefault();
      resetTouchStick();
    });
  }
}

enterSelectButton.addEventListener("click", () => {
  startBgmFromGesture();
  showSelectScreen();
});

launchButton.addEventListener("click", () => {
  startBgmFromGesture();
  startRun();
});

bindMobileButton(mobileMenuButton, () => showBootScreen());
bindMobileButton(mobileAudioButton, () => toggleBgm());
bindMobileButton(mobileHelpButton, () => showHelpPanel());
bindMobileButton(mobileFullscreenButton, () => togglePause());
bindMobileButton(mobileResetButton, () => {
  if (gameMode === "playing" && (player.hp <= 0 || victory)) handleRetryOrContinue();
});

if (desktopHelpButton) {
  desktopHelpButton.addEventListener("click", () => showHelpPanel());
}

if (helpCloseButton) {
  helpCloseButton.addEventListener("click", () => hideHelpPanel());
}

if (helpPanel) {
  helpPanel.addEventListener("click", (event) => {
    if (event.target === helpPanel) hideHelpPanel();
  });
}

if (desktopMenuButton) {
  desktopMenuButton.addEventListener("click", () => {
    showBootScreen();
  });
}

if (desktopAudioButton) {
  desktopAudioButton.addEventListener("click", () => {
    toggleBgm();
  });
}

characterSelect.addEventListener("click", (event) => {
  const button = event.target.closest("[data-character]");
  if (!button) return;
  selectedCharacter = button.dataset.character;
  transparentPlayerSheet = null;
  transparentAimSheet = null;
  transparentActionSheet = null;
  setSelected(characterSelect, button);
  updateHud();
});

stageSelect.addEventListener("click", (event) => {
  const button = event.target.closest("[data-stage]");
  if (!button) return;
  selectedStage = button.dataset.stage;
  syncBgmForStage(!bgm.paused && bgmWanted && !bgmMutedByUser);
  transparentEnemySheet = null;
  transparentTerrainSheet = null;
  transparentBossSheet = null;
  setSelected(stageSelect, button);
  updateStageLabel();
});

if (difficultySelect) {
  difficultySelect.addEventListener("click", (event) => {
    const button = event.target.closest("[data-difficulty]");
    if (!button) return;
    setSelectedDifficulty(button.dataset.difficulty);
    updateStageLabel();
    renderLeaderboard();
  });
}

if (leaderboardButton) {
  leaderboardButton.addEventListener("click", () => {
    leaderboardPanel?.classList.toggle("is-hidden");
    renderLeaderboard();
  });
}

if (leaderboardCloseButton) {
  leaderboardCloseButton.addEventListener("click", () => {
    leaderboardPanel?.classList.add("is-hidden");
  });
}

audioButton.addEventListener("click", () => {
  toggleBgm();
});

bgm.addEventListener("ended", () => {
  const tracks = getBgmTracks();
  bgmIndex = (bgmIndex + 1) % tracks.length;
  bgm.src = tracks[bgmIndex];
  if (bgmWanted && !bgmMutedByUser) playBgm();
});

function showSelectScreen() {
  isPaused = false;
  gameMode = "select";
  bootScreen.classList.add("is-hidden");
  selectScreen.classList.remove("is-hidden");
  updateStageLabel();
  updateMobilePauseButton();
  renderLeaderboard();
  window.scrollTo(0, 0);
}

function showBootScreen() {
  isPaused = false;
  gameMode = "boot";
  releaseAllVirtualKeys();
  bootScreen.classList.remove("is-hidden");
  selectScreen.classList.add("is-hidden");
  leaderboardPanel?.classList.add("is-hidden");
  updateStageLabel();
  updateMobilePauseButton();
  updateMobileResetButton();
  window.scrollTo(0, 0);
}

function startRun() {
  isPaused = false;
  gameMode = "playing";
  isEndlessHell = false;
  endlessRound = 0;
  campaignStartStage = selectedStage;
  campaignStages = buildCampaignStages(campaignStartStage);
  campaignIndex = 0;
  selectedStage = campaignStages[campaignIndex];
  syncBgmForStage(false);
  bootScreen.classList.add("is-hidden");
  selectScreen.classList.add("is-hidden");
  window.scrollTo(0, 0);
  resetGame();
}

function buildCampaignStages(startStage) {
  const startIndex = Math.max(0, stageOrder.indexOf(startStage));
  return stageOrder.map((_, index) => stageOrder[(startIndex + index) % stageOrder.length]);
}

function hasNextCampaignStage() {
  return campaignStages.length > 0 && campaignIndex < campaignStages.length - 1;
}

function handleRetryOrContinue() {
  if (victory && hasNextCampaignStage()) {
    continueCampaignStage();
    return;
  }
  if (victory && isEndlessHell) {
    continueEndlessRoute();
    return;
  }
  if (victory) {
    const nextDifficulty = getNextCampaignDifficulty();
    if (nextDifficulty) {
      startNextDifficultyCampaign(nextDifficulty);
      return;
    }
    if (selectedDifficulty === "hell") {
      startEndlessHell();
      return;
    }
  }
  if (player.hp <= 0 && isEndlessHell) {
    showBootScreen();
    return;
  }
  resetGame(player.hp <= 0 ? { retryCurrentStage: true } : undefined);
}

function continueCampaignStage() {
  campaignIndex = Math.min(campaignIndex + 1, campaignStages.length - 1);
  selectedStage = campaignStages[campaignIndex];
  syncBgmForStage(!bgm.paused && bgmWanted && !bgmMutedByUser);
  transparentEnemySheet = null;
  transparentTerrainSheet = null;
  transparentBossSheet = null;
  const stageButton = stageSelect?.querySelector(`[data-stage="${selectedStage}"]`);
  if (stageButton) setSelected(stageSelect, stageButton);
  const hellCarryOver = selectedDifficulty === "hell";
  resetGame({ preserveLoadout: true, preserveGrowth: hellCarryOver, growthPenalty: hellCarryOver ? 2 : 0 });
  stageText.textContent = `${stageConfigs[selectedStage].name} 展开`;
}

function getNextCampaignDifficulty() {
  if (selectedDifficulty === "normal") return "hard";
  if (selectedDifficulty === "hard") return "hell";
  return null;
}

function startNextDifficultyCampaign(difficultyKey) {
  isEndlessHell = false;
  endlessRound = 0;
  selectedStage = campaignStartStage;
  setSelectedDifficulty(difficultyKey);
  const stageButton = stageSelect?.querySelector(`[data-stage="${selectedStage}"]`);
  if (stageButton) setSelected(stageSelect, stageButton);
  startRun();
}

function startEndlessHell(preserveGrowth = true) {
  isEndlessHell = true;
  endlessRound = 1;
  setSelectedDifficulty("hell");
  selectedStage = pickEndlessStage();
  campaignStartStage = selectedStage;
  campaignStages = [selectedStage];
  campaignIndex = 0;
  updateEndlessBestRoute(endlessRound);
  syncBgmForStage(!bgm.paused && bgmWanted && !bgmMutedByUser);
  transparentEnemySheet = null;
  transparentTerrainSheet = null;
  transparentBossSheet = null;
  const stageButton = stageSelect?.querySelector(`[data-stage="${selectedStage}"]`);
  if (stageButton) setSelected(stageSelect, stageButton);
  resetGame({ preserveLoadout: preserveGrowth, preserveGrowth });
  scoreRecorded = false;
  stageText.textContent = `无尽地狱 R${endlessRound} · ${stageConfigs[selectedStage].name}`;
}

function continueEndlessRoute() {
  endlessRound += 1;
  updateEndlessBestRoute(endlessRound);
  selectedStage = pickEndlessStage(selectedStage);
  campaignStartStage = selectedStage;
  campaignStages = [selectedStage];
  campaignIndex = 0;
  syncBgmForStage(!bgm.paused && bgmWanted && !bgmMutedByUser);
  transparentEnemySheet = null;
  transparentTerrainSheet = null;
  transparentBossSheet = null;
  const stageButton = stageSelect?.querySelector(`[data-stage="${selectedStage}"]`);
  if (stageButton) setSelected(stageSelect, stageButton);
  resetGame({ preserveLoadout: true, preserveGrowth: true });
  stageText.textContent = `无尽地狱 R${endlessRound} · 难度 +${Math.round((getEndlessDifficultyScale() - 1) * 100)}%`;
}

function pickEndlessStage(previousStage = "") {
  const pool = stageOrder.filter((stage) => stage !== previousStage);
  return (pool.length ? pool : stageOrder)[Math.floor(Math.random() * (pool.length ? pool.length : stageOrder.length))];
}

function getEndlessDifficultyScale() {
  return isEndlessHell ? 1 + Math.max(0, endlessRound - 1) * 0.2 : 1;
}

function setSelectedDifficulty(difficultyKey) {
  selectedDifficulty = difficultyKey;
  const difficultyButton = difficultySelect?.querySelector(`[data-difficulty="${difficultyKey}"]`);
  if (difficultyButton) setSelected(difficultySelect, difficultyButton);
}

function getVictoryTitle() {
  if (hasNextCampaignStage()) return "封锁线突破";
  if (isEndlessHell) return `无尽地狱 R${endlessRound} 突破`;
  if (selectedDifficulty === "normal") return "普通模式三关全通";
  if (selectedDifficulty === "hard") return "困难模式三关全通";
  return "地狱模式三关全通";
}

function getVictoryPrompt() {
  if (hasNextCampaignStage()) {
    return `${stageConfigs[selectedStage].bossName}已击破  按 R / CONTINUE 继续 ${stageConfigs[campaignStages[campaignIndex + 1]].name}`;
  }
  if (isEndlessHell) {
    return `按 R 进入无尽地狱 R${endlessRound + 1}  ·  按 MENU 返回主页`;
  }
  if (selectedDifficulty === "normal") return "按 R 进入困难模式  ·  按 MENU 返回主页";
  if (selectedDifficulty === "hard") return "按 R 进入地狱模式  ·  按 MENU 返回主页";
  return "按 R 进入无尽地狱模式  ·  按 MENU 返回主页";
}

function togglePause() {
  if (gameMode !== "playing" || player.hp <= 0 || victory) return;
  isPaused = !isPaused;
  if (isPaused) releaseAllVirtualKeys();
  updateMobilePauseButton();
  updateHud();
}

function setSelected(container, activeButton) {
  for (const button of container.querySelectorAll("button")) button.classList.remove("is-selected");
  activeButton.classList.add("is-selected");
}

function showHelpPanel() {
  helpPanel?.classList.remove("is-hidden");
}

function hideHelpPanel() {
  helpPanel?.classList.add("is-hidden");
}

function getDifficultyConfig() {
  return difficultyConfigs[selectedDifficulty] || difficultyConfigs.hard;
}

function getCharacterSheet() {
  return characterSheets[selectedCharacter] || characterSheets.vanguard;
}

function getCharacterAimSheet() {
  return characterAimSheets[selectedCharacter] || characterAimSheets.vanguard;
}

function getCharacterActionSheet() {
  return characterActionSheets[selectedCharacter] || characterActionSheets.vanguard;
}

function getStageBackground() {
  return stageBackgrounds[selectedStage] || stageBackgrounds.rooftop;
}

function getStageEnemySheet() {
  return stageEnemySheets[selectedStage] || stageEnemySheets.rooftop;
}

function getStageTerrainSheet() {
  return stageTerrainSheets[selectedStage] || stageTerrainSheets.rooftop;
}

function getStageBossSheet() {
  return stageBossSheets[selectedStage] || stageBossSheets.rooftop;
}

function updateStageLabel(text) {
  if (text) {
    stageText.textContent = text;
    return;
  }
  const stage = stageConfigs[selectedStage];
  const difficulty = getDifficultyConfig();
  stageText.textContent = isEndlessHell ? `无尽地狱 R${endlessRound} · ${stage.name}` : `${stage.name} · ${difficulty.label}`;
}

function readLeaderboard() {
  try {
    const rows = JSON.parse(localStorage.getItem(LEADERBOARD_KEY) || "[]");
    return Array.isArray(rows) ? rows : [];
  } catch {
    return [];
  }
}

function writeLeaderboard(rows) {
  try {
    localStorage.setItem(LEADERBOARD_KEY, JSON.stringify(rows));
  } catch {
    // Private browsing or file restrictions can block storage; gameplay should continue.
  }
}

function readLeaderboardMeta() {
  try {
    const meta = JSON.parse(localStorage.getItem(LEADERBOARD_META_KEY) || "{}");
    return meta && typeof meta === "object" ? meta : {};
  } catch {
    return {};
  }
}

function writeLeaderboardMeta(meta) {
  try {
    localStorage.setItem(LEADERBOARD_META_KEY, JSON.stringify(meta));
  } catch {
    // Storage is optional.
  }
}

function updateEndlessBestRoute(route) {
  const meta = readLeaderboardMeta();
  const current = Number(meta.endlessBestRoute || 0);
  if (route > current) {
    meta.endlessBestRoute = route;
    writeLeaderboardMeta(meta);
    renderLeaderboard();
  }
}

function recordRunScore(result) {
  if (scoreRecorded) return;
  scoreRecorded = true;
  const stage = stageConfigs[selectedStage];
  const difficulty = getDifficultyConfig();
  const character = characterConfigs[selectedCharacter];
  const rows = readLeaderboard();
  const modeName = isEndlessHell ? `无尽地狱 R${endlessRound}` : difficulty.label;
  rows.push({
    score: Math.max(0, Math.round(player.score)),
    result,
    character: character.name,
    stage: stage.name,
    difficulty: modeName,
    difficultyKey: isEndlessHell ? "endlessHell" : selectedDifficulty,
    endlessRound: isEndlessHell ? endlessRound : 0,
    timestamp: Date.now(),
    date: new Date().toLocaleString("zh-CN", { hour12: false }),
  });
  if (isEndlessHell) updateEndlessBestRoute(endlessRound);
  writeLeaderboard(rows.slice(-30));
  renderLeaderboard();
}

function renderLeaderboard() {
  if (!leaderboardList) return;
  const rows = readLeaderboard();
  const meta = readLeaderboardMeta();
  leaderboardList.innerHTML = "";
  const bestScore = rows.reduce((best, row) => (Number(row.score || 0) > Number(best?.score || -1) ? row : best), null);
  const endlessBest = Math.max(
    Number(meta.endlessBestRoute || 0),
    ...rows.map((row) => Number(row.endlessRound || 0))
  );
  const endlessItem = document.createElement("li");
  endlessItem.innerHTML = `<b>END</b><span>无尽地狱关数：${endlessBest > 0 ? `R${endlessBest}` : "未开启"}</span><em>ENDLESS</em>`;
  leaderboardList.appendChild(endlessItem);
  const bestItem = document.createElement("li");
  bestItem.innerHTML = bestScore
    ? `<b>BEST</b><span>最高分 ${String(bestScore.score).padStart(6, "0")} · ${bestScore.difficulty || "未知模式"}</span><em>${bestScore.result === "CLEAR" ? "CLEAR" : "DEFEAT"}</em>`
    : "<b>BEST</b><span>最高分 -- · 未记录</span><em>NO DATA</em>";
  leaderboardList.appendChild(bestItem);
  if (!rows.length) {
    const empty = document.createElement("li");
    empty.innerHTML = "<b>REC</b><span>暂无最近轮数积分</span><em>NO DATA</em>";
    leaderboardList.appendChild(empty);
    return;
  }
  rows.slice(-8).reverse().forEach((row, index) => {
    const item = document.createElement("li");
    const result = row.result === "CLEAR" ? "CLEAR" : "DEFEAT";
    item.innerHTML = `<b>R${String(index + 1).padStart(2, "0")}</b><span>${String(row.score).padStart(6, "0")} · ${row.character} · ${row.stage} · ${row.difficulty}</span><em>${result}</em>`;
    leaderboardList.appendChild(item);
  });
}

function getVirtualKeys(button) {
  return (button.dataset.keys || "").split(",").map((key) => key.trim()).filter(Boolean);
}

function releaseAllVirtualKeys() {
  virtualKeyHolds.clear();
  for (const key of ["a", "d", "s", "w", "j", "z", "k", "jump", "arrowleft", "arrowright", "arrowup", "arrowdown", " "]) {
    keys.delete(key);
  }
  resetTouchStick();
  if (!touchControls) return;
  for (const button of touchControls.querySelectorAll("[data-keys]")) {
    button.dataset.pressed = "false";
    button.classList.remove("is-pressed");
  }
}

function bindMobileButton(button, action) {
  if (!button) return;
  let pointerActivated = false;
  button.addEventListener("pointerdown", (event) => {
    if (button.disabled) return;
    event.preventDefault();
    event.stopPropagation();
    pointerActivated = true;
    action();
  });
  button.addEventListener("click", (event) => {
    event.preventDefault();
    event.stopPropagation();
    if (pointerActivated) {
      pointerActivated = false;
      return;
    }
    if (!button.disabled) action();
  });
}

function updateTouchStick(event) {
  const rect = touchStick.getBoundingClientRect();
  const radius = Math.min(rect.width, rect.height) * 0.5;
  const max = radius * 0.62;
  let dx = event.clientX - (rect.left + rect.width * 0.5);
  let dy = event.clientY - (rect.top + rect.height * 0.5);
  const distance = Math.hypot(dx, dy);
  if (distance > max) {
    const scale = max / distance;
    dx *= scale;
    dy *= scale;
  }
  touchStickState.x = clamp(dx / max, -1, 1);
  touchStickState.y = clamp(dy / max, -1, 1);
  const magnitude = Math.hypot(touchStickState.x, touchStickState.y);
  if (magnitude > 0.22) {
    touchStickState.aimX = touchStickState.x / magnitude;
    touchStickState.aimY = touchStickState.y / magnitude;
  }
  applyTouchStickKeys();
  if (touchStickKnob) {
    touchStickKnob.style.transform = `translate(${Math.round(dx)}px, ${Math.round(dy)}px)`;
  }
}

function resetTouchStick() {
  touchStickState.active = false;
  touchStickState.pointerId = null;
  touchStickState.x = 0;
  touchStickState.y = 0;
  touchStickState.aimX = 0;
  touchStickState.aimY = 0;
  for (const key of ["a", "d", "w", "s"]) clearTouchMovementKey(key);
  if (touchStickKnob) touchStickKnob.style.transform = "translate(0, 0)";
}

function applyTouchStickKeys() {
  const x = touchStickState.x;
  const y = touchStickState.y;
  clearTouchMovementKey("a");
  clearTouchMovementKey("d");
  clearTouchMovementKey("w");
  clearTouchMovementKey("s");
  if (x < -0.28) keys.add("a");
  if (x > 0.28) keys.add("d");
  // Mobile jump lives on the B button; pushing the stick upward is aim-only.
  if (y > 0.42) keys.add("s");
}

function clearTouchMovementKey(key) {
  if (!virtualKeyHolds.has(key)) keys.delete(key);
}

function pressVirtualKeys(button) {
  startBgmFromGesture();
  if (button.dataset.pressed === "true") return;
  button.dataset.pressed = "true";
  button.classList.add("is-pressed");
  for (const key of getVirtualKeys(button)) {
    virtualKeyHolds.set(key, (virtualKeyHolds.get(key) || 0) + 1);
    keys.add(key);
  }
}

function releaseVirtualKeys(button) {
  if (button.dataset.pressed !== "true") return;
  button.dataset.pressed = "false";
  const buttonKeys = getVirtualKeys(button);
  for (const key of buttonKeys) {
    const next = Math.max(0, (virtualKeyHolds.get(key) || 0) - 1);
    if (next > 0) {
      virtualKeyHolds.set(key, next);
    } else {
      virtualKeyHolds.delete(key);
      keys.delete(key);
    }
  }
  button.classList.remove("is-pressed");
  if (buttonKeys.includes("k")) releaseCharge();
  const jumpReleased = buttonKeys.includes("jump") || buttonKeys.includes(" ");
  if (jumpReleased && player.vy < -160) player.vy *= 0.58;
}

function resetGame(options = {}) {
  const character = characterConfigs[selectedCharacter];
  const difficulty = getDifficultyConfig();
  const preserveLoadout = options.preserveLoadout;
  const preserveGrowth = options.preserveGrowth;
  const retryCurrentStage = options.retryCurrentStage;
  const growthPenalty = options.growthPenalty || 0;
  const saved = preserveLoadout ? {
    hp: player.hp,
    score: player.score,
    weapon: preserveGrowth ? { ...player.weapon } : null,
    stella: preserveGrowth ? {
      active: stella.active,
      level: stella.level,
      shield: stella.shield,
      ultCd: stella.ultCd,
      chargePips: stella.chargePips,
    } : null,
  } : null;
  virtualKeyHolds.clear();
  if (touchControls) {
    for (const button of touchControls.querySelectorAll("[data-keys]")) {
      button.dataset.pressed = "false";
      button.classList.remove("is-pressed");
    }
  }
  player.x = 128;
  player.y = FLOOR - 58;
  player.vx = 0;
  player.vy = 0;
  player.crouching = false;
  player.maxHp = character.maxHp + difficulty.hpBonus;
  player.hp = player.maxHp;
  player.invuln = 0;
  player.charge = 0;
  player.score = 0;
  player.stageProgress = 0;
  player.weapon = { power: 0, wide: 0, rapid: 0 };
  stella.active = false;
  stella.level = 0;
  stella.shield = 0;
  stella.shotCd = 0;
  stella.pulseCd = 0;
  stella.ultCd = 0;
  stella.burstGlow = 0;
  stella.chargePips = 0;
  bullets.length = 0;
  enemyBullets.length = 0;
  enemies.length = 0;
  pickups.length = 0;
  obstacles.length = 0;
  platforms.length = 0;
  movingTerrain.length = 0;
  particles.length = 0;
  effects.length = 0;
  bossBeams.length = 0;
  spawnTimer = 0;
  pickupTimer = 1.2;
  weaponPickupTimer = 4.2;
  healPickupTimer = 20;
  obstacleTimer = 4.8;
  terrainTimer = 1.2;
  runTime = 0;
  bossSpawned = false;
  bossWarningTimer = 0;
  bossWarningStarted = false;
  bossClears = 0;
  scoreRecorded = preserveLoadout ? scoreRecorded : false;
  victory = false;
  screenShake = 0;
  ultimateSequence = null;
  gameOverTimer = 0;
  if (retryCurrentStage) {
    const currentIndex = campaignStages.indexOf(selectedStage);
    if (!campaignStages.length || currentIndex < 0) {
      campaignStages = buildCampaignStages(selectedStage);
      campaignIndex = 0;
      campaignStartStage = selectedStage;
    } else {
      campaignIndex = currentIndex;
    }
    routeScoreStart = 0;
  } else if (!preserveLoadout) {
    if (isEndlessHell) {
      campaignStartStage = selectedStage;
      campaignStages = [selectedStage];
    } else {
      selectedStage = campaignStartStage;
      campaignStages = buildCampaignStages(campaignStartStage);
    }
    campaignIndex = 0;
    routeScoreStart = 0;
  }
  if (preserveLoadout && saved) {
    player.score = saved.score;
    player.hp = Math.min(player.maxHp, Math.max(Math.ceil(player.maxHp * 0.58), saved.hp + 2));
    if (preserveGrowth && saved.weapon && saved.stella) {
      player.weapon = {
        power: Math.max(0, saved.weapon.power - growthPenalty),
        wide: Math.max(0, saved.weapon.wide - growthPenalty),
        rapid: Math.max(0, saved.weapon.rapid - growthPenalty),
      };
      stella.level = Math.max(0, saved.stella.level - growthPenalty);
      stella.active = saved.stella.active && stella.level > 0;
      stella.shield = stella.active ? Math.min(2, Math.max(saved.stella.shield, stella.level >= 2 ? 1 : 0)) : 0;
      stella.ultCd = saved.stella.ultCd;
      stella.chargePips = saved.stella.chargePips;
      stella.burstGlow = 0.42;
    }
    routeScoreStart = player.score;
  }
  seedTerrain();
  updateStageLabel();
  updateHud();
}

function loop(now) {
  if (document.hidden) {
    last = now;
    requestAnimationFrame(loop);
    return;
  }

  const paused = gameMode === "playing" && isPaused;
  const targetFps = gameMode === "playing" && player.hp > 0 && !victory && !paused ? 60 : 8;
  const minFrameMs = 1000 / targetFps;
  if (now - lastPaint < minFrameMs) {
    requestAnimationFrame(loop);
    return;
  }

  const dt = Math.min(0.033, (now - last) / 1000);
  last = now;
  lastPaint = now;
  if (!paused) time += dt;
  update(paused ? 0 : dt);
  draw();
  requestAnimationFrame(loop);
}

document.addEventListener("visibilitychange", () => {
  last = performance.now();
  lastPaint = 0;
});

function update(dt) {
  if (gameMode === "playing" && isPaused) {
    updateHud();
    return;
  }
  if (gameMode !== "playing") {
    screenShake = Math.max(0, screenShake - dt * 18);
    updateParticles(dt);
    updateEffects(dt);
    updateHud();
    return;
  }
  if (player.hp <= 0 || victory) {
    gameOverTimer += dt;
    updateParticles(dt);
    updateEffects(dt);
    updateHud();
    return;
  }

  player.invuln = Math.max(0, player.invuln - dt);
  player.fireCd = Math.max(0, player.fireCd - dt);
  stella.shotCd = Math.max(0, stella.shotCd - dt);
  stella.pulseCd = Math.max(0, stella.pulseCd - dt);
  stella.ultCd = Math.max(0, stella.ultCd - dt);
  stella.burstGlow = Math.max(0, stella.burstGlow - dt);
  screenShake = Math.max(0, screenShake - dt * 18);
  runTime += dt;
  const stage = stageConfigs[selectedStage];
  const difficulty = getDifficultyConfig();
  const routeScore = Math.max(0, player.score - routeScoreStart);
  const rawRouteProgress = runTime * stage.progress + routeScore / 205;
  player.stageProgress = bossSpawned || bossWarningStarted ? player.stageProgress : Math.min(100, rawRouteProgress / (ROUTE_LENGTH_SCALE * difficulty.routeLength));

  if (updateUltimateSequence(dt)) {
    updateParticles(dt);
    updateEffects(dt);
    updateHud();
    return;
  }

  if (updateBossWarning(dt)) {
    updateMovingTerrain(dt);
    updateObstacles(dt);
    updatePickups(dt);
    updateParticles(dt);
    updateEffects(dt);
    updateHud();
    return;
  }

  updatePlayer(dt);
  updateStella(dt);
  updateSpawns(dt);
  updateMovingTerrain(dt);
  updateObstacles(dt);
  updateBullets(dt);
  updateBossBeams(dt);
  updateEnemies(dt);
  updatePickups(dt);
  updateParticles(dt);
  updateEffects(dt);
  updateHud();
}

function updatePlayer(dt) {
  const character = characterConfigs[selectedCharacter];
  const left = keys.has("a") || keys.has("arrowleft");
  const right = keys.has("d") || keys.has("arrowright");
  const jump = keys.has("jump") || keys.has(" ");
  const down = keys.has("s") || keys.has("arrowdown");
  const shoot = keys.has("j") || keys.has("z");

  player.crouching = down && player.onGround;
  player.vx = 0;
  if (left) player.vx -= character.speed;
  if (right) player.vx += character.speed;
  if (player.crouching) player.vx *= 0.35;
  if (player.vx !== 0) player.facing = Math.sign(player.vx);

  if (jump && player.onGround && !down) {
    player.vy = character.jump;
    player.onGround = false;
    puff(player.x + 12, player.y + player.h, "#a7e7ff", 6);
  }

  if (shoot && player.fireCd <= 0) {
    firePlayer();
    player.fireCd = Math.max(0.052, character.fireBase - player.weapon.rapid * 0.028);
  }

  const prevY = player.y;
  player.vy += GRAVITY * 720 * dt;
  player.x = clamp(player.x + player.vx * dt, 28, W - 80);
  player.y += player.vy * dt;
  player.onGround = false;
  for (const platform of [...platforms, ...movingTerrain]) {
    const falling = player.vy >= 0;
    const wasAbove = prevY + player.h <= platform.y + 10;
    const overlapsX = player.x + player.w > platform.x && player.x < platform.x + platform.w;
    if (falling && wasAbove && overlapsX && player.y + player.h >= platform.y && player.y + player.h <= platform.y + 38) {
      player.y = platform.y - player.h;
      player.vy = 0;
      player.onGround = true;
      break;
    }
  }
  player.crouching = down && player.onGround;
  if (player.y > VOID_Y) {
    rescuePlayerFromVoid();
  }
}

function rescuePlayerFromVoid() {
  takeHit(2, player.x, player.y);
  if (player.hp <= 0) return;
  const support = findNearestRespawnSupport(player.x + player.w * 0.5);
  const safeX = support
    ? clamp(support.x + support.w * 0.5 - player.w * 0.5, support.x + 12, support.x + support.w - player.w - 12)
    : 96;
  const safeY = support ? support.y - player.h : FLOOR - player.h;
  player.x = clamp(safeX, 28, W - 80);
  player.y = safeY;
  player.vx = 0;
  player.vy = 0;
  player.onGround = true;
  player.crouching = false;
  player.invuln = Math.max(player.invuln, 1.2);
  spawnEffect("shield", player.x + player.w * 0.5, player.y + player.h * 0.5, 112, 0.36);
  puff(player.x + player.w * 0.5, player.y + player.h, "#80f7ff", 18);
}

function updateStella(dt) {
  if (!stella.active) return;
  const targetX = player.x - 54;
  const targetY = player.y - 42 + Math.sin(time * 4) * 7;
  stella.x += (targetX - stella.x) * Math.min(1, dt * 8);
  stella.y += (targetY - stella.y) * Math.min(1, dt * 8);

  const targets = nearestEnemies(stella.level >= 5 ? 2 : 1);
  if (targets.length && stella.shotCd <= 0) {
    for (const target of targets) fireStella(target);
    stella.shotCd = stella.level >= 5 ? 0.28 : stella.level >= 3 ? 0.34 : stella.level >= 2 ? 0.42 : 0.5;
  }

  if (stella.level >= 3 && stella.pulseCd <= 0) {
    pulse(stella.x, stella.y, stella.level >= 5 ? 136 : 104, stella.level >= 5 ? 3 : 2);
    stella.pulseCd = stella.level >= 5 ? 2.25 : 3.0;
  }
}

function updateSpawns(dt) {
  const difficulty = getDifficultyConfig();
  spawnTimer -= dt;
  pickupTimer -= dt;
  weaponPickupTimer -= dt;
  healPickupTimer -= dt;
  obstacleTimer -= dt;
  terrainTimer -= dt;

  if (!bossSpawned && !bossWarningStarted && player.stageProgress >= 100) {
    startBossWarning();
    return;
  }

  if (spawnTimer <= 0 && !hasBoss()) {
    const tier = getCombatTier();
    const upgradePressure = tier + Math.max(0, stella.level - 1);
    const routePressure = Math.floor(player.stageProgress / 22);
    const pressure = Math.min(enemyTypes.length - 1, Math.floor(player.score / 520) + Math.floor(runTime / 26) + Math.floor(upgradePressure / 2) + routePressure);
    const leftRush = shouldSpawnLeftRush();
    const type = leftRush ? chooseLeftRushEnemyType(pressure, upgradePressure) : chooseEnemyType(pressure, upgradePressure);
    spawnEnemy(type, undefined, leftRush ? { entrySide: "left", rush: true } : undefined);
    if (tier >= 3 && Math.random() < (0.18 + upgradePressure * 0.045 + player.stageProgress * 0.002) * difficulty.extraChance) {
      const extraType = chooseEnemyType(pressure + 1, upgradePressure + 1);
      spawnEnemy(extraType, W + 120 + Math.random() * 130);
    }
    if (upgradePressure >= 7 && player.stageProgress > 48 && Math.random() < (0.24 + upgradePressure * 0.018) * difficulty.extraChance) {
      spawnEnemy(chooseEnemyType(pressure + 2, upgradePressure + 2), W + 210 + Math.random() * 120);
    }
    if (selectedDifficulty === "hell" && player.stageProgress > 55 && Math.random() < 0.18 + upgradePressure * 0.018) {
      const hellType = chooseEnemyType(pressure + 3, upgradePressure + 3);
      spawnEnemy(hellType, W + 260 + Math.random() * 170);
    }
    const upgradeRamp = upgradePressure * 0.03 + Math.max(0, player.stageProgress - 35) * 0.003;
    spawnTimer = Math.max(0.16, ((1.34 - pressure * 0.055 - upgradeRamp) * difficulty.spawnInterval) / getEndlessDifficultyScale());
  }

  if (pickupTimer <= 0) {
    spawnPickup("stella");
    pickupTimer = bossSpawned ? 7.5 : (4.8 + Math.random() * 1.2) * (selectedDifficulty === "normal" ? 0.92 : selectedDifficulty === "hell" ? 1.08 : 1);
  }

  if (weaponPickupTimer <= 0) {
    spawnPickup(pickupTypes[Math.floor(Math.random() * 3)]);
    weaponPickupTimer = 5.8 + Math.random() * 1.8;
  }

  if (healPickupTimer <= 0) {
    if (player.hp < player.maxHp || Math.random() < 0.35) spawnPickup("health");
    healPickupTimer = 24 + Math.random() * 12;
  }

  if (obstacleTimer <= 0) {
    spawnObstacle();
    obstacleTimer = 4.6 + Math.random() * 3.1;
  }

  if (terrainTimer <= 0 && !hasBoss()) {
    spawnTerrainSegment();
    terrainTimer = 1.6 + Math.random() * 0.9;
  }
}

function chooseEnemyType(pressure, upgradePressure) {
  const maxIndex = Math.min(enemyTypes.length, 3 + pressure);
  if (selectedStage === "slum") {
    const pool = player.stageProgress > 58 || upgradePressure >= 6
      ? [2, 3, 3, 4, 5, 6, 7, 0]
      : [2, 3, 3, 4, 5, 0, 1];
    return enemyTypes[pool[Math.floor(Math.random() * pool.length)]];
  }
  if (selectedStage === "virtual") {
    const pool = player.stageProgress > 55 || upgradePressure >= 6
      ? [0, 1, 1, 4, 5, 7, 7, 6]
      : [0, 1, 1, 2, 4, 7];
    return enemyTypes[pool[Math.floor(Math.random() * pool.length)]];
  }
  return enemyTypes[Math.floor(Math.random() * maxIndex)];
}

function shouldSpawnLeftRush() {
  if (player.stageProgress < 8 || player.stageProgress > 92 || hasBoss()) return false;
  const difficulty = getDifficultyConfig();
  const activeLeftRushes = enemies.filter((e) => e.entrySide === "left" && e.hp > 0).length;
  const maxLeftRushes = isEndlessHell ? Math.min(10, 6 + Math.floor((endlessRound - 1) / 2)) : selectedDifficulty === "hell" ? 6 : selectedDifficulty === "hard" ? 4 : 2;
  if (activeLeftRushes >= maxLeftRushes) return false;
  const chance = Math.min(0.88, 0.2 * (difficulty.leftRushMultiplier || 1) * getEndlessDifficultyScale());
  return Math.random() < chance;
}

function chooseLeftRushEnemyType(pressure, upgradePressure) {
  if (selectedStage === "virtual") {
    const pool = player.stageProgress > 55 || upgradePressure >= 6 ? [1, 3, 7, 3, 1] : [1, 3, 1];
    return enemyTypes[pool[Math.floor(Math.random() * pool.length)]];
  }
  if (selectedStage === "slum") {
    const pool = player.stageProgress > 58 || pressure >= 4 ? [3, 1, 7, 3, 1] : [3, 1, 3];
    return enemyTypes[pool[Math.floor(Math.random() * pool.length)]];
  }
  const pool = pressure >= 4 ? [3, 1, 3, 7] : [3, 1, 3];
  return enemyTypes[pool[Math.floor(Math.random() * pool.length)]];
}

function startBossWarning() {
  const difficulty = getDifficultyConfig();
  const stage = stageConfigs[selectedStage];
  bossWarningStarted = true;
  bossWarningTimer = 2.35;
  player.stageProgress = 100;
  stageText.textContent = difficulty.bossCount > 1
    ? `WARNING：Boss ${bossClears + 1}/${difficulty.bossCount} 接近`
    : `WARNING：${stage.bossName}接近`;
  screenShake = 14;
  enemyBullets.length = 0;
  spawnEffect("burst", W * 0.5, H * 0.47, 460, 0.78);
}

function updateBossWarning(dt) {
  if (!bossWarningStarted || bossSpawned) return false;
  bossWarningTimer -= dt;
  screenShake = Math.max(screenShake, 9 + Math.sin(time * 32) * 3);
  if (bossWarningTimer <= 0) {
    bossWarningStarted = false;
    spawnBoss();
    bossSpawned = true;
    return false;
  }
  return true;
}

function updateBullets(dt) {
  for (const b of bullets) {
    if (b.waveAmp) {
      const prev = Math.sin((b.waveT || 0) * b.waveFreq + (b.wavePhase || 0)) * b.waveAmp;
      b.waveT = (b.waveT || 0) + dt;
      const next = Math.sin(b.waveT * b.waveFreq + (b.wavePhase || 0)) * b.waveAmp;
      const speed = Math.hypot(b.vx, b.vy) || 1;
      const nx = -b.vy / speed;
      const ny = b.vx / speed;
      b.x += nx * (next - prev);
      b.y += ny * (next - prev);
    }
    b.x += b.vx * dt;
    b.y += b.vy * dt;
    b.life -= dt;
  }
  for (const b of enemyBullets) {
    if (b.ay) b.vy += b.ay * dt;
    if (b.turn) {
      const target = Math.atan2(player.y + player.h * 0.45 - b.y, player.x + player.w * 0.5 - b.x);
      const current = Math.atan2(b.vy, b.vx);
      let delta = target - current;
      while (delta > Math.PI) delta -= Math.PI * 2;
      while (delta < -Math.PI) delta += Math.PI * 2;
      const next = current + clamp(delta, -b.turn * dt, b.turn * dt);
      const speed = Math.hypot(b.vx, b.vy);
      b.vx = Math.cos(next) * speed;
      b.vy = Math.sin(next) * speed;
      b.turn = Math.max(0, b.turn - dt * 0.45);
    }
    b.x += b.vx * dt;
    b.y += b.vy * dt;
    b.life -= dt;
  }

  for (const b of bullets) {
    if (b.life <= 0) continue;
    for (const eb of enemyBullets) {
      if (eb.life > 0 && hit(b, eb)) {
        eb.life = 0;
        if (b.owner !== "stella") b.life = 0;
        spawnEffect("cancel", eb.x, eb.y, 38);
        puff(eb.x, eb.y, "#9ff8ff", 5);
        break;
      }
    }
    if (b.life <= 0) continue;
    for (const o of obstacles) {
      if (o.hp > 0 && hit(b, o)) {
        o.hp -= b.damage;
        b.life = 0;
        spawnEffect("hit", b.x, b.y, 42);
        puff(b.x, b.y, b.color, 4);
        if (o.hp <= 0) breakObstacle(o);
        break;
      }
    }
    if (b.life <= 0) continue;
    for (const e of enemies) {
      if (e.hp > 0 && hit(b, e)) {
        const hitDamage = getPlayerBulletDamage(b, e);
        damageEnemy(e, hitDamage);
        applyPlayerBulletEffect(b, e);
        if (b.pierce && b.pierce > 0) {
          b.pierce -= 1;
        } else {
          b.life = 0;
        }
        spawnEffect(e.kind === "boss" ? "hit" : "hit", b.x, b.y, 46);
        puff(b.x, b.y, b.color, 5);
        if (e.hp <= 0) killEnemy(e);
        break;
      }
    }
  }

  for (const b of enemyBullets) {
    if (b.life > 0 && hit(b, player)) {
      b.life = 0;
      takeHit(b.damage || 1, b.x, b.y);
    }
  }

  prune(bullets);
  prune(enemyBullets);
}

function getPlayerBulletDamage(b, e) {
  if (b.kind === "flame" && e.kind === "shield") return b.damage + 2 + player.weapon.power;
  if (b.kind === "rail" && e.kind !== "boss" && player.weapon.power >= 2) return b.damage + 1;
  return b.damage;
}

function applyPlayerBulletEffect(b, e) {
  if (b.kind === "flame") {
    igniteEnemy(e, 1.25 + player.weapon.power * 0.24, 1 + Math.floor(player.weapon.wide / 2));
    if (player.weapon.wide >= 2) {
      spawnEffect("burst", e.x + e.w * 0.5, e.y + e.h * 0.45, e.kind === "boss" ? 90 : 58, 0.24);
    }
    return;
  }
  if (b.kind === "rail") {
    spawnRailArc(e, 1 + Math.floor(player.weapon.power / 2));
  }
}

function igniteEnemy(e, duration, damage) {
  e.burn = Math.max(e.burn || 0, duration);
  e.burnDamage = Math.max(e.burnDamage || 0, damage);
  e.burnTick = Math.min(e.burnTick || 0.18, 0.18);
}

function updateEnemyStatus(e, dt) {
  if (!e.burn) return;
  e.burn = Math.max(0, e.burn - dt);
  e.burnTick = Math.max(0, (e.burnTick || 0) - dt);
  if (e.burnTick <= 0) {
    e.burnTick = e.kind === "boss" ? 0.45 : 0.32;
    damageEnemy(e, e.kind === "boss" ? Math.max(1, Math.floor((e.burnDamage || 1) * 0.5)) : e.burnDamage || 1);
    puff(e.x + e.w * 0.5, e.y + e.h * 0.45, "#ff8a5d", e.kind === "boss" ? 4 : 2);
  }
}

function spawnRailArc(source, jumps) {
  if (jumps <= 0) return;
  const sourceX = source.x + source.w * 0.5;
  const sourceY = source.y + source.h * 0.42;
  const targets = enemies
    .filter((e) => e !== source && e.hp > 0 && e.kind !== "boss")
    .map((e) => {
      const dx = e.x + e.w * 0.5 - sourceX;
      const dy = e.y + e.h * 0.5 - sourceY;
      return { e, d: dx * dx + dy * dy };
    })
    .filter((item) => item.d < 190 * 190)
    .sort((a, b) => a.d - b.d)
    .slice(0, jumps);
  for (const { e } of targets) {
    damageEnemy(e, 1 + Math.floor(player.weapon.rapid / 2));
    spawnEffect("cancel", e.x + e.w * 0.5, e.y + e.h * 0.45, 58, 0.26);
    puff(e.x + e.w * 0.5, e.y + e.h * 0.45, "#9ff8ff", 5);
    if (e.hp <= 0) killEnemy(e);
  }
  if (targets.length) spawnEffect("starfall", sourceX, sourceY, 92, 0.28);
}

function updateBossBeams(dt) {
  for (const beam of bossBeams) {
    beam.life -= dt;
    beam.warning -= dt;
    if (beam.warning <= 0 && beam.life > 0 && hit(beam, player)) {
      takeHit(beam.damage, player.x, player.y);
      beam.damage = 0;
    }
  }
  for (let i = bossBeams.length - 1; i >= 0; i -= 1) {
    if (bossBeams[i].life <= 0) bossBeams.splice(i, 1);
  }
}

function updateEnemies(dt) {
  for (const e of enemies) {
    updateEnemyStatus(e, dt);
    if (e.hp <= 0) {
      killEnemy(e);
      continue;
    }
    if (e.kind === "boss") {
      updateBoss(e, dt);
      continue;
    }
    e.t += dt;
    e.fireCd -= dt;
    if (isRooftopLowHoverKind(e.kind)) {
      updateRooftopLowHoverEnemy(e, dt);
    } else if (groundedEnemyKinds.has(e.kind)) {
      updateGroundEnemyMovement(e, dt);
    } else {
      e.x += getEnemyMoveDir(e) * e.speed * dt;
      if (e.kind === "drone" || e.kind === "fastDrone" || e.kind === "bomber") e.y += Math.sin(e.t * (e.kind === "fastDrone" ? 5 : 3)) * 20 * dt;
    }

    if (e.fireCd <= 0) {
      fireEnemy(e);
      e.fireCd = e.fire * (e.holdAtEdge ? 0.86 : 1);
    }

    if (e.kind === "bomber" && Math.abs(e.x - player.x) < 42 && Math.abs(e.y - player.y) < 120) {
      takeHit(2, e.x, e.y);
      e.hp = 0;
      killEnemy(e, false);
      continue;
    }

    if (e.hp > 0 && hit(e, player)) {
      takeHit(1, e.x, e.y);
      e.hp = 0;
      killEnemy(e, false);
    }
  }
  for (let i = enemies.length - 1; i >= 0; i -= 1) {
    const e = enemies[i];
    const offscreen = e.entrySide === "left" ? e.x > W + 160 : e.x < -120;
    if (e.hp <= 0 || (e.kind !== "boss" && (offscreen || e.y > H + 100))) enemies.splice(i, 1);
  }
}

function updateGroundEnemyMovement(e, dt) {
  const dir = getEnemyMoveDir(e);
  e.jumpCd = Math.max(0, (e.jumpCd || 0) - dt);
  e.edgeRetreat = Math.max(0, (e.edgeRetreat || 0) - dt);
  e.holdAtEdge = false;
  const support = findSupportUnder(e, e.vy ? 54 : 28);

  if (support && e.vy >= 0) {
    e.y = support.y - e.h;
    e.vy = 0;
    e.onGround = true;
    const minCenter = support.x + 12;
    const maxCenter = support.x + support.w - 12;
    const center = clamp(e.x + e.w * 0.5, minCenter, maxCenter);
    e.x = center - e.w * 0.5;
  } else {
    e.onGround = false;
    e.vy += 820 * dt;
    e.y += e.vy * dt;
  }

  if (e.edgeRetreat > 0 && support) {
    e.holdAtEdge = true;
    e.x += ((support.vx || TERRAIN_SCROLL_SPEED) - dir * e.speed * 0.72) * dt;
    return;
  }

  const nextX = e.x + dir * e.speed * dt;
  const probeX = nextX + dir * Math.max(12, e.speed * 0.14);
  const nextSupport = findSupportAt(probeX, e.w, e.y + e.h + 38);
  const canMove = !e.onGround || (nextSupport && Math.abs(nextSupport.y - (e.y + e.h)) < 50);

  if (canMove) {
    e.x = nextX;
    return;
  }

  const jumpTarget = e.kind === "runner" ? findRunnerJumpTarget(e, dir) : null;
  if (jumpTarget && e.jumpCd <= 0) {
    e.vy = -360;
    e.x = nextX + dir * 8;
    e.jumpCd = 1.25;
    e.onGround = false;
    return;
  }

  e.holdAtEdge = true;
  e.edgeRetreat = e.kind === "runner" ? 0.18 : 0.52;
  e.x += ((support?.vx || TERRAIN_SCROLL_SPEED) - dir * e.speed * 0.45) * dt;
}

function updateRooftopLowHoverEnemy(e, dt) {
  const hoverBase = FLOOR - (e.kind === "heavy" ? 152 : 140);
  const hoverWave = Math.sin(e.t * 2.4 + (e.kind === "heavy" ? 0.8 : 0)) * 12;
  e.x += getEnemyMoveDir(e) * e.speed * 0.62 * dt;
  e.y = getSafeRooftopHoverY(e, hoverBase + hoverWave);
  e.vy = 0;
  e.onGround = false;
  e.holdAtEdge = false;
}

function getEnemyMoveDir(e) {
  return e.entrySide === "left" ? 1 : -1;
}

function getSafeRooftopHoverY(e, preferredY) {
  const draw = getEnemyDrawBox(e);
  const visualBottomOffset = draw.y + draw.h;
  const overlapPadding = 18;
  let maxVisualBottom = FLOOR - 48;
  for (const platform of movingTerrain) {
    if (platform.type !== "upper" && platform.type !== "step") continue;
    const visualLeft = e.x + draw.x + 12;
    const visualRight = e.x + draw.x + draw.w - 12;
    const overlapsX = visualRight > platform.x && visualLeft < platform.x + platform.w;
    if (overlapsX) maxVisualBottom = Math.min(maxVisualBottom, platform.y - overlapPadding);
  }
  return Math.min(preferredY, maxVisualBottom - visualBottomOffset);
}

function updatePickups(dt) {
  for (const p of pickups) {
    p.x += p.vx * dt;
    p.y += Math.sin((time + p.t) * 5) * 20 * dt;
    p.t += dt;
    if (hit(p, player)) {
      collectPickup(p.type || "stella");
      p.dead = true;
      puff(p.x, p.y, getPickupColor(p.type || "stella"), 18);
    }
  }
  for (let i = pickups.length - 1; i >= 0; i -= 1) {
    if (pickups[i].dead || pickups[i].x < -60) pickups.splice(i, 1);
  }
}

function updateObstacles(dt) {
  for (const o of obstacles) {
    o.x += (o.vx || TERRAIN_SCROLL_SPEED) * dt;
    const support = findSupportAt(o.x, o.w, o.y + o.h + 34);
    if (!support || Math.abs(support.y - (o.y + o.h)) > 42) {
      o.dead = true;
      continue;
    }
    o.y = support.y - o.h;
    if (o.hp > 0 && hit(o, player)) {
      takeHit(o.damage || (o.kind === "barrel" ? 2 : 1), o.x, o.y);
      if (o.kind === "barrel") breakObstacle(o);
    }
  }
  for (let i = obstacles.length - 1; i >= 0; i -= 1) {
    if (obstacles[i].dead || obstacles[i].x < -120) obstacles.splice(i, 1);
  }
}

function updateMovingTerrain(dt) {
  for (const p of movingTerrain) {
    p.x += p.vx * dt;
    if (p.lift) p.y = (p.baseY || p.y) + Math.sin(time * 1.45 + (p.phase || 0)) * (p.amp || 22);
  }
  for (let i = movingTerrain.length - 1; i >= 0; i -= 1) {
    if (movingTerrain[i].x + movingTerrain[i].w < -160) movingTerrain.splice(i, 1);
  }
}

function updateParticles(dt) {
  for (const p of particles) {
    p.x += p.vx * dt;
    p.y += p.vy * dt;
    p.vy += 260 * dt;
    p.life -= dt;
  }
  for (let i = particles.length - 1; i >= 0; i -= 1) {
    if (particles[i].life <= 0) particles.splice(i, 1);
  }
}

function updateEffects(dt) {
  for (const e of effects) {
    e.t += dt;
    e.life -= dt;
    e.x += (e.vx || 0) * dt;
    e.y += (e.vy || 0) * dt;
  }
  for (let i = effects.length - 1; i >= 0; i -= 1) {
    if (effects[i].life <= 0) effects.splice(i, 1);
  }
}

function getPlayerMuzzlePoint(angle) {
  const cos = Math.cos(angle);
  const sin = Math.sin(angle);
  const vertical = Math.abs(cos) < 0.35;
  const diagonal = Math.abs(cos) >= 0.35 && Math.abs(sin) >= 0.35;
  const dir = cos >= 0 ? 1 : -1;
  if (vertical && sin < 0) {
    return {
      x: player.x + player.w * 0.52,
      y: player.y - 6,
    };
  }
  if (vertical && sin > 0) {
    return {
      x: player.x + player.w * 0.5,
      y: player.y + player.h + 8,
    };
  }
  if (diagonal) {
    return {
      x: player.x + (dir > 0 ? 70 : -34),
      y: player.y + (sin < 0 ? 10 : player.h + 2),
    };
  }
  if (player.crouching) {
    return {
      x: player.x + (player.facing > 0 ? 84 : -48),
      y: player.y + 44,
    };
  }
  return {
    x: player.x + (player.facing > 0 ? 94 : -58),
    y: player.y + 28,
  };
}

function firePlayer() {
  const character = characterConfigs[selectedCharacter];
  if (character.type === "arc") {
    fireFlamePlayer(character);
    return;
  }
  if (character.type === "rail") {
    fireRailPlayer(character);
    return;
  }
  fireRiflePlayer(character);
}

function fireRiflePlayer(character) {
  const baseAngle = getPlayerAimAngle();
  const muzzle = getPlayerMuzzlePoint(baseAngle);
  const spread = player.weapon.wide;
  const lanes = spread >= 3 ? [-0.13, 0, 0.13] : spread >= 1 ? [-0.075, 0.075] : [0];
  for (const angle of lanes) {
    const shotAngle = baseAngle + angle;
    const upgraded = player.weapon.power + spread >= 3;
    const sizeBoost = upgraded ? 1.85 : player.weapon.power >= 1 || spread >= 1 ? 1.25 : 1;
    const baseW = (20 + player.weapon.power * 3 + spread * 2) * sizeBoost;
    const baseH = (7 + Math.min(3, spread + player.weapon.power)) * (upgraded ? 1.65 : sizeBoost);
    const shotVertical = Math.abs(Math.cos(shotAngle)) < 0.35;
    const shotDiagonal = !shotVertical && Math.abs(Math.sin(shotAngle)) >= 0.35;
    bullets.push({
      x: muzzle.x,
      y: muzzle.y,
      w: shotVertical ? baseH : shotDiagonal ? Math.max(8, Math.round(baseW * 0.72)) : baseW,
      h: shotVertical ? baseW : shotDiagonal ? Math.max(7, Math.round(baseH * 1.35)) : baseH,
      vx: Math.cos(shotAngle) * 660,
      vy: Math.sin(shotAngle) * 660,
      damage: Math.max(1, Math.round((1 + player.weapon.power * 0.86) * character.power)),
      life: 1.06 + spread * 0.07,
      color: player.weapon.power >= 2 ? "#ff8a5d" : "#ffd36c",
      kind: player.weapon.power + spread >= 3 ? "rifleWave" : "rifle",
      owner: "player",
      pierce: spread >= 3 ? 1 : 0,
      waveAmp: player.weapon.power + spread >= 3 ? 1.4 + spread * 0.55 : 0,
      waveFreq: 13 + player.weapon.power,
      wavePhase: angle * 12,
    });
  }
  if (player.weapon.power >= 3 && spread >= 2) {
    const cos = Math.cos(baseAngle);
    const sin = Math.sin(baseAngle);
    const shotVertical = Math.abs(cos) < 0.35;
    bullets.push({
      x: muzzle.x + cos * 12,
      y: muzzle.y + sin * 12,
      w: shotVertical ? 24 + spread * 3 : 66 + player.weapon.power * 8,
      h: shotVertical ? 66 + player.weapon.power * 8 : 24 + spread * 3,
      vx: cos * 520,
      vy: sin * 520,
      damage: Math.max(1, Math.round((0.62 + player.weapon.power * 0.34) * character.power)),
      life: 0.42 + spread * 0.035,
      color: "#ff605c",
      kind: "rifleWave",
      owner: "player",
      pierce: 1,
      waveAmp: 2.6 + spread * 0.8,
      waveFreq: 9,
      wavePhase: time * 3,
    });
  }
  puff(muzzle.x, muzzle.y, "#ffd36c", 3);
}

function fireFlamePlayer(character) {
  const baseAngle = getPlayerAimAngle();
  const muzzle = getPlayerMuzzlePoint(baseAngle);
  const spread = player.weapon.wide;
  const cone = spread >= 3 ? [-0.2, -0.1, 0, 0.1, 0.2] : spread >= 1 ? [-0.13, 0, 0.13] : [0];
  const range = 360 + player.weapon.power * 34 + spread * 22;
  for (let i = 0; i < cone.length; i += 1) {
    const shotAngle = baseAngle + cone[i];
    const cos = Math.cos(shotAngle);
    const sin = Math.sin(shotAngle);
    const size = 28 + player.weapon.power * 4 + spread * 4;
    const length = 58 + player.weapon.power * 10 + spread * 7;
    const thick = 17 + player.weapon.power * 2 + spread * 1.5;
    const horizontal = Math.abs(cos) > 0.35;
    bullets.push({
      x: muzzle.x + cos * 14,
      y: muzzle.y + sin * 14 - thick * 0.5,
      w: horizontal ? length : thick,
      h: horizontal ? thick : length,
      vx: cos * range,
      vy: sin * range + Math.sin(time * 9 + i) * 10,
      damage: Math.max(1, Math.round((1.0 + player.weapon.power * 0.5) * character.power)),
      life: 0.42 + spread * 0.03,
      color: i % 2 ? "#ff8a5d" : "#fff1b8",
      kind: "flame",
      owner: "player",
      pierce: 3 + Math.floor(spread / 2),
      radius: size,
      stream: true,
      streamLength: length,
    });
  }
  if (player.weapon.power >= 2) {
    const cos = Math.cos(baseAngle);
    const sin = Math.sin(baseAngle);
    const horizontal = Math.abs(cos) > 0.35;
    bullets.push({
      x: muzzle.x + cos * 18,
      y: muzzle.y + sin * 18 - 18,
      w: horizontal ? 86 + spread * 8 : 28,
      h: horizontal ? 28 : 86 + spread * 8,
      vx: cos * 320,
      vy: sin * 320,
      damage: 1 + Math.floor(player.weapon.power / 2),
      life: 0.44,
      color: "#b970ff",
      kind: "flame",
      owner: "player",
      pierce: 5,
      radius: 40,
      stream: true,
      streamLength: 96,
    });
  }
  puff(muzzle.x, muzzle.y, "#ff8a5d", 7);
}

function fireRailPlayer(character) {
  const baseAngle = getPlayerAimAngle();
  const muzzle = getPlayerMuzzlePoint(baseAngle);
  const spread = player.weapon.wide;
  const lanes = spread >= 3 ? [-0.05, 0, 0.05] : [0];
  for (const offset of lanes) {
    const shotAngle = baseAngle + offset;
    const shotVertical = Math.abs(Math.cos(shotAngle)) < 0.35;
    const shotDiagonal = !shotVertical && Math.abs(Math.sin(shotAngle)) >= 0.35;
    const overcharged = player.weapon.power >= 3 || spread >= 3;
    const length = 50 + player.weapon.power * 12 + (overcharged ? 16 : 0);
    bullets.push({
      x: muzzle.x,
      y: muzzle.y,
      w: shotVertical ? (overcharged ? 10 : 8) : shotDiagonal ? (overcharged ? 48 : 38) : length,
      h: shotVertical ? length : shotDiagonal ? (overcharged ? 10 : 8) : (overcharged ? 10 : 8),
      vx: Math.cos(shotAngle) * 940,
      vy: Math.sin(shotAngle) * 940,
      damage: Math.max(2, Math.round((1.35 + player.weapon.power * 0.92) * character.power)),
      life: 1.14 + spread * 0.07,
      color: "#9ff8ff",
      kind: "rail",
      owner: "player",
      pierce: 3 + Math.floor(player.weapon.power / 2),
      beam: true,
      overcharged,
    });
  }
  puff(muzzle.x, muzzle.y, player.weapon.power >= 3 || spread >= 3 ? "#ffffff" : "#9ff8ff", 4);
}

function getPlayerAimAngle() {
  const touchMagnitude = Math.hypot(touchStickState.aimX, touchStickState.aimY);
  const shooting = keys.has("j") || keys.has("z");
  if (shooting && touchMagnitude > 0.25) {
    return Math.atan2(touchStickState.aimY, touchStickState.aimX);
  }
  const left = keys.has("a") || keys.has("arrowleft");
  const right = keys.has("d") || keys.has("arrowright");
  const up = keys.has("w") || keys.has("arrowup");
  const down = keys.has("s") || keys.has("arrowdown");
  const hasHorizontal = left !== right;
  const aimX = hasHorizontal ? (right ? 1 : -1) : player.facing;
  if (up && !down) {
    return hasHorizontal ? Math.atan2(-1, aimX) : -Math.PI / 2;
  }
  if (down && !up && !player.onGround) {
    return hasHorizontal ? Math.atan2(1, aimX) : Math.PI / 2;
  }
  return player.facing > 0 ? 0 : Math.PI;
}

function fireStella(target) {
  const base = Math.atan2(target.y + target.h * 0.5 - stella.y, target.x - stella.x);
  const level = stella.level;
  const shots = level >= 5
    ? [
      { offset: -0.2, speed: 500, w: 16, h: 16, damage: 2, kind: "stellaStar", color: "#ff77d9", pierce: 1 },
      { offset: 0, speed: 560, w: 34, h: 10, damage: 3, kind: "stellaLance", color: "#9ff8ff", pierce: 2 },
      { offset: 0.2, speed: 500, w: 16, h: 16, damage: 2, kind: "stellaStar", color: "#ff77d9", pierce: 1 },
    ]
    : level >= 4
      ? [
        { offset: -0.08, speed: 520, w: 28, h: 9, damage: 2, kind: "stellaLance", color: "#9ff8ff", pierce: 1 },
        { offset: 0.08, speed: 520, w: 28, h: 9, damage: 2, kind: "stellaLance", color: "#9ff8ff", pierce: 1 },
      ]
      : level >= 3
        ? [
          { offset: -0.16, speed: 470, w: 14, h: 14, damage: 2, kind: "stellaShard", color: "#70f2ff", pierce: 0 },
          { offset: 0.16, speed: 470, w: 14, h: 14, damage: 2, kind: "stellaShard", color: "#70f2ff", pierce: 0 },
        ]
        : level >= 2
          ? [
            { offset: -0.1, speed: 440, w: 12, h: 12, damage: 1, kind: "stellaBolt", color: "#70f2ff", pierce: 0 },
            { offset: 0.1, speed: 440, w: 12, h: 12, damage: 1, kind: "stellaBolt", color: "#70f2ff", pierce: 0 },
          ]
          : [
            { offset: 0, speed: 420, w: 10, h: 10, damage: 1, kind: "stella", color: "#70f2ff", pierce: 0 },
          ];
  for (const shot of shots) {
    const angle = base + shot.offset;
    const vertical = Math.abs(Math.cos(angle)) < 0.35;
    bullets.push({
      x: stella.x + 8,
      y: stella.y,
      w: vertical && shot.kind === "stellaLance" ? shot.h : shot.w,
      h: vertical && shot.kind === "stellaLance" ? shot.w : shot.h,
      vx: Math.cos(angle) * shot.speed,
      vy: Math.sin(angle) * shot.speed,
      damage: shot.damage,
      life: level >= 4 ? 1.42 : 1.25,
      color: shot.color,
      kind: shot.kind,
      owner: "stella",
      pierce: shot.pierce,
      spin: level >= 3 ? (shot.offset || 0.5) * 8 : 0,
    });
  }
}

function fireEnemy(e) {
  if (e.kind === "boss") return fireBoss(e);
  const originX = e.x + (e.kind === "turret" ? 8 : 0);
  const originY = e.y + e.h * 0.42;
  const targetY = player.y + player.h * 0.45;
  const base = Math.atan2(targetY - originY, player.x + player.w * 0.35 - originX);
  const clampVy = (speed, maxVy) => {
    const vx = Math.cos(base) * speed;
    const vy = clamp(Math.sin(base) * speed, -maxVy, maxVy);
    return { vx, vy };
  };

  if (e.kind === "drone") {
    const v = clampVy(150, 78);
    pushEnemyBullet({ x: originX, y: originY, w: 11, h: 11, vx: v.vx, vy: v.vy, life: 3.0, style: "orb", color: "#ff77b7" });
    return;
  }
  if (e.kind === "fastDrone") {
    const v = clampVy(220, 112);
    pushEnemyBullet({ x: originX, y: originY, w: 18, h: 5, vx: v.vx, vy: v.vy, life: 2.1, style: "needle", color: "#ff5b57" });
    return;
  }
  if (e.kind === "trooper") {
    const v = clampVy(236, 74);
    pushEnemyBullet({ x: originX - 6, y: originY + 4, w: 16, h: 6, vx: v.vx, vy: v.vy, life: 3.45, style: "slug", color: "#ffd36c", groundShot: true });
    return;
  }
  if (e.kind === "runner") {
    const v = clampVy(238, 60);
    pushEnemyBullet({ x: originX, y: originY + 8, w: 13, h: 7, vx: v.vx, vy: v.vy, life: 3.0, style: "shard", color: "#ffd36c", groundShot: true });
    return;
  }
  if (e.kind === "shield") {
    if (selectedStage === "virtual") {
      const v = clampVy(168, 88);
      pushEnemyBullet({ x: originX - 10, y: originY - 4, w: 18, h: 18, vx: v.vx, vy: v.vy, life: 3.2, style: "orb", color: "#64e8ff", groundShot: true, turn: 0.32 });
      pushEnemyBullet({ x: originX - 18, y: originY + 10, w: 28, h: 5, vx: -218, vy: clamp((targetY - originY) * 0.32, -46, 46), life: 2.7, style: "laser", color: "#ff77b7", groundShot: true });
      return;
    }
    const v = clampVy(194, 52);
    pushEnemyBullet({ x: originX - 4, y: originY, w: 15, h: 10, vx: v.vx, vy: v.vy, life: 3.55, style: "slug", color: "#ff8a5d", groundShot: true });
    return;
  }
  if (e.kind === "turret") {
    if (selectedStage === "virtual") {
      const offsets = e.fireCd > e.fire - 0.12 ? [-12, 12] : [0];
      for (const oy of offsets) {
        pushEnemyBullet({ x: originX - 20, y: originY + oy, w: 30, h: 5, vx: -238, vy: clamp((targetY - originY) * 0.42 + oy * 0.7, -82, 82), life: 3.0, style: "needle", color: "#9ff8ff", groundShot: true });
      }
      return;
    }
    pushEnemyBullet({ x: originX - 18, y: originY + 2, w: 26, h: 5, vx: -260, vy: clamp((targetY - originY) * 0.48, -74, 74), life: 3.0, style: "laser", color: "#ff605c", groundShot: true });
    return;
  }
  if (e.kind === "heavy") {
    if (selectedStage === "virtual" && Math.random() < 0.45) {
      pushEnemyBullet({ x: originX - 18, y: FLOOR - 38, w: 40, h: 16, vx: -210, vy: 0, life: 2.0, style: "groundShock", color: "#64e8ff", groundShot: true });
      return;
    }
    pushEnemyBullet({ x: originX - 4, y: originY - 8, w: 14, h: 14, vx: -126, vy: -150, ay: 260, life: 3.1, style: "grenade", color: "#ffb347" });
    return;
  }
  if (e.kind === "bomber") {
    pushEnemyBullet({ x: originX + 12, y: e.y + e.h, w: 13, h: 16, vx: -36, vy: 178, ay: 120, life: 2.4, style: "bomb", color: "#ff605c" });
  }
}

function pushEnemyBullet(b, boss = false) {
  if (!boss) {
    const budget = selectedDifficulty === "hell" ? 30 : selectedDifficulty === "hard" ? 25 : 19;
    if (enemyBullets.length >= budget) return false;
    const laneLimit = b.groundShot ? (selectedDifficulty === "hell" ? 8 : selectedDifficulty === "hard" ? 7 : 5) : (selectedDifficulty === "hell" ? 6 : selectedDifficulty === "hard" ? 5 : 4);
    const sameLane = enemyBullets.filter((eb) => eb.x > player.x - 20 && eb.x < W + 120 && Math.abs((eb.y + eb.h * 0.5) - (player.y + player.h * 0.45)) < 48).length;
    if (sameLane >= laneLimit && Math.abs((b.y + b.h * 0.5) - (player.y + player.h * 0.45)) < 48) return false;
  }
  if (boss) {
    const activeBoss = enemies.find((e) => e.kind === "boss" && e.hp > 0);
    const scale = activeBoss?.roundPower || 1;
    if (scale > 1) {
      b.vx *= scale;
      b.vy *= scale;
      if (b.ay) b.ay *= scale;
      b.w *= 1 + (scale - 1) * 0.55;
      b.h *= 1 + (scale - 1) * 0.55;
      b.damage = Math.max(b.damage || 1, scale >= 1.2 ? 2 : 1);
    }
  }
  enemyBullets.push(b);
  return true;
}

function releaseCharge() {
  if (!stella.active || player.hp <= 0) return;
  const charge = stella.chargePips;
  const full = charge >= 3;
  const level = stella.level;
  if (charge <= 0 && stella.ultCd > 0) return;
  if (full) {
    const stats = getUltimateStats(level);
    ultimateSequence = {
      level,
      cutin: 1.0,
      clear: stats.duration,
      applied: false,
      tick: 0,
      power: stats.burst,
    };
    stella.chargePips = 0;
    stella.burstGlow = 0.75;
    screenShake = 12;
    return;
  }
  const radius = charge <= 0 ? 116 + level * 18 : 150 + level * 32 + charge * 58;
  const power = charge <= 0 ? Math.max(1, Math.ceil(level * 0.8)) : charge + Math.ceil(level * 1.55);
  pulse(W * 0.52, H * 0.44, radius, power, level, charge);
  if (charge <= 0) {
    stella.ultCd = 1.15;
    enemyBullets.splice(0, Math.ceil(enemyBullets.length * 0.28));
    stageText.textContent = "星黎应急星爆";
  } else if (level >= 2) {
    enemyBullets.splice(0, Math.ceil(enemyBullets.length * 0.65));
  }
  if (level >= 4) stella.shield = Math.max(stella.shield, 1);
  stella.burstGlow = 0.55;
  screenShake = charge <= 0 ? 3 : 5;
  stella.chargePips = 0;
}

function pulse(x, y, radius, damage, level = stella.level, charge = stella.chargePips || 1) {
  particles.push({ x, y, vx: 0, vy: 0, life: 0.42, radius, pulse: true, level });
  spawnEffect(charge >= 3 ? "ultimate" : "burst", x, y, charge >= 3 ? 620 : 180 + charge * 70);
  for (const e of enemies) {
    const dx = e.x + e.w * 0.5 - x;
    const dy = e.y + e.h * 0.5 - y;
    if (radius >= 900 || Math.hypot(dx, dy) <= radius) {
      spawnEffect(charge >= 3 ? "starfall" : "explosion", e.x + e.w * 0.5, e.y + e.h * 0.45, charge >= 3 ? 150 : 88);
      damageEnemy(e, damage, true);
      puff(e.x + e.w * 0.5, e.y + e.h * 0.5, "#9ff8ff", 8);
      if (e.hp <= 0) killEnemy(e);
    }
  }
}

function updateUltimateSequence(dt) {
  if (!ultimateSequence) return false;
  if (ultimateSequence.cutin > 0) {
    ultimateSequence.cutin -= dt;
    if (ultimateSequence.cutin <= 0 && !ultimateSequence.applied) {
      applyUltimateClear();
      ultimateSequence.applied = true;
    }
    return true;
  }

  ultimateSequence.clear -= dt;
  ultimateSequence.tick -= dt;
  enemyBullets.length = 0;
  if (ultimateSequence.tick <= 0) {
    ultimateSequence.tick = ultimateSequence.level >= 4 ? 0.12 : 0.16;
    spawnUltimateWave(ultimateSequence.level, false);
    for (const e of enemies) {
      if (e.hp <= 0) continue;
      spawnUltimateEnemyEffect(ultimateSequence.level, e, 0.48);
      damageEnemy(e, getUltimateTickDamage(ultimateSequence.level), true);
      if (e.hp <= 0) killEnemy(e);
    }
  }
  if (ultimateSequence.clear <= 0) ultimateSequence = null;
  return false;
}

function applyUltimateClear() {
  const level = ultimateSequence.level;
  enemyBullets.length = 0;
  screenShake = 16;
  spawnUltimateWave(level, true);
  particles.push({ x: W * 0.5, y: H * 0.45, vx: 0, vy: 0, life: 0.7, radius: 980, pulse: true, level });
  for (const e of enemies) {
    if (e.hp <= 0) continue;
    spawnUltimateEnemyEffect(level, e, 0.7);
    damageEnemy(e, ultimateSequence.power, true);
    puff(e.x + e.w * 0.5, e.y + e.h * 0.5, "#ff77b7", 18);
    if (e.hp <= 0) killEnemy(e);
  }
}

function getUltimateTickDamage(level) {
  return getUltimateStats(level).tick;
}

function getUltimateStats(level) {
  const table = [
    { burst: 16, tick: 1, duration: 1.45 },
    { burst: 24, tick: 2, duration: 1.62 },
    { burst: 34, tick: 2, duration: 1.82 },
    { burst: 46, tick: 3, duration: 2.0 },
    { burst: 60, tick: 4, duration: 2.16 },
  ];
  return table[clamp(level - 1, 0, 4)];
}

function spawnUltimateWave(level, initial) {
  const size = initial ? 820 : 260 + Math.random() * 180;
  if (level === 1) {
    spawnEffect("starfall", W * 0.55, H * 0.42, initial ? 560 : 180, initial ? 0.72 : 0.38);
    return;
  }
  if (level === 2) {
    spawnEffect("shield", W * 0.5, H * 0.45, size, initial ? 0.82 : 0.42);
    spawnEffect("burst", W * 0.5, H * 0.45, initial ? 520 : 220, initial ? 0.7 : 0.34);
    return;
  }
  if (level === 3) {
    spawnEffect("ultimate", W * 0.5, H * 0.44, size, initial ? 0.8 : 0.42);
    spawnEffect("burst", 160 + Math.random() * 640, 110 + Math.random() * 310, 160, 0.36);
    return;
  }
  if (level === 4) {
    for (let i = 0; i < 3; i += 1) {
      spawnEffect("starfall", 150 + Math.random() * 680, 96 + Math.random() * 330, initial ? 260 : 150, 0.46);
    }
    return;
  }
  spawnEffect("ultimate", W * 0.5, H * 0.44, initial ? 900 : 420, initial ? 0.9 : 0.5);
  for (let i = 0; i < 5; i += 1) {
    spawnEffect("starfall", 80 + Math.random() * 800, 80 + Math.random() * 360, initial ? 280 : 170, 0.54);
  }
}

function spawnUltimateEnemyEffect(level, e, life) {
  const x = e.x + e.w * 0.5;
  const y = e.y + e.h * 0.45;
  const bossSize = e.kind === "boss" ? 220 : 150;
  if (level === 1) {
    spawnEffect("starfall", x, y, e.kind === "boss" ? 170 : 105, life);
  } else if (level === 2) {
    spawnEffect("shield", x, y, e.kind === "boss" ? 190 : 116, life);
  } else if (level === 3) {
    spawnEffect("burst", x, y, e.kind === "boss" ? 205 : 132, life);
  } else if (level === 4) {
    spawnEffect("starfall", x + (Math.random() - 0.5) * 54, y, bossSize, life);
  } else {
    spawnEffect("ultimate", x, y, e.kind === "boss" ? 260 : 170, life);
    spawnEffect("starfall", x + (Math.random() - 0.5) * 50, y - 18, bossSize, life);
  }
}

function getEnemyDimensions(kind) {
  return {
    w: kind === "drone" || kind === "fastDrone" || kind === "bomber" ? 46 : kind === "turret" ? 54 : 38,
    h: kind === "drone" || kind === "fastDrone" || kind === "bomber" ? 34 : kind === "turret" ? 42 : 58,
  };
}

function chooseGroundEnemyLane(type, dimensions, preferredX, entrySide = "right") {
  if (!groundedEnemyKinds.has(type.kind)) return { x: preferredX, y: type.y };
  if (entrySide === "left") {
    const support = findSupportAt(preferredX, dimensions.w, FLOOR + 8);
    if (support) return { x: preferredX, y: support.y - dimensions.h, lane: support.type || "floor" };
    return { x: preferredX, y: FLOOR - dimensions.h, lane: "floor" };
  }
  const route = player.stageProgress / 100;
  const tier = getCombatTier();
  const platformChance = clamp(0.18 + route * 0.3 + tier * 0.018, 0.18, 0.58);
  if (Math.random() > platformChance) {
    const floor = chooseGroundSpawnSupport(preferredX, dimensions.w);
    return { x: floor.x, y: floor.y - dimensions.h, lane: floor.type || "floor" };
  }

  const candidates = movingTerrain
    .filter((platform) => (platform.type === "upper" || platform.type === "step") && platform.x > W - 80 && platform.x < W + 280 && platform.w >= dimensions.w + 24)
    .sort((a, b) => a.x - b.x);

  if (!candidates.length) {
    const floor = chooseGroundSpawnSupport(preferredX, dimensions.w);
    return { x: floor.x, y: floor.y - dimensions.h, lane: floor.type || "floor" };
  }
  const platform = candidates[Math.floor(Math.random() * candidates.length)];
  const x = clamp(platform.x + 14 + Math.random() * Math.max(8, platform.w - dimensions.w - 28), W + 18, W + 260);
  return {
    x,
    y: platform.y - dimensions.h,
    lane: platform.type,
  };
}

function chooseGroundSpawnSupport(preferredX, width) {
  const direct = findSupportAt(preferredX, width, FLOOR + 8);
  if (direct && direct.type === "ground") return { ...direct, x: preferredX };
  const candidates = movingTerrain
    .filter((p) => p.type === "ground" && p.x > W - 80 && p.x < W + 360 && p.w >= width + 32)
    .sort((a, b) => a.x - b.x);
  if (!candidates.length) return { x: preferredX, y: FLOOR, type: "floor" };
  const platform = candidates[Math.floor(Math.random() * candidates.length)];
  return {
    ...platform,
    x: clamp(platform.x + 16 + Math.random() * Math.max(8, platform.w - width - 32), W + 18, W + 300),
  };
}

function findSupportAt(x, w, maxY = FLOOR + 80) {
  const center = x + w * 0.5;
  const supports = movingTerrain
    .filter((p) => center >= p.x + 8 && center <= p.x + p.w - 8 && p.y <= maxY)
    .sort((a, b) => b.y - a.y);
  return supports[0] || null;
}

function findSupportUnder(entity, tolerance = 42) {
  const bottom = entity.y + entity.h;
  const center = entity.x + entity.w * 0.5;
  const supports = movingTerrain
    .filter((p) => center >= p.x + 6 && center <= p.x + p.w - 6 && bottom <= p.y + tolerance && bottom >= p.y - tolerance)
    .sort((a, b) => Math.abs(bottom - a.y) - Math.abs(bottom - b.y));
  return supports[0] || null;
}

function findNearestRespawnSupport(centerX) {
  return movingTerrain
    .filter((p) => p.w >= player.w + 28 && p.y <= FLOOR && p.x < W - 24 && p.x + p.w > 24)
    .sort((a, b) => {
      const ax = clamp(centerX, a.x + 12, a.x + a.w - 12);
      const bx = clamp(centerX, b.x + 12, b.x + b.w - 12);
      const ad = Math.abs(centerX - ax) + (a.type === "ground" ? 0 : 18) + Math.max(0, FLOOR - a.y) * 0.08;
      const bd = Math.abs(centerX - bx) + (b.type === "ground" ? 0 : 18) + Math.max(0, FLOOR - b.y) * 0.08;
      return ad - bd;
    })[0] || null;
}

function findRunnerJumpTarget(e, dir = -1) {
  const bottom = e.y + e.h;
  return movingTerrain
    .filter((p) => {
      const ahead = dir < 0
        ? p.x < e.x && p.x + p.w > e.x - 150
        : p.x + p.w > e.x + e.w && p.x < e.x + e.w + 150;
      return ahead && p.y < bottom - 18 && p.y > bottom - 118;
    })
    .sort((a, b) => dir < 0 ? b.x + b.w - (a.x + a.w) : a.x - b.x)[0] || null;
}

function spawnEnemy(type, x, options = {}) {
  const scale = getEnemyScale();
  const difficulty = getDifficultyConfig();
  const dimensions = getEnemyDimensions(type.kind);
  const lowHover = isRooftopLowHoverKind(type.kind);
  const entrySide = options.entrySide || "right";
  const spawnX = x ?? (entrySide === "left" ? -54 - Math.random() * 30 : W + 60);
  const lane = lowHover ? { x: spawnX, y: FLOOR - 148, lane: "lowHover" } : chooseGroundEnemyLane(type, dimensions, spawnX, entrySide);
  const rushScale = options.rush ? 1.55 : 1;
  enemies.push({
    ...type,
    entrySide,
    rush: !!options.rush,
    x: lane.x,
    y: lowHover ? lane.y : groundedEnemyKinds.has(type.kind) ? lane.y : type.y + ((type.kind === "drone" || type.kind === "fastDrone") ? Math.random() * 80 - 40 : 0),
    w: dimensions.w,
    h: dimensions.h,
    lane: lane.lane || "floor",
    hp: Math.ceil(type.hp * scale.hp),
    maxHp: Math.ceil(type.hp * scale.hp),
    speed: type.speed * scale.speed * rushScale,
    fire: Math.max(0.42, type.fire * scale.fire * (options.rush ? 1.18 : 1)),
    score: Math.round(type.score * (1 + getCombatTier() * 0.025) * difficulty.score),
    fireCd: Math.max(0.36, type.fire * scale.fire * (0.45 + Math.random() * 0.5)),
    vy: 0,
    jumpCd: 0,
    holdAtEdge: false,
    t: Math.random() * 10,
  });
}

function spawnBoss() {
  const stage = stageConfigs[selectedStage];
  const difficulty = getDifficultyConfig();
  const roundScale = getBossRoundScale();
  const bossHp = Math.round((360 * stage.boss + getCombatTier() * 24) * difficulty.bossHp * roundScale * getEndlessDifficultyScale());
  buildBossArena();
  const groundBoss = selectedStage === "slum";
  const virtualBoss = selectedStage === "virtual";
  const bossW = groundBoss ? 286 : virtualBoss ? 230 : 188;
  const bossH = groundBoss ? 172 : virtualBoss ? 148 : 118;
  enemies.push({
    kind: "boss",
    round: bossClears + 1,
    roundPower: roundScale,
    x: W + 40,
    y: groundBoss ? FLOOR - bossH : virtualBoss ? 78 : 92,
    w: bossW,
    h: bossH,
    hp: bossHp,
    maxHp: bossHp,
    phaseHp: bossHp / 3,
    speed: 0,
    score: Math.round(3200 * difficulty.score * roundScale),
    fire: 0.58,
    fireCd: 1.0,
    t: 0,
    phase: 1,
    entering: true,
    barrage: 0,
    basicIndex: 0,
    patternCd: 1.35,
    skillCd: 2.15,
    skillIndex: 0,
    strafeSeed: Math.random() * Math.PI * 2,
    teleportCd: virtualBoss ? 3.2 : 0,
    teleportFlash: 0,
  });
  stageText.textContent = difficulty.bossCount > 1
    ? `Boss ${bossClears + 1}/${difficulty.bossCount}：${stage.bossName}`
    : `Boss：${stage.bossName}`;
  spawnPickup("stella", W - 120, 118);
  player.stageProgress = 100;
  screenShake = 6;
}

function updateBoss(e, dt) {
  const difficulty = getDifficultyConfig();
  const roundPower = e.roundPower || 1;
  e.t += dt;
  e.fireCd -= dt;
  e.patternCd -= dt;
  e.skillCd -= dt;
  e.phase = e.hp <= e.maxHp * 0.34 ? 3 : e.hp <= e.maxHp * 0.67 ? 2 : 1;
  if (e.entering && e.x < W - e.w - 32) e.entering = false;
  const sweep = Math.sin(e.t * (0.45 + e.phase * 0.08) + e.strafeSeed);
  if (selectedStage === "slum") {
    const targetX = clamp(W * 0.66 + sweep * 118, 430, W - e.w - 22);
    e.x += (targetX - e.x) * Math.min(1, dt * (e.slamRush ? 2.6 : 1.05));
    e.y = FLOOR - e.h;
    e.slamRush = Math.max(0, (e.slamRush || 0) - dt);
  } else if (selectedStage === "virtual") {
    e.teleportCd = Math.max(0, (e.teleportCd || 0) - dt);
    e.teleportFlash = Math.max(0, (e.teleportFlash || 0) - dt);
    if (e.teleportCd <= 0 && !e.entering) {
      spawnEffect("burst", e.x + e.w * 0.5, e.y + e.h * 0.45, 150, 0.36);
      e.x = clamp(player.x + player.w * 0.5 + (Math.random() < 0.5 ? 210 : -210), 120, W - e.w - 60);
      e.y = clamp(76 + Math.random() * 88, 58, FLOOR - e.h - 42);
      e.teleportFlash = 0.36;
      e.teleportCd = (e.phase === 3 ? 2.2 : e.phase === 2 ? 2.8 : 3.45) * difficulty.bossFire;
      bossBeams.push({ x: clamp(player.x + player.w * 0.5 - 13, 62, W - 86), y: 72, w: 26, h: FLOOR - 72, warning: 0.7, life: 1.08, damage: 1, dir: -1, style: "pillar" });
      stageText.textContent = "Boss：虚影闪现";
    }
    const targetX = clamp(W * 0.5 + sweep * 245, 110, W - e.w - 70);
    const targetY = 72 + Math.sin(e.t * 1.55 + e.phase) * 50;
    e.x += (targetX - e.x) * Math.min(1, dt * (e.teleportFlash > 0 ? 0.15 : 1.2));
    e.y += (targetY - e.y) * Math.min(1, dt * 2.0);
  } else {
    const targetX = clamp(W * 0.5 + sweep * 255, 150, W - 220);
    const targetY = 86 + Math.sin(e.t * 1.35 + e.phase) * 42;
    e.x += (targetX - e.x) * Math.min(1, dt * 1.35);
    e.y += (targetY - e.y) * Math.min(1, dt * 2.4);
  }
  if (e.fireCd <= 0) {
    fireBoss(e);
    e.fireCd = ((e.phase === 3 ? 0.3 : e.phase === 2 ? 0.42 : 0.58) * difficulty.bossFire) / roundPower;
  }
  if (e.patternCd <= 0) {
    fireBossPattern(e);
    e.patternCd = ((e.phase === 3 ? 1.15 : e.phase === 2 ? 1.45 : 1.8) * difficulty.bossFire) / roundPower;
  }
  if (e.skillCd <= 0) {
    fireBossSkill(e);
    e.skillCd = ((e.phase === 3 ? 1.75 : e.phase === 2 ? 2.25 : 2.9) * difficulty.bossFire) / roundPower;
  }
}

function getBossRoundScale() {
  if (selectedDifficulty === "hell") return 1 + bossClears * 0.2;
  return 1 + bossClears * 0.34;
}

function fireBoss(e) {
  e.basicIndex = (e.basicIndex || 0) + 1;
  if (selectedStage === "slum") {
    fireSlumBossBasic(e);
    return;
  }
  if (selectedStage === "virtual") {
    fireVirtualBossBasic(e);
    return;
  }
  fireRooftopBossBasic(e);
}

function fireRooftopBossBasic(e) {
  const count = e.phase === 3 ? 6 : e.phase === 2 ? 4 : 3;
  const originX = e.x + 82;
  const originY = e.y + 64;
  for (let i = 0; i < count; i += 1) {
    const t = count === 1 ? 0.5 : i / (count - 1);
    const angle = Math.PI + lerp(-0.42, 0.42, t);
    pushEnemyBullet({
      x: originX - i * 12,
      y: originY + Math.sin(time * 4 + i) * 10,
      w: 18,
      h: 10,
      vx: Math.cos(angle) * (150 + e.phase * 22),
      vy: Math.sin(angle) * (150 + e.phase * 22),
      ay: 44,
      life: 3.35,
      style: "missile",
      color: i % 2 ? "#ffd36c" : "#ff8a5d",
    }, true);
  }
  if (e.phase >= 2 && e.basicIndex % 2 === 0) {
    const baseX = clamp(player.x + player.w * 0.5, 90, W - 90);
    pushEnemyBullet({
      x: baseX,
      y: -20,
      w: 16,
      h: 20,
      vx: Math.sin(time * 3) * 18,
      vy: 205 + e.phase * 26,
      ay: 48,
      life: 3.0,
      style: "missile",
      color: "#ff605c",
    }, true);
  }
}

function fireSlumBossBasic(e) {
  const lanes = e.phase === 3 ? [FLOOR - 34, FLOOR - 72, FLOOR - 110] : e.phase === 2 ? [FLOOR - 34, FLOOR - 82] : [FLOOR - 34];
  for (let i = 0; i < lanes.length; i += 1) {
    pushEnemyBullet({
      x: e.x + 18 - i * 12,
      y: lanes[i],
      w: 42,
      h: 16,
      vx: -210 - e.phase * 18 - i * 20,
      vy: 0,
      life: 2.65,
      style: "groundShock",
      color: i % 2 ? "#ffd36c" : "#ff8a5d",
      groundShot: true,
    }, true);
  }
  if (e.phase >= 2 && e.basicIndex % 2 === 0) {
    const count = e.phase === 3 ? 5 : 3;
    for (let i = 0; i < count; i += 1) {
      pushEnemyBullet({
        x: e.x + 88 + i * 18,
        y: e.y + 66,
        w: 13,
        h: 13,
        vx: -92 - i * 16,
        vy: -118 - i * 8,
        ay: 260,
        life: 2.7,
        style: "grenade",
        color: "#ffd36c",
      }, true);
    }
  }
}

function fireVirtualBossBasic(e) {
  const originX = e.x + e.w * 0.42;
  const originY = e.y + e.h * 0.48;
  const spokes = e.phase === 3 ? 8 : e.phase === 2 ? 6 : 4;
  const skip = Math.floor((player.x / W) * spokes);
  for (let i = 0; i < spokes; i += 1) {
    if (e.phase === 1 && i === skip) continue;
    const a = Math.PI + (Math.PI * 2 * i) / spokes + time * 0.42;
    pushEnemyBullet({
      x: originX,
      y: originY,
      w: 13,
      h: 13,
      vx: Math.cos(a) * (130 + e.phase * 18),
      vy: Math.sin(a) * (130 + e.phase * 18),
      life: 2.95,
      style: "orb",
      color: i % 2 ? "#64e8ff" : "#ff77b7",
      turn: e.phase >= 3 ? 0.36 : 0,
    }, true);
  }
  if (e.phase >= 2 && e.basicIndex % 3 === 0) {
    bossBeams.push({ x: clamp(player.x + player.w * 0.5 - 10, 70, W - 90), y: 82, w: 20, h: FLOOR - 82, warning: 0.72, life: 1.05, damage: 1, dir: -1, style: "pillar" });
  }
}

function fireBossPattern(e) {
  const originX = e.x + 24;
  const originY = e.y + 56;
  const hellBonus = selectedDifficulty === "hell" ? e.round || 1 : 0;
  const count = (e.phase === 3 ? 9 : e.phase === 2 ? 7 : 5) + hellBonus;
  const start = e.phase === 1 ? -0.62 : -0.95;
  const end = e.phase === 1 ? 0.62 : 0.95;
  for (let i = 0; i < count; i += 1) {
    const t = count === 1 ? 0.5 : i / (count - 1);
    const angle = Math.PI + start + (end - start) * t + Math.sin(time * 3 + i) * 0.035;
    pushEnemyBullet({
      x: originX,
      y: originY,
      w: e.phase === 3 ? 13 : 11,
      h: 8,
      vx: Math.cos(angle) * (140 + e.phase * 24),
      vy: Math.sin(angle) * (140 + e.phase * 24),
      life: 3.15,
      style: "bossPlasma",
      color: "#ff77b7",
    }, true);
  }
  if (e.phase >= 2) {
    for (let i = 0; i < 3; i += 1) {
      pushEnemyBullet({
        x: e.x + 64 + i * 34,
        y: e.y + 104,
        w: 10,
        h: 10,
        vx: -70 - i * 18,
        vy: 115 + i * 22,
        ay: 95,
        life: 2.35,
        style: "missile",
        color: "#ffd36c",
      }, true);
    }
  }
  spawnEffect("burst", originX, originY, 72, 0.3);
}

function fireBossSkill(e) {
  if (selectedStage === "slum") {
    fireSlumBossSkill(e);
    return;
  }
  if (selectedStage === "virtual") {
    fireVirtualBossSkill(e);
    return;
  }
  const hellMode = selectedDifficulty === "hell";
  const skill = e.skillIndex % (e.phase >= 3 || hellMode ? 4 : e.phase >= 2 ? 3 : 2);
  e.skillIndex += 1;
  if (skill === 0) {
    const y = clamp(player.y + 28, 138, FLOOR - 34);
    bossBeams.push({ x: 54, y, w: W - 108, h: 18, warning: 0.78, life: 1.2, damage: 1, dir: e.phase, style: "sweep" });
    if (e.phase >= 3) bossBeams.push({ x: clamp(player.x - 20, 80, W - 120), y: 92, w: 22, h: FLOOR - 92, warning: 0.86, life: 1.22, damage: 1, dir: -1, style: "pillar" });
    stageText.textContent = "Boss：横扫光束";
    spawnEffect("burst", e.x + 34, e.y + 62, 96, 0.38);
    return;
  }
  if (skill === 1) {
    const count = (e.phase >= 3 ? 7 : 5) + (hellMode ? 2 : 0);
    const safeSlot = Math.floor((player.x / W) * count);
    for (let i = 0; i < count; i += 1) {
      if (Math.abs(i - safeSlot) <= 0 && e.phase < 3) continue;
      pushEnemyBullet({
        x: 90 + i * (780 / Math.max(1, count - 1)) + Math.sin(time * 5 + i) * 20,
        y: -20 - i * 18,
        w: 13,
        h: 16,
        vx: Math.sin(i * 1.7) * 32,
        vy: 185 + e.phase * 34,
        ay: 70,
        life: 3.1,
        style: "missile",
        color: "#ff8a5d",
      }, true);
    }
    spawnEffect("starfall", clamp(player.x + player.w * 0.5, 90, W - 90), FLOOR - 78, 190, 0.45);
    stageText.textContent = "Boss：轨道落弹";
    return;
  }
  if (skill === 2) {
    const support = e.phase >= 3 || hellMode ? enemyTypes[1] : enemyTypes[0];
    spawnEnemy(support);
    enemies[enemies.length - 1].x = W - 60;
    enemies[enemies.length - 1].y = e.phase >= 3 ? 130 : 185;
    spawnEnemy(enemyTypes[5]);
    enemies[enemies.length - 1].x = W - 36;
    stageText.textContent = "Boss：召援无人机";
    return;
  }
  const count = hellMode ? 18 : 14;
  for (let i = 0; i < count; i += 1) {
    if (i % 5 === 2) continue;
    const a = (Math.PI * 2 * i) / count + time * 0.4;
    pushEnemyBullet({
      x: e.x + 88,
      y: e.y + 62,
      w: 10,
      h: 10,
      vx: Math.cos(a) * 155,
      vy: Math.sin(a) * 155,
      life: 2.9,
      style: "orb",
      color: "#ff77b7",
    }, true);
  }
  stageText.textContent = "Boss：零点环爆";
}

function fireSlumBossSkill(e) {
  const hellMode = selectedDifficulty === "hell";
  const skill = e.skillIndex % (e.phase >= 3 || hellMode ? 5 : 4);
  e.skillIndex += 1;
  if (skill === 0) {
    const count = (e.phase >= 3 ? 7 : 5) + (hellMode ? 2 : 0);
    for (let i = 0; i < count; i += 1) {
      pushEnemyBullet({
        x: e.x + 28 + i * 18,
        y: e.y + 84,
        w: 15,
        h: 15,
        vx: -118 - i * 10,
        vy: -128 - Math.random() * 70,
        ay: 285,
        life: 3.0,
        style: "grenade",
        color: i % 2 ? "#ffd36c" : "#ff8a5d",
      }, true);
    }
    stageText.textContent = "Boss：废料抛射";
    return;
  }
  if (skill === 1) {
    spawnEnemy(enemyTypes[3], W - 30);
    spawnEnemy(e.phase >= 3 || hellMode ? enemyTypes[6] : enemyTypes[4], W + 85);
    spawnObstacle("barrel");
    stageText.textContent = "Boss：回收机群";
    return;
  }
  if (skill === 2) {
    const lanes = e.phase >= 3 ? [FLOOR - 132, FLOOR - 86, FLOOR - 38] : [FLOOR - 82, FLOOR - 36];
    for (const y of lanes) {
      bossBeams.push({ x: 48, y, w: W - 96, h: 16, warning: 0.74, life: 1.16, damage: 1, dir: e.phase, style: "sweep" });
    }
    stageText.textContent = "Boss：雨巷切割线";
    return;
  }
  if (skill === 3) {
    e.slamRush = 0.72;
    screenShake = Math.max(screenShake, 16);
    const slamX = clamp(player.x + player.w * 0.5 - 86, 50, W - 210);
    bossBeams.push({ x: slamX, y: FLOOR - 34, w: 172, h: 30, warning: 0.48, life: 0.95, damage: 1, dir: 1, style: "sweep" });
    for (let i = 0; i < 3 + (hellMode ? 1 : 0); i += 1) {
      pushEnemyBullet({
        x: e.x + 24 - i * 8,
        y: FLOOR - 38,
        w: 44,
        h: 18,
        vx: -220 - i * 44,
        vy: 0,
        life: 2.2,
        style: "groundShock",
        color: i % 2 ? "#ffd36c" : "#ff8a5d",
        groundShot: true,
      }, true);
    }
    spawnEffect("burst", e.x + 68, FLOOR - 56, 190, 0.5);
    stageText.textContent = "Boss：重型碾压";
    return;
  }
  for (let i = 0; i < 16; i += 1) {
    if (i % 4 === 1) continue;
    const a = Math.PI + (i / 15 - 0.5) * 1.7;
    pushEnemyBullet({
      x: e.x + 80,
      y: e.y + 70,
      w: 10,
      h: 10,
      vx: Math.cos(a) * 165,
      vy: Math.sin(a) * 165,
      life: 3.0,
      style: "shard",
      color: "#ffd36c",
    }, true);
  }
  stageText.textContent = "Boss：碎片散射";
}

function fireVirtualBossSkill(e) {
  const hellMode = selectedDifficulty === "hell";
  const skill = e.skillIndex % (e.phase >= 3 || hellMode ? 5 : 4);
  e.skillIndex += 1;
  if (skill === 0) {
    const slots = (e.phase >= 3 ? 8 : 6) + (hellMode ? 1 : 0);
    const safe = clamp(Math.floor((player.x / W) * slots), 0, slots - 1);
    for (let i = 0; i < slots; i += 1) {
      if (Math.abs(i - safe) <= 0 && e.phase < 3) continue;
      const x = 72 + i * ((W - 144) / Math.max(1, slots - 1));
      bossBeams.push({ x: x - 12, y: 66, w: 24, h: FLOOR - 66, warning: 0.72, life: 1.24, damage: 1, dir: -1, style: "pillar" });
      if (e.phase >= 3 && i % 2 === 0) {
        bossBeams.push({ x: x + 18, y: 98, w: 14, h: FLOOR - 98, warning: 0.92, life: 1.05, damage: 1, dir: -1, style: "pillar" });
      }
    }
    stageText.textContent = "Boss：镜像光柱";
    return;
  }
  if (skill === 1) {
    const count = (e.phase >= 3 ? 11 : 8) + (hellMode ? 2 : 0);
    for (let i = 0; i < count; i += 1) {
      pushEnemyBullet({
        x: 80 + i * (800 / Math.max(1, count - 1)),
        y: 84 + Math.sin(time * 3 + i) * 38,
        w: 12,
        h: 12,
        vx: Math.sin(i * 1.7) * 48,
        vy: 148 + e.phase * 22,
        ay: 52,
        turn: e.phase >= 3 ? 0.8 : 0,
        life: 3.2,
        style: "orb",
        color: i % 2 ? "#64e8ff" : "#ff77b7",
      }, true);
    }
    stageText.textContent = "Boss：数据雨";
    return;
  }
  if (skill === 2) {
    spawnEnemy(enemyTypes[1], W + 24);
    spawnEnemy(enemyTypes[7], W + 104);
    movingTerrain.push({ x: W + 26, y: FLOOR - 126, w: 140, h: 22, vx: -86, type: "upper", lift: true, baseY: FLOOR - 126, amp: 30, phase: time });
    stageText.textContent = "Boss：镜像增殖";
    return;
  }
  if (skill === 3) {
    spawnEffect("shield", e.x + e.w * 0.5, e.y + e.h * 0.46, 210, 0.38);
    e.x = clamp(player.x + (Math.random() < 0.5 ? 185 : -235), 96, W - e.w - 72);
    e.y = clamp(62 + Math.random() * 128, 54, FLOOR - e.h - 36);
    e.teleportFlash = 0.42;
    const crossX = clamp(player.x + player.w * 0.5 - 14, 70, W - 94);
    const crossY = clamp(player.y + player.h * 0.5 - 10, 110, FLOOR - 58);
    bossBeams.push({ x: crossX, y: 70, w: 28, h: FLOOR - 70, warning: 0.62, life: 1.18, damage: 1, dir: -1, style: "pillar" });
    bossBeams.push({ x: 46, y: crossY, w: W - 92, h: 18, warning: 0.56, life: 1.0, damage: 1, dir: e.phase, style: "sweep" });
    stageText.textContent = "Boss：虚影背刺";
    return;
  }
  bossBeams.push({ x: 48, y: clamp(player.y + 16, 124, FLOOR - 44), w: W - 96, h: 16, warning: 0.62, life: 1.05, damage: 1, dir: e.phase, style: "sweep" });
  bossBeams.push({ x: clamp(player.x + 44, 80, W - 110), y: 90, w: 20, h: FLOOR - 90, warning: 0.82, life: 1.2, damage: 1, dir: -1, style: "pillar" });
  stageText.textContent = "Boss：镜像交叉线";
}

function spawnPickup(type, x = W + 30, y = 145 + Math.random() * 170) {
  pickups.push({ type, x, y, w: 30, h: 30, vx: -90, t: 0 });
}

function collectPickup(type) {
  if (type === "stella") {
    upgradeStella();
    return;
  }
  if (type === "health") {
    player.hp = Math.min(player.maxHp, player.hp + 2);
    stageText.textContent = "医疗模块 +2";
    spawnEffect("shield", player.x + player.w * 0.5, player.y + 24, 92, 0.44);
    return;
  }
  if (type === "power") player.weapon.power = Math.min(3, player.weapon.power + 1);
  if (type === "wide") player.weapon.wide = Math.min(3, player.weapon.wide + 1);
  if (type === "rapid") player.weapon.rapid = Math.min(3, player.weapon.rapid + 1);
  player.score += 80;
  stageText.textContent = `${type === "power" ? "P 威力" : type === "wide" ? "W 范围" : "R 速射"} 模块 +1`;
}

function spawnObstacle(kind = chooseObstacleKind()) {
  const config = obstacleConfigs[kind] || obstacleConfigs.crate;
  const support = chooseObstacleSupport(config);
  if (!support) return;
  const x = clamp(support.x + 14 + Math.random() * Math.max(4, support.w - config.w - 28), W + 18, W + 320);
  obstacles.push({
    kind,
    x,
    y: support.y - config.h,
    w: config.w,
    h: config.h,
    vx: support.vx || TERRAIN_SCROLL_SPEED,
    supportId: support.id,
    supportType: support.type,
    hp: config.hp,
    maxHp: config.hp,
    damage: config.damage,
  });
}

function chooseObstacleKind() {
  if (selectedStage === "slum") {
    const weights = player.stageProgress > 58
      ? ["crate", "barrel", "barrel", "generator", "laserGate", "crate"]
      : ["crate", "barrel", "crate", "generator", "barrel"];
    return weights[Math.floor(Math.random() * weights.length)];
  }
  if (selectedStage === "virtual") {
    const weights = player.stageProgress > 58
      ? ["laserGate", "generator", "laserGate", "generator", "barrel"]
      : ["generator", "laserGate", "crate", "generator"];
    return weights[Math.floor(Math.random() * weights.length)];
  }
  const route = player.stageProgress / 100;
  const weights = route > 0.55
    ? ["crate", "barrel", "generator", "laserGate", "generator", "barrel"]
    : ["crate", "barrel", "crate", "generator", "laserGate"];
  return weights[Math.floor(Math.random() * weights.length)];
}

function chooseObstacleSupport(config) {
  const candidates = movingTerrain
    .filter((p) => p.x > W - 40 && p.x < W + 360 && p.w >= config.w + 36 && (config.platform || p.type === "ground"))
    .filter((p) => p.type === "ground" || p.type === "upper" || p.type === "step")
    .sort((a, b) => a.x - b.x);
  if (!candidates.length) return null;
  const platformable = candidates.filter((p) => config.platform && p.type !== "ground");
  if (platformable.length && Math.random() < 0.38) return platformable[Math.floor(Math.random() * platformable.length)];
  return candidates[Math.floor(Math.random() * candidates.length)];
}

function seedTerrain() {
  if (selectedStage === "slum") {
    seedSlumTerrain();
    return;
  }
  if (selectedStage === "virtual") {
    seedVirtualTerrain();
    return;
  }
  let x = -80;
  const seeds = [
    { w: 360, gap: 72 },
    { w: 270, gap: 92 },
    { w: 340, gap: 78 },
    { w: 260, gap: 0 },
  ];
  for (const seed of seeds) {
    movingTerrain.push({ x, y: FLOOR, w: seed.w, h: 34, vx: TERRAIN_SCROLL_SPEED, type: "ground" });
    x += seed.w + seed.gap;
  }
  movingTerrain.push({ x: 215, y: 338, w: 160, h: 22, vx: TERRAIN_SCROLL_SPEED, type: "upper" });
  movingTerrain.push({ x: 610, y: 306, w: 145, h: 22, vx: TERRAIN_SCROLL_SPEED, type: "upper" });
}

function seedSlumTerrain() {
  movingTerrain.push({ x: -80, y: FLOOR, w: 330, h: 34, vx: TERRAIN_SCROLL_SPEED, type: "ground" });
  movingTerrain.push({ x: 305, y: FLOOR, w: 240, h: 34, vx: TERRAIN_SCROLL_SPEED, type: "ground" });
  movingTerrain.push({ x: 604, y: FLOOR, w: 310, h: 34, vx: TERRAIN_SCROLL_SPEED, type: "ground" });
  movingTerrain.push({ x: 220, y: FLOOR - 68, w: 138, h: 22, vx: TERRAIN_SCROLL_SPEED, type: "upper" });
  movingTerrain.push({ x: 590, y: FLOOR - 116, w: 152, h: 22, vx: TERRAIN_SCROLL_SPEED, type: "upper" });
}

function seedVirtualTerrain() {
  movingTerrain.push({ x: -72, y: FLOOR, w: 250, h: 34, vx: TERRAIN_SCROLL_SPEED, type: "ground" });
  movingTerrain.push({ x: 250, y: FLOOR, w: 210, h: 34, vx: TERRAIN_SCROLL_SPEED, type: "ground" });
  movingTerrain.push({ x: 550, y: FLOOR, w: 280, h: 34, vx: TERRAIN_SCROLL_SPEED, type: "ground" });
  movingTerrain.push({ x: 188, y: FLOOR - 118, w: 142, h: 22, vx: TERRAIN_SCROLL_SPEED, type: "upper", lift: true, baseY: FLOOR - 118, amp: 22, phase: 0.6 });
  movingTerrain.push({ x: 602, y: FLOOR - 86, w: 132, h: 22, vx: TERRAIN_SCROLL_SPEED, type: "upper", lift: true, baseY: FLOOR - 86, amp: 28, phase: 2.2 });
}

function buildBossArena() {
  movingTerrain.length = 0;
  if (selectedStage === "slum") {
    movingTerrain.push({ x: -24, y: FLOOR, w: W + 48, h: 34, vx: 0, type: "ground", arena: true });
    movingTerrain.push({ x: 66, y: FLOOR - 42, w: 118, h: 20, vx: 0, type: "step", arena: true });
    movingTerrain.push({ x: 244, y: FLOOR - 34, w: 132, h: 18, vx: 0, type: "step", arena: true });
    movingTerrain.push({ x: 628, y: FLOOR - 38, w: 144, h: 18, vx: 0, type: "step", arena: true });
    if (player.y + player.h > FLOOR + 8) {
      player.y = FLOOR - player.h;
      player.vy = 0;
      player.onGround = true;
    }
    spawnEffect("shield", W * 0.56, FLOOR - 40, 260, 0.5);
    return;
  }
  movingTerrain.push({ x: -24, y: FLOOR, w: W + 48, h: 34, vx: 0, type: "ground", arena: true });
  movingTerrain.push({ x: 96, y: FLOOR - 78, w: 170, h: 22, vx: 0, type: "upper", arena: true });
  movingTerrain.push({ x: 366, y: FLOOR - 118, w: 190, h: 22, vx: 0, type: "upper", arena: true });
  movingTerrain.push({ x: 655, y: FLOOR - 84, w: 190, h: 22, vx: 0, type: "upper", arena: true });
  movingTerrain.push({ x: 286, y: FLOOR - 42, w: 82, h: 20, vx: 0, type: "step", arena: true });
  movingTerrain.push({ x: 560, y: FLOOR - 42, w: 82, h: 20, vx: 0, type: "step", arena: true });
  if (player.y + player.h > FLOOR + 8) {
    player.y = FLOOR - player.h;
    player.vy = 0;
    player.onGround = true;
  }
  spawnEffect("shield", W * 0.5, FLOOR - 44, 220, 0.5);
}

function spawnTerrainSegment() {
  if (selectedStage === "slum") {
    spawnSlumTerrainSegment();
    return;
  }
  if (selectedStage === "virtual") {
    spawnVirtualTerrainSegment();
    return;
  }
  const roll = Math.random();
  if (roll < 0.62) {
    movingTerrain.push({ x: W + 40, y: FLOOR, w: 190 + Math.random() * 130, h: 34, vx: TERRAIN_SCROLL_SPEED, type: "ground" });
    return;
  }
  if (roll < 0.92) {
    movingTerrain.push({ x: W + 30, y: 334 - Math.random() * 54, w: 120 + Math.random() * 70, h: 22, vx: TERRAIN_SCROLL_SPEED, type: "upper" });
    return;
  }
  movingTerrain.push({ x: W + 20, y: FLOOR - 42, w: 74, h: 20, vx: TERRAIN_SCROLL_SPEED, type: "step" });
  movingTerrain.push({ x: W + 104, y: FLOOR - 84, w: 96, h: 20, vx: TERRAIN_SCROLL_SPEED, type: "step" });
}

function spawnSlumTerrainSegment() {
  const roll = Math.random();
  if (roll < 0.58) {
    movingTerrain.push({ x: W + 36, y: FLOOR, w: 170 + Math.random() * 105, h: 34, vx: TERRAIN_SCROLL_SPEED, type: "ground" });
    return;
  }
  if (roll < 0.86) {
    movingTerrain.push({ x: W + 28, y: FLOOR - 72 - Math.random() * 56, w: 118 + Math.random() * 70, h: 22, vx: TERRAIN_SCROLL_SPEED, type: "upper" });
    return;
  }
  movingTerrain.push({ x: W + 26, y: FLOOR - 38, w: 76, h: 20, vx: TERRAIN_SCROLL_SPEED, type: "step" });
  movingTerrain.push({ x: W + 118, y: FLOOR - 80, w: 92, h: 20, vx: TERRAIN_SCROLL_SPEED, type: "step" });
}

function spawnVirtualTerrainSegment() {
  const roll = Math.random();
  if (roll < 0.44) {
    movingTerrain.push({ x: W + 42, y: FLOOR, w: 140 + Math.random() * 120, h: 34, vx: TERRAIN_SCROLL_SPEED, type: "ground" });
    return;
  }
  if (roll < 0.82) {
    const y = FLOOR - 90 - Math.random() * 82;
    movingTerrain.push({ x: W + 30, y, w: 110 + Math.random() * 68, h: 22, vx: TERRAIN_SCROLL_SPEED, type: "upper", lift: true, baseY: y, amp: 18 + Math.random() * 22, phase: Math.random() * Math.PI * 2 });
    return;
  }
  movingTerrain.push({ x: W + 22, y: FLOOR - 44, w: 72, h: 20, vx: TERRAIN_SCROLL_SPEED, type: "step", lift: true, baseY: FLOOR - 44, amp: 16, phase: Math.random() * Math.PI * 2 });
  movingTerrain.push({ x: W + 118, y: FLOOR - 116, w: 96, h: 20, vx: TERRAIN_SCROLL_SPEED, type: "step", lift: true, baseY: FLOOR - 116, amp: 22, phase: Math.random() * Math.PI * 2 });
}

function breakObstacle(o) {
  o.dead = true;
  if (o.kind === "barrel") {
    pulse(o.x + o.w * 0.5, o.y + o.h * 0.5, 118, 4);
    spawnEffect("explosion", o.x + o.w * 0.5, o.y + o.h * 0.5, 96);
    screenShake = 5;
  }
  puff(o.x + o.w * 0.5, o.y + o.h * 0.5, o.kind === "barrel" ? "#ff8a5d" : "#9fb2c8", 18);
}

function upgradeStella() {
  stella.active = true;
  if (stella.level === 0) stella.level = 1;
  if (stella.chargePips >= 3) {
    stella.level = Math.min(5, stella.level + 1);
    stella.chargePips = 0;
    stageText.textContent = stella.level >= 5 ? "星黎同步 LV.5 黎明星落" : `星黎同步 LV.${stella.level}`;
  } else {
    stella.chargePips = Math.min(3, stella.chargePips + 1);
    stageText.textContent = `星黎能量 ${stella.chargePips}/3`;
  }
  stella.shield = stella.level >= 2 ? Math.min(2, stella.shield + 1) : 0;
  stella.burstGlow = 0.45;
  screenShake = 5;
}

function takeHit(amount, x, y) {
  if (player.invuln > 0) return;
  const difficulty = getDifficultyConfig();
  let finalAmount = amount;
  if (amount <= 1 && difficulty.enemyDamage < 1 && Math.random() > difficulty.enemyDamage) {
    player.invuln = 0.35;
    spawnEffect("cancel", player.x + 18, player.y + 24, 42);
    return;
  }
  if (amount <= 1 && difficulty.enemyDamage > 1 && Math.random() < difficulty.enemyDamage - 1) {
    finalAmount = 2;
  } else {
    finalAmount = Math.max(1, Math.round(amount * difficulty.enemyDamage));
  }
  if (stella.active && stella.shield > 0) {
    stella.shield = 0;
    player.invuln = 0.5;
    stella.burstGlow = 0.35;
    spawnEffect("shield", player.x + 18, player.y + 26, 86);
    puff(x, y, "#80f7ff", 20);
    return;
  }
  player.hp = Math.max(0, player.hp - finalAmount);
  player.invuln = 1.05;
  screenShake = 7;
  puff(player.x + 16, player.y + 22, "#ff6961", 16);
  if (player.hp <= 0) recordRunScore("DEFEAT");
}

function killEnemy(e, score = true) {
  e.hp = 0;
  if (score) player.score += e.score;
  spawnEffect(e.kind === "boss" ? "bossExplosion" : "explosion", e.x + e.w * 0.5, e.y + e.h * 0.5, e.kind === "boss" ? 220 : 120, e.kind === "boss" ? 1.05 : 0.62);
  puff(e.x + e.w * 0.5, e.y + e.h * 0.5, "#ffb15d", 18);
  if (e.kind === "boss") {
    bossClears += 1;
    enemyBullets.length = 0;
    bossBeams.length = 0;
    spawnPickup("stella", e.x + 80, e.y + 70);
    if (bossClears < getDifficultyConfig().bossCount) {
      stageText.textContent = `第 ${bossClears} 次 Boss 击破 · 第二封锁线展开`;
      bossSpawned = false;
      bossWarningStarted = false;
      bossWarningTimer = 0;
      runTime = 0;
      routeScoreStart = player.score;
      player.stageProgress = 0;
      movingTerrain.length = 0;
      seedTerrain();
      screenShake = 14;
      spawnEffect("burst", W * 0.5, H * 0.45, 420, 0.72);
      return;
    }
    stageText.textContent = isEndlessHell
      ? `无尽地狱 R${endlessRound} 击破 · 下一 route 待命`
      : hasNextCampaignStage()
        ? `${stageConfigs[selectedStage].bossName}击破 · 下一封锁线待命`
        : `${stageConfigs[selectedStage].bossName}击破`;
    victory = true;
    gameOverTimer = 0;
    if (!hasNextCampaignStage() && !isEndlessHell) recordRunScore("CLEAR");
    return;
  }
  if (Math.random() < 0.2) {
    const roll = Math.random();
    const type = roll < 0.34 ? "stella" : roll < 0.42 && player.hp < player.maxHp ? "health" : pickupTypes[Math.floor(Math.random() * 3)];
    spawnPickup(type, e.x, e.y);
  }
}

function damageEnemy(e, amount, fromStellaBurst = false) {
  if (e.kind === "boss" && !fromStellaBurst) {
    e.hp -= Math.max(1, amount * 0.58);
    e.barrage = Math.min(1, (e.barrage || 0) + amount * 0.015);
    return;
  }
  if (e.kind !== "boss" || !fromStellaBurst) {
    e.hp -= amount;
    return;
  }
  const phaseSize = e.maxHp / 3;
  const phaseFloor = Math.floor((e.hp - 1) / phaseSize) * phaseSize;
  const cap = Math.max(phaseFloor + 1, e.hp - Math.ceil(e.maxHp * 0.18));
  e.hp = Math.max(cap, e.hp - amount);
  e.barrage = 0;
}

function getCombatTier() {
  return player.weapon.power + player.weapon.wide + player.weapon.rapid + Math.max(0, stella.level - 1);
}

function getEnemyScale() {
  const tier = getCombatTier();
  const stage = stageConfigs[selectedStage];
  const difficulty = getDifficultyConfig();
  const route = Math.min(1, player.stageProgress / 100);
  const endlessScale = getEndlessDifficultyScale();
  return {
    hp: stage.enemy * difficulty.enemyHp * (1 + tier * 0.1 + route * 0.18) * endlessScale,
    speed: difficulty.enemySpeed * (1 + tier * 0.022 + route * 0.08 + (endlessScale - 1) * 0.18),
    fire: Math.max(0.32, (1 - tier * 0.034 - route * 0.08 - (endlessScale - 1) * 0.12) * difficulty.enemyFire),
  };
}

function hasBoss() {
  return enemies.some((e) => e.kind === "boss" && e.hp > 0);
}

function draw() {
  ctx.save();
  if (screenShake > 0) {
    ctx.translate((Math.random() - 0.5) * screenShake, (Math.random() - 0.5) * screenShake);
  }
  drawBackground();
  drawPlatforms();
  drawObstacles();
  drawPickups();
  drawBossBeams();
  drawBullets();
  drawEnemies();
  drawPlayer();
  drawStella();
  drawParticles();
  drawEffects();
  ctx.restore();
  drawGameFrame();
  drawScoreHud();
  drawRouteProgress();
  drawBossWarning();
  drawOverlayText();
  drawUltimateSequence();
}

function drawBackground() {
  const bg = getStageBackground();
  if (bg.complete) {
    const sx = (time * 18) % W;
    ctx.drawImage(bg, -sx, 0, W, H);
    ctx.drawImage(bg, W - sx, 0, W, H);
  } else {
    ctx.fillStyle = "#0a1025";
    ctx.fillRect(0, 0, W, H);
  }

  ctx.fillStyle = "rgba(4, 7, 18, 0.52)";
  ctx.fillRect(0, 0, W, H);
  drawStageAtmosphere();

  ctx.fillStyle = "rgba(3, 5, 13, 0.82)";
  ctx.fillRect(0, FLOOR + 34, W, H - FLOOR);
  ctx.fillStyle = "rgba(255, 91, 87, 0.14)";
  for (let x = 30; x < W; x += 150) {
    ctx.fillRect(x, FLOOR + 62, 80, 3);
  }
}

function drawStageAtmosphere() {
  if (selectedStage === "slum") {
    ctx.save();
    ctx.fillStyle = "rgba(255, 119, 183, 0.08)";
    for (let y = 108; y < FLOOR - 10; y += 58) {
      ctx.fillRect(0, y + Math.sin(time * 3 + y) * 2, W, 2);
    }
    ctx.fillStyle = "rgba(255, 211, 108, 0.1)";
    for (let x = -80; x < W + 80; x += 120) {
      ctx.fillRect(x + ((time * 36) % 120), FLOOR - 164, 46, 3);
      ctx.fillRect(x + 34 + ((time * 36) % 120), FLOOR - 118, 26, 3);
    }
    ctx.restore();
    return;
  }
  if (selectedStage === "virtual") {
    ctx.save();
    const scan = (time * 90) % 128;
    ctx.fillStyle = "rgba(100, 232, 255, 0.08)";
    for (let x = -96; x < W + 128; x += 128) {
      ctx.fillRect(x + scan, 70, 3, FLOOR - 58);
    }
    ctx.strokeStyle = "rgba(255, 119, 183, 0.2)";
    ctx.lineWidth = 2;
    for (let y = 112; y < FLOOR - 28; y += 70) {
      ctx.beginPath();
      ctx.moveTo(0, y + Math.sin(time * 2.4 + y) * 5);
      ctx.lineTo(W, y + Math.cos(time * 2.4 + y) * 5);
      ctx.stroke();
    }
    ctx.restore();
  }
}

function drawPlatforms() {
  for (const p of [...platforms, ...movingTerrain]) {
    const scrollJitter = p.type === "ground" ? 0 : Math.sin(time * 2 + p.x * 0.01) * 1.5;
    ctx.fillStyle = p.type === "ground" ? "#172133" : "#24344b";
    ctx.fillRect(p.x, p.y + scrollJitter, p.w, p.h);
    ctx.fillStyle = p.type === "upper" ? "#64e8ff" : "#d8e9ff";
    ctx.fillRect(p.x, p.y + scrollJitter, p.w, 4);
    ctx.fillStyle = "rgba(5, 8, 18, 0.55)";
    for (let x = p.x + 18; x < p.x + p.w - 8; x += 42) {
      ctx.fillRect(x, p.y + 11 + scrollJitter, 24, 8);
    }
  }
}

function drawPlayer() {
  const flash = player.invuln > 0 && Math.floor(time * 18) % 2 === 0;
  if (flash) return;
  const x = player.x;
  const y = player.y;
  const f = player.facing;
  const character = characterConfigs[selectedCharacter];
  const visualScale = character.visualScale || 1;
  const actionFrame = getPlayerActionFrame();
  if (actionFrame !== null) {
    const actionSheet = getTransparentActionSheet() || getCharacterActionSheet();
    if (isLoaded(actionSheet)) {
      drawPlayerActionFrame(actionSheet, actionFrame, x, y, f, visualScale);
      return;
    }
  }

  const aimFrame = getPlayerAimFrame();

  if (aimFrame !== null) {
    const aimSheet = getTransparentAimSheet() || getCharacterAimSheet();
    if (isLoaded(aimSheet)) {
      const aimUp = aimFrame === 0;
      const baseW = aimUp ? 140 : 133;
      const baseH = aimUp ? 140 : 133;
      const drawW = baseW * visualScale;
      const drawH = baseH * visualScale;
      const baseX = x - (aimUp ? 57 : 52);
      const baseY = y - (aimUp ? 77 : 62);
      drawSheetFrame(aimSheet, 2, 1, aimFrame, baseX - (drawW - baseW) * 0.46, baseY - (drawH - baseH) * 0.76, drawW, drawH, f < 0, 0.012);
      return;
    }
  }

  const playerSheet = getTransparentPlayerSheet() || getCharacterSheet();
  if (isLoaded(playerSheet)) {
    const frame = getPlayerFrame();
    const horizontalShot = frame === 3;
    const crouch = player.crouching;
    const baseW = horizontalShot ? 126 : crouch ? 115 : 104;
    const baseH = crouch ? 94 : 104;
    const drawW = baseW * visualScale;
    const drawH = baseH * visualScale;
    const baseX = x - (horizontalShot ? 42 : crouch ? 40 : 34);
    const baseY = y - (crouch ? 36 : 43);
    const drawX = baseX - (drawW - baseW) * (horizontalShot ? 0.4 : 0.5);
    const drawY = baseY - (drawH - baseH) * 0.78;
    const inset = horizontalShot ? 0.012 : crouch ? 0.025 : 0.035;
    drawSheetFrame(playerSheet, 4, 2, frame, drawX, drawY, drawW, drawH, f < 0, inset);
    if (keys.has("j") || keys.has("z")) {
      drawDiagonalGunOverlay(x, y);
      drawMuzzleFlash(x, y, f);
    }
    return;
  }

  px(x + 8, y + 6, 16, 16, "#222b38");
  px(x + 13, y + 1, 10, 8, "#352536");
  px(x + 10, y + 22, 18, 22, "#2d3543");
  px(x + 7, y + 22, 7, 28, "#151c27");
  px(x + 24, y + 22, 7, 28, "#151c27");
  px(x + 6, y + 20, 24, 5, "#db514b");
  px(x + (f > 0 ? 26 : -16), y + 25, 24, 7, "#4f6276");
  px(x + (f > 0 ? 46 : -22), y + 27, 8, 3, "#ffd36c");
  px(x + 11, y + 44, 7, 14, "#171d26");
  px(x + 22, y + 44, 7, 14, "#171d26");
  px(x + 7, y + 56, 12, 4, "#8b98a7");
  px(x + 21, y + 56, 12, 4, "#8b98a7");
}

function drawMuzzleFlash(x, y, f) {
  const angle = getPlayerAimAngle();
  const muzzle = getPlayerMuzzlePoint(angle);
  const cos = Math.cos(angle);
  const sin = Math.sin(angle);
  const vertical = Math.abs(cos) < 0.35;
  const diagonal = Math.abs(cos) >= 0.35 && Math.abs(sin) >= 0.35;
  if (diagonal) {
    ctx.save();
    ctx.translate(muzzle.x, muzzle.y);
    ctx.rotate(angle);
    px(-2, -2, 12, 4, "#ffd36c");
    px(8, -4, 10, 8, "#fff1b8");
    px(16, -1, 8, 2, "#ff8a5d");
    ctx.restore();
    return;
  }
  if (vertical && sin < 0) {
    px(muzzle.x - 3, muzzle.y - 10, 5, 12, "#ffd36c");
    px(muzzle.x - 6, muzzle.y - 15, 9, 6, "#fff1b8");
    return;
  }
  if (vertical && sin > 0) {
    px(muzzle.x - 3, muzzle.y, 5, 12, "#ffd36c");
    px(muzzle.x - 6, muzzle.y + 10, 9, 6, "#fff1b8");
    return;
  }
  px(muzzle.x + (f > 0 ? 0 : -8), muzzle.y - 1, 8, 3, "#ffd36c");
}

function getPlayerAimFrame() {
  const shooting = keys.has("j") || keys.has("z");
  if (!shooting) return null;
  const angle = getPlayerAimAngle();
  if (Math.abs(Math.cos(angle)) >= 0.35) return null;
  if (Math.sin(angle) < 0) return 0;
  if (Math.sin(angle) > 0) return 1;
  return null;
}

function getPlayerActionFrame() {
  if (player.hp <= 0) return 6;
  const shooting = keys.has("j") || keys.has("z");
  if (!shooting) return null;
  const angle = getPlayerAimAngle();
  const cos = Math.cos(angle);
  const sin = Math.sin(angle);
  const vertical = Math.abs(cos) < 0.35;
  const diagonal = Math.abs(cos) >= 0.35 && Math.abs(sin) >= 0.35;
  if (player.crouching && player.onGround) return 4;
  if (vertical && sin < 0) return 0;
  if (!player.onGround && vertical && sin > 0) return 1;
  if (diagonal) return sin < 0 ? 2 : 3;
  if (!player.onGround) return 5;
  return null;
}

function drawPlayerActionFrame(actionSheet, frame, x, y, facing, visualScale) {
  const sourceW = actionSheet.naturalWidth || actionSheet.width;
  const sourceH = actionSheet.naturalHeight || actionSheet.height;
  const cellW = sourceW / 7;
  const cellH = sourceH;
  const aspect = cellW / cellH;
  const grounded = frame === 0 || frame === 4 || frame === 6;
  const baseH = frame === 4 ? 110 : frame === 6 ? 112 : 132;
  const drawH = baseH * visualScale;
  const drawW = drawH * aspect;
  const centerX = x + player.w * 0.5 + (facing > 0 ? 3 : -3);
  const drawX = centerX - drawW * 0.5;
  const drawY = grounded
    ? y + player.h + 5 - drawH
    : y + player.h * 0.5 - drawH * 0.5 - 4;
  drawSheetFrame(actionSheet, 7, 1, frame, drawX, drawY, drawW, drawH, facing < 0, 0.015);
}

function drawDiagonalGunOverlay(x, y) {
  const angle = getPlayerAimAngle();
  const cos = Math.cos(angle);
  const sin = Math.sin(angle);
  if (Math.abs(cos) < 0.35 || Math.abs(sin) < 0.35) return;
  const dir = cos >= 0 ? 1 : -1;
  ctx.save();
  ctx.translate(x + (dir > 0 ? 36 : 2), y + (sin < 0 ? 26 : 42));
  ctx.rotate(angle);
  ctx.fillStyle = "#1f2936";
  ctx.fillRect(-6, -5, 38, 10);
  ctx.fillStyle = "#596a7d";
  ctx.fillRect(18, -3, 34, 6);
  ctx.fillStyle = "#0e141f";
  ctx.fillRect(6, 4, 15, 5);
  ctx.restore();
}

function getTransparentAimSheet() {
  if (transparentAimSheet) return transparentAimSheet;
  const aimSheet = getCharacterAimSheet();
  if (!isLoaded(aimSheet)) return null;
  transparentAimSheet = shouldCleanSpriteSheet(aimSheet) ? cleanSpriteSheet(aimSheet) : aimSheet;
  return transparentAimSheet;
}

function getTransparentActionSheet() {
  if (transparentActionSheet) return transparentActionSheet;
  const actionSheet = getCharacterActionSheet();
  if (!isLoaded(actionSheet)) return null;
  transparentActionSheet = shouldCleanSpriteSheet(actionSheet) ? cleanSpriteSheet(actionSheet) : actionSheet;
  return transparentActionSheet;
}

function getTransparentPlayerSheet() {
  if (transparentPlayerSheet) return transparentPlayerSheet;
  const playerSheet = getCharacterSheet();
  if (!isLoaded(playerSheet)) return null;
  transparentPlayerSheet = shouldCleanSpriteSheet(playerSheet) ? cleanSpriteSheet(playerSheet) : playerSheet;
  return transparentPlayerSheet;
}

function getTransparentEnemySheet() {
  if (transparentEnemySheet) return transparentEnemySheet;
  const enemySheet = getStageEnemySheet();
  if (!isLoaded(enemySheet)) return null;
  transparentEnemySheet = shouldCleanSpriteSheet(enemySheet) ? cleanSpriteSheet(enemySheet) : enemySheet;
  return transparentEnemySheet;
}

function getTransparentTerrainSheet() {
  if (transparentTerrainSheet) return transparentTerrainSheet;
  const terrainSheet = getStageTerrainSheet();
  if (!isLoaded(terrainSheet)) return null;
  transparentTerrainSheet = shouldCleanSpriteSheet(terrainSheet) ? cleanSpriteSheet(terrainSheet) : terrainSheet;
  return transparentTerrainSheet;
}

function getTransparentBossSheet() {
  if (transparentBossSheet) return transparentBossSheet;
  const bossSheet = getStageBossSheet();
  if (!isLoaded(bossSheet)) return null;
  transparentBossSheet = shouldCleanSpriteSheet(bossSheet) ? cleanSpriteSheet(bossSheet) : bossSheet;
  return transparentBossSheet;
}

function shouldCleanSpriteSheet(img) {
  // All gameplay sheets are now authored as transparent runtime assets.
  // Avoid canvas pixel reads here so the demo also works when opened via file://.
  return false;
}

function cleanSpriteSheet(source) {
  const offscreen = document.createElement("canvas");
  offscreen.width = source.naturalWidth || source.width;
  offscreen.height = source.naturalHeight || source.height;
  const off = offscreen.getContext("2d", { willReadFrequently: true });
  off.imageSmoothingEnabled = false;
  off.drawImage(source, 0, 0);
  const pixels = off.getImageData(0, 0, offscreen.width, offscreen.height);
  for (let i = 0; i < pixels.data.length; i += 4) {
    const r = pixels.data[i];
    const g = pixels.data[i + 1];
    const b = pixels.data[i + 2];
    const a = pixels.data[i + 3];
    const neutral = Math.max(r, g, b) - Math.min(r, g, b) < 14;
    const paleGrid = neutral && r > 210 && g > 210 && b > 210;
    const ghostEdge = a < 245 && neutral && r > 188 && g > 188 && b > 188;
    if (paleGrid || ghostEdge) pixels.data[i + 3] = 0;
  }
  off.putImageData(pixels, 0, 0);
  return offscreen;
}

function drawStella() {
  if (!stella.active) return;
  const x = stella.x;
  const y = stella.y;
  const glow = stella.burstGlow;

  if (glow > 0.05) {
    ctx.globalAlpha = glow;
    ctx.fillStyle = "#ff77b7";
    ctx.beginPath();
    ctx.arc(x + 7, y + 2, stella.level >= 3 ? 38 : 28, 0, Math.PI * 2);
    ctx.fill();
    ctx.globalAlpha = 1;
  }

  if (isLoaded(sheets.stella)) {
    drawSheetFrame(sheets.stella, 4, 2, getStellaFrame(), x - 33, y - 43, 88, 88, false, 0.09);
    if (stella.shield > 0) drawStellaShieldPips(x + 7, y + 30);
    return;
  }

  px(x - 9, y - 21, 32, 27, "rgba(93, 39, 72, 0.38)");
  px(x - 4, y - 19, 22, 19, "#4b1e39");
  px(x - 2, y - 8, 20, 12, "#e94f91");
  px(x + 1, y - 16, 14, 12, "#f7d7d9");
  px(x + 3, y - 11, 3, 3, "#49304a");
  px(x + 11, y - 11, 3, 3, "#49304a");
  px(x + 1, y - 2, 16, 11, "#f6f1ee");
  px(x - 2, y + 5, 22, 16, "#182033");
  px(x + 4, y + 4, 10, 5, "#c9424d");
  px(x - 7, y + 7, 8, 12, "#182033");
  px(x + 19, y + 7, 8, 12, "#182033");
  px(x + 1, y + 19, 18, 7, "#1c2135");
  px(x + 19, y - 24, 6, 6, "#f4ead9");
  px(x + 24, y - 22, 5, 8, "#f4ead9");
  px(x + 17, y - 18, 12, 5, "#6a9bed");
  px(x - 8, y - 12, 8, 2, "#b9c0d6");
  if (stella.shield > 0) drawStellaShieldPips(x + 7, y + 30);
}

function drawStellaShieldPips(x, y) {
  for (let i = 0; i < stella.shield; i += 1) {
    const px = x - 10 + i * 20;
    ctx.fillStyle = "rgba(119, 240, 178, 0.28)";
    ctx.fillRect(px - 5, y - 5, 10, 10);
    ctx.fillStyle = "#77f0b2";
    ctx.fillRect(px - 2, y - 8, 4, 16);
    ctx.fillRect(px - 8, y - 2, 16, 4);
    ctx.fillStyle = "#e8fff4";
    ctx.fillRect(px - 1, y - 5, 2, 10);
    ctx.fillRect(px - 5, y - 1, 10, 2);
  }
}

function drawEnemies() {
  for (const e of enemies) {
    const x = e.x;
    const y = e.y;
    if (e.kind === "boss") {
      const bossSheet = getTransparentBossSheet() || getStageBossSheet();
      if (isLoaded(bossSheet)) {
        const bossFrame = e.phase === 3 ? 3 : e.fireCd > e.fire - 0.1 ? 1 : e.phase === 2 ? 2 : 0;
        const bossDraw = getBossDrawBox(e, bossFrame);
        if (e.teleportFlash > 0) {
          ctx.save();
          ctx.globalAlpha = 0.36;
          drawSheetFrame(bossSheet, 4, 2, bossFrame, x + bossDraw.x - 18, y + bossDraw.y, bossDraw.w, bossDraw.h);
          ctx.restore();
        }
        drawSheetFrame(bossSheet, 4, 2, bossFrame, x + bossDraw.x, y + bossDraw.y, bossDraw.w, bossDraw.h);
      } else {
        px(x, y, e.w, e.h, "#26303c");
        px(x + 22, y + 42, 34, 28, "#ff605c");
      }
      if (e.burn > 0) drawBurningEnemy(e);
      drawBossHp(e);
      continue;
    }
    const enemySheet = getTransparentEnemySheet() || getStageEnemySheet();
    if (isLoaded(enemySheet)) {
      const frame = getEnemyFrame(e);
      const draw = getEnemyDrawBox(e);
      const defaultEnemyFlip = selectedStage === "slum" || selectedStage === "virtual";
      const enemyFlip = e.entrySide === "left" ? !defaultEnemyFlip : defaultEnemyFlip;
      drawSheetFrame(enemySheet, 4, 2, frame, x + draw.x, y + draw.y, draw.w, draw.h, enemyFlip);
      if (e.burn > 0) drawBurningEnemy(e);
      drawEnemyHp(e, x, y);
      continue;
    }
    if (e.kind === "drone") {
      px(x, y + 8, 46, 20, "#616c5d");
      px(x + 6, y + 2, 28, 10, "#2e3935");
      px(x + 6, y + 14, 8, 8, "#ff605c");
      px(x + 14, y + 27, 18, 9, "#6ff2ff");
    } else if (e.kind === "shield") {
      px(x + 8, y, 22, 18, "#29313d");
      px(x + 6, y + 18, 24, 34, "#414b43");
      px(x - 10, y + 12, 12, 44, "#9aa98d");
      px(x + 12, y + 24, 8, 7, "#ff605c");
      px(x + 8, y + 52, 9, 8, "#151a21");
      px(x + 24, y + 52, 9, 8, "#151a21");
    } else if (e.kind === "turret") {
      px(x + 4, y + 12, 38, 26, "#3b4655");
      px(x - 12, y + 20, 24, 8, "#697b8c");
      px(x + 16, y + 4, 16, 13, "#222b35");
      px(x + 18, y + 16, 8, 8, "#ff605c");
      px(x, y + 38, 54, 6, "#202630");
    } else {
      px(x + 7, y, 22, 18, "#29313d");
      px(x + 5, y + 18, 26, 34, "#394355");
      px(x - 2, y + 27, 18, 7, "#697b8c");
      px(x + 13, y + 23, 8, 7, "#ff605c");
      px(x + 8, y + 52, 9, 8, "#151a21");
      px(x + 23, y + 52, 9, 8, "#151a21");
    }
    if (e.burn > 0) drawBurningEnemy(e);
    drawEnemyHp(e, x, y);
  }
}

function drawBurningEnemy(e) {
  const cx = e.x + e.w * 0.5;
  const cy = e.y + e.h * 0.55;
  const radius = e.kind === "boss" ? 94 : 34;
  ctx.save();
  ctx.globalAlpha = 0.28 + Math.sin(time * 18) * 0.08;
  ctx.fillStyle = "#ff8a5d";
  ctx.beginPath();
  ctx.ellipse(cx, cy, radius, radius * 0.55, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.globalAlpha = 0.65;
  ctx.fillStyle = "#64e8ff";
  ctx.fillRect(cx - radius * 0.42, cy - radius * 0.08, radius * 0.84, 3);
  ctx.restore();
}

function drawObstacles() {
  for (const o of obstacles) {
    const config = obstacleConfigs[o.kind] || obstacleConfigs.crate;
    const terrainSheet = getTransparentTerrainSheet() || getStageTerrainSheet();
    if (isLoaded(terrainSheet)) {
      drawSheetFrame(terrainSheet, 4, 2, config.frame, o.x + config.drawX, o.y + config.drawY, config.drawW, config.drawH);
    } else {
      px(o.x, o.y, o.w, o.h, o.kind === "barrel" ? "#ff5b57" : "#4f6276");
    }
    ctx.fillStyle = "rgba(255,255,255,0.18)";
    ctx.fillRect(o.x, o.y - 6, o.w, 3);
    ctx.fillStyle = o.kind === "barrel" ? "#ff8a5d" : o.kind === "laserGate" ? "#ff5b57" : o.kind === "generator" ? "#64e8ff" : "#77f0b2";
    ctx.fillRect(o.x, o.y - 6, o.w * Math.max(0, o.hp / o.maxHp), 3);
  }
}

function drawBullets() {
  for (const b of bullets) {
    if (isLoaded(sheets.projectiles)) {
      drawProjectileSprite(b);
      continue;
    }
    drawFallbackPlayerBullet(b);
  }
  for (const b of enemyBullets) {
    drawEnemyBullet(b);
  }
}

function drawProjectileSprite(b) {
  if (b.kind === "flame") {
    drawFlameProjectile(b);
    return;
  }
  if (b.kind === "rail") {
    drawRailProjectile(b);
    return;
  }
  if (b.kind && b.kind.startsWith("stella")) {
    drawStellaProjectile(b);
    return;
  }
  const frame = b.kind === "stella" ? 3 : 0;
  const cell = 128;
  const cx = b.x + b.w * 0.5;
  const cy = b.y + b.h * 0.5;
  const angle = Math.atan2(b.vy, b.vx);
  const speedGlow = Math.min(1, Math.hypot(b.vx, b.vy) / 780);
  const length = b.kind === "stella" ? 28 : b.kind === "rail" ? 46 : b.kind === "rifleWave" ? 78 : b.kind === "arc" ? 38 : 36;
  const height = b.kind === "stella" ? 28 : b.kind === "rifleWave" ? 26 : b.kind === "arc" ? 20 : 15;
  ctx.save();
  ctx.translate(cx, cy);
  ctx.rotate(angle + (b.kind === "stella" ? time * 8 : 0));
  ctx.globalAlpha = b.kind === "rifleWave" ? 0.2 : 0.28 + speedGlow * 0.22;
  ctx.fillStyle = b.color;
  if (b.kind === "rifleWave") {
    ctx.fillRect(-length * 0.58, -height * 0.32, length * 1.06, height * 0.64);
    ctx.globalAlpha = 0.42;
    ctx.fillStyle = "#ffd36c";
    ctx.fillRect(-length * 0.72, -1, length * 1.15, 2);
    ctx.globalAlpha = 0.88;
    ctx.fillStyle = "#fff1b8";
    ctx.fillRect(length * 0.1, -2, length * 0.28, 4);
  } else {
    ctx.fillRect(-length * 0.75, -height * 0.22, length * 1.5, height * 0.44);
  }
  ctx.globalAlpha = 1;
  ctx.drawImage(sheets.projectiles, frame * cell, 0, cell, cell, -length * 0.5, -height * 0.5, length, height);
  ctx.restore();
}

function drawStellaProjectile(b) {
  const cx = b.x + b.w * 0.5;
  const cy = b.y + b.h * 0.5;
  const angle = Math.atan2(b.vy, b.vx);
  const color = b.color || "#70f2ff";
  ctx.save();
  ctx.translate(cx, cy);
  ctx.rotate(angle + (b.kind === "stellaStar" ? time * 9 : 0));
  if (b.kind === "stellaLance") {
    const length = Math.max(44, Math.hypot(b.w, b.h) * 1.45);
    ctx.globalAlpha = 0.24;
    ctx.fillStyle = "#ff77d9";
    ctx.fillRect(-length * 0.55, -9, length * 1.08, 18);
    ctx.globalAlpha = 0.92;
    ctx.fillStyle = color;
    ctx.fillRect(-length * 0.48, -3, length * 0.96, 6);
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(length * 0.18, -1.5, length * 0.34, 3);
  } else if (b.kind === "stellaStar") {
    ctx.globalAlpha = 0.3;
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.arc(0, 0, 18, 0, Math.PI * 2);
    ctx.fill();
    ctx.globalAlpha = 0.95;
    ctx.fillStyle = "#fff1ff";
    ctx.beginPath();
    for (let i = 0; i < 8; i += 1) {
      const r = i % 2 ? 6 : 16;
      const a = (Math.PI * 2 * i) / 8;
      const x = Math.cos(a) * r;
      const y = Math.sin(a) * r;
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.closePath();
    ctx.fill();
  } else {
    const r = b.kind === "stellaShard" ? 13 : b.kind === "stellaBolt" ? 11 : 9;
    ctx.globalAlpha = 0.26;
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.ellipse(0, 0, r * 1.45, r * 0.82, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.globalAlpha = 1;
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(-r * 0.45, -2, r * 0.9, 4);
    ctx.fillStyle = color;
    ctx.fillRect(-r * 0.15, -r * 0.75, r * 0.3, r * 1.5);
  }
  ctx.restore();
}

function drawFlameProjectile(b) {
  const cx = b.x + b.w * 0.5;
  const cy = b.y + b.h * 0.5;
  const angle = Math.atan2(b.vy, b.vx);
  const r = b.radius || Math.max(b.w, b.h);
  ctx.save();
  ctx.translate(cx, cy);
  ctx.rotate(angle);
  if (b.stream) {
    const length = b.streamLength || Math.max(b.w, b.h);
    const thick = Math.max(18, Math.min(b.w, b.h));
    const pulse = 0.72 + Math.sin(time * 28 + b.x * 0.02) * 0.12;
    ctx.globalAlpha = 0.22;
    ctx.fillStyle = "#ff5b57";
    ctx.beginPath();
    ctx.ellipse(-length * 0.1, 0, length * 0.72, thick * 0.86, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.globalAlpha = 0.78 * pulse;
    const grad = ctx.createLinearGradient(-length * 0.5, 0, length * 0.55, 0);
    grad.addColorStop(0, "rgba(185,112,255,0.12)");
    grad.addColorStop(0.24, "rgba(255,96,92,0.72)");
    grad.addColorStop(0.72, b.color || "#ff8a5d");
    grad.addColorStop(1, "rgba(255,241,184,0.95)");
    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.moveTo(-length * 0.52, -thick * 0.34);
    ctx.lineTo(length * 0.18, -thick * 0.48);
    ctx.lineTo(length * 0.58, 0);
    ctx.lineTo(length * 0.18, thick * 0.48);
    ctx.lineTo(-length * 0.52, thick * 0.34);
    ctx.closePath();
    ctx.fill();
    ctx.globalAlpha = 0.98;
    ctx.fillStyle = "#fff1b8";
    ctx.fillRect(length * 0.06, -3, length * 0.42, 6);
    ctx.restore();
    return;
  }
  ctx.globalAlpha = 0.24;
  ctx.fillStyle = "#ff5b57";
  ctx.beginPath();
  ctx.ellipse(0, 0, r * 1.15, r * 0.48, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.globalAlpha = 0.74;
  ctx.fillStyle = b.color || "#ff8a5d";
  ctx.beginPath();
  ctx.ellipse(4, 0, r * 0.76, r * 0.34, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.globalAlpha = 0.95;
  ctx.fillStyle = "#fff1b8";
  ctx.fillRect(r * 0.1, -3, r * 0.42, 6);
  ctx.restore();
}

function drawRailProjectile(b) {
  const cx = b.x + b.w * 0.5;
  const cy = b.y + b.h * 0.5;
  const angle = Math.atan2(b.vy, b.vx);
  const length = Math.max(b.overcharged ? 92 : 58, Math.hypot(b.w, b.h) * (b.overcharged ? 1.55 : 1.25));
  const glowH = b.overcharged ? 20 : 14;
  ctx.save();
  ctx.translate(cx, cy);
  ctx.rotate(angle);
  ctx.globalAlpha = b.overcharged ? 0.34 : 0.28;
  ctx.fillStyle = "#64e8ff";
  ctx.fillRect(-length * 0.52, -glowH * 0.5, length, glowH);
  if (b.overcharged) {
    ctx.globalAlpha = 0.42;
    ctx.strokeStyle = "#ffffff";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(-length * 0.48, -8);
    ctx.lineTo(length * 0.52, -8);
    ctx.moveTo(-length * 0.48, 8);
    ctx.lineTo(length * 0.52, 8);
    ctx.stroke();
  }
  ctx.globalAlpha = 0.9;
  ctx.fillStyle = "#9ff8ff";
  ctx.fillRect(-length * 0.5, -2.5, length, 5);
  ctx.fillStyle = "#ffffff";
  ctx.fillRect(length * 0.12, -1.5, length * 0.4, 3);
  ctx.restore();
}

function drawFallbackPlayerBullet(b) {
  ctx.fillStyle = b.color;
  ctx.fillRect(b.x, b.y, b.w, b.h);
  ctx.fillStyle = "rgba(255, 255, 255, 0.8)";
  ctx.fillRect(b.x + 2, b.y, Math.max(2, b.w * 0.35), Math.max(2, b.h * 0.45));
}

function drawEnemyBullet(b) {
  const cx = b.x + b.w * 0.5;
  const cy = b.y + b.h * 0.5;
  ctx.save();
  ctx.translate(cx, cy);
  ctx.rotate(Math.atan2(b.vy, b.vx));
  const color = b.color || "#ff605c";
  if (b.style === "orb") {
    ctx.rotate(-Math.atan2(b.vy, b.vx));
    ctx.globalAlpha = 0.3;
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.arc(0, 0, 12, 0, Math.PI * 2);
    ctx.fill();
    ctx.globalAlpha = 1;
    ctx.fillStyle = "#fff1f7";
    ctx.beginPath();
    ctx.arc(0, 0, 4, 0, Math.PI * 2);
    ctx.fill();
  } else if (b.style === "needle" || b.style === "laser") {
    ctx.fillStyle = b.style === "laser" ? "rgba(255, 96, 92, 0.24)" : "rgba(255, 119, 183, 0.22)";
    ctx.fillRect(-18, -3, 36, 6);
    ctx.fillStyle = color;
    ctx.fillRect(-13, -1.5, 26, 3);
    ctx.fillStyle = "#fff1f7";
    ctx.fillRect(4, -1, 8, 2);
  } else if (b.style === "grenade" || b.style === "bomb" || b.style === "missile") {
    ctx.fillStyle = "rgba(255, 211, 108, 0.24)";
    ctx.fillRect(-14, -6, 28, 12);
    ctx.fillStyle = color;
    ctx.fillRect(-7, -6, 14, 12);
    ctx.fillStyle = "#242b36";
    ctx.fillRect(-3, -8, 8, 4);
    ctx.fillStyle = "#fff1b8";
    ctx.fillRect(5, -2, 6, 4);
  } else if (b.style === "groundShock") {
    ctx.rotate(-Math.atan2(b.vy, b.vx));
    ctx.globalAlpha = 0.3;
    ctx.fillStyle = color;
    ctx.fillRect(-24, 4, 48, 7);
    ctx.globalAlpha = 0.82;
    ctx.fillStyle = "#fff1b8";
    ctx.beginPath();
    ctx.moveTo(-22, 7);
    ctx.lineTo(-8, -10);
    ctx.lineTo(2, 6);
    ctx.lineTo(13, -8);
    ctx.lineTo(25, 7);
    ctx.closePath();
    ctx.fill();
  } else if (b.style === "slug" || b.style === "shard") {
    ctx.fillStyle = "rgba(255, 138, 93, 0.22)";
    ctx.fillRect(-13, -5, 26, 10);
    ctx.fillStyle = color;
    ctx.fillRect(-9, -3, 18, 6);
    ctx.fillStyle = "#ffd36c";
    ctx.fillRect(1, -1, 8, 2);
  } else {
    ctx.fillStyle = b.style === "bossPlasma" ? "rgba(255, 119, 183, 0.3)" : "rgba(255, 96, 92, 0.28)";
    ctx.fillRect(-14, -5, 28, 10);
    ctx.fillStyle = color;
    ctx.fillRect(-9, -3, 18, 6);
    ctx.fillStyle = "#ffd36c";
    ctx.fillRect(-4, -1, 8, 2);
  }
  ctx.restore();
}

function drawBossBeams() {
  for (const beam of bossBeams) {
    if (beam.warning > 0) {
      const pulse = 0.35 + Math.sin(time * 30) * 0.18;
      ctx.globalAlpha = pulse;
      ctx.fillStyle = beam.style === "pillar" ? "#64e8ff" : "#ffd36c";
      ctx.fillRect(beam.x, beam.y, beam.w, beam.h);
      ctx.globalAlpha = 0.85;
      ctx.fillStyle = "#fff1b8";
      if (beam.style === "pillar") {
        ctx.fillRect(beam.x + beam.w * 0.5 - 2, beam.y, 4, beam.h);
      } else {
        ctx.fillRect(beam.x, beam.y + beam.h * 0.5 - 2, beam.w, 4);
      }
      ctx.globalAlpha = 1;
      continue;
    }
    const glow = 0.65 + Math.sin(time * 40) * 0.18;
    ctx.globalAlpha = 0.3;
    ctx.fillStyle = beam.style === "pillar" ? "#64e8ff" : "#ff5b57";
    ctx.fillRect(beam.x - 8, beam.y - 12, beam.w + 16, beam.h + 24);
    ctx.globalAlpha = glow;
    ctx.fillStyle = beam.style === "pillar" ? "#9ff8ff" : "#ff77b7";
    ctx.fillRect(beam.x, beam.y, beam.w, beam.h);
    ctx.globalAlpha = 1;
    ctx.fillStyle = "#fff1f7";
    if (beam.style === "pillar") {
      ctx.fillRect(beam.x + beam.w * 0.5 - 3, beam.y, 6, beam.h);
    } else {
      ctx.fillRect(beam.x, beam.y + beam.h * 0.5 - 3, beam.w, 6);
    }
  }
}

function drawPickups() {
  for (const p of pickups) {
    if (p.type === "health" && isLoaded(sheets.health)) {
      ctx.save();
      ctx.translate(p.x + 15, p.y + 15);
      ctx.rotate(Math.sin(time * 4 + p.t) * 0.12);
      ctx.drawImage(sheets.health, -26, -26, 52, 52);
      ctx.restore();
      continue;
    }
    if (isLoaded(sheets.items)) {
      ctx.save();
      ctx.translate(p.x + 13, p.y + 13);
      ctx.rotate(Math.sin(time * 4 + p.t) * 0.16);
      drawSheetFrame(sheets.items, 4, 2, getPickupFrame(p.type), -28, -28, 56, 56);
      ctx.restore();
      continue;
    }
    const r = 12 + Math.sin(time * 6 + p.t) * 2;
    ctx.fillStyle = "rgba(100, 232, 255, 0.2)";
    ctx.beginPath();
    ctx.arc(p.x + 13, p.y + 13, r + 10, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "#e8fbff";
    ctx.beginPath();
    ctx.moveTo(p.x + 13, p.y);
    ctx.lineTo(p.x + 18, p.y + 10);
    ctx.lineTo(p.x + 26, p.y + 13);
    ctx.lineTo(p.x + 18, p.y + 17);
    ctx.lineTo(p.x + 13, p.y + 26);
    ctx.lineTo(p.x + 8, p.y + 17);
    ctx.lineTo(p.x, p.y + 13);
    ctx.lineTo(p.x + 8, p.y + 10);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = getPickupColor(p.type || "stella");
    ctx.fillRect(p.x + 10, p.y + 10, 7, 7);
  }
}

function drawParticles() {
  for (const p of particles) {
    if (p.pulse) {
      const a = clamp(p.life / 0.34, 0, 1);
      const color = p.level >= 5 ? "255, 119, 183" : "112, 242, 255";
      ctx.strokeStyle = `rgba(${color}, ${a})`;
      ctx.lineWidth = p.level >= 5 ? 8 : 5;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.radius * (1 - a * 0.38), 0, Math.PI * 2);
      ctx.stroke();
      continue;
    }
    ctx.globalAlpha = clamp(p.life / 0.45, 0, 1);
    ctx.fillStyle = p.color;
    ctx.fillRect(p.x, p.y, p.size, p.size);
    ctx.globalAlpha = 1;
  }
}

function drawEffects() {
  for (const e of effects) {
    if (!isLoaded(sheets.effects)) {
      ctx.globalAlpha = clamp(e.life / e.maxLife, 0, 1);
      ctx.fillStyle = e.type === "ultimate" ? "#ff77b7" : "#ffb15d";
      ctx.beginPath();
      ctx.arc(e.x, e.y, e.size * (1 - e.life / e.maxLife), 0, Math.PI * 2);
      ctx.fill();
      ctx.globalAlpha = 1;
      continue;
    }
    const frame = getEffectFrame(e.type);
    const scale = 0.9 + Math.sin(e.t * 12) * 0.04;
    ctx.globalAlpha = clamp(e.life / e.maxLife, 0, 1);
    drawSheetFrame(sheets.effects, 4, 2, frame, e.x - e.size * scale * 0.5, e.y - e.size * scale * 0.5, e.size * scale, e.size * scale, false, 0.06);
    ctx.globalAlpha = 1;
  }
}

function drawGameFrame() {
  // The decorative canvas border is disabled so the playfield has no white frame.
}

function drawScoreHud() {
  const score = String(player.score).padStart(6, "0");
  const x = W - 170;
  const y = 28;
  ctx.fillStyle = "rgba(5, 8, 18, 0.62)";
  ctx.fillRect(x, y, 142, 46);
  ctx.strokeStyle = "rgba(255, 211, 108, 0.5)";
  ctx.lineWidth = 1;
  ctx.strokeRect(x + 0.5, y + 0.5, 141, 45);
  ctx.fillStyle = "#ffd36c";
  ctx.font = "900 11px system-ui, sans-serif";
  ctx.fillText("SCORE", x + 12, y + 17);
  ctx.fillStyle = "#f2f7ff";
  ctx.font = "900 24px ui-monospace, SFMono-Regular, Menlo, monospace";
  ctx.fillText(score, x + 12, y + 38);
}

function drawRouteProgress() {
  const progress = bossSpawned ? 1 : Math.min(1, player.stageProgress / 100);
  const x = 58;
  const y = H - 46;
  const w = W - 116;
  const h = 14;
  ctx.fillStyle = "rgba(5, 8, 18, 0.72)";
  ctx.fillRect(x - 12, y - 18, w + 24, 42);
  ctx.strokeStyle = "rgba(100, 232, 255, 0.28)";
  ctx.strokeRect(x - 12.5, y - 18.5, w + 24, 42);
  ctx.fillStyle = "rgba(255,255,255,0.12)";
  ctx.fillRect(x, y, w, h);
  const grad = ctx.createLinearGradient(x, 0, x + w, 0);
  grad.addColorStop(0, "#64e8ff");
  grad.addColorStop(bossSpawned ? 0.45 : 0.72, bossSpawned ? "#ff5b57" : "#ffd36c");
  grad.addColorStop(1, bossSpawned ? "#ff77b7" : "#ff77b7");
  ctx.fillStyle = grad;
  ctx.fillRect(x, y, w * progress, h);
  ctx.fillStyle = "#9fb2c8";
  ctx.font = "900 11px system-ui, sans-serif";
  ctx.fillText(bossSpawned ? "BOSS PHASE" : "ROUTE PROGRESS", x, y - 6);
  ctx.fillStyle = "#f2f7ff";
  ctx.textAlign = "right";
  ctx.fillText(bossSpawned ? stageConfigs[selectedStage].bossName : `${Math.floor(player.stageProgress)}%`, x + w, y - 6);
  ctx.textAlign = "left";
}

function drawBossWarning() {
  if (!bossWarningStarted || bossSpawned) return;
  const pulse = 0.5 + Math.sin(time * 22) * 0.5;
  ctx.save();
  ctx.globalAlpha = 0.52 + pulse * 0.18;
  ctx.fillStyle = "rgba(255, 30, 54, 0.22)";
  ctx.fillRect(0, 0, W, H);
  ctx.globalAlpha = 1;
  for (let y = 54; y < H; y += 82) {
    ctx.fillStyle = "rgba(255, 211, 108, 0.18)";
    ctx.fillRect(0, y, W, 8);
    ctx.fillStyle = "rgba(5, 8, 18, 0.72)";
    for (let x = -40; x < W + 60; x += 56) {
      ctx.beginPath();
      ctx.moveTo(x + (time * 90) % 56, y);
      ctx.lineTo(x + 24 + (time * 90) % 56, y);
      ctx.lineTo(x + 6 + (time * 90) % 56, y + 8);
      ctx.lineTo(x - 18 + (time * 90) % 56, y + 8);
      ctx.closePath();
      ctx.fill();
    }
  }
  ctx.textAlign = "center";
  ctx.fillStyle = "#050711";
  ctx.fillRect(W * 0.5 - 235, H * 0.5 - 54, 470, 112);
  ctx.strokeStyle = pulse > 0.45 ? "#ffd36c" : "#ff5b57";
  ctx.lineWidth = 3;
  ctx.strokeRect(W * 0.5 - 235, H * 0.5 - 54, 470, 112);
  ctx.fillStyle = "#ff5b57";
  ctx.font = "950 54px ui-monospace, SFMono-Regular, Menlo, monospace";
  ctx.fillText("WARNING", W * 0.5, H * 0.5 - 4);
  ctx.fillStyle = "#ffd36c";
  ctx.font = "900 16px system-ui, sans-serif";
  ctx.fillText(`${stageConfigs[selectedStage].bossName} APPROACHING`, W * 0.5, H * 0.5 + 30);
  ctx.textAlign = "left";
  ctx.restore();
}

function drawOverlayText() {
  if (gameMode === "playing" && isPaused) {
    ctx.fillStyle = "rgba(5, 8, 18, 0.36)";
    ctx.fillRect(0, 0, W, H);
    ctx.fillStyle = "#f2f7ff";
    ctx.font = "900 36px system-ui, sans-serif";
    ctx.fillText("PAUSED", 404, 244);
    ctx.font = "16px system-ui, sans-serif";
    ctx.fillStyle = "#9fdcff";
    ctx.fillText("点击 PAUSE 继续", 398, 274);
    return;
  }
  if (victory) {
    ctx.fillStyle = "rgba(5, 8, 18, 0.58)";
    ctx.fillRect(0, 0, W, H);
    ctx.fillStyle = "#ffd36c";
    ctx.font = "800 44px system-ui, sans-serif";
    const title = getVictoryTitle();
    ctx.fillText(title, Math.max(150, W * 0.5 - title.length * 22), 238);
    ctx.font = "18px system-ui, sans-serif";
    ctx.fillStyle = "#f2f7ff";
    const nextText = getVictoryPrompt();
    ctx.fillText(nextText, Math.max(80, W * 0.5 - nextText.length * 4.9), 276);
    return;
  }
  if (player.hp > 0) {
    return;
  }
  ctx.fillStyle = "rgba(5, 8, 18, 0.72)";
  ctx.fillRect(0, 0, W, H);
  ctx.fillStyle = "#f2f7ff";
  ctx.font = "700 42px system-ui, sans-serif";
  ctx.fillText("本次突围失败", 340, 240);
  ctx.font = "18px system-ui, sans-serif";
  ctx.fillStyle = "#9fb2c8";
  ctx.fillText(isEndlessHell ? "无尽地狱已结束  按 R / MENU 返回主页" : "按 R / RETRY 重试当前关卡", isEndlessHell ? 314 : 358, 276);
}

function drawUltimateSequence() {
  if (!ultimateSequence) return;
  ctx.save();
  if (ultimateSequence.cutin > 0) {
    const img = sheets.cutins[clamp(ultimateSequence.level - 1, 0, 4)];
    const flash = Math.floor(ultimateSequence.cutin * 18) % 2 === 0;
    ctx.fillStyle = flash ? "#fff" : "#12071c";
    ctx.fillStyle = flash ? "rgba(255,255,255,0.22)" : "rgba(0,0,0,0.88)";
    ctx.fillRect(0, 0, W, H);
    if (isLoaded(img)) {
      const scale = flash ? 1.04 : 1;
      const dw = W * scale;
      const dh = H * scale;
      ctx.globalAlpha = 0.98;
      ctx.drawImage(img, (W - dw) * 0.5, (H - dh) * 0.5, dw, dh);
      ctx.globalAlpha = 1;
    }
    ctx.fillStyle = "rgba(255, 119, 183, 0.45)";
    ctx.fillRect(0, 0, W, 5 + Math.random() * 12);
    ctx.fillRect(0, H - 14, W, 5 + Math.random() * 12);
    ctx.restore();
    return;
  }

  drawUltimateClearOverlay(ultimateSequence.level, clamp(ultimateSequence.clear / 2, 0, 1));
  ctx.restore();
}

function drawUltimateClearOverlay(level, alpha) {
  const pulse = 0.5 + Math.sin(time * 16) * 0.5;
  if (level === 1) {
    ctx.fillStyle = `rgba(255, 119, 183, ${0.08 + alpha * 0.12})`;
    ctx.fillRect(0, 0, W, H);
    ctx.strokeStyle = `rgba(255, 255, 255, ${0.36 + alpha * 0.28})`;
    ctx.lineWidth = 5;
    for (let i = 0; i < 5; i += 1) {
      const y = 120 + i * 74 + Math.sin(time * 7 + i) * 10;
      ctx.beginPath();
      ctx.moveTo(40, y);
      ctx.lineTo(W - 60, y - 34);
      ctx.stroke();
    }
    return;
  }

  if (level === 2) {
    ctx.fillStyle = `rgba(112, 242, 255, ${0.08 + alpha * 0.12})`;
    ctx.fillRect(0, 0, W, H);
    ctx.strokeStyle = `rgba(190, 112, 255, ${0.4 + alpha * 0.34})`;
    ctx.lineWidth = 4;
    for (let r = 110; r < 620; r += 92) {
      drawHex(W * 0.5, H * 0.45, r * (0.72 + pulse * 0.18));
    }
    return;
  }

  if (level === 3) {
    ctx.fillStyle = `rgba(126, 86, 255, ${0.1 + alpha * 0.16})`;
    ctx.fillRect(0, 0, W, H);
    ctx.strokeStyle = `rgba(255, 119, 183, ${0.45 + alpha * 0.35})`;
    ctx.lineWidth = 5;
    for (let i = 0; i < 4; i += 1) {
      ctx.beginPath();
      ctx.ellipse(W * 0.5, H * 0.46, 190 + i * 72 + pulse * 28, 62 + i * 22, time * 0.8 + i * 0.55, 0, Math.PI * 2);
      ctx.stroke();
    }
    return;
  }

  if (level === 4) {
    ctx.fillStyle = `rgba(255, 66, 170, ${0.11 + alpha * 0.15})`;
    ctx.fillRect(0, 0, W, H);
    for (let i = 0; i < 9; i += 1) {
      const x = 80 + i * 105 + Math.sin(time * 5 + i) * 18;
      ctx.strokeStyle = i % 2 ? `rgba(100, 232, 255, ${0.4 + alpha * 0.32})` : `rgba(255, 119, 183, ${0.48 + alpha * 0.34})`;
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x - 150, H);
      ctx.stroke();
    }
    return;
  }

  ctx.fillStyle = `rgba(255, 119, 183, ${0.16 + alpha * 0.2})`;
  ctx.fillRect(0, 0, W, H);
  ctx.fillStyle = `rgba(255, 255, 255, ${0.08 + pulse * 0.12})`;
  ctx.fillRect(0, 0, W, H);
  ctx.strokeStyle = `rgba(255, 255, 255, ${0.46 + alpha * 0.34})`;
  ctx.lineWidth = 6;
  for (let i = 0; i < 11; i += 1) {
    const x = ((time * 520 + i * 112) % (W + 260)) - 130;
    ctx.beginPath();
    ctx.moveTo(x, -20);
    ctx.lineTo(x - 210, H + 40);
    ctx.stroke();
  }
}

function drawHex(x, y, r) {
  ctx.beginPath();
  for (let i = 0; i < 6; i += 1) {
    const a = Math.PI / 6 + i * Math.PI / 3;
    const px = x + Math.cos(a) * r;
    const py = y + Math.sin(a) * r * 0.62;
    if (i === 0) ctx.moveTo(px, py);
    else ctx.lineTo(px, py);
  }
  ctx.closePath();
  ctx.stroke();
}

function updateHud() {
  gameWrap?.classList.toggle("is-paused", isPaused);
  if (hudStrip) {
    hudStrip.dataset.character = selectedCharacter;
  }
  updateMobilePauseButton();
  updateMobileResetButton();
  if (hpText) hpText.textContent = `${player.hp} / ${player.maxHp}`;
  updatePips(hpPips, player.maxHp, player.hp, "pip");
  if (shieldText) shieldText.textContent = `${stella.shield}`;
  updatePips(shieldPips, 2, stella.shield, "shield-pip");
  if (stellaText) stellaText.textContent = stella.active ? `LV.${stella.level}` : "未同步";
  updatePips(stellaLevelPips, 5, stella.level, "pip pink");
  if (energyText) energyText.textContent = `${stella.chargePips} / 3`;
  updatePips(energyPips, 3, stella.chargePips, "energy-pip", stella.chargePips >= 3 ? "full" : "");
  if (ultReady) ultReady.textContent = stella.chargePips >= 3 ? "RELEASE" : stella.active ? "BURST" : "CHARGE";
  if (hudStrip) hudStrip.classList.toggle("ult-is-ready", stella.chargePips >= 3);
  if (weaponText) weaponText.textContent = `P${player.weapon.power} W${player.weapon.wide} R${player.weapon.rapid}`;
  updateWeaponBars();
  if (scoreText) scoreText.textContent = String(player.score).padStart(6, "0");
  if (routeText) routeText.textContent = bossSpawned ? "BOSS" : `${Math.floor(player.stageProgress)}%`;
  if (routeFill) {
    routeFill.style.width = `${bossSpawned ? 100 : Math.min(100, player.stageProgress)}%`;
    routeFill.style.background = bossSpawned
      ? "linear-gradient(90deg, #ff5b57, #ff77b7)"
      : "linear-gradient(90deg, var(--cyan), var(--gold))";
  }
  if (chargeFill) {
    chargeFill.style.width = `${(stella.chargePips / 3) * 100}%`;
    chargeFill.parentElement.title = `星黎能量 ${stella.chargePips}/3`;
  }
}

function updateMobileResetButton() {
  if (!mobileResetButton) return;
  const ready = gameMode === "playing" && (player.hp <= 0 || victory);
  mobileResetButton.disabled = !ready;
  mobileResetButton.setAttribute("aria-disabled", ready ? "false" : "true");
  if (!victory) {
    mobileResetButton.textContent = isEndlessHell && player.hp <= 0 ? "MENU" : "RETRY";
  } else if (hasNextCampaignStage()) {
    mobileResetButton.textContent = "CONTINUE";
  } else if (isEndlessHell) {
    mobileResetButton.textContent = "NEXT";
  } else if (selectedDifficulty === "normal") {
    mobileResetButton.textContent = "HARD";
  } else if (selectedDifficulty === "hard") {
    mobileResetButton.textContent = "HELL";
  } else {
    mobileResetButton.textContent = "ENDLESS";
  }
}

function updateMobilePauseButton() {
  if (!mobileFullscreenButton) return;
  const enabled = gameMode === "playing" && player.hp > 0 && !victory;
  mobileFullscreenButton.disabled = !enabled;
  mobileFullscreenButton.setAttribute("aria-disabled", enabled ? "false" : "true");
  mobileFullscreenButton.setAttribute("aria-pressed", isPaused ? "true" : "false");
  mobileFullscreenButton.textContent = isPaused ? "RESUME" : "PAUSE";
}

function updateWeaponBars() {
  if (!weaponBars) return;
  const key = `${player.weapon.power}:${player.weapon.wide}:${player.weapon.rapid}`;
  if (weaponBars.dataset.key === key) return;
  weaponBars.dataset.key = key;
  weaponBars.innerHTML = "";
  for (const [type, value] of Object.entries(player.weapon)) {
    for (let i = 0; i < 3; i += 1) {
      const chip = document.createElement("i");
      chip.className = `weapon-chip ${type}${i < value ? " on" : ""}`;
      weaponBars.appendChild(chip);
    }
  }
}

function updatePips(container, total, active, className, activeExtra = "") {
  if (!container) return;
  const key = `${total}:${active}:${className}:${activeExtra}`;
  if (container.dataset.key === key) return;
  container.dataset.key = key;
  container.innerHTML = "";
  for (let i = 0; i < total; i += 1) {
    const pip = document.createElement("i");
    pip.className = `${className}${i < active ? ` on ${activeExtra}` : ""}`;
    container.appendChild(pip);
  }
}

function startBgmFromGesture() {
  if (bgmMutedByUser) return;
  if (bgmWanted) return;
  syncBgmForStage(false);
  bgmWanted = true;
  playBgm();
}

function toggleBgm() {
  if (bgm.paused) {
    bgmMutedByUser = false;
    bgmWanted = true;
    syncBgmForStage(false);
    playBgm();
    return;
  }
  bgmMutedByUser = true;
  bgmWanted = false;
  bgm.pause();
  updateAudioButton();
}

function getBgmTracks() {
  return stageBgmTracks[selectedStage] || defaultBgmTracks;
}

function syncBgmForStage(autoplay = false) {
  const tracks = getBgmTracks();
  bgmIndex = clamp(bgmIndex, 0, tracks.length - 1);
  if (bgmStage !== selectedStage) {
    bgmStage = selectedStage;
    bgmIndex = 0;
    bgm.src = tracks[bgmIndex];
  }
  if (autoplay) playBgm();
  else updateAudioButton();
}

function playBgm() {
  bgm.volume = 0.42;
  bgm.loop = false;
  bgm.play()
    .then(updateAudioButton)
    .catch(() => {
      bgmWanted = false;
      if (!bgmMutedByUser) bgmMutedByUser = false;
      updateAudioButton();
    });
}

function updateAudioButton() {
  const playing = !bgm.paused;
  audioButton.textContent = playing ? "BGM ON" : "BGM OFF";
  audioButton.setAttribute("aria-pressed", playing ? "true" : "false");
  if (desktopAudioButton) {
    desktopAudioButton.textContent = playing ? "BGM ON" : "BGM OFF";
    desktopAudioButton.setAttribute("aria-pressed", playing ? "true" : "false");
  }
  if (mobileAudioButton) {
    mobileAudioButton.textContent = playing ? "BGM ON" : "BGM OFF";
    mobileAudioButton.setAttribute("aria-pressed", playing ? "true" : "false");
  }
}

function requestGameFullscreen() {
  const target = document.querySelector(".game-wrap") || document.documentElement;
  const fullscreenElement = document.fullscreenElement || document.webkitFullscreenElement;
  if (fullscreenElement) {
    const exit = document.exitFullscreen || document.webkitExitFullscreen;
    exit?.call(document);
    return;
  }
  const request = target.requestFullscreen || target.webkitRequestFullscreen;
  const result = request?.call(target);
  result?.then?.(() => {
    screen.orientation?.lock?.("landscape").catch?.(() => {});
  })?.catch?.(() => {});
}

function nearestEnemy() {
  return nearestEnemies(1)[0] || null;
}

function nearestEnemies(count) {
  return enemies
    .filter((e) => e.hp > 0)
    .map((e) => {
      const dx = e.x - stella.x;
      const dy = e.y - stella.y;
      return { e, d: dx * dx + dy * dy };
    })
    .sort((a, b) => a.d - b.d)
    .slice(0, count)
    .map((item) => item.e);
}

function getPickupFrame(type) {
  if (type === "health") return 3;
  const base = type === "power" ? 0 : type === "wide" ? 1 : type === "rapid" ? 2 : 3;
  return (Math.floor(time * 5) % 2) * 4 + base;
}

function getPickupColor(type) {
  if (type === "health") return "#ff5b79";
  if (type === "power") return "#ff6b57";
  if (type === "wide") return "#ffd36c";
  if (type === "rapid") return "#64e8ff";
  return "#ff77b7";
}

function spawnEffect(type, x, y, size = 64, life = 0.34) {
  effects.push({ type, x, y, size, t: 0, life, maxLife: life });
}

function getEffectFrame(type) {
  if (type === "cancel") return 0;
  if (type === "hit") return 1;
  if (type === "explosion") return 2;
  if (type === "bossExplosion") return 3;
  if (type === "shield") return 4;
  if (type === "burst") return 5;
  if (type === "starfall") return 6;
  if (type === "ultimate") return 7;
  return 1;
}

function drawBossHp(e) {
  const x = 250;
  const y = 50;
  const w = 460;
  ctx.fillStyle = "rgba(5, 8, 18, 0.74)";
  ctx.fillRect(x - 10, y - 18, w + 20, 28);
  ctx.fillStyle = "#9fb2c8";
  ctx.font = "700 12px system-ui, sans-serif";
  ctx.fillText(`${stageConfigs[selectedStage].bossName} PHASE ${e.phase}`, x, y - 2);
  ctx.fillStyle = "rgba(255,255,255,0.2)";
  ctx.fillRect(x, y + 4, w, 8);
  ctx.fillStyle = e.phase >= 3 ? "#ff77b7" : "#ff5b57";
  ctx.fillRect(x, y + 4, w * Math.max(0, e.hp / e.maxHp), 8);
  for (let i = 1; i < 3; i += 1) {
    ctx.fillStyle = "rgba(5, 8, 18, 0.8)";
    ctx.fillRect(x + (w / 3) * i - 1, y + 3, 2, 10);
  }
}

function loadSprite(src) {
  const img = new Image();
  img.src = src;
  return img;
}

function isLoaded(img) {
  return img.complete && img.naturalWidth > 0;
}

function drawSheetFrame(img, cols, rows, frame, x, y, w, h, flip = false, inset = 0) {
  const sourceW = img.naturalWidth || img.width;
  const sourceH = img.naturalHeight || img.height;
  const col = frame % cols;
  const row = Math.floor(frame / cols);
  const baseX = Math.round((col * sourceW) / cols);
  const baseY = Math.round((row * sourceH) / rows);
  const baseW = Math.round(((col + 1) * sourceW) / cols) - baseX;
  const baseH = Math.round(((row + 1) * sourceH) / rows) - baseY;
  const ix = Math.round(baseW * inset);
  const iy = Math.round(baseH * inset);
  const sx = baseX + ix;
  const sy = baseY + iy;
  const sw = baseW - ix * 2;
  const sh = baseH - iy * 2;
  ctx.save();
  if (flip) {
    ctx.translate(x + w, y);
    ctx.scale(-1, 1);
    ctx.drawImage(img, sx, sy, sw, sh, 0, 0, w, h);
  } else {
    ctx.drawImage(img, sx, sy, sw, sh, x, y, w, h);
  }
  ctx.restore();
}

function getPlayerFrame() {
  if (player.invuln > 0) return 5;
  if (keys.has("k") || keys.has("x")) return 6;
  if (!player.onGround) return 2;
  if (player.crouching) return 4;
  if (keys.has("j") || keys.has("z")) return 3;
  if (Math.abs(player.vx) > 1) return 1;
  return 0;
}

function getStellaFrame() {
  if (stella.burstGlow > 0.26) return player.charge > 70 ? 7 : 3;
  if (keys.has("k") || keys.has("x")) return 4;
  if (stella.level >= 3) return 5;
  if (stella.shield > 0) return 2;
  if (stella.shotCd > 0.22) return 1;
  return 0;
}

function getEnemyFrame(e) {
  const col = (e.kind === "drone" || e.kind === "fastDrone" || e.kind === "bomber") ? 0 : e.kind === "turret" ? 2 : e.kind === "shield" || e.kind === "heavy" ? 3 : 1;
  const attacking = e.fireCd > e.fire - 0.26;
  return (attacking ? 4 : 0) + col;
}

function getEnemyDrawBox(e) {
  let box;
  if (e.kind === "drone" || e.kind === "fastDrone" || e.kind === "bomber") {
    box = { x: -22, y: -24, w: e.kind === "fastDrone" ? 78 : 92, h: e.kind === "fastDrone" ? 78 : 92 };
  } else if (e.kind === "turret") {
    box = { x: -25, y: -38, w: 108, h: 108 };
  } else if (e.kind === "shield" || e.kind === "heavy") {
    const size = e.kind === "heavy" ? 124 : 108;
    box = { x: -34, y: selectedStage === "rooftop" ? -28 : -31, w: size, h: size };
  } else {
    box = { x: -31, y: -29, w: 100, h: 100 };
  }
  if (selectedStage === "slum") {
    const scale = e.kind === "drone" || e.kind === "fastDrone" || e.kind === "bomber" ? 1.25 : e.kind === "heavy" || e.kind === "shield" ? 1.38 : 1.32;
    const dw = box.w * (scale - 1);
    const dh = box.h * (scale - 1);
    box = { x: box.x - dw * 0.5, y: box.y - dh * 0.72, w: box.w * scale, h: box.h * scale };
  } else if (selectedStage === "virtual" && groundedEnemyKinds.has(e.kind)) {
    const scale = e.kind === "heavy" || e.kind === "shield" ? 1.18 : e.kind === "turret" ? 1.12 : 1.08;
    const dw = box.w * (scale - 1);
    const dh = box.h * (scale - 1);
    box = { x: box.x - dw * 0.5, y: box.y - dh * 0.62, w: box.w * scale, h: box.h * scale };
  }
  if (groundedEnemyKinds.has(e.kind) && !isRooftopLowHoverKind(e.kind)) {
    box = alignGroundEnemyVisualBox(e, box);
  }
  return box;
}

function alignGroundEnemyVisualBox(e, box) {
  const frame = getEnemyFrame(e);
  const frameBottoms = enemyVisualBottoms[selectedStage] || enemyVisualBottoms.rooftop;
  const sourceBottom = frameBottoms[frame];
  if (!sourceBottom) return box;
  const sourceCellH = 512;
  const visualBottom = (sourceBottom / sourceCellH) * box.h;
  return { ...box, y: e.h - visualBottom - 1 };
}

function getBossDrawBox(e, frame) {
  let box;
  if (selectedStage === "slum") {
    box = { x: -118, y: -128, w: 540, h: 366 };
  } else if (selectedStage === "virtual") {
    box = { x: -98, y: -118, w: 410, h: 310 };
  } else {
    box = { x: -78, y: -92, w: 320, h: 220 };
  }
  if (selectedStage === "slum") {
    const sourceBottom = (bossVisualBottoms.slum[frame] || 425) / 512;
    return { ...box, y: e.h - sourceBottom * box.h - 1 };
  }
  return box;
}

function drawEnemyHp(e, x, y) {
  ctx.fillStyle = "rgba(255, 255, 255, 0.22)";
  ctx.fillRect(x, y - 8, e.w, 4);
  ctx.fillStyle = "#ff5b57";
  ctx.fillRect(x, y - 8, e.w * Math.max(0, e.hp / e.maxHp), 4);
}

function puff(x, y, color, count) {
  for (let i = 0; i < count; i += 1) {
    const a = Math.random() * Math.PI * 2;
    const s = 40 + Math.random() * 180;
    particles.push({
      x,
      y,
      vx: Math.cos(a) * s,
      vy: Math.sin(a) * s - 60,
      size: 2 + Math.random() * 5,
      color,
      life: 0.25 + Math.random() * 0.35,
    });
  }
}

function hit(a, b) {
  return a.x < b.x + b.w && a.x + a.w > b.x && a.y < b.y + b.h && a.y + a.h > b.y;
}

function prune(list) {
  for (let i = list.length - 1; i >= 0; i -= 1) {
    const b = list[i];
    if (b.life <= 0 || b.x < -80 || b.x > W + 120 || b.y < -80 || b.y > H + 80) list.splice(i, 1);
  }
}

function px(x, y, w, h, color) {
  ctx.fillStyle = color;
  ctx.fillRect(Math.round(x), Math.round(y), Math.round(w), Math.round(h));
}

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

function lerp(a, b, t) {
  return a + (b - a) * t;
}

resetGame();
requestAnimationFrame(loop);
