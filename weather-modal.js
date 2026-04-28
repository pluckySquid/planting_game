const weatherModalHtml = `
<div id="weatherModal" class="seed-modal" hidden>
  <div class="seed-modal-content" style="width: 300px; background: #fdf5e6; border: 4px solid #e6a861; border-radius: 12px; padding: 15px;">
    <h3 style="margin-top: 0; color: #a63a15; border-bottom: 2px dashed #d97b41; padding-bottom: 10px; font-size: 18px;">天象与节气预报</h3>
    <button class="panel-close" id="closeWeatherModalBtn" style="top: -15px; right: -15px; background: #c3402d; color: white;">×</button>
    <div id="weatherList" style="display: flex; flex-direction: column; gap: 8px; margin-top: 15px; max-height: 350px; overflow-y: auto;">
      <!-- Dynamic weather entries here -->
    </div>
  </div>
</div>
`;
// Insert into the .game element so the modal is scoped to the phone-shell
// (otherwise position:absolute fills the whole desktop browser, not the in-game screen).
const __weatherHost = document.querySelector(".game") || document.body;
__weatherHost.insertAdjacentHTML("beforeend", weatherModalHtml);

const weatherModal = document.getElementById("weatherModal");
const closeWeatherModalBtn = document.getElementById("closeWeatherModalBtn");
const weatherBtn = document.querySelector(".profile-card");
const currentSeasonEl = document.getElementById("currentSeason");
const currentWeatherIconEl = document.getElementById("currentWeatherIcon");
const currentWeatherNameEl = document.getElementById("playerName");

const weathers = [
    { id: 'sunny', icon: '☀️', name: '晴天', desc: '阳光明媚，火属性植物加速' },
    { id: 'rainy', icon: '🌧️', name: '小雨', desc: '细雨润物，水属性植物增产' },
    { id: 'storm', icon: '⛈️', name: '雷暴', desc: '天降神雷，所有仙力翻倍' },
    { id: 'cloudy', icon: '☁️', name: '多云', desc: '云遮雾绕，土属性植物加速' },
    { id: 'snowy', icon: '❄️', name: '大雪', desc: '瑞雪丰年，无特殊加成' }
];

const seasons = ['春', '夏', '秋', '冬'];
const WEATHER_CYCLE_MS = 20 * 60 * 1000;

function getCurrentWeather() {
    return forecastData[0]?.weather || weathers[0];
}

// Randomly generate the next 24 hours of weather just once to keep it consistent
const forecastData = [];
const now = new Date();
for (let i = 0; i < 24; i++) {
    forecastData.push({
        season: seasons[Math.floor(Math.random() * seasons.length)],
        weather: weathers[Math.floor(Math.random() * weathers.length)]
    });
}

function updateCurrentWeather() {
    const current = forecastData[0];
    if(currentSeasonEl) currentSeasonEl.textContent = current.season;
    if(currentWeatherIconEl) currentWeatherIconEl.textContent = current.weather.icon;
    if(currentWeatherNameEl) currentWeatherNameEl.textContent = current.weather.name;
    
    const gameEl = document.getElementById("game");
    if(gameEl) {
        gameEl.setAttribute("data-weather", current.weather.id);
    }
}

window.gameWeather = {
    getCurrent: getCurrentWeather,
    list: weathers
};

function generateForecast() {
    const list = document.getElementById("weatherList");
    list.innerHTML = "";
    
    const now = new Date();
    
    for (let i = 0; i < 8; i++) {
        const time = new Date(now.getTime() + i * WEATHER_CYCLE_MS); 
        const hour = String(time.getHours()).padStart(2, '0');
        const minute = String(time.getMinutes()).padStart(2, '0');
        const data = forecastData[i];
        
        const row = document.createElement("div");
        row.style.cssText = `
            display: flex; 
            align-items: center; 
            background: ${i === 0 ? '#ffedd5' : '#fef3c7'}; 
            border: 2px solid ${i === 0 ? '#f97316' : '#d97b41'}; 
            border-radius: 8px; 
            padding: 10px;
            gap: 15px;
            box-shadow: ${i === 0 ? '0 0 10px rgba(249,115,22,0.3)' : 'none'};
        `;
        
        row.innerHTML = `
            <div style="font-size: 30px; filter: drop-shadow(0 2px 2px rgba(0,0,0,0.3));">${data.weather.icon}</div>
            <div style="flex-grow: 1; text-align: left;">
                <div style="font-size: 14px; font-weight: bold; color: #a63a15; margin-bottom: 4px;">
                    ${i === 0 ? '<span style="background: #f97316; color: white; padding: 2px 6px; border-radius: 4px; font-size: 10px; margin-right: 5px;">当前</span>' : `<span style="color:#8b5a33; font-family: monospace;">${hour}:${minute}</span> `} 
                    <span style="background: #d97b41; color: white; padding: 1px 4px; border-radius: 4px; font-size: 11px; margin-right: 5px;">${data.season}</span> 
                    ${data.weather.name}
                </div>
                <div style="font-size: 11px; color: #8b5a33;">${data.weather.desc}</div>
            </div>
        `;
        list.appendChild(row);
    }
}

// Robust close handlers — document-level delegation so it doesn't matter
// where the modal lives in the DOM or whether the references above resolved.
document.addEventListener("click", (e) => {
    const modal = document.getElementById("weatherModal");
    if (!modal) return;
    // Click on the X (or its child icon) closes the modal.
    if (e.target.closest("#closeWeatherModalBtn")) {
        modal.hidden = true;
        return;
    }
    // Click on the dim backdrop (the modal element itself, NOT its content card) closes.
    if (e.target === modal) {
        modal.hidden = true;
    }
});

// Escape key also closes (helpful for desktop testing).
document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") {
        const modal = document.getElementById("weatherModal");
        if (modal && !modal.hidden) modal.hidden = true;
    }
});

weatherBtn.addEventListener("click", () => {
    generateForecast();
    weatherModal.hidden = false;
});
weatherBtn.style.cursor = 'pointer';

// Initialize
updateCurrentWeather();
// Cycle weather every 20 real minutes.
setInterval(() => {
    forecastData.shift();
    forecastData.push({
        season: seasons[Math.floor(Math.random() * seasons.length)],
        weather: weathers[Math.floor(Math.random() * weathers.length)]
    });
    updateCurrentWeather();
}, WEATHER_CYCLE_MS);
