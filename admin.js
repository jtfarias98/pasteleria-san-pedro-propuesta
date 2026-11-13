/* Pastelería San Pedro — panel de administración (demo con datos de ejemplo) */
(() => {
  const $ = (s, c = document) => c.querySelector(s);
  const $$ = (s, c = document) => [...c.querySelectorAll(s)];
  const esc = s => String(s ?? '').replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  const T = SP.iso(SP.today());
  const dISO = n => SP.iso(SP.plus(SP.today(), n));
  const toastEl = $('#toast'); let tt;
  const toast = m => { toastEl.textContent = m; toastEl.classList.add('is-on'); clearTimeout(tt); tt = setTimeout(() => toastEl.classList.remove('is-on'), 3200); };

  /* ---------- Datos de ejemplo ---------- */
  let r = 20261112;
  const rnd = () => { r |= 0; r = r + 0x6D2B79F5 | 0; let t = Math.imul(r ^ r >>> 15, 1 | r); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; };
  const pick = a => a[Math.floor(rnd() * a.length)];
  const wpick = obj => { let x = rnd() * Object.values(obj).reduce((s, v) => s + v, 0); for (const [k, v] of Object.entries(obj)) { if ((x -= v) < 0) return k; } return Object.keys(obj)[0]; };

  // Valores de ejemplo (los precios reales los define la pastelería)
  const PRICE = { '8 personas': 18900, '15 personas': 32900, '25 personas': 46900, '45 personas': 79900, 'Entera': 14900, 'Por trozo': 2900,
    'Caja chica': 6900, 'Caja grande': 12900, 'Unidad': 1500, 'Caja x6': 8500, '50 ml': 1200, '150 ml': 2900, '1 kg': 2400, '½ kg': 1200,
    'Docena': 25000, 'Familiar': 12900, 'Única': 19900 };
  const price = (id, size) => id === 'empanada' && size === 'Unidad' ? 2300 : PRICE[size] || 9900;
  const NAMES = ['Camila Fuentes', 'Javiera Muñoz', 'Ignacio Rojas', 'Francisca Vera', 'Matías Sandoval', 'Catalina Pérez', 'Diego Contreras', 'Antonia Silva', 'Benjamín Torres', 'Fernanda Castillo',
    'Tomás Herrera', 'Constanza Navarro', 'Sebastián Reyes', 'Daniela Morales', 'Felipe Araya', 'Valentina Soto', 'Martina Lagos', 'Joaquín Pino', 'Isidora Vidal', 'Cristóbal Medina',
    'Paula Jara', 'Nicolás Figueroa', 'Sofía Carrasco', 'Vicente Riquelme', 'Carolina Ulloa', 'Rodrigo Parra', 'Macarena Henríquez', 'Gabriel Bustos', 'Florencia Sáez', 'Andrés Cifuentes'];
  const LAST = ['Fuentes', 'Muñoz', 'Rojas', 'Vera', 'Sandoval', 'Pérez', 'Contreras', 'Silva', 'Torres', 'Castillo', 'Herrera', 'Navarro', 'Reyes', 'Morales', 'Araya', 'Soto', 'Lagos', 'Pino', 'Vidal', 'Medina', 'Jara', 'Figueroa', 'Carrasco', 'Riquelme', 'Ulloa', 'Parra', 'Henríquez', 'Bustos', 'Sáez', 'Cifuentes', 'Gutiérrez', 'Álvarez', 'Neira', 'Toledo', 'Salazar'];
  for (let k = 0; k < 150; k++) NAMES.push(NAMES[k % 30].split(' ')[0] + ' ' + LAST[(k * 7 + 3) % LAST.length]);
  const CLIENTS = [...new Set(NAMES)].map((n, i) => ({ id: i, name: n, phone: '+56 9 ' + (5000 + Math.floor(rnd() * 4999)) + ' ' + (1000 + Math.floor(rnd() * 8999)),
    consent: rnd() < .62, account: rnd() < .45, since: dISO(-Math.floor(rnd() * 700) - 20) }));
  const CH = { WhatsApp: 46, Instagram: 24, Web: 12, Teléfono: 12, Facebook: 6 };
  const CH_IC = { WhatsApp: 'wa', Instagram: 'ig', Facebook: 'fb', Web: 'web', Teléfono: 'phone', Cupos: 'cal' };
  const PROD_W = { menta: 9, selva: 7, milhoja: 8, amor: 5, 'manjar-nuez': 6, lucuma: 6, frambuesa: 4, bombon: 4, chocolate: 5, terciopelo: 3, moka: 3, amaretto: 2,
    tartas: 6, trufas: 7, marplatense: 4, 'postre-vaso': 5, pan: 3, empanada: 8, pizza: 3, regalo: 2 };

  let seq = 3100;
  const ORDERS = [];
  const mkItems = () => {
    const n = rnd() < .7 ? 1 : 2, items = [];
    for (let k = 0; k < n; k++) { const id = wpick(PROD_W), p = SP.byId(id); items.push({ id, size: p.cat === 'tortas' ? wpick({ '8 personas': 3, '15 personas': 5, '25 personas': 3, '45 personas': 1 }) : pick(p.sizes), qty: p.cat === 'tortas' ? 1 : 1 + Math.floor(rnd() * 2) }); }
    return items;
  };
  // Pasado: pedidos por día aproximados. Desde mañana: se arman según lo ocupado en cada categoría (mismo dato que ve la tienda).
  const DAYCAP = { 0: 0, 1: 26, 2: 26, 3: 28, 4: 28, 5: 34, 6: 38 };
  const addOrder = (off, date, items) => {
    const c = rnd() < .5 ? CLIENTS[Math.floor(Math.pow(rnd(), 1.8) * CLIENTS.length)] : { name: pick(NAMES).split(' ')[0] + ' ' + pick(LAST) + ' ' + pick(LAST)[0] + '.', phone: '+56 9 ' + (5000 + Math.floor(rnd() * 4999)) + ' ' + (1000 + Math.floor(rnd() * 8999)) }, channel = wpick(CH);
    const lead = Math.min(off + 182, Math.floor(rnd() * rnd() * 10) + 1);
    const status = off < 0 ? (rnd() < .04 ? 'cancelado' : 'entregado') : off === 0 ? wpick({ entregado: 4, listo: 3, preparacion: 3 }) : off === 1 ? wpick({ preparacion: 2, confirmado: 5 }) : wpick({ confirmado: 8, recibido: 2 });
    ORDERS.push({ id: 'SP-' + (seq++), client: c.name, phone: c.phone, channel, byAgent: channel !== 'Web' && channel !== 'Teléfono' && rnd() < .7,
      date, created: dISO(off - lead), hour: Math.round(9 + rnd() * rnd() * 11 + rnd() * 2), mode: rnd() < .68 ? 'Retiro' : 'Despacho',
      items, total: items.reduce((s, i) => s + price(i.id, i.size) * i.qty, 0) + (rnd() < .3 ? 2500 : 0), status });
  };
  const isTorta = b => /^t\d/.test(b);
  const TW = Object.fromEntries(SP.PRODUCTS.filter(p => p.cat === 'tortas').map(p => [p.id, PROD_W[p.id]]));
  const BPICK = { tartas: () => ['tartas', 'Entera'], cocteleria: () => ['postre-vaso', pick(['50 ml', '150 ml'])], dulces: () => rnd() < .6 ? ['trufas', pick(['Caja chica', 'Caja grande'])] : ['marplatense', 'Caja x6'],
    empanadas: () => ['empanada', 'Docena'], pizzas: () => ['pizza', 'Familiar'], pan: () => ['pan', pick(['1 kg', '½ kg'])], regalos: () => ['regalo', 'Única'] };
  for (let off = -182; off <= 16; off++) {
    const date = dISO(off);
    if (!SP.isOpen(date)) continue;
    if (off <= 0) { const n = Math.round(DAYCAP[new Date(date + 'T12:00').getDay()] * (.62 + rnd() * .3)); for (let k = 0; k < n; k++) addOrder(off, date, mkItems()); continue; }
    const lines = [];
    SP.BUCKETS.forEach(b => {
      let rem = SP.simB(date, b.id);
      while (rem > 0) {
        let it;
        if (isTorta(b.id)) it = { id: wpick(TW), size: b.id.slice(1) + ' personas', qty: 1 };
        else { const [id, size] = BPICK[b.id](); it = { id, size, qty: b.id === 'cocteleria' ? 6 * (1 + Math.floor(rnd() * 3)) : b.id === 'pan' ? 1 + Math.floor(rnd() * 3) : Math.min(rem, rnd() < .3 ? 2 : 1) }; }
        rem -= SP.unitsOf(it); lines.push(it);
      }
    });
    for (let k = lines.length - 1; k > 0; k--) { const j = Math.floor(rnd() * (k + 1)); [lines[k], lines[j]] = [lines[j], lines[k]]; }
    while (lines.length) addOrder(off, date, lines.splice(0, rnd() < .55 ? 1 : rnd() < .7 ? 2 : 3));
  }
  // pedidos hechos en la tienda de esta demo (aparecen como nuevos)
  const me = SP.session();
  SP.get('orders', []).forEach(o => ORDERS.push({ ...o, client: me ? me.name : 'Cliente web', phone: me?.phone || '', channel: 'Web', mode: o.mode.startsWith('Retiro') ? 'Retiro' : 'Despacho',
    hour: new Date().getHours(), total: o.items.reduce((s, i) => s + price(i.id, i.size) * i.qty, 0), fromDemo: true }));
  ORDERS.sort((a, b) => a.date.localeCompare(b.date) || a.hour - b.hour);

  /* ---------- Cola del agente (pedidos tomados por el chatbot, por revisar) ---------- */
  const QUEUE = [
    { id: 'AG-1', channel: 'WhatsApp', client: 'Javiera Muñoz', phone: '+56 9 6123 4471', time: '09:42', conf: 'alta',
      chat: [['c', 'Hola! quería encargar una torta de <mark>menta</mark> para el <mark>sábado</mark>'], ['b', '¡Hola Javiera! Con gusto 😊 ¿Para cuántas personas la necesitas?'], ['c', 'para <mark>15</mark>, y que diga <mark>"Feliz cumple Mamá"</mark>'], ['b', 'Perfecto. ¿La retiras en Ernesto Wagner o te la despachamos?'], ['c', '<mark>la retiro</mark> como a las 12']],
      order: { item: 'menta', size: '15 personas', qty: 1, date: nextDow(6), mode: 'Retiro', note: 'Mensaje: "Feliz cumple Mamá" · retira 12:00' } },
    { id: 'AG-2', channel: 'Instagram', client: '@cata.perez', phone: 'Sin teléfono', time: '10:15', conf: 'media',
      chat: [['c', 'holaa tienen <mark>empanadas napolitanas</mark>? necesito como <mark>3 docenas</mark> para el <mark>viernes</mark>'], ['b', '¡Hola! Sí, tenemos 😊 ¿Las retiras o te las enviamos?'], ['c', 'mandenlas a <mark>Pedro de Valdivia 845</mark> porfa']],
      order: { item: 'empanada', size: 'Docena', qty: 3, date: nextDow(5), mode: 'Despacho', note: 'Despacho: Pedro de Valdivia 845' },
      flag: 'Falta el teléfono del cliente para coordinar el despacho.' },
    { id: 'AG-3', channel: 'WhatsApp', client: 'Ignacio Rojas', phone: '+56 9 8840 1290', time: '11:03', conf: 'media',
      chat: [['c', 'Buenas, una <mark>torta selva negra para 20 personas</mark> para el <mark>' + SP.fmt(dISO(9), { day: 'numeric', month: 'long' }) + '</mark>'], ['b', '¡Hola Ignacio! Tenemos tamaños para 15 o 25 personas. ¿Cuál prefieres?'], ['c', 'la de 25 está bien creo']],
      order: { item: 'selva', size: '25 personas', qty: 1, date: dISO(9), mode: 'Retiro', note: 'Cliente pidió 20 personas; aceptó 25 ("creo")' },
      flag: 'El cliente dudó con el tamaño: conviene confirmarlo por WhatsApp.' }
  ];
  function nextDow(dow) { const d = SP.today(); d.setDate(d.getDate() + (((dow - d.getDay()) + 7) % 7 || 7)); return SP.iso(d); }
  const INCOMING = [
    { channel: 'WhatsApp', client: 'Antonia Silva', phone: '+56 9 7712 3380', conf: 'alta',
      chat: [['c', 'Hola, ¿me pueden guardar una <mark>milhoja para 8</mark> para <mark>mañana</mark>?'], ['b', '¡Claro Antonia! ¿Retiro en tienda?'], ['c', '<mark>sí</mark>, gracias']],
      order: { item: 'milhoja', size: '8 personas', qty: 1, date: dISO(1), mode: 'Retiro', note: '' } },
    { channel: 'Instagram', client: '@tomas.herrera', phone: '+56 9 9034 1182', conf: 'alta',
      chat: [['c', 'Quiero una <mark>caja grande de trufas</mark> para regalo, el <mark>' + SP.fmt(dISO(3), { weekday: 'long' }) + '</mark>'], ['b', '¡Hola Tomás! ¿La retiras o te la enviamos?'], ['c', '<mark>retiro</mark>']],
      order: { item: 'trufas', size: 'Caja grande', qty: 1, date: dISO(3), mode: 'Retiro', note: 'Para regalo' } }
  ];
  const DONE = [ // revisados hoy
    { t: '09:05', who: 'Martina Lagos', what: 'Confirmado sin cambios', ok: true },
    { t: '09:06', who: 'Felipe Araya', what: 'Modificado: fecha del jueves al viernes', ok: true },
    { t: '09:08', who: '@isi.vidal', what: 'Cancelado: era una consulta de precios, no un pedido', ok: false }
  ];

  /* ---------- Notificaciones ---------- */
  const NOTIF = [
    ...QUEUE.map(q => ({ id: 'n-' + q.id, ref: q.id, ch: q.channel, text: `<b>${esc(q.client)}</b> pidió ${q.order.qty} × ${SP.byId(q.order.item).name} (${q.order.size})`, when: 'Hoy ' + q.time, unread: true, agent: true })),
    ...ORDERS.filter(o => o.fromDemo).map(o => ({ id: 'n-' + o.id, ch: 'Web', text: `<b>${esc(o.client)}</b> hizo el pedido ${o.id} en la web`, when: 'Recién', unread: true }))
  ];
  const chIcon = ch => `<svg><use href="#i-${CH_IC[ch] || 'web'}"/></svg>`;
  const renderNotif = () => {
    const n = NOTIF.filter(x => x.unread).length;
    $('[data-bell-count]').hidden = !n; $('[data-bell-count]').textContent = n;
    $('[data-agent-count]').textContent = QUEUE.length; $('[data-agent-count]').hidden = !QUEUE.length;
    $('[data-notif-list]').innerHTML = NOTIF.length ? NOTIF.map(x => {
      const pending = x.agent && QUEUE.some(q => q.id === x.ref);
      return `<div class="nitem${x.unread ? ' is-unread' : ''}">
        <div class="nitem__top"><span class="nitem__ic nitem__ic--${CH_IC[x.ch]}">${chIcon(x.ch)}</span><div><p>${x.text}</p><small>${x.when} · ${x.cupo ? 'Aviso de cupos · también por ' + (alertChannels().filter(c => c !== 'el panel').join(' y ') || 'el panel') : x.ch}${x.agent ? ' · ingresado por el agente' : ''}</small></div></div>
        ${x.cupo && !x.result ? `<div class="nitem__actions"><button class="btn btn--solid" data-free="${x.d}">Liberar cupos</button><a class="btn btn--line" href="#capacidad">Ver calendario</a></div>` : pending ? `<div class="nitem__actions"><button class="btn btn--ok" data-q-confirm="${x.ref}">Confirmar</button><button class="btn btn--line" data-q-edit="${x.ref}">Modificar</button><button class="btn btn--danger" data-q-cancel="${x.ref}">Cancelar</button></div>`
        : x.result ? `<p class="nitem__done">${x.result}</p>` : ''}
      </div>`;
    }).join('') : '<p class="empty">Sin notificaciones</p>';
  };
  const bellBtn = $('[data-bell]'), notifBox = $('[data-notif]');
  bellBtn.addEventListener('click', e => { e.stopPropagation(); notifBox.hidden = !notifBox.hidden; bellBtn.setAttribute('aria-expanded', !notifBox.hidden); });
  document.addEventListener('click', e => { if (!notifBox.hidden && !e.target.closest('.bell')) notifBox.hidden = true; });
  $('[data-notif-read]').addEventListener('click', () => { NOTIF.forEach(n => n.unread = false); renderNotif(); });

  // Llega un pedido nuevo cada cierto tiempo (simula el chatbot)
  let inc = 0;
  const arrive = () => {
    if (inc >= INCOMING.length) return;
    const now = new Date(), q = { ...INCOMING[inc], id: 'AG-' + (10 + inc), time: now.toTimeString().slice(0, 5) };
    inc++; QUEUE.push(q);
    NOTIF.unshift({ id: 'n-' + q.id, ref: q.id, ch: q.channel, text: `<b>${esc(q.client)}</b> pidió ${q.order.qty} × ${SP.byId(q.order.item).name} (${q.order.size})`, when: 'Ahora', unread: true, agent: true });
    renderNotif(); if (current === 'agente') renderAgent(); if (current === 'resumen') renderResumen();
    bellBtn.classList.remove('is-bump'); void bellBtn.offsetWidth; bellBtn.classList.add('is-bump');
    toast(`Nuevo pedido por ${q.channel} de ${q.client}. Revísalo en la campana`);
    setTimeout(arrive, 45000);
  };
  setTimeout(arrive, 9000);

  /* ---------- Acciones sobre la cola del agente ---------- */
  const resolve = (id, result, ok, order) => {
    const k = QUEUE.findIndex(q => q.id === id); if (k < 0) return;
    const q = QUEUE[k];
    QUEUE.splice(k, 1);
    DONE.unshift({ t: new Date().toTimeString().slice(0, 5), who: q.client, what: result, ok });
    const n = NOTIF.find(x => x.ref === id); if (n) { n.result = (ok ? '✓ ' : '✕ ') + result; n.unread = false; }
    const before = ok ? fullKeys() : null;
    if (ok) {
      const o = order || q.order;
      ORDERS.push({ id: 'SP-' + (seq++), client: q.client, phone: q.phone, channel: q.channel, byAgent: true, date: o.date, created: T, hour: new Date().getHours(), mode: o.mode,
        items: [{ id: o.item, size: o.size, qty: +o.qty }], total: price(o.item, o.size) * o.qty, status: 'confirmado', note: o.note });
      ORDERS.sort((a, b) => a.date.localeCompare(b.date) || a.hour - b.hour);
    }
    renderNotif(); toast(`${q.client}: ${result.toLowerCase()}`);
    if (ok) setTimeout(() => checkFull(before), 700);
    const card = $(`[data-review="${id}"]`);
    if (card) { card.classList.add('is-leaving'); setTimeout(() => current === 'agente' && renderAgent(), 500); } else if (current === 'agente') renderAgent();
    if (current === 'resumen') renderResumen();
  };
  const readCard = id => {
    const c = $(`[data-review="${id}"]`), q = QUEUE.find(x => x.id === id);
    if (!c) return q.order;
    const f = n => c.querySelector(`[name="${n}"]`).value;
    return { item: f('item'), size: f('size'), qty: +f('qty') || 1, date: f('date'), mode: f('mode'), note: f('note') };
  };
  document.addEventListener('click', e => {
    const t = e.target.closest('[data-q-confirm],[data-q-edit],[data-q-cancel],[data-q-save]');
    if (!t) return;
    if (t.dataset.qConfirm) resolve(t.dataset.qConfirm, 'Confirmado sin cambios', true, readCard(t.dataset.qConfirm));
    if (t.dataset.qSave) resolve(t.dataset.qSave, 'Modificado y confirmado', true, readCard(t.dataset.qSave));
    if (t.dataset.qCancel) {
      const why = prompt('Motivo de la cancelación (se guarda en el registro):', 'Era una consulta, no un pedido');
      if (why !== null) resolve(t.dataset.qCancel, 'Cancelado: ' + (why || 'sin motivo'), false);
    }
    if (t.dataset.qEdit) {
      notifBox.hidden = true;
      if (current !== 'agente') location.hash = 'agente';
      setTimeout(() => {
        const c = $(`[data-review="${t.dataset.qEdit}"]`); if (!c) return;
        c.classList.add('is-editing'); $$('input,select', c).forEach(i => i.disabled = false);
        c.querySelector('[data-q-confirm]').hidden = true; c.querySelector('[data-q-edit]').hidden = true; c.querySelector('[data-q-save]').hidden = false;
        c.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }, 120);
    }
  });

  /* ---------- Utilidades de vista ---------- */
  const LABEL = { activa: 'Activa', programada: 'Programada', finalizada: 'Finalizada', borrador: 'Borrador', recibido: 'Recibido', revisar: 'Por revisar', confirmado: 'Confirmado', preparacion: 'En preparación', listo: 'Listo', entregado: 'Entregado', cancelado: 'Cancelado' };
  const st = s => `<span class="st st--${s}">${LABEL[s]}</span>`;
  const chan = (c, agent) => `<span class="chan chan--${c}" title="${c}">${chIcon(c)}</span>${agent ? '<span class="by-agent" title="Ingresado por el agente"><svg><use href="#i-bot"/></svg>agente</span>' : ''}`;
  const itemsTxt = o => o.items.map(i => `${i.qty > 1 ? i.qty + ' × ' : ''}${SP.byId(i.id).name} <span class="muted">${i.size}</span>`).join('<br>');
  const head = (title, sub, actions = '') => `<div class="view__head"><div><h1>${title}</h1><p>${sub}</p></div><div class="view__actions">${actions}</div></div>`;
  const live = o => o.status !== 'cancelado';
  const sum = (a, f) => a.reduce((s, x) => s + f(x), 0);
  const pct = (a, b) => b ? Math.round((a - b) / b * 100) : 0;
  const meterCls = (t, m) => !m ? '' : t >= m ? 'is-full' : t / m >= .85 ? 'is-warn' : '';
  const dayCount = d => ORDERS.filter(o => o.date === d && live(o)).length;

  /* ---------- Cupos por categoría: uso real según los pedidos del panel ---------- */
  const fmtU = v => Number.isInteger(v) ? v : String(Math.round(v * 10) / 10).replace('.', ',');
  const usedB = (d, b) => sum(ORDERS.filter(o => o.date === d && live(o)), o => sum(o.items.filter(i => SP.bucketOf(i.id, i.size) === b), SP.unitsOf));
  const dayRows = d => SP.BUCKETS.map(b => { const max = SP.maxB(d, b.id), used = usedB(d, b.id); return { ...b, max, used, left: Math.max(0, max - used) }; });
  const dayFill = d => {
    const rows = dayRows(d), max = sum(rows, r => r.max), used = sum(rows, r => Math.min(r.used, r.max));
    return { rows, max, used, pct: max ? Math.round(used / max * 100) : 0, full: rows.filter(r => r.max && r.used >= r.max - 1e-9) };
  };
  // "tortas de 8 y 15 personas, empanadas y pan por encargo"
  const catNames = rows => {
    const t = rows.filter(r => isTorta(r.id)).map(r => r.id.slice(1)), o = rows.filter(r => !isTorta(r.id)).map(r => r.label.charAt(0).toLowerCase() + r.label.slice(1));
    return SP.listNames([...(t.length ? ['tortas de ' + SP.listNames(t) + ' personas'] : []), ...o]);
  };
  const fullDays = () => Array.from({ length: 7 }, (_, k) => dISO(k + 1)).filter(SP.isOpen).map(d => ({ d, full: dayFill(d).full })).filter(x => x.full.length);
  const fullKeys = () => new Set(fullDays().flatMap(x => x.full.map(r => x.d + '|' + r.id)));
  const alertChannels = () => { const a = SP.cupos().alerts; return [a.email && 'correo', a.wa && 'WhatsApp', a.web && 'el panel', a.popup && 'ventana emergente'].filter(Boolean); };
  const dayLong = d => SP.fmt(d, { weekday: 'long', day: 'numeric', month: 'long' });
  const cupoNotif = (x, when) => ({ id: 'c-' + x.d + '-' + x.full.map(r => r.id).join(''), cupo: true, d: x.d, ch: 'Cupos', when, unread: true,
    text: `Se llenaron los cupos de <b>${esc(catNames(x.full))}</b> para el ${dayLong(x.d)}` });
  const popupFull = (list, sample) => openModal(`<p class="eyebrow">Aviso de cupos</p><h2>Se llenaron <em>algunos cupos</em></h2>
    <p class="muted" style="margin:8px 0 14px">La web y el agente ya no ofrecen estos días para esos productos. Si en la cocina alcanzan, liberen más cupos y se vuelven a ofrecer.</p>
    <div class="alerts">${list.map(x => `<div class="alert"><div><b>${esc(dayLong(x.d))}</b><small>${esc(catNames(x.full))}</small></div><button class="btn btn--solid btn--sm" data-free="${x.d}">Liberar cupos</button></div>`).join('')}</div>
    ${sample ? `<div class="mail" style="margin-top:16px"><div class="mail__head" style="padding:12px 16px;border-bottom:1px solid var(--stone)"><small class="muted">Correo al equipo · Asunto</small><br><b style="font-weight:500">Se llenaron los cupos de ${esc(catNames(list[0].full))} para el ${esc(dayLong(list[0].d))}</b></div>
      <div style="padding:12px 16px" class="small">Hola equipo San Pedro: ese día ya no se ofrece en la web ni en el chat para esos productos. Si pueden preparar más, toquen <b>Liberar cupos</b> en el panel.</div></div>` : ''}
    <p class="small muted" style="margin:14px 0 0">${alertChannels().length ? 'Este aviso llega por ' + SP.listNames(alertChannels()) + '.' : 'Los avisos están apagados.'} Se cambia en <a class="link" href="#capacidad" data-close-modal-link>Cupos</a>.</p>`);
  // tras un pedido nuevo: si se llenó una categoría, avisar según lo que prefiere el admin
  const checkFull = before => {
    const fresh = fullDays().map(x => ({ d: x.d, full: x.full.filter(r => !before.has(x.d + '|' + r.id)) })).filter(x => x.full.length);
    if (!fresh.length) return;
    const a = SP.cupos().alerts;
    if (a.web) { fresh.forEach(x => NOTIF.unshift(cupoNotif(x, 'Ahora'))); renderNotif(); bellBtn.classList.remove('is-bump'); void bellBtn.offsetWidth; bellBtn.classList.add('is-bump'); }
    if (a.popup) popupFull(fresh); else toast(`Se llenaron los cupos de ${catNames(fresh[0].full)} para el ${dayLong(fresh[0].d)}`);
  };
  const markFreed = d => NOTIF.filter(n => n.cupo && n.d === d && !n.result).forEach(n => { n.result = '✓ Se liberaron más cupos para ese día'; n.unread = false; });
  document.addEventListener('click', e => {
    const b = e.target.closest('[data-free]'); if (!b) return;
    notifBox.hidden = true; dayModal(b.dataset.free);
  });
  document.addEventListener('click', e => { if (e.target.closest('[data-close-modal-link]')) closeModal(); });

  // Tooltip para gráficos
  const tip = $('#tip');
  document.addEventListener('mousemove', e => {
    const el = e.target.closest('[data-tip]');
    if (!el) { tip.hidden = true; return; }
    tip.innerHTML = el.dataset.tip; tip.hidden = false;
    tip.style.left = e.clientX + 'px'; tip.style.top = e.clientY + 'px';
  });
  const barsV = (data, fmt, hl) => {
    const max = Math.max(...data.map(d => d.v), 1);
    return `<div class="bars-v">${data.map((d, i) => `<div class="b${hl === i ? ' is-hl' : ''}" data-tip="${esc(d.full || d.l)}: <b>${fmt(d.v)}</b>"><span style="height:${d.v / max * 100}%"></span></div>`).join('')}</div>
      <div class="bars-x">${data.map(d => `<span>${esc(d.l)}</span>`).join('')}</div>`;
  };
  const barsH = (data, fmt) => {
    const max = Math.max(...data.map(d => d.v), 1);
    return `<div class="bars-h">${data.map(d => `<div class="bh" data-tip="${esc(d.l.replace(/<[^>]+>/g, ''))}: <b>${fmt(d.v, d)}</b>"><span class="bh__l">${d.l}</span><span class="bh__t ${d.max ? 'meter ' + meterCls(d.v, d.max) : ''}"><span style="width:${Math.min(100, d.v / (d.max || max) * 100)}%"></span></span><span class="bh__v">${fmt(d.v, d)}</span></div>`).join('')}</div>`;
  };

  /* ---------- Resumen ---------- */
  function renderResumen() {
    const h = new Date().getHours();
    const today = ORDERS.filter(o => o.date === T && live(o)), fd = fullDays();
    const last7 = ORDERS.filter(o => o.date > dISO(-7) && o.date <= T && live(o)), prev7 = ORDERS.filter(o => o.date > dISO(-14) && o.date <= dISO(-7) && live(o));
    const tomorrow = SP.isOpen(dISO(1)) ? dISO(1) : dISO(2);
    const prod = {}; ORDERS.filter(o => o.date === tomorrow && live(o)).forEach(o => o.items.forEach(i => { const k = SP.byId(i.id).name + ' · ' + i.size; prod[k] = (prod[k] || 0) + i.qty; }));
    const toPrice = ORDERS.filter(o => o.fromDemo && o.status === 'recibido').length;
    $('#v-resumen').innerHTML = head(`${h < 12 ? 'Buenos días' : h < 20 ? 'Buenas tardes' : 'Buenas noches'}, <em>San Pedro</em>`, SP.fmt(T, { weekday: 'long', day: 'numeric', month: 'long' }) + ' · datos de ejemplo',
      `<a class="btn btn--line btn--sm" href="index.html" target="_blank">Ver la tienda</a>`) + `
      <div class="grid g-4">
        <a class="box kpi" href="#capacidad" style="text-decoration:none"><span class="kpi__l">Pedidos para hoy</span><span class="kpi__n">${today.length}</span><span class="kpi__s">${fd.length ? `<span class="down">${fd.length} ${fd.length === 1 ? 'día' : 'días'} con categorías llenas</span> esta semana` : 'Sin categorías llenas esta semana'}</span></a>
        <a class="box kpi" href="#agente" style="text-decoration:none"><span class="kpi__l">Por revisar del agente</span><span class="kpi__n" style="color:${QUEUE.length ? 'var(--cherry)' : 'var(--ok)'}">${QUEUE.length}</span><span class="kpi__s">Próxima revisión: ${h < 11 ? '11:00' : h < 17 ? '17:00' : 'mañana 11:00'}</span></a>
        <div class="box kpi"><span class="kpi__l">Ventas últimos 7 días</span><span class="kpi__n">${SP.money(sum(last7, o => o.total))}</span><span class="kpi__s"><span class="${pct(sum(last7, o => o.total), sum(prev7, o => o.total)) >= 0 ? 'up' : 'down'}">${pct(sum(last7, o => o.total), sum(prev7, o => o.total)) >= 0 ? '▲' : '▼'} ${Math.abs(pct(sum(last7, o => o.total), sum(prev7, o => o.total)))}%</span> vs. semana anterior</span></div>
        <div class="box kpi"><span class="kpi__l">Pedidos por web y agente</span><span class="kpi__n">${Math.round(last7.filter(o => o.byAgent || o.channel === 'Web').length / Math.max(1, last7.length) * 100)}%</span><span class="kpi__s">sin escribir a mano en los últimos 7 días</span></div>
      </div>
      <div class="grid g-main" style="margin-top:18px">
        <div class="box">
          <div class="box__head"><div><h2>Cupos de los próximos días</h2><p>Ocupación total y categorías que ya se llenaron</p></div><a class="link" href="#capacidad">Ajustar cupos</a></div>
          ${barsH(Array.from({ length: 8 }, (_, k) => dISO(k + 1)).filter(SP.isOpen).map(d => { const f = dayFill(d); return { l: SP.fmt(d), v: f.used, max: f.max, full: f.full }; }), (v, d) => `${Math.round(v / d.max * 100)}%${d.full.length ? ' · ' + d.full.length + ' llena' + (d.full.length > 1 ? 's' : '') : ''}`)}
          ${fd.length ? `<div class="alerts" style="margin-top:14px">${fd.slice(0, 3).map(x => `<div class="alert"><div><b>${esc(SP.fmt(x.d, { weekday: 'long', day: 'numeric' }))}</b><small>Lleno: ${esc(catNames(x.full))}</small></div><button class="btn btn--line btn--sm" data-free="${x.d}">Liberar cupos</button></div>`).join('')}</div>` : ''}
          <p class="small muted" style="margin:12px 0 0">Cada categoría tiene su máximo. Cuando se llena, la web y el agente dejan de ofrecer ese día solo para esos productos.</p>
        </div>
        <div class="box">
          <div class="box__head"><div><h2>Producción para ${SP.fmt(tomorrow, { weekday: 'long' })}</h2><p>Suma automática de lo pedido</p></div></div>
          <div class="prod">${Object.entries(prod).sort((a, b) => b[1] - a[1]).slice(0, 8).map(([k, v]) => `<div><span>${esc(k)}</span><b>${v}</b></div>`).join('') || '<p class="empty">Sin pedidos</p>'}</div>
        </div>
      </div>
      <div class="grid g-main" style="margin-top:18px">
        <div class="box">
          <div class="box__head"><h2>Pedidos de hoy</h2><a class="link" href="#pedidos">Ver todos</a></div>
          <div class="table-wrap"><table class="t"><thead><tr><th>N°</th><th>Cliente</th><th>Productos</th><th>Entrega</th><th>Estado</th></tr></thead><tbody>
          ${today.slice(0, 7).map(o => `<tr><td><b>${o.id}</b></td><td>${esc(o.client)}<br>${chan(o.channel, o.byAgent)}</td><td>${itemsTxt(o)}</td><td>${o.mode}</td><td>${st(o.status)}</td></tr>`).join('')}
          </tbody></table></div>
        </div>
        <div class="box">
          <div class="box__head"><h2>Tareas de hoy</h2></div>
          <div class="switch"><span><b>Revisión del agente de las 11:00</b><small>Comparar pedidos ingresados con los chats</small></span><input type="checkbox" ${h >= 11 ? 'checked' : ''}></div>
          <div class="switch"><span><b>Revisión del agente de las 17:00</b><small>${QUEUE.length} pedidos esperando</small></span><input type="checkbox" ${QUEUE.length ? '' : 'checked'}></div>
          <div class="switch"><span><b>Confirmar valor de pedidos web</b><small>${toPrice ? toPrice + ' pedidos nuevos desde la web' : 'Todo al día'}</small></span><input type="checkbox" ${toPrice ? '' : 'checked'}></div>
          <div class="switch"><span><b>Revisar correo de Navidad</b><small>Sale el lunes a las 09:00</small></span><input type="checkbox"></div>
        </div>
      </div>`;
  }

  /* ---------- Pedidos ---------- */
  let pf = { range: 'hoy', ch: 'all', st: 'all', q: '' };
  function renderPedidos() {
    const inRange = o => pf.range === 'hoy' ? o.date === T : pf.range === 'manana' ? o.date === dISO(1) : pf.range === 'semana' ? o.date >= T && o.date <= dISO(7) : pf.range === 'pasados' ? o.date < T && o.date >= dISO(-7) : o.date >= T;
    const q = pf.q.toLowerCase();
    const list = ORDERS.filter(o => inRange(o) && (pf.ch === 'all' || o.channel === pf.ch) && (pf.st === 'all' || o.status === pf.st) && (!q || (o.id + o.client).toLowerCase().includes(q)));
    const rng = [['hoy', 'Hoy'], ['manana', 'Mañana'], ['semana', 'Próximos 7 días'], ['futuro', 'Todos los próximos'], ['pasados', 'Últimos 7 días']];
    $('#v-pedidos').innerHTML = head('Pedidos', 'Todos los canales en un solo lugar: web, WhatsApp, Instagram, Facebook y teléfono.',
      `<button class="btn btn--line btn--sm" data-export>Descargar planilla</button><button class="btn btn--solid btn--sm" data-new-order>+ Pedido telefónico</button>`) + `
      <div class="toolbar">
        ${rng.map(([k, l]) => `<button class="filter${pf.range === k ? ' is-active' : ''}" data-range="${k}">${l}</button>`).join('')}
        <select data-pf="ch" aria-label="Canal"><option value="all">Todos los canales</option>${Object.keys(CH).map(c => `<option ${pf.ch === c ? 'selected' : ''}>${c}</option>`).join('')}</select>
        <select data-pf="st" aria-label="Estado"><option value="all">Todos los estados</option>${Object.entries(LABEL).filter(([k]) => k !== 'revisar').map(([k, l]) => `<option value="${k}" ${pf.st === k ? 'selected' : ''}>${l}</option>`).join('')}</select>
        <input type="search" placeholder="Buscar" value="${esc(pf.q)}" data-pf="q" aria-label="Buscar pedido">
      </div>
      <div class="box">
        <div class="box__head"><p>${list.length} pedidos · ${SP.money(sum(list.filter(live), o => o.total))} en total (valores de ejemplo)</p></div>
        <div class="table-wrap"><table class="t"><thead><tr><th>N°</th><th>Para</th><th>Cliente</th><th>Canal</th><th>Productos</th><th>Entrega</th><th class="num">Total</th><th>Estado</th></tr></thead><tbody>
        ${list.slice(0, 120).map(o => `<tr><td><b>${o.id}</b>${o.fromDemo ? ' <span class="pill pill--new">nuevo</span>' : ''}</td><td>${SP.fmt(o.date)}</td><td>${esc(o.client)}<br><span class="small muted">${esc(o.phone)}</span></td><td>${chan(o.channel, o.byAgent)}</td><td>${itemsTxt(o)}${o.note ? `<br><span class="small muted">${esc(o.note)}</span>` : ''}</td><td>${o.mode}</td><td class="num">${SP.money(o.total)}</td>
          <td><select data-status="${o.id}" aria-label="Estado de ${o.id}">${['recibido', 'confirmado', 'preparacion', 'listo', 'entregado', 'cancelado'].map(s => `<option value="${s}" ${o.status === s ? 'selected' : ''}>${LABEL[s]}</option>`).join('')}</select></td></tr>`).join('') || '<tr><td colspan="8" class="empty">No hay pedidos con esos filtros</td></tr>'}
        </tbody></table></div>
      </div>`;
  }
  document.addEventListener('click', e => {
    const b = e.target.closest('[data-range]'); if (b) { pf.range = b.dataset.range; renderPedidos(); }
    if (e.target.closest('[data-export]')) toast('En la versión final se descarga un Excel con los pedidos filtrados');
  });
  document.addEventListener('change', e => {
    const s = e.target.closest('[data-status]');
    if (s) { const o = ORDERS.find(x => x.id === s.dataset.status); o.status = s.value; toast(`${o.id}: ${LABEL[s.value]}. ${s.value === 'listo' ? 'Se avisó al cliente por WhatsApp' : ''}`); }
    const f = e.target.closest('[data-pf]'); if (f && f.dataset.pf !== 'q') { pf[f.dataset.pf] = f.value; renderPedidos(); }
  });
  document.addEventListener('input', e => {
    const f = e.target.closest('[data-pf="q"]'); if (f) { pf.q = f.value; clearTimeout(f._t); f._t = setTimeout(() => { renderPedidos(); const n = $('[data-pf="q"]'); n.focus(); n.setSelectionRange(n.value.length, n.value.length); }, 250); }
  });
  $('[data-search]').addEventListener('keydown', e => { if (e.key === 'Enter') { pf = { range: 'futuro', ch: 'all', st: 'all', q: e.target.value }; if (current !== 'pedidos') location.hash = 'pedidos'; else renderPedidos(); } });

  /* ---------- Revisión del agente ---------- */
  function renderAgent() {
    const h = new Date().getHours();
    const opts = (arr, v) => arr.map(x => `<option value="${esc(Array.isArray(x) ? x[0] : x)}" ${(Array.isArray(x) ? x[0] : x) === v ? 'selected' : ''}>${esc(Array.isArray(x) ? x[1] : x)}</option>`).join('');
    $('#v-agente').innerHTML = head('Revisión del <em>agente</em>', 'El chatbot ingresa los pedidos de WhatsApp, Instagram y Facebook. Aquí se comparan con la conversación y se confirman, modifican o cancelan.',
      `<span class="schedule"><span class="small muted">Revisiones:</span><span class="pill ${h >= 11 ? '' : 'pill--new'}">11:00</span><span class="pill ${h >= 11 && h < 17 ? 'pill--new' : ''}">17:00</span></span>`) +
      (QUEUE.length ? QUEUE.map(q => {
        const p = SP.byId(q.order.item);
        return `<article class="review" data-review="${q.id}">
          <div class="chat">
            <div class="chat__head">${chan(q.channel)}<span><b>${esc(q.client)}</b><br><span class="small muted">${esc(q.phone)} · ${q.channel} · ${q.time}</span></span></div>
            ${q.chat.map(([w, t]) => `<div class="msg ${w === 'b' ? 'msg--bot' : ''}">${t}<small>${w === 'b' ? 'Agente San Pedro' : ''}</small></div>`).join('')}
          </div>
          <div class="extract">
            <div class="extract__head"><div><p class="eyebrow" style="margin:0 0 6px">Pedido detectado</p><h3>${q.order.qty} × ${esc(p.name)}</h3></div><span class="conf conf--${q.conf}">Confianza ${q.conf}</span></div>
            <dl class="kv">
              <dt>Producto</dt><dd><select name="item" disabled>${opts(SP.PRODUCTS.map(x => [x.id, x.name]), q.order.item)}</select></dd>
              <dt>Tamaño</dt><dd><select name="size" disabled>${opts(p.sizes, q.order.size)}</select></dd>
              <dt>Cantidad</dt><dd><input name="qty" type="number" min="1" value="${q.order.qty}" disabled></dd>
              <dt>Para el día</dt><dd><input name="date" type="date" value="${q.order.date}" disabled></dd>
              <dt>Entrega</dt><dd><select name="mode" disabled>${opts(['Retiro', 'Despacho'], q.order.mode)}</select></dd>
              <dt>Notas</dt><dd><input name="note" value="${esc(q.order.note)}" disabled></dd>
            </dl>
            ${q.flag ? `<p class="flag">⚠ ${esc(q.flag)}</p>` : ''}
            ${(() => { const b = SP.bucketOf(q.order.item, q.order.size), r = dayRows(q.order.date).find(x => x.id === b), need = SP.unitsOf({ id: q.order.item, size: q.order.size, qty: +q.order.qty });
              return !r || !r.max ? '<p class="small down" style="margin:0">Ese día está cerrado.</p>' : `<p class="small ${r.left < need ? 'down' : 'muted'}" style="margin:0">Cupos de ${esc(r.label.toLowerCase())} ese día: quedan ${fmtU(r.left)} de ${r.max}${r.left < need ? '. Al confirmar se pasa del máximo' : ''}</p>`; })()}
            <div class="extract__actions">
              <button class="btn btn--ok btn--sm" data-q-confirm="${q.id}"><svg><use href="#i-check"/></svg>Confirmar</button>
              <button class="btn btn--line btn--sm" data-q-edit="${q.id}">Modificar</button>
              <button class="btn btn--solid btn--sm" data-q-save="${q.id}" hidden>Guardar y confirmar</button>
              <button class="btn btn--danger btn--sm" data-q-cancel="${q.id}">Cancelar</button>
            </div>
          </div>
        </article>`;
      }).join('') : `<div class="box empty"><p style="font:350 26px/1.2 var(--serif);color:var(--ink);margin:0 0 6px">Todo revisado ✓</p>Los nuevos pedidos del agente aparecerán aquí y en la campana.</div>`) + `
      <div class="box" style="margin-top:8px"><div class="box__head"><h2>Revisados hoy</h2><p>${DONE.length} pedidos</p></div>
        ${DONE.map(d => `<div class="review-done"><span class="muted small">${d.t}</span><b style="font-weight:500">${esc(d.who)}</b><span class="${d.ok ? '' : 'down'}">${esc(d.what)}</span></div>`).join('')}
      </div>`;
    // al cambiar el producto, actualizar los tamaños
    $$('[data-review] select[name=item]').forEach(s => s.addEventListener('change', () => {
      const sz = s.closest('.kv').querySelector('[name=size]'); sz.innerHTML = opts(SP.byId(s.value).sizes, '');
    }));
  }

  /* ---------- Cupos por categoría ---------- */
  const DOW = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
  const ALERTS = [['email', 'Correo', 'Al correo de la pastelería'], ['wa', 'WhatsApp', 'Mensaje al celular de quien administra'], ['web', 'Notificación en el panel', 'En la campana de arriba'], ['popup', 'Ventana emergente', 'Al abrir el panel o cuando se llena']];
  function renderCapacidad() {
    const c = SP.cupos();
    const start = SP.today(); start.setDate(start.getDate() - ((start.getDay() + 6) % 7));
    const days = Array.from({ length: 35 }, (_, k) => SP.iso(SP.plus(start, k)));
    const group = (title, f) => `<p class="caps__g">${title}</p><div class="caps">${SP.BUCKETS.filter(f).map(b => `<label class="caps__row"><span>${esc(isTorta(b.id) ? b.id.slice(1) + ' personas' : b.label)}<small>${b.unit} por día</small></span><input type="number" min="0" max="99" name="m-${b.id}" value="${SP.baseMax(b.id)}"></label>`).join('')}</div>`;
    $('#v-capacidad').innerHTML = head('Cupos por <em>categoría</em>', 'Cuántas tortas de cada tamaño, docenas de empanadas y demás pueden preparar por día. Cuando una categoría se llena, la web y el agente dejan de ofrecer ese día para esos productos, y les llega un aviso para liberar más si alcanzan.') + `
      <div class="grid g-main">
        <div class="box">
          <div class="box__head"><div><h2>Calendario</h2><p>Toca un día para ver cada categoría y liberar cupos</p></div>
            <div class="legend"><span><i style="background:var(--brand)"></i>Con cupos</span><span><i style="background:#D98B2B"></i>Casi lleno</span><span><i style="background:var(--cherry)"></i>Categoría llena</span><span><i style="background:var(--brand-soft);border-radius:50%"></i>Ajuste del día</span></div></div>
          <div class="cal">
            ${['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'].map(d => `<span class="cal__dow">${d}</span>`).join('')}
            ${days.map(d => {
              const fut = d > T, open = SP.isOpen(d), f = dayFill(d), dt = new Date(d + 'T12:00'), adj = (c.extra[d] && Object.keys(c.extra[d]).length) || c.blocked[d];
              return `<button class="cday${d < T ? ' is-past' : ''}${!open ? ' is-closed' : ''}${d === T ? ' is-today' : ''}${adj ? ' is-override' : ''}${fut && f.full.length ? ' is-full' : ''}" data-cday="${d}">
                <b>${dt.getDate()}</b><small>${!open ? 'Cerrado' : fut ? f.pct + '% ocupado' : dayCount(d) + ' pedidos'}</small>${fut && open && f.full.length ? `<span class="cday__full">${f.full.length} llena${f.full.length > 1 ? 's' : ''}</span>` : ''}${fut && open ? `<div class="meter ${f.full.length ? 'is-full' : meterCls(f.used, f.max)}"><span style="width:${f.pct}%"></span></div>` : ''}</button>`;
            }).join('')}
          </div>
        </div>
        <div class="grid" style="align-content:start">
          <form class="box form" data-cap-form>
            <div><h2>Máximo por día</h2><p class="small muted" style="margin:4px 0 0">Lo que la cocina puede preparar en un día normal.</p></div>
            ${group('Tortas, por tamaño', b => isTorta(b.id))}
            ${group('Otros productos', b => !isTorta(b.id))}
            <p class="caps__g">Días cerrados</p>
            <div class="dows">${[1, 2, 3, 4, 5, 6, 0].map(w => `<label class="dow"><input type="checkbox" name="c${w}" ${c.closed.includes(w) ? 'checked' : ''}><span>${DOW[w]}</span></label>`).join('')}</div>
            <label class="field"><span>Anticipación mínima</span><select name="lead"><option>Desde el día siguiente</option><option>48 horas</option><option>Mismo día antes de las 12:00</option></select></label>
            <button class="btn btn--solid" type="submit">Guardar cupos</button>
          </form>
          <div class="box form">
            <div><h2>Aviso cuando se llena</h2><p class="small muted" style="margin:4px 0 0">Dice qué categoría se llenó y para qué día, con un botón para liberar más cupos. Elijan por dónde les llega.</p></div>
            <div>${ALERTS.map(([k, t, sub]) => `<div class="switch"><span><b>${t}</b><small>${sub}</small></span><input type="checkbox" data-alert="${k}" ${c.alerts[k] ? 'checked' : ''}></div>`).join('')}</div>
            <button class="btn btn--line btn--sm" type="button" data-alert-test>Ver un aviso de ejemplo</button>
          </div>
          <p class="note">Los cambios se ven al tiro en la tienda: abran <a href="index.html#pedido" target="_blank">Tu pedido</a>, agreguen una torta y revisen los días disponibles.</p>
        </div>
      </div>`;
    $('[data-cap-form]').addEventListener('submit', e => {
      e.preventDefault();
      const x = SP.get('cupos', {}), f = e.target.elements;
      x.max = {}; SP.BUCKETS.forEach(b => x.max[b.id] = Math.max(0, +f['m-' + b.id].value || 0));
      x.closed = [0, 1, 2, 3, 4, 5, 6].filter(w => f['c' + w].checked);
      SP.set('cupos', x); toast('Cupos guardados. La web ya muestra los nuevos máximos'); renderCapacidad();
    });
  }
  document.addEventListener('change', e => {
    const i = e.target.closest('[data-alert]'); if (!i) return;
    const x = SP.get('cupos', {}); x.alerts = { ...SP.cupos().alerts, [i.dataset.alert]: i.checked }; SP.set('cupos', x);
    toast(i.checked ? 'Aviso activado' : 'Aviso desactivado');
  });
  document.addEventListener('click', e => {
    if (!e.target.closest('[data-alert-test]')) return;
    const list = fullDays(); popupFull(list.length ? list.slice(0, 3) : [{ d: dISO(2), full: [SP.BUCKETS[1]] }], true);
  });
  // Ajustar un día: máximo por categoría solo para esa fecha
  function dayModal(d) {
    const c = SP.cupos(), rows = dayRows(d), ex = c.extra[d] || {};
    openModal(`<p class="eyebrow">Cupos del día</p><h2>${esc(dayLong(d))}</h2>
      <p class="muted" style="margin:6px 0 12px">${dayCount(d)} pedidos tomados. Suban el máximo donde la cocina alcance a preparar más; la web y el agente lo vuelven a ofrecer al tiro.</p>
      <form class="form" data-day-form="${d}">
        <div class="drows">${rows.map(r => { const m = SP.baseMax(r.id) + (+ex[r.id] || 0), full = m && r.used >= m - 1e-9;
          return `<div class="drow${full ? ' is-full' : ''}"><span class="drow__l">${esc(r.label)}<small>${fmtU(r.used)} de ${m} ${r.unit}${full ? ' · lleno' : ''}</small></span>
            <span class="drow__m meter ${full ? 'is-full' : meterCls(r.used, m)}"><span style="width:${m ? Math.min(100, r.used / m * 100) : 0}%"></span></span>
            <span class="stepper"><button type="button" data-stp="-1" aria-label="Menos">−</button><input type="number" min="0" max="99" name="d-${r.id}" value="${m}" aria-label="Máximo de ${esc(r.label)}"><button type="button" data-stp="1" aria-label="Más">+</button></span></div>`; }).join('')}</div>
        <div class="switch"><span><b>Cerrar este día</b><small>Feriado, vacaciones o mantención</small></span><input type="checkbox" name="block" ${c.blocked[d] ? 'checked' : ''}></div>
        <div style="display:flex;gap:8px;flex-wrap:wrap"><button class="btn btn--solid" type="submit">Guardar</button><button class="btn btn--line" type="button" data-day-reset="${d}">Volver al normal</button></div>
      </form>`);
  }
  document.addEventListener('click', e => {
    const b = e.target.closest('[data-cday]'); if (b) return dayModal(b.dataset.cday);
    const s = e.target.closest('[data-stp]'); if (!s) return;
    const i = s.parentNode.querySelector('input'); i.value = Math.max(0, (+i.value || 0) + +s.dataset.stp);
  });
  document.addEventListener('submit', e => {
    const f = e.target.closest('[data-day-form]'); if (!f) return;
    e.preventDefault();
    const d = f.dataset.dayForm, x = SP.get('cupos', {}), prev = (x.extra || {})[d] || {};
    x.extra = x.extra || {}; x.blocked = x.blocked || {};
    const ex = {}; let freed = 0;
    SP.BUCKETS.forEach(b => { const v = +f.elements['d-' + b.id].value - SP.baseMax(b.id); if (v) ex[b.id] = v; freed += Math.max(0, v - (+prev[b.id] || 0)); });
    if (Object.keys(ex).length) x.extra[d] = ex; else delete x.extra[d];
    if (f.elements.block.checked) x.blocked[d] = true; else delete x.blocked[d];
    SP.set('cupos', x); if (freed) markFreed(d);
    closeModal(); render(); renderNotif(); toast(freed ? `Listo: ${freed} ${freed === 1 ? 'cupo más' : 'cupos más'} para el ${SP.fmt(d, { weekday: 'long', day: 'numeric' })}. La web ya los ofrece` : 'Día actualizado');
  });
  document.addEventListener('click', e => {
    const b = e.target.closest('[data-day-reset]'); if (!b) return;
    const x = SP.get('cupos', {}); if (x.extra) delete x.extra[b.dataset.dayReset]; if (x.blocked) delete x.blocked[b.dataset.dayReset];
    SP.set('cupos', x); closeModal(); render(); toast('El día vuelve a sus máximos normales');
  });

  /* ---------- Reportería ---------- */
  let rp = 90;
  function renderReportes() {
    const from = dISO(-rp), past = ORDERS.filter(o => o.date > from && o.date <= T && live(o));
    const prev = ORDERS.filter(o => o.date > dISO(-rp * 2) && o.date <= from && live(o));
    const sales = sum(past, o => o.total), tick = sales / Math.max(1, past.length);
    const byClient = {}; past.forEach(o => byClient[o.client] = (byClient[o.client] || 0) + 1);
    const recurrent = past.filter(o => byClient[o.client] > 1).length / Math.max(1, past.length);
    const lead = sum(past, o => (new Date(o.date) - new Date(o.created)) / 864e5) / Math.max(1, past.length);
    // ventas por semana
    const weeks = [];
    for (let w = Math.ceil(rp / 7) - 1; w >= 0; w--) {
      const a = dISO(-7 * w - 6), b = dISO(-7 * w), v = sum(past.filter(o => o.date >= a && o.date <= b), o => o.total);
      weeks.push({ l: SP.fmt(a, { day: 'numeric', month: 'short' }), full: `Semana del ${SP.fmt(a, { day: 'numeric', month: 'short' })}`, v });
    }
    const chCount = Object.keys(CH).map(c => ({ l: `${chan(c)} ${c}`, v: past.filter(o => o.channel === c).length })).sort((a, b) => b.v - a.v);
    const prodCount = {}; past.forEach(o => o.items.forEach(i => prodCount[i.id] = (prodCount[i.id] || 0) + i.qty));
    const top = Object.entries(prodCount).sort((a, b) => b[1] - a[1]).slice(0, 8).map(([id, v]) => ({ l: SP.byId(id).name, v }));
    const dow = [1, 2, 3, 4, 5, 6].map(w => ({ l: DOW[w], v: past.filter(o => new Date(o.date + 'T12:00').getDay() === w).length }));
    const hours = Array.from({ length: 12 }, (_, k) => ({ l: (9 + k) + 'h', full: `${9 + k}:00 a ${10 + k}:00`, v: past.filter(o => o.hour === 9 + k).length }));
    const kpi = (l, n, s) => `<div class="box kpi"><span class="kpi__l">${l}</span><span class="kpi__n">${n}</span><span class="kpi__s">${s}</span></div>`;
    const delta = (a, b) => `<span class="${pct(a, b) >= 0 ? 'up' : 'down'}">${pct(a, b) >= 0 ? '▲' : '▼'} ${Math.abs(pct(a, b))}%</span> vs. período anterior`;
    $('#v-reportes').innerHTML = head('Reportería', 'Cómo van las ventas, qué se vende más y por dónde llegan los pedidos.',
      [30, 90].map(n => `<button class="filter${rp === n ? ' is-active' : ''}" data-rp="${n}">Últimos ${n} días</button>`).join('')) + `
      <p class="note">Cifras de ejemplo generadas para la demo. Con el sistema funcionando, se calculan solas con los pedidos reales.</p>
      <div class="grid g-4">
        ${kpi('Ventas', SP.money(sales), delta(sales, sum(prev, o => o.total)))}
        ${kpi('Pedidos', past.length.toLocaleString('es-CL'), delta(past.length, prev.length))}
        ${kpi('Ticket promedio', SP.money(tick), 'por pedido')}
        ${kpi('Pedidos de clientes frecuentes', Math.round(recurrent * 100) + '%', `Anticipación promedio: ${lead.toFixed(1)} días`)}
      </div>
      <div class="grid g-main" style="margin-top:18px">
        <div class="box"><div class="box__head"><div><h2>Ventas por semana</h2><p>Pasa el cursor por cada barra para ver el monto</p></div></div>${barsV(weeks, SP.money)}</div>
        <div class="box"><div class="box__head"><div><h2>Pedidos por canal</h2><p>Dónde conviene poner el agente primero</p></div></div>${barsH(chCount, v => v)}</div>
      </div>
      <div class="grid g-3" style="margin-top:18px">
        <div class="box"><div class="box__head"><h2>Productos más pedidos</h2></div>${barsH(top, v => v)}</div>
        <div class="box"><div class="box__head"><div><h2>Pedidos por día</h2><p>Para planificar la producción</p></div></div>${barsV(dow, v => v + ' pedidos')}</div>
        <div class="box"><div class="box__head"><div><h2>Hora en que piden</h2><p>Cuándo llegan los mensajes</p></div></div>${barsV(hours, v => v + ' pedidos')}</div>
      </div>`;
  }
  document.addEventListener('click', e => { const b = e.target.closest('[data-rp]'); if (b) { rp = +b.dataset.rp; renderReportes(); } });

  /* ---------- Campañas ---------- */
  const CAMPS = SP.PEAKS.map(p => ({ ...p, status: T <= SP.cutoff(p) ? (p === SP.activePromo() ? 'activa' : 'programada') : 'finalizada', audience: 'Clientes con correo aceptado' }));
  const subs = CLIENTS.filter(c => c.consent).length * 37; // ejemplo
  function renderCampanas() {
    const BD = SP.bday(), bdThisWeek = 3 + CLIENTS.length % 5;
    $('#v-campanas').innerHTML = head('Campañas y <em>fechas especiales</em>', 'Avisen con tiempo de las fechas de más demanda para repartir el trabajo. El producto se prepara fresco para el día elegido; solo el pedido se hace antes.',
      `<button class="btn btn--solid btn--sm" data-new-camp>+ Nueva campaña</button>`) + `
      <p class="note"><span><b>Propuesta para conversar:</b> ofrecer cerca de un 10% de descuento a quien encargue con anticipación para la fecha elegida. Hoy no se muestra en la tienda; se activaría solo si les parece.</span></p>
      <div class="grid g-main">
        <div class="box">
          <div class="box__head"><h2>Calendario de campañas</h2><p>${subs} clientes reciben correos (ejemplo)</p></div>
          ${CAMPS.map(c => `<div class="camp"><div class="camp__date"><b>${new Date(c.date + 'T12:00').getDate()}</b><small>${SP.fmt(c.date, { month: 'short' })}</small></div>
            <div><h3>${esc(c.name)} · propuesta -${c.off}% ${st(c.status)}</h3><p>Encargos anticipados hasta el ${SP.fmt(SP.cutoff(c), { day: 'numeric', month: 'long' })} · ${c.products.map(id => SP.byId(id)?.name).filter(Boolean).join(', ')}</p></div>
            <div class="camp__stats">${c.status === 'activa' ? `<span><b>${Math.round(subs * .97)}</b>enviados</span><span><b>48%</b>abiertos</span><span><b>${Math.round(subs * .04)}</b>pedidos</span>` : c.status === 'programada' ? '<span class="small">Se envía 3 semanas antes</span>' : ''}</div></div>`).join('')}
        </div>
        <div class="grid" style="align-content:start">
          <div class="box">
            <div class="box__head"><div><h2>Destacados de la semana</h2><p>Correo automático cada lunes a las 09:00</p></div><span class="st st--activa">Activo</span></div>
            <div class="chips">${SP.PRODUCTS.slice(0, 12).map(p => `<label><input type="checkbox" ${['menta', 'milhoja', 'selva', 'trufas'].includes(p.id) ? 'checked' : ''}><span>${esc(p.name)}</span></label>`).join('')}</div>
            <p class="small muted" style="margin:12px 0 0">Si no eligen nada, se mandan los 3 más pedidos de la semana anterior.</p>
          </div>
          <form class="box form" data-bday-form>
            <div class="box__head" style="margin:0"><div><h2>Saludo de cumpleaños</h2><p>Correo automático el día del cumpleaños</p></div><span class="st st--${BD.on ? 'activa' : 'borrador'}">${BD.on ? 'Activo' : 'Apagado'}</span></div>
            <div class="row"><label class="field"><span>Descuento</span><select name="off">${[5, 10, 15, 20].map(n => `<option value="${n}" ${n === +BD.off ? 'selected' : ''}>${n}%</option>`).join('')}</select></label>
              <label class="field"><span>Válido</span><select name="scope"><option value="semana" ${BD.scope === 'semana' ? 'selected' : ''}>Toda la semana del cumpleaños</option><option value="dia" ${BD.scope === 'dia' ? 'selected' : ''}>Solo el día</option></select></label></div>
            <div class="switch"><span><b>Enviar el saludo</b><small>A clientes con cuenta y fecha de cumpleaños</small></span><input type="checkbox" name="on" ${BD.on ? 'checked' : ''}></div>
            <div class="mail"><div style="padding:12px 16px;border-bottom:1px solid var(--stone)"><small class="muted">Asunto</small><br><b style="font-weight:500">¡Feliz cumpleaños, Camila! 🎂</b></div>
              <div style="padding:12px 16px" class="small" data-bday-prev>En San Pedro te queremos saludar. Para celebrar, tienes <b>${SP.bdayText(BD)}</b>.</div></div>
            <p class="small muted" style="margin:0">${bdThisWeek} clientes de ejemplo cumplen años esta semana.</p>
            <button class="btn btn--solid btn--sm" type="submit">Guardar saludo</button>
          </form>
          <div class="box box--sand"><h2>Ideas para sumar</h2>
            <ul class="small" style="margin:10px 0 0;padding-left:18px;display:grid;gap:6px">
              <li>Recordar 10 días antes del cumpleaños la torta que pidieron el año pasado.</li>
              <li>“Te extrañamos”: a quien no pide hace 3 meses, puntos dobles por una semana.</li>
              <li>Puntos dobles los días con más cupos libres (martes y miércoles).</li>
            </ul>
          </div>
        </div>
      </div>`;
  }
  document.addEventListener('change', e => {
    const f = e.target.closest('[data-bday-form]'); if (!f) return;
    $('[data-bday-prev]').innerHTML = `En San Pedro te queremos saludar. Para celebrar, tienes <b>${SP.bdayText({ off: f.elements.off.value, scope: f.elements.scope.value })}</b>.`;
  });
  document.addEventListener('submit', e => {
    const f = e.target.closest('[data-bday-form]'); if (!f) return;
    e.preventDefault(); SP.set('bday', { on: f.elements.on.checked, off: +f.elements.off.value, scope: f.elements.scope.value });
    renderCampanas(); toast('Saludo de cumpleaños guardado');
  });
  document.addEventListener('click', e => {
    if (!e.target.closest('[data-new-camp]')) return;
    const nextPeak = CAMPS.find(c => c.status !== 'finalizada');
    openModal(`<p class="eyebrow">Nueva campaña</p><h2>Lanza una <em>promoción</em></h2>
      <form class="form" data-camp-form style="margin-top:14px">
        <div class="row"><label class="field"><span>Fecha especial</span><select name="peak">${SP.PEAKS.map(p => `<option value="${p.id}" ${p === nextPeak ? 'selected' : ''}>${p.name} · ${SP.fmt(p.date, { day: 'numeric', month: 'short' })}</option>`).join('')}</select></label>
          <label class="field"><span>Descuento</span><select name="off">${[0, 5, 10, 15].map(n => `<option ${n === 10 ? 'selected' : ''} value="${n}">${n ? n + '% por encargo anticipado' : 'Sin descuento (solo aviso)'}</option>`).join('')}</select></label></div>
        <div class="row"><label class="field"><span>Pedir con anticipación de</span><select name="lead"><option value="7" selected>1 semana antes</option><option value="10">10 días antes</option><option value="14">2 semanas antes</option></select></label>
          <label class="field"><span>Para</span><select name="aud"><option>Todos los que aceptaron correos</option><option>Clientes frecuentes (3+ pedidos)</option><option>Clientes que no piden hace 3 meses</option></select></label></div>
        <fieldset class="field"><legend>Productos con descuento</legend><div class="chips">${SP.PRODUCTS.map(p => `<label><input type="checkbox" name="p" value="${p.id}" ${nextPeak.products.includes(p.id) ? 'checked' : ''}><span>${esc(p.name)}</span></label>`).join('')}</div></fieldset>
        <fieldset class="field"><legend>Dónde se muestra</legend><div class="chips"><label><input type="checkbox" checked><span>Correo</span></label><label><input type="checkbox" checked><span>Banner en la web</span></label><label><input type="checkbox" checked><span>Respuesta del chatbot</span></label><label><input type="checkbox"><span>Texto para Instagram</span></label></div></fieldset>
        <p class="note" data-camp-preview></p>
        <button class="btn btn--solid" type="submit">Programar campaña</button>
      </form>`);
    const f = $('[data-camp-form]');
    const prev = () => {
      const p = SP.PEAKS.find(x => x.id === f.elements.peak.value), cut = SP.iso(SP.plus(new Date(p.date + 'T12:00'), -f.elements.lead.value));
      const n = $$('input[name=p]:checked', f).length;
      $('[data-camp-preview]').innerHTML = `<span><b>${p.name}:</b> ${f.elements.off.value}% en ${n} productos, para pedidos hechos hasta el <b>${SP.fmt(cut, { day: 'numeric', month: 'long' })}</b>. Se avisa por correo 3 semanas antes y se recuerda 3 días antes del cierre.</span>`;
    };
    f.addEventListener('change', prev); prev();
  });
  document.addEventListener('submit', e => {
    const f = e.target.closest('[data-camp-form]'); if (!f) return;
    e.preventDefault();
    const p = SP.PEAKS.find(x => x.id === f.elements.peak.value), c = CAMPS.find(x => x.id === p.id);
    c.off = +f.elements.off.value; c.products = $$('input[name=p]:checked', f).map(i => i.value);
    if (c.status === 'finalizada') c.status = 'programada';
    closeModal(); renderCampanas(); toast(`Campaña de ${p.name} programada`);
  });

  /* ---------- Clientes y puntos ---------- */
  function renderClientes() {
    const stats = CLIENTS.map(c => {
      const os = ORDERS.filter(o => o.client === c.name && live(o) && o.date <= T);
      return { ...c, n: os.length, spent: sum(os, o => o.total), last: os.length ? os[os.length - 1].date : null, pts: SP.pointsFor(sum(os, o => o.total)) + (c.account ? SP.premios().welcome : 0) };
    }).sort((a, b) => b.spent - a.spent);
    $('#v-clientes').innerHTML = head('Clientes y <em>puntos</em>', 'Quién compra, cada cuánto y cuántos puntos lleva. Propuesta de Club San Pedro para conversar.') + `
      <div class="grid g-main">
        <div class="box">
          <div class="box__head"><h2>Clientes</h2><p>${CLIENTS.length} de ejemplo · se muestran los 40 que más compran</p></div>
          <div class="table-wrap"><table class="t"><thead><tr><th>Cliente</th><th class="num">Pedidos</th><th>Último</th><th class="num">Compras</th><th class="num">Puntos</th><th>Correos</th></tr></thead><tbody>
          ${stats.slice(0, 40).map(c => `<tr><td><b>${esc(c.name)}</b>${c.account ? ' <span class="pill">con cuenta</span>' : ''}<br><span class="small muted">${esc(c.phone)}</span></td><td class="num">${c.n}</td><td>${c.last ? SP.fmt(c.last, { day: 'numeric', month: 'short' }) : '—'}</td><td class="num">${SP.money(c.spent)}</td><td class="num">${c.pts}</td><td>${c.consent ? '<span class="up">Sí</span>' : '<span class="muted">No</span>'}</td></tr>`).join('')}
          </tbody></table></div>
        </div>
        <div class="grid" style="align-content:start">
          <form class="box form" data-points-form novalidate>
            <h2>Reglas del Club San Pedro</h2>
            <div class="row"><label class="field"><span>Un punto cada</span><input type="number" name="per" value="${PZ.per}" min="100" step="100"></label><label class="field"><span>Bono al crear cuenta</span><input type="number" name="welcome" value="${PZ.welcome}" min="0"></label></div>
            <p class="small muted" style="margin:-6px 0 0">En la web no se muestra esta regla: solo dice que mientras más pedidos, más puntos y premios.</p>
            <label class="field"><span>Los puntos vencen después de</span><select><option>12 meses</option><option>6 meses</option><option>No vencen</option></select></label>
            <div><h2 style="font-size:18px;margin-top:6px">Premios por nivel</h2><p class="small muted" style="margin:4px 0 0">Al llegar a cada nivel, el cliente elige uno de estos productos de regalo.</p></div>
            <div class="levels" data-levels>${levelsHTML()}</div>
            <button class="btn btn--line btn--sm" type="button" data-lv-add>+ Agregar nivel</button>
            <button class="btn btn--solid" type="submit">Guardar reglas</button>
          </form>
        </div>
      </div>`;
    $('[data-points-form]').addEventListener('submit', e => {
      e.preventDefault(); const f = e.target.elements;
      PZ.per = Math.max(100, +f.per.value || 500); PZ.welcome = Math.max(0, +f.welcome.value || 0);
      PZ.levels = PZ.levels.filter(l => l.gifts.length).sort((x, y) => x.pts - y.pts);
      SP.set('premios', PZ); renderClientes(); toast('Reglas guardadas. La cuenta de cada cliente ya muestra los nuevos premios');
    });
  }
  // Premios por nivel: copia editable que se guarda al tocar "Guardar reglas"
  let PZ = JSON.parse(JSON.stringify(SP.premios()));
  const levelsHTML = () => PZ.levels.map((l, i) => `<div class="lv">
      <div class="lv__h"><label>Al llegar a <input type="number" min="1" value="${l.pts}" data-lv-pts="${i}"> puntos</label><button type="button" class="lv__x" data-lv-del="${i}" aria-label="Quitar nivel">Quitar</button></div>
      <div class="lv__gifts">${l.gifts.map((g, j) => `<span class="gift">${esc(SP.giftName(g))}<button type="button" data-gift-del="${i}|${j}" aria-label="Quitar ${esc(SP.giftName(g))}">×</button></span>`).join('')}
        <select data-gift-add="${i}" aria-label="Agregar premio"><option value="">+ Agregar premio</option>${SP.PRODUCTS.map(p => `<optgroup label="${esc(p.name)}">${p.sizes.map(z => p.id + '|' + z).filter(g => !l.gifts.includes(g)).map(g => `<option value="${esc(g)}">${esc(p.sizes.length > 1 ? g.split('|')[1] : p.name)}</option>`).join('')}</optgroup>`).join('')}</select></div>
    </div>`).join('') || '<p class="empty">Sin niveles. Agreguen uno.</p>';
  const redrawLevels = () => { const el = $('[data-levels]'); if (el) el.innerHTML = levelsHTML(); };
  document.addEventListener('change', e => {
    const t = e.target;
    if (t.matches('[data-lv-pts]')) { PZ.levels[+t.dataset.lvPts].pts = Math.max(1, +t.value || 1); }
    if (t.matches('[data-gift-add]') && t.value) { PZ.levels[+t.dataset.giftAdd].gifts.push(t.value); redrawLevels(); }
  });
  document.addEventListener('click', e => {
    const t = e.target;
    if (t.closest('[data-lv-add]')) { const last = PZ.levels[PZ.levels.length - 1]; PZ.levels.push({ pts: last ? last.pts * 2 : 250, gifts: [] }); redrawLevels(); }
    if (t.closest('[data-lv-del]')) { PZ.levels.splice(+t.closest('[data-lv-del]').dataset.lvDel, 1); redrawLevels(); }
    if (t.closest('[data-gift-del]')) { const [i, j] = t.closest('[data-gift-del]').dataset.giftDel.split('|').map(Number); PZ.levels[i].gifts.splice(j, 1); redrawLevels(); }
  });

  /* ---------- Chatbot y canales ---------- */
  function renderCanales() {
    const card = (c, name, desc, on) => `<div class="box channel"><div class="channel__head">${chan(c)}<div><b>${name}</b><br><span class="small muted">${desc}</span></div><span class="pill pill--new" style="margin-left:auto">Propuesta</span></div>
      <div class="switch"><span><b>El agente responde y toma pedidos</b><small>Pregunta producto, tamaño, día y entrega</small></span><input type="checkbox" ${on ? 'checked' : ''}></div>
      <div class="switch"><span><b>Ingresar el pedido automáticamente</b><small>Queda “por revisar” hasta la revisión del equipo</small></span><input type="checkbox" ${on ? 'checked' : ''}></div></div>`;
    $('#v-canales').innerHTML = head('Chatbot y <em>canales</em>', 'Un agente que contesta en WhatsApp, Instagram y Facebook, consulta los cupos y anota el pedido. Una persona lo revisa 1 o 2 veces al día.') + `
      <div class="grid g-3">
        ${card('WhatsApp', 'WhatsApp Business', '+56 9 8742 4551', true)}
        ${card('Instagram', 'Instagram', '@pasteleriasanpedrovillarrica', true)}
        ${card('Facebook', 'Facebook Messenger', 'Panadería San Pedro', false)}
      </div>
      <div class="grid g-2" style="margin-top:18px">
        <div class="box">
          <h2>Cómo trabaja el agente</h2>
          <ol class="small" style="margin:12px 0 0;padding-left:18px;display:grid;gap:8px">
            <li>Responde al tiro, también fuera de horario, con el catálogo y los tamaños.</li>
            <li>Revisa los cupos del día pedido y, si está lleno, ofrece otro día.</li>
            <li>Anota el pedido con la conversación adjunta y avisa con una notificación arriba.</li>
            <li>El equipo lo confirma, corrige o cancela en <a class="link" href="#agente">Revisión del agente</a>.</li>
            <li>El cliente recibe la confirmación y el aviso cuando su pedido está listo.</li>
          </ol>
          <div class="switch" style="margin-top:10px"><span><b>Horarios de revisión</b><small>Recordatorio para el equipo</small></span><span class="schedule"><span class="pill pill--new">11:00</span><span class="pill pill--new">17:00</span></span></div>
          <div class="switch"><span><b>Derivar a una persona</b><small>Si el cliente lo pide o es un pedido especial (matrimonios, eventos)</small></span><input type="checkbox" checked></div>
        </div>
        <div class="box">
          <h2>Ejemplo de conversación</h2>
          <div class="chat" style="margin-top:12px;border-radius:16px;max-height:none">
            <div class="msg">Hola, ¿tienen torta de lúcuma para el domingo?</div>
            <div class="msg msg--bot">¡Hola! El domingo estamos cerrados 🙏 ¿Te sirve el sábado? Quedan cupos. Tenemos Lúcuma Real para 8, 15, 25 o 45 personas.<small>Agente San Pedro</small></div>
            <div class="msg">el sábado para 15</div>
            <div class="msg msg--bot">¡Listo! Anoté 1 Lúcuma Real para 15 personas, retiro el sábado en Ernesto Wagner 1327. Te confirmamos el valor en un rato. ¿A nombre de quién?<small>Agente San Pedro</small></div>
          </div>
        </div>
      </div>`;
  }

  /* ---------- Pedido telefónico ---------- */
  document.addEventListener('click', e => {
    if (!e.target.closest('[data-new-order]')) return;
    const firstOpen = Array.from({ length: 14 }, (_, k) => dISO(k + 1)).find(SP.isOpen);
    openModal(`<p class="eyebrow">Pedido telefónico o en tienda</p><h2>Nuevo <em>pedido</em></h2>
      <form class="form" data-phone-form style="margin-top:14px">
        <div class="row"><label class="field"><span>Cliente</span><input name="client" required list="clients"><datalist id="clients">${CLIENTS.map(c => `<option value="${esc(c.name)}">`).join('')}</datalist></label><label class="field"><span>Teléfono</span><input name="phone" type="tel"></label></div>
        <div class="row"><label class="field"><span>Producto</span><select name="item">${SP.PRODUCTS.map(p => `<option value="${p.id}">${esc(p.name)}</option>`).join('')}</select></label><label class="field"><span>Tamaño</span><select name="size">${SP.byId('menta').sizes.map(s => `<option>${s}</option>`).join('')}</select></label></div>
        <div class="row"><label class="field"><span>Para el día</span><input name="date" type="date" value="${firstOpen}" min="${T}"></label><label class="field"><span>Entrega</span><select name="mode"><option>Retiro</option><option>Despacho</option></select></label></div>
        <p class="small muted" data-cupo></p>
        <label class="field"><span>Notas</span><input name="note" placeholder="Mensaje en la torta, alergias, dirección…"></label>
        <button class="btn btn--solid" type="submit">Guardar pedido</button>
      </form>`);
    const f = $('[data-phone-form]');
    const cupo = () => {
      const x = f.elements, r = dayRows(x.date.value).find(b => b.id === SP.bucketOf(x.namedItem('item').value, x.size.value));
      $('[data-cupo]').innerHTML = !r || !r.max ? '<span class="down">Ese día está cerrado.</span>' : r.left <= 0 ? `<span class="down">Ese día ya se llenaron los cupos de ${esc(r.label.toLowerCase())}.</span> Pueden guardarlo igual o elegir otro día.` : `Ese día quedan <b>${fmtU(r.left)}</b> de ${r.max} cupos de ${esc(r.label.toLowerCase())}.`;
    };
    f.elements.namedItem('item').addEventListener('change', () => { f.elements.size.innerHTML = SP.byId(f.elements.namedItem('item').value).sizes.map(s => `<option>${s}</option>`).join(''); cupo(); });
    f.elements.size.addEventListener('change', cupo); f.elements.date.addEventListener('change', cupo); cupo();
    f.addEventListener('submit', ev => {
      ev.preventDefault(); const x = f.elements;
      if (!x.client.value.trim()) return x.client.focus();
      const before = fullKeys();
      ORDERS.push({ id: 'SP-' + (seq++), client: x.client.value, phone: x.phone.value, channel: 'Teléfono', date: x.date.value, created: T, hour: new Date().getHours(), mode: x.mode.value,
        items: [{ id: x.namedItem('item').value, size: x.size.value, qty: 1 }], total: price(x.namedItem('item').value, x.size.value), status: 'confirmado', note: x.note.value });
      ORDERS.sort((a, b) => a.date.localeCompare(b.date) || a.hour - b.hour);
      closeModal(); toast('Pedido guardado'); render(); setTimeout(() => checkFull(before), 700);
    });
  });

  /* ---------- Modal ---------- */
  const modal = $('#modal');
  function openModal(html) { $('[data-modal-body]').innerHTML = html; modal.hidden = false; setTimeout(() => $('input,select', modal)?.focus(), 200); }
  function closeModal() { modal.hidden = true; }
  $('[data-close-modal]').addEventListener('click', closeModal);
  modal.addEventListener('click', e => { if (e.target === modal) closeModal(); });
  addEventListener('keydown', e => { if (e.key === 'Escape') { closeModal(); notifBox.hidden = true; } });

  /* ---------- Navegación ---------- */
  const VIEWS = { resumen: renderResumen, pedidos: renderPedidos, agente: renderAgent, capacidad: renderCapacidad, reportes: renderReportes, campanas: renderCampanas, clientes: renderClientes, canales: renderCanales };
  let current = null;
  function render() { VIEWS[current](); }
  const show = id => {
    if (!VIEWS[id]) id = 'resumen';
    current = id; render();
    $$('.view').forEach(v => v.classList.toggle('is-on', v.id === 'v-' + id));
    $$('[data-view-link]').forEach(a => a.classList.toggle('is-current', a.dataset.viewLink === id));
    scrollTo(0, 0);
  };
  addEventListener('hashchange', () => show(location.hash.slice(1)));
  const startFull = fullDays(), al = SP.cupos().alerts;
  if (al.web) startFull.forEach((x, i) => NOTIF.push(cupoNotif(x, i ? 'Hoy 08:00' : 'Hoy 08:00')));
  renderNotif();
  show(location.hash.slice(1) || 'resumen');
  let seen = false; try { seen = sessionStorage.getItem('sp-cupos-popup') === '1'; sessionStorage.setItem('sp-cupos-popup', '1'); } catch (_) {}
  if (al.popup && startFull.length && !seen) setTimeout(() => modal.hidden && popupFull(startFull.slice(0, 4)), 1200);
})();
