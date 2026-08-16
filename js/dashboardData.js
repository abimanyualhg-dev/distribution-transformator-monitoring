// ======================================================
// DASHBOARD DATA
// ======================================================
// Dashboard hanya membaca data dari window.HISTORY.
// Tidak ada Firebase, sensor, API, atau database.
// ======================================================


(function () {

    function getLatestRecord() {

        if (
            !window.HISTORY ||
            window.HISTORY.length === 0
        ) {
            console.warn("HISTORY belum tersedia.");
            return null;
        }

        // ======================================================
        // BATAS DATA VALID
        // Hanya gunakan data sampai HARI KEMARIN.
        // Data masa depan tetap ada di HISTORY,
        // tetapi tidak boleh digunakan dashboard.
        // ======================================================

        const now = new Date();

        const yesterday = new Date(
            now.getFullYear(),
            now.getMonth(),
            now.getDate() - 1,
            23,
            59,
            59,
            999
        );

        // Ambil hanya hari yang sudah benar-benar lewat
        const validDays = window.HISTORY.filter(day => {

            if (
                !day.hourly ||
                day.hourly.length === 0
            ) {
                return false;
            }

            const lastRecord =
                day.hourly[day.hourly.length - 1];

            if (!lastRecord || !lastRecord.datetime) {
                return false;
            }

            return new Date(lastRecord.datetime) <= yesterday;
        });

        if (validDays.length === 0) {
            console.warn("Belum ada data historis yang valid.");
            return null;
        }

        // Ambil hari terakhir yang valid
        const lastDay =
            validDays[validDays.length - 1];

        const base =
            lastDay.hourly[lastDay.hourly.length - 1];

        // ======================================================
        // VARIASI REALTIME
        // ======================================================

        const variation = (value, amount) => {

            const v =
                Number(value) +
                (Math.random() * 2 - 1) * amount;

            return Math.max(0, v);

        };

        const ir =
            variation(base.ir, 0.35);

        const is =
            variation(base.is, 0.35);

        const it =
            variation(base.it, 0.35);

        const temp =
            variation(base.temp, 0.12);


        // ======================================================
        // HITUNG LOAD
        // ======================================================

        const nominalCurrent = 75.97;

        const averageCurrent =
            (ir + is + it) / 3;

        const load =
            (averageCurrent / nominalCurrent) * 100;


        // ======================================================
        // HITUNG UNBALANCE
        // ======================================================

        const unbalance =
            (
                Math.abs(ir / averageCurrent - 1) +
                Math.abs(is / averageCurrent - 1) +
                Math.abs(it / averageCurrent - 1)
            ) / 3 * 100;


        return {

            ...base,

            ir: ir,
            is: is,
            it: it,

            temp: temp,

            load: load,

            unbalance: unbalance

        };

    }


    function updateValue(elementId, value, unit, type) {

        const element = document.getElementById(elementId);

        const newValue = Number(value);

        if (!Number.isFinite(newValue)) return;

        // Ambil angka yang sedang tampil
        const oldValue =
            parseFloat(element.textContent.replace(/[^\d.-]/g, "")) || 0;

        // Reset animasi zoom
        element.classList.remove("value-update");
        void element.offsetWidth;
        element.classList.add("value-update");

        const duration = 500;
        const startTime = performance.now();

        function animateValue(currentTime) {

            const progress =
                Math.min((currentTime - startTime) / duration, 1);

            // easing supaya gerakannya lebih natural
            const eased =
                1 - Math.pow(1 - progress, 3);

            const currentValue =
                oldValue + (newValue - oldValue) * eased;

            element.textContent =
                `${currentValue.toFixed(2)} ${unit}`;

            if (progress < 1) {

                requestAnimationFrame(animateValue);

            } else {

                element.textContent =
                    `${newValue.toFixed(2)} ${unit}`;
            
                updateStatus(element, type, newValue);

            }
        }

        requestAnimationFrame(animateValue);
    }

    function updateStatus(element, type, value) {

        element.classList.remove(
            "value-normal",
            "value-warning",
            "value-danger"
        );

        let status = "value-normal";

        if (type === "current") {

            if (value >= 38) {
                status = "value-danger";
            } else if (value >= 34) {
                status = "value-warning";
            }

        }

        else if (type === "load") {

            if (value >= 80) {
                status = "value-danger";
            } else if (value >= 70) {
                status = "value-warning";
            }

        }

        else if (type === "unbalance") {

            if (value >= 10) {
                status = "value-danger";
            } else if (value >= 5) {
                status = "value-warning";
            }

        }

        else if (type === "temperature") {

            if (value >= 70) {
                status = "value-danger";
            } else if (value >= 60) {
                status = "value-warning";
        }

        }

        element.classList.add(status);
    }

    function updateDashboard() {

        const data =
            getLatestRecord();


        if (!data) {
            return;
        }


        // ==============================
        // ARUS
        // ==============================

        updateValue(
            "ir",
            data.ir,
            "A"
        );


        updateValue(
            "is",
            data.is,
            "A"
        );


        updateValue(
            "it",
            data.it,
            "A"
        );


        // ==============================
        // TEMPERATURE
        // ==============================

        updateValue(
            "temp",
            data.temp,
            "°C"
        );


        // ==============================
        // LOAD
        // ==============================

        updateValue(
            "overload",
            data.load,
            "%"
        );


        // ==============================
        // UNBALANCE
        // ==============================

        updateValue(
            "unbalance",
            data.unbalance,
            "%"
        );


        console.log(
            "DASHBOARD DATA:",
            data
        );
    }


    // Jalankan setelah script dimuat.
    updateDashboard();


    // Refresh tampilan setiap 2 detik.
    // Data tetap berasal dari HISTORY yang sama.
    setInterval(
        updateDashboard,
        2000
    );


    
})()
