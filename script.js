class Upgrade {
    constructor(name, title, description, iconUrl, price, count) {
        this.name = name;
        this.title = title;
        this.description = description;
        this.iconUrl = iconUrl;
        this.price = price;
        this.count = count;
    }
}

const upgrades = [
    new Upgrade("clicker", "Clicker", "Multiplies cookies per click", "res/upgrade_icons/clicker.png", 15, 0),
    new Upgrade("flower", "VictorFlower", "Nice flower does cool stuff", "res/upgrade_icons/flower.png", 50, 0),
    new Upgrade("kid", "VictorKid", "Clicks 4x automatically but weakens your click by 1", "res/upgrade_icons/kid-victor.png", 125, 0),
    new Upgrade("meditation", "Meditation", "Doubles your click power but disables all auto-clicks", "res/upgrade_icons/meditation.png", 250, 0),
];

upgrades.forEach(u => u.originalPrice = u.price);

const cookieButton = document.getElementById("cookie_button");
const counterText = document.getElementById("counter_text");
const rateText = document.querySelector(".rate_text");
const cookieContainer = document.querySelector(".cookie_container");

let cookieCount = 0;
let cookiesPerSecond = 0;
let clickMultiplier = 1;
let spinTimeout = null;

// Achievements
const achievements = [
    { id: "vic_100",    name: "Baby Victor",    desc: "Reach 69 Victors",     icon: "", unlocked: false, check: () => cookieCount >= 69 },
    { id: "vic_1000",   name: "Victor Enjoyer", desc: "Reach 420 Victors",   icon: "", unlocked: false, check: () => cookieCount >= 420 },
    { id: "vic_10000",  name: "Victor Master",  desc: "Reach 666 Victors",  icon: "", unlocked: false, check: () => cookieCount >= 666 },
    { id: "vic_100000", name: "Victor God",     desc: "Reach 10,000 Victors", icon: "", unlocked: false, check: () => cookieCount >= 10000 }
];

let popupQueue = [];
let popupShowing = false;

function showNextPopup() {
    if (popupQueue.length === 0) {
        popupShowing = false;
        return;
    }

    popupShowing = true;
    const achievement = popupQueue.shift();

    const popup = document.createElement("div");
    popup.classList.add("achievement_popup");
    popup.innerHTML = `
        <div class="achievement_popup_icon">${achievement.icon}</div>
        <div class="achievement_popup_body">
            <span class="achievement_popup_title">Achievement Unlocked!</span>
            <span class="achievement_popup_name">${achievement.name}</span>
            <span class="achievement_popup_desc">${achievement.desc}</span>
        </div>
    `;
    document.body.appendChild(popup);

    requestAnimationFrame(() => {
        requestAnimationFrame(() => popup.classList.add("show"));
    });

    setTimeout(() => {
        popup.classList.remove("show");
        setTimeout(() => {
            popup.remove();
            showNextPopup();
        }, 500);
    }, 3000);
}

function checkAchievements() {
    for (const achievement of achievements) {
        if (!achievement.unlocked && achievement.check()) {
            achievement.unlocked = true;
            popupQueue.push(achievement);
            if (!popupShowing) showNextPopup();
        }
    }
}

function toggleAchievements() {
    const panel = document.getElementById("achievements_panel");
    panel.classList.toggle("open");

    // Rebuild the list every time it opens
    panel.innerHTML = "";
    for (const achievement of achievements) {
        const row = document.createElement("div");
        row.classList.add("achievement_row");
        if (!achievement.unlocked) row.classList.add("locked");

        row.innerHTML = `
            <div class="achievement_row_icon">${achievement.icon}</div>
            <div class="achievement_row_body">
                <span class="achievement_row_name">${achievement.name}</span>
                <span class="achievement_row_desc">${achievement.unlocked ? achievement.desc : "???"}</span>
            </div>
        `;
        panel.appendChild(row);
    }
}

function updateUI() {
    counterText.textContent = cookieCount + " Victor(s)";
    rateText.textContent = cookiesPerSecond + " victor(s) per second | " + clickMultiplier + " victor(s) per click";
    checkAchievements();
}

updateUI();

cookieButton.addEventListener("click", () => {
    cookieCount += clickMultiplier;
    updateUI();
});

setInterval(() => {
    if (cookiesPerSecond > 0) {
        cookieCount += cookiesPerSecond;
        updateUI();
    }
}, 1000);

function create(htmlStr) {
    const temp = document.createElement('div');
    temp.innerHTML = htmlStr;
    return temp.firstElementChild;
}

function addHandAroundCookie() {
    const hands = cookieContainer.querySelectorAll(".orbit_hand");
    const totalHands = hands.length;
    const newTotal = totalHands + 1;

    hands.forEach((hand, i) => {
        const newAngle = (i * 360) / newTotal;
        hand.style.setProperty("--angle", newAngle + "deg");
    });

    const hand = document.createElement("img");
    hand.src = "res/upgrade_icons/clicker.png";
    hand.classList.add("orbit_hand");
    hand.style.setProperty("--angle", ((totalHands * 360) / newTotal) + "deg");
    cookieContainer.appendChild(hand);
}

function addFarmImage(upgrade) {
    if (upgrade.name === "clicker") return;

    const farmsSection = document.getElementById("farms_section");
    let panel = document.getElementById("farm_panel_" + upgrade.name);

    if (!panel) {
        panel = document.createElement("div");
        panel.classList.add("farm_panel");
        panel.id = "farm_panel_" + upgrade.name;
        farmsSection.appendChild(panel);
    }

    const img = document.createElement("img");
    img.src = upgrade.iconUrl;
    img.classList.add("farm_img");
    panel.appendChild(img);
}

function buyUpgrade(upgrade, counterEl) {
    console.log("buying", upgrade.name, "| cookies:", cookieCount, "| price:", upgrade.price);
    if (cookieCount < upgrade.price) return;

    cookieCount -= upgrade.price;
    upgrade.count++;

    if (upgrade.name === "clicker") {
        clickMultiplier++;
        addHandAroundCookie();
    }

    if (upgrade.name === "flower") {
        cookiesPerSecond++;
    }

    if (upgrade.name === "kid") {
        if (clickMultiplier > 1) clickMultiplier--;
        cookiesPerSecond += 4;
    }

    if (upgrade.name === "meditation") {
        clickMultiplier *= 2;
        cookiesPerSecond = 0;
    }

    addFarmImage(upgrade);

    upgrade.price = Math.ceil(upgrade.price * 1.55);
    counterEl.textContent = "x" + upgrade.count;
    counterEl.closest(".upgrade").querySelector(".upgrade_price").textContent = upgrade.price + "$";

    updateUI();
}

const upgradesWindow = document.getElementById("upgrades_window");

for (const upgrade of upgrades) {
    const el = create(`
        <div class="upgrade">
            <div class="upgrade_icon_container">
                <img class="upgrade_icon" src="">
                <a class="upgrade_price">100$</a>
            </div>
            <div class="upgrade_body">
                <a class="upgrade_title">Upgrade Text</a>
                <a class="upgrade_description">This is a really cool upgrade</a>
            </div>
            <a class="upgrade_counter">x0</a>
            <button class="upgrade_delete"><img src="res/upgrade_icons/bin.png" width='25px' height='25px'></button>
        </div>
    `);

    el.querySelector(".upgrade_title").textContent = upgrade.title;
    el.querySelector(".upgrade_description").textContent = upgrade.description;
    el.querySelector(".upgrade_price").textContent = upgrade.price + "$";
    el.querySelector(".upgrade_counter").textContent = "x" + upgrade.count;
    el.querySelector(".upgrade_icon").setAttribute("src", upgrade.iconUrl);

    const counterEl = el.querySelector(".upgrade_counter");
    el.querySelector(".upgrade_delete").addEventListener("click", (e) => {
        e.stopPropagation(); // Prevent triggering buyUpgrade
        deleteUpgrade(upgrade, counterEl, el);
    });
    el.addEventListener("click", () => buyUpgrade(upgrade, counterEl));

    upgradesWindow.appendChild(el);
}

// Rain effect
const canvas = document.getElementById("rain_canvas");
const ctx = canvas.getContext("2d");

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

window.addEventListener("resize", () => {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
});

const rainImage = new Image();
rainImage.src = "res/cookie.png";

const drops = Array.from({ length: 60 }, () => ({
    x: Math.random() * window.innerWidth,
    y: Math.random() * window.innerHeight,
    speed: 2 + Math.random() * 4,
    size: 20 + Math.random() * 30,
    opacity: 0.4 + Math.random() * 0.6,
    wobble: Math.random() * Math.PI * 2,
}));

function drawRain() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    drops.forEach(drop => {
        ctx.save();
        ctx.globalAlpha = drop.opacity;
        ctx.drawImage(rainImage, drop.x, drop.y, drop.size, drop.size);
        ctx.restore();

        drop.y += drop.speed;
        drop.x += Math.sin(drop.wobble) * 0.5;
        drop.wobble += 0.02;

        if (drop.y > canvas.height) {
            drop.y = -drop.size;
            drop.x = Math.random() * canvas.width;
        }
    });

    requestAnimationFrame(drawRain);
}

rainImage.onload = () => drawRain();

// Change coin image
document.getElementById("coin_upload").addEventListener("change", (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const url = URL.createObjectURL(file);
    cookieButton.style.backgroundImage = `url(${url})`;
    rainImage.src = url;
});


function deleteUpgrade(upgrade, counterEl, el) {
    if (upgrade.count === 0) return;

    // Refund total spent (reverse the price scaling to calculate original total)
    let refund = 0;
    let price = upgrade.price;
    for (let i = 0; i < upgrade.count; i++) {
        price = Math.ceil(price / 1.55);
        refund += price;
    }
    cookieCount += refund;

    // Undo effects
    if (upgrade.name === "clicker") {
        clickMultiplier -= upgrade.count;
        if (clickMultiplier < 1) clickMultiplier = 1;
        // Remove all orbit hands
        cookieContainer.querySelectorAll(".orbit_hand").forEach(h => h.remove());
    }

    if (upgrade.name === "flower") {
        cookiesPerSecond -= upgrade.count;
        if (cookiesPerSecond < 0) cookiesPerSecond = 0;
    }

    if (upgrade.name === "kid") {
        cookiesPerSecond -= upgrade.count * 4;
        if (cookiesPerSecond < 0) cookiesPerSecond = 0;
    }

    if (upgrade.name === "meditation") {
        clickMultiplier = Math.max(1, Math.round(clickMultiplier / Math.pow(2, upgrade.count)));
    }

    // Remove farm panel
    const panel = document.getElementById("farm_panel_" + upgrade.name);
    if (panel) panel.remove();

    // Reset upgrade
    upgrade.count = 0;
    upgrade.price = upgrades.find(u => u.name === upgrade.name).originalPrice;
    counterEl.textContent = "x0";
    el.querySelector(".upgrade_price").textContent = upgrade.price + "$";

    updateUI();
}

