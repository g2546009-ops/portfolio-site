const RECORD_KEY = "muscle-log-records-v1";
const CUSTOM_KEY = "muscle-log-custom-exercises-v1";

const parts = MuscleMap.parts;
const weekdays = ["月", "火", "水", "木", "金", "土", "日"];

const weekGroups = {
    chest: ["胸", ["upperChest", "chest"]],
    shoulders: ["肩", ["frontShoulder", "sideShoulder", "rearShoulder"]],
    biceps: ["二頭筋", ["biceps"]],
    core: ["体幹", ["abs", "obliques"]],
    quads: ["前太もも", ["quads", "adductors"]],
    back: ["背中", ["upperTraps", "upperBack", "lowerTraps", "lats", "erectors"]],
    triceps: ["三頭筋", ["triceps"]],
    forearms: ["前腕", ["forearms", "forearmExtensors"]],
    glutes: ["お尻", ["glutes", "gluteMedius"]],
    hamstrings: ["裏太もも", ["hamstrings"]],
    calves: ["下腿", ["calves", "soleus", "shins"]]
};

let exercises = [];
let records = [];
let screen = "today";
let activeDate = "";
let view = "front";
let selectedPart = "";
let todayCounts = new Map();
let previousSets = [];
let editing = null;

let weekOffset = 0;
let weekSelection = { label: "", ids: [] };

let guideId = "";
let frame = null;
let elapsed = 0;
let lastFrame = null;

function byId(id) {
    return document.getElementById(id);
}

function append(parent, tag, text = "", className = "") {
    const element = document.createElement(tag);

    element.textContent = text;
    element.className = className;
    parent.append(element);

    return element;
}

function button(parent, label, handler) {
    const element = append(parent, "button", label);

    element.type = "button";
    element.addEventListener("click", handler);

    return element;
}

function option(parent, value, label) {
    const element = append(parent, "option", label);

    element.value = value;

    return element;
}

function dateKey(date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");

    return `${year}-${month}-${day}`;
}

function todayKey() {
    return dateKey(new Date());
}

function weekDates(offset) {
    const monday = new Date();
    const daysSinceMonday = (monday.getDay() + 6) % 7;

    monday.setHours(12, 0, 0, 0);
    monday.setDate(monday.getDate() - daysSinceMonday + 7 * offset);

    return weekdays.map((weekday, index) => {
        const date = new Date(monday);

        date.setDate(monday.getDate() + index);

        return {
            key: dateKey(date),
            short: `${date.getMonth() + 1}/${date.getDate()}`,
            weekday
        };
    });
}

function readArray(key) {
    const value = JSON.parse(localStorage.getItem(key) ?? "[]");

    if (!Array.isArray(value)) {
        throw new Error("保存データの形式が正しくありません。");
    }

    return value;
}

function writeRecords(nextRecords) {
    localStorage.setItem(RECORD_KEY, JSON.stringify(nextRecords));
    records = nextRecords;
}

function exerciseById(id) {
    return exercises.find((exercise) => exercise.id === id);
}

function entriesFor(date) {
    const entries = new Map();

    for (const record of records) {
        if (record.date !== date) {
            continue;
        }

        if (!entries.has(record.exerciseId)) {
            entries.set(record.exerciseId, {
                ...record,
                sets: []
            });
        }

        entries.get(record.exerciseId).sets.push(...record.sets);
    }

    return [...entries.values()];
}

function formatSet(set) {
    return set.weight == null
        ? `${set.reps}回`
        : `${set.weight} kg × ${set.reps}回`;
}

function describeExercise(exercise) {
    const names = exercise.main.map((id) => parts[id]?.name ?? id);
    const support = (exercise.secondary ?? []).map((id) => parts[id]?.name ?? id);

    return `主に狙う部位 · ${names.join("・")}` +
        (support.length ? ` ／ 補助 · ${support.join("・")}` : "");
}

function fillParts(select) {
    option(select, "", "部位を選ぶ");

    for (const side of ["front", "back"]) {
        const group = append(select, "optgroup");

        group.label = side === "front" ? "前面" : "背面";

        for (const part of Object.values(parts)) {
            if (part.view === side) {
                option(group, part.id, part.name);
            }
        }
    }
}

function addExerciseGroup(select, label, items) {
    if (items.length === 0) {
        return;
    }

    const group = append(select, "optgroup");

    group.label = label;

    for (const exercise of items) {
        option(group, exercise.id, exercise.name);
    }
}

function renderExerciseOptions(preferred = "", autoSelect = false) {
    const select = byId("exercise");
    const recommended = exercises.filter((item) => item.main.includes(selectedPart));
    const others = exercises.filter((item) => !item.main.includes(selectedPart));

    select.replaceChildren();
    option(select, "", "種目を選ぶ");

    addExerciseGroup(select, "この部位のおすすめ", recommended);
    addExerciseGroup(select, selectedPart ? "その他の種目" : "全種目", others);

    select.value = exerciseById(preferred)
        ? preferred
        : autoSelect ? recommended[0]?.id ?? "" : "";
}

function numberRows(list) {
    const rows = [...list.children];

    for (const [index, row] of rows.entries()) {
        const number = index + 1;

        row.firstElementChild.textContent = number;
        row.querySelector(".weight").setAttribute("aria-label", `セット${number}の重量（kg）`);
        row.querySelector(".reps").setAttribute("aria-label", `セット${number}の回数`);
        row.lastElementChild.setAttribute("aria-label", `セット${number}を削除`);
        row.lastElementChild.disabled = rows.length === 1;
    }
}

function addRow(list, set = {}) {
    const row = append(list, "div", "", "set-grid");

    append(row, "span");

    const weight = append(row, "input", "", "weight");

    weight.type = "number";
    weight.min = "0";
    weight.step = "any";
    weight.value = set.weight ?? "";

    const reps = append(row, "input", "", "reps");

    reps.type = "number";
    reps.min = "1";
    reps.step = "1";
    reps.required = true;
    reps.value = set.reps ?? "";

    button(row, "×", () => {
        row.remove();
        numberRows(list);
    });

    numberRows(list);
}

function fillRows(list, sets) {
    list.replaceChildren();

    for (const set of sets) {
        addRow(list, set);
    }
}

function readRows(list) {
    return [...list.children].map((row) => {
        const weight = row.querySelector(".weight");
        const reps = row.querySelector(".reps");

        return {
            weight: weight.value === "" ? null : weight.valueAsNumber,
            reps: reps.valueAsNumber
        };
    });
}

function updatePrevious() {
    const id = byId("exercise").value;

    const date = records
        .filter((record) => record.exerciseId === id && record.date < todayKey())
        .map((record) => record.date)
        .sort()
        .pop();

    previousSets = date
        ? entriesFor(date).find((entry) => entry.exerciseId === id).sets
        : [];

    byId("previous").textContent = date
        ? `前回 ${date.replaceAll("-", "/")} · ${previousSets.map(formatSet).join(" / ")}`
        : "前回の記録はありません。";

    byId("copy").hidden = previousSets.length === 0;
}

function resetRecordForm() {
    const exercise = exerciseById(byId("exercise").value);

    byId("set-fields").hidden = !exercise;
    byId("exercise-parts").textContent = exercise ? describeExercise(exercise) : "";

    fillRows(byId("sets"), exercise ? [{}] : []);
    updatePrevious();
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

    const exercise = exerciseById(byId("exercise").value);

    if (screen !== "today" || !exercise) {
        return;
    }

    const sets = readRows(byId("sets"));

    try {
        writeRecords([
            ...readArray(RECORD_KEY),
            makeRecord(todayKey(), exercise, sets)
        ]);
    } catch {
        byId("message").textContent = "記録を保存できませんでした。";
        return;
    }

    byId("message").textContent = `${exercise.name}を${sets.length}セット記録しました。`;

    resetRecordForm();
    renderWorkout();
}

function addCustom(event) {
    event.preventDefault();

    const name = byId("custom-name").value.trim();
    const part = byId("custom-part").value;

    if (screen !== "today" || !name || !Object.hasOwn(parts, part)) {
        byId("message").textContent = "種目名と部位を入力してください。";
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

        if (!exerciseById(exercise.id)) {
            exercises.push(exercise);
        }

        const previous = byId("exercise").value;

        renderExerciseOptions(exercise.id);

        if (previous !== exercise.id) {
            resetRecordForm();
        }

        byId("custom-name").value = "";
        byId("custom-details").open = false;
        byId("message").textContent = `「${name}」を選択しました。`;
    } catch {
        byId("message").textContent = "種目を追加できませんでした。";
    }
}

function isEditRecord(record, date, id) {
    return record.date === date && record.exerciseId === id;
}

function openEdit(date, entry) {
    try {
        const latest = readArray(RECORD_KEY);
        const batch = latest.filter((record) => isEditRecord(record, date, entry.exerciseId));

        if (batch.length === 0) {
            records = latest;
            renderWorkout();
            byId("message").textContent = "この記録はすでに変更されています。";
            return;
        }

        const original = {
            id: entry.exerciseId,
            name: batch[0].name,
            main: batch[0].main
        };

        editing = {
            date,
            original,
            snapshot: JSON.stringify(batch)
        };

        const select = byId("edit-exercise");

        select.replaceChildren();
        option(select, original.id, original.name);

        addExerciseGroup(
            select,
            "変更先の種目",
            exercises.filter((item) => item.id !== original.id)
        );

        byId("edit-date").textContent = date.replaceAll("-", "/");
        byId("edit-message").textContent = "";
        byId("delete-details").open = false;

        fillRows(byId("edit-sets"), batch.flatMap((record) => record.sets));
        byId("edit-dialog").showModal();
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
        const matches = (record) => isEditRecord(record, editing.date, editing.original.id);
        const current = latest.filter(matches);

        if (JSON.stringify(current) !== editing.snapshot) {
            byId("edit-message").textContent =
                "別の画面で記録が変更されました。閉じてから開き直してください。";
            return;
        }

        const next = [];
        let inserted = false;

        for (const record of latest) {
            if (!matches(record)) {
                next.push(record);
            } else if (replacement && !inserted) {
                next.push(replacement);
                inserted = true;
            }
        }

        writeRecords(next);
    } catch {
        byId("edit-message").textContent = "変更を保存できませんでした。";
        return;
    }

    byId("edit-dialog").close();

    updatePrevious();
    renderWorkout();

    byId("message").textContent = replacement
        ? "記録を更新しました。"
        : "記録を削除しました。";
}

function saveEdit(event) {
    event.preventDefault();

    if (!editing) {
        return;
    }

    const id = byId("edit-exercise").value;
    const exercise = id === editing.original.id ? editing.original : exerciseById(id);
    const sets = readRows(byId("edit-sets"));

    if (exercise && sets.length > 0) {
        commitEdit(makeRecord(editing.date, exercise, sets));
    }
}

function renderLog(date, entries) {
    const list = byId("log");

    list.replaceChildren();

    if (entries.length === 0) {
        append(list, "p", "表示できる記録はありません。", "muted");
    }

    for (const entry of entries) {
        const row = append(list, "article", "", "log-entry");

        append(row, "strong", entry.name);
        append(row, "p", entry.sets.map(formatSet).join("\n"));

        const edit = button(row, "編集", () => openEdit(date, entry));

        edit.setAttribute("aria-label", `${entry.name}の記録を編集`);
    }
}

function openDay(date) {
    activeDate = date;
    switchScreen("detail");
}

function renderHistory() {
    const list = byId("history-list");
    const dates = [...new Set(records.map((record) => record.date))].sort().reverse();

    list.replaceChildren();

    if (dates.length === 0) {
        append(list, "p", "保存したトレーニングがここに表示されます。", "muted");
    }

    for (const date of dates) {
        const entries = entriesFor(date);
        const sets = entries.reduce((sum, entry) => sum + entry.sets.length, 0);

        button(list, `${date.replaceAll("-", "/")}　${entries.length}種目 ／ ${sets}セット`, () => {
            openDay(date);
        });
    }
}

function renderWorkout() {
    byId("tooltip").hidden = true;

    const isToday = screen === "today";
    const date = isToday ? todayKey() : activeDate;
    const entries = entriesFor(date);
    const part = parts[selectedPart];

    todayCounts = new Map();

    for (const entry of entries) {
        for (const id of new Set(entry.main)) {
            todayCounts.set(id, (todayCounts.get(id) ?? 0) + 1);
        }
    }

    byId("date").textContent = date.replaceAll("-", "/");
    byId("front").setAttribute("aria-pressed", String(view === "front"));
    byId("back").setAttribute("aria-pressed", String(view === "back"));
    byId("part").value = selectedPart;

    MuscleMap.draw(byId("body"), view, todayCounts, new Set([selectedPart]));

    byId("part-detail").hidden = !part;
    byId("record-panel").hidden = !isToday;
    byId("weekly").hidden = !isToday;

    const matching = entries.filter((entry) => entry.main.includes(selectedPart));

    if (part) {
        byId("part-name").textContent = part.name;
        byId("part-description").textContent = part.description;
        byId("part-count").textContent = matching.length
            ? `${matching.length}種目 · ${matching.map((entry) => entry.name).join("・")}`
            : "この部位を主に狙った種目は0件です。";
    }

    const filtering = !isToday && Boolean(part);

    byId("log-title").textContent = isToday ? "今日の記録" : "この日の記録";
    byId("clear-filter").hidden = !filtering;

    renderLog(date, filtering ? matching : entries);

    if (isToday) {
        renderWeek();
    }
}

function selectPart(id) {
    selectedPart = id;

    if (id) {
        view = parts[id].view;
    }

    if (screen === "today") {
        const previous = byId("exercise").value;

        byId("custom-part").value = id;

        renderExerciseOptions(previous, Boolean(id));

        if (previous !== byId("exercise").value) {
            resetRecordForm();
        }
    }

    renderWorkout();
}

function changeView(next) {
    view = next;

    if (selectedPart && parts[selectedPart].view !== next) {
        selectPart("");
    } else {
        renderWorkout();
    }
}

function showTooltip(event) {
    const canvas = byId("body");
    const id = MuscleMap.hit(canvas, event, view);
    const tooltip = byId("tooltip");

    tooltip.hidden = !id;

    if (!id) {
        return;
    }

    const stage = canvas.parentElement;
    const bounds = stage.getBoundingClientRect();

    tooltip.textContent = `${parts[id].name} · ${todayCounts.get(id) ?? 0}種目`;

    const x = event.clientX - bounds.left - stage.clientLeft + 12;
    const y = event.clientY - bounds.top - stage.clientTop + 12;

    tooltip.style.left = `${Math.max(6, Math.min(x, stage.clientWidth - tooltip.offsetWidth - 6))}px`;
    tooltip.style.top = `${Math.max(6, Math.min(y, stage.clientHeight - tooltip.offsetHeight - 6))}px`;
}

function renderWeek() {
    const dates = weekDates(weekOffset);
    const datesSet = new Set(dates.map((date) => date.key));
    const batch = records.filter((record) => datesSet.has(record.date));
    const daily = new Map();
    const counts = new Map();

    for (const record of batch) {
        const amount = record.sets.length;

        if (amount === 0) {
            continue;
        }

        daily.set(record.date, (daily.get(record.date) ?? 0) + amount);

        for (const part of new Set(record.main)) {
            counts.set(part, (counts.get(part) ?? 0) + amount);
        }
    }

    const total = [...daily.values()].reduce((sum, amount) => sum + amount, 0);

    byId("week-range").textContent = `${dates[0].short}–${dates[6].short}`;
    byId("week-range").title = `${dates[0].key} ～ ${dates[6].key}`;
    byId("next-week").disabled = weekOffset === 0;
    byId("week-summary").textContent = `${daily.size}日 ／ ${total}セット`;

    const selectedIds = new Set(weekSelection.ids);

    for (const side of ["front", "back"]) {
        MuscleMap.draw(byId(`week-${side}`), side, counts, selectedIds, true);
    }

    renderWeekGroups(byId("week-left"), ["chest", "shoulders", "biceps", "core", "quads"], batch);
    renderWeekGroups(byId("week-right"), ["back", "triceps", "forearms", "glutes", "hamstrings", "calves"], batch);

    const detail = byId("week-detail");

    if (selectedIds.size === 0) {
        detail.textContent = "部位を選ぶと、セット数・トレーニング日数・種目を確認できます。";
    } else {
        const matching = batch.filter((record) => {
            return record.sets.length > 0 && record.main.some((id) => selectedIds.has(id));
        });

        const sets = matching.reduce((sum, record) => sum + record.sets.length, 0);
        const days = new Set(matching.map((record) => record.date)).size;
        const names = [...new Set(matching.map((record) => record.name))];

        const breakdown = weekSelection.ids.length > 1
            ? weekSelection.ids.map((id) => `${parts[id].name} ${counts.get(id) ?? 0}`).join(" ／ ")
            : "";

        detail.replaceChildren();
        append(detail, "strong", `${weekSelection.label} · ${sets}セット · ${days}日`);

        if (breakdown) {
            append(detail, "p", breakdown);
        }

        if (names.length > 0) {
            append(detail, "p", names.join("・"));
        }
    }

    renderWeekBars(dates, daily);
}

function chooseWeekPart(label, ids) {
    weekSelection = { label, ids };
    renderWeek();
}

function renderWeekGroups(parent, keys, batch) {
    parent.replaceChildren();

    for (const key of keys) {
        const [label, ids] = weekGroups[key];

        const total = batch.reduce((sum, record) => {
            const matches = record.main.some((id) => ids.includes(id));

            return sum + (matches ? record.sets.length : 0);
        }, 0);

        const item = button(parent, label, () => {
            chooseWeekPart(label, ids);
            parent.querySelector(`[data-group="${key}"]`)?.focus();
        });

        item.dataset.group = key;
        item.setAttribute("aria-pressed", String(weekSelection.ids === ids));
        append(item, "strong", `${total}セット`);
    }
}

function renderWeekBars(dates, daily) {
    const list = byId("week-bars");
    const max = Math.max(1, ...daily.values());

    list.replaceChildren();

    for (const date of dates) {
        const count = daily.get(date.key) ?? 0;

        const item = button(list, "", () => openDay(date.key));

        item.disabled = count === 0;
        item.setAttribute("aria-label", `${date.short} ${date.weekday}曜日 ${count}セット`);

        append(item, "span", String(count));

        const bar = append(item, "span", "", "bar");

        bar.style.setProperty("--bar-height", `${58 * count / max}px`);
        bar.setAttribute("aria-hidden", "true");

        append(item, "span", date.weekday);
    }
}

function pauseMovement() {
    if (frame !== null) {
        cancelAnimationFrame(frame);
    }

    frame = null;
    lastFrame = null;
    byId("play").textContent = elapsed > 0 ? "再開" : "動きを再生";
}

function drawMovement() {
    const guide = Warmup.guides[guideId];

    if (!guide) {
        return;
    }

    const cycle = elapsed % 4200;
    const phase = Math.max(0, Math.min((cycle - 400) / 3400, 1));

    const progress = guideId === "roll"
        ? phase
        : (1 - Math.cos(phase * Math.PI * 2)) / 2;

    Warmup.draw(byId("movement"), guide, progress);
}

function resetMovement() {
    elapsed = 0;
    pauseMovement();
    drawMovement();
}

function animate(time) {
    if (lastFrame !== null) {
        elapsed += Math.min(time - lastFrame, 100) * Number(byId("speed").value);
    }

    lastFrame = time;

    drawMovement();

    frame = requestAnimationFrame(animate);
}

function toggleMovement() {
    if (frame !== null) {
        pauseMovement();
        return;
    }

    if (screen === "stretch" && guideId) {
        byId("play").textContent = "一時停止";
        frame = requestAnimationFrame(animate);
    }
}

function selectMovement(id) {
    guideId = id;

    const guide = Warmup.guides[id];

    byId("movement-name").textContent = guide.name;
    byId("equipment").textContent = guide.equipment;
    byId("movement").setAttribute("aria-label", `${guide.name}の動作図`);

    byId("steps").replaceChildren();

    for (const step of guide.steps) {
        append(byId("steps"), "li", step);
    }

    byId("source").href = guide.url;
    byId("source").textContent = `参考資料 · ${guide.source}`;

    for (const item of byId("routine-list").querySelectorAll("button")) {
        item.setAttribute("aria-pressed", String(item.dataset.guide === id));
    }

    resetMovement();
}

function renderRoutine() {
    const [, ...items] = Warmup.routines[byId("routine").value];
    const list = byId("routine-list");

    list.replaceChildren();

    for (const [id, amount] of items) {
        const guide = Warmup.guides[id];
        const row = append(list, "li");

        const item = button(row, `${guide.name} · ${amount}`, () => selectMovement(id));

        item.dataset.guide = id;
    }

    selectMovement(items[0][0]);
}

function switchScreen(next) {
    pauseMovement();

    screen = next;

    const workout = screen === "today" || screen === "detail";

    byId("dashboard").hidden = !workout;
    byId("history-list").hidden = screen !== "history";
    byId("stretch-screen").hidden = screen !== "stretch";
    byId("today").setAttribute("aria-pressed", String(screen === "today"));
    byId("history").setAttribute("aria-pressed", String(screen === "history" || screen === "detail"));
    byId("stretch").setAttribute("aria-pressed", String(screen === "stretch"));

    byId("message").textContent = "";
    byId("date").textContent = "";
    byId("title").textContent = {
        today: "今日のトレーニング",
        history: "トレーニング履歴",
        detail: "トレーニング詳細",
        stretch: "ストレッチ一覧"
    }[screen];

    if (workout) {
        selectedPart = "";
        view = "front";

        if (screen === "today") {
            byId("custom-part").value = "";
            renderExerciseOptions(byId("exercise").value);
            updatePrevious();
        }

        renderWorkout();
    } else if (screen === "history") {
        renderHistory();
    } else {
        renderRoutine();
    }
}

function bindEvents() {
    byId("today").addEventListener("click", () => switchScreen("today"));
    byId("history").addEventListener("click", () => switchScreen("history"));
    byId("stretch").addEventListener("click", () => switchScreen("stretch"));

    byId("front").addEventListener("click", () => changeView("front"));
    byId("back").addEventListener("click", () => changeView("back"));
    byId("part").addEventListener("change", (event) => selectPart(event.target.value));
    byId("clear-filter").addEventListener("click", () => selectPart(""));

    const canvas = byId("body");

    canvas.addEventListener("pointermove", showTooltip);
    canvas.addEventListener("pointerleave", () => {
        byId("tooltip").hidden = true;
    });

    canvas.addEventListener("click", (event) => {
        const id = MuscleMap.hit(canvas, event, view);

        if (id) {
            selectPart(id);
        }
    });

    byId("exercise").addEventListener("change", resetRecordForm);
    byId("add-set").addEventListener("click", () => addRow(byId("sets")));
    byId("copy").addEventListener("click", () => fillRows(byId("sets"), previousSets));
    byId("record-form").addEventListener("submit", saveRecord);
    byId("custom-form").addEventListener("submit", addCustom);

    byId("edit-form").addEventListener("submit", saveEdit);
    byId("edit-add").addEventListener("click", () => addRow(byId("edit-sets")));
    byId("delete").addEventListener("click", () => commitEdit(null));

    const dialog = byId("edit-dialog");

    byId("close-edit").addEventListener("click", () => dialog.close());

    dialog.addEventListener("close", () => {
        editing = null;
    });

    byId("prev-week").addEventListener("click", () => {
        weekOffset -= 1;
        renderWeek();
    });

    byId("next-week").addEventListener("click", () => {
        if (weekOffset < 0) {
            weekOffset += 1;
            renderWeek();

            if (weekOffset === 0) {
                byId("prev-week").focus();
            }
        }
    });

    for (const side of ["front", "back"]) {
        const model = byId(`week-${side}`);

        model.addEventListener("click", (event) => {
            const id = MuscleMap.hit(model, event, side);

            if (id) {
                chooseWeekPart(parts[id].name, [id]);
            }
        });
    }

    byId("part-routine").addEventListener("click", () => {
        byId("routine").value = parts[selectedPart].group;
        switchScreen("stretch");
    });

    byId("routine").addEventListener("change", renderRoutine);
    byId("play").addEventListener("click", toggleMovement);
    byId("reset").addEventListener("click", resetMovement);

    document.addEventListener("visibilitychange", () => {
        if (document.hidden && frame !== null) {
            pauseMovement();
        }
    });

    window.addEventListener("storage", (event) => {
        if (event.key !== RECORD_KEY) {
            return;
        }

        try {
            records = readArray(RECORD_KEY);

            updatePrevious();

            if (screen === "history") {
                renderHistory();
            } else if (screen !== "stretch") {
                renderWorkout();
            }
        } catch {
            byId("message").textContent = "別の画面の記録を読み込めませんでした。";
        }
    });
}

async function start() {
    try {
        const response = await fetch("work.csv");

        if (!response.ok) {
            throw new Error("work.csvを読み込めませんでした。");
        }

        const csv = await response.text();
        const builtIn = new Map();

        for (const line of csv.trim().split(/\r?\n/).slice(1)) {
            if (!line.trim()) {
                continue;
            }

            const [id, name, main, secondary] = line.split(",");

            builtIn.set(id, {
                id,
                name,
                main: main.split("|"),
                secondary: secondary ? secondary.split("|") : []
            });
        }

        exercises = [...builtIn.values(), ...readArray(CUSTOM_KEY)];
        records = readArray(RECORD_KEY);

        fillParts(byId("part"));
        fillParts(byId("custom-part"));

        for (const [id, [name]] of Object.entries(Warmup.routines)) {
            option(byId("routine"), id, name);
        }

        renderExerciseOptions();
        resetRecordForm();
        bindEvents();
        switchScreen("today");
    } catch (error) {
        byId("message").textContent = `起動できませんでした。${error.message} Live Serverから開いてください。`;
    }
}

start();