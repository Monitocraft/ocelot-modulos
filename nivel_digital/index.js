//-----------------------------------------------------
// NIVEL DIGITAL
//-----------------------------------------------------

const COLORS = {

    background:"#121212",
    primary:"#F4A300",
    surface:"#2A2A2A",
    text:"#FFFFFF",
    secondary:"#666666",
    accent:"#2B1F00",
    error:"#E53935"

};

document.body.innerHTML = `

<style>

*{
    margin:0;
    padding:0;
    box-sizing:border-box;
    user-select:none;
}

body{

    background:${COLORS.background};
    color:${COLORS.text};

    font-family:Arial,Helvetica,sans-serif;

    display:flex;
    justify-content:center;
    align-items:center;

    height:100vh;

}

.container{

    width:100%;
    padding:24px;

}

.card{

    background:${COLORS.surface};

    border-radius:25px;

    padding:30px;

    box-shadow:0 0 20px rgba(0,0,0,.45);

}

.title{

    text-align:center;

    font-size:22px;

    margin-bottom:30px;

}

.angle{

    font-size:72px;

    color:${COLORS.primary};

    text-align:center;

    font-weight:bold;

}

.label{

    text-align:center;

    color:${COLORS.secondary};

    margin-bottom:35px;

}

.level{

    width:100%;
    height:18px;

    background:#444;

    border-radius:30px;

    position:relative;

}

.center{

    position:absolute;

    left:50%;

    top:-12px;

    width:3px;

    height:42px;

    background:${COLORS.primary};

    transform:translateX(-50%);

}

.bubble{

    position:absolute;

    width:28px;

    height:28px;

    border-radius:50%;

    background:${COLORS.primary};

    top:50%;

    transform:translate(-50%,-50%);

    transition:.05s linear;

    box-shadow:0 0 15px rgba(244,163,0,.45);

}

.info{

    display:flex;

    justify-content:space-between;

    margin-top:30px;

    color:${COLORS.secondary};

    font-size:18px;

}

.estado{

    margin-top:35px;

    text-align:center;

    font-size:22px;

    font-weight:bold;

    color:${COLORS.primary};

}

</style>

<div class="container">

<div class="card">

<div class="title">
Nivel Digital
</div>

<div class="angle" id="angulo">
0.0°
</div>

<div class="label">
Inclinación
</div>

<div class="level">

<div class="center"></div>

<div class="bubble" id="bubble"></div>

</div>

<div class="info">

<div id="pitch">
Pitch: 0°
</div>

<div id="roll">
Roll: 0°
</div>

</div>

<div class="estado" id="estado">

Nivelado

</div>

</div>

</div>

`;

const bubble=document.getElementById("bubble");
const angulo=document.getElementById("angulo");
const estado=document.getElementById("estado");

const pitchLabel=document.getElementById("pitch");
const rollLabel=document.getElementById("roll");

const MAX=45;

window._onOrientacion=function(alpha,pitch,roll){

    pitchLabel.innerHTML="Pitch: "+pitch.toFixed(1)+"°";
    rollLabel.innerHTML="Roll: "+roll.toFixed(1)+"°";

    //------------------------------------------------
    // Se usa el eje con mayor inclinación
    //------------------------------------------------

    let angle=Math.abs(pitch)>Math.abs(roll)?pitch:roll;

    angulo.innerHTML=Math.abs(angle).toFixed(1)+"°";

    //------------------------------------------------
    // Movimiento de la burbuja
    //------------------------------------------------

    let pos=(angle/MAX)*50;

    if(pos>50) pos=50;
    if(pos<-50) pos=-50;

    bubble.style.left=(50+pos)+"%";

    //------------------------------------------------
    // Estado
    //------------------------------------------------

    if(Math.abs(angle)<1){

        estado.innerHTML="✔ Nivelado";
        estado.style.color="#00C853";
        bubble.style.background="#00C853";

    }
    else{

        estado.innerHTML="Desnivel";
        estado.style.color=COLORS.primary;
        bubble.style.background=COLORS.primary;

    }

};