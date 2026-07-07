//----------------------------------------------------
// Medidor de Inclinación
//----------------------------------------------------

document.body.innerHTML = `
<style>

body{
    margin:0;
    overflow:hidden;
    background:#111;
    color:white;
    font-family:Arial;
}

.container{
    display:flex;
    flex-direction:column;
    align-items:center;
    justify-content:center;
    height:100vh;
}

.circulo{

    width:260px;
    height:260px;

    border:5px solid white;
    border-radius:50%;

    position:relative;

}

.burbuja{

    width:36px;
    height:36px;

    background:#00ff66;
    border-radius:50%;

    position:absolute;

    left:50%;
    top:50%;

    transform:translate(-50%,-50%);

    transition:.05s linear;

}

.texto{

    margin-top:30px;
    font-size:24px;
    text-align:center;

}

</style>

<div class="container">

    <div class="circulo">

        <div class="burbuja" id="bubble"></div>

    </div>

    <div class="texto">

        <div id="pitch">Pitch: 0°</div>
        <div id="roll">Roll: 0°</div>

    </div>

</div>
`;

const bubble = document.getElementById("bubble");
const pitchText = document.getElementById("pitch");
const rollText = document.getElementById("roll");

const RADIO = 100;

window._onOrientacion = function(alpha,pitch,roll){

    pitchText.innerHTML =
        "Pitch: " + pitch.toFixed(1) + "°";

    rollText.innerHTML =
        "Roll: " + roll.toFixed(1) + "°";

    //--------------------------------------------------
    // Limitar movimiento
    //--------------------------------------------------

    let x = (roll / 45) * RADIO;
    let y = (pitch / 45) * RADIO;

    if(x > RADIO) x = RADIO;
    if(x < -RADIO) x = -RADIO;

    if(y > RADIO) y = RADIO;
    if(y < -RADIO) y = -RADIO;

    bubble.style.left =
        (130 + x) + "px";

    bubble.style.top =
        (130 + y) + "px";

};