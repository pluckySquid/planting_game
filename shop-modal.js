// Initialize shop items if not present
if (!state.shopItems || state.shopItems.length === 0) {
    state.shopItems = generateShopItems();
}
const todayKey = new Date().toISOString().slice(0, 10);
if (state.shopRefreshDate !== todayKey) {
    state.shopRefreshDate = todayKey;
    state.shopFreeRefreshUsed = 0;
    state.shopPaidRefreshCount = 0;
}
state.shopFreeRefreshUsed = Number.isFinite(state.shopFreeRefreshUsed) ? state.shopFreeRefreshUsed : 0;
state.shopPaidRefreshCount = Number.isFinite(state.shopPaidRefreshCount) ? state.shopPaidRefreshCount : 0;

function generateShopItems() {
    const shuffled = [...CROP_ORDER].sort(() => Math.random() - 0.5);
    return shuffled.slice(0, 4).map((key, index) => ({
        key,
        free: index === 0,
        limit: 1,
        bought: false
    }));
}

function shopRefreshCost() {
    const freeLeft = Math.max(0, 3 - (state.shopFreeRefreshUsed || 0));
    if (freeLeft > 0) return 0;
    return Math.round(100 * Math.pow(2, state.shopPaidRefreshCount || 0));
}

function shopRefreshLabel() {
    const freeLeft = Math.max(0, 3 - (state.shopFreeRefreshUsed || 0));
    return freeLeft > 0 ? `刷新 (免费${freeLeft})` : `刷新 (${shopRefreshCost().toLocaleString()}铜钱)`;
}

// Override the original renderShop
window.renderShop = function() {
    let coinsDisplay = state.coins;
    if (state.coins >= 10000) {
        coinsDisplay = (state.coins / 10000).toFixed(1) + "万";
    }
    els.shopCoins.textContent = coinsDisplay;
    if (els.refreshShop) {
        els.refreshShop.textContent = shopRefreshLabel();
    }
    
    const seen = new Set();
    state.shopItems = (state.shopItems || []).filter((item) => {
        if (!CROPS[item.key] || seen.has(item.key)) return false;
        seen.add(item.key);
        return true;
    });
    if (state.shopItems.length !== 4 || !state.shopItems.some((item) => item.free)) {
        state.shopItems = generateShopItems();
    }

    els.seedGrid.innerHTML = state.shopItems.map((item, i) => {
        const crop = CROPS[item.key];
        const isBought = item.bought;
        const cost = typeof seedPrice === "function" ? seedPrice(crop) : (crop.seedPrice || crop.price);
        const priceText = item.free ? "免费" : `${cost.toLocaleString()}铜钱`;
        const actionText = isBought ? (item.free ? "已领" : "已购") : (item.free ? "领取" : "购买");
        return `
        <div class="seed-card ${typeof rarityClass === 'function' ? rarityClass(crop) : ''} ${isBought ? 'selected' : ''} ${item.free ? 'free-seed' : ''}">
            <div class="price-badge">${priceText}</div>
            <div class="shop-seed-tile" style="grid-column: 1; grid-row: 1;">
                <span class="crop-icon crop-icon-${item.key}"></span>
            </div>
            <strong style="grid-column: 2; grid-row: 1; color: #4a2411; font-size: 14px; text-align: right; align-self: start; margin-top: 5px;">${crop.seed}</strong>
            <div class="limit" style="grid-column: 1; grid-row: 2; color: #4a2411; font-size: 11px; margin-top: 10px;">剩余：${isBought ? 0 : 1}</div>
            <button onclick="buyShopItem(${i})" class="${isBought ? 'bought' : ''}" style="grid-column: 2; grid-row: 2; background: transparent; border: 1px dashed ${isBought ? '#5a2817' : '#c3402d'}; color: ${isBought ? '#5a2817' : '#c3402d'}; font-size: 12px; font-weight: bold; padding: 4px 0; border-radius: 2px; width: 100%; margin-top: 10px; cursor: pointer;">
                ${actionText}
            </button>
        </div>
        `;
    }).join("");
};

window.buyShopItem = function(index) {
    const item = state.shopItems[index];
    if (item.bought) {
        showToast("已售完！");
        return;
    }
    const crop = CROPS[item.key];
    const cost = typeof seedPrice === "function" ? seedPrice(crop) : (crop.seedPrice || crop.price);
    if (item.free) {
        state.inventory[item.key] = (state.inventory[item.key] || 0) + 1;
        item.limit = 0;
        item.bought = true;
        window.recordTaskEvent?.("freeSeed", 1);
        showToast(`领取了免费的 ${crop.seed}`);
        commit();
        return;
    }
    if (state.coins >= cost) {
        if (!window.confirm(`确定花费 ${cost.toLocaleString()} 铜钱购买 ${crop.seed} 吗？`)) {
            return;
        }
        state.coins -= cost;
        state.inventory[item.key] = (state.inventory[item.key] || 0) + 1;
        item.limit = 0;
        item.bought = true;
        showToast(`花费 ${cost.toLocaleString()} 铜钱购买了 ${crop.seed}`);
        commit();
    } else {
        showToast("铜钱不足，无法购买！");
    }
};

// Override refresh logic
setTimeout(() => {
    if(els.refreshShop) {
        els.refreshShop.replaceWith(els.refreshShop.cloneNode(true));
        els.refreshShop = document.querySelector("#refreshShopBtn");
        els.refreshShop.innerHTML = shopRefreshLabel();
        
        // Remove old inline styles, let CSS handle it
        els.refreshShop.removeAttribute("style");

        els.refreshShop.addEventListener("click", () => {
            const refreshCost = shopRefreshCost();
            if (refreshCost === 0) {
                state.shopFreeRefreshUsed = (state.shopFreeRefreshUsed || 0) + 1;
                state.shopItems = generateShopItems();
                window.recordTaskEvent?.("refreshShop", 1);
                showToast(`免费刷新商店，今日还剩${Math.max(0, 3 - state.shopFreeRefreshUsed)}次。`);
                commit();
            } else if (state.coins >= refreshCost) {
                state.coins -= refreshCost;
                state.shopPaidRefreshCount = (state.shopPaidRefreshCount || 0) + 1;
                state.shopItems = generateShopItems();
                window.recordTaskEvent?.("refreshShop", 1);
                showToast(`花费 ${refreshCost.toLocaleString()} 铜钱刷新了商店！`);
                commit();
            } else {
                showToast(`铜钱不足，需要 ${refreshCost.toLocaleString()} 铜钱刷新。`);
            }
        });
        renderShop();
    }
}, 500);
