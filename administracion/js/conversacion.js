// ACOMPAÑAMIENTO PEDAGÓGICO · conversación ramificada
// Una situación se desarrolla como un chat: la persona elige qué decir y la conversación sigue según su elección.
// Termina en un final. Si el final es el que se buscaba ("logrado"), la actividad se da por resuelta.
// Si no, se invita a probar otro camino: siempre se puede volver al principio.
import { esc, md } from './estado.js';

export function bConversacion(w, b, resuelto, marcar) {
  w.innerHTML = `<div class="interactivo conv ${resuelto ? 'resuelto' : ''}"><div class="etq">${esc(b.etiqueta || '💬 Elegí qué decir')}</div>
    <p class="conv-aviso">Personajes y situación inventados.</p>
    <div class="conv-contexto">${md(b.contexto)}</div>
    <div class="conv-chat" aria-live="polite"></div>
    <div class="conv-ops"></div>
    <div class="conv-fin"></div></div>`;
  const raiz = w.firstElementChild;
  const chat = raiz.querySelector('.conv-chat'), ops = raiz.querySelector('.conv-ops'), fin = raiz.querySelector('.conv-fin');
  const burbuja = (quien, texto, yo) => {
    const d = document.createElement('div');
    d.className = 'conv-b ' + (yo ? 'yo' : 'otro');
    d.innerHTML = `<b>${esc(quien)}</b>${md(texto)}`;
    chat.appendChild(d);
    return d;
  };
  const ir = id => {
    const n = b.nodos[id];
    burbuja(n.habla || b.personaje, n.texto, false);
    ops.innerHTML = ''; fin.innerHTML = '';
    if (n.fin) {
      const ok = n.fin === 'logrado';
      fin.innerHTML = `<div class="fb ${ok ? 'ok' : 'aviso'}"><b>${ok ? 'Lo lograste.' : 'Este camino te deja pensando.'}</b> ${md(n.cierre)}</div>
        <div class="acciones"><button class="btn chico ${ok ? 'sec' : ''}" type="button" id="conv-otra">${ok ? 'Recorrerla de nuevo' : 'Probar otro camino'}</button></div>`;
      fin.querySelector('#conv-otra').onclick = empezar;
      if (ok && !raiz.classList.contains('resuelto')) { raiz.classList.add('resuelto'); marcar(); }
      return;
    }
    (n.opciones || []).forEach(o => {
      const bt = document.createElement('button'); bt.type = 'button'; bt.className = 'conv-op'; bt.textContent = o.texto;
      bt.onclick = () => {
        ops.innerHTML = '';
        burbuja(b.yo || 'Vos', o.texto, true);
        if (o.nota) { const nt = document.createElement('div'); nt.className = 'conv-nota'; nt.innerHTML = md(o.nota); chat.appendChild(nt); }
        setTimeout(() => ir(o.sigue), 250);
      };
      ops.appendChild(bt);
    });
  };
  function empezar() { chat.innerHTML = ''; ir(b.inicio); }
  if (resuelto) {
    const ultimoLogrado = Object.values(b.nodos).find(n => n.fin === 'logrado');
    fin.innerHTML = `<div class="fb ok"><b>Ya la resolviste.</b> ${md(ultimoLogrado?.cierre || '')}</div>
      <div class="acciones"><button class="btn chico sec" type="button" id="conv-otra">Recorrerla de nuevo</button></div>`;
    fin.querySelector('#conv-otra').onclick = () => { fin.innerHTML = ''; empezar(); };
  } else empezar();
  return true;
}
