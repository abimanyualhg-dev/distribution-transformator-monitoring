// ==============================================
// AI ENGINE - CLOUDFLARE
// ==============================================

const AI_WORKER_URL =
    "https://trafo-ai-copilot.abimanyualhg.workers.dev";

async function generateAnalysis(history) {

    if (!history || history.length === 0) {
        return emptyAnalysis();
    }

    try {

        console.log("Mengirim data ke AI:", history);

        const response = await fetch(AI_WORKER_URL, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                history: history
            })
        });

        if (!response.ok) {
            throw new Error(
                `AI Worker HTTP ${response.status}`
            );
        }

        const result = await response.json();

        console.log("Respons AI:", result);

        if (!result.success || !result.analysis) {
            throw new Error(
                result.error || "Respons AI tidak valid."
            );
        }

        return result.analysis;

    } catch (error) {

        console.error("AI ENGINE ERROR:", error);

        throw error;
    }

}


function emptyAnalysis() {

    return {

        ringkasan: [
            "Belum terdapat data monitoring.",
            "Menunggu data transformator.",
            "Analisis belum dapat dilakukan."
        ],

        tren: [
            "Belum terdapat data historis.",
            "Tren belum dapat dihitung.",
            "Menunggu data monitoring."
        ],

        rekomendasi: [
            "Belum ada rekomendasi.",
            "Menunggu data monitoring.",
            "Analisis akan tersedia setelah data masuk."
        ],

        prediksi: [
            "Belum dapat membuat prediksi.",
            "Data historis belum tersedia.",
            "Menunggu data monitoring."
        ],

        timeline: [
            new Date().toLocaleString("id-ID"),
            "Belum ada data.",
            "Analisis belum dilakukan."
        ]

    };
}