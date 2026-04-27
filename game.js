const SAVE_KEY = "pastoral-fields-save-v4";
const PLOT_COUNT = 25;

const CROPS = {
  corn: { name: "小型玉米", seed: "玉米种子", price: 8671, yield: "2.3斤", growMs: 52000, life: 100, tags: ["折枝"], weather: "折枝 0.3倍", rarity: "普通", reward: 62 },
  chili: { name: "超巨型辣椒", seed: "辣椒种子", price: 15232, yield: "3.4斤", growMs: 64000, life: 60, tags: ["折枝", "雪暴", "震霆"], weather: "雪暴 2.5倍", rarity: "普通", reward: 88 },
  cabbage: { name: "超巨型白菜", seed: "白菜种子", price: 2356, yield: "1.7斤", growMs: 43000, life: 40, tags: ["震霆", "折枝"], weather: "震霆 2.3倍", rarity: "普通", reward: 44 },
  tomato: { name: "番茄", seed: "番茄种子", price: 6120, yield: "2.0斤", growMs: 47000, life: 75, tags: ["潮湿"], weather: "小雨 0.1倍", rarity: "常见", reward: 54 },
  eggplant: { name: "茄子", seed: "茄子种子", price: 7340, yield: "2.6斤", growMs: 56000, life: 80, tags: ["薄雾"], weather: "薄雾 0.7倍", rarity: "常见", reward: 68 },
  carrot: { name: "胡萝卜", seed: "胡萝卜种子", price: 4210, yield: "1.9斤", growMs: 39000, life: 55, tags: ["大风"], weather: "大风 0.3倍", rarity: "常见", reward: 48 },
  onion: { name: "洋葱", seed: "洋葱种子", price: 5120, yield: "2.1斤", growMs: 50000, life: 65, tags: ["雾霾"], weather: "雾霾 0.5倍", rarity: "常见", reward: 58 },
  cauliflower: { name: "花椰菜", seed: "花椰菜种子", price: 9300, yield: "2.8斤", growMs: 68000, life: 90, tags: ["彩虹"], weather: "彩虹 10倍", rarity: "优质", reward: 96 }
};

const CROP_ORDER = ["corn", "chili", "cabbage", "tomato", "eggplant", "carrot", "onion", "cauliflower"];
const STARTER_PATTERN = ["corn", "chili", "chili", "tomato", "cabbage", "carrot", "corn", "chili", "eggplant", "onion", "cabbage", "tomato", "corn", "chili", "cauliflower", "carrot", "eggplant", "cabbage"];

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
  inventory: Object.fromEntries(CROP_ORDER.map((key) => [key, 6])),
  plots: Array.from({ length: PLOT_COUNT }, (_, index) => {
    const crop = STARTER_PATTERN[index] || null;
    const growMs = crop ? CROPS[crop].growMs : 0;
    return {
      crop,
      plantedAt: crop ? Date.now() - Math.round(growMs * (index % 4 === 0 ? .35 : index % 3 === 0 ? .68 : 1.08)) : 0
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
  closeCrop: document.querySelector("#closeCropBtn"),
  cardHarvest: document.querySelector("#cardHarvestBtn"),
  removeCrop: document.querySelector("#removeCropBtn"),
  moveCrop: document.querySelector("#moveCropBtn"),
  itemCrop: document.querySelector("#itemCropBtn"),
  cardName: document.querySelector("#cardName"),
  cardRarity: document.querySelector("#cardRarity"),
  cardArt: document.querySelector("#cardArt"),
  cardPrice: document.querySelector("#cardPrice"),
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
  next.inventory = next.inventory || {};
  CROP_ORDER.forEach((key) => {
    next.inventory[key] = Number.isFinite(next.inventory[key]) ? next.inventory[key] : 3;
  });
  next.plots = Array.from({ length: PLOT_COUNT }, (_, index) => {
    const old = next.plots[index] || {};
    return {
      crop: CROPS[old.crop] ? old.crop : null,
      plantedAt: old.plantedAt || 0
    };
  });
  return next;
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

function cropMarkup(key) {
  return `<i></i><i></i><i></i><i></i><em></em>`;
}

function render() {
  els.field.innerHTML = "";
  els.cropLayer.innerHTML = "";

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

    if (plot.crop) {
      if (stage < 3) {
        const tag = document.createElement("b");
        tag.className = "plot-timer";
        tag.textContent = `00:${String(timeLeft(plot)).padStart(2, "0")}`;
        button.appendChild(tag);
      }
      renderCropSprite(index, plot.crop, stage);
    }

    els.field.appendChild(button);
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
  applyMapOffset();
}

function renderCropSprite(index, cropKey, stage) {
  const row = Math.floor(index / 5);
  const col = index % 5;
  const cropEl = document.createElement("button");
  cropEl.type = "button";
  cropEl.className = `crop-sprite crop-sprite-${cropKey} stage-${stage}`;
  cropEl.style.left = `${178 + (col - row) * 32}px`;
  cropEl.style.top = `${117 + (col + row) * 18}px`;
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
    showToast("开垦后才能使用这块地。");
    return;
  }

  const plot = state.plots[index];
  if (!plot.crop) {
    plant(index, state.selectedSeed);
    return;
  }

  selectedPlot = index;
  showCropCard(index);
}

function applyMapOffset() {
  els.game.style.setProperty("--map-x", `${state.mapX}px`);
  els.game.style.setProperty("--map-y", `${state.mapY}px`);
}

function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}

function canStartMapDrag(target) {
  return !target.closest(".crop-sprite, .map-building, .topbar, .profile-card, .right-menu, .left-menu, .tool-rail, .bottom-actions, .panel, .crop-card, .toast");
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
  state.mapX = clamp(dragState.baseX + dx, -90, 90);
  state.mapY = clamp(dragState.baseY + dy, -105, 80);
  applyMapOffset();
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
  state.plots[index] = { crop: cropKey, plantedAt: Date.now() };
  showToast(`种下${crop.seed}。`);
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

  state.plots[index] = { crop: null, plantedAt: 0 };
  state.coins += crop.price;
  state.grain += 2;
  state.xp += crop.reward;
  levelUpIfNeeded();
  showToast(`收获${crop.name}，+${formatCoins(crop.price)}铜钱。`);
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
      coins += CROPS[plot.crop].price;
      state.xp += CROPS[plot.crop].reward;
      state.plots[i] = { crop: null, plantedAt: 0 };
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

  const cost = 600 + (state.unlocked - 18) * 250;
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
  const life = Math.max(0, Math.min(crop.life, Math.round(crop.life - (cropStage(plot) < 3 ? timeLeft(plot) / 2 : 0))));
  els.cardName.textContent = crop.name;
  els.cardRarity.textContent = crop.rarity;
  els.cardArt.className = `card-art crop-icon crop-icon-${plot.crop}`;
  els.cardPrice.textContent = crop.price.toLocaleString();
  els.cardLife.style.width = `${(life / crop.life) * 100}%`;
  els.cardLifeText.textContent = `${life}/${crop.life}`;
  els.cardYield.textContent = crop.yield;
  els.cardWeather.textContent = crop.weather;
  els.cardTags.innerHTML = crop.tags.map((tag) => `<span>${tag}</span>`).join("");
  els.cropCard.hidden = false;
}

function hideCropCard() {
  selectedPlot = null;
  els.cropCard.hidden = true;
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
        <small>限购：${state.inventory[key]}</small>
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
    return `
      <button class="storage-item${selected}" data-seed="${key}">
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
els.cardHarvest.addEventListener("click", () => selectedPlot !== null && harvest(selectedPlot));
els.removeCrop.addEventListener("click", () => {
  if (selectedPlot === null) return;
  state.plots[selectedPlot] = { crop: null, plantedAt: 0 };
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
