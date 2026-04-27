const unlockModalHtml = `
<div id="unlockModal" class="seed-modal" hidden>
  <div class="seed-modal-content" style="text-align: center;">
    <h3>开垦灵田</h3>
    <button class="panel-close" id="closeUnlockModalBtn">×</button>
    <p style="margin: 20px 0; color: #4a2412; font-weight: bold;">是否花费 <strong style="color: #c3402d;" id="unlockCostText">1000</strong> 灵玉 开垦这块新灵田？</p>
    <button id="confirmUnlockBtn" style="background: linear-gradient(#f2b92d, #c5753a); color: white; border: 2px solid #5a2817; padding: 10px 30px; border-radius: 8px; font-weight: bold; cursor: pointer; box-shadow: 0 4px 6px rgba(0,0,0,0.3);">确认开垦</button>
  </div>
</div>
`;
document.body.insertAdjacentHTML("beforeend", unlockModalHtml);

const unlockModal = document.getElementById("unlockModal");
const closeUnlockModalBtn = document.getElementById("closeUnlockModalBtn");
const confirmUnlockBtn = document.getElementById("confirmUnlockBtn");
const unlockCostText = document.getElementById("unlockCostText");

closeUnlockModalBtn.addEventListener("click", () => {
    unlockModal.hidden = true;
});

confirmUnlockBtn.addEventListener("click", () => {
    const cost = 1000 + (state.unlocked - 18) * 500;
    if (state.coins >= cost) {
        state.coins -= cost;
        state.unlocked++;
        showToast("开垦成功！");
        unlockModal.hidden = true;
        commit();
    } else {
        showToast("灵玉不足，无法开垦。");
    }
});

function openUnlockModal() {
    const cost = 1000 + (state.unlocked - 18) * 500;
    unlockCostText.textContent = cost;
    unlockModal.hidden = false;
}
