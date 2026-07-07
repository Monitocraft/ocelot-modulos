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

    <!-- Título -->
    <div style="font-size:14px;font-weight:600;color:#666;letter-spacing:2px;">NIVEL DE SONIDO</div>

    <!-- Vúmet -->
    <div style="display:flex;gap:6px;align-items:flex-end;height:220px;">

      <!-- Barra izquierda -->
      <div style="position:relative;width:36px;height:220px;background:#1A1A1A;border-radius:6px;overflow:hidden;">
        <div id="barra-l" style="
          position:absolute;bottom:0;left:0;right:0;
          height:0%;
          background:linear-gradient(to top, #F4A300 0%, #F4A300 60%, #ff8800 80%, #ff3300 100%);
          border-radius:6px;
          transition:height 0.05s ease;
        "></div>
      </div>

      <!-- Escala dB central -->
      <div style="display:flex;flex-direction:column;justify-content:space-between;height:220px;padding:2px 0;width:40px;text-align:center;">
        <span style="font-size:10px;color:#ff3300;">0</span>
        <span style="font-size:10px;color:#ff8800;">-6</span>
        <span style="font-size:10px;color:#ff8800;">-12</span>
        <span style="font-size:10px;color:#F4A300;">-20</span>
        <span style="font-size:10px;color:#F4A300;">-30</span>
        <span style="font-size:10px;color:#666;">-40</span>
        <span style="font-size:10px;color:#666;">-60</span>
      </div>

      <!-- Barra derecha -->
      <div style="position:relative;width:36px;height:220px;background:#1A1A1A;border-radius:6px;overflow:hidden;">
        <div id="barra-r" style="
          position:absolute;bottom:0;left:0;right:0;
          height:0%;
          background:linear-gradient(to top, #F4A300 0%, #F4A300 60%, #ff8800 80%, #ff3300 100%);
          border-radius:6px;
          transition:height 0.05s ease;
        "></div>
      </div>

    </div>

    <!-- dB actuales -->
    <div style="text-align:center;">
      <div id="db-valor" style="font-size:56px;font-weight:300;color:#FFFFFF;line-height:1;">—</div>
      <div style="font-size:18px;color:#F4A300;margin-top:8px;letter-spacing:2px;">dB</div>
    </div>

    <!-- Clasificación -->
    <div id="clasificacion" style="
      background:#1A1A1A;
      padding:12px 24px;
      border-radius:12px;
      font-size:13px;
      color:#666;
      letter-spacing:1px;
    ">Esperando micrófono...</div>

    <!-- Error -->
    <div id="error" style="display:none;color:#666;font-size:14px;text-align:center;padding:0 32px;">
      No se pudo acceder al micrófono. Verifica los permisos.
    </div>

  </div>
`;

// ── Lógica ─────────────────────────────────────────────────────────────────
const barraL       = document.getElementById('barra-l');
const barraR       = document.getElementById('barra-r');
const dbValorEl    = document.getElementById('db-valor');
const clasificEl   = document.getElementById('clasificacion');
const errorEl      = document.getElementById('error');

// Convierte valor RMS (0–1) a dBFS (-∞ a 0)
function rmsADecibeles(rms) {
  if (rms === 0) return -Infinity;
  return 20 * Math.log10(rms);
}

// Mapea dBFS (-60 a 0) a porcentaje de barra (0% a 100%)
function dbAPorcentaje(db) {
  const min = -60;
  const max = 0;
  const pct = ((db - min) / (max - min)) * 100;
  return Math.max(0, Math.min(100, pct));
}

function clasificarSonido(db) {
  if (db < -50) return { texto: 'SILENCIO',  color: '#666' };
  if (db < -30) return { texto: 'SUAVE',     color: '#F4A300' };
  if (db < -15) return { texto: 'MODERADO',  color: '#F4A300' };
  if (db < -6)  return { texto: 'ALTO',      color: '#ff8800' };
  return               { texto: 'MUY ALTO',  color: '#ff3300' };
}

function actualizarUI(db) {
  const pct = dbAPorcentaje(db) + '%';
  barraL.style.height = pct;
  barraR.style.height = pct;

  dbValorEl.textContent = isFinite(db) ? Math.round(db) : '—';

  const { texto, color } = clasificarSonido(db);
  clasificEl.textContent = texto;
  clasificEl.style.color = color;
}

// ── Inicializar Web Audio API ───────────────────────────────────────────────
(async () => {
  try {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true, video: false });

    const audioCtx  = new (window.AudioContext || window.webkitAudioContext)();
    const source    = audioCtx.createMediaStreamSource(stream);
    const analyser  = audioCtx.createAnalyser();

    analyser.fftSize = 256;
    analyser.smoothingTimeConstant = 0.6;
    source.connect(analyser);

    const buffer = new Float32Array(analyser.fftSize);

    clasificEl.textContent = 'SILENCIO';

    function loop() {
      analyser.getFloatTimeDomainData(buffer);

      // Calcular RMS
      let sumaCuadrados = 0;
      for (let i = 0; i < buffer.length; i++) {
        sumaCuadrados += buffer[i] * buffer[i];
      }
      const rms = Math.sqrt(sumaCuadrados / buffer.length);
      const db  = rmsADecibeles(rms);

      actualizarUI(isFinite(db) ? db : -60);
      requestAnimationFrame(loop);
    }

    loop();

  } catch (err) {
    errorEl.style.display = 'block';
    clasificEl.style.display = 'none';
    console.error('Error micrófono:', err);
  }
})();
