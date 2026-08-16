// ======================================================
// FORMAT WAKTU
// ======================================================

function formatAnalysisTime(data) {

    const raw =
        data.timestamp ??
        data.datetime ??
        data.dateTime ??
        data.date ??
        data.time ??
        data.waktu ??
        null;

    if (!raw) {
        return "Waktu tidak tersedia";
    }

    const date = new Date(raw);

    if (!isNaN(date.getTime())) {

        return date.toLocaleString("id-ID", {
            timeZone: "Asia/Jakarta",
            day: "2-digit",
            month: "2-digit",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
            second: "2-digit"
        }) + " WIB";
    }

    return String(raw);
}

// ======================================================
// PILIH 3 KALIMAT DARI TEMPLATE
// ======================================================

function pickThree(items) {

    const pool = [...items];

    // Acak
    for (let i = pool.length - 1; i > 0; i--) {

        const j =
            Math.floor(Math.random() * (i + 1));

        [pool[i], pool[j]] =
            [pool[j], pool[i]];
    }

    return pool.slice(0, 3);
}

// ======================================================
// AI ENGINE - LOCAL TRANSFORMER ANALYSIS
// TANPA API / FIREBASE / CLOUDFLARE
// ======================================================

function generateAnalysis(history) {

    if (!Array.isArray(history) || history.length === 0) {
        return emptyAnalysis();
    }

    const data = history
        .map(d => ({
            time: formatAnalysisTime(d),

            ir: Number(d.ir ?? d.IR ?? 0),
            is: Number(d.is ?? d.IS ?? 0),
            it: Number(d.it ?? d.IT ?? 0),

            load: Number(d.load ?? 0),
            temp: Number(d.temp ?? d.temperature ?? 0),
            unbalance: Number(d.unbalance ?? 0)
        }))
        .filter(d =>
            Number.isFinite(d.ir) &&
            Number.isFinite(d.is) &&
            Number.isFinite(d.it)
        );

    if (!data.length) {
        return emptyAnalysis();
    }

    const latest = data[data.length - 1];

    // ==================================================
    // STATISTIK
    // ==================================================

    const avg = key =>
        data.reduce((sum, d) => sum + d[key], 0) / data.length;

    const max = key =>
        Math.max(...data.map(d => d[key]));

    const min = key =>
        Math.min(...data.map(d => d[key]));

    const avgIR = avg("ir");
    const avgIS = avg("is");
    const avgIT = avg("it");

    const avgLoad = avg("load");
    const avgTemp = avg("temp");
    const avgUnbalance = avg("unbalance");

    const maxLoad = max("load");
    const maxTemp = max("temp");
    const maxUnbalance = max("unbalance");

    // ==================================================
    // STATUS PARAMETER
    // ==================================================

    function loadStatus(value) {

        if (value >= 80) {
            return "tinggi";
        }

        if (value >= 70) {
            return "mendekati batas pemantauan";
        }

        return "normal";
    }

    function tempStatus(value) {

        if (value >= 60) {
            return "tinggi";
        }

        if (value >= 50) {
            return "meningkat";
        }

        return "normal";
    }

    function unbalanceStatus(value) {

        if (value >= 10) {
            return "tinggi";
        }

        if (value > 4) {
            return "perlu diperhatikan";
        }

        return "normal";
    }

    // ==================================================
    // FASA DOMINAN
    // ==================================================

    const phaseValues = {
        R: latest.ir,
        S: latest.is,
        T: latest.it
    };

    const dominantPhase =
        Object.entries(phaseValues)
            .sort((a, b) => b[1] - a[1])[0][0];

    // ==================================================
    // RINGKASAN
    // ==================================================

    const ringkasanPool = [

        `Beban transformator saat ini ${latest.load.toFixed(2)}% dan berada pada kondisi ${loadStatus(latest.load)}.`,

        `Temperatur transformator saat ini ${latest.temp.toFixed(2)} °C dan berada pada kondisi ${tempStatus(latest.temp)}.`,

        `Ketidakseimbangan arus saat ini ${latest.unbalance.toFixed(2)}% dan ${unbalanceStatus(latest.unbalance)}.`,

        `Arus fasa R sebesar ${latest.ir.toFixed(2)} A, S sebesar ${latest.is.toFixed(2)} A, dan T sebesar ${latest.it.toFixed(2)} A.`,

        `Fasa ${dominantPhase} memiliki nilai arus paling tinggi pada pengukuran terakhir.`,

        `Nilai beban rata-rata pada data yang dianalisis adalah ${avgLoad.toFixed(2)}%.`,

        `Temperatur rata-rata transformator sebesar ${avgTemp.toFixed(2)} °C.`,

        `Ketidakseimbangan rata-rata tercatat sebesar ${avgUnbalance.toFixed(2)}%.`

    ];

    const ringkasan = pickThree(ringkasanPool);

    // ==================================================
    // TREN
    // HANYA MEMBACA DATA YANG SUDAH ADA
    // TIDAK MERAMAL
    // ==================================================

    const first = data[0];

    const loadChange = latest.load - first.load;
    const tempChange = latest.temp - first.temp;
    const unbalanceChange =
        latest.unbalance - first.unbalance;

    const trenPool = [

        loadChange > 2
            ? `Beban tercatat meningkat ${loadChange.toFixed(2)}% dibandingkan awal data yang dianalisis.`
            : loadChange < -2
                ? `Beban tercatat menurun ${Math.abs(loadChange).toFixed(2)}% dibandingkan awal data yang dianalisis.`
                : "Beban relatif stabil pada rentang data yang dianalisis.",

        tempChange > 2
            ? `Temperatur mengalami kenaikan ${tempChange.toFixed(2)} °C pada rentang data yang dianalisis.`
            : tempChange < -2
                ? `Temperatur mengalami penurunan ${Math.abs(tempChange).toFixed(2)} °C pada rentang data yang dianalisis.`
                : "Temperatur relatif stabil pada rentang data yang dianalisis.",

        unbalanceChange > 1
            ? `Ketidakseimbangan meningkat ${unbalanceChange.toFixed(2)}% dibandingkan awal data.`
            : unbalanceChange < -1
                ? `Ketidakseimbangan menurun ${Math.abs(unbalanceChange).toFixed(2)}% dibandingkan awal data.`
                : "Ketidakseimbangan relatif stabil pada rentang data yang dianalisis.",

        `Nilai maksimum beban yang tercatat adalah ${maxLoad.toFixed(2)}%.`,

        `Nilai maksimum ketidakseimbangan yang tercatat adalah ${maxUnbalance.toFixed(2)}%.`
    ];

    const tren = pickThree(trenPool);

    // ==================================================
    // REKOMENDASI PEMELIHARAAN
    // BERDASARKAN KONDISI AKTUAL
    // ==================================================

    const rekomendasiPool = [];


    // ---------- BEBAN ----------

    if (latest.load >= 80) {

        rekomendasiPool.push(
            `Beban ${latest.load.toFixed(2)}% sudah tinggi. Lakukan pemeriksaan pembebanan transformator dan evaluasi distribusi beban antar fasa.`
        );

    } else if (latest.load >= 70) {

        rekomendasiPool.push(
            `Beban ${latest.load.toFixed(2)}% mendekati batas pemantauan. Lakukan pemantauan pembebanan secara berkala.`
        );

    } else {

        rekomendasiPool.push(
            `Beban ${latest.load.toFixed(2)}% masih normal. Pertahankan pemantauan pembebanan dan distribusi arus antar fasa.`
        );

    }


    // ---------- UNBALANCE ----------

    if (latest.unbalance >= 10) {

        rekomendasiPool.push(
            `Ketidakseimbangan ${latest.unbalance.toFixed(2)}% tergolong tinggi. Periksa distribusi beban pada fasa R, S, dan T.`
        );

    } else if (latest.unbalance > 4) {

        rekomendasiPool.push(
            `Ketidakseimbangan ${latest.unbalance.toFixed(2)}% perlu diperhatikan. Evaluasi pembagian beban antar fasa.`
        );

    } else {

        rekomendasiPool.push(
            `Ketidakseimbangan ${latest.unbalance.toFixed(2)}% masih dalam batas normal. Pertahankan distribusi beban yang seimbang.`
        );

    }


    // ---------- TEMPERATUR ----------

    if (latest.temp >= 60) {

        rekomendasiPool.push(
            `Temperatur ${latest.temp.toFixed(2)} °C tergolong tinggi. Periksa sistem pendinginan dan kondisi pembebanan transformator.`
        );

    } else if (latest.temp >= 50) {

        rekomendasiPool.push(
            `Temperatur ${latest.temp.toFixed(2)} °C mengalami peningkatan. Pantau temperatur bersama perubahan beban transformator.`
        );

    } else {

        rekomendasiPool.push(
            `Temperatur ${latest.temp.toFixed(2)} °C masih normal. Pertahankan kondisi pendinginan transformator.`
        );

    }


    // ---------- ARUS FASA ----------

    rekomendasiPool.push(
        `Arus fasa saat ini R ${latest.ir.toFixed(2)} A, S ${latest.is.toFixed(2)} A, dan T ${latest.it.toFixed(2)} A. Periksa distribusi beban apabila terdapat perbedaan signifikan antar fasa.`
    );


    // ==================================================
    // PREDIKSI
    // BUKAN RAMALAN
    // BERUPA KONDISI "JIKA... MAKA..."
    // ==================================================

    const prediksiPool = [

        `Jika beban melebihi 80%, kondisi tersebut perlu ditindaklanjuti dengan pemeriksaan pembebanan transformator.`,

        `Jika ketidakseimbangan melebihi 4%, distribusi beban antar fasa perlu dievaluasi.`,

        `Jika ketidakseimbangan melebihi 10%, kondisi tersebut tergolong tinggi dan memerlukan pemeriksaan lebih lanjut.`,

        `Jika temperatur mencapai 50 °C atau lebih, temperatur perlu dipantau bersama perubahan beban.`,

        `Jika temperatur mencapai 60 °C atau lebih, kondisi pendinginan dan pembebanan transformator perlu diperiksa.`,

        `Apabila arus salah satu fasa jauh lebih tinggi dibandingkan fasa lainnya, distribusi beban antar fasa perlu diperiksa.`,

        `Semakin tinggi pembebanan transformator, semakin penting pemantauan temperatur dan keseimbangan arus secara bersamaan.`,

        `Apabila beberapa parameter melewati batas pemantauan secara bersamaan, pemeriksaan kondisi transformator menjadi lebih diprioritaskan.`

    ];


    // ==================================================
    // TIMELINE / RIWAYAT ANALISIS
    // BERISI FAKTA DARI DATA YANG SUDAH TERCATAT
    // ==================================================

    const timelinePool = [

        `Data terakhir tercatat pada ${latest.time}.`,

        `Pengukuran terakhir menunjukkan arus R ${latest.ir.toFixed(2)} A, S ${latest.is.toFixed(2)} A, dan T ${latest.it.toFixed(2)} A.`,

        `Pengukuran terakhir menunjukkan beban sebesar ${latest.load.toFixed(2)}%.`,

        `Pengukuran terakhir menunjukkan temperatur sebesar ${latest.temp.toFixed(2)} °C.`,

        `Pengukuran terakhir menunjukkan ketidakseimbangan sebesar ${latest.unbalance.toFixed(2)}%.`,

        `Selama periode analisis, beban maksimum yang tercatat adalah ${maxLoad.toFixed(2)}%.`,

        `Selama periode analisis, temperatur maksimum yang tercatat adalah ${maxTemp.toFixed(2)} °C.`,

        `Selama periode analisis, ketidakseimbangan maksimum yang tercatat adalah ${maxUnbalance.toFixed(2)}%.`,

        `Sebanyak ${data.length} titik data digunakan dalam analisis.`

    ];


    const rekomendasiFinal =
        pickThree(rekomendasiPool);

    const prediksi =
        pickThree(prediksiPool);

    const timeline =
        pickThree(timelinePool);


    // ==================================================
    // HASIL ANALISIS
    // ==================================================

    return {

        ringkasan,

        tren,

        rekomendasi: rekomendasiFinal,

        prediksi,

        timeline

    };

}


// ======================================================
// EMPTY DATA
// ======================================================

function emptyAnalysis() {

    return {

        ringkasan: [
            "Data monitoring belum tersedia.",
            "Belum terdapat parameter yang dapat dianalisis.",
            "Silakan pastikan HISTORY memiliki data."
        ],

        tren: [
            "Belum terdapat data historis.",
            "Tren parameter belum dapat dihitung.",
            "Analisis akan dilakukan setelah data tersedia."
        ],

        rekomendasi: [
            "Belum terdapat kondisi yang dapat dievaluasi.",
            "Monitoring belum memiliki data parameter.",
            "Pastikan sumber data monitoring aktif."
        ],

        prediksi: [
            "Status kondisi belum dapat ditentukan.",
            "Belum terdapat data yang cukup untuk evaluasi.",
            "Analisis hanya dilakukan berdasarkan data yang tersedia."
        ],

        timeline: [
            new Date().toLocaleString("id-ID"),
            "Belum terdapat data monitoring.",
            "Belum dilakukan analisis parameter."
        ]
    };
}