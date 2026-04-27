const chatBox = document.querySelector(".chat-box");
const players = ["玉华山王者", "肚肚", "龙傲天", "清风明月", "一剑破天", "种田小能手", "逍遥子", "云舒"];
const broadcastCrops = ["百年蟠桃", "千年人参果", "万年仙芝", "火灵竹", "超巨型辣椒"];
const rarities = ["卓越", "珍稀", "参天", "绝品", "变异"];

function updateBroadcast() {
    if (!chatBox) return;
    const p = players[Math.floor(Math.random() * players.length)];
    const c = broadcastCrops[Math.floor(Math.random() * broadcastCrops.length)];
    const r = rarities[Math.floor(Math.random() * rarities.length)];
    
    // Add fade out
    chatBox.style.opacity = 0;
    
    setTimeout(() => {
        const type = Math.random();
        if (type > 0.4) {
            chatBox.innerHTML = `<span style="color: #fde047;">【全服传闻】</span> 玩家 <span style="color: #60a5fa;">[${p}]</span> 福星高照，竟种出了 <span style="color: #c084fc; font-weight: bold;">${r} · ${c}</span>！`;
        } else {
            chatBox.innerHTML = `<span style="color: #fde047;">【全服传闻】</span> 玩家 <span style="color: #60a5fa;">[${p}]</span> 的农田触发了天降异象，灵玉大丰收！`;
        }
        // Fade in
        chatBox.style.opacity = 1;
    }, 500);
}

if (chatBox) {
    chatBox.style.transition = "opacity 0.5s ease-in-out";
    chatBox.style.whiteSpace = "nowrap";
    chatBox.style.overflow = "hidden";
    chatBox.style.textOverflow = "ellipsis";
    chatBox.style.padding = "10px 15px";
    
    setInterval(updateBroadcast, 6000);
    updateBroadcast();
}
