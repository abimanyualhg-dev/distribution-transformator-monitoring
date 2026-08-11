const currentDate = document.getElementById("currentDate");
const currentTime = document.getElementById("currentTime");

function updateDateTime(){

    const now = new Date();

    currentTime.textContent =
        now.toLocaleTimeString("en-GB");

    currentDate.textContent =
        now.toLocaleDateString("en-GB",{

            weekday:"long",
            day:"numeric",
            month:"long",
            year:"numeric"

        });

}

updateDateTime();

setInterval(updateDateTime,1000);