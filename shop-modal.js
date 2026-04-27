// Initialize shop items if not present
if (!state.shopItems || state.shopItems.length === 0) {
    state.shopItems = generateShopItems();
}
state.shopRefreshCount = Number.isFinite(state.shopRefreshCount) ? state.shopRefreshCount : 0;

function generateShopItems() {
    const shuffled = [...CROP_ORDER].sort(() => Math.random() - 0.5);
    const itemCount = 3 + Math.floor(Math.random() * 2);
    return shuffled.slice(0, itemCount).map((key) => ({
        key,
        limit: 1,
        bought: false
    }));
}

function shopRefreshCost() {
    return Math.round(500 * Math.pow(2, state.shopRefreshCount || 0));
}

// Override the original renderShop
window.renderShop = function() {
    let coinsDisplay = state.coins;
    if (state.coins >= 10000) {
        coinsDisplay = (state.coins / 10000).toFixed(1) + "万";
    }
    els.shopCoins.textContent = coinsDisplay;
    if (els.refreshShop) {
        els.refreshShop.textContent = `刷新 (${shopRefreshCost()}玉)`;
    }
    
    const seen = new Set();
    state.shopItems = (state.shopItems || []).filter((item) => {
        if (!CROPS[item.key] || seen.has(item.key)) return false;
        seen.add(item.key);
        return true;
    });
    if (state.shopItems.length < 3 || state.shopItems.length > 4) {
        state.shopItems = generateShopItems();
    }

    els.seedGrid.innerHTML = state.shopItems.map((item, i) => {
        const crop = CROPS[item.key];
        const isBought = item.bought;
        return `
        <div class="seed-card ${isBought ? 'selected' : ''}">
            <div class="price-badge">${crop.price}玉</div>
            <div class="crop-sprite crop-sprite-${item.key} stage-3" style="position: relative; transform: none; left: auto; top: auto; animation: none; width: 45px; height: 55px; margin: auto; grid-column: 1; grid-row: 1;"></div>
            <strong style="grid-column: 2; grid-row: 1; color: #4a2411; font-size: 14px; text-align: right; align-self: start; margin-top: 5px;">${crop.seed}</strong>
            <div class="limit" style="grid-column: 1; grid-row: 2; color: #4a2411; font-size: 11px; margin-top: 10px;">剩余：${isBought ? 0 : 1}</div>
            <button onclick="buyShopItem(${i})" class="${isBought ? 'bought' : ''}" style="grid-column: 2; grid-row: 2; background: transparent; border: 1px dashed ${isBought ? '#5a2817' : '#c3402d'}; color: ${isBought ? '#5a2817' : '#c3402d'}; font-size: 12px; font-weight: bold; padding: 4px 0; border-radius: 2px; width: 100%; margin-top: 10px; cursor: pointer;">
                ${isBought ? '已购' : '购买'}
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
    if (!window.confirm(`确定花费 ${crop.price} 灵玉购买 ${crop.seed} 吗？`)) {
        return;
    }
    if (state.coins >= crop.price) {
        state.coins -= crop.price;
        state.inventory[item.key] = (state.inventory[item.key] || 0) + 1;
        item.limit = 0;
        item.bought = true;
        showToast(`花费 ${crop.price} 灵玉购买了 ${crop.seed}`);
        commit();
    } else {
        showToast("灵玉不足，无法购买！");
    }
};

// Override refresh logic
setTimeout(() => {
    if(els.refreshShop) {
        els.refreshShop.replaceWith(els.refreshShop.cloneNode(true));
        els.refreshShop = document.querySelector("#refreshShopBtn");
        els.refreshShop.innerHTML = `刷新 (${shopRefreshCost()}玉)`;
        
        // Remove old inline styles, let CSS handle it
        els.refreshShop.removeAttribute("style");

        els.refreshShop.addEventListener("click", () => {
            const refreshCost = shopRefreshCost();
            if (state.coins >= refreshCost) {
                state.coins -= refreshCost;
                state.shopRefreshCount = (state.shopRefreshCount || 0) + 1;
                state.shopItems = generateShopItems();
                showToast(`花费 ${refreshCost} 灵玉刷新了商店！`);
                commit();
            } else {
                showToast(`灵玉不足，需要 ${refreshCost} 灵玉刷新。`);
            }
        });
        renderShop();
    }
}, 500);
