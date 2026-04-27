// Initialize shop items if not present
if (!state.shopItems || state.shopItems.length === 0) {
    state.shopItems = generateShopItems();
}

function generateShopItems() {
    const items = [];
    // Generate 6 items to match screenshot exactly
    for(let i=0; i<4; i++) {
        const key = CROP_ORDER[Math.floor(Math.random() * CROP_ORDER.length)];
        items.push({
            key: key,
            limit: Math.floor(Math.random() * 5) + 2, // limit between 2 and 6
            bought: false
        });
    }
    return items;
}

// Override the original renderShop
window.renderShop = function() {
    let coinsDisplay = state.coins;
    if (state.coins >= 10000) {
        coinsDisplay = (state.coins / 10000).toFixed(1) + "万";
    }
    els.shopCoins.textContent = coinsDisplay;
    
    state.shopItems = state.shopItems.slice(0, 4);
    els.seedGrid.innerHTML = state.shopItems.map((item, i) => {
        const crop = CROPS[item.key];
        const isBought = item.bought;
        return `
        <div class="seed-card ${isBought ? 'selected' : ''}">
            <div class="price-badge">${crop.price}玉</div>
            <div class="crop-sprite crop-sprite-${item.key} stage-3" style="position: relative; transform: none; left: auto; top: auto; animation: none; width: 45px; height: 55px; margin: auto; grid-column: 1; grid-row: 1;"></div>
            <strong style="grid-column: 2; grid-row: 1; color: #4a2411; font-size: 14px; text-align: right; align-self: start; margin-top: 5px;">${crop.seed}</strong>
            <div class="limit" style="grid-column: 1; grid-row: 2; color: #4a2411; font-size: 11px; margin-top: 10px;">限购：${item.limit}</div>
            <button onclick="buyShopItem(${i})" class="${isBought ? 'bought' : ''}" style="grid-column: 2; grid-row: 2; background: transparent; border: 1px dashed ${isBought ? '#5a2817' : '#c3402d'}; color: ${isBought ? '#5a2817' : '#c3402d'}; font-size: 12px; font-weight: bold; padding: 4px 0; border-radius: 2px; width: 100%; margin-top: 10px; cursor: pointer;">
                ${isBought ? '已选' : '选择'}
            </button>
        </div>
        `;
    }).join("");
};

window.buyShopItem = function(index) {
    const item = state.shopItems[index];
    if (item.bought) {
        showToast("已达到限购数量！");
        return;
    }
    const crop = CROPS[item.key];
    if (state.coins >= crop.price) {
        state.coins -= crop.price;
        state.inventory[item.key] = (state.inventory[item.key] || 0) + 1;
        item.limit -= 1;
        if (item.limit <= 0) {
            item.bought = true;
        }
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
        els.refreshShop.innerHTML = "刷新 (500玉)";
        
        // Remove old inline styles, let CSS handle it
        els.refreshShop.removeAttribute("style");

        els.refreshShop.addEventListener("click", () => {
            const REFRESH_COST = 500;
            if (state.coins >= REFRESH_COST) {
                state.coins -= REFRESH_COST;
                state.shopItems = generateShopItems();
                showToast(`花费 500 灵玉刷新了商店！`);
                commit();
            } else {
                showToast("灵玉不足，无法刷新商店！");
            }
        });
        renderShop();
    }
}, 500);
