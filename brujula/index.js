// ── Estilos ────────────────────────────────────────────────────────────────
document.body.style.cssText = `
  margin: 0;
  background: #121212;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100vh;
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
  color: #FFFFFF;
  overflow: hidden;
`;

document.body.innerHTML = `
  <div id="wrapper" style="display:flex;flex-direction:column;align-items:center;gap:24px;">

    <!-- Aguja -->
    <div style="position:relative;width:260px;height:260px;">

      <!-- Círculo exterior -->
      <div style="
        position:absolute;inset:0;
        border-radius:50%;
        border:2px solid #2A2A2A;
        background:#1A1A1A;
      "></div>

      <!-- Puntos cardinales -->
      <div id="norte" style="position:absolute;top:12px;left:50%;transform:translateX(-50%);font-size:14px;font-weight:600;color:#F4A300;">N</div>
      <div style="position:absolute;bottom:12px;left:50%;transform:translateX(-50%);font-size:14px;color:#666;">S</div>
      <div style="position:absolute;right:12px;top:50%;transform:translateY(-50%);font-size:14px;color:#666;">E</div>
      <div style="position:absolute;left:12px;top:50%;transform:translateY(-50%);font-size:14px;color:#666;">O</div>

      <!-- Aguja -->
      <div id="aguja" style="
        position:absolute;
        top:50%;left:50%;
        width:4px;height:100px;
        margin-left:-2px;margin-top:-80px;
        transform-origin:bottom center;
        transition:transform 0.2s ease;
      ">
        <div style="width:0;height:0;border-left:6px solid transparent;border-right:6px solid transparent;border-bottom:80px solid #F4A300;margin-left:-4px;"></div>
        <div style="width:0;height:0;border-left:6px solid transparent;border-right:6px solid transparent;border-top:30px solid #444;margin-left:-4px;"></div>
      </div>

      <!-- Centro -->
      <div style="
        position:absolute;top:50%;left:50%;
        width:12px;height:12px;
        background:#F4A300;
        border-radius:50%;
        transform:translate(-50%,-50%);
      "></div>
    </div>

    <!-- Grados y dirección -->
    <div style="text-align:center;">
      <div id="grados" style="font-size:56px;font-weight:300;color:#FFFFFF;line-height:1;">0°</div>
      <div id="direccion" style="font-size:18px;color:#F4A300;margin-top:8px;letter-spacing:2px;">NORTE</div>
    </div>

    <!-- Coordenadas -->
    <div id="coords" style="
      display:flex;gap:24px;
      background:#1A1A1A;
      padding:12px 24px;
      border-radius:12px;
      font-size:13px;
      color:#666;
    ">
      <span id="lat">Lat: --</span>
      <span id="lng">Lng: --</span>
    </div>

    <!-- Sin sensor -->
    <div id="error" style="display:none;color:#666;font-size:14px;text-align:center;padding:0 32px;">
      Este dispositivo no tiene sensor de orientación disponible.
    </div>
  </div>
`;

// ── Lógica ─────────────────────────────────────────────────────────────────
const aguja = document.getElementById('aguja');
const gradosEl = document.getElementById('grados');
const direccionEl = document.getElementById('direccion');
const errorEl = document.getElementById('error');

const direcciones = [
  'NORTE','NOR-ESTE','ESTE','SUR-ESTE',
  'SUR','SUR-OESTE','OESTE','NOR-OESTE'
];

function actualizarAguja(grados) {
  aguja.style.transform = `rotate(${grados}deg)`;
  gradosEl.textContent = Math.round(grados) + '°';
  const idx = Math.round(grados / 45) % 8;
  direccionEl.textContent = direcciones[idx];
}

// Intentar con deviceorientationabsolute primero
let sensorActivo = false;

window.addEventListener('deviceorientationabsolute', (e) => {
  if (e.alpha === null) return;
  sensorActivo = true;
  actualizarAguja(360 - e.alpha);
}, true);

// Fallback a deviceorientation
window.addEventListener('deviceorientation', (e) => {
  if (sensorActivo || e.alpha === null) return;
  actualizarAguja(360 - e.alpha);
}, true);

// Mostrar error si no hay sensor tras 3 segundos
setTimeout(() => {
  if (!sensorActivo) {
    errorEl.style.display = 'block';
  }
}, 3000);

// GPS opcional para coordenadas
if (navigator.geolocation) {
  navigator.geolocation.watchPosition((pos) => {
    document.getElementById('lat').textContent =
      'Lat: ' + pos.coords.latitude.toFixed(4) + '°';
    document.getElementById('lng').textContent =
      'Lng: ' + pos.coords.longitude.toFixed(4) + '°';
  }, () => {}, { enableHighAccuracy: true });
}