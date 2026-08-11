// ======================================================
// MONTHLY CHART
// ======================================================

const ctx = document.getElementById("monthlyChart");

console.log("MONTHLY CHART LOADED");
console.log(ctx);
console.log(window.HISTORY);

let selectedParameter = "ir";

let chartMode = "monthly";

let selectedDay = null;


const parameterConfig = {
    ir: { label: "IR" },
    is: { label: "IS" },
    it: { label: "IT" },
    temp: { label: "TEMPERATURE" },
    load: { label: "LOAD" },
    unbalance: { label: "UNBALANCE" }
};

const unitMap={
    ir:"CURRENT (A)",
    is:"CURRENT (A)",
    it:"CURRENT (A)",
    temp:"TEMPERATURE (°C)",
    load:"LOAD (%)",
    unbalance:"UNBALANCE(%)"
};

const graphTitle =
document.querySelector(".graph-header h1");

const graphSubtitle =
document.querySelector(".graph-header p");

const backButton =
document.getElementById("backMonthly");

backButton.style.display = "none";

backButton.addEventListener("click",()=>{

    updateMonthlyChart();

    backButton.style.display = "none";

});

function cssVar(name){

    return getComputedStyle(document.documentElement)
        .getPropertyValue(name)
        .trim();

}

const monthlyChart = new Chart(ctx, {

    type: "line",

    data: {

        labels: [],

        datasets:[{

            label:"IR",

            data:[],

            borderColor:"#84b1f8",

            backgroundColor:"rgba(59,130,246,.18)",

            fill:true,

            tension:.35,

            borderWidth:3,

            pointRadius:4,

            pointHoverRadius:7,

            pointBackgroundColor:"#3B82F6",

            pointBorderWidth:2,

            pointBorderColor:"#3B82F6"

        }]
    },

    options:{

        responsive:true,

        maintainAspectRatio:false,

        onClick(event,elements){

            if(!elements.length) return;

            if(chartMode==="monthly"){

                const index = elements[0].index;

                const day = Number(
                    monthlyChart.data.labels[index]
                );

                updateDailyChart(day);

            }

        },

        plugins:{

            legend:{
                display:false
            },

            tooltip:{

                callbacks:{

                    label(context){

                        const unit = {

                            ir:"A",
                            is:"A",
                            it:"A",
                            temp:"°C",
                            load:"%",
                            unbalance:"%"

                        };

                        return `${parameterConfig[selectedParameter].label}: ${context.parsed.y} ${unit[selectedParameter]}`;

                    }

                }

            }

        },

        scales:{

            x:{

                ticks:{

                    color:cssVar("--text-secondary"),

                    font:{
                        size:12,
                        weight:"500"
                    }

                },

                grid:{
                    color:cssVar("--text-secondary")
                },

                title:{

                    display:true,

                    text:"DATE",

                    color:"#FFFFFF",

                    padding:{
                        top:12
                    },

                    font:{
                        size:14,
                        weight:"600"
                    }

                }

            },

            y:{

                ticks:{

                    color:cssVar("--text-secondary"),

                    font:{
                        size:12,
                        weight:"500"
                    }

                },

                grid:{
                    color:cssVar("--text-secondary")
                },

                title:{

                    display:true,

                    text:"Current (A)",

                    color:"#FFFFFF",

                    padding:{
                        bottom:12
                    },

                    font:{
                        size:14,
                        weight:"600"
                    }

                }

            }

        },

    }

});

if(window.monthlyChart){

    monthlyChart.update();

}

// ======================================================
// UPDATE MONTHLY
// ======================================================

function updateMonthlyChart(parameter = selectedParameter){
    monthlyChart.options.scales.x.title.text =
    "DATE";

    monthlyChart.options.scales.y.title.text =
    unitMap[selectedParameter];

    graphTitle.textContent =
    "MONTHLY ANALYTICS";

    graphSubtitle.textContent =
    `${parameterConfig[selectedParameter].label} - Daily Average`;

    chartMode = "monthly";

    selectedParameter = parameter;

    backButton.style.display = "none";

    const now = new Date();

    const visibleData = HISTORY.filter(day => {

        return day.day < now.getDate();

    });

    monthlyChart.data.labels =
        visibleData.map(day => day.day);

    monthlyChart.data.datasets[0].label =
        parameterConfig[parameter].label;

    monthlyChart.data.datasets[0].data =
        visibleData.map(day => day.average[parameter]);

    monthlyChart.update();

}

updateMonthlyChart();

function updateDailyChart(day){
    monthlyChart.options.scales.x.title.text =
    "Time (WIB)";

    monthlyChart.options.scales.y.title.text =
    unitMap[selectedParameter];

    const months=[
    "January","February","March",
    "April","May","June",
    "July","August","September",
    "October","November","December"
    ];

    graphTitle.textContent =
    "DAILY ANALYTICS";

    graphSubtitle.textContent =
    `${day} ${months[7]} 2026`;

    chartMode = "daily";

    selectedDay = day;

    backButton.style.display = "inline-flex";

    const data =
        HISTORY.find(d=>d.day===day);

    const now = new Date();

    let hourlyData = data.hourly;

    if(day === now.getDate()){

        hourlyData = data.hourly.filter(item=>{

            return new Date(item.datetime).getHours()

                <= now.getHours();

        });

    }

    monthlyChart.data.labels =
    hourlyData.map(item=>{

        const hour =
        new Date(item.datetime).getHours();

        return `${hour.toString().padStart(2,"0")}.00`;

    });

    monthlyChart.data.datasets[0].label =
        parameterConfig[selectedParameter].label;

    monthlyChart.data.datasets[0].data =
    hourlyData.map(
        item=>item[selectedParameter]
    );

    monthlyChart.update();

}

const filterButtons = document.querySelectorAll(
    "#graphic .filter-btn"
);

filterButtons.forEach(btn => {

    btn.addEventListener("click", () => {

        filterButtons.forEach(b => b.classList.remove("active"));
        btn.classList.add("active");

        selectedParameter = btn.dataset.parameter;

        console.log(selectedParameter);

        if (chartMode === "monthly") {
            updateMonthlyChart(selectedParameter);
        } else {
            updateDailyChart(selectedDay);
        }

    });

});

setInterval(()=>{

    if(chartMode==="monthly"){

        updateMonthlyChart();

    }

    else{

        updateDailyChart(selectedDay);

    }

},60000);