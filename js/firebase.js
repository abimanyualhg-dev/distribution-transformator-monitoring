import { initializeApp } from "https://www.gstatic.com/firebasejs/10.13.2/firebase-app.js";

import {
    getDatabase,
    ref,
    onValue
} from "https://www.gstatic.com/firebasejs/10.13.2/firebase-database.js";

const firebaseConfig = {

    apiKey: "AIzaSyDItsFkWAMOLBdhtk67OWjSGKgNHy8All8",

    authDomain: "tranformator-monitoring.firebaseapp.com",

    databaseURL: "https://tranformator-monitoring-default-rtdb.asia-southeast1.firebasedatabase.app",

    projectId: "tranformator-monitoring",

    storageBucket: "tranformator-monitoring.firebasestorage.app",

    messagingSenderId: "135592992118",

    appId: "1:135592992118:web:e141dd61bd31606542ae57"

};

const app = initializeApp(firebaseConfig);

const db = getDatabase(app);

const monitorRef = ref(db, "MonitoringTrafo/realtime");

onValue(monitorRef, (snapshot) => {

    if (!snapshot.exists()) return;

    const data = snapshot.val();

    const ir = document.getElementById("ir");
    const is = document.getElementById("is");
    const it = document.getElementById("it");

    const temp = document.getElementById("temp");
    const overload = document.getElementById("overload");
    const unbalance = document.getElementById("unbalance");

    // ======================================================
    // HYBRID SENSOR
    // R = DUMMY
    // S = REAL
    // T = REAL
    // ======================================================

    const dummyR =
        getStableDummyR();

    const realS =
        Number(data.arus.S);

    const realT =
        Number(data.arus.T);


    // ======================================================
    // HITUNG LOAD + UNBALANCE
    // DARI R DUMMY + S/T REAL
    // ======================================================

    const averageCurrent =
        (
            dummyR +
            realS +
            realT
        ) / 3;


    // Rated current trafo 50 kVA, 380 V
    const ratedCurrent =
        (
            50000 /
            (
                Math.sqrt(3) *
                380
            )
        );


    // LOAD
    const calculatedLoad =
        Number(
            (
                averageCurrent /
                ratedCurrent
            ) *
            100
        ).toFixed(2);


    // UNBALANCE
    const a =
        dummyR / averageCurrent;

    const b =
        realS / averageCurrent;

    const c =
        realT / averageCurrent;


    const calculatedUnbalance =
        Number(
            (
                (
                    Math.abs(a - 1) +
                    Math.abs(b - 1) +
                    Math.abs(c - 1)
                ) / 3
            ) * 100
        ).toFixed(2);


    // ======================================================
    // DISPLAY
    // ======================================================

    animateValue(
        ir,
        dummyR,
        " A"
    );

    animateValue(
        is,
        realS,
        " A"
    );

    animateValue(
        it,
        realT,
        " A"
    );


    animateValue(
        temp,
        Number(data.suhu),
        " °C"
    );


    animateValue(
        overload,
        Number(calculatedLoad),
        " %"
    );


    animateValue(
        unbalance,
        Number(calculatedUnbalance),
        " %"
    );
    
    //ATUR PEWARNAAN ANGKA//
    setStatusColor(temp, data.suhu, 75, 80);

    setStatusColor(overload, Number(calculatedLoad), 75, 80);

    setStatusColor(unbalance, Number(calculatedUnbalance), 10, 14);

});

function setStatusColor(element, value, warningLimit, dangerLimit){

    element.classList.remove(
        "value-normal",
        "value-warning",
        "value-danger"
    );

    if(value >= dangerLimit){

        element.classList.add("value-danger");

    }else if(value >= warningLimit){

        element.classList.add("value-warning");

    }else{

        element.classList.add("value-normal");

    }

}

function animateValue(element, endValue, suffix, decimals = 2){
    element.classList.remove("value-update");

    void element.offsetWidth;

    element.classList.add("value-update");

    const startValue = parseFloat(
        element.dataset.value || 0
    );

    if(Math.abs(startValue - endValue) < 0.01){

    return;
    }

    const duration = 1200;

    const startTime = performance.now();

    function update(now){

        const progress = Math.min(
            (now - startTime) / duration,
            1
        );

        const ease =
            1 - Math.pow(1 - progress, 3);

        const value =
            startValue +
            (endValue - startValue) * ease;

        element.textContent =
            value.toFixed(decimals) + suffix;

        if(progress < 1){

            requestAnimationFrame(update);

        }else{

            element.dataset.value = endValue;

        }

    }

    requestAnimationFrame(update);

}

// ======================================================
// DUMMY R - MENGIKUTI PROFIL EXCEL
// ======================================================

function getDummyR(){

    const now = new Date();

    const day = now.getDay();

    const hour =
        now.getHours() +
        now.getMinutes() / 60;


    // WEEKEND
    if(
        day === 6 ||
        day === 0 ||
        (
            day === 5 &&
            hour >= 16
        ) ||
        (
            day === 1 &&
            hour < 6.5
        )
    ){

        return randomR(0.2, 0.5);

    }


    // START
    if(hour >= 6.5 && hour < 8){

        return randomR(20, 25);

    }


    // PEAK
    if(hour >= 8 && hour < 15.5){

        return randomR(30, 35);

    }


    // GO HOME
    if(hour >= 15.5 && hour < 16){

        return randomR(20, 25);

    }


    // NIGHT
    return randomR(0.2, 0.5);

}


// ======================================================
// RANDOM R
// ======================================================

function randomR(min,max){

    return Number(
        (
            Math.random() *
            (max - min) +
            min
        ).toFixed(2)
    );

}

let dummyR = null;
let dummyRHour = null;


function getStableDummyR(){

    const now = new Date();

    const currentHour =
        now.getFullYear() +
        "-" +
        now.getMonth() +
        "-" +
        now.getDate() +
        "-" +
        now.getHours();


    if(
        dummyR === null ||
        dummyRHour !== currentHour
    ){

        dummyR =
            getDummyR();

        dummyRHour =
            currentHour;

    }


    return dummyR;

}