const RECORD_KEY = "muscle-log-records-v1";
const CUSTOM_KEY = "muscle-log-custom-exercises-v1";
const parts = MuscleMap.parts;

let exercises = [];
let records = [];
let screen = "today";
let historyDate = "";
let view = "front";
let selectedPart = "";
let muscleCounts = new Map();
let previousSets = [];

let editing = null;
let activeGuideId = "";
let animationFrame = null;
let elapsed = 0;
let lastFrameTime = null;

function byId(id) {
    return document.getElementById(id);
}

function getToday() {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, "0");
    const day = String(now.getDate()).padStart(2, "0");

    return `${year}-${month}-${day}`;
}

function formatDate(date) {
    return date.replaceAll("-", "/");
}

function formatSet(set) {
    if (set.weight == null) {
        return `${set.reps}回`;
    }

    return `${set.weight}kg × ${set.reps}回`;
}

function appendText(parent, tag, text, className = "") {
    const item = document.createElement(tag);

    item.textContent = text;
    item.className = className;
    parent.append(item);

    return item;
}

function appendButton(parent, label, handler) {
    const button = appendText(parent, "button", label);

    button.type = "button";
    button.addEventListener("click", handler);

    return button;
}

function option(value, label) {
    const item = document.createElement("option");

    item.value = value;
    item.textContent = label;

    return item;
}

function readArray(key) {
    const data = JSON.parse(localStorage.getItem(key) ?? "[]");

    if (!Array.isArray(data)) {
        throw new Error("保存データの形式を確認してください。");
    }

    return data;
}

function writeRecords(nextRecords) {
    localStorage.setItem(RECORD_KEY, JSON.stringify(nextRecords));
    records = nextRecords;
}

async function loadExercises() {
    const response = await fetch("work.csv");

    if (!response.ok) {
        throw new Error("work.csvを読み込めませんでした。");
    }

    const csv = await response.text();
    const lines = csv.trim().split(/\r?\n/).slice(1);
    const items = new Map();

    for (const line of lines) {
        if (!line.trim()) {
            continue;
        }

        const [id, name, main, secondary] = line.split(",");

        items.set(id, {
            id,
            name,
            main: main.split("|"),
            secondary: secondary ? secondary.split("|") : []
        });
    }

    return [...items.values()];
}

function getExercise(id) {
    return exercises.find((exercise) => exercise.id === id);
}

function getEntries(date) {
    const entries = new Map();

    for (const record of records) {
        if (record.date !== date) {
            continue;
        }

        if (!entries.has(record.exerciseId)) {
            entries.set(record.exerciseId, {
                exerciseId: record.exerciseId,
                name: record.name,
                main: [...record.main],
                sets: []
            });
        }

        const entry = entries.get(record.exerciseId);

        entry.sets.push(...record.sets);
    }

    return [...entries.values()];
}

function countSets(entries) {
    return entries.reduce((sum, entry) => sum + entry.sets.length, 0);
}

function countMuscles(entries) {
    const counts = new Map();

    for (const entry of entries) {
        for (const id of new Set(entry.main)) {
            counts.set(id, (counts.get(id) ?? 0) + 1);
        }
    }

    return counts;
}

function fillPartSelect(select) {
    select.replaceChildren(option("", "部位を選ぶ"));

    for (const side of ["front", "back"]) {
        const group = document.createElement("optgroup");

        group.label = side === "front" ? "前面" : "背面";

        for (const part of Object.values(parts)) {
            if (part.view === side) {
                group.append(option(part.id, part.name));
            }
        }

        select.append(group);
    }
}

function appendExerciseGroup(select, label, items) {
    if (items.length === 0) {
        return;
    }

    const group = document.createElement("optgroup");

    group.label = label;

    for (const exercise of items) {
        group.append(option(exercise.id, exercise.name));
    }

    select.append(group);
}

function renderExerciseOptions(preferred = "", chooseRecommended = false) {
    const select = byId("exerciseSelect");
    const recommended = exercises.filter((exercise) => exercise.main.includes(selectedPart));
    const other = exercises.filter((exercise) => !exercise.main.includes(selectedPart));

    select.replaceChildren(option("", "種目を選ぶ"));

    appendExerciseGroup(select, "この部位のおすすめ", recommended);
    appendExerciseGroup(select, selectedPart ? "その他の種目" : "全種目", other);

    if (getExercise(preferred)) {
        select.value = preferred;
    } else if (chooseRecommended && recommended.length > 0) {
        select.value = recommended[0].id;
    }
}

function describeExercise(exercise) {
    if (!exercise) {
        return "";
    }

    const main = exercise.main.map((id) => parts[id]?.name ?? id);
    const secondary = exercise.secondary.map((id) => parts[id]?.name ?? id);

    let text = `主に狙う部位 · ${main.join("・")}`;

    if (secondary.length > 0) {
        text += ` ／ 補助 · ${secondary.join("・")}`;
    }

    return text;
}

function renumberRows(list) {
    const rows = [...list.children];

    for (const [index, row] of rows.entries()) {
        const number = index + 1;
        const remove = row.querySelector("button");

        row.querySelector(".set-number").textContent = number;
        row.querySelector(".weight").setAttribute("aria-label", `セット${number}の重量（kg）`);
        row.querySelector(".reps").setAttribute("aria-label", `セット${number}の回数`);

        remove.setAttribute("aria-label", `セット${number}を削除`);
        remove.disabled = rows.length === 1;
    }
}

function addSetRow(list, set = {}) {
    const row = appendText(list, "div", "", "set-grid");

    appendText(row, "span", "", "set-number");

    const weight = document.createElement("input");

    weight.className = "weight";
    weight.type = "number";
    weight.min = "0";
    weight.step = "any";
    weight.value = set.weight ?? "";

    const reps = document.createElement("input");

    reps.className = "reps";
    reps.type = "number";
    reps.min = "1";
    reps.step = "1";
    reps.required = true;
    reps.value = set.reps ?? "";

    row.append(weight, reps);

    appendButton(row, "×", () => {
        row.remove();
        renumberRows(list);
    });

    renumberRows(list);
}

function fillSetRows(list, sets) {
    list.replaceChildren();

    for (const set of sets) {
        addSetRow(list, set);
    }
}

function readSets(list) {
    return [...list.children].map((row) => {
        const weight = row.querySelector(".weight");
        const reps = row.querySelector(".reps");

        return {
            weight: weight.value === "" ? null : weight.valueAsNumber,
            reps: reps.valueAsNumber
        };
    });
}

function updatePreviousRecord() {
    const exerciseId = byId("exerciseSelect").value;
    const today = getToday();

    const previousDate = records
        .filter((record) => record.exerciseId === exerciseId && record.date < today)
        .map((record) => record.date)
        .sort()
        .pop();

    previousSets = [];

    if (previousDate) {
        const entry = getEntries(previousDate).find((item) => {
            return item.exerciseId === exerciseId;
        });

        previousSets = entry.sets;
    }

    byId("previousRecord").textContent = previousDate
        ? `前回 ${formatDate(previousDate)} · ${previousSets.map(formatSet).join(" / ")}`
        : "前回の記録はありません。";

    byId("copyButton").hidden = previousSets.length === 0;
}

function updateExerciseForm() {
    const exercise = getExercise(byId("exerciseSelect").value);

    byId("setFields").hidden = !exercise;
    byId("exerciseParts").textContent = describeExercise(exercise);

    fillSetRows(byId("setRows"), exercise ? [{}] : []);
    updatePreviousRecord();
}

function makeRecord(date, exercise, sets) {
    return {
        date,
        exerciseId: exercise.id,
        name: exercise.name,
        main: [...exercise.main],
        sets
    };
}

function saveRecord(event) {
    event.preventDefault();

    const exercise = getExercise(byId("exerciseSelect").value);

    if (screen !== "today" || !exercise) {
        return;
    }

    const sets = readSets(byId("setRows"));
    const record = makeRecord(getToday(), exercise, sets);

    try {
        writeRecords([...readArray(RECORD_KEY), record]);
    } catch {
        byId("message").textContent = "記録を保存できませんでした。";
        return;
    }

    byId("message").textContent = `${exercise.name}を${sets.length}セット記録しました。`;

    updateExerciseForm();
    renderWorkout();
}

function addCustomExercise(event) {
    event.preventDefault();

    const name = byId("customName").value.trim();
    const part = byId("customPart").value;

    if (screen !== "today" || !name || !Object.hasOwn(parts, part)) {
        byId("message").textContent = "種目名と主に狙う部位を入力してください。";
        return;
    }

    try {
        const saved = readArray(CUSTOM_KEY);

        let exercise = [...exercises, ...saved].find((item) => {
            return item.name === name && item.main.includes(part);
        });

        if (!exercise) {
            exercise = {
                id: `custom-${crypto.randomUUID()}`,
                name,
                main: [part],
                secondary: []
            };

            localStorage.setItem(CUSTOM_KEY, JSON.stringify([...saved, exercise]));
        }

        if (!getExercise(exercise.id)) {
            exercises.push(exercise);
        }

        const previous = byId("exerciseSelect").value;

        renderExerciseOptions(exercise.id);

        if (previous !== exercise.id) {
            updateExerciseForm();
        }

        byId("customName").value = "";
        byId("customDetails").open = false;
        byId("message").textContent = `「${name}」を選択しました。`;
    } catch {
        byId("message").textContent = "種目を追加できませんでした。";
    }
}

function matchesEdit(record, date, exerciseId) {
    return record.date === date && record.exerciseId === exerciseId;
}

function getEditExercise() {
    const id = byId("editExercise").value;

    if (id === editing?.original.id) {
        return editing.original;
    }

    return getExercise(id);
}

function openEdit(date, entry) {
    const original = {
        id: entry.exerciseId,
        name: entry.name,
        main: [...entry.main],
        secondary: getExercise(entry.exerciseId)?.secondary ?? []
    };

    try {
        const snapshot = readArray(RECORD_KEY).filter((record) => {
            return matchesEdit(record, date, entry.exerciseId);
        });

        if (snapshot.length === 0) {
            byId("message").textContent = "この記録は別の画面で変更されました。ページを更新してください。";
            return;
        }

        editing = {
            date,
            original,
            snapshot: JSON.stringify(snapshot)
        };

        const select = byId("editExercise");
        const available = exercises.filter((item) => item.id !== original.id);

        select.replaceChildren(option(original.id, original.name));
        appendExerciseGroup(select, "変更先の種目", available);

        byId("editDate").textContent = formatDate(date);
        byId("editParts").textContent = describeExercise(original);
        byId("editMessage").textContent = "";
        byId("deleteDetails").open = false;

        const sets = snapshot.flatMap((record) => record.sets);

        fillSetRows(byId("editRows"), sets.length > 0 ? sets : [{}]);

        byId("editDialog").showModal();
    } catch {
        byId("message").textContent = "記録を開けませんでした。";
    }
}

function commitEdit(replacement) {
    if (!editing) {
        return;
    }

    try {
        const latest = readArray(RECORD_KEY);
        const matches = (record) => {
            return matchesEdit(record, editing.date, editing.original.id);
        };

        const current = latest.filter(matches);

        if (JSON.stringify(current) !== editing.snapshot) {
            byId("editMessage").textContent =
                "この記録が別の画面で変更されました。編集を閉じ、ページを更新してから開き直してください。";
            return;
        }

        const next = [];
        let inserted = false;

        for (const record of latest) {
            if (!matches(record)) {
                next.push(record);
                continue;
            }

            if (replacement && !inserted) {
                next.push(replacement);
                inserted = true;
            }
        }

        writeRecords(next);
    } catch {
        byId("editMessage").textContent = "変更を保存できませんでした。";
        return;
    }

    byId("editDialog").close();
    byId("message").textContent = replacement
        ? "記録を更新しました。"
        : "記録を削除しました。";

    updatePreviousRecord();

    if (screen === "historyDetail" && getEntries(historyDate).length === 0) {
        switchScreen("history");
    } else {
        renderWorkout();
    }
}

function saveEdit(event) {
    event.preventDefault();

    const exercise = getEditExercise();

    if (!editing || !exercise) {
        return;
    }

    const sets = readSets(byId("editRows"));
    const replacement = makeRecord(editing.date, exercise, sets);

    commitEdit(replacement);
}

function renderRecords(date, entries) {
    const list = byId("recordList");

    list.replaceChildren();

    if (entries.length === 0) {
        appendText(list, "p", "表示できる記録はありません。", "muted");
        return;
    }

    for (const entry of entries) {
        const row = appendText(list, "article", "", "record-item");

        appendText(row, "strong", entry.name);
        appendText(row, "p", entry.sets.map(formatSet).join("\n"));

        const editButton = appendButton(row, "編集", () => {
            openEdit(date, entry);
        });

        editButton.setAttribute("aria-label", `${entry.name}の記録を編集`);
    }
}

function renderHistory() {
    const list = byId("historyList");
    const dates = [...new Set(records.map((record) => record.date))].sort().reverse();

    list.replaceChildren();

    if (dates.length === 0) {
        appendText(list, "p", "保存したトレーニングがここに表示されます。", "muted");
        return;
    }

    for (const date of dates) {
        const entries = getEntries(date);
        const label = `${formatDate(date)}　${entries.length}種目 / ${countSets(entries)}セット`;

        appendButton(list, label, () => {
            historyDate = date;
            switchScreen("historyDetail");
        });
    }
}

function hideMuscleTooltip() {
    byId("muscleTooltip").hidden = true;
}

function showMuscleTooltip(event) {
    const canvas = byId("bodyCanvas");
    const partId = MuscleMap.hit(canvas, event, view);

    if (!partId) {
        hideMuscleTooltip();
        return;
    }

    const tooltip = byId("muscleTooltip");
    const stage = canvas.parentElement;
    const bounds = stage.getBoundingClientRect();
    const count = muscleCounts.get(partId) ?? 0;

    tooltip.textContent = `${parts[partId].name} · ${count}種目`;
    tooltip.hidden = false;

    const x = event.clientX - bounds.left - stage.clientLeft + 14;
    const y = event.clientY - bounds.top - stage.clientTop + 14;

    const maxX = stage.clientWidth - tooltip.offsetWidth - 8;
    const maxY = stage.clientHeight - tooltip.offsetHeight - 8;

    tooltip.style.left = `${Math.max(8, Math.min(x, maxX))}px`;
    tooltip.style.top = `${Math.max(8, Math.min(y, maxY))}px`;
}

function renderWorkout() {
    hideMuscleTooltip();

    const date = screen === "today" ? getToday() : historyDate;
    const entries = getEntries(date);
    const part = parts[selectedPart];

    const matching = entries.filter((entry) => entry.main.includes(selectedPart));
    const filtering = screen === "historyDetail" && Boolean(part);

    muscleCounts = countMuscles(entries);

    byId("dateLabel").textContent = formatDate(date);
    byId("stats").textContent = `${entries.length}種目 / ${countSets(entries)}セット`;
    byId("partSelect").value = selectedPart;

    byId("frontButton").setAttribute("aria-pressed", String(view === "front"));
    byId("backButton").setAttribute("aria-pressed", String(view === "back"));

    MuscleMap.draw(byId("bodyCanvas"), view, muscleCounts, selectedPart);

    byId("partPanel").hidden = !part;
    byId("recordPanel").hidden = screen !== "today";

    if (part) {
        const names = matching.map((entry) => entry.name).join("・");

        byId("partTitle").textContent = part.name;
        byId("partDescription").textContent = part.description;

        byId("partSummary").textContent = names
            ? `${matching.length}種目 · ${names}`
            : "この部位を主に狙った種目は0件です。";
    }

    byId("clearFilterButton").hidden = !filtering;
    byId("recordTitle").textContent = screen === "today"
        ? "今日の記録"
        : "この日の記録";

    renderRecords(date, filtering ? matching : entries);
}

function switchScreen(next) {
    screen = next;

    pauseMovement();
    hideMuscleTooltip();

    const workout = screen === "today" || screen === "historyDetail";

    byId("dashboard").hidden = !workout;
    byId("historyList").hidden = screen !== "history";
    byId("stretchScreen").hidden = screen !== "stretch";

    byId("todayButton").setAttribute("aria-pressed", String(screen === "today"));
    byId("historyButton").setAttribute("aria-pressed", String(screen === "history" || screen === "historyDetail"));
    byId("stretchButton").setAttribute("aria-pressed", String(screen === "stretch"));

    byId("message").textContent = "";
    byId("dateLabel").textContent = "";
    byId("stats").textContent = "";

    byId("pageTitle").textContent = {
        today: "今日のトレーニング",
        history: "トレーニング履歴",
        historyDetail: "トレーニング詳細",
        stretch: "ストレッチ一覧"
    }[screen];

    if (workout) {
        selectedPart = "";
        view = "front";

        if (screen === "today") {
            renderExerciseOptions(byId("exerciseSelect").value);
            updatePreviousRecord();
        }

        renderWorkout();
    } else if (screen === "history") {
        renderHistory();
    } else {
        renderRoutine();
    }
}

function selectPart(id) {
    selectedPart = id;

    if (id) {
        view = parts[id].view;
    }

    if (screen === "today") {
        const previous = byId("exerciseSelect").value;

        byId("customPart").value = id;
        renderExerciseOptions(previous, Boolean(id));

        if (previous !== byId("exerciseSelect").value) {
            updateExerciseForm();
        }
    }

    renderWorkout();
}

function changeView(next) {
    view = next;

    if (selectedPart && parts[selectedPart].view !== next) {
        selectPart("");
        return;
    }

    renderWorkout();
}

function pauseMovement() {
    if (animationFrame !== null) {
        cancelAnimationFrame(animationFrame);
    }

    animationFrame = null;
    lastFrameTime = null;

    byId("playButton").textContent = elapsed > 0 ? "再開" : "動きを再生";
}

function drawMovement() {
    const guide = Warmup.guides[activeGuideId];

    if (!guide) {
        return;
    }

    const cycle = elapsed % 4800;
    let progress = 0;
    let phase = "準備";

    if (cycle >= 700 && cycle < 2200) {
        const fraction = (cycle - 700) / 1500;

        progress = (1 - Math.cos(fraction * Math.PI)) / 2;
        phase = "動かす";
    } else if (cycle >= 2200 && cycle < 2800) {
        progress = 1;
        phase = "動作の終点";
    } else if (cycle >= 2800 && cycle < 4300) {
        const fraction = (cycle - 2800) / 1500;

        progress = (1 + Math.cos(fraction * Math.PI)) / 2;
        phase = "戻す";
    }

    if (activeGuideId === "shoulderRoll" && cycle >= 700 && cycle < 4300) {
        progress = (cycle - 700) / 3600;
        phase = "肩を回す";
    }

    byId("movementPhase").textContent = phase;
    Warmup.draw(byId("movementCanvas"), guide, progress);
}

function resetMovement() {
    elapsed = 0;
    pauseMovement();
    drawMovement();
}

function animateMovement(time) {
    if (lastFrameTime !== null) {
        const speed = Number(byId("speedSelect").value);

        elapsed += Math.min(time - lastFrameTime, 100) * speed;
    }

    lastFrameTime = time;

    drawMovement();

    animationFrame = requestAnimationFrame(animateMovement);
}

function toggleMovement() {
    if (animationFrame !== null) {
        pauseMovement();
        return;
    }

    if (!activeGuideId || screen !== "stretch") {
        return;
    }

    byId("playButton").textContent = "一時停止";
    animationFrame = requestAnimationFrame(animateMovement);
}

function selectMovement(id) {
    const guide = Warmup.guides[id];

    activeGuideId = id;

    byId("movementName").textContent = guide.name;
    byId("movementEquipment").textContent = guide.equipment;
    byId("movementCanvas").setAttribute("aria-label", `${guide.name}の動作図`);

    const steps = byId("movementSteps");

    steps.replaceChildren();

    for (const step of guide.steps) {
        appendText(steps, "li", step);
    }

    const source = byId("movementSource");

    source.href = guide.url;
    source.textContent = `参考資料 · ${guide.source}`;

    for (const button of byId("routineList").querySelectorAll("button")) {
        button.setAttribute("aria-pressed", String(button.dataset.guide === id));
    }

    resetMovement();
}

function renderRoutine() {
    const routine = Warmup.routines[byId("routineSelect").value];
    const list = byId("routineList");

    byId("routineTitle").textContent = `${routine.name}のルーティン`;
    byId("routineNote").textContent = routine.note;

    list.replaceChildren();

    for (const [id, amount] of routine.items) {
        const item = appendText(list, "li", "");
        const guide = Warmup.guides[id];

        const button = appendButton(item, guide.name, () => {
            selectMovement(id);
        });

        button.dataset.guide = id;
        appendText(button, "small", `${guide.equipment} · ${amount}`);
    }

    selectMovement(routine.items[0][0]);
}

function openPartRoutine() {
    const match = Object.entries(Warmup.routines).find(([, routine]) => {
        return routine.parts.includes(selectedPart);
    });

    if (match) {
        byId("routineSelect").value = match[0];
    }

    switchScreen("stretch");
}

function bindEvents() {
    byId("todayButton").addEventListener("click", () => switchScreen("today"));
    byId("historyButton").addEventListener("click", () => switchScreen("history"));
    byId("stretchButton").addEventListener("click", () => switchScreen("stretch"));

    byId("frontButton").addEventListener("click", () => changeView("front"));
    byId("backButton").addEventListener("click", () => changeView("back"));

    const canvas = byId("bodyCanvas");

    canvas.addEventListener("pointermove", showMuscleTooltip);
    canvas.addEventListener("pointerleave", hideMuscleTooltip);

    canvas.addEventListener("click", (event) => {
        const id = MuscleMap.hit(canvas, event, view);

        if (id) {
            selectPart(id);
        }
    });

    byId("partSelect").addEventListener("change", (event) => {
        selectPart(event.target.value);
    });

    byId("partStretchButton").addEventListener("click", openPartRoutine);
    byId("clearFilterButton").addEventListener("click", () => selectPart(""));
    byId("exerciseSelect").addEventListener("change", updateExerciseForm);

    byId("addSetButton").addEventListener("click", () => {
        addSetRow(byId("setRows"));
    });

    byId("copyButton").addEventListener("click", () => {
        fillSetRows(byId("setRows"), previousSets);
    });

    byId("recordForm").addEventListener("submit", saveRecord);
    byId("customForm").addEventListener("submit", addCustomExercise);

    const dialog = byId("editDialog");

    byId("closeEditButton").addEventListener("click", () => dialog.close());

    dialog.addEventListener("close", () => {
        editing = null;
    });

    byId("editExercise").addEventListener("change", () => {
        byId("editParts").textContent = describeExercise(getEditExercise());
    });

    byId("editAddSetButton").addEventListener("click", () => {
        addSetRow(byId("editRows"));
    });

    byId("editForm").addEventListener("submit", saveEdit);

    byId("deleteRecordButton").addEventListener("click", () => {
        commitEdit(null);
    });

    byId("routineSelect").addEventListener("change", renderRoutine);
    byId("playButton").addEventListener("click", toggleMovement);
    byId("resetButton").addEventListener("click", resetMovement);

    document.addEventListener("visibilitychange", () => {
        if (document.hidden && animationFrame !== null) {
            pauseMovement();
        }
    });
}

async function start() {
    try {
        exercises = [...await loadExercises(), ...readArray(CUSTOM_KEY)];
        records = readArray(RECORD_KEY);

        fillPartSelect(byId("partSelect"));
        fillPartSelect(byId("customPart"));

        for (const [id, routine] of Object.entries(Warmup.routines)) {
            byId("routineSelect").append(option(id, routine.name));
        }

        renderExerciseOptions();
        updateExerciseForm();
        bindEvents();
        switchScreen("today");
    } catch (error) {
        byId("message").textContent =
            `起動できませんでした。Live Serverで開いてください。 ${error.message}`;
    }
}

start();