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
    new Upgrade("flower", "VictorFlower", "Nice flower does cool stuff", "res/upgrade_icons/flower.png", 45, 0),
    new Upgrade("kid", "VictorKid", "Clicks 4x automatically but weakens your click by 1", "res/upgrade_icons/kid-victor.png", 125, 0)
];

const cookieButton = document.getElementById("cookie_button");
const counterText = document.getElementById("counter_text");
const rateText = document.querySelector(".rate_text");
const cookieContainer = document.querySelector(".cookie_container");

let cookieCount = 0;
let cookiesPerSecond = 0;
let clickMultiplier = 1;
let spinTimeout = null;

function updateUI() {
    counterText.textContent = cookieCount + " Victor(s)";
    rateText.textContent = cookiesPerSecond + " victor(s) per second | " + clickMultiplier + " victor(s) per click";
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

    // Re-distribute existing hands evenly
    hands.forEach((hand, i) => {
        const newAngle = (i * 360) / newTotal;
        hand.style.setProperty("--angle", newAngle + "deg");
    });

    // Add new hand
    const hand = document.createElement("img");
    hand.src = "res/upgrade_icons/clicker.png";
    hand.classList.add("orbit_hand");
    hand.style.setProperty("--angle", ((totalHands * 360) / newTotal) + "deg");
    cookieContainer.appendChild(hand);
}

function addFarmImage(upgrade) {
    if (upgrade.name === "clicker") return; // Clicker only shows around the cookie

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
        </div>
    `);

    el.querySelector(".upgrade_title").textContent = upgrade.title;
    el.querySelector(".upgrade_description").textContent = upgrade.description;
    el.querySelector(".upgrade_price").textContent = upgrade.price + "$";
    el.querySelector(".upgrade_counter").textContent = "x" + upgrade.count;
    el.querySelector(".upgrade_icon").setAttribute("src", upgrade.iconUrl);

    const counterEl = el.querySelector(".upgrade_counter");
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
        // Drawback: lower click multiplier by 1 (minimum 1)
        if (clickMultiplier > 1) clickMultiplier--;

        // Bonus: auto-clicks 4x per second
        setInterval(() => {
            cookieCount += 4;
            updateUI();
        }, 1000);
    }

    addFarmImage(upgrade);

    upgrade.price = Math.ceil(upgrade.price * 1.55);
    counterEl.textContent = "x" + upgrade.count;
    counterEl.closest(".upgrade").querySelector(".upgrade_price").textContent = upgrade.price + "$";

    updateUI();
}

document.getElementById("coin_upload").addEventListener("change", (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const url = URL.createObjectURL(file);
    cookieButton.style.backgroundImage = `url(${url})`;
});




