const seedModalHtml = `
<div id="seedModal" class="seed-modal" hidden>
  <div class="seed-modal-content">
    <h3>选择种子</h3>
    <button class="panel-close" id="closeSeedModalBtn">×</button>
    <div class="seed-grid-modal" id="seedModalList"></div>
  </div>
</div>
`;
// Insert into .game so the modal is scoped to the phone-shell, not the whole desktop browser.
const __seedHost = document.querySelector(".game") || document.body;
__seedHost.insertAdjacentHTML("beforeend", seedModalHtml);

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
        const count = state.inventory[seedKey] || 0;
        const btn = document.createElement("button");
        btn.className = "seed-modal-btn" + (count === 0 ? " locked" : "");
        btn.dataset.count = String(count);
        btn.innerHTML = `
            <div class="crop-icon crop-icon-${seedKey}"></div>
            <strong>${crop.seed}</strong>
            <span class="seed-count">${count}</span>
        `;
        btn.addEventListener("click", () => {
            // Suppress click that ends a drag-scroll.
            if (seedModalList.dataset.justDragged === "1") {
                seedModalList.dataset.justDragged = "0";
                return;
            }
            if (state.inventory[seedKey] > 0) {
                state.selectedSeed = seedKey;
                plant(targetPlotIndex, seedKey);
                seedModal.hidden = true;
            } else {
                showToast("种子不足，请前往商铺购买！");
            }
        });
        seedModalList.appendChild(btn);
    });

    seedModal.hidden = false;
}

// Mouse drag-to-scroll for desktop (hidden scrollbar, no shift+wheel needed).
// Touch already works via CSS touch-action: pan-x.
(function enableSeedModalDragScroll() {
    let dragging = false;
    let startX = 0;
    let startScroll = 0;
    let moved = 0;

    seedModalList.addEventListener("pointerdown", (e) => {
        if (e.pointerType === "touch") return; // let native touch scrolling handle it
        dragging = true;
        moved = 0;
        startX = e.clientX;
        startScroll = seedModalList.scrollLeft;
        seedModalList.classList.add("dragging");
        seedModalList.setPointerCapture?.(e.pointerId);
    });

    seedModalList.addEventListener("pointermove", (e) => {
        if (!dragging) return;
        const dx = e.clientX - startX;
        if (Math.abs(dx) > 3) moved = Math.abs(dx);
        seedModalList.scrollLeft = startScroll - dx;
    });

    function endDrag(e) {
        if (!dragging) return;
        dragging = false;
        seedModalList.classList.remove("dragging");
        seedModalList.releasePointerCapture?.(e.pointerId);
        // If user dragged more than a few px, suppress the upcoming click on a card.
        seedModalList.dataset.justDragged = moved > 4 ? "1" : "0";
    }
    seedModalList.addEventListener("pointerup", endDrag);
    seedModalList.addEventListener("pointercancel", endDrag);
})();
