const MuscleMap = (() => {
    const width = 320;
    const height = 500;

    const colors = [
        ["#f4f6fa", "#a7b2c2", "#657286"],
        ["#fff0d8", "#ffc58b", "#aa5c38"],
        ["#ffdbad", "#f3893e", "#8a3925"],
        ["#ffb7ad", "#e74f46", "#681f33"]
    ];

    const parts = {};

    function add(id, view, name, group, description, path, light) {
        parts[id] = {
            id,
            view,
            name,
            group,
            description,
            shape: new Path2D(path),
            light
        };
    }

    // 前面
    add(
        "frontShoulder", "front", "三角筋前部", "shoulder",
        "肩の前側。腕を前に上げる動きに関わる。",
        "M104 106 Q119 99 126 108 L108 144 Q98 128 104 106Z",
        [112, 115, 30]
    );

    add(
        "sideShoulder", "front", "三角筋中部", "shoulder",
        "肩の外側。腕を横に上げる動きに関わる。",
        "M103 106 Q80 110 75 142 L96 149 Q104 132 103 106Z",
        [89, 125, 31]
    );

    add(
        "upperChest", "front", "大胸筋 上部", "chest",
        "鎖骨側の胸。腕を斜め前へ押し上げる動きに関わる。",
        "M158 113 Q143 104 126 108 L112 133 Q138 121 158 129Z",
        [138, 114, 33]
    );

    add(
        "chest", "front", "大胸筋 中央・下部", "chest",
        "胸の中央から下側。腕を身体の前に寄せる動きに関わる。",
        "M158 130 Q137 122 112 135 L108 150 Q128 169 158 150Z",
        [135, 139, 34]
    );

    add(
        "biceps", "front", "上腕二頭筋", "arms",
        "二の腕の前側。肘を曲げる動きに関わる。",
        "M76 146 L96 153 Q101 180 79 197 Q65 190 76 146Z",
        [82, 165, 38]
    );

    add(
        "forearms", "front", "前腕屈筋群", "arms",
        "手首や指を曲げる動きに関わる。",
        "M67 192 Q80 199 81 206 L61 252 L48 249 Q52 211 67 192Z",
        [64, 217, 42]
    );

    add(
        "abs", "front", "腹直筋", "core",
        "お腹の正面。上体を丸める動きに関わる。",
        "M158 155 Q147 160 136 158 L135 184 Q146 190 158 185Z " +
        "M158 188 Q146 193 135 188 L137 213 Q148 218 158 214Z " +
        "M158 217 Q147 220 138 217 Q140 249 158 259Z",
        [148, 193, 73]
    );

    add(
        "obliques", "front", "腹斜筋", "core",
        "脇腹。体幹をひねったり横に曲げたりする動きに関わる。",
        "M109 154 L133 161 Q129 208 142 241 L118 232 Q120 195 109 154Z",
        [124, 188, 60]
    );

    add(
        "adductors", "front", "内転筋群", "legs",
        "太ももの内側。脚を身体の中心へ寄せる動きに関わる。",
        "M154 266 L158 279 Q155 321 144 350 L139 322Z",
        [151, 296, 57]
    );

    add(
        "quads", "front", "大腿四頭筋", "legs",
        "太ももの前側。膝を伸ばす動きに関わる。",
        "M117 244 Q136 251 151 270 L137 323 Q139 351 128 369 " +
        "Q104 350 105 301 Q103 265 117 244Z",
        [121, 283, 82]
    );

    add(
        "shins", "front", "前脛骨筋", "legs",
        "すねの前側。つま先を上げる動きに関わる。",
        "M118 384 Q129 395 138 386 Q137 422 126 451 L120 446Z",
        [126, 408, 48]
    );

    // 背面
    add(
        "upperTraps", "back", "僧帽筋 上部", "shoulder",
        "首の付け根から肩。肩甲骨を引き上げる動きに関わる。",
        "M158 87 L158 129 Q139 118 116 111 Q146 100 158 87Z",
        [145, 106, 33]
    );

    add(
        "upperBack", "back", "肩甲骨の間", "back",
        "僧帽筋中部や菱形筋がある範囲。肩甲骨を寄せる動きに関わる。",
        "M158 132 Q141 120 114 114 L111 137 Q128 152 158 158Z",
        [134, 134, 34]
    );

    add(
        "lowerTraps", "back", "僧帽筋 下部", "back",
        "背中の中央を斜めに走り、肩甲骨の動きに関わる。",
        "M157 161 Q140 156 123 150 L155 198 L158 193Z",
        [147, 168, 34]
    );

    add(
        "rearShoulder", "back", "三角筋後部", "shoulder",
        "肩の後ろ側。腕を後ろや外へ動かすときに関わる。",
        "M112 111 Q83 103 75 139 Q88 149 108 140Z",
        [91, 124, 33]
    );

    add(
        "triceps", "back", "上腕三頭筋", "arms",
        "二の腕の裏側。肘を伸ばす動きに関わる。",
        "M75 143 Q85 151 104 144 Q97 175 79 199 L65 192Z",
        [83, 164, 41]
    );

    add(
        "forearmExtensors", "back", "前腕伸筋群", "arms",
        "前腕の背面側。手首や指を伸ばす動きに関わる。",
        "M66 195 L79 203 L61 250 L48 247 Q53 218 66 195Z",
        [63, 216, 40]
    );

    add(
        "lats", "back", "広背筋", "back",
        "背中の外側。上腕を身体へ引き寄せる動きに関わる。",
        "M106 145 L121 150 L150 198 L145 220 Q121 215 111 177Z",
        [124, 172, 52]
    );

    add(
        "erectors", "back", "脊柱起立筋群", "back",
        "背骨の両側。背中を伸ばしたり姿勢を支えたりする。",
        "M157 199 L150 205 Q143 226 145 247 L156 241Z",
        [152, 219, 33]
    );

    add(
        "gluteMedius", "back", "中臀筋", "legs",
        "お尻の外上側。脚を横に動かし、骨盤を支える。",
        "M118 226 L143 232 L144 242 Q128 243 110 256Z",
        [126, 236, 28]
    );

    add(
        "glutes", "back", "大臀筋", "legs",
        "お尻の大きな筋肉。股関節を伸ばす動きに関わる。",
        "M111 260 Q131 240 157 245 L156 272 Q132 291 111 273Z",
        [133, 258, 35]
    );

    add(
        "hamstrings", "back", "ハムストリングス", "legs",
        "太ももの裏側。膝を曲げる動きなどに関わる。",
        "M109 277 Q132 290 155 276 Q154 327 135 369 Q108 353 109 277Z",
        [130, 306, 66]
    );

    add(
        "calves", "back", "腓腹筋", "legs",
        "ふくらはぎの表層。かかとを上げる動きに関わる。",
        "M119 379 Q133 388 145 376 Q146 408 129 425 Q113 419 119 379Z",
        [130, 397, 34]
    );

    add(
        "soleus", "back", "ヒラメ筋の目安", "legs",
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

    function level(value, weekly) {
        if (!weekly) {
            return Math.min(value, 3);
        }

        if (value >= 8) {
            return 3;
        }

        if (value >= 4) {
            return 2;
        }

        return value > 0 ? 1 : 0;
    }

    function fibers(context, shape) {
        context.save();
        context.clip(shape);
        context.strokeStyle = "#ffffff25";
        context.lineWidth = 0.55;

        for (let x = -190; x <= 160; x += 5) {
            context.beginPath();
            context.moveTo(x, 95);
            context.quadraticCurveTo(x + 55, 250, x + 110, 480);
            context.stroke();
        }

        context.restore();
    }

    function drawHalf(context, view, counts, selected, weekly) {
        const base = context.createLinearGradient(45, 120, 160, 160);

        base.addColorStop(0, "#8a95a4");
        base.addColorStop(0.45, "#e7e9ee");
        base.addColorStop(1, "#747f8e");

        context.fillStyle = base;
        context.fill(silhouette);

        for (const part of regions) {
            if (part.view !== view) {
                continue;
            }

            const count = counts.get(part.id) ?? 0;
            const [highlight, middle, shadow] = colors[level(count, weekly)];
            const [x, y, radius] = part.light;
            const light = context.createRadialGradient(x, y, 0, x, y, radius);

            light.addColorStop(0, highlight);
            light.addColorStop(0.48, middle);
            light.addColorStop(1, shadow);

            context.fillStyle = light;
            context.fill(part.shape);

            fibers(context, part.shape);

            context.strokeStyle = "#31354066";
            context.lineWidth = 0.75;
            context.stroke(part.shape);
        }

        for (const part of regions) {
            if (part.view === view && selected.has(part.id)) {
                context.strokeStyle = weekly ? "#ffe4aa" : "#634b2b";
                context.lineWidth = 2.4;
                context.stroke(part.shape);
            }
        }
    }

    function draw(canvas, view, counts, selected = new Set(), weekly = false) {
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
        drawHalf(context, view, counts, selected, weekly);

        // 左半身を反転して右半身を描く。
        context.save();
        context.translate(width, 0);
        context.scale(-1, 1);
        drawHalf(context, view, counts, selected, weekly);
        context.restore();

        const light = context.createLinearGradient(133, 37, 188, 65);

        light.addColorStop(0, "#8b95a6");
        light.addColorStop(0.45, "#f5f7fc");
        light.addColorStop(1, "#697586");

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
    const nhs = "https://www.nhs.uk/live-well/exercise/how-to-warm-up-before-exercising/";
    const skin = ["#ecc2a5", "#aa725c"];
    const shirt = ["#748597", "#34475a"];
    const pants = ["#53667a", "#26394b"];
    const moving = ["#e1bc79", "#956334"];
    const shoe = ["#f5f2ec", "#a9a49b"];

    function joint(origin, length, angle) {
        return [
            origin[0] + length * Math.sin(angle),
            origin[1] + length * Math.cos(angle)
        ];
    }

    function arm(shoulder, upperAngle, lowerAngle, highlight = false) {
        const elbow = joint(shoulder, 31, upperAngle);
        const wrist = joint(elbow, 27, lowerAngle);
        const hand = joint(wrist, 9, lowerAngle);

        return [
            [shoulder, elbow, 9, 6, shirt],
            [elbow, wrist, 6, 4, highlight ? moving : skin],
            [wrist, hand, 4, 3, skin]
        ];
    }

    function leg(hip, knee, ankle, highlight = false, lift = 0) {
        const toe = [ankle[0] + 13, ankle[1] + 2 - lift];
        const color = highlight ? moving : pants;

        return [
            [hip, knee, 12, 8, color],
            [knee, ankle, 8, 5, color],
            [ankle, toe, 5, 4, shoe]
        ];
    }

    const chair = [
        [191, 151, 100, 6],
        [198, 157, 6, 56],
        [280, 157, 6, 56]
    ];

    function seated(shoulder, arms, head = [240, 63]) {
        return {
            head,
            shoulder,
            hip: [240, 145],
            props: chair,
            arms,
            legs: [
                ...leg([232, 145], [206, 151], [206, 209]),
                ...leg([248, 145], [273, 151], [273, 209])
            ]
        };
    }

    function standing(shoulder, hip, arms) {
        return {
            head: [shoulder[0], shoulder[1] - 31],
            shoulder,
            hip,
            arms,
            legs: [
                ...leg([hip[0] - 7, hip[1]], [229, 171], [226, 210]),
                ...leg([hip[0] + 7, hip[1]], [245, 171], [244, 210])
            ]
        };
    }

    const guides = {
        chest: {
            name: "座って胸を開く",
            equipment: "安定した椅子",
            source: "NHS · Sitting exercises",
            url: "https://www.nhs.uk/live-well/exercise/sitting-exercises/",
            steps: [
                "椅子に浅く座り、足裏を床につける。",
                "肩を軽く下げ、腕を斜め下に開きながら胸を前に出す。",
                "胸が軽く伸びたらゆっくり戻る。図は短い反復で示す。"
            ],
            pose(t) {
                const angle = 0.15 + 0.78 * t;

                return seated([240, 94], [
                    ...arm([217, 94], -angle, -angle, true),
                    ...arm([263, 94], angle, angle, true)
                ]);
            }
        },

        roll: {
            name: "肩回し",
            equipment: "器具なし",
            source: "NHS · How to warm up before exercising",
            url: nhs,
            steps: [
                "立って腕の力を抜き、体の横に垂らす。",
                "肩を前へ5回、後ろへ5回、ゆっくり回す。",
                "図は片方向の動きを横から示す。"
            ],
            pose(t) {
                const angle = t * Math.PI * 2;
                const shoulder = [
                    240 + 6 * Math.sin(angle),
                    88 + 6 * Math.cos(angle)
                ];

                return {
                    ...standing(shoulder, [239, 137], arm(shoulder, 0.06, 0.03, true)),
                    head: [240, 57]
                };
            }
        },

        pendulum: {
            name: "肩の振り子運動",
            equipment: "安定した台",
            source: "AAOS · Shoulder Conditioning Program",
            url: "https://orthoinfo.aaos.org/globalassets/pdfs/2024-rotator-cuff-and-shoulder-conditioning-program.pdf",
            steps: [
                "台に片手をつき、膝を軽く緩めて上体を傾ける。",
                "反対の腕を垂らして力を抜き、小さく前後に揺らす。",
                "背中を丸めず、反対側も同じように行う。"
            ],
            pose(t) {
                const angle = (t - 0.5) * 0.6;
                const shoulder = [266, 91];

                return {
                    ...standing(shoulder, [218, 132], [
                        [shoulder, [295, 108], 9, 6, shirt],
                        [[295, 108], [328, 126], 6, 4, skin],
                        ...arm(shoulder, angle, angle, true)
                    ]),
                    head: [287, 75],
                    props: [
                        [316, 130, 69, 7],
                        [374, 137, 7, 76]
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
                "上腕を体の横に置いて肩を楽にする。",
                "重りを持たず、肘を曲げて手を肩へ近づける。",
                "上腕の位置を保ってゆっくり伸ばす。"
            ],
            pose(t) {
                const shoulder = [241, 91];

                return standing(
                    shoulder,
                    [237, 139],
                    arm(shoulder, 0.08, 0.12 + 2.3 * t, true)
                );
            }
        },

        wrist: {
            name: "手首の曲げ伸ばし",
            equipment: "安定した台",
            source: "Royal United Hospitals Bath · Wrist Exercises",
            url: "https://www.ruh.nhs.uk/patients/patient_information/HTH024_Wrist_Exercises.pdf",
            steps: [
                "前腕を台に置き、手を端から出す。",
                "指を楽にして手首をゆっくり上下に動かす。",
                "前腕は台につけたままにする。"
            ],
            pose(t) {
                const angle = Math.PI / 2 + (t - 0.5) * 1.3;
                const wrist = [252, 111];

                return {
                    props: [
                        [110, 126, 142, 8],
                        [125, 134, 6, 70],
                        [239, 134, 6, 70]
                    ],
                    arms: [
                        [[125, 110], wrist, 16, 8, skin],
                        [wrist, joint(wrist, 61, angle), 8, 4, moving]
                    ]
                };
            }
        },

        rotate: {
            name: "座って上体を左右に回す",
            equipment: "安定した椅子",
            source: "NHS Scotland · Thoracic rotational stretch",
            url: "https://www.rightdecisions.scot.nhs.uk/media/alqcguhk/shoulder-rehabilitation-exercises.pdf",
            steps: [
                "足裏を床につけて座り、腕を胸の前で組む。",
                "骨盤と膝を正面に保ち、胸を片側へゆっくり回す。",
                "正面を通って反対側へ回す。"
            ],
            pose(t) {
                const x = 240 + (t - 0.5) * 29;

                return seated([x, 94], [
                    [[x - 22, 94], [x - 13, 115], 8, 6, shirt],
                    [[x - 13, 115], [x + 17, 103], 6, 4, moving],
                    [[x + 22, 94], [x + 13, 119], 8, 6, shirt],
                    [[x + 13, 119], [x - 17, 108], 6, 4, moving]
                ], [x, 63]);
            }
        },

        cat: {
            name: "キャット＆カウ",
            equipment: "マット",
            source: "Royal Berkshire NHS · Core exercise programme",
            url: "https://www.royalberkshire.nhs.uk/media/qfljlxzd/physio-core-exercise-programme-matplusgynae.pdf",
            steps: [
                "マットで四つんばいになり、手を肩の下、膝を股関節の下に置く。",
                "背中をゆっくり丸め、目線をお腹へ向ける。",
                "元の姿勢を通って、胸を前へ向けながら背中を軽く反らす。"
            ],
            pose(t) {
                const curve = (t - 0.5) * 2;
                const shoulder = [280, 128 + 4 * curve];
                const hip = [195, 134 + 4 * curve];

                return {
                    head: [306, 133 + 14 * curve],
                    shoulder,
                    hip,
                    spine: [238, 128 - 35 * curve],
                    props: [[106, 216, 257, 5]],
                    legs: [
                        [hip, [195, 206], 12, 8, pants],
                        [[195, 206], [140, 209], 8, 4, pants]
                    ],
                    arms: [
                        [shoulder, [280, 171], 9, 6, shirt],
                        [[280, 171], [280, 209], 6, 4, skin],
                        [[280, 209], [294, 209], 4, 3, skin]
                    ]
                };
            }
        },

        knee: {
            name: "浅い膝曲げ",
            equipment: "器具なし",
            source: "NHS · How to warm up before exercising",
            url: nhs,
            steps: [
                "足を肩幅に開き、腕を前に伸ばす。",
                "膝を曲げて身体を浅く下げる。",
                "足裏を床につけたまま、ゆっくり戻る。"
            ],
            pose(t) {
                const shoulder = [238 - 3 * t, 85 + 9 * t];
                const hip = [234 - 12 * t, 135 + 9 * t];

                return {
                    ...standing(shoulder, hip, arm(shoulder, 1.52, 1.57)),
                    legs: [
                        ...leg(hip, [236 + 12 * t, 174], [235, 209], true),
                        ...leg([hip[0] - 6, hip[1]], [230 + 12 * t, 174], [228, 209])
                    ]
                };
            }
        },

        heel: {
            name: "かかとタッチ",
            equipment: "器具なし",
            source: "NHS · How to warm up before exercising",
            url: nhs,
            steps: [
                "軸足の膝を軽く曲げ、反対のかかとを前の床につける。",
                "前足のつま先を上げ、腕を前へ軽く出す。",
                "元に戻して左右を交替する。図は片側の例。"
            ],
            pose(t) {
                const shoulder = [227, 88];
                const hip = [226, 139];
                const ankle = [
                    239 + 33 * t,
                    210 - 7 * Math.sin(Math.PI * t)
                ];

                return {
                    ...standing(
                        shoulder,
                        hip,
                        arm(shoulder, 0.35 + t, 1.05 + 0.4 * t)
                    ),
                    legs: [
                        ...leg([220, 139], [221, 175], [218, 209]),
                        ...leg([232, 139], [241 + 15 * t, 171], ankle, true, 13 * t)
                    ]
                };
            }
        },

        roller: {
            name: "ふくらはぎのフォームローリング",
            equipment: "マット・フォームローラー",
            source: "UCSF Sports Medicine · Foam Rolling Protocol",
            url: "https://sportsrehab.ucsf.edu/sites/g/files/tkssra10961/files/doc/Foam_Rolling_Protocol_Nov2025.pdf",
            steps: [
                "床に座り、伸ばした脚のふくらはぎの下にローラーを置く。",
                "後ろについた手と反対の足で体を支え、圧を調整する。",
                "ふくらはぎの筋肉の範囲でゆっくり往復する。"
            ],
            pose(t) {
                const shift = 24 * t;
                const shoulder = [151 + shift, 116];
                const hip = [174 + shift, 171];

                return {
                    head: [145 + shift, 88],
                    shoulder,
                    hip,
                    props: [[100, 216, 290, 5]],
                    roller: [292, 201, t * Math.PI],
                    legs: [
                        ...leg(hip, [210 + shift, 148], [235 + shift, 209]),
                        ...leg(hip, [234 + shift, 178], [319 + shift, 179], true, 7)
                    ],
                    arms: [
                        [shoulder, [133 + shift, 156], 9, 6, shirt],
                        [[133 + shift, 156], [120 + shift, 210], 6, 4, skin],
                        [[120 + shift, 210], [110 + shift, 210], 4, 3, skin]
                    ]
                };
            }
        }
    };

    const routines = {
        chest: [
            "胸の日",
            ["roll", "前後各5回"],
            ["chest", "ゆっくり数回"]
        ],
        shoulder: [
            "肩の日",
            ["roll", "前後各5回"],
            ["pendulum", "左右とも数回"]
        ],
        back: [
            "背中の日",
            ["roll", "前後各5回"],
            ["rotate", "左右とも数回"],
            ["cat", "マットがあれば"]
        ],
        arms: [
            "腕の日",
            ["elbow", "左右とも数回"],
            ["wrist", "左右とも数回"]
        ],
        legs: [
            "脚の日",
            ["heel", "左右交互"],
            ["knee", "浅く10回"],
            ["roller", "任意"]
        ],
        core: [
            "体幹の日",
            ["rotate", "左右とも数回"],
            ["cat", "ゆっくり数回"]
        ]
    };

    function ellipse(context, x, y, rx, ry, color) {
        context.beginPath();
        context.ellipse(x, y, rx, ry, 0, 0, Math.PI * 2);
        context.fillStyle = color;
        context.fill();
    }

    function segment(context, start, end, first, last, colors) {
        const dx = end[0] - start[0];
        const dy = end[1] - start[1];
        const length = Math.hypot(dx, dy);

        context.save();
        context.translate(...start);
        context.rotate(Math.atan2(dy, dx));

        const light = context.createLinearGradient(0, -first, 0, first);

        light.addColorStop(0, colors[0]);
        light.addColorStop(1, colors[1]);

        context.fillStyle = light;
        context.beginPath();
        context.moveTo(0, -first);
        context.quadraticCurveTo(length * 0.45, -first, length, -last);
        context.quadraticCurveTo(length + last, 0, length, last);
        context.quadraticCurveTo(length * 0.45, first, 0, first);
        context.quadraticCurveTo(-first, 0, 0, -first);
        context.fill();

        context.restore();
    }

    function draw(canvas, guide, progress) {
        const context = canvas.getContext("2d");
        const pose = guide.pose(progress);

        context.setTransform(
            canvas.width / 480,
            0,
            0,
            canvas.height / 240,
            0,
            0
        );

        context.clearRect(0, 0, 480, 240);

        ellipse(context, 240, 219, 137, 6, "#55462e19");

        context.fillStyle = "#938775";

        for (const rectangle of pose.props ?? []) {
            context.fillRect(...rectangle);
        }

        if (pose.roller) {
            const [x, y, angle] = pose.roller;

            ellipse(context, x, y, 14, 14, "#476c72");
            ellipse(context, x, y, 10, 10, "#95b7b9");

            ellipse(
                context,
                x + 8 * Math.cos(angle),
                y + 8 * Math.sin(angle),
                2,
                2,
                "#2b4e53"
            );
        }

        for (const limb of pose.legs ?? []) {
            segment(context, ...limb);
        }

        if (pose.head) {
            const [x, y] = pose.head;

            segment(context, [x, y + 11], pose.shoulder, 6, 7, skin);

            if (pose.spine) {
                context.beginPath();
                context.moveTo(...pose.hip);
                context.quadraticCurveTo(...pose.spine, ...pose.shoulder);
                context.lineCap = "round";
                context.lineWidth = 27;
                context.strokeStyle = shirt[1];
                context.stroke();

                context.lineWidth = 18;
                context.strokeStyle = shirt[0];
                context.stroke();
            } else {
                segment(context, pose.shoulder, pose.hip, 21, 14, shirt);
            }

            ellipse(context, x, y, 13, 16, skin[0]);
            ellipse(context, x - 2, y - 10, 12, 7, "#353939");
        }

        for (const limb of pose.arms) {
            segment(context, ...limb);
        }
    }

    return {
        guides,
        routines,
        draw
    };
})();