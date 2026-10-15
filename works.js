"use strict";

const reducedMotion = window.matchMedia(
    "(prefers-reduced-motion: reduce)"
);

const motionButton = document.getElementById("motion-toggle");

let motionPaused = reducedMotion.matches;

function updateMotion() {
    document.body.classList.toggle("motion-paused", motionPaused);

    motionButton.textContent = motionPaused
        ? "動きを再開 ↗"
        : "動きを止める Ⅱ";

    motionButton.setAttribute("aria-pressed", String(motionPaused));
}

motionButton.hidden = false;

motionButton.addEventListener("click", function () {
    motionPaused = !motionPaused;
    updateMotion();
});

reducedMotion.addEventListener("change", function (event) {
    motionPaused = event.matches;
    updateMotion();
});

updateMotion();

function shouldReduceMotion() {
    return motionPaused || reducedMotion.matches;
}

let revealObserver = null;

if ("IntersectionObserver" in window) {
    revealObserver = new IntersectionObserver(
        function (entries) {
            entries.forEach(function (entry) {
                if (entry.isIntersecting) {
                    entry.target.classList.add("is-visible");
                    revealObserver.unobserve(entry.target);
                }
            });
        },
        {
            threshold: 0.08
        }
    );

    document.querySelectorAll(".reveal").forEach(function (element) {
        revealObserver.observe(element);
    });

    document.body.classList.add("motion-ready");
}

function observeCard(element, index) {
    if (!revealObserver) {
        return;
    }

    element.classList.add("reveal");

    element.style.setProperty(
        "--reveal-delay",
        (index % 3) * 80 + "ms"
    );

    revealObserver.observe(element);
}

const progressBar = document.querySelector(".scroll-progress");

let scrollScheduled = false;

function updateProgress() {
    const scrollable =
        document.documentElement.scrollHeight - window.innerHeight;

    const progress = scrollable > 0
        ? window.scrollY / scrollable
        : 0;

    progressBar.style.transform =
        "scaleX(" + Math.min(1, Math.max(0, progress)) + ")";

    scrollScheduled = false;
}

function requestProgressUpdate() {
    if (!scrollScheduled) {
        scrollScheduled = true;
        requestAnimationFrame(updateProgress);
    }
}

window.addEventListener("scroll", requestProgressUpdate, {
    passive: true
});

window.addEventListener("resize", requestProgressUpdate);

updateProgress();

const defaultWorks = [
    {
        title: "オーストラリア",
        description:
            "美しい海と豊かな自然が広がる国。シドニーのオペラハウスが有名です。",
        image: "media/australia.jpg",
        link: "https://www.australia.com/ja-jp",
        category: "オセアニア"
    },
    {
        title: "オーストリア",
        description:
            "音楽の都ウィーンを擁する国。歴史あるオペラ座でクラシック音楽を楽しめます。",
        image: "media/austria.jpg",
        link: "https://www.austria.info/ja/",
        category: "ヨーロッパ"
    },
    {
        title: "カナダ",
        description:
            "雄大な山々と澄んだ湖が魅力の国。四季折々の美しい自然を楽しめます。",
        image: "media/canada.jpg",
        link: "https://travel.destinationcanada.com/ja-jp",
        category: "北アメリカ"
    },
    {
        title: "ドイツ",
        description:
            "歴史ある建築と近代的な都市が共存する国。ベルリンのブランデンブルク門が有名です。",
        image: "media/germany.jpg",
        link: "https://www.germany.travel/en/home.html",
        category: "ヨーロッパ"
    },
    {
        title: "アメリカ",
        description:
            "多様な文化と壮大な自然が魅力の国。ニューヨークの自由の女神が有名です。",
        image: "media/america.jpg",
        link: "https://www.gousa.jp/",
        category: "北アメリカ"
    }
];

const grid = document.getElementById("works-grid");
const categorySelect = document.getElementById("category");
const sortSelect = document.getElementById("sort");
const resultCount = document.getElementById("result-count");
const worksMessage = document.getElementById("works-message");

let works = defaultWorks.slice();

function createElement(tag, className, text) {
    const element = document.createElement(tag);

    if (className) {
        element.className = className;
    }

    if (text !== undefined) {
        element.textContent = text;
    }

    return element;
}

function createCard(work) {
    const card = createElement("article", "work-card");

    const link = document.createElement("a");
    link.href = work.link;
    link.target = "_blank";
    link.rel = "noopener noreferrer";

    const imageWrapper = createElement("div", "work-image");

    const image = document.createElement("img");
    image.src = work.image;
    image.alt = work.title + "の風景";
    image.loading = "lazy";
    image.width = 600;
    image.height = 450;

    const arrow = createElement("span", "work-arrow", "↗");
    arrow.setAttribute("aria-hidden", "true");

    imageWrapper.append(image, arrow);

    const info = createElement("div", "work-info");

    info.append(
        createElement("p", "work-category", work.category),
        createElement("h3", "", work.title),
        createElement("p", "work-description", work.description),
        createElement(
            "span",
            "work-link-label",
            "公式観光サイトを見る ↗"
        )
    );

    link.append(imageWrapper, info);
    card.append(link);

    return card;
}

function updateCategories() {
    const previousValue = categorySelect.value;

    categorySelect.replaceChildren(
        new Option("すべての地域", "all")
    );

    const categories = [
        ...new Set(works.map(function (work) {
            return work.category;
        }))
    ];

    categories.forEach(function (category) {
        categorySelect.add(new Option(category, category));
    });

    if (categories.includes(previousValue)) {
        categorySelect.value = previousValue;
    }
}

function displayWorks() {
    let filteredWorks = works.slice();

    if (categorySelect.value !== "all") {
        filteredWorks = filteredWorks.filter(function (work) {
            return work.category === categorySelect.value;
        });
    }

    if (sortSelect.value === "title") {
        filteredWorks.sort(function (a, b) {
            return a.title.localeCompare(b.title, "ja");
        });
    }

    if (revealObserver) {
        grid.querySelectorAll(".reveal").forEach(function (card) {
            revealObserver.unobserve(card);
        });
    }

    grid.replaceChildren();

    filteredWorks.forEach(function (work, index) {
        const card = createCard(work);

        grid.append(card);
        observeCard(card, index);
    });

    resultCount.textContent =
        String(filteredWorks.length).padStart(2, "0") + " COUNTRIES";

    worksMessage.hidden = filteredWorks.length > 0;
    worksMessage.textContent = filteredWorks.length === 0
        ? "該当する国がありません。"
        : "";

    requestProgressUpdate();
}

categorySelect.addEventListener("change", displayWorks);
sortSelect.addEventListener("change", displayWorks);

function parseCSV(text) {
    const rows = [];

    let row = [];
    let value = "";
    let quoted = false;

    text = text.replace(/^\uFEFF/, "");

    for (let i = 0; i < text.length; i++) {
        const character = text[i];

        if (character === '"') {
            if (quoted && text[i + 1] === '"') {
                value += '"';
                i++;
            } else {
                quoted = !quoted;
            }
        } else if (character === "," && !quoted) {
            row.push(value);
            value = "";
        } else if (
            (character === "\n" || character === "\r") &&
            !quoted
        ) {
            if (character === "\r" && text[i + 1] === "\n") {
                i++;
            }

            row.push(value);

            if (row.some(function (cell) {
                return cell.trim() !== "";
            })) {
                rows.push(row);
            }

            row = [];
            value = "";
        } else {
            value += character;
        }
    }

    row.push(value);

    if (row.some(function (cell) {
        return cell.trim() !== "";
    })) {
        rows.push(row);
    }

    return rows;
}

async function loadWorks() {
    try {
        const response = await fetch("work.csv", {
            cache: "no-cache"
        });

        if (!response.ok) {
            throw new Error("CSVを読み込めませんでした");
        }

        const rows = parseCSV(await response.text());

        if (rows.length < 2) {
            throw new Error("CSVに国のデータがありません");
        }

        const headers = rows.shift().map(function (header) {
            return header.trim();
        });

        const requiredHeaders = [
            "title",
            "description",
            "image",
            "link",
            "category"
        ];

        if (!requiredHeaders.every(function (header) {
            return headers.includes(header);
        })) {
            throw new Error("CSVの見出しが正しくありません");
        }

        const loadedWorks = rows.map(function (row) {
            const work = {};

            headers.forEach(function (header, index) {
                work[header] = (row[index] || "").trim();
            });

            const url = new URL(work.link, window.location.href);

            if (!["https:", "http:"].includes(url.protocol)) {
                throw new Error("リンクの形式が正しくありません");
            }

            if (!work.title || !work.image || !work.category) {
                throw new Error("国の情報が不足しています");
            }

            work.link = url.href;

            return work;
        });

        works = loadedWorks;

        updateCategories();
        displayWorks();
    } catch (error) {
        console.info("予備データを表示します:", error.message);
    }
}

updateCategories();
displayWorks();
loadWorks();

async function loadWeather() {
    const controller = new AbortController();

    const timeout = setTimeout(function () {
        controller.abort();
    }, 8000);

    try {
        const url =
            "https://api.open-meteo.com/v1/forecast" +
            "?latitude=35.6895" +
            "&longitude=139.6917" +
            "&current=temperature_2m,weather_code" +
            "&timezone=Asia%2FTokyo";

        const response = await fetch(url, {
            signal: controller.signal
        });

        if (!response.ok) {
            throw new Error("天気を取得できませんでした");
        }

        const data = await response.json();

        const code = data.current.weather_code;
        const temperature = data.current.temperature_2m;

        let icon = "☁";
        let theme = "weather-cloudy";

        if (code === 0) {
            icon = "☀";
            theme = "weather-sunny";
        } else if (code >= 71 && code <= 77 || code === 85 || code === 86) {
            icon = "❄";
            theme = "weather-rainy";
        } else if (code >= 51) {
            icon = code >= 95 ? "⚡" : "☂";
            theme = "weather-rainy";
        }

        document.body.classList.remove(
            "weather-sunny",
            "weather-cloudy",
            "weather-rainy"
        );

        document.body.classList.add(theme);

        document.getElementById("weather-icon").textContent = icon;

        document.getElementById("weather-text").textContent =
            "TOKYO / " + Math.round(temperature) + "°C";
    } catch {
        document.getElementById("weather-icon").textContent = "◌";
        document.getElementById("weather-text").textContent = "TOKYO";
    } finally {
        clearTimeout(timeout);
    }
}

loadWeather();

const invitation = document.querySelector(".fanclub-cta");
const welcomeDialog = document.getElementById("fanclub-welcome");
const canvas = document.getElementById("fireworks");
const context = canvas.getContext("2d");

const welcomeCount = document.getElementById("welcome-count");
const welcomeCancel = document.querySelector(".welcome-cancel");
const welcomeGo = document.querySelector(".welcome-go");

let fireworksFrame = null;
let navigationTimer = null;
let countdownTimer = null;

let fireworks = [];
let rockets = [];

let canvasWidth = 0;
let canvasHeight = 0;
let lastLaunch = 0;
let previousFrameTime = 0;
let previousOverflow = "";

const fireworkColors = [
    "#d5fc45",
    "#ff91ca",
    "#ffd275",
    "#83d8ff",
    "#ffffff"
];

function resizeCanvas() {
    canvasWidth = window.innerWidth;
    canvasHeight = window.innerHeight;

    const ratio = Math.min(window.devicePixelRatio || 1, 2);

    canvas.width = canvasWidth * ratio;
    canvas.height = canvasHeight * ratio;

    if (context) {
        context.setTransform(ratio, 0, 0, ratio, 0, 0);
    }
}

function launchRocket() {
    const count = Math.random() < 0.4 ? 3 : 2;

    for (let i = 0; i < count; i++) {
        rockets.push({
            x: canvasWidth * (0.08 + Math.random() * 0.84),
            y: canvasHeight + Math.random() * 100,
            targetY: canvasHeight * (0.08 + Math.random() * 0.42),
            speed: 14 + Math.random() * 7,
            color: fireworkColors[
                Math.floor(Math.random() * fireworkColors.length)
            ],
            type: Math.random() < 0.35 ? "gold" : "color"
        });
    }
}

function explode(rocket) {
    const isGold = rocket.type === "gold";
    const count = isGold ? 150 : 110;
    const baseSpeed = Math.min(canvasWidth, canvasHeight) / 85;

    for (let ring = 0; ring < 2; ring++) {
        for (let i = 0; i < count; i++) {
            const angle = Math.PI * 2 * i / count;
            const speed =
                baseSpeed *
                (ring === 0 ? 1.25 : 0.65) *
                (0.8 + Math.random() * 0.4);

            fireworks.push({
                x: rocket.x,
                y: rocket.y,
                velocityX: Math.cos(angle) * speed,
                velocityY: Math.sin(angle) * speed,
                life: 1,
                decay: isGold
                    ? 0.006 + Math.random() * 0.003
                    : 0.01 + Math.random() * 0.004,
                gravity: isGold ? 0.055 : 0.035,
                size: 1.5 + Math.random() * 1.5,
                color: isGold
                    ? ["#ffe9a3", "#ffd166", "#fff6d5"][
                        Math.floor(Math.random() * 3)
                    ]
                    : ring === 0
                        ? rocket.color
                        : "#ffffff"
            });
        }
    }

    fireworks.push({
        x: rocket.x,
        y: rocket.y,
        velocityX: 0,
        velocityY: 0,
        life: 1,
        decay: 0.12,
        gravity: 0,
        size: 30,
        color: "#ffffff"
    });
}

function animateFireworks(time) {
    if (!welcomeDialog.open || document.hidden || !context) {
        fireworksFrame = null;
        return;
    }

    if (shouldReduceMotion()) {
        context.clearRect(0, 0, canvasWidth, canvasHeight);
        fireworksFrame = null;
        return;
    }

    const delta = previousFrameTime
        ? Math.min((time - previousFrameTime) / 16.67, 2)
        : 1;

    previousFrameTime = time;

    context.globalCompositeOperation = "destination-out";
    context.fillStyle = "rgba(0, 0, 0, 0.18)";
    context.fillRect(0, 0, canvasWidth, canvasHeight);

    context.globalCompositeOperation = "lighter";

    if (lastLaunch === 0) {
        for (let i = 0; i < 3; i++) {
            explode({
                x: canvasWidth * (0.2 + i * 0.3),
                y: canvasHeight * (0.2 + Math.random() * 0.2),
                color: fireworkColors[i],
                type: i === 1 ? "gold" : "color"
            });
        }

        launchRocket();
        lastLaunch = time;
    }

    if (time - lastLaunch > 300) {
        launchRocket();
        lastLaunch = time;
    }

    rockets = rockets.filter(function (rocket) {
        rocket.y -= rocket.speed * delta;

        context.globalAlpha = 1;
        context.strokeStyle = rocket.color;
        context.lineWidth = 3;

        context.beginPath();
        context.moveTo(rocket.x, rocket.y);
        context.lineTo(rocket.x, rocket.y + 35);
        context.stroke();

        if (rocket.y <= rocket.targetY) {
            explode(rocket);
            return false;
        }

        return true;
    });

    fireworks = fireworks.filter(function (particle) {
        particle.x += particle.velocityX * delta;
        particle.y += particle.velocityY * delta;

        const drag = Math.pow(0.985, delta);

        particle.velocityX *= drag;
        particle.velocityY *= drag;
        particle.velocityY += particle.gravity * delta;
        particle.life -= particle.decay * delta;

        if (particle.life <= 0) {
            return false;
        }

        context.globalAlpha = particle.life;
        context.fillStyle = particle.color;

        context.beginPath();
        context.arc(
            particle.x,
            particle.y,
            particle.size * Math.min(1, particle.life * 2),
            0,
            Math.PI * 2
        );
        context.fill();

        return true;
    });

    context.globalAlpha = 1;
    context.globalCompositeOperation = "source-over";

    fireworksFrame = requestAnimationFrame(animateFireworks);
}
function stopNavigation() {
    clearTimeout(navigationTimer);
    clearInterval(countdownTimer);

    navigationTimer = null;
    countdownTimer = null;
}

function stopFireworks() {
    cancelAnimationFrame(fireworksFrame);

    fireworksFrame = null;
    fireworks = [];
    rockets = [];
    lastLaunch = 0;
    previousFrameTime = 0;

    if (context) {
        context.clearRect(0, 0, canvasWidth, canvasHeight);
    }
}

function cleanupWelcome() {
    stopNavigation();
    stopFireworks();

    document.body.style.overflow = previousOverflow;

    window.removeEventListener("resize", resizeCanvas);
}

function openWelcome(event) {
    if (
        event.ctrlKey ||
        event.metaKey ||
        event.shiftKey ||
        event.altKey
    ) {
        return;
    }

    if (typeof welcomeDialog.showModal !== "function") {
        return;
    }

    event.preventDefault();

    previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    welcomeDialog.showModal();
    welcomeCancel.focus();

    resizeCanvas();
    window.addEventListener("resize", resizeCanvas);

    let seconds = 4;

    welcomeCount.textContent =
        seconds + "秒後にファンクラブサイトへ移動します。";

    countdownTimer = setInterval(function () {
        seconds--;

        welcomeCount.textContent =
            Math.max(0, seconds) +
            "秒後にファンクラブサイトへ移動します。";
    }, 1000);

    navigationTimer = setTimeout(function () {
        cleanupWelcome();
        window.location.assign(invitation.href);
    }, 4000);

    if (!shouldReduceMotion() && context) {
        fireworksFrame = requestAnimationFrame(animateFireworks);
    }
}

invitation.addEventListener("click", openWelcome);

welcomeCancel.addEventListener("click", function () {
    welcomeDialog.close();
});

welcomeDialog.addEventListener("close", function () {
    cleanupWelcome();
    invitation.focus();
});

welcomeGo.addEventListener("click", function () {
    cleanupWelcome();
});

document.addEventListener("visibilitychange", function () {
    if (!welcomeDialog.open) {
        return;
    }

    if (document.hidden) {
        stopNavigation();
        stopFireworks();

        welcomeCount.textContent =
            "上のボタンからファンクラブサイトへ進めます。";
    } else if (!shouldReduceMotion() && context) {
        fireworksFrame = requestAnimationFrame(animateFireworks);
    }
});

function refreshFireworksMotion() {
    if (!welcomeDialog.open) {
        return;
    }

    if (shouldReduceMotion()) {
        stopFireworks();
    } else if (!fireworksFrame && context && !document.hidden) {
        fireworksFrame = requestAnimationFrame(animateFireworks);
    }
}

reducedMotion.addEventListener("change", refreshFireworksMotion);
motionButton.addEventListener("click", refreshFireworksMotion);