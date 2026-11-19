// ACOMPAÑAMIENTO PEDAGÓGICO · actividades creadas para Administración
// experimento (predecir y observar una sesión animada), perillas (ajustar cuánto dirige y cuánto apoya),
// escena (explorar una ilustración y ubicar cada pista) y girar (tarjetas: lo que se dice y lo que se hace).
import { esc, md } from './estado.js';

const quieto = () => window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
const caja = (cls, etq, b, resuelto, cuerpo) => `<div class="interactivo ${cls} ${resuelto ? 'resuelto' : ''}"><div class="etq">${esc(b.etiqueta || etq)}</div>
  ${b.titulo ? `<h3>${esc(b.titulo)}</h3>` : ''}${b.consigna ? `<div class="consigna">${md(b.consigna)}</div>` : ''}${cuerpo}</div>`;

/* ------------------------------------------------------------------ experimento */
// Tres salas con un grupo trabajando y una barra de "trabajo del grupo". Primero se mira la sesión;
// después quien coordina sale y la persona predice en qué sala se sigue trabajando igual.
function sala(g, k) {
  if (g.img) return `<div class="ex-escena" aria-hidden="true">
      <img class="ex-mesa ex-mesa-si" src="${esc(g.img.trabajando)}" alt="" loading="lazy">
      <img class="ex-mesa ex-mesa-no" src="${esc(g.img.sin_trabajar)}" alt="" loading="lazy">
      <img class="ex-coord ex-coord-img" src="${esc(g.img.coord)}" alt="" loading="lazy"></div>`;
  const chicos = [[52, 120], [92, 112], [132, 112], [172, 120]].map(([x, y], i) =>
    `<g class="ex-chico" style="--i:${i}"><circle cx="${x}" cy="${y - 22}" r="11" fill="#F0C9A6"/><rect x="${x - 13}" y="${y - 10}" width="26" height="26" rx="10" fill="${g.color}"/></g>`).join('');
  return `<svg viewBox="0 0 224 170" class="ex-svg" aria-hidden="true">
    <rect x="0" y="0" width="224" height="170" rx="16" fill="#F7F4FD"/>
    <rect x="18" y="126" width="188" height="16" rx="7" fill="#C9B9E8"/>${chicos}
    <g class="ex-coord"><circle cx="196" cy="58" r="13" fill="#DDA47C"/><rect x="181" y="72" width="30" height="44" rx="11" fill="#1B1A4A"/>
      ${k === 2 ? '<rect x="189" y="82" width="12" height="18" rx="2" fill="#7fb2ff"/>' : '<path d="M181 84 L160 74" stroke="#1B1A4A" stroke-width="9" stroke-linecap="round"/>'}</g>
    <g class="ex-dudas"><text x="70" y="66" font-size="22" font-weight="800" fill="${g.color}">?</text><text x="148" y="60" font-size="22" font-weight="800" fill="${g.color}">?</text></g>
  </svg>`;
}
export function bExperimento(w, b, resuelto, marcar) {
  const salas = b.grupos.map((g, k) => `<div class="ex-sala" data-k="${k}" style="--c:${g.color}"><h4>${esc(g.nombre)}</h4>${sala(g, k)}
    <div class="ex-barra-rot">Trabajo del grupo</div><div class="ex-barra"><i></i></div><p class="ex-nota"></p></div>`).join('');
  w.innerHTML = caja('experimento', '🧪 Recreá el experimento', b, resuelto, `<div class="ex-salas">${salas}</div>
    <p class="ayuda ex-aviso">${md(b.aviso || '')}</p><div class="ex-paso"></div><div class="fbz"></div>`);
  const raiz = w.firstElementChild, paso = raiz.querySelector('.ex-paso'), fb = raiz.querySelector('.fbz');
  const salasEl = [...raiz.querySelectorAll('.ex-sala')];
  const barra = (k, v) => { salasEl[k].querySelector('.ex-barra i').style.width = Math.round(v * 100) + '%'; salasEl[k].classList.toggle('trabaja', v >= 0.5); salasEl[k].classList.toggle('flojo', raiz.classList.contains('salio') && v > 0 && v < 0.5); };
  const inicio = () => {
    raiz.classList.remove('salio'); fb.innerHTML = '';
    salasEl.forEach(x => x.classList.remove('elegida', 'atenuada'));
    salasEl.forEach((s, k) => { barra(k, 0); s.classList.remove('trabaja', 'flojo', 'sin-coord', 'apagada'); s.querySelector('.ex-nota').textContent = ''; });
    paso.innerHTML = `<div class="acciones"><button class="btn chico" type="button">▶ Empezar la sesión</button></div>`;
    paso.querySelector('button').onclick = sesion;
  };
  const sesion = () => {
    b.grupos.forEach((g, k) => barra(k, g.presente));
    const opciones = b.grupos.map((g, k) => `<button class="ex-op" type="button" data-k="${k}">${esc(g.nombre)}</button>`).join('');
    paso.innerHTML = `<div class="ex-pregunta"><p><b>${md(b.pregunta)}</b></p><div class="ex-ops">${opciones}</div></div>`;
    paso.querySelectorAll('.ex-op').forEach(x => x.onclick = () => salir(+x.dataset.k));
  };
  const salir = elegido => {
    raiz.classList.add('salio');
    salasEl.forEach((x, k) => x.classList.add(k === elegido ? 'elegida' : 'atenuada'));
    b.grupos.forEach((g, k) => {
      salasEl[k].classList.add('sin-coord'); setTimeout(() => barra(k, g.sin ?? g.presente), quieto() ? 0 : 500);
      salasEl[k].querySelector('.ex-nota').textContent = g.nota_sin || '';
    });
    const ok = elegido === b.correcta;
    paso.innerHTML = '';
    setTimeout(() => {
      if (ok) {
        fb.innerHTML = `<div class="fb ok"><b>¡Bien! Lo que comprobaste:</b> ${md(b.explicacion)}</div><div class="acciones"><button class="btn chico sec" type="button">Mirarlo de nuevo</button></div>`;
        raiz.classList.add('resuelto'); marcar();
      } else {
        fb.innerHTML = `<div class="fb mal"><b>Mirá qué pasó en cada sala.</b> ${md(b.pista)}</div><div class="acciones"><button class="btn chico" type="button">Probar otra vez</button></div>`;
      }
      fb.querySelector('button').onclick = inicio;
    }, quieto() ? 0 : 1300);
  };
  if (resuelto) { b.grupos.forEach((g, k) => barra(k, g.presente)); fb.innerHTML = `<div class="fb ok"><b>Ya lo resolviste.</b> ${md(b.explicacion)}</div><div class="acciones"><button class="btn chico sec" type="button">Mirarlo de nuevo</button></div>`; fb.querySelector('button').onclick = inicio; }
  else inicio();
  return true;
}

/* ------------------------------------------------------------------ perillas */
const CARAS = {
  entusiasmo: '<path d="M-14 8 Q0 22 14 8Z" fill="#7a2f3a"/><path d="M30 -30 l3 7 7 3 -7 3 -3 7 -3 -7 -7 -3 7 -3z" fill="#F0731E"/>',
  desanimo: '<path d="M-12 14 Q0 4 12 14" stroke="#5a2a2a" stroke-width="3.5" fill="none" stroke-linecap="round"/><path d="M-20 -10 L-6 -15 M20 -10 L6 -15" stroke="#3a2a2a" stroke-width="3" stroke-linecap="round"/>',
  duda: '<path d="M-10 12 Q0 8 12 13" stroke="#5a2a2a" stroke-width="3.5" fill="none" stroke-linecap="round"/><path d="M-20 -14 L-6 -14 M6 -17 L20 -12" stroke="#3a2a2a" stroke-width="3" stroke-linecap="round"/><text x="30" y="-18" font-size="22" font-weight="800" fill="#4B4FA3">?</text>',
  confianza: '<path d="M-14 8 Q0 20 14 8" stroke="#5a2a2a" stroke-width="3.5" fill="none" stroke-linecap="round"/><path d="M34 -36 l4 9 10 1 -8 6 3 10 -9 -5 -9 5 3 -10 -8 -6 10 -1z" fill="#F5B82E"/>',
};
const PIELES = ['#F3CDA8', '#DDA47C', '#B5795A', '#7E5038'];
const cara = (animo, k) => `<svg viewBox="-50 -50 100 100" class="pr-cara" aria-hidden="true"><circle r="34" fill="${PIELES[k % 4]}"/>
  <path d="M-34 -6 Q-36 -42 0 -42 Q36 -42 34 -6 Q26 -28 0 -28 Q-26 -28 -34 -6Z" fill="#3a2516"/>
  <circle cx="-11" cy="-4" r="3.6" fill="#2a1d1d"/><circle cx="11" cy="-4" r="3.6" fill="#2a1d1d"/>${CARAS[animo] || ''}</svg>`;

export function bPerillas(w, b, resuelto, marcar) {
  const cuad = b.cuadros; // { Nombre: { x: 'alto'|'bajo', y: 'alto'|'bajo', color } }
  const zonas = Object.entries(cuad).map(([n, c]) => {
    const zx = c.x === 'alto' ? 150 : 0, zy = c.y === 'alto' ? 0 : 150;
    return `<g class="pr-zona" data-n="${esc(n)}" tabindex="0" role="button" aria-label="${esc(n)}"><rect x="${zx + 4}" y="${zy + 4}" width="142" height="142" rx="16" fill="${c.color}" fill-opacity=".12" stroke="${c.color}" stroke-width="3"/>
      <text x="${zx + 75}" y="${zy + 80}" text-anchor="middle" font-size="20" font-weight="800" fill="${c.color}">${esc(n)}</text>
      <text class="pr-marca" x="${zx + 75}" y="${zy + 112}" text-anchor="middle" font-size="26" font-weight="800" fill="${c.color}"></text></g>`;
  }).join('');
  w.innerHTML = caja('perillas', '👆 Elegí el estilo', b, resuelto, `<div class="pr-cont"></div><div class="pr-cols">
      <div class="pr-caso"></div>
      <div class="pr-mando"><div class="pr-plano-wrap"><span class="pr-eje-y">${esc(b.ejes.y)} ↑</span>
        <svg viewBox="0 0 300 300" class="pr-plano" role="group" aria-label="Plano con los cuatro estilos. Tocá el cuadro que corresponde.">${zonas}</svg>
        <span class="pr-eje-x">${esc(b.ejes.x)} →</span></div></div></div><div class="fbz"></div>`);
  const raiz = w.firstElementChild, caso = raiz.querySelector('.pr-caso'), fb = raiz.querySelector('.fbz'), cont = raiz.querySelector('.pr-cont');
  const zonasEl = [...raiz.querySelectorAll('.pr-zona')];
  let n = 0, esperando = false;
  const limpiar = () => zonasEl.forEach(z => { z.classList.remove('bien', 'mal'); z.querySelector('.pr-marca').textContent = ''; });
  const contador = () => { cont.innerHTML = `<div class="vj-cont"><span>Caso ${Math.min(n + 1, b.casos.length)} de ${b.casos.length}</span><div class="vj-puntos">${b.casos.map((_, k) => `<i class="${k < n ? 'ya' : k === n ? 'ahora' : ''}"></i>`).join('')}</div></div>`; };
  const mostrar = () => {
    const c = b.casos[n]; contador(); limpiar(); esperando = true;
    caso.innerHTML = `<div class="pr-ficha entra">${c.img ? `<img class="pr-retrato" src="${esc(c.img)}" alt="">` : cara(c.animo, n)}<div><h4>${esc(c.nombre)}</h4><p>${md(c.texto)}</p><p class="ayuda" style="margin-top:8px">Tocá en el plano el estilo que conviene usar.</p></div></div>`;
  };
  const elegir = z => {
    if (!esperando) return;
    const c = b.casos[n], e = z.dataset.n; limpiar();
    if (e !== c.estilo) { z.classList.add('mal'); z.querySelector('.pr-marca').textContent = '✗'; fb.innerHTML = `<div class="fb mal"><b>${esc(e)} no es el que conviene acá.</b> ${md(c.pista)}</div>`; return; }
    esperando = false; z.classList.add('bien'); z.querySelector('.pr-marca').textContent = '✓';
    const ult = n === b.casos.length - 1;
    fb.innerHTML = `<div class="fb ok"><b>¡Bien! ${esc(c.estilo)}.</b> ${md(c.explicacion)}</div><div class="acciones"><button class="btn chico" type="button">${ult ? 'Terminar' : 'Siguiente caso'}</button></div>`;
    const bt = fb.querySelector('button'); bt.focus({ preventScroll: true });
    bt.onclick = () => { fb.innerHTML = ''; n++; if (ult) fin(true); else mostrar(); };
  };
  zonasEl.forEach(z => { z.addEventListener('click', () => elegir(z)); z.addEventListener('keydown', ev => { if (ev.key === 'Enter' || ev.key === ' ') { ev.preventDefault(); elegir(z); } }); });
  const fin = nuevo => {
    n = b.casos.length; contador(); limpiar(); esperando = false;
    caso.innerHTML = `<div class="fb ok"><b>¡Listo!</b> ${md(b.cierre || '')}</div><button type="button" class="btn chico suave">Hacerlo otra vez</button>`;
    caso.querySelector('button').onclick = () => { n = 0; mostrar(); };
    if (nuevo) { raiz.classList.add('resuelto'); marcar(); }
  };
  resuelto ? fin(false) : mostrar();
  return true;
}

/* ------------------------------------------------------------------ reproductor de audio */
// Botón para escuchar, barra de avance, opción "más lento" y transcripción. Nunca arranca solo,
// salvo el cierre, que suena justo después de un toque del estudiante.
let sonando = null;
function reproductor(a, etiqueta = 'Escuchá') {
  const id = 'au' + Math.random().toString(36).slice(2, 8);
  const tr = (a.transcripcion || []).map(l => `<p><b>${esc(l.quien)}:</b> ${md(l.texto)}</p>`).join('');
  return `<div class="au" data-au="${id}"><audio preload="none" src="${esc(a.src)}"></audio>
    <div class="au-fila"><button type="button" class="au-play" aria-label="${esc(etiqueta)}"><span class="au-ic">▶</span><span class="au-tx">${esc(etiqueta)}</span></button>
      <div class="au-barra" aria-hidden="true"><i></i></div>
      <button type="button" class="au-lento" aria-pressed="false" title="Escuchar más lento">🐢 Más lento</button></div>
    ${tr ? `<div class="au-trans">${tr}</div>` : ''}</div>`;
}
function activarAudios(raiz) {
  raiz.querySelectorAll('.au:not([data-listo])').forEach(box => {
    box.dataset.listo = '1';
    const au = box.querySelector('audio'), bt = box.querySelector('.au-play'), barra = box.querySelector('.au-barra i'), lento = box.querySelector('.au-lento');
    const txt0 = bt.querySelector('.au-tx').textContent;
    const pintar = () => { const on = !au.paused; box.classList.toggle('sonando', on); bt.querySelector('.au-ic').textContent = on ? '❚❚' : '▶'; bt.querySelector('.au-tx').textContent = on ? 'Pausar' : txt0; };
    bt.onclick = () => { if (au.paused) { if (sonando && sonando !== au) sonando.pause(); sonando = au; au.play().catch(() => {}); } else au.pause(); };
    lento.onclick = () => { const on = lento.getAttribute('aria-pressed') !== 'true'; lento.setAttribute('aria-pressed', on); au.playbackRate = on ? 0.8 : 1; };
    au.addEventListener('play', () => { au.playbackRate = lento.getAttribute('aria-pressed') === 'true' ? 0.8 : 1; pintar(); });
    au.addEventListener('pause', pintar); au.addEventListener('ended', () => { pintar(); barra.style.width = '100%'; });
    au.addEventListener('timeupdate', () => { if (au.duration) barra.style.width = (au.currentTime / au.duration * 100) + '%'; });
  });
}
const tocarAudio = box => box?.querySelector('.au-play')?.click();

/* ------------------------------------------------------------------ escena */
export function bEscena(w, b, resuelto, marcar) {
  w.innerHTML = caja('escena', '🔍 Explorá la escena', b, resuelto, `${b.aviso ? `<p class="conv-aviso">${esc(b.aviso)}</p>` : ''}${b.audio_inicio ? `<div class="esc-intro">${reproductor(b.audio_inicio, 'Escuchá la bienvenida')}</div>` : ''}<div class="esc-cols"><div class="esc-lienzo" role="group" aria-label="${esc(b.alt || '')}"><p class="ayuda" style="padding:14px">Cargando la ilustración…</p></div>
    <div class="esc-panel" aria-live="polite"></div></div>`);
  const raiz = w.firstElementChild, lienzo = raiz.querySelector('.esc-lienzo'), panel = raiz.querySelector('.esc-panel');
  activarAudios(raiz);
  const cuerpoPista = p => p.audio ? reproductor({ src: p.audio, transcripcion: p.transcripcion }, 'Escuchar') : `<p>${md(p.texto)}</p>`;
  const hallado = new Set(); const marcas = {};
  const contador = () => `<div class="esc-cont"><b>${hallado.size} de ${b.pistas.length}</b> pistas ubicadas</div>`;
  const reposo = () => { panel.innerHTML = `${contador()}<p class="ayuda">Tocá una lupa de la ilustración para ver qué encontraste.</p>`; };
  const abrir = i => {
    const p = b.pistas[i];
    Object.values(marcas).forEach(m => m.classList.remove('sel')); marcas[i].classList.add('sel');
    if (hallado.has(i)) { panel.innerHTML = `${contador()}<div class="esc-pista">${cuerpoPista(p)}<div class="fb ok"><b>${esc(p.cat)}.</b> ${md(p.explicacion)}</div></div>`; activarAudios(panel); return; }
    panel.innerHTML = `${contador()}<div class="esc-pista entra">${cuerpoPista(p)}<p class="ayuda">¿En qué nivel de la cultura la ubicás?</p>
      <div class="esc-cats">${b.categorias.map(c => `<button type="button" class="esc-cat">${esc(c)}</button>`).join('')}</div><div class="fbz"></div></div>`;
    activarAudios(panel); if (p.audio) tocarAudio(panel.querySelector('.au'));
    panel.querySelectorAll('.esc-cat').forEach(x => x.onclick = () => {
      const fb = panel.querySelector('.fbz');
      if (x.textContent !== p.cat) { x.classList.add('no'); fb.innerHTML = `<div class="fb mal">${md(p.pista)}</div>`; return; }
      hallado.add(i); marcas[i].classList.add('ok');
      const todas = hallado.size === b.pistas.length;
      if (sonando) sonando.pause();
      panel.innerHTML = `${contador()}<div class="esc-pista"><div class="fb ok"><b>¡Bien! ${esc(p.cat)}.</b> ${md(p.explicacion)}</div>
        ${todas ? `<div class="fb ok"><b>¡Encontraste todas!</b> ${md(b.cierre || '')}</div>${b.audio_cierre ? reproductor(b.audio_cierre, 'Escuchá a Abril') : ''}` : '<p class="ayuda">Buscá otra lupa en la ilustración.</p>'}</div>`;
      activarAudios(panel); if (todas && b.audio_cierre) tocarAudio(panel.querySelector('.au'));
      if (todas && !raiz.classList.contains('resuelto')) { raiz.classList.add('resuelto'); marcar(); }
    });
  };
  fetch(b.svg).then(r => { if (!r.ok) throw 0; return r.text(); }).then(t => {
    lienzo.innerHTML = t;
    const sv = lienzo.querySelector('svg'); sv.setAttribute('preserveAspectRatio', 'xMidYMid meet'); sv.removeAttribute('width'); sv.removeAttribute('height');
    const NS = 'http://www.w3.org/2000/svg', capa = document.createElementNS(NS, 'g');
    b.pistas.forEach((p, i) => {
      const g = document.createElementNS(NS, 'g'); g.setAttribute('class', 'esc-lupa'); g.setAttribute('transform', `translate(${p.x} ${p.y})${b.escala ? ` scale(${b.escala})` : ''}`);
      g.setAttribute('tabindex', '0'); g.setAttribute('role', 'button'); g.setAttribute('aria-label', `Pista ${i + 1}`);
      g.innerHTML = `<g class="esc-in"><circle class="esc-onda" r="26"/><circle class="esc-base" r="22"/><g class="esc-ic"><circle cx="-3" cy="-3" r="8" fill="none" stroke="#fff" stroke-width="3.5"/><path d="M3 3 L10 10" stroke="#fff" stroke-width="4" stroke-linecap="round"/></g>
        <path class="esc-tilde" d="M-9 0 L-2 7 L10 -7" stroke="#fff" stroke-width="4.5" fill="none" stroke-linecap="round" stroke-linejoin="round"/></g>`;
      g.addEventListener('click', () => abrir(i));
      g.addEventListener('keydown', ev => { if (ev.key === 'Enter' || ev.key === ' ') { ev.preventDefault(); abrir(i); } });
      capa.appendChild(g); marcas[i] = g;
    });
    sv.appendChild(capa);
    if (resuelto) { b.pistas.forEach((_, i) => { hallado.add(i); marcas[i].classList.add('ok'); }); panel.innerHTML = `${contador()}<div class="fb ok"><b>Ya la resolviste.</b> ${md(b.cierre || '')}</div><p class="ayuda">Podés tocar las lupas para repasar.</p>`; }
    else reposo();
  }).catch(() => { lienzo.innerHTML = `<p class="ayuda" style="padding:14px">${md(b.alt || 'No se pudo cargar la ilustración.')}</p>`; });
  return true;
}

/* ------------------------------------------------------------------ girar */
export function bGirar(w, b, resuelto, marcar) {
  const op = b.opciones || ['Coincide', 'No coincide'];
  const tarjetas = b.tarjetas.map((t, i) => `<div class="gi-carta ${resuelto ? 'hecha girada' : ''}" data-i="${i}"><div class="gi-int">
      <div class="gi-cara gi-frente">${t.img ? `<img class="gi-img" src="${esc(t.img)}" alt="" loading="lazy">` : ''}<div class="gi-org">${t.img ? '' : esc(t.icono || '')} ${esc(t.org)}</div><span class="gi-rot">${esc(b.frente || 'Lo que dice')}</span><p>${md(t.dice)}</p>
        <button type="button" class="btn chico suave gi-ver">🔄 Dar vuelta</button></div>
      <div class="gi-cara gi-dorso"><div class="gi-org">${t.img ? '' : esc(t.icono || '')} ${esc(t.org)}</div><span class="gi-rot">${esc(b.dorso || 'Lo que hace')}</span><p>${md(t.hace)}</p>
        <div class="gi-ops">${op.map((o, k) => `<button type="button" class="gi-op" data-k="${k}">${esc(o)}</button>`).join('')}</div>
        <div class="gi-fb">${resuelto ? `<b>${esc(op[t.coincide ? 0 : 1])}.</b> ${md(t.explicacion)}` : ''}</div>
        <button type="button" class="gi-volver">↩ Ver lo que dice</button></div></div></div>`).join('');
  w.innerHTML = caja('girar', '🔄 Dalas vuelta', b, resuelto, `<div class="gi-grid">${tarjetas}</div><div class="fbz"></div>`);
  const raiz = w.firstElementChild, fb = raiz.querySelector('.fbz');
  const hechas = new Set(resuelto ? b.tarjetas.map((_, i) => i) : []);
  raiz.querySelectorAll('.gi-carta').forEach(c => {
    const i = +c.dataset.i, t = b.tarjetas[i], cfb = c.querySelector('.gi-fb');
    c.querySelector('.gi-ver').onclick = () => { c.classList.add('girada'); setTimeout(() => c.querySelector('.gi-dorso .gi-op, .gi-volver')?.focus({ preventScroll: true }), 350); };
    c.querySelector('.gi-volver').onclick = () => c.classList.remove('girada');
    c.querySelectorAll('.gi-op').forEach(x => x.onclick = () => {
      if (hechas.has(i)) return;
      const ok = (+x.dataset.k === 0) === !!t.coincide;
      if (!ok) { x.classList.add('no'); cfb.innerHTML = `${md(t.pista || 'Volvé a leer las dos caras de la tarjeta.')}`; cfb.className = 'gi-fb mal'; return; }
      hechas.add(i); c.classList.add('hecha'); x.classList.add('si'); cfb.className = 'gi-fb ok'; cfb.innerHTML = `<b>¡Bien!</b> ${md(t.explicacion)}`;
      if (hechas.size === b.tarjetas.length) { fb.innerHTML = `<div class="fb ok"><b>Lo que comprobaste:</b> ${md(b.cierre || '')}</div>`; raiz.classList.add('resuelto'); marcar(); }
    });
  });
  if (resuelto) fb.innerHTML = `<div class="fb ok"><b>Lo que comprobaste:</b> ${md(b.cierre || '')}</div>`;
  return true;
}

/* ------------------------------------------------------------------ dupla */
// Dos ilustraciones enfrentadas, cada una con su título, para contrastar dos ideas.
export function bDupla(w, b) {
  w.innerHTML = `<figure class="dupla">${b.items.map((it, k) => `<div class="du-item" style="--c:${it.color};--k:${k}">
      <div class="du-tit"><b>${esc(it.titulo)}</b><span>${esc(it.sub || '')}</span></div>
      <div class="du-img"><img src="${esc(it.img)}" alt="${esc(it.alt || '')}" loading="lazy" ${it.respaldo ? `onerror="this.onerror=null;this.src='${esc(it.respaldo)}'"` : ''}></div></div>`).join('')}
    ${b.epigrafe ? `<figcaption>${md(b.epigrafe)}</figcaption>` : ''}</figure>`;
  const fig = w.firstElementChild;
  const io = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) { fig.classList.add('ver'); io.disconnect(); } }), { threshold: 0.25 });
  io.observe(fig);
  return false;
}
