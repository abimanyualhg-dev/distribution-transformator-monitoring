const themeToggle = document.getElementById("themeToggle");

const savedTheme =
localStorage.getItem("theme") || "dark";

setTheme(savedTheme);

themeToggle.addEventListener("click",()=>{

    const current =
    document.body.classList.contains("light-mode")
    ? "light"
    : "dark";

    setTheme(
        current==="dark"
        ? "light"
        : "dark"
    );

});

function setTheme(mode){

    if(mode==="light"){

        document.body.classList.add("light-mode");

        updateThemeIcon("sun");

    }else{

        document.body.classList.remove("light-mode");

        updateThemeIcon("moon");

    }

    localStorage.setItem("theme",mode);

    if (
        window.monthlyChart &&
        monthlyChart.options &&
        monthlyChart.options.scales
    ) {

        const isLight =
        document.body.classList.contains("light-mode");

        const axisColor =
        isLight ? "#475569" : "#FFFFFF";

        const titleColor =
        isLight ? "#334155" : "#FFFFFF";

        monthlyChart.options.scales.x.ticks.color = axisColor;
        monthlyChart.options.scales.y.ticks.color = axisColor;

        monthlyChart.options.scales.x.title.color = titleColor;
        monthlyChart.options.scales.y.title.color = titleColor;

        monthlyChart.update();

    }

}

function updateThemeIcon(icon){
    themeToggle.animate(

    [
        {transform:"scale(1)"},
        {transform:"scale(.82)"},
        {transform:"scale(1)"}
    ],

    {
        duration:220,
        easing:"cubic-bezier(.22,1,.36,1)"
    }

    );


    themeToggle.classList.add("switching");

    setTimeout(()=>{

        themeToggle.innerHTML =
        `<i data-lucide="${icon}"></i>`;

        lucide.createIcons();

        themeToggle.classList.remove("switching");

    },180);

}