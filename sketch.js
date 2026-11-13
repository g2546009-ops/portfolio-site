const MuscleMap = (() => {
    const width = 320;
    const height = 500;
    const parts = {};

    const palettes = [
        ["#f9fbff", "#c7d5eb", "#5d7294"],
        ["#fff2db", "#ffc58b", "#985139"],
        ["#ffdaa5", "#f3893e", "#8a3925"],
        ["#ffb4ae", "#e74f46", "#681f33"]
    ];

    function addPart(id, view, name, description, outline, light) {
        parts[id] = {
            id,
            view,
            name,
            description,
            shape: new Path2D(outline),
            light
        };
    }

    addPart(
        "frontShoulder", "front", "三角筋前部",
        "肩の前側。腕を前に上げる動きに関わる。",
        "M104 106 Q119 99 126 108 L108 144 Q98 128 104 106Z",
        [112, 115, 30]
    );

    addPart(
        "sideShoulder", "front", "三角筋中部",
        "肩の外側。腕を横に上げる動きに関わる。",
        "M103 106 Q80 110 75 142 L96 149 Q104 132 103 106Z",
        [89, 125, 31]
    );

    addPart(
        "upperChest", "front", "大胸筋 上部",
        "鎖骨側の胸。腕を斜め前に押し上げる動きに関わる。",
        "M158 113 Q143 104 126 108 L112 133 Q138 121 158 129Z",
        [138, 114, 33]
    );

    addPart(
        "chest", "front", "大胸筋 中央・下部",
        "胸の中央から下側。腕を身体の前へ寄せる動きに関わる。",
        "M158 130 Q137 122 112 135 L108 150 Q128 169 158 150Z",
        [135, 139, 34]
    );

    addPart(
        "biceps", "front", "上腕二頭筋",
        "二の腕の前側。肘を曲げる動きに関わる。",
        "M76 146 L96 153 Q101 180 79 197 Q65 190 76 146Z",
        [82, 165, 38]
    );

    addPart(
        "forearms", "front", "前腕屈筋群",
        "手首や指を曲げる動きに関わる。",
        "M67 192 Q80 199 81 206 L61 252 L48 249 Q52 211 67 192Z",
        [64, 217, 42]
    );

    addPart(
        "abs", "front", "腹直筋",
        "お腹の正面。上体を丸める動きに関わる。",
        "M158 155 Q147 160 136 158 L135 184 Q146 190 158 185Z " +
        "M158 188 Q146 193 135 188 L137 213 Q148 218 158 214Z " +
        "M158 217 Q147 220 138 217 Q140 249 158 259Z",
        [148, 193, 73]
    );

    addPart(
        "obliques", "front", "腹斜筋",
        "脇腹。体幹をひねったり横に曲げたりする動きに関わる。",
        "M109 154 L133 161 Q129 208 142 241 L118 232 Q120 195 109 154Z",
        [124, 188, 60]
    );

    addPart(
        "adductors", "front", "内転筋群",
        "太ももの内側。脚を身体の中心へ寄せる動きに関わる。",
        "M154 266 L158 279 Q155 321 144 350 L139 322Z",
        [151, 296, 57]
    );

    addPart(
        "quads", "front", "大腿四頭筋",
        "太ももの前側。膝を伸ばす動きに関わる。",
        "M117 244 Q136 251 151 270 L137 323 Q139 351 128 369 " +
        "Q104 350 105 301 Q103 265 117 244Z",
        [121, 283, 82]
    );

    addPart(
        "shins", "front", "前脛骨筋",
        "すねの前側。つま先を上げる動きに関わる。",
        "M118 384 Q129 395 138 386 Q137 422 126 451 L120 446Z",
        [126, 408, 48]
    );

    addPart(
        "upperTraps", "back", "僧帽筋 上部",
        "首の付け根から肩。肩甲骨を引き上げる動きに関わる。",
        "M158 87 L158 129 Q139 118 116 111 Q146 100 158 87Z",
        [145, 106, 33]
    );

    addPart(
        "upperBack", "back", "肩甲骨の間",
        "僧帽筋中部や菱形筋がある範囲。肩甲骨を寄せる動きに関わる。",
        "M158 132 Q141 120 114 114 L111 137 Q128 152 158 158Z",
        [134, 134, 34]
    );

    addPart(
        "lowerTraps", "back", "僧帽筋 下部",
        "背中の中央を斜めに走り、肩甲骨の動きに関わる。",
        "M157 161 Q140 156 123 150 L155 198 L158 193Z",
        [147, 168, 34]
    );

    addPart(
        "rearShoulder", "back", "三角筋後部",
        "肩の後ろ側。腕を後ろや外へ動かすときに関わる。",
        "M112 111 Q83 103 75 139 Q88 149 108 140Z",
        [91, 124, 33]
    );

    addPart(
        "triceps", "back", "上腕三頭筋",
        "二の腕の裏側。肘を伸ばす動きに関わる。",
        "M75 143 Q85 151 104 144 Q97 175 79 199 L65 192Z",
        [83, 164, 41]
    );

    addPart(
        "forearmExtensors", "back", "前腕伸筋群",
        "前腕の背面側。手首や指を伸ばす動きに関わる。",
        "M66 195 L79 203 L61 250 L48 247 Q53 218 66 195Z",
        [63, 216, 40]
    );

    addPart(
        "lats", "back", "広背筋",
        "背中の外側。上腕を身体へ引き寄せる動きに関わる。",
        "M106 145 L121 150 L150 198 L145 220 Q121 215 111 177Z",
        [124, 172, 52]
    );

    addPart(
        "erectors", "back", "脊柱起立筋群",
        "背骨の両側。背中を伸ばしたり姿勢を支えたりする。",
        "M157 199 L150 205 Q143 226 145 247 L156 241Z",
        [152, 219, 33]
    );

    addPart(
        "gluteMedius", "back", "中臀筋",
        "お尻の外上側。脚を横に動かし、骨盤を支える。",
        "M118 226 L143 232 L144 242 Q128 243 110 256Z",
        [126, 236, 28]
    );

    addPart(
        "glutes", "back", "大臀筋",
        "お尻の大きな筋肉。股関節を伸ばす動きに関わる。",
        "M111 260 Q131 240 157 245 L156 272 Q132 291 111 273Z",
        [133, 258, 35]
    );

    addPart(
        "hamstrings", "back", "ハムストリングス",
        "太ももの裏側。膝を曲げる動きなどに関わる。",
        "M109 277 Q132 290 155 276 Q154 327 135 369 Q108 353 109 277Z",
        [130, 306, 66]
    );

    addPart(
        "calves", "back", "腓腹筋",
        "ふくらはぎの表層。かかとを上げる動きに関わる。",
        "M119 379 Q133 388 145 376 Q146 408 129 425 Q113 419 119 379Z",
        [130, 397, 34]
    );

    addPart(
        "soleus", "back", "ヒラメ筋の目安",
        "腓腹筋の深層にある筋肉。図では下側を目印にしている。",
        "M117 414 Q123 428 130 428 L125 450 L117 445Z",
        [122, 430, 26]
    );

    const regions = Object.values(parts);

    const silhouette = new Path2D(
        "M160 84 Q145 101 112 106 Q81 102 74 137 L62 191 " +
        "Q53 212 46 245 L43 260 Q44 274 58 267 L72 252 " +
        "L87 205 L106 159 Q120 208 113 232 Q101 253 101 285 " +
        "Q102 332 116 374 Q108 402 115 440 L110 463 " +
        "Q99 475 109 482 L131 479 Q139 475 132 463 " +
        "L143 403 L147 373 L160 285Z"
    );

    const head = new Path2D(
        "M134 49 Q135 19 160 17 Q185 19 186 49 " +
        "Q185 72 169 85 L169 98 L151 98 L151 85 Q135 72 134 49Z"
    );

    function drawFibers(context, shape) {
        context.save();
        context.clip(shape);
        context.strokeStyle = "rgba(255, 255, 255, 0.14)";
        context.lineWidth = 0.45;

        for (let x = -190; x <= 160; x += 5) {
            context.beginPath();
            context.moveTo(x, 95);
            context.quadraticCurveTo(x + 55, 250, x + 110, 480);
            context.stroke();
        }

        context.restore();
    }

    function drawHalf(context, view, counts, selected) {
        const base = context.createLinearGradient(45, 140, 160, 140);

        base.addColorStop(0, "#6fa9ff");
        base.addColorStop(0.18, "#b3c9ec");
        base.addColorStop(0.48, "#f0f5ff");
        base.addColorStop(1, "#798eac");

        context.fillStyle = base;
        context.fill(silhouette);

        for (const part of regions) {
            if (part.view !== view) {
                continue;
            }

            const level = Math.min(counts.get(part.id) ?? 0, 3);
            const [highlight, middle, shadow] = palettes[level];
            const [x, y, radius] = part.light;
            const light = context.createRadialGradient(x, y, 0, x, y, radius);

            light.addColorStop(0, highlight);
            light.addColorStop(0.48, middle);
            light.addColorStop(1, shadow);

            context.fillStyle = light;
            context.fill(part.shape);
            drawFibers(context, part.shape);

            context.strokeStyle = "rgba(23, 39, 70, 0.3)";
            context.lineWidth = 0.7;
            context.stroke(part.shape);
        }

        if (parts[selected]?.view === view) {
            context.strokeStyle = "#285685";
            context.lineWidth = 2.2;
            context.stroke(parts[selected].shape);
        }
    }

    function draw(canvas, view, counts, selected) {
        const context = canvas.getContext("2d");

        context.setTransform(
            canvas.width / width,
            0,
            0,
            canvas.height / height,
            0,
            0
        );

        context.clearRect(0, 0, width, height);
        drawHalf(context, view, counts, selected);

        context.save();
        context.translate(width, 0);
        context.scale(-1, 1);
        drawHalf(context, view, counts, selected);
        context.restore();

        const light = context.createLinearGradient(133, 37, 188, 65);

        light.addColorStop(0, "#789bd1");
        light.addColorStop(0.5, "#f4f7ff");
        light.addColorStop(1, "#5c8dde");

        context.fillStyle = light;
        context.fill(head);
    }

    function hit(canvas, event, view) {
        const bounds = canvas.getBoundingClientRect();
        const rawX = (event.clientX - bounds.left) * width / bounds.width;
        const x = Math.min(rawX, width - rawX);
        const y = (event.clientY - bounds.top) * height / bounds.height;
        const context = canvas.getContext("2d");

        context.save();
        context.resetTransform();

        let id = "";

        for (let index = regions.length - 1; index >= 0; index -= 1) {
            const part = regions[index];

            if (part.view === view && context.isPointInPath(part.shape, x, y)) {
                id = part.id;
                break;
            }
        }

        context.restore();

        return id;
    }

    return {
        parts,
        draw,
        hit
    };
})();

const Warmup = (() => {
    const nhsWarmup = "https://www.nhs.uk/live-well/exercise/how-to-warm-up-before-exercising/";
    const nhsSitting = "https://www.nhs.uk/live-well/exercise/sitting-exercises/";
    const ucsfRoller = "https://sportsrehab.ucsf.edu/sites/g/files/tkssra10961/files/doc/Foam_Rolling_Protocol_Nov2025.pdf";

    const skin = ["#edc3a6", "#a87562"];
    const shirt = ["#849bb3", "#405b76"];
    const pants = ["#5b738f", "#263b54"];
    const blue = ["#75b8e9", "#246599"];
    const shoes = ["#fafbfc", "#98a9ba"];

    const guides = {
        chestOpen: {
            name: "椅子に座って胸を開く",
            equipment: "安定した椅子",
            source: "NHS · Sitting exercises",
            url: nhsSitting,
            steps: [
                "椅子に浅く座り、足裏を床につけて背筋を伸ばす。",
                "肩を軽く下げ、腕を斜め下に開いて胸を前へ出す。",
                "胸が軽く伸びる位置から、ゆっくり元の姿勢へ戻す。図では短い反復で示す。"
            ],
            pose(t) {
                const angle = 0.18 + 0.83 * t;

                return {
                    head: [240, 75],
                    shoulder: [240, 108],
                    hip: [240, 163],
                    legs: seatedLegs(),
                    arms: [
                        ...arm([215, 108], -angle, -angle, true),
                        ...arm([265, 108], angle, angle, true)
                    ],
                    props: [
                        [194, 173, 92, 7],
                        [202, 180, 6, 56],
                        [274, 180, 6, 56]
                    ]
                };
            }
        },

        shoulderRoll: {
            name: "肩回し",
            equipment: "器具なし",
            source: "NHS · How to warm up before exercising",
            url: nhsWarmup,
            steps: [
                "背筋を伸ばして立ち、腕を体の横で楽に垂らす。",
                "肩をゆっくり前に5回、続いて後ろに5回回す。",
                "肘で大きな円を描かず、肩を動かす。図は片方向を横から見た例。"
            ],
            pose(t) {
                const angle = t * Math.PI * 2;
                const shoulder = [
                    241 + 7 * Math.sin(angle),
                    102 + 7 * Math.cos(angle)
                ];

                return {
                    ...standingPose(shoulder, [236, 153]),
                    head: [239, 65],
                    arms: arm(shoulder, 0.05, 0.03, true),
                    marker: shoulder
                };
            }
        },

        pendulum: {
            name: "肩の振り子運動",
            equipment: "安定した台",
            source: "AAOS · Rotator Cuff and Shoulder Conditioning Program",
            url: "https://orthoinfo.aaos.org/globalassets/pdfs/2024-rotator-cuff-and-shoulder-conditioning-program.pdf",
            steps: [
                "安定した台に片手をつき、膝を緩めて上体を前へ傾ける。",
                "反対の腕を垂らし、力を抜いて前後へ小さく揺らす。",
                "背中を丸めず、反対側も行う。図では前後の動きを示す。"
            ],
            pose(t) {
                const angle = (t - 0.5) * 0.55;
                const shoulder = [269, 104];
                const hip = [211, 147];

                return {
                    ...standingPose(shoulder, hip),
                    head: [294, 85],
                    arms: [
                        [[272, 105], [299, 127], 9, 7, shirt],
                        [[299, 127], [331, 142], 7, 5, skin],
                        ...arm(shoulder, angle, angle, true)
                    ],
                    props: [
                        [321, 147, 69, 8],
                        [381, 155, 7, 82]
                    ]
                };
            }
        },

        elbow: {
            name: "肘の曲げ伸ばし",
            equipment: "器具なし",
            source: "Leeds Teaching Hospitals · Elbow exercises",
            url: "https://www.leedsth.nhs.uk/patients/resources/elbow-exercises/",
            steps: [
                "上腕を体の横に置き、肩の力を抜く。",
                "重りを持たずに肘を曲げ、手を肩へ近づける。",
                "上腕の位置を保ち、肘をゆっくり伸ばす。"
            ],
            pose(t) {
                const shoulder = [242, 101];

                return {
                    ...standingPose(shoulder, [235, 155]),
                    arms: arm(shoulder, 0.08, 0.13 + 2.3 * t, true)
                };
            }
        },

        wrist: {
            name: "手首の曲げ伸ばし",
            equipment: "安定した台",
            source: "Royal United Hospitals Bath · Wrist Exercises",
            url: "https://www.ruh.nhs.uk/patients/patient_information/HTH024_Wrist_Exercises.pdf",
            steps: [
                "前腕を台に置き、手を台の端から出す。",
                "指を楽にして、手首から手をゆっくり上下へ動かす。",
                "前腕を台につけたまま、無理に押し込まずに動かす。"
            ],
            pose(t) {
                const angle = (t - 0.5) * 1.3;
                const wrist = [254, 125];
                const palm = [
                    wrist[0] + 34 * Math.cos(angle),
                    wrist[1] + 34 * Math.sin(angle)
                ];

                const fingers = [
                    wrist[0] + 66 * Math.cos(angle),
                    wrist[1] + 66 * Math.sin(angle)
                ];

                return {
                    arms: [
                        [[123, 125], [173, 125], 18, 16, shirt],
                        [[173, 125], wrist, 16, 9, skin],
                        [wrist, palm, 9, 10, blue],
                        [palm, fingers, 10, 4, blue]
                    ],
                    props: [
                        [102, 141, 152, 8],
                        [116, 149, 7, 87],
                        [238, 149, 7, 87]
                    ]
                };
            }
        },

        rotation: {
            name: "座って上体を左右に回す",
            equipment: "安定した椅子",
            source: "NHS Scotland · Thoracic rotational stretch",
            url: "https://www.rightdecisions.scot.nhs.uk/media/alqcguhk/shoulder-rehabilitation-exercises.pdf",
            steps: [
                "椅子に座って足裏を床につけ、腕を胸の前で組む。",
                "骨盤と膝を正面に保ちながら、胸を片側へゆっくり回す。",
                "正面へ戻り、反対側にも回す。腰を無理にひねらない。"
            ],
            pose(t) {
                const turn = (t - 0.5) * 2;
                const x = 240 + 10 * turn;
                const span = 25 - 8 * Math.abs(turn);

                return {
                    head: [x + 7 * turn, 76],
                    shoulder: [x, 108],
                    hip: [240, 163],
                    torsoWidth: span,
                    legs: seatedLegs(),
                    arms: [
                        [[x - span, 109], [x - 13, 131], 9, 7, shirt],
                        [[x - 13, 131], [x + span, 116], 7, 5, blue],
                        [[x + span, 109], [x + 13, 136], 9, 7, shirt],
                        [[x + 13, 136], [x - span, 120], 7, 5, blue]
                    ],
                    props: [
                        [194, 173, 92, 7],
                        [202, 180, 6, 56],
                        [274, 180, 6, 56]
                    ]
                };
            }
        },

        catCow: {
            name: "キャット＆カウ",
            equipment: "マット",
            source: "Royal Berkshire NHS · Core exercise programme",
            url: "https://www.royalberkshire.nhs.uk/media/qfljlxzd/physio-core-exercise-programme-matplusgynae.pdf",
            steps: [
                "マットの上で四つんばいになり、手を肩の下、膝を股関節の下に置く。",
                "背中をゆっくり丸め、目線をお腹へ向ける。",
                "真ん中を通って、胸を前へ向けながら背中を軽く反らす。"
            ],
            pose(t) {
                const curve = Math.sin((t - 0.5) * Math.PI);
                const shoulder = [278, 145 + 5 * curve];
                const hip = [196, 151 + 4 * curve];

                return {
                    head: [302, 147 + 17 * curve],
                    shoulder,
                    hip,
                    spine: [238, 143 - 42 * curve],
                    profile: true,
                    legs: [
                        [hip, [194, 222], 13, 10, pants],
                        [[194, 222], [145, 225], 10, 5, pants],
                        [[145, 225], [132, 226], 6, 5, shoes]
                    ],
                    arms: [
                        [shoulder, [278, 187], 10, 7, shirt],
                        [[278, 187], [278, 225], 7, 4, skin],
                        [[278, 225], [292, 225], 5, 4, skin]
                    ],
                    props: [[111, 235, 249, 5]]
                };
            }
        },

        kneeBend: {
            name: "浅い膝曲げ",
            equipment: "器具なし",
            source: "NHS · How to warm up before exercising",
            url: nhsWarmup,
            steps: [
                "足を肩幅に開き、両腕を前へ伸ばす。",
                "膝を軽く曲げて、身体を10cm程度まで浅く下げる。",
                "足裏を床につけたまま立ち姿勢に戻る。図は横から見た例。"
            ],
            pose(t) {
                const hip = [230 - 14 * t, 150 + 10 * t];
                const shoulder = [234 - 3 * t, 94 + 10 * t];
                const knee = [234 + 13 * t, 192 + 4 * t];

                return {
                    head: [237 - 2 * t, 61 + 10 * t],
                    shoulder,
                    hip,
                    profile: true,
                    legs: [
                        ...leg([hip[0] - 6, hip[1]], [knee[0] - 6, knee[1]], [222, 232]),
                        ...leg(hip, knee, [231, 232], true)
                    ],
                    arms: arm(shoulder, 1.52, 1.57),
                    marker: knee
                };
            }
        },

        heelTap: {
            name: "かかとタッチ",
            equipment: "器具なし",
            source: "NHS · How to warm up before exercising",
            url: nhsWarmup,
            steps: [
                "軸足の膝を軽く曲げ、片足のかかとを前の床につける。",
                "前足のつま先を上げ、腕を前へ軽く出す。",
                "元に戻して反対の足へ。図は片側の例。"
            ],
            pose(t) {
                const hip = [223, 151];
                const shoulder = [224, 96];
                const ankle = [237 + 36 * t, 232 - 8 * Math.sin(Math.PI * t)];

                return {
                    ...standingPose(shoulder, hip),
                    legs: [
                        ...leg([216, 151], [216, 192], [214, 232]),
                        ...leg([230, 151], [235 + 16 * t, 191 - 5 * t], ankle, true, 14 * t)
                    ],
                    arms: arm(shoulder, 0.4 + 0.75 * t, 1.1 + 0.55 * t)
                };
            }
        },

        calfRoll: {
            name: "ふくらはぎのフォームローリング",
            equipment: "マット・フォームローラー",
            source: "UCSF Sports Medicine · Foam Rolling Protocol",
            url: ucsfRoller,
            steps: [
                "床に座り、伸ばした片脚のふくらはぎの下にローラーを置く。",
                "両手を後ろについて身体を支え、反対の足も床について圧を調整する。",
                "ふくらはぎの筋肉の範囲をゆっくり往復する。膝裏や足首の骨には直接乗せない。"
            ],
            pose(t) {
                const shift = 30 * t;
                const hip = [178 + shift, 191];
                const shoulder = [158 + shift, 136];
                const knee = [249 + shift, 197];
                const ankle = [330 + shift, 200];

                return {
                    head: [149 + shift, 106],
                    shoulder,
                    hip,
                    profile: true,
                    legs: [
                        ...leg(hip, [216 + shift, 168], [244 + shift, 229]),
                        ...leg(hip, knee, ankle, true, 8)
                    ],
                    arms: [
                        [shoulder, [136 + shift, 177], 10, 7, shirt],
                        [[136 + shift, 177], [127 + shift, 229], 7, 4.5, skin],
                        [[127 + shift, 229], [116 + shift, 230], 5, 4, skin]
                    ],
                    props: [[97, 235, 293, 5]],
                    roller: [306, 221, t * Math.PI],
                    marker: [306, 198]
                };
            }
        }
    };

    const routines = {
        chest: {
            name: "胸の日",
            note: "肩を軽く動かしてから、胸を開く動きへ。",
            parts: ["upperChest", "chest"],
            items: [
                ["shoulderRoll", "前・後ろ 各5回"],
                ["chestOpen", "ゆっくり数回"]
            ]
        },

        shoulders: {
            name: "肩の日",
            note: "肩まわりを軽く動かし、腕を上げる前に可動域を確かめる。",
            parts: ["frontShoulder", "sideShoulder", "rearShoulder", "upperTraps"],
            items: [
                ["shoulderRoll", "前・後ろ 各5回"],
                ["pendulum", "左右とも軽く数回"]
            ]
        },

        back: {
            name: "背中の日",
            note: "肩まわりを動かし、上背部と背骨の動きを確かめる。",
            parts: ["lats", "upperBack", "lowerTraps", "erectors"],
            items: [
                ["shoulderRoll", "前・後ろ 各5回"],
                ["rotation", "左右ともゆっくり数回"],
                ["catCow", "マットがあれば追加"]
            ]
        },

        arms: {
            name: "腕の日",
            note: "カールやプッシュダウンの前に、肘と手首を軽く動かす。",
            parts: ["biceps", "triceps", "forearms", "forearmExtensors"],
            items: [
                ["elbow", "左右ともゆっくり数回"],
                ["wrist", "左右ともゆっくり数回"]
            ]
        },

        legs: {
            name: "脚の日",
            note: "足首と膝を軽く動かす。ローラーは必要に応じて追加。",
            parts: ["quads", "hamstrings", "adductors", "gluteMedius", "glutes", "calves", "soleus", "shins"],
            items: [
                ["heelTap", "左右を交互に"],
                ["kneeBend", "浅く10回"],
                ["calfRoll", "任意・ふくらはぎを軽く往復"]
            ]
        },

        core: {
            name: "体幹の日",
            note: "骨盤の位置を意識しながら、上体と背骨を動かす。",
            parts: ["abs", "obliques"],
            items: [
                ["rotation", "左右ともゆっくり数回"],
                ["catCow", "マットの上でゆっくり数回"]
            ]
        }
    };

    function pointFrom(origin, length, angle) {
        return [
            origin[0] + length * Math.sin(angle),
            origin[1] + length * Math.cos(angle)
        ];
    }

    function arm(shoulder, upperAngle, lowerAngle, active = false) {
        const elbow = pointFrom(shoulder, 34, upperAngle);
        const wrist = pointFrom(elbow, 30, lowerAngle);
        const hand = pointFrom(wrist, 9, lowerAngle);

        return [
            [shoulder, elbow, 10, 7, active ? blue : shirt],
            [elbow, wrist, 7, 4.5, active ? blue : skin],
            [wrist, hand, 5, 4, skin]
        ];
    }

    function leg(hip, knee, ankle, active = false, toeLift = 0) {
        const foot = [ankle[0] + 14, ankle[1] + 2 - toeLift];
        const color = active ? blue : pants;

        return [
            [hip, knee, 13, 9, color],
            [knee, ankle, 9, 5.5, color],
            [ankle, foot, 6, 5, shoes]
        ];
    }

    function seatedLegs() {
        return [
            ...leg([230, 163], [207, 172], [208, 232]),
            ...leg([250, 163], [273, 172], [274, 232])
        ];
    }

    function standingPose(shoulder, hip) {
        const [x, y] = hip;

        return {
            head: [shoulder[0] - 2, shoulder[1] - 34],
            shoulder,
            hip,
            profile: true,
            legs: [
                ...leg([x - 7, y], [x - 10, 191], [x - 11, 232]),
                ...leg([x + 7, y], [x + 7, 191], [x + 9, 232])
            ]
        };
    }

    function ellipse(context, x, y, rx, ry, color) {
        context.beginPath();
        context.ellipse(x, y, rx, ry, 0, 0, Math.PI * 2);
        context.fillStyle = color;
        context.fill();
    }

    function drawSegment(context, start, end, firstRadius, lastRadius, colors) {
        const dx = end[0] - start[0];
        const dy = end[1] - start[1];
        const length = Math.hypot(dx, dy);

        context.save();
        context.translate(...start);
        context.rotate(Math.atan2(dy, dx));

        const light = context.createLinearGradient(0, -firstRadius, 0, firstRadius);

        light.addColorStop(0, colors[0]);
        light.addColorStop(1, colors[1]);

        context.fillStyle = light;
        context.beginPath();
        context.moveTo(0, -firstRadius);
        context.bezierCurveTo(
            length * 0.35, -firstRadius,
            length * 0.75, -lastRadius,
            length, -lastRadius
        );
        context.quadraticCurveTo(length + lastRadius, 0, length, lastRadius);
        context.bezierCurveTo(
            length * 0.75, lastRadius,
            length * 0.35, firstRadius,
            0, firstRadius
        );
        context.quadraticCurveTo(-firstRadius, 0, 0, -firstRadius);
        context.fill();
        context.restore();
    }

    function drawTorso(context, pose) {
        const [x, y] = pose.shoulder;
        const [hipX, hipY] = pose.hip;

        if (pose.spine) {
            context.beginPath();
            context.moveTo(hipX, hipY);
            context.quadraticCurveTo(...pose.spine, x, y);
            context.lineWidth = 29;
            context.lineCap = "round";
            context.strokeStyle = shirt[1];
            context.stroke();

            context.lineWidth = 18;
            context.strokeStyle = shirt[0];
            context.stroke();

            return;
        }

        const width = pose.torsoWidth ?? (pose.profile ? 15 : 25);
        const waist = pose.profile ? 12 : 17;
        const light = context.createLinearGradient(x - width, y, x + width, y + 10);

        light.addColorStop(0, shirt[1]);
        light.addColorStop(0.47, shirt[0]);
        light.addColorStop(1, shirt[1]);

        context.fillStyle = light;
        context.beginPath();
        context.moveTo(x - width, y);
        context.quadraticCurveTo(x, y - 23, x + width, y);
        context.quadraticCurveTo(x + width, y + 21, hipX + waist, hipY);
        context.quadraticCurveTo(hipX, hipY + 11, hipX - waist, hipY);
        context.quadraticCurveTo(x - width, y + 21, x - width, y);
        context.fill();
    }

    function drawHead(context, pose) {
        const [x, y] = pose.head;
        const light = context.createLinearGradient(x - 14, y - 10, x + 15, y + 15);

        light.addColorStop(0, "#f2ccb3");
        light.addColorStop(1, "#ac755f");

        ellipse(context, x, y, 14, 18, light);
        ellipse(context, x - 2, y - 11, 13, 8, "#34465d");

        if (pose.profile) {
            ellipse(context, x + 12, y + 2, 4, 4, "#cd9a81");
        }
    }

    function drawRoller(context, roller) {
        const [x, y, angle] = roller;

        ellipse(context, x, y, 14, 14, "#597b85");
        ellipse(context, x, y, 10, 10, "#aac6cb");
        ellipse(context, x, y, 4, 4, "#597b85");

        ellipse(
            context,
            x + 10 * Math.cos(angle),
            y + 10 * Math.sin(angle),
            2,
            2,
            "#325661"
        );
    }

    function draw(canvas, guide, progress) {
        const context = canvas.getContext("2d");
        const pose = guide.pose(progress);

        context.setTransform(canvas.width / 480, 0, 0, canvas.height / 270, 0, 0);
        context.clearRect(0, 0, 480, 270);

        ellipse(context, 240, 241, 146, 7, "rgba(48, 71, 95, 0.13)");

        context.fillStyle = "#8299af";

        for (const rectangle of pose.props ?? []) {
            context.fillRect(...rectangle);
        }

        if (pose.roller) {
            drawRoller(context, pose.roller);
        }

        for (const segment of pose.legs ?? []) {
            drawSegment(context, ...segment);
        }

        if (pose.head) {
            const neck = [pose.head[0], pose.head[1] + 12];

            drawSegment(context, neck, pose.shoulder, 7, 8, skin);
            drawTorso(context, pose);
        }

        for (const segment of pose.arms) {
            drawSegment(context, ...segment);
        }

        if (pose.head) {
            drawHead(context, pose);
        }

        if (pose.marker) {
            ellipse(context, ...pose.marker, 10, 10, "rgba(45, 116, 183, 0.22)");
            ellipse(context, ...pose.marker, 3, 3, "#205b92");
        }
    }

    return {
        guides,
        routines,
        draw
    };
})();