const robot=document.getElementById("robot");
const eyes = document.querySelectorAll(".eye");
const mouth = document.querySelector(".mouth");
const mouthStyles = [

    {
        width:"42px",
        height:"4px",
        radius:"999px"
    },

    {
        width:"26px",
        height:"4px",
        radius:"999px"
    },

    {
        width:"42px",
        height:"2px",
        radius:"999px"
    },

    {
        width:"36px",
        height:"6px",
        radius:"3px"
    },

    {
        width:"30px",
        height:"3px",
        radius:"999px"
    }

];

function changeMouth(){

    const s = mouthStyles[
        Math.floor(Math.random()*mouthStyles.length)
    ];

    mouth.style.width = s.width;
    mouth.style.height = s.height;
    mouth.style.borderRadius = s.radius;

}

function randomMouth(){

    changeMouth();

    const next =

        2000 + Math.random()*5000;

    setTimeout(randomMouth,next);

}

randomMouth();

function blink(){

    eyes.forEach(eye=>{

        eye.style.height="3px";

        eye.style.borderRadius="4px";

    });

    setTimeout(()=>{

        eyes.forEach(eye=>{

            eye.style.height="22px";

            eye.style.borderRadius="10px";

        });

    },120);

}

function randomBlink(){

    blink();

    if(Math.random()<0.25){

        setTimeout(blink,220);

    }

    const next = 2500 + Math.random()*5000;

    setTimeout(randomBlink,next);

}

randomBlink();

setInterval(blink,5000);

setInterval(()=>{

    blink();

},5000+Math.random()*4000);