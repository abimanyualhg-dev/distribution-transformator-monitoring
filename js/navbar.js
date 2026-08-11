lucide.createIcons();

const buttons = [...document.querySelectorAll(".nav-btn")];
const pill = document.querySelector(".active-pill");

function updatePill(target){

    const index = buttons.indexOf(target);

    const positions = [
        7,      //Dashboard
        135,    //Graphic 
        263     //AI
    ];

    pill.style.left = positions[index] + "px";

}

buttons.forEach(button => {

    button.addEventListener("click", () => {

        const current = document.querySelector(".nav-btn.active");

        if (current === button) return;

        current?.classList.remove("active");
        button.classList.add("active");

        updatePill(button);

        const target =
        document.getElementById(button.dataset.target);

        if(target){

            const pages =
            document.querySelector(".pages");

            pages.style.transform =
            `translateX(-${buttons.indexOf(button)*100}vw)`;

        }
    });

});

window.addEventListener("load",()=>{

    updatePill(
        document.querySelector(".nav-btn.active"),
        false
    );

});

window.addEventListener("resize",()=>{

    updatePill(
        document.querySelector(".nav-btn.active"),
        false
    );

});