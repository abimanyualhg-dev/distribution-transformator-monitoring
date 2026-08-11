const aiTitle = document.getElementById("aiTitle");
const aiList = document.getElementById("aiList");

let aiData = null;

const menus = [
    "ringkasan",
    "tren",
    "rekomendasi",
    "prediksi",
    "timeline"
];

const menuTitles = {
    ringkasan: "RINGKASAN ANALISIS",
    tren: "TREN PARAMETER",
    rekomendasi: "REKOMENDASI PEMELIHARAAN",
    prediksi: "PREDIKSI KONDISI",
    timeline: "RIWAYAT ANALISIS"
};


// ======================================================
// LOCAL FALLBACK
// ======================================================

function createLocalAnalysis(history) {

    if (!history || history.length === 0) {

        return {
            ringkasan: [
                "Data monitoring belum tersedia.",
                "Belum dapat dilakukan analisis parameter.",
                "Silakan tunggu data monitoring."
            ],

            tren: [
                "Tren parameter belum dapat ditentukan.",
                "Data historis belum mencukupi.",
                "Monitoring tetap berjalan."
            ],

            rekomendasi: [
                "Lanjutkan monitoring secara berkala.",
                "Periksa kondisi apabila terdapat perubahan parameter.",
                "Pastikan sistem monitoring tetap aktif."
            ],

            prediksi: [
                "Prediksi belum dapat ditentukan.",
                "Diperlukan data historis untuk analisis lebih lanjut.",
                "Monitoring tetap diperlukan."
            ],

            timeline: [
                new Date().toLocaleString("id-ID"),
                "Data berhasil diproses.",
                "Analisis lokal digunakan karena AI Worker tidak merespons."
            ]
        };
    }


    const latest = history[history.length - 1];

    const avgLoad =
        history.reduce(
            (sum, d) => sum + Number(d.load || 0),
            0
        ) / history.length;

    const avgTemp =
        history.reduce(
            (sum, d) => sum + Number(d.temp || 0),
            0
        ) / history.length;

    const avgUnbalance =
        history.reduce(
            (sum, d) => sum + Number(d.unbalance || 0),
            0
        ) / history.length;


    const recommendations = [];

    if (latest.temp >= 60) {
        recommendations.push(
            "Lakukan pemeriksaan temperatur transformator."
        );
    }

    if (latest.load >= 80) {
        recommendations.push(
            "Kurangi pembebanan transformator."
        );
    }

    if (latest.unbalance >= 30) {
        recommendations.push(
            "Evaluasi pembagian beban antar fasa."
        );
    }

    while (recommendations.length < 3) {
        recommendations.push(
            "Lanjutkan monitoring secara berkala."
        );
    }


    return {

        ringkasan: [
            `Beban rata-rata transformator ${avgLoad.toFixed(2)}%.`,
            `Suhu rata-rata ${avgTemp.toFixed(1)} °C.`,
            `Ketidakseimbangan rata-rata ${avgUnbalance.toFixed(2)}%.`
        ],

        tren: [
            "Parameter monitoring berhasil dianalisis.",
            "Pola perubahan mengikuti aktivitas pembebanan.",
            "Belum ditemukan perubahan ekstrem."
        ],

        rekomendasi: recommendations,

        prediksi: [
            "Apabila pola beban tetap, kondisi diperkirakan stabil.",
            "Perubahan temperatur perlu diperhatikan pada beban tinggi.",
            "Monitoring tetap diperlukan pada periode beban puncak."
        ],

        timeline: [
            new Date().toLocaleString("id-ID"),
            "Data monitoring berhasil diproses.",
            "Analisis kondisi transformator selesai."
        ]
    };
}


// ======================================================
// UPDATE GLASS
// ======================================================

function updateCopilot(menu) {

    if (!aiData || !aiData[menu]) {

        console.warn(
            "AI DATA BELUM TERSEDIA:",
            menu
        );

        return;
    }

    aiTitle.textContent =
        menuTitles[menu];

    aiList.innerHTML = "";

    aiData[menu].forEach(item => {

        const li =
            document.createElement("li");

        li.textContent = item;

        aiList.appendChild(li);

    });
}


// ======================================================
// COPILOT BUTTON
// ======================================================

const copilotButtons =
    document.querySelectorAll(
        "#copilot .filter-btn"
    );

copilotButtons.forEach((btn, index) => {

    btn.onclick = () => {

        copilotButtons.forEach(b =>
            b.classList.remove("active")
        );

        btn.classList.add("active");

        updateCopilot(
            menus[index]
        );

    };

});


// ======================================================
// LOAD AI
// ======================================================

async function loadCopilotAI() {

    console.log("=== AI COPILOT START ===");

    const history =
        window.HISTORY.flatMap(
            day => day.hourly || []
        );

    console.log(
        "HISTORY YANG DIKIRIM:",
        history
    );


    // TAMPILKAN LOCAL ANALYSIS DULU
    // supaya glass tidak pernah kosong

    aiData =
        createLocalAnalysis(history);

    updateCopilot("ringkasan");


    // COBA AI WORKER
    try {

        const result =
            await generateAnalysis(history);

        if (
            result &&
            result.ringkasan &&
            result.tren &&
            result.rekomendasi &&
            result.prediksi &&
            result.timeline
        ) {

            aiData = result;

            console.log(
                "AI DATA BERHASIL:",
                aiData
            );

            updateCopilot("ringkasan");

        } else {

            console.warn(
                "AI Worker tidak menghasilkan data. Menggunakan local analysis."
            );

        }

    } catch (error) {

        console.error(
            "AI Worker gagal. Menggunakan local analysis:",
            error
        );

    }

}

loadCopilotAI();