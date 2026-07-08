//----------------------------------------------------
// Medidor de Sonido
//----------------------------------------------------

const COLORS = {
    background: "#121212",
    primary: "#F4A300",
    surface: "#2A2A2A",
    textPrimary: "#FFFFFF",
    textSecondary: "#666666",
    textTertiary: "#4D4D4D",
    accentSoft: "#2B1F00",
    error: "#E53935",
    success: "#4CAF50"
};

document.body.innerHTML = `
<style>

*{
    margin:0;
    padding:0;
    box-sizing:border-box;
}

body{
    overflow:hidden;
    background:${COLORS.background};
    color:${COLORS.textPrimary};
    font-family:Arial, Helvetica, sans-serif;
}

.container{
    display:flex;
    flex-direction:column;
    align-items:center;
    justify-content:center;
    height:100vh;
    padding:24px;
}

.circulo{

    width:260px;
    height:260px;

    border:5px solid ${COLORS.primary};
    border-radius:50%;

    background:${COLORS.surface};

    position:relative;

    box-shadow:0 0 18px rgba(0,0,0,.35);

    display:flex;
    align-items:center;
    justify-content:center;

    transition:box-shadow .1s linear, border-color .1s linear;

}

.anilloNivel{

    position:absolute;

    left:-5px;
    top:-5px;

    width:260px;
    height:260px;

    border-radius:50%;

    background:conic-gradient(
        ${COLORS.primary} 0deg,
        transparent 0deg
    );

    -webkit-mask:radial-gradient(farthest-side, transparent calc(100% - 10px), #000 calc(100% - 10px));
    mask:radial-gradient(farthest-side, transparent calc(100% - 10px), #000 calc(100% - 10px));

    transition:.05s linear;

}

.valorDb{

    font-size:42px;
    font-weight:bold;
    color:${COLORS.textPrimary};
    z-index:1;

}

.unidadDb{

    font-size:14px;
    color:${COLORS.textSecondary};
    z-index:1;

}

.texto{

    margin-top:35px;

    text-align:center;

}

.valor{

    font-size:26px;
    font-weight:bold;
    color:${COLORS.textPrimary};

}

.subtitulo{

    margin-top:10px;
    font-size:16px;
    color:${COLORS.textSecondary};

}

.error{

    margin-top:14px;
    font-size:13px;
    color:${COLORS.error};
    text-align:center;
    max-width:280px;

}

.btnToggle{

    margin-top:24px;

    padding:12px 32px;

    font-size:16px;
    font-weight:bold;

    border:none;
    border-radius:24px;

    background:${COLORS.primary};
    color:${COLORS.background};

    box-shadow:0 0 15px rgba(244,163,0,.35);

}

.btnToggle.activo{

    background:${COLORS.error};
    box-shadow:0 0 15px rgba(229,57,53,.35);

}

</style>

<div class="container">

    <div class="circulo" id="circulo">

        <div class="anilloNivel" id="anillo"></div>

        <div>
            <div class="valorDb" id="valorDb">--</div>
            <div class="unidadDb">dB</div>
        </div>

    </div>

    <div class="texto">

        <div class="valor" id="pico">
            Pico: -- dB
        </div>

        <div class="subtitulo" id="estado">
            Toca iniciar para medir
        </div>

    </div>

    <button class="btnToggle" id="btnToggle">Iniciar</button>

    <div class="error" id="error"></div>

</div>
`;

const elCirculo = document.getElementById("circulo");
const elAnillo = document.getElementById("anillo");
const elValorDb = document.getElementById("valorDb");
const elPico = document.getElementById("pico");
const elEstado = document.getElementById("estado");
const elBoton = document.getElementById("btnToggle");
const elError = document.getElementById("error");

const REF_DB = 0.00002;
const DB_MIN = 0;
const DB_MAX = 100;

const ESTADO = {
    ejecutando: false,
    audioContext: null,
    analyser: null,
    microfono: null,
    stream: null,
    rafId: null,
    picoMax: -Infinity
};

function calcularDb(analyser) {

    const buffer = new Float32Array(analyser.fftSize);
    analyser.getFloatTimeDomainData(buffer);

    let sumaCuadrados = 0;

    for (let i = 0; i < buffer.length; i++) {
        sumaCuadrados += buffer[i] * buffer[i];
    }

    const rms = Math.sqrt(sumaCuadrados / buffer.length);

    if (rms < 1e-8) return 0;

    const db = 20 * Math.log10(rms / REF_DB) - 94;

    return Math.max(0, db);

}

function actualizarUI(db) {

    const dbMostrado = Math.round(db);

    elValorDb.innerHTML = dbMostrado;

    const porcentaje = Math.min(100, Math.max(0, (db - DB_MIN) / (DB_MAX - DB_MIN))) * 360;

    elAnillo.style.background =
        "conic-gradient(" + COLORS.primary + " " + porcentaje + "deg, transparent " + porcentaje + "deg)";

    if (db > ESTADO.picoMax) {
        ESTADO.picoMax = db;
        elPico.innerHTML = "Pico: " + Math.round(ESTADO.picoMax) + " dB";
    }

    if (db < 45) {
        elCirculo.style.borderColor = COLORS.success;
        elCirculo.style.boxShadow = "0 0 20px rgba(76,175,80,.5)";
    } else if (db < 75) {
        elCirculo.style.borderColor = COLORS.primary;
        elCirculo.style.boxShadow = "0 0 18px rgba(244,163,0,.4)";
    } else {
        elCirculo.style.borderColor = COLORS.error;
        elCirculo.style.boxShadow = "0 0 20px rgba(229,57,53,.5)";
    }

}

function loop() {

    if (!ESTADO.ejecutando || !ESTADO.analyser) return;

    const db = calcularDb(ESTADO.analyser);

    actualizarUI(db);

    ESTADO.rafId = requestAnimationFrame(loop);

}

async function iniciar() {

    elError.innerHTML = "";

    try {

        ESTADO.stream = await navigator.mediaDevices.getUserMedia({
            audio: {
                echoCancellation: false,
                noiseSuppression: false,
                autoGainControl: false
            }
        });

    } catch (e) {

        elError.innerHTML = "No se pudo acceder al micrófono. Verifica los permisos.";
        return;

    }

    ESTADO.audioContext = new (window.AudioContext || window.webkitAudioContext)();
    ESTADO.microfono = ESTADO.audioContext.createMediaStreamSource(ESTADO.stream);
    ESTADO.analyser = ESTADO.audioContext.createAnalyser();
    ESTADO.analyser.fftSize = 2048;

    ESTADO.microfono.connect(ESTADO.analyser);

    ESTADO.ejecutando = true;
    ESTADO.picoMax = -Infinity;

    elPico.innerHTML = "Pico: -- dB";
    elEstado.innerHTML = "Midiendo...";
    elBoton.innerHTML = "Detener";
    elBoton.classList.add("activo");

    loop();

}

function detener() {

    ESTADO.ejecutando = false;

    if (ESTADO.rafId) cancelAnimationFrame(ESTADO.rafId);

    if (ESTADO.stream) {
        ESTADO.stream.getTracks().forEach(track => track.stop());
        ESTADO.stream = null;
    }

    if (ESTADO.audioContext) {
        ESTADO.audioContext.close();
        ESTADO.audioContext = null;
    }

    ESTADO.analyser = null;
    ESTADO.microfono = null;

    elBoton.innerHTML = "Iniciar";
    elBoton.classList.remove("activo");

    elValorDb.innerHTML = "--";
    elAnillo.style.background = "conic-gradient(" + COLORS.primary + " 0deg, transparent 0deg)";
    elEstado.innerHTML = "Toca iniciar para medir";

    elCirculo.style.borderColor = COLORS.primary;
    elCirculo.style.boxShadow = "0 0 18px rgba(0,0,0,.35)";

}

elBoton.addEventListener("click", function () {

    if (ESTADO.ejecutando) {
        detener();
    } else {
        iniciar();
    }

});
