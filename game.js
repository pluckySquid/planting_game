const SAVE_KEY = "pastoral-fields-save-v4";
const PLOT_COLS = 5;
const PLOT_COUNT = 25;
const LIFE_TICK_MS = 60000;
const MIN_CROP_SIZE = 0.5;
const MAX_CROP_SIZE = 100;
const MAX_FINAL_YIELD = 100;

const CROPS = {
  corn: { name: "小型玉米", seed: "玉米种子", price: 3000, yield: "2.3斤", growMs: 52000, life: 100, tags: ["折枝"], weather: "折枝 0.3倍", rarity: "普通", reward: 62 },
  chili: { name: "超巨型辣椒", seed: "辣椒种子", price: 10000, yield: "3.4斤", growMs: 64000, life: 60, tags: ["折枝", "雪暴", "震霆"], weather: "雪暴 2.5倍", rarity: "普通", reward: 88 },
  cabbage: { name: "超巨型白菜", seed: "白菜种子", price: 1000, yield: "1.7斤", growMs: 43000, life: 40, tags: ["震霆", "折枝"], weather: "震霆 2.3倍", rarity: "普通", reward: 44 },
  tomato: { name: "番茄", seed: "番茄种子", price: 200, yield: "2.0斤", growMs: 47000, life: 75, tags: ["潮湿"], weather: "小雨 0.1倍", rarity: "常见", reward: 54 },
  eggplant: { name: "茄子", seed: "茄子种子", price: 7000, yield: "2.6斤", growMs: 56000, life: 80, tags: ["薄雾"], weather: "薄雾 0.7倍", rarity: "常见", reward: 68 },
  carrot: { name: "胡萝卜", seed: "胡萝卜种子", price: 4500, yield: "1.9斤", growMs: 39000, life: 55, tags: ["大风"], weather: "大风 0.3倍", rarity: "常见", reward: 48 },
  onion: { name: "洋葱", seed: "洋葱种子", price: 200, yield: "2.1斤", growMs: 50000, life: 65, tags: ["雾霾"], weather: "雾霾 0.5倍", rarity: "常见", reward: 58 },
  cauliflower: { name: "花椰菜", seed: "花椰菜种子", price: 1000, yield: "2.8斤", growMs: 68000, life: 90, tags: ["彩虹"], weather: "彩虹 10倍", rarity: "优质", reward: 96 },
  coconut: { name: "椰子", seed: "椰子种子", price: 15000, yield: "3.2斤", growMs: 72000, life: 110, tags: ["热带", "暴雨"], weather: "暴雨 1.8倍", rarity: "优质", reward: 120 }
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
const RARITY_MULTIPLIERS = { 普通: 1, 常见: 2, 优质: 4, 卓越: 6, 珍稀: 8, 参天: 10 };

const starter = {
  coins: 102000,
  grain: 59,
  xp: 1250,
  xpMax: 2620,
  level: 5,
  chimesUsed: 0,
  unlocked: 18,
  selectedSeed: "chili",
  mapX: 0,
  mapY: 0,
  zoom: 1,
  lastLifeTick: Date.now(),
  inventory: Object.fromEntries(CROP_ORDER.map((key) => [key, 6])),
  plots: Array.from({ length: PLOT_COUNT }, (_, index) => {
    const crop = STARTER_PATTERN[index] || null;
    const growMs = crop ? CROPS[crop].growMs : 0;
    return {
      crop,
      plantedAt: crop ? Date.now() - Math.round(growMs * (index % 4 === 0 ? .35 : index % 3 === 0 ? .68 : 1.08)) : 0,
      weather: crop && index % 3 === 0 ? PLANT_WEATHER_MUTATIONS[Math.floor(index / 3) % PLANT_WEATHER_MUTATIONS.length] : null,
      size: crop ? rollCropSize(index) : 0
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
  farmPanelXp: document.querySelector("#farmPanelXp"),
  farmPanelXpText: document.querySelector("#farmPanelXpText"),
  upgradeList: document.querySelector("#upgradeList"),
  upgradeFarm: document.querySelector("#upgradeFarmBtn"),
  bookPanel: document.querySelector("#bookPanel"),
  bookGrid: document.querySelector("#bookGrid"),
  rulesPanel: document.querySelector("#rulesPanel")
};

let state = load();
let toastTimer = 0;
let selectedPlot = null;
let dragState = null;
let pinchState = null;
let suppressClick = false;

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
  next.mapX = Number.isFinite(next.mapX) ? next.mapX : 0;
  next.mapY = Number.isFinite(next.mapY) ? next.mapY : 0;
  next.zoom = Number.isFinite(next.zoom) ? clamp(next.zoom, 0.8, 2.5) : 1;
  next.lastLifeTick = Number.isFinite(next.lastLifeTick) ? next.lastLifeTick : Date.now();
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
      size: CROPS[old.crop] ? normalizeCropSize(needsVisibleSizes ? null : old.size, index) : 0
    };
  });
  return next;
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

function rollPlantWeather() {
  if (Math.random() >= 0.3) return null;
  const weather = PLANT_WEATHER_MUTATIONS[Math.floor(Math.random() * PLANT_WEATHER_MUTATIONS.length)];
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

function normalizeCropSize(size, fallbackSeed) {
  const value = Number(size);
  if (Number.isFinite(value)) return clamp(value, MIN_CROP_SIZE, MAX_CROP_SIZE);
  return rollCropSize(fallbackSeed);
}

function save() {
  localStorage.setItem(SAVE_KEY, JSON.stringify(state));
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

function cropLifeMinutes(crop) {
  const minPrice = 200;
  const maxPrice = 15000;
  const progress = clamp((crop.price - minPrice) / (maxPrice - minPrice), 0, 1);
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

function sizeVisualScale(plot) {
  const progress = (cropSize(plot) - MIN_CROP_SIZE) / (MAX_CROP_SIZE - MIN_CROP_SIZE);
  return Number((0.5 + Math.pow(progress, 0.68) * 0.8).toFixed(2));
}

function sizeVisualLift(plot) {
  return Math.round(Math.max(0, sizeVisualScale(plot) - 1) * 4);
}

function finalYield(plot) {
  if (!plot.crop) return 0;
  return Number(Math.min(MAX_FINAL_YIELD, yieldAmount(CROPS[plot.crop]) * cropSize(plot)).toFixed(1));
}

function rarityMultiplier(crop) {
  return RARITY_MULTIPLIERS[crop.rarity] || 1;
}

function mutationMultiplier(plot) {
  const mutation = normalizePlotWeather(plot.weather);
  return mutation?.multiplier || 1;
}

function cropValue(plot) {
  if (!plot.crop) return 0;
  const crop = CROPS[plot.crop];
  return Math.round(crop.price * rarityMultiplier(crop) * finalYield(plot) * mutationMultiplier(plot));
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
  const baseYield = yieldAmount(crop);
  const size = cropSize(plot);
  const yieldValue = finalYield(plot);
  const mutationValue = mutation?.multiplier || 1;
  const value = cropValue(plot);
  const mutationLabel = mutation ? mutation.name : "无突变";
  const mutationClass = mutationValue < 1 ? " down" : mutationValue > 1 ? " up" : "";

  return `
    <button class="price-info-close" id="priceInfoCloseBtn" aria-label="关闭价格说明">×</button>
    <h3>价格说明</h3>
    <p>果实价格=基础价格×稀有度系数×最终产量×突变词条倍率</p>
    <dl>
      <div><dt>基础价格</dt><dd>${base.toLocaleString()}</dd></div>
      <div><dt>基础产量</dt><dd>${baseYield}斤</dd></div>
      <div><dt>果实体型</dt><dd>${size}倍</dd></div>
      <div><dt>最终产量</dt><dd>${yieldValue}斤</dd></div>
      <div><dt>稀有度</dt><dd>${rarity}倍</dd></div>
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
      return { crop: null, plantedAt: 0, weather: null, size: 0 };
    }

    if (!plot.weather) {
      for (let i = 0; i < ticks; i += 1) {
        const weather = rollPlantWeather();
        if (weather) {
          changed = true;
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
    const locked = index >= state.unlocked;
    const crop = plot.crop ? CROPS[plot.crop] : null;
    button.className = `plot${locked ? " locked" : ""}${stage === 3 ? " ready" : ""}`;
    button.type = "button";

    if (locked) {
      button.title = "未开垦土地";
      button.setAttribute("aria-label", "未开垦土地");
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
      tag.textContent = `00:${String(timeLeft(plot)).padStart(2, "0")}`;
      button.appendChild(tag);
    }

    els.field.appendChild(button);
  });

  state.plots.forEach((plot, index) => {
    if (plot.crop) {
      const stage = cropStage(plot);
      if (stage < 3) {
        const tag = els.field.children[index]?.querySelector(".plot-timer");
        if (tag) tag.textContent = `00:${String(timeLeft(plot)).padStart(2, "0")}`;
      }
      renderCropSprite(index, plot.crop, stage);
    }
  });

  els.coins.textContent = formatCoins(state.coins);
  els.grain.textContent = state.grain.toLocaleString();
  els.level.textContent = state.level;
  els.xpFill.style.width = `${Math.min(100, (state.xp / state.xpMax) * 100)}%`;
  els.taskText.textContent = `使用唤风铃1次 (${Math.min(1, state.chimesUsed)}/1)`;
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
  if (index >= state.unlocked) {
    expandField();
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
    clickedElement?.closest(".crop-sprite, .map-building, .topbar, .profile-card, .zoom-controls, .right-menu, .left-menu, .bottom-actions, .panel, .crop-card, .seed-modal, .toast")
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
  return !target.closest(".crop-sprite, .map-building, .topbar, .profile-card, .zoom-controls, .right-menu, .left-menu, .tool-rail, .bottom-actions, .panel, .crop-card, .seed-modal, .toast");
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
  const zoomExtra = Math.round((state.zoom - 1) * 190);
  state.mapX = clamp(dragState.baseX + dx, -90 - zoomExtra, 90 + zoomExtra);
  state.mapY = clamp(dragState.baseY + dy, -105 - zoomExtra, 80 + zoomExtra);
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

  const zoomExtra = Math.round((state.zoom - 1) * 190);
  state.mapX = clamp(state.mapX, -90 - zoomExtra, 90 + zoomExtra);
  state.mapY = clamp(state.mapY, -105 - zoomExtra, 80 + zoomExtra);
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
  state.grain = Math.max(0, state.grain - 1);
  const weather = rollPlantWeather();
  state.plots[index] = { crop: cropKey, plantedAt: Date.now(), weather, size: rollCropSize() };
  showToast(weather ? `种下${crop.seed}，获得${weather.name}天气。` : `种下${crop.seed}。`);
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
    state.plots[index] = { crop: null, plantedAt: 0, weather: null, size: 0 };
    showToast(`${crop.name}已经枯萎。`);
    hideCropCard();
    commit();
    return;
  }

  const value = cropValue(plot);
  state.plots[index] = { crop: null, plantedAt: 0, weather: null, size: 0 };
  state.coins += value;
  state.grain += 2;
  state.xp += crop.reward;
  levelUpIfNeeded();
  showToast(`收获${crop.name}，+${formatCoins(value)}铜钱。`);
  hideCropCard();
  commit();
}

function levelUpIfNeeded() {
  while (state.xp >= state.xpMax) {
    state.xp -= state.xpMax;
    state.level += 1;
    state.xpMax = Math.round(state.xpMax * 1.28);
    state.coins += 500;
  }
}

function plantAll() {
  openPanel(els.shop);
}

function harvestAll() {
  let count = 0;
  let coins = 0;
  for (let i = 0; i < state.unlocked; i += 1) {
    const plot = state.plots[i];
    if (plot.crop && cropStage(plot) === 3) {
      coins += cropValue(plot);
      state.xp += CROPS[plot.crop].reward;
      state.plots[i] = { crop: null, plantedAt: 0, weather: null, size: 0 };
      count += 1;
    }
  }

  if (count) {
    state.coins += coins;
    state.grain += count * 2;
    levelUpIfNeeded();
  }

  showToast(count ? `收获${count}株作物，+${formatCoins(coins)}铜钱。` : "还没有成熟作物。");
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

function expandField() {
  if (state.unlocked >= PLOT_COUNT) {
    showToast("田地已经全部开垦。");
    return;
  }

  const expansionStep = Math.max(0, state.unlocked - 18);
  const cost = Math.round(600 * Math.pow(1.5, expansionStep));
  if (state.coins < cost) {
    showToast(`需要${cost.toLocaleString()}铜钱开垦。`);
    return;
  }

  state.coins -= cost;
  state.unlocked += 1;
  showToast("新土地开垦完成。");
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
  const value = cropValue(plot);
  els.cardName.textContent = crop.name;
  els.cardRarity.textContent = crop.rarity;
  els.cardArt.className = `card-art crop-icon crop-icon-${plot.crop}`;
  els.cardPrice.textContent = value.toLocaleString();
  els.cardLife.style.width = `${(life / maxLife) * 100}%`;
  els.cardLifeText.textContent = `${life}/${maxLife}`;
  els.cardYield.textContent = `${finalYield(plot)}斤`;
  els.cardWeather.textContent = mutationText(plot);
  els.cardTags.innerHTML = `<span>体型：${cropSize(plot)}倍</span>${mutation ? `<span>突变：${mutation.name} ×${mutation.multiplier}</span>` : ""}`;
  els.priceInfo.innerHTML = priceFormulaRows(plot);
  els.cropCard.hidden = false;
}

function hideCropCard() {
  selectedPlot = null;
  els.cropCard.hidden = true;
  els.priceInfo.hidden = true;
}

function renderShop() {
  els.shopCoins.textContent = formatCoins(state.coins);
  els.seedGrid.innerHTML = CROP_ORDER.slice(0, 6).map((key) => {
    const crop = CROPS[key];
    const selected = state.selectedSeed === key ? " selected" : "";
    return `
      <button class="seed-card${selected}" data-seed="${key}">
        <span class="seed-bag crop-icon crop-icon-${key}"></span>
        <strong>${crop.seed}</strong>
        <small>剩余：${state.inventory[key]}</small>
        <b>${selected ? "已选" : "选择"}</b>
      </button>
    `;
  }).join("");
}

function renderStorage() {
  els.storageGrid.innerHTML = CROP_ORDER.map((key) => {
    const crop = CROPS[key];
    const count = state.inventory[key] || 0;
    const selected = state.selectedSeed === key ? " selected" : "";
    const empty = count === 0 ? " empty" : "";
    return `
      <button class="storage-item${selected}${empty}" data-seed="${key}" data-count="${count}">
        <span class="crop-icon crop-icon-${key}"></span>
        <strong>${crop.seed}</strong>
        <b>${count}</b>
      </button>
    `;
  }).join("");
}

function renderFarmPanel() {
  const pct = Math.min(100, (state.xp / state.xpMax) * 100);
  els.farmPanelXp.style.width = `${pct}%`;
  els.farmPanelXpText.textContent = `${state.xp}/${state.xpMax}`;
  els.upgradeList.innerHTML = `
    <p><span>每日可得丰收水晶</span><b>35</b><em>›</em><strong>40</strong></p>
    <p><span>收获可得经验上限</span><b>250</b><em>›</em><strong>300</strong></p>
    <p><span>丰收水晶收购上限</span><b>35</b><em>›</em><strong>40</strong></p>
  `;
}

function renderBook() {
  els.bookGrid.innerHTML = CROP_ORDER.map((key) => {
    const crop = CROPS[key];
    return `
      <button class="book-card" data-book="${key}">
        <span class="crop-icon crop-icon-${key}"></span>
        <strong>${crop.name.replace("超巨型", "")}</strong>
        <small>${crop.rarity}</small>
      </button>
    `;
  }).join("");
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

function buySeed(seed) {
  state.selectedSeed = seed;
  state.inventory[seed] += 1;
  showToast(`已选择${CROPS[seed].seed}，补充1袋。`);
  commit();
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
els.expand.addEventListener("click", expandField);
els.boost.addEventListener("click", boostAll);
els.zoomIn?.addEventListener("click", () => setZoom(state.zoom + 0.1));
els.zoomOut?.addEventListener("click", () => setZoom(state.zoom - 0.1));
els.log.addEventListener("click", showLog);
els.settings.addEventListener("click", resetGame);
els.rules.addEventListener("click", () => openPanel(els.rulesPanel));
els.book.addEventListener("click", () => openPanel(els.bookPanel));
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
  if (state.coins < 12000) {
    showToast("升级需要1.2万铜钱。");
    return;
  }
  state.coins -= 12000;
  state.xp = Math.min(state.xpMax, state.xp + 350);
  showToast("农舍修缮完成，经验上涨。");
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
els.cardHarvest.addEventListener("click", () => selectedPlot !== null && harvest(selectedPlot));
els.removeCrop.addEventListener("click", () => {
  if (selectedPlot === null) return;
  state.plots[selectedPlot] = { crop: null, plantedAt: 0, weather: null, size: 0 };
  showToast("已铲除作物。");
  hideCropCard();
  commit();
});
els.moveCrop.addEventListener("click", () => showToast("移植工具已加入界面。"));
els.itemCrop.addEventListener("click", boostAll);
els.refreshShop.addEventListener("click", () => {
  CROP_ORDER.forEach((key) => { state.inventory[key] += key === "cauliflower" ? 0 : 1; });
  showToast("种子商店已刷新。");
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
  const seedButton = event.target.closest("[data-seed]");
  if (seedButton) {
    buySeed(seedButton.dataset.seed);
    return;
  }

  const bookButton = event.target.closest("[data-book]");
  if (bookButton) {
    state.selectedSeed = bookButton.dataset.book;
    showToast(`图鉴选中${CROPS[state.selectedSeed].name}。`);
    commit();
    return;
  }

  const closeButton = event.target.closest("[data-close]");
  if (closeButton) {
    closePanels();
  }
});

render();
setInterval(render, 1000);
