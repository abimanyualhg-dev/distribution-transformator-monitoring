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
        date.getMinutes()/60;

    // =====================
    // WEEKEND
    // =====================

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

        return{

            ir:[0.2,0.5],

            is:[0.5,0.9],

            it:[0.2,0.3],

            temp:[28,29.5]

        };

    }

    // =====================
    // START
    // =====================

    if(hour >= 6.5 && hour < 8){

        return{

            ir:[20,25],

            is:[30,35],

            it:[10,12],

            temp:[28,29.5]

        };

    }

    // =====================
    // PEAK
    // =====================

    if(hour >= 8 && hour < 15.5){

        return{

            ir:[30,35],

            is:[40,45],

            it:[12,15],

            temp:[28.5,29.5]

        };

    }

    // =====================
    // GO HOME
    // =====================

    if(hour >= 15.5 && hour < 16){

        return{

            ir:[20,25],

            is:[30,35],

            it:[10,12],

            temp:[28.5,29.5]

        };

    }

    // =====================
    // NIGHT
    // =====================

    return{

        ir:[0.2,0.5],

        is:[0.5,0.9],

        it:[0.2,0.3],

        temp:[28,29.5]

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