// Initialize shop items if not present
if (!state.shopItems || state.shopItems.length === 0) {
    state.shopItems = generateShopItems();
}

function generateShopItems() {
    const items = [];
    for(let i=0; i<4; i++) {
        items.push(CROP_ORDER[Math.floor(Math.random() * CROP_ORDER.length)]);
    }
    return items;
}

// Override the original renderShop
window.renderShop = function() {
    els.shopCoins.textContent = formatCoins(state.coins);
    els.seedGrid.innerHTML = state.shopItems.map((key, i) => {
        const crop = CROPS[key];
        return `
        <div class="seed-card" style="display: flex; flex-direction: column; align-items: center; border: 2px solid #a44b22; background: #fff1b8; padding: 10px; border-radius: 8px;">
            <div class="crop-sprite crop-sprite-${key} stage-3" style="position: relative; transform: none; left: auto; top: auto; animation: none; width: 40px; height: 40px;"></div>
            <strong style="margin: 8px 0 4px; color: #4a2412;">${crop.seed}</strong>
            <div style="font-size: 12px; color: #c3402d; font-weight: bold; margin-bottom: 8px;">💎 ${crop.price}</div>
            <button onclick="buyShopItem(${i}, '${key}')" style="background: linear-gradient(#d78b4d, #8a3c1b); color: white; border: 2px solid #5a2817; padding: 6px 15px; border-radius: 6px; font-weight: bold; cursor: pointer; box-shadow: 0 2px 4px rgba(0,0,0,0.3);">购买</button>
        </div>
        `;
    }).join("");
    
    // Fill empty slots if bought
    for (let i = state.shopItems.length; i < 4; i++) {
        els.seedGrid.innerHTML += `
        <div class="seed-card" style="display: flex; flex-direction: column; align-items: center; justify-content: center; border: 2px dashed #a44b22; background: rgba(255, 241, 184, 0.5); padding: 10px; border-radius: 8px;">
            <div style="color: #a44b22; font-weight: bold;">已售空</div>
        </div>
        `;
    }
};

window.buyShopItem = function(index, key) {
    const crop = CROPS[key];
    if (state.coins >= crop.price) {
        state.coins -= crop.price;
        state.inventory[key] = (state.inventory[key] || 0) + 1;
        state.shopItems.splice(index, 1);
        showToast(`购买成功：${crop.seed}`);
        commit();
    } else {
        showToast("灵玉不足，无法购买！");
    }
};

// Override refresh logic
setTimeout(() => {
    els.refreshShop.replaceWith(els.refreshShop.cloneNode(true));
    els.refreshShop = document.querySelector("#refreshShopBtn");
    els.refreshShop.innerHTML = "刷新 (500💎)";
    els.refreshShop.style.background = "linear-gradient(#f2b92d, #c5753a)";
    els.refreshShop.style.color = "white";
    els.refreshShop.style.border = "2px solid #5a2817";
    els.refreshShop.style.padding = "5px 10px";
    els.refreshShop.style.borderRadius = "5px";
    els.refreshShop.style.cursor = "pointer";
    els.refreshShop.style.fontWeight = "bold";

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
}, 500);
