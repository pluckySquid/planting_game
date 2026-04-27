const seedModalHtml = `
<div id="seedModal" class="seed-modal" hidden>
  <div class="seed-modal-content">
    <h3>选择种子</h3>
    <button class="panel-close" id="closeSeedModalBtn">×</button>
    <div class="seed-grid-modal" id="seedModalList"></div>
  </div>
</div>
`;
document.body.insertAdjacentHTML("beforeend", seedModalHtml);

const seedModal = document.getElementById("seedModal");
const closeSeedModalBtn = document.getElementById("closeSeedModalBtn");
const seedModalList = document.getElementById("seedModalList");

let targetPlotIndex = null;

closeSeedModalBtn.addEventListener("click", () => {
    seedModal.hidden = true;
});

function openSeedModal(index) {
    targetPlotIndex = index;
    seedModalList.innerHTML = "";
    
    CROP_ORDER.forEach(seedKey => {
        const crop = CROPS[seedKey];
        const btn = document.createElement("button");
        btn.className = "seed-modal-btn";
        btn.innerHTML = `
            <div class="crop-icon crop-icon-${seedKey}"></div>
            <strong>${crop.seed}</strong>
            <span>余量: ${state.inventory[seedKey] || 0}</span>
        `;
        btn.addEventListener("click", () => {
            if (state.inventory[seedKey] > 0) {
                state.selectedSeed = seedKey;
                state.inventory[seedKey]--;
                plant(targetPlotIndex, seedKey);
                seedModal.hidden = true;
                commit();
            } else {
                showToast("种子不足，请前往商铺购买！");
            }
        });
        seedModalList.appendChild(btn);
    });
    
    seedModal.hidden = false;
}
