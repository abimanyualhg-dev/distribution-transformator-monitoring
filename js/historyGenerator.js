// ======================================================
// HISTORY GENERATOR
// Distribution Transformer Monitoring
// ======================================================

// ======================================================
// PARAMETER TRAFO
// ======================================================

const TRAFO_KVA = 50;
const LINE_VOLTAGE = 380;

// ======================================================
// RATED CURRENT
// ======================================================

const IRATED =
    (TRAFO_KVA * 1000) /
    (Math.sqrt(3) * LINE_VOLTAGE);

// ======================================================
// RANDOM DECIMAL
// ======================================================

function random(min, max){

    return Number(
        (Math.random() * (max - min) + min)
        .toFixed(2)
    );

}

// ======================================================
// LOAD
// ======================================================

function calculateLoad(ir,is,it){

    const avg =

        (ir + is + it) / 3;

    return Number(

        (

            avg / IRATED

        ) * 100

    ).toFixed(2);

}

// ======================================================
// UNBALANCE
// ======================================================

function calculateUnbalance(ir,is,it){

    const avg =

        (ir + is + it) / 3;

    if(avg <= 0)

        return 0;

    const a = ir / avg;

    const b = is / avg;

    const c = it / avg;

    return Number(

        (

            (

                Math.abs(a - 1)

                +

                Math.abs(b - 1)

                +

                Math.abs(c - 1)

            ) / 3

        ) * 100

    ).toFixed(2);

}

// ======================================================
// PROFILE
// ======================================================

function getProfile(date){

    const day = date.getDay();

    const hour =
        date.getHours() +
        date.getMinutes() / 60;


    // ======================================================
    // WEEKEND / HARI LIBUR
    // Beban rendah
    // ======================================================

    if(day === 6 || day === 0){

        return{

            ir:[22,27],

            is:[22.5,27.5],

            it:[21.5,26.5],

            temp:[28,30]

        };

    }


    // ======================================================
    // DINI HARI
    // 00:00 - 06:00
    // Beban rendah
    // ======================================================

    if(hour < 6){

        return{

            ir:[23,28],

            is:[23.5,28.5],

            it:[22.5,27.5],

            temp:[28,30]

        };

    }


    // ======================================================
    // PAGI / START BEBAN
    // 06:00 - 08:00
    // ======================================================

    if(hour >= 6 && hour < 8){

        return{

            ir:[32,38],

            is:[33,39],

            it:[31,37],

            temp:[29,32]

        };

    }


    // ======================================================
    // BEBAN KERJA
    // 08:00 - 12:00
    // ======================================================

    if(hour >= 8 && hour < 12){

        return{

            ir:[43,49],

            is:[44,50],

            it:[42,48],

            temp:[30,34]

        };

    }


    // ======================================================
    // PEAK LOAD
    // 12:00 - 15:00
    // Sekitar 60 - 70% kapasitas trafo
    // ======================================================

    if(hour >= 12 && hour < 15){

        return{

            ir:[48,54],

            is:[49,55],

            it:[47,53],

            temp:[31,35]

        };

    }


    // ======================================================
    // SIANG / BEBAN MULAI TURUN
    // 15:00 - 17:00
    // ======================================================

    if(hour >= 15 && hour < 17){

        return{

            ir:[38,44],

            is:[39,45],

            it:[37,43],

            temp:[30,33]

        };

    }


    // ======================================================
    // SORE / MALAM
    // 17:00 - 22:00
    // ======================================================

    if(hour >= 17 && hour < 22){

        return{

            ir:[29,35],

            is:[30,36],

            it:[28,34],

            temp:[29,32]

        };

    }


    // ======================================================
    // MALAM
    // 22:00 - 24:00
    // ======================================================

    return{

        ir:[24,29],

        is:[24.5,29.5],

        it:[23.5,28.5],

        temp:[28,30]

    };

}

// ======================================================
// GENERATE ONE DATA
// ======================================================

function generateRecord(date,last=null){

    const profile = getProfile(date);

    let ir = random(profile.ir[0], profile.ir[1]);
    let is = random(profile.is[0], profile.is[1]);
    let it = random(profile.it[0], profile.it[1]);
    let temp = random(profile.temp[0], profile.temp[1]);

    // sedikit variasi natural
    ir += random(-0.15, 0.15);
    is += random(-0.15, 0.15);
    it += random(-0.10, 0.10);
    temp += random(-0.05, 0.05);

    ir = Number(ir.toFixed(2));
    is = Number(is.toFixed(2));
    it = Number(it.toFixed(2));
    temp = Number(temp.toFixed(2));

    return{

        datetime:date,

        ir,

        is,

        it,

        temp,

        load:Number(
            calculateLoad(ir,is,it)
        ),

        unbalance:Number(
            calculateUnbalance(ir,is,it)
        )

    };

}

// ======================================================
// GENERATE MONTH
// ======================================================

function generateMonthHistory(year,month){

    const history=[];

    let previous=null;

    const totalDays =
        new Date(year,month+1,0).getDate();

    for(

        let day=1;

        day<=totalDays;

        day++

    ){

        for(

            let hour=0;

            hour<24;

            hour++

        ){

            const date =

                new Date(

                    year,

                    month,

                    day,

                    hour,

                    0,

                    0

                );

            const record =

                generateRecord(

                    date,

                    previous

                );

            history.push(record);

            previous=record;

        }

    }

    return history;

}

// ======================================================
// GROUP BY DAY
// ======================================================

function buildHistory(year, month){

    const flatHistory = generateMonthHistory(year, month);

    const result = [];

    const totalDays =
        new Date(year, month + 1, 0).getDate();

    for(let day = 1; day <= totalDays; day++){

        const daily = flatHistory.filter(record =>{

            const d = new Date(record.datetime);

            return d.getDate() === day;

        });

        // =====================
        // DAILY AVERAGE
        // =====================

        const average = {

            ir:
                Number(
                    (
                        daily.reduce((a,b)=>a+b.ir,0)
                        / daily.length
                    ).toFixed(2)
                ),

            is:
                Number(
                    (
                        daily.reduce((a,b)=>a+b.is,0)
                        / daily.length
                    ).toFixed(2)
                ),

            it:
                Number(
                    (
                        daily.reduce((a,b)=>a+b.it,0)
                        / daily.length
                    ).toFixed(2)
                ),

            temp:
                Number(
                    (
                        daily.reduce((a,b)=>a+b.temp,0)
                        / daily.length
                    ).toFixed(2)
                ),

            load:
                Number(
                    (
                        daily.reduce((a,b)=>a+b.load,0)
                        / daily.length
                    ).toFixed(2)
                ),

            unbalance:
                Number(
                    (
                        daily.reduce((a,b)=>a+b.unbalance,0)
                        / daily.length
                    ).toFixed(2)
                )

        };

        result.push({

            day,

            average,

            hourly:daily

        });

    }

    return result;

}

window.HISTORY =
buildHistory(

    2026,

    7

);

console.log(HISTORY);

console.table(HISTORY);