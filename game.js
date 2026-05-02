const SAVE_KEY = "pastoral-fields-save-v4";
const PLOT_COLS = 10;
const MAX_FIELD_SIDE = 10;
const PLOT_COUNT = PLOT_COLS * PLOT_COLS;
const LIFE_TICK_MS = 60000;
const MIN_CROP_SIZE = 0.5;
const MAX_CROP_SIZE = 100;
const MAX_FINAL_YIELD = 15;
const MINUTE = 60000;
const PLOT_UNLOCK_ORDER = buildPlotUnlockOrder();
const PLOT_UNLOCK_RANK = new Map(PLOT_UNLOCK_ORDER.map((index, rank) => [index, rank]));

const CROPS = {
  cabbage: { name: "超巨型白菜", seed: "白菜种子", seedPrice: 120, price: 10, yield: "1.7斤", growMs: 20 * MINUTE, life: 40, tags: ["震霆", "折枝"], weather: "震霆 2.3倍", rarity: "普通", reward: 44 },
  corn: { name: "小型玉米", seed: "玉米种子", seedPrice: 500, price: 120, yield: "2.3斤", growMs: 30 * MINUTE, life: 100, tags: ["折枝"], weather: "折枝 0.3倍", rarity: "普通", reward: 62 },
  chili: { name: "超巨型辣椒", seed: "辣椒种子", seedPrice: 1000, price: 400, yield: "3.4斤", growMs: 70 * MINUTE, life: 60, tags: ["折枝", "雪暴", "震霆"], weather: "雪暴 2.5倍", rarity: "普通", reward: 88 },
  tomato: { name: "番茄", seed: "番茄种子", seedPrice: 2000, price: 1200, yield: "2.0斤", growMs: 10 * MINUTE, life: 75, tags: ["潮湿"], weather: "小雨 0.1倍", rarity: "常见", reward: 54 },
  onion: { name: "洋葱", seed: "洋葱种子", seedPrice: 3500, price: 1600, yield: "2.1斤", growMs: 10 * MINUTE, life: 65, tags: ["雾霾"], weather: "雾霾 0.5倍", rarity: "常见", reward: 58 },
  carrot: { name: "胡萝卜", seed: "胡萝卜种子", seedPrice: 12000, price: 2600, yield: "1.9斤", growMs: 40 * MINUTE, life: 55, tags: ["大风"], weather: "大风 0.3倍", rarity: "常见", reward: 48 },
  eggplant: { name: "茄子", seed: "茄子种子", seedPrice: 24000, price: 3500, yield: "2.6斤", growMs: 50 * MINUTE, life: 80, tags: ["薄雾"], weather: "薄雾 0.7倍", rarity: "常见", reward: 68 },
  cauliflower: { name: "花椰菜", seed: "花椰菜种子", seedPrice: 50000, price: 6000, yield: "2.8斤", growMs: 20 * MINUTE, life: 90, tags: ["彩虹"], weather: "彩虹 10倍", rarity: "优质", reward: 96 },
  coconut: { name: "椰子", seed: "椰子种子", seedPrice: 90000, price: 9000, yield: "3.2斤", growMs: 90 * MINUTE, life: 110, tags: ["热带", "暴雨"], weather: "暴雨 1.8倍", rarity: "优质", reward: 120 }
};

const CROP_ORDER = ["corn", "chili", "cabbage", "tomato", "eggplant", "carrot", "onion", "cauliflower", "coconut"];
const STARTER_PATTERN = ["corn", "chili", "chili", "tomato", "cabbage", "carrot", "corn", "chili", "eggplant", "onion", "cabbage", "tomato", "corn", "chili", "cauliflower", "carrot", "eggplant", "cabbage"];
const PLANT_WEATHER_MUTATIONS = [
  { id: "windy", icon: "〰", name: "大风", multiplier: 0.3 },
  { id: "foggy", icon: "≋", name: "薄雾", multiplier: 0.7 },
  { id: "lightning", icon: "ϟ", name: "雷电", multiplier: 2.3 },
  { id: "rainy", icon: "⌇", name: "小雨", multiplier: 0.1 },
  { id: "snowy", icon: "✧", name: "大雪", multiplier: 1.4 },
  { id: "sunny", icon: "☼", name: "晴光", multiplier: 1.2 },
  { id: "storm", icon: "ϟ", name: "雷暴", multiplier: 3 },
  { id: "cloudy", icon: "≋", name: "多云", multiplier: 1.1 },
  { id: "blizzard", icon: "✦", name: "雪暴", multiplier: 2.5 },
  { id: "smog", icon: "≋", name: "雾霾", multiplier: 0.5 },
  { id: "rainbow", icon: "◒", name: "彩虹", multiplier: 10 },
  { id: "branch", icon: "⌁", name: "折枝", multiplier: 0.3 }
];
const WEATHER_TO_MUTATION = {
  sunny: "sunny",
  rainy: "rainy",
  storm: "storm",
  cloudy: "cloudy",
  snowy: "snowy"
};
const RARITY_MULTIPLIERS = { 普通: 1, 常见: 2, 优质: 4, 卓越: 6, 珍稀: 8, 参天: 10 };
const QUALITY_LEVELS = [
  { id: "gray", name: "灰色", className: "quality-gray", leafMax: 2, yieldMax: 3, priceMultiplier: 1, weight: 42 },
  { id: "green", name: "绿色", className: "quality-green", leafMax: 4, yieldMax: 5, priceMultiplier: 1.2, weight: 28 },
  { id: "blue", name: "蓝色", className: "quality-blue", leafMax: 6, yieldMax: 7, priceMultiplier: 1.5, weight: 16 },
  { id: "purple", name: "紫色", className: "quality-purple", leafMax: 8, yieldMax: 9, priceMultiplier: 2, weight: 8 },
  { id: "orange", name: "橙色", className: "quality-orange", leafMax: 10, yieldMax: 11, priceMultiplier: 3, weight: 4 },
  { id: "red", name: "红色", className: "quality-red", leafMax: 12, yieldMax: 13, priceMultiplier: 5, weight: 1.5 },
  { id: "gold", name: "金色", className: "quality-gold", leafMax: 14, yieldMax: 15, priceMultiplier: 8, weight: .5 }
];
const QUALITY_BY_ID = Object.fromEntries(QUALITY_LEVELS.map((quality) => [quality.id, quality]));
const TASKS = [
  { type: "freeSeed", text: "领取1袋免费种子", target: 1, rewardLeaves: 1, hint: "打开商店，点击标着“免费”的种子领取。" },
  { type: "plant", text: "播种1株作物", target: 1, rewardLeaves: 1, hint: "点击已开垦的空田，选择一种库存里的种子播种。" },
  { type: "harvest", text: "收获1株成熟作物", target: 1, rewardLeaves: 1, hint: "等待作物成熟后，点击植物弹窗里的“收获”，或用右侧一键收获。" },
  { type: "expand", text: "开垦到2×2田地", target: 2, rewardLeaves: 2, hint: "点击带小锤子的绿色田块，确认后按顺序开垦。" },
  { type: "plant", text: "累计播种3株作物", target: 3, rewardLeaves: 2, hint: "继续点击空田播种，累计播种到目标数量。" },
  { type: "harvest", text: "累计收获3株作物", target: 3, rewardLeaves: 2, hint: "等作物成熟后多收几株，一键收获也会计入任务。" },
  { type: "weather", text: "获得1个天气突变", target: 1, rewardLeaves: 2, hint: "让作物经历当前天气。幼苗阶段更容易获得天气词条，成熟后概率较低。" },
  { type: "harvestCoins", text: "通过收获赚到5000铜钱", target: 5000, rewardLeaves: 3, hint: "种更高基础价、体型更大或有天气突变的作物，收获后累计铜钱。" },
  { type: "expand", text: "开垦到3×3田地", target: 3, rewardLeaves: 3, hint: "继续点击带小锤子的下一块田地，按蛇形顺序扩到3×3。" },
  { type: "refreshShop", text: "刷新1次种子商店", target: 1, rewardLeaves: 1, hint: "打开商店，点击刷新按钮。每天前3次免费。" },
  { type: "harvest", text: "累计收获10株作物", target: 10, rewardLeaves: 3, hint: "持续种植并收获作物，累计收获10株即可完成。" }
];

const starter = {
  coins: 2000,
  grain: 0,
  xp: 0,
  xpMax: 100,
  level: 1,
  chimesUsed: 0,
  taskIndex: 0,
  taskProgress: 0,
  taskReadyToClaim: false,
  unlocked: 1,
  expansionCredits: 0,
  dailyXpDate: "",
  dailyXpEarned: 0,
  dailyXpCapBonus: 0,
  selectedSeed: "tomato",
  cropStats: Object.fromEntries(CROP_ORDER.map((key) => [key, { harvests: 0, bestPrice: 0, mutatedHarvests: 0 }])),
  bookRewards: {},
  mapX: 0,
  mapY: 0,
  zoom: 1,
  lastLifeTick: Date.now(),
  inventory: Object.fromEntries(CROP_ORDER.map((key) => [key, 0])),
  plots: Array.from({ length: PLOT_COUNT }, (_, index) => {
    const crop = null;
    const growMs = crop ? CROPS[crop].growMs : 0;
    return {
      crop,
      plantedAt: crop ? Date.now() - Math.round(growMs * (index % 4 === 0 ? .35 : index % 3 === 0 ? .68 : 1.08)) : 0,
      weather: crop && index % 3 === 0 ? PLANT_WEATHER_MUTATIONS[Math.floor(index / 3) % PLANT_WEATHER_MUTATIONS.length] : null,
      size: crop ? rollCropSize(index) : 0,
      quality: crop ? rollCropQuality() : null
    };
  })
};

const els = {
  field: document.querySelector("#field"),
  game: document.querySelector("#game"),
  cropLayer: document.querySelector("#cropLayer"),
  coins: document.querySelector("#coins"),
  grain: document.querySelector("#grain"),
  level: document.querySelector("#level"),
  xpFill: document.querySelector("#xpFill"),
  taskText: document.querySelector("#taskText"),
  toast: document.querySelector("#toast"),
  zoomIn: document.querySelector("#zoomInBtn"),
  zoomOut: document.querySelector("#zoomOutBtn"),
  zoomLabel: document.querySelector("#zoomLabel"),
  plantAll: document.querySelector("#plantAllBtn"),
  harvestAll: document.querySelector("#harvestAllBtn"),
  quickHarvest: document.querySelector("#quickHarvestBtn"),
  expand: document.querySelector("#expandBtn"),
  boost: document.querySelector("#boostBtn"),
  settings: document.querySelector("#settingsBtn"),
  log: document.querySelector("#logBtn"),
  rules: document.querySelector("#rulesBtn"),
  book: document.querySelector("#bookBtn"),
  visit: document.querySelector("#visitBtn"),
  cropCard: document.querySelector("#cropCard"),
  closeCrop: document.getElementById("closeCropMenuBtn"),
  cardHarvest: document.querySelector("#cardHarvestBtn"),
  removeCrop: document.querySelector("#removeCropBtn"),
  moveCrop: document.querySelector("#moveCropBtn"),
  itemCrop: document.querySelector("#itemCropBtn"),
  cardName: document.querySelector("#cardName"),
  cardRarity: document.querySelector("#cardRarity"),
  cardArt: document.querySelector("#cardArt"),
  cardPrice: document.querySelector("#cardPrice"),
  priceInfo: document.querySelector("#priceInfoPopover"),
  priceInfoBtn: document.querySelector("#priceInfoBtn"),
  yieldInfoBtn: document.querySelector("#yieldInfoBtn"),
  cardLife: document.querySelector("#cardLife"),
  cardLifeText: document.querySelector("#cardLifeText"),
  cardYield: document.querySelector("#cardYield"),
  cardWeather: document.querySelector("#cardWeather"),
  cardTags: document.querySelector("#cardTags"),
  shop: document.querySelector("#shopPanel"),
  shopCoins: document.querySelector("#shopCoins"),
  seedGrid: document.querySelector("#seedGrid"),
  refreshShop: document.querySelector("#refreshShopBtn"),
  farmBuilding: document.querySelector("#farmBuildingBtn"),
  storageBuilding: document.querySelector("#storageBuildingBtn"),
  shopBuilding: document.querySelector("#shopBuildingBtn"),
  farmPanel: document.querySelector("#farmPanel"),
  storagePanel: document.querySelector("#storagePanel"),
  storageGrid: document.querySelector("#storageGrid"),
  storageDetail: document.querySelector("#storageDetail"),
  farmPanelXp: document.querySelector("#farmPanelXp"),
  farmPanelXpText: document.querySelector("#farmPanelXpText"),
  farmLevelStep: document.querySelector(".farm-panel .level-step"),
  upgradeList: document.querySelector("#upgradeList"),
  upgradeFarm: document.querySelector("#upgradeFarmBtn"),
  bookPanel: document.querySelector("#bookPanel"),
  bookDetail: document.querySelector("#bookDetail"),
  bookGrid: document.querySelector("#bookGrid"),
  rulesPanel: document.querySelector("#rulesPanel")
};

function buildPlotUnlockOrder() {
  const order = [0];
  for (let side = 2; side <= MAX_FIELD_SIDE; side += 1) {
    const edge = side - 1;
    if (side % 2 === 0) {
      for (let row = 0; row < side; row += 1) order.push(row * PLOT_COLS + edge);
      for (let col = edge - 1; col >= 0; col -= 1) order.push(edge * PLOT_COLS + col);
    } else {
      for (let col = 0; col < side; col += 1) order.push(edge * PLOT_COLS + col);
      for (let row = edge - 1; row >= 0; row -= 1) order.push(row * PLOT_COLS + edge);
    }
  }
  return order;
}

let state = load();
let toastTimer = 0;
let selectedPlot = null;
let selectedStorageSeed = null;
let selectedBookSeed = null;
let dragState = null;
let pinchState = null;
let suppressClick = false;
let lastTaskInteractionAt = 0;

function load() {
  try {
    const parsed = JSON.parse(localStorage.getItem(SAVE_KEY));
    if (parsed && Array.isArray(parsed.plots)) {
      return normalize(parsed);
    }
  } catch {
    localStorage.removeItem(SAVE_KEY);
  }
  return normalize(starter);
}

function normalize(source) {
  const next = structuredClone(source);
  next.selectedSeed = CROPS[next.selectedSeed] ? next.selectedSeed : "chili";
  next.coins = Number.isFinite(next.coins) ? Math.max(0, Math.floor(next.coins)) : starter.coins;
  next.grain = Number.isFinite(next.grain) ? Math.max(0, Math.floor(next.grain)) : starter.grain;
  next.xp = Number.isFinite(next.xp) ? Math.max(0, next.xp) : starter.xp;
  next.xpMax = Number.isFinite(next.xpMax) ? Math.max(1, next.xpMax) : starter.xpMax;
  next.level = Number.isFinite(next.level) ? Math.max(1, Math.floor(next.level)) : starter.level;
  next.mapX = 0;
  next.mapY = 0;
  next.zoom = 1;
  next.lastLifeTick = Number.isFinite(next.lastLifeTick) ? next.lastLifeTick : Date.now();
  next.taskIndex = Number.isFinite(next.taskIndex) ? clamp(Math.round(next.taskIndex), 0, TASKS.length - 1) : 0;
  next.taskProgress = Number.isFinite(next.taskProgress) ? Math.max(0, next.taskProgress) : 0;
  next.taskReadyToClaim = !!next.taskReadyToClaim || next.taskProgress >= currentTaskFor(next).target;
  const legacyUnlocked = Number.isFinite(next.unlocked) ? next.unlocked : 1;
  next.unlocked = clamp(Math.round(legacyUnlocked), 1, PLOT_COUNT);
  next.expansionCredits = Number.isFinite(next.expansionCredits) ? Math.max(0, Math.floor(next.expansionCredits)) : 0;
  next.dailyXpDate = typeof next.dailyXpDate === "string" ? next.dailyXpDate : "";
  next.dailyXpEarned = Number.isFinite(next.dailyXpEarned) ? Math.max(0, next.dailyXpEarned) : 0;
  next.dailyXpCapBonus = Number.isFinite(next.dailyXpCapBonus) ? Math.max(0, next.dailyXpCapBonus) : 0;
  next.cropStats = next.cropStats || {};
  next.bookRewards = next.bookRewards || {};
  CROP_ORDER.forEach((key) => {
    const stats = next.cropStats[key] || {};
    next.cropStats[key] = {
      harvests: Number.isFinite(stats.harvests) ? Math.max(0, Math.floor(stats.harvests)) : 0,
      bestPrice: Number.isFinite(stats.bestPrice) ? Math.max(0, Math.floor(stats.bestPrice)) : 0,
      mutatedHarvests: Number.isFinite(stats.mutatedHarvests) ? Math.max(0, Math.floor(stats.mutatedHarvests)) : 0
    };
  });
  resetDailyXpIfNeeded(next);
  next.inventory = next.inventory || {};
  CROP_ORDER.forEach((key) => {
    next.inventory[key] = Number.isFinite(next.inventory[key]) ? next.inventory[key] : 3;
  });
  const existingSizes = (next.plots || [])
    .filter((plot) => CROPS[plot?.crop] && Number.isFinite(Number(plot.size)))
    .map((plot) => Number(plot.size));
  const needsVisibleSizes = existingSizes.length > 3 && Math.max(...existingSizes) - Math.min(...existingSizes) < 18;
  next.plots = Array.from({ length: PLOT_COUNT }, (_, index) => {
    const old = next.plots[index] || {};
    return {
      crop: CROPS[old.crop] ? old.crop : null,
      plantedAt: old.plantedAt || 0,
      weather: normalizePlotWeather(old.weather),
      size: CROPS[old.crop] ? normalizeCropSize(needsVisibleSizes ? null : old.size, index) : 0,
      quality: CROPS[old.crop] ? normalizeCropQuality(old.quality) : null
    };
  });
  return next;
}

function currentTaskFor(source) {
  return TASKS[Math.min(source.taskIndex || 0, TASKS.length - 1)];
}

function normalizePlotWeather(weather) {
  if (!weather || typeof weather !== "object") return null;
  const name = typeof weather.name === "string" ? weather.name : "天气";
  const id = typeof weather.id === "string" ? weather.id : "";
  const known = PLANT_WEATHER_MUTATIONS.find((item) => item.id === id || item.name === name);
  if (known) return known;
  return {
    id: id || "weather",
    icon: typeof weather.icon === "string" ? weather.icon : "✦",
    name,
    multiplier: Number.isFinite(weather.multiplier) ? weather.multiplier : 1
  };
}

function normalizeCropQuality(quality) {
  const id = typeof quality === "string" ? quality : quality?.id;
  return QUALITY_BY_ID[id] ? id : "gray";
}

function seedPrice(crop) {
  return Number.isFinite(crop?.seedPrice) ? crop.seedPrice : crop?.price || 0;
}

function currentWeatherMutation() {
  const currentWeather = window.gameWeather?.getCurrent?.();
  const mutationId = WEATHER_TO_MUTATION[currentWeather?.id];
  if (!mutationId) return null;
  return PLANT_WEATHER_MUTATIONS.find((item) => item.id === mutationId) || null;
}


function weatherMutationChance(plotOrStage = 1) {
  const stage = typeof plotOrStage === "number" ? plotOrStage : cropStage(plotOrStage);
  
  if (stage < 3) {
      // 幼苗期 (小时候) 有 60% 概率获得当前天气
      return 0.60; 
  } else {
      // 成熟后 (stage 3)，如果生机不为零，有 10% 概率获得天气
      if (typeof plotOrStage === "object" && lifeLeft(plotOrStage) > 0) {
          return 0.10;
      }
      return 0; // 生机为 0 或者是无上下文的直接调用成熟期，默认为 0
  }
}

function rollPlantWeather(plotOrStage = 1) {
  const weather = currentWeatherMutation();
  if (!weather || Math.random() >= weatherMutationChance(plotOrStage)) return null;
  return normalizePlotWeather(weather);
}

function rollCropSize(seed) {
  const random = Number.isFinite(seed) ? ((seed + 1) * 0.61803398875) % 1 : Math.random();
  let size;
  if (random < 0.45) {
    size = MIN_CROP_SIZE + (random / 0.45) * 8.5;
  } else if (random < 0.82) {
    size = 9 + ((random - 0.45) / 0.37) * 36;
  } else {
    size = 45 + ((random - 0.82) / 0.18) * 55;
  }
  return Number(clamp(size, MIN_CROP_SIZE, MAX_CROP_SIZE).toFixed(1));
}

function rollCropQuality() {
  const totalWeight = QUALITY_LEVELS.reduce((sum, quality) => sum + quality.weight, 0);
  let roll = Math.random() * totalWeight;
  for (const quality of QUALITY_LEVELS) {
    roll -= quality.weight;
    if (roll <= 0) return quality.id;
  }
  return "gray";
}

function normalizeCropSize(size, fallbackSeed) {
  const value = Number(size);
  if (Number.isFinite(value)) return clamp(value, MIN_CROP_SIZE, MAX_CROP_SIZE);
  return rollCropSize(fallbackSeed);
}

function save() {
  const snapshot = structuredClone(state);
  snapshot.mapX = 0;
  snapshot.mapY = 0;
  snapshot.zoom = 1;
  localStorage.setItem(SAVE_KEY, JSON.stringify(snapshot));
}

function cropStage(plot) {
  if (!plot.crop) return 0;
  const crop = CROPS[plot.crop];
  const progress = Math.min(1, (Date.now() - plot.plantedAt) / crop.growMs);
  if (progress >= 1) return 3;
  if (progress >= .58) return 2;
  return 1;
}

function timeLeft(plot) {
  if (!plot.crop) return 0;
  const left = Math.max(0, CROPS[plot.crop].growMs - (Date.now() - plot.plantedAt));
  return Math.ceil(left / 1000);
}

function formatDuration(totalSeconds) {
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
}

function isPlotUnlocked(index) {
  return (PLOT_UNLOCK_RANK.get(index) ?? Infinity) < state.unlocked;
}

function nextUnlockIndex() {
  if (state.unlocked >= PLOT_COUNT || state.unlocked >= fieldCapacity()) return null;
  return PLOT_UNLOCK_ORDER[state.unlocked] ?? null;
}

function fieldStage() {
  return clamp(Math.floor(Math.sqrt(state.unlocked)), 1, MAX_FIELD_SIDE);
}

function fieldCapacity() {
  return clamp(5 + (Math.max(1, state.level) - 1) * 2, 1, PLOT_COUNT);
}

function roundToOneUsefulDigit(value) {
  const magnitude = Math.pow(10, Math.max(0, Math.floor(Math.log10(Math.max(1, value)))));
  return Math.max(100, Math.round(value / magnitude) * magnitude);
}

function expansionCost() {
  return roundToOneUsefulDigit(220 * Math.pow(1.35, Math.max(0, state.unlocked - 1)));
}

function resetDailyXpIfNeeded(target = state) {
  const now = new Date();
  const today = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;
  if (target.dailyXpDate !== today) {
    target.dailyXpDate = today;
    target.dailyXpEarned = 0;
    target.dailyXpCapBonus = 0;
  }
}

function dailyXpCap() {
  resetDailyXpIfNeeded();
  return 400 + (state.dailyXpCapBonus || 0);
}

function addFarmXp(amount) {
  resetDailyXpIfNeeded();
  const gain = Math.max(0, Math.min(amount, dailyXpCap() - (state.dailyXpEarned || 0)));
  if (gain <= 0) {
    showToast("今日经验已达上限，看广告可增加100。");
    return 0;
  }
  state.dailyXpEarned += gain;
  state.xp += gain;
  levelUpIfNeeded();
  return gain;
}

function currentTask() {
  return currentTaskFor(state);
}

function taskProgressLabel(task = currentTask()) {
  return `${Math.min(task.target, Math.floor(state.taskProgress || 0))}/${task.target}`;
}

function taskHintText(task = currentTask()) {
  return task?.hint || "按照任务描述完成目标后，点击任务栏领取奖励。";
}

function recordTaskEvent(type, amount = 1) {
  const task = currentTask();
  if (!task || task.type !== type || state.taskReadyToClaim) return;
  if (type === "expand") {
    state.taskProgress = Math.max(state.taskProgress || 0, amount);
  } else {
    state.taskProgress = (state.taskProgress || 0) + amount;
  }

  if (state.taskProgress >= task.target) {
    state.taskProgress = task.target;
    state.taskReadyToClaim = true;
    showToast(`任务完成：${task.text}，点击任务栏领取奖励。`);
  }
}

window.recordTaskEvent = recordTaskEvent;

function claimTaskReward(event) {
  event?.preventDefault();
  event?.stopPropagation();
  event?.stopImmediatePropagation?.();
  const task = currentTask();
  if (!task) return;
  if (!state.taskReadyToClaim) {
    showToast(`${task.text}：${taskProgressLabel(task)}。${taskHintText(task)}`);
    return;
  }

  const leaves = task.rewardLeaves || 1;
  state.grain += leaves;
  showToast(`领取任务奖励：+${leaves}福叶。`);
  if (state.taskIndex < TASKS.length - 1) {
    state.taskIndex += 1;
    state.taskProgress = 0;
    state.taskReadyToClaim = false;
  } else {
    state.taskProgress = task.target;
    state.taskReadyToClaim = true;
  }
  commit();
}

function recordCropHarvest(cropKey, value, mutation) {
  state.cropStats[cropKey] = state.cropStats[cropKey] || { harvests: 0, bestPrice: 0, mutatedHarvests: 0 };
  state.cropStats[cropKey].harvests += 1;
  state.cropStats[cropKey].bestPrice = Math.max(state.cropStats[cropKey].bestPrice || 0, value);
  if (mutation) state.cropStats[cropKey].mutatedHarvests += 1;
}

function cropLifeMinutes(crop) {
  const minPrice = 120;
  const maxPrice = 90000;
  const progress = clamp((seedPrice(crop) - minPrice) / (maxPrice - minPrice), 0, 1);
  return Math.round(20 + progress * 180);
}

function matureMinutes(plot) {
  if (!plot.crop || cropStage(plot) < 3) return 0;
  const crop = CROPS[plot.crop];
  return Math.max(0, Math.floor((Date.now() - plot.plantedAt - crop.growMs) / LIFE_TICK_MS));
}

function lifeLeft(plot) {
  if (!plot.crop) return 0;
  const crop = CROPS[plot.crop];
  const maxLife = cropLifeMinutes(crop);
  if (cropStage(plot) < 3) return maxLife;
  return Math.max(0, maxLife - matureMinutes(plot));
}

function yieldAmount(crop) {
  const value = Number.parseFloat(String(crop.yield).replace(/[^\d.]/g, ""));
  return Number.isFinite(value) ? value : 1;
}

function cropSize(plot) {
  return normalizeCropSize(plot.size, 0);
}

function yieldCap(plot) {
  return Math.min(MAX_FINAL_YIELD, cropQuality(plot).yieldMax || MAX_FINAL_YIELD);
}

function uncappedYield(plot) {
  if (!plot.crop) return 0;
  return yieldAmount(CROPS[plot.crop]) * cropSize(plot);
}

function sizeVisualScale(plot) {
  const cap = Math.max(0.1, yieldCap(plot));
  const progress = clamp(finalYield(plot) / cap, 0, 1);
  return Number((0.5 + Math.pow(progress, 0.68) * 0.8).toFixed(2));
}

function sizeVisualLift(plot) {
  return Math.round(Math.max(0, sizeVisualScale(plot) - 1) * 4);
}

function finalYield(plot) {
  if (!plot.crop) return 0;
  return Number(Math.min(yieldCap(plot), uncappedYield(plot)).toFixed(1));
}

function yieldRangeText(plot) {
  if (!plot.crop) return "";
  const crop = CROPS[plot.crop];
  const minYield = Number(Math.min(yieldCap(plot), yieldAmount(crop) * MIN_CROP_SIZE).toFixed(1));
  return `${cropQuality(plot).name}品质范围：${minYield}-${yieldCap(plot)}斤。本株预计${finalYield(plot)}斤。`;
}

function rarityMultiplier(crop) {
  return RARITY_MULTIPLIERS[crop.rarity] || 1;
}

function rarityClass(cropOrRarity) {
  const rarity = typeof cropOrRarity === "string" ? cropOrRarity : cropOrRarity?.rarity;
  return ({
    普通: "rarity-basic",
    常见: "rarity-common",
    优质: "rarity-premium",
    卓越: "rarity-excellent",
    珍稀: "rarity-rare",
    参天: "rarity-giant"
  })[rarity] || "rarity-basic";
}

function cropQuality(plot) {
  return QUALITY_BY_ID[normalizeCropQuality(plot?.quality)] || QUALITY_LEVELS[0];
}

function qualityMultiplier(plot) {
  return cropQuality(plot).priceMultiplier || 1;
}

function mutationMultiplier(plot) {
  const mutation = normalizePlotWeather(plot.weather);
  return mutation?.multiplier || 1;
}

function cropValue(plot) {
  if (!plot.crop) return 0;
  const crop = CROPS[plot.crop];
  return Math.round(crop.price * rarityMultiplier(crop) * qualityMultiplier(plot) * finalYield(plot) * mutationMultiplier(plot));
}

function rollLeafGain(plot) {
  const quality = cropQuality(plot);
  const mutation = mutationMultiplier(plot);
  const sizeBonus = cropSize(plot) >= 20 ? 0.08 : 0;
  const mutationBonus = mutation >= 5 ? 0.15 : mutation > 1 ? 0.06 : 0;
  const chance = clamp(0.18 + quality.leafMax * 0.015 + sizeBonus + mutationBonus, 0.14, 0.68);
  if (Math.random() > chance) return 0;
  return Math.max(1, Math.ceil(Math.random() * quality.leafMax));
}

function mutationText(plot) {
  const mutation = normalizePlotWeather(plot.weather);
  return mutation ? `${mutation.name} ${mutation.multiplier}倍` : "未获得天气突变";
}

function priceFormulaRows(plot) {
  if (!plot.crop) return "";
  const crop = CROPS[plot.crop];
  const mutation = normalizePlotWeather(plot.weather);
  const base = crop.price;
  const rarity = rarityMultiplier(crop);
  const quality = cropQuality(plot);
  const baseYield = yieldAmount(crop);
  const cap = yieldCap(plot);
  const yieldValue = finalYield(plot);
  const mutationValue = mutation?.multiplier || 1;
  const value = cropValue(plot);
  const mutationLabel = mutation ? mutation.name : "无突变";
  const mutationClass = mutationValue < 1 ? " down" : mutationValue > 1 ? " up" : "";

  return `
    <button class="price-info-close" id="priceInfoCloseBtn" aria-label="关闭价格说明">×</button>
    <h3>价格说明</h3>
    <p>果实价格=基础价格×稀有度系数×品质系数×最终产量×突变词条倍率</p>
    <dl>
      <div><dt>基础价格</dt><dd>${base.toLocaleString()}</dd></div>
      <div><dt>基础产量</dt><dd>${baseYield}斤</dd></div>
      <div><dt>品质产量上限</dt><dd>${cap}斤</dd></div>
      <div><dt>本株产量</dt><dd>${yieldValue}斤</dd></div>
      <div><dt>稀有度</dt><dd>${rarity}倍</dd></div>
      <div><dt>${quality.name}品质</dt><dd>${quality.priceMultiplier}倍</dd></div>
      <div><dt>${mutationLabel}</dt><dd class="${mutationClass}">${mutationValue}倍</dd></div>
      <div class="total"><dt>最终价格</dt><dd>${value.toLocaleString()}</dd></div>
    </dl>
  `;
}

function updateCropLife() {
  const now = Date.now();
  const ticks = Math.floor((now - state.lastLifeTick) / LIFE_TICK_MS);
  if (ticks <= 0) return;

  let changed = false;
  state.plots = state.plots.map((plot) => {
    if (!plot.crop || cropStage(plot) < 3) return plot;

    if (lifeLeft(plot) <= 0) {
      changed = true;
      return { crop: null, plantedAt: 0, weather: null, size: 0, quality: null };
    }

    if (!plot.weather) {
      for (let i = 0; i < ticks; i += 1) {
        const weather = rollPlantWeather(plot);
        if (weather) {
          changed = true;
          recordTaskEvent("weather", 1);
          return { ...plot, weather };
        }
      }
    }

    return plot;
  });

  state.lastLifeTick += ticks * LIFE_TICK_MS;
  save();
  if (changed && selectedPlot !== null && !state.plots[selectedPlot]?.crop) {
    hideCropCard();
  }
}

function cropMarkup(key) {
  return `<i></i><i></i><i></i><i></i><em></em>`;
}

function render() {
  updateCropLife();
  els.field.innerHTML = "";
  els.cropLayer.innerHTML = "";
  applyMapOffset();

  state.plots.forEach((plot, index) => {
    const button = document.createElement("button");
    const stage = cropStage(plot);
    const locked = !isPlotUnlocked(index);
    const nextUnlock = locked && index === nextUnlockIndex();
    const crop = plot.crop ? CROPS[plot.crop] : null;
    button.className = `plot${locked ? " locked" : ""}${nextUnlock ? " next-unlock" : ""}${stage === 3 ? " ready" : ""}`;
    button.type = "button";

    if (nextUnlock) {
      button.title = `下一块可开垦土地，需要${expansionCost().toLocaleString()}铜钱`;
      button.setAttribute("aria-label", `下一块可开垦土地，需要${expansionCost().toLocaleString()}铜钱`);
    } else if (locked) {
      button.title = "未开垦土地，请先开垦带小锤子的下一块";
      button.setAttribute("aria-label", "未开垦土地，请先开垦带小锤子的下一块");
    } else if (!plot.crop) {
      button.title = `播种${CROPS[state.selectedSeed].seed}`;
      button.setAttribute("aria-label", `空地，播种${CROPS[state.selectedSeed].seed}`);
    } else if (stage === 3) {
      button.title = `${crop.name}已成熟`;
      button.setAttribute("aria-label", `${crop.name}已成熟`);
    } else {
      button.title = `${crop.name}，${timeLeft(plot)}秒后成熟`;
      button.setAttribute("aria-label", `${crop.name}，${timeLeft(plot)}秒后成熟`);
    }

    button.addEventListener("click", (event) => handlePlot(index, event));

    if (plot.crop && stage < 3) {
      const tag = document.createElement("b");
      tag.className = "plot-timer";
      tag.textContent = formatDuration(timeLeft(plot));
      button.appendChild(tag);
    }

    els.field.appendChild(button);
  });

  state.plots.forEach((plot, index) => {
    if (plot.crop) {
      const stage = cropStage(plot);
      if (stage < 3) {
        const tag = els.field.children[index]?.querySelector(".plot-timer");
        if (tag) tag.textContent = formatDuration(timeLeft(plot));
      }
      renderCropSprite(index, plot.crop, stage);
    }
  });

  els.coins.textContent = formatCoins(state.coins);
  els.grain.textContent = state.grain.toLocaleString();
  els.level.textContent = state.level;
  els.xpFill.style.width = `${Math.min(100, (state.xp / state.xpMax) * 100)}%`;
  const task = currentTask();
  els.taskText.style.setProperty("z-index", "30000", "important");
  els.taskText.style.setProperty("pointer-events", "auto", "important");
  els.taskText.classList.toggle("ready", !!state.taskReadyToClaim);
  els.taskText.textContent = state.taskReadyToClaim
    ? `任务完成：${task.text} 领取+${task.rewardLeaves || 1}福叶`
    : `${task.text} (${taskProgressLabel(task)})`;
  renderShop();
  renderStorage();
  renderFarmPanel();
  renderBook();
  if (selectedPlot !== null && state.plots[selectedPlot]?.crop && !els.cropCard.hidden) {
    showCropCard(selectedPlot);
  }
}

function renderCropSprite(index, cropKey, stage) {
  const row = Math.floor(index / PLOT_COLS);
  const col = index % PLOT_COLS;
  const plotButton = els.field.children[index];
  const plotRect = plotButton?.getBoundingClientRect();
  const layerRect = els.cropLayer.getBoundingClientRect();
  if (!plotRect || !layerRect.width) return;
  const zoomCompensation = 1 + ((state.zoom || 1) - 1) * 0.98;

  const cropEl = document.createElement("button");
  cropEl.type = "button";
  cropEl.className = `crop-sprite crop-sprite-${cropKey} stage-${stage}`;
  const quality = cropQuality(state.plots[index]);
  cropEl.classList.add(quality.className);
  cropEl.dataset.quality = quality.name;
  cropEl.style.setProperty("--size-scale", sizeVisualScale(state.plots[index]));
  cropEl.style.setProperty("--size-lift", `${sizeVisualLift(state.plots[index])}px`);
  const plotWeather = normalizePlotWeather(state.plots[index]?.weather);
  if (plotWeather) {
    cropEl.classList.add("has-weather", `weather-${plotWeather.id}`);
    cropEl.dataset.weather = plotWeather.name;
    cropEl.setAttribute("aria-label", `${CROPS[cropKey].name}，获得${plotWeather.name}天气`);
    const effect = document.createElement("span");
    effect.className = `crop-weather-effect weather-effect-${plotWeather.id}`;
    effect.setAttribute("aria-hidden", "true");
    effect.innerHTML = "<i></i><i></i><i></i><b></b>";
    cropEl.appendChild(effect);
    const badge = document.createElement("span");
    badge.className = "crop-weather-badge";
    badge.textContent = plotWeather.icon;
    badge.title = plotWeather.name;
    cropEl.appendChild(badge);
  }
  cropEl.style.left = `${(plotRect.left + plotRect.width / 2 - layerRect.left) / zoomCompensation}px`;
  cropEl.style.top = `${(plotRect.top + plotRect.height / 2 - layerRect.top) / zoomCompensation}px`;
  cropEl.style.zIndex = String(20 + row + col);
  cropEl.style.setProperty("--sway-delay", `${(index % 7) * -0.18}s`);
  cropEl.addEventListener("pointerdown", (event) => {
    event.stopPropagation();
  });
  cropEl.addEventListener("click", (event) => {
    event.stopPropagation();
    if (suppressClick) return;
    selectedPlot = index;
    showCropCard(index);
  });
  els.cropLayer.appendChild(cropEl);
}

function formatCoins(value) {
  return value >= 10000 ? `${(value / 10000).toFixed(value >= 100000 ? 1 : 0)}万` : value.toLocaleString();
}

function handlePlot(index, event) {
  if (suppressClick) {
    event?.preventDefault();
    return;
  }
  if (!isPlotUnlocked(index)) {
    expandField(index);
    return;
  }

  const plot = state.plots[index];
  if (!plot.crop) {
    openSeedModal(index);
    return;
  }

  selectedPlot = index;
  showCropCard(index);
}

function handleFieldFallbackClick(event) {
  const clickedElement = event.target instanceof Element ? event.target : null;
  if (
    suppressClick ||
    event.defaultPrevented ||
    clickedElement?.closest(".crop-sprite, .map-building, .topbar, .profile-card, .zoom-controls, .right-menu, .left-menu, .tool-rail, .bottom-actions, .panel, .crop-card, .seed-modal, .toast, .task")
  ) {
    return;
  }

  const plots = Array.from(els.field.children);
  let nearest = null;
  let nearestDistance = Infinity;

  plots.forEach((plot, index) => {
    const rect = plot.getBoundingClientRect();
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;
    const distance = Math.hypot(event.clientX - cx, event.clientY - cy);
    if (distance < nearestDistance) {
      nearestDistance = distance;
      nearest = index;
    }
  });

  if (nearest !== null && nearestDistance < 58) {
    event.preventDefault();
    event.stopPropagation();
    handlePlot(nearest, event);
  }
}

function applyMapOffset() {
  els.game.style.setProperty("--map-x", `${state.mapX}px`);
  els.game.style.setProperty("--map-y", `${state.mapY}px`);
  els.game.style.setProperty("--map-zoom", state.zoom.toFixed(2));
  if (els.zoomLabel) els.zoomLabel.textContent = `${Math.round(state.zoom * 100)}%`;
}

function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}

function canStartMapDrag(target) {
  return !target.closest(".crop-sprite, .map-building, .topbar, .profile-card, .zoom-controls, .right-menu, .left-menu, .tool-rail, .bottom-actions, .panel, .crop-card, .seed-modal, .toast, .task");
}

function startMapDrag(event) {
  if (event.button !== undefined && event.button !== 0) return;
  if (!canStartMapDrag(event.target)) return;

  dragState = {
    pointerId: event.pointerId,
    startX: event.clientX,
    startY: event.clientY,
    baseX: state.mapX,
    baseY: state.mapY,
    moved: false
  };
  els.game.classList.add("dragging-map");
  els.game.setPointerCapture?.(event.pointerId);
}

function moveMapDrag(event) {
  if (!dragState || event.pointerId !== dragState.pointerId) return;
  const dx = event.clientX - dragState.startX;
  const dy = event.clientY - dragState.startY;
  if (Math.abs(dx) + Math.abs(dy) > 5) {
    dragState.moved = true;
    suppressClick = true;
  }
  const zoomExtra = Math.round((state.zoom - 1) * 340);
  state.mapX = clamp(dragState.baseX + dx, -430 - zoomExtra, 430 + zoomExtra);
  state.mapY = clamp(dragState.baseY + dy, -850 - zoomExtra, 160 + zoomExtra);
  applyMapOffset();
}

function setZoom(nextZoom, options = {}) {
  const previous = state.zoom;
  const step = options.smooth ? 100 : 10;
  state.zoom = clamp(Math.round(nextZoom * step) / step, 0.8, 2.5);
  if (state.zoom === previous) {
    applyMapOffset();
    return;
  }

  const zoomExtra = Math.round((state.zoom - 1) * 340);
  state.mapX = clamp(state.mapX, -430 - zoomExtra, 430 + zoomExtra);
  state.mapY = clamp(state.mapY, -850 - zoomExtra, 160 + zoomExtra);
  if (options.toast !== false) showToast(`地图缩放 ${Math.round(state.zoom * 100)}%`);
  commit();
}

function isMapZoomTarget(target) {
  return target instanceof Element && canStartMapDrag(target);
}

function handleWheelZoom(event) {
  if (!isMapZoomTarget(event.target)) return;
  event.preventDefault();
  const direction = event.deltaY < 0 ? 1 : -1;
  setZoom(state.zoom + direction * 0.1, { toast: false });
}

function distanceBetweenTouches(touches) {
  const [first, second] = touches;
  return Math.hypot(second.clientX - first.clientX, second.clientY - first.clientY);
}

function handleTouchStart(event) {
  if (event.touches.length !== 2 || !isMapZoomTarget(event.target)) return;
  pinchState = {
    startDistance: distanceBetweenTouches(event.touches),
    startZoom: state.zoom
  };
  dragState = null;
  suppressClick = true;
}

function handleTouchMove(event) {
  if (!pinchState || event.touches.length !== 2) return;
  event.preventDefault();
  const scale = distanceBetweenTouches(event.touches) / pinchState.startDistance;
  setZoom(pinchState.startZoom * scale, { smooth: true, toast: false });
}

function handleTouchEnd(event) {
  if (!pinchState || event.touches.length >= 2) return;
  pinchState = null;
  save();
  window.setTimeout(() => {
    suppressClick = false;
  }, 100);
}

function endMapDrag(event) {
  if (!dragState || event.pointerId !== dragState.pointerId) return;
  const moved = dragState.moved;
  dragState = null;
  els.game.classList.remove("dragging-map");
  save();
  if (moved) {
    window.setTimeout(() => {
      suppressClick = false;
    }, 80);
  } else {
    suppressClick = false;
  }
}

function pointInElement(event, element) {
  const rect = element.getBoundingClientRect();
  return event.clientX >= rect.left && event.clientX <= rect.right && event.clientY >= rect.top && event.clientY <= rect.bottom;
}

function handleBuildingPointer(event) {
  if (dragState?.moved) return;
  const target = event.target instanceof Element ? event.target : null;
  if (target?.closest(".panel, .book-detail, .crop-card, .seed-modal, .toast, .topbar, .profile-card, .zoom-controls, .right-menu, .left-menu, .bottom-actions, .task")) return;
  if (pointInElement(event, els.storageBuilding)) {
    event.preventDefault();
    openPanel(els.storagePanel);
  } else if (pointInElement(event, els.shopBuilding)) {
    event.preventDefault();
    openPanel(els.shop);
  } else if (pointInElement(event, els.farmBuilding)) {
    event.preventDefault();
    openPanel(els.farmPanel);
  }
}

function plant(index, cropKey) {
  const crop = CROPS[cropKey];
  if (!crop) return;
  if (state.inventory[cropKey] <= 0) {
    showToast(`${crop.seed}不足，去种子商店补货。`);
    openPanel(els.shop);
    return;
  }

  state.inventory[cropKey] -= 1;
  const weather = rollPlantWeather(1);
  const quality = rollCropQuality();
  state.plots[index] = { crop: cropKey, plantedAt: Date.now(), weather, size: rollCropSize(), quality };
  recordTaskEvent("plant", 1);
  if (weather) recordTaskEvent("weather", 1);
  showToast(weather ? `种下${cropQuality(state.plots[index]).name}${crop.seed}，获得${weather.name}天气。` : `种下${cropQuality(state.plots[index]).name}${crop.seed}。`);
  commit();
}

function harvest(index) {
  const plot = state.plots[index];
  if (!plot.crop) return;
  const crop = CROPS[plot.crop];
  if (cropStage(plot) < 3) {
    showToast(`${timeLeft(plot)}秒后成熟。`);
    return;
  }
  if (lifeLeft(plot) <= 0) {
    state.plots[index] = { crop: null, plantedAt: 0, weather: null, size: 0, quality: null };
    showToast(`${crop.name}已经枯萎。`);
    hideCropCard();
    commit();
    return;
  }

  const value = cropValue(plot);
  const mutation = normalizePlotWeather(plot.weather);
  const leafGain = rollLeafGain(plot);
  recordCropHarvest(plot.crop, value, mutation);
  state.plots[index] = { crop: null, plantedAt: 0, weather: null, size: 0, quality: null };
  state.coins += value;
  state.grain += leafGain;
  const xpGain = addFarmXp(crop.reward);
  recordTaskEvent("harvest", 1);
  recordTaskEvent("harvestCoins", value);
  showToast(`收获${cropQuality(plot).name}${crop.name}，+${formatCoins(value)}铜钱，+${xpGain}经验${leafGain ? `，+${leafGain}福叶` : ""}。`);
  hideCropCard();
  commit();
}

function levelUpIfNeeded() {
  let levelsGained = 0;
  while (state.xp >= state.xpMax) {
    state.xp -= state.xpMax;
    state.level += 1;
    state.xpMax = Math.round(state.xpMax * 1.28);
    levelsGained += 1;
  }
  return levelsGained;
}

function plantAll() {
  openPanel(els.shop);
}

function harvestAll() {
  let count = 0;
  let coins = 0;
  let leaves = 0;
  let xpGain = 0;
  for (let i = 0; i < PLOT_COUNT; i += 1) {
    if (!isPlotUnlocked(i)) continue;
    const plot = state.plots[i];
    if (plot.crop && cropStage(plot) === 3) {
      const value = cropValue(plot);
      const mutation = normalizePlotWeather(plot.weather);
      const leafGain = rollLeafGain(plot);
      coins += value;
      leaves += leafGain;
      state.grain += leafGain;
      xpGain += addFarmXp(CROPS[plot.crop].reward);
      recordCropHarvest(plot.crop, value, mutation);
      state.plots[i] = { crop: null, plantedAt: 0, weather: null, size: 0, quality: null };
      count += 1;
    }
  }

  if (count) {
    state.coins += coins;
    recordTaskEvent("harvest", count);
    recordTaskEvent("harvestCoins", coins);
  }

  showToast(count ? `收获${count}株作物，+${formatCoins(coins)}铜钱，+${xpGain}经验${leaves ? `，+${leaves}福叶` : ""}。` : "还没有成熟作物。");
  hideCropCard();
  commit();
}

function boostAll() {
  const growing = state.plots.filter((plot) => plot.crop && cropStage(plot) < 3);
  if (!growing.length) {
    showToast("没有正在生长的作物。");
    return;
  }

  state.plots = state.plots.map((plot) => {
    if (!plot.crop || cropStage(plot) === 3) return plot;
    const crop = CROPS[plot.crop];
    return { ...plot, plantedAt: plot.plantedAt - Math.round(crop.growMs * .42) };
  });
  state.chimesUsed += 1;
  showToast("唤风铃召来大风，作物获得天气词条。");
  commit();
}

function expandField(index = null) {
  if (state.unlocked >= PLOT_COUNT) {
    showToast("田地已经全部开垦。");
    return;
  }

  const capacity = fieldCapacity();
  if (state.unlocked >= capacity) {
    showToast(`农场${state.level}级最多${capacity}块田地，升级后可多开2块。`);
    return;
  }

  const targetIndex = nextUnlockIndex();
  if (index === null) {
    showToast("请点击带小锤子的下一块田地开垦。");
    return;
  }
  if (index !== targetIndex) {
    showToast("要按顺序开垦，请先开垦带小锤子的下一块田地。");
    return;
  }

  const cost = expansionCost();
  if (state.coins < cost) {
    showToast(`开垦需要${cost.toLocaleString()}铜钱。`);
    return;
  }

  if (!window.confirm(`确定花费 ${cost.toLocaleString()} 铜钱开垦下一块田地吗？`)) {
    return;
  }

  state.coins -= cost;
  state.unlocked = Math.min(PLOT_COUNT, state.unlocked + 1);
  recordTaskEvent("expand", fieldStage());
  showToast(`新土地开垦完成：${state.unlocked}/${capacity}，花费${cost.toLocaleString()}铜钱。`);
  commit();
}

function resetGame() {
  state = normalize(starter);
  hideCropCard();
  showToast("农场已重置。");
  commit();
}

function showLog() {
  const ready = state.plots.filter((plot) => cropStage(plot) === 3).length;
  const growing = state.plots.filter((plot) => plot.crop && cropStage(plot) < 3).length;
  showToast(`${ready}株成熟，${growing}株生长中，当前选中${CROPS[state.selectedSeed].seed}。`);
}

function showCropCard(index) {
  const plot = state.plots[index];
  if (!plot.crop) return;
  const crop = CROPS[plot.crop];
  const maxLife = cropLifeMinutes(crop);
  const life = lifeLeft(plot);
  const mutation = normalizePlotWeather(plot.weather);
  const quality = cropQuality(plot);
  const value = cropValue(plot);
  els.cropCard.className = `crop-card ${rarityClass(crop)}`;
  els.cardName.textContent = crop.name;
  els.cardRarity.textContent = quality.name;
  els.cardRarity.className = `rarity-tag ${quality.className}`;
  els.cardArt.className = `card-art crop-icon crop-icon-${plot.crop}`;
  els.cardPrice.textContent = value.toLocaleString();
  els.cardLife.style.width = `${(life / maxLife) * 100}%`;
  els.cardLifeText.textContent = `${life}/${maxLife}`;
  els.cardYield.textContent = `${finalYield(plot)}斤`;
  els.yieldInfoBtn.title = yieldRangeText(plot);
  els.cardWeather.textContent = mutationText(plot);
  els.cardTags.innerHTML = mutation ? `<span class="weather-tag">${mutation.name}</span>` : "";
  els.priceInfo.innerHTML = priceFormulaRows(plot);
  els.cropCard.hidden = false;
}

function hideCropCard() {
  selectedPlot = null;
  els.cropCard.hidden = true;
  els.cropCard.className = "crop-card";
  els.priceInfo.hidden = true;
}

function renderShop() {
  els.shopCoins.textContent = formatCoins(state.coins);
  els.seedGrid.innerHTML = CROP_ORDER.slice(0, 6).map((key) => {
    const crop = CROPS[key];
    const selected = state.selectedSeed === key ? " selected" : "";
    return `
      <button class="seed-card ${rarityClass(crop)}${selected}" data-seed="${key}">
        <span class="seed-bag crop-icon crop-icon-${key}"></span>
        <strong>${crop.seed}</strong>
        <small>剩余：${state.inventory[key]}</small>
        <b>${selected ? "已选" : "选择"}</b>
      </button>
    `;
  }).join("");
}

function renderStorage() {
  if (selectedStorageSeed && !CROPS[selectedStorageSeed]) selectedStorageSeed = null;
  if (els.storageDetail) {
    if (selectedStorageSeed) {
      els.storageDetail.hidden = false;
      els.storageDetail.className = `storage-detail ${rarityClass(CROPS[selectedStorageSeed])}`;
      els.storageDetail.innerHTML = storageSeedDetailMarkup(selectedStorageSeed);
    } else {
      els.storageDetail.hidden = true;
      els.storageDetail.className = "storage-detail";
      els.storageDetail.innerHTML = "";
    }
  }

  els.storageGrid.innerHTML = CROP_ORDER.map((key) => {
    const crop = CROPS[key];
    const count = state.inventory[key] || 0;
    const selected = state.selectedSeed === key ? " selected" : "";
    const empty = count === 0 ? " empty" : "";
    return `
      <button class="storage-item ${rarityClass(crop)}${selected}${empty}" data-storage-seed="${key}" data-count="${count}">
        <span class="crop-icon crop-icon-${key}"></span>
        <strong>${crop.seed}</strong>
        <b>${count}</b>
      </button>
    `;
  }).join("");
}

function storageSeedDetailMarkup(seed) {
  const crop = CROPS[seed];
  const count = state.inventory[seed] || 0;
  const timeText = formatDuration(Math.ceil(crop.growMs / 1000));
  const minYield = Math.max(0.1, yieldAmount(crop) * MIN_CROP_SIZE).toFixed(1);
  const maxYield = MAX_FINAL_YIELD.toFixed(1).replace(/\.0$/, "");
  return `
    <div class="storage-detail-title">${crop.seed}</div>
    <div class="storage-detail-time">${timeText}</div>
    <div class="storage-detail-art">
      <span class="seed-bag crop-icon crop-icon-${seed}"></span>
    </div>
    <p>${crop.name}种子。成熟后按体型、稀有度和天气突变计算产量与售价。</p>
    <dl>
      <div><dt>种子售价：</dt><dd><span class="coin"></span>${seedPrice(crop).toLocaleString()}</dd></div>
      <div><dt>基础价格：</dt><dd><span class="coin"></span>${crop.price.toLocaleString()}</dd></div>
      <div><dt>需要地块：</dt><dd>1*2</dd></div>
      <div><dt>产量：</dt><dd>${minYield}-${maxYield}斤，按品质封顶</dd></div>
      <div><dt>库存：</dt><dd>${count}</dd></div>
    </dl>
  `;
}

function renderFarmPanel() {
  resetDailyXpIfNeeded();
  const capacity = fieldCapacity();
  const nextCost = state.unlocked < capacity ? expansionCost().toLocaleString() : "需升级";
  const pct = Math.min(100, (state.xp / state.xpMax) * 100);
  els.farmPanelXp.style.width = `${pct}%`;
  els.farmPanelXpText.textContent = `${Math.floor(state.xp)}/${state.xpMax}`;
  els.farmLevelStep.innerHTML = `<span>${state.level}</span><b>›</b><span>${state.level + 1}</span>`;
  els.upgradeList.innerHTML = `
    <p><span>今日经验</span><b>${state.dailyXpEarned}</b><em>/</em><strong>${dailyXpCap()}</strong></p>
    <p><span>田地上限</span><b>${state.unlocked}</b><em>/</em><strong>${capacity}</strong></p>
    <p><span>下块开垦</span><b>${nextCost}</b><em>›</em><strong>升级+2上限</strong></p>
  `;
  els.upgradeFarm.textContent = "看广告 +100上限";
}

function renderBook() {
  if (selectedBookSeed && !CROPS[selectedBookSeed]) selectedBookSeed = null;
  if (els.bookDetail) {
    els.bookDetail.hidden = !selectedBookSeed;
    els.bookDetail.innerHTML = selectedBookSeed ? bookDetailMarkup(selectedBookSeed) : "";
  }
  els.bookGrid.innerHTML = CROP_ORDER.map((key) => {
    const crop = CROPS[key];
    const selected = selectedBookSeed === key ? " selected" : "";
    return `
      <button class="book-card ${rarityClass(crop)}${selected}" data-book="${key}">
        <span class="crop-icon crop-icon-${key}"></span>
        <strong>${crop.name.replace("超巨型", "")}</strong>
        <small class="${rarityClass(crop)}">${crop.rarity}</small>
      </button>
    `;
  }).join("");
}

function bookTaskState(seed) {
  const crop = CROPS[seed];
  const stats = state.cropStats[seed] || { harvests: 0, bestPrice: 0, mutatedHarvests: 0 };
  const targets = [
    { id: "harvest-1", kind: "harvest", title: `${crop.name}入门`, desc: `收获${crop.name}3次`, current: stats.harvests, target: 3, reward: "铜钱 +800", apply: () => { state.coins += 800; } },
    { id: "harvest-2", kind: "harvest", title: `${crop.name}熟练`, desc: `收获${crop.name}10次`, current: stats.harvests, target: 10, reward: "经验 +80", apply: () => { addFarmXp(80); } },
    { id: "harvest-3", kind: "harvest", title: `${crop.name}大师`, desc: `收获${crop.name}25次`, current: stats.harvests, target: 25, reward: "福叶 +1", apply: () => { state.grain += 1; } },
    { id: "price-1", kind: "price", title: "精品售价", desc: `单株售价达到${formatCoins(crop.price * 30)}`, current: stats.bestPrice, target: crop.price * 30, reward: "经验 +60", apply: () => { addFarmXp(60); } },
    { id: "price-2", kind: "price", title: "高价果实", desc: `单株售价达到${formatCoins(crop.price * 100)}`, current: stats.bestPrice, target: crop.price * 100, reward: "铜钱 +2000", apply: () => { state.coins += 2000; } },
    { id: "price-3", kind: "price", title: "天价果实", desc: `单株售价达到${formatCoins(crop.price * 250)}`, current: stats.bestPrice, target: crop.price * 250, reward: "福叶 +2", apply: () => { state.grain += 2; } },
    { id: "weather-1", kind: "weather", title: "天气培育", desc: "收获1株天气突变作物", current: stats.mutatedHarvests, target: 1, reward: "铜钱 +1000", apply: () => { state.coins += 1000; } },
    { id: "weather-2", kind: "weather", title: "顺应天象", desc: "收获3株天气突变作物", current: stats.mutatedHarvests, target: 3, reward: "经验 +120", apply: () => { addFarmXp(120); } },
    { id: "weather-3", kind: "weather", title: "天象专家", desc: "收获8株天气突变作物", current: stats.mutatedHarvests, target: 8, reward: "福叶 +3", apply: () => { state.grain += 3; } }
  ];
  return targets.map((task) => {
    const rewardKey = `${seed}:${task.id}`;
    return { ...task, rewardKey, claimed: !!state.bookRewards[rewardKey], ready: task.current >= task.target };
  });
}

function bookTaskIcon(task) {
  if (task.kind === "harvest") return "收";
  if (task.kind === "price") return "价";
  if (task.kind === "weather") return "天";
  return "奖";
}

function seededNumber(seed) {
  let hash = 2166136261;
  for (let i = 0; i < seed.length; i += 1) {
    hash ^= seed.charCodeAt(i);
    hash = Math.imul(hash, 16777619);
  }
  return Math.abs(hash >>> 0);
}

function leaderboardRows(seed, period) {
  const crop = CROPS[seed];
  const stats = state.cropStats[seed] || { bestPrice: 0 };
  const names = ["青禾", "小满", "云舒", "阿霖", "南枝", "麦芽", "春山", "田田", "安妮", "星河"];
  const base = Math.max(crop.price * 180, seedPrice(crop) * 8);
  const rows = names.map((name, index) => {
    const noise = seededNumber(`${period}:${seed}:${name}`) % Math.max(1, Math.round(base * 0.36));
    const periodFactor = period === "week" ? 0.62 : 1;
    return {
      name,
      price: Math.round((base - index * base * 0.055 + noise) * periodFactor)
    };
  });
  if ((stats.bestPrice || 0) > 0) {
    rows.push({ name: "我的农场", price: stats.bestPrice, mine: true });
  }
  return rows
    .sort((a, b) => b.price - a.price)
    .slice(0, 10)
    .map((row, index) => ({ ...row, rank: index + 1 }));
}

function leaderboardMarkup(seed, period, title) {
  const rows = leaderboardRows(seed, period).slice(0, 5).map((row) => `
    <div class="book-rank-row${row.mine ? " mine" : ""}">
      <b>${row.rank}</b>
      <span>${row.name}</span>
      <strong><span class="coin"></span>${row.price.toLocaleString()}</strong>
    </div>
  `).join("");
  return `
    <section class="book-leaderboard-card">
      <h4>${title}</h4>
      ${rows}
    </section>
  `;
}

function bookDetailMarkup(seed) {
  const crop = CROPS[seed];
  const stats = state.cropStats[seed] || { harvests: 0, bestPrice: 0, mutatedHarvests: 0 };
  const growSeconds = Math.ceil(crop.growMs / 1000);
  const tasks = bookTaskState(seed).map((task) => `
    <div class="book-task${task.ready ? " ready" : ""}${task.claimed ? " claimed" : ""}">
      <span class="book-task-icon">${bookTaskIcon(task)}</span>
      <div>
        <strong>${task.title}</strong>
        <small>${task.desc} (${Math.min(task.current, task.target).toLocaleString()}/${task.target.toLocaleString()})</small>
        <em>${task.reward}</em>
      </div>
      <button data-book-claim="${task.rewardKey}" ${task.ready && !task.claimed ? "" : "disabled"}>${task.claimed ? "已激活" : "激活"}</button>
    </div>
  `).join("");
  return `
    <button class="book-detail-close" data-book-detail-close type="button">×</button>
    <div class="book-hero">
      <span class="book-rarity ${rarityClass(crop)}">${crop.rarity}</span>
      <span class="book-art crop-icon crop-icon-${seed}"></span>
      <strong>${crop.name}</strong>
      <p>${crop.name}适合在多变天气下培育，成熟后会按稀有度、产量、品质和天气突变计算价格。</p>
      <div class="book-best">历史最高价格：<span class="coin"></span><b>${(stats.bestPrice || 0).toLocaleString()}</b></div>
    </div>
    <div class="book-facts">
      <span>成熟 ${formatDuration(growSeconds)}</span>
      <span>种子 ${seedPrice(crop).toLocaleString()}</span>
      <span>基础 ${crop.price.toLocaleString()}</span>
      <span>收获 ${stats.harvests || 0}</span>
    </div>
    <div class="book-leaderboard">
      <h3>排行榜</h3>
      <div class="book-leaderboard-grid">
        ${leaderboardMarkup(seed, "all", "全区榜")}
        ${leaderboardMarkup(seed, "week", "本周榜")}
      </div>
    </div>
    <div class="book-task-list">${tasks}</div>
  `;
}

function claimBookReward(rewardKey) {
  const [seed] = rewardKey.split(":");
  const task = bookTaskState(seed).find((item) => item.rewardKey === rewardKey);
  if (!task || task.claimed) return;
  if (!task.ready) {
    showToast("图鉴任务还没有完成。");
    return;
  }
  state.bookRewards[rewardKey] = true;
  task.apply();
  showToast(`已激活：${task.title}，获得${task.reward}。`);
  commit();
}

function openPanel(panel) {
  hideCropCard();
  [els.shop, els.farmPanel, els.storagePanel, els.bookPanel, els.rulesPanel].forEach((item) => {
    item.hidden = item !== panel;
  });
}

function closePanels() {
  [els.shop, els.farmPanel, els.storagePanel, els.bookPanel, els.rulesPanel].forEach((item) => {
    item.hidden = true;
  });
}

function showStorageSeed(seed) {
  selectedStorageSeed = seed;
  renderStorage();
}

function showToast(message) {
  window.clearTimeout(toastTimer);
  els.toast.textContent = message;
  els.toast.classList.add("show");
  toastTimer = window.setTimeout(() => els.toast.classList.remove("show"), 1900);
}

function commit() {
  save();
  render();
}

els.plantAll.addEventListener("click", plantAll);
els.harvestAll.addEventListener("click", harvestAll);
els.quickHarvest.addEventListener("click", harvestAll);
els.taskText.addEventListener("pointerdown", (event) => {
  event.stopPropagation();
  event.stopImmediatePropagation?.();
});
els.taskText.addEventListener("pointerup", (event) => {
  const now = Date.now();
  if (now - lastTaskInteractionAt < 160) {
    event.preventDefault();
    event.stopPropagation();
    event.stopImmediatePropagation?.();
    return;
  }
  lastTaskInteractionAt = now;
  claimTaskReward(event);
});
els.taskText.addEventListener("click", (event) => {
  if (Date.now() - lastTaskInteractionAt < 160) {
    event.preventDefault();
    event.stopPropagation();
    event.stopImmediatePropagation?.();
    return;
  }
  lastTaskInteractionAt = Date.now();
  claimTaskReward(event);
});
els.expand.addEventListener("click", expandField);
els.boost.addEventListener("click", boostAll);
els.zoomIn?.addEventListener("click", () => setZoom(state.zoom + 0.1));
els.zoomOut?.addEventListener("click", () => setZoom(state.zoom - 0.1));
els.log.addEventListener("click", showLog);
els.settings.addEventListener("click", resetGame);
els.rules.addEventListener("click", () => openPanel(els.rulesPanel));
els.book.addEventListener("click", () => {
  selectedBookSeed = null;
  openPanel(els.bookPanel);
  renderBook();
});
els.visit.addEventListener("click", () => showToast("拜访功能入口已放好，后面可以接好友农场。"));
function bindBuilding(building, panel) {
  building.addEventListener("pointerdown", (event) => event.stopPropagation());
  building.addEventListener("pointerup", (event) => {
    event.preventDefault();
    event.stopPropagation();
    openPanel(panel);
  });
  building.addEventListener("click", (event) => {
    event.preventDefault();
    event.stopPropagation();
  });
}

bindBuilding(els.farmBuilding, els.farmPanel);
bindBuilding(els.storageBuilding, els.storagePanel);
bindBuilding(els.shopBuilding, els.shop);
els.upgradeFarm.addEventListener("click", () => {
  resetDailyXpIfNeeded();
  state.dailyXpCapBonus = (state.dailyXpCapBonus || 0) + 100;
  showToast(`已观看广告，今日经验上限提高到${dailyXpCap()}。`);
  commit();
});
els.closeCrop.addEventListener("click", hideCropCard);
els.priceInfoBtn?.addEventListener("click", (event) => {
  event.preventDefault();
  event.stopPropagation();
  if (selectedPlot === null) return;
  els.priceInfo.hidden = !els.priceInfo.hidden;
});
els.priceInfo?.addEventListener("click", (event) => event.stopPropagation());
els.priceInfo?.addEventListener("click", (event) => {
  if (event.target.closest(".price-info-close")) {
    event.preventDefault();
    event.stopPropagation();
    els.priceInfo.hidden = true;
  }
});
els.yieldInfoBtn?.addEventListener("click", (event) => {
  event.preventDefault();
  event.stopPropagation();
  if (selectedPlot === null || !state.plots[selectedPlot]?.crop) return;
  showToast(yieldRangeText(state.plots[selectedPlot]));
});
els.cardHarvest.addEventListener("click", () => selectedPlot !== null && harvest(selectedPlot));
els.removeCrop.addEventListener("click", () => {
  if (selectedPlot === null) return;
  state.plots[selectedPlot] = { crop: null, plantedAt: 0, weather: null, size: 0, quality: null };
  showToast("已铲除作物。");
  hideCropCard();
  commit();
});
els.moveCrop.addEventListener("click", () => showToast("移植工具已加入界面。"));
els.itemCrop.addEventListener("click", boostAll);
els.refreshShop.addEventListener("click", () => {
  if (typeof generateShopItems === "function") {
    state.shopItems = generateShopItems();
    showToast("种子商店已刷新。");
  } else {
    showToast("种子商店正在准备。");
  }
  commit();
});
els.game.addEventListener("pointerdown", startMapDrag);
els.game.addEventListener("pointermove", moveMapDrag);
els.game.addEventListener("pointerup", handleBuildingPointer, true);
els.game.addEventListener("pointerup", endMapDrag);
els.game.addEventListener("pointercancel", endMapDrag);
els.game.addEventListener("wheel", handleWheelZoom, { passive: false });
els.game.addEventListener("touchstart", handleTouchStart, { passive: false });
els.game.addEventListener("touchmove", handleTouchMove, { passive: false });
els.game.addEventListener("touchend", handleTouchEnd);
els.game.addEventListener("touchcancel", handleTouchEnd);
document.addEventListener("click", handleFieldFallbackClick, true);

document.addEventListener("click", (event) => {
  const storageSeedButton = event.target.closest("[data-storage-seed]");
  if (storageSeedButton) {
    showStorageSeed(storageSeedButton.dataset.storageSeed);
    return;
  }

  const bookButton = event.target.closest("[data-book]");
  if (bookButton) {
    selectedBookSeed = bookButton.dataset.book;
    renderBook();
    return;
  }

  const bookDetailClose = event.target.closest("[data-book-detail-close]");
  if (bookDetailClose) {
    selectedBookSeed = null;
    renderBook();
    return;
  }

  const bookClaim = event.target.closest("[data-book-claim]");
  if (bookClaim) {
    claimBookReward(bookClaim.dataset.bookClaim);
    return;
  }

  const closeButton = event.target.closest("[data-close]");
  if (closeButton) {
    closePanels();
  }
});

render();
setInterval(render, 1000);
