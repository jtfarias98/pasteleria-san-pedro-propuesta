/* Pastelería San Pedro — datos compartidos de la demo (catálogo, cupos, sesión, pedidos de ejemplo).
   En la versión real esto viene de una base de datos; aquí vive en el navegador (localStorage). */
window.SP = (() => {
  const WA = '56987424551';
  const CONTACT = {
    phone: '(45) 241 9874', phoneHref: 'tel:+56452419874',
    mobile: '+56 9 8742 4551', wa: WA,
    email: 'sanpedroproductos@gmail.com',
    address: 'Ernesto Wagner 1327, Villarrica',
    hours: 'Lunes a sábado, 09:00 a 20:00 · Domingo cerrado',
    instagram: 'https://www.instagram.com/pasteleriasanpedrovillarrica/',
    facebook: 'https://www.facebook.com/deliciasdesanpedro/'
  };

  const CATS = [
    ['tortas', 'Tortas'], ['tartas', 'Tartas y kuchen'], ['cocteleria', 'Coctelería'],
    ['alfajoreria', 'Alfajorería y trufas'], ['panaderia', 'Panadería'],
    ['salado', 'Empanadas y pizzas'], ['regalos', 'Regalos']
  ];
  const TORTA_SIZES = ['8 personas', '15 personas', '25 personas', '45 personas'];

  // Productos reales del sitio actual (nombres y fotos). Los precios no son públicos: se confirman por pedido.
  const PRODUCTS = [
    { id: 'menta', name: 'Menta San Pedro', cat: 'tortas', img: 'torta-menta', sizes: TORTA_SIZES, tag: 'La de la casa',
      desc: 'Bizcocho de chocolate relleno con crema de menta y trufa, decorado con chocolate en rama y chocolate blanco.' },
    { id: 'selva', name: 'Selva Negra', cat: 'tortas', img: 'torta-selva-negra', sizes: TORTA_SIZES, promo: 'navidad' },
    { id: 'amor', name: 'Amor', cat: 'tortas', img: 'torta-amor', sizes: TORTA_SIZES },
    { id: 'manjar-nuez', name: 'Manjar Nuez', cat: 'tortas', img: 'torta-manjar-nuez', sizes: TORTA_SIZES, promo: 'navidad' },
    { id: 'milhoja', name: 'Milhoja Clásica', cat: 'tortas', img: 'torta-milhoja', sizes: TORTA_SIZES, tag: 'Clásica' },
    { id: 'lucuma', name: 'Lúcuma Real', cat: 'tortas', img: 'torta-lucuma', sizes: TORTA_SIZES },
    { id: 'frambuesa', name: 'Bizcocho Frambuesa', cat: 'tortas', img: 'torta-frambuesa', sizes: TORTA_SIZES },
    { id: 'bombon', name: 'Bombón', cat: 'tortas', img: 'torta-bombon', sizes: TORTA_SIZES, promo: 'navidad' },
    { id: 'chocolate', name: 'Chocolate', cat: 'tortas', img: 'torta-chocolate', sizes: TORTA_SIZES },
    { id: 'terciopelo', name: 'Terciopelo Rojo', cat: 'tortas', img: 'torta-terciopelo', sizes: TORTA_SIZES },
    { id: 'moka', name: 'Moka', cat: 'tortas', img: 'torta-moka', sizes: TORTA_SIZES },
    { id: 'amaretto', name: 'Amaretto', cat: 'tortas', img: 'torta-amaretto', sizes: TORTA_SIZES, promo: 'navidad' },
    { id: 'tartas', name: 'Tartas y kuchen', cat: 'tartas', img: 'tartas', sizes: ['Entera', 'Por trozo'], desc: 'Variedad de tartas y kuchen de la temporada.' },
    { id: 'trufas', name: 'Trufas San Pedro', cat: 'alfajoreria', img: 'trufas', sizes: ['Caja chica', 'Caja grande'], desc: 'Nuestras clásicas trufas, también en versión cóctel.' },
    { id: 'marplatense', name: 'Marplatense trufa', cat: 'alfajoreria', img: 'alfajor', sizes: ['Unidad', 'Caja x6'] },
    { id: 'postre-vaso', name: 'Postre en vaso', cat: 'cocteleria', img: 'menta-trozo', sizes: ['50 ml', '150 ml'], desc: 'Amaretto, Amor, mousse de chocolate, suspiro y más.' },
    { id: 'pan', name: 'Pan del día', cat: 'panaderia', img: 'pan', sizes: ['1 kg', '½ kg'] },
    { id: 'empanada', name: 'Empanada napolitana', cat: 'salado', img: 'empanada', sizes: ['Unidad', 'Docena'] },
    { id: 'pizza', name: 'Pizza San Pedro', cat: 'salado', img: 'pizza', sizes: ['Familiar'] },
    { id: 'regalo', name: 'Caja de regalo', cat: 'regalos', img: 'regalos', sizes: ['Única'], desc: 'Selección de dulces de la casa, lista para regalar.' }
  ];
  const byId = id => PRODUCTS.find(p => p.id === id);

  /* ---------- Fechas ---------- */
  const iso = d => { const x = new Date(d); x.setMinutes(x.getMinutes() - x.getTimezoneOffset()); return x.toISOString().slice(0, 10); };
  const today = () => { const d = new Date(); d.setHours(12, 0, 0, 0); return d; };
  const plus = (d, n) => { const x = new Date(d); x.setDate(x.getDate() + n); return x; };
  const fmt = (s, o = { weekday: 'short', day: 'numeric', month: 'short' }) => new Date(String(s).slice(0, 10) + 'T12:00').toLocaleDateString('es-CL', o);
  const money = n => '$' + Math.round(n).toLocaleString('es-CL');

  /* ---------- Fechas peak (campañas) ---------- */
  const PEAKS = [
    { id: 'navidad', name: 'Navidad', date: '2026-12-25', off: 10, products: ['selva', 'bombon', 'manjar-nuez', 'amaretto'] },
    { id: 'anionuevo', name: 'Año Nuevo', date: '2026-12-31', off: 10, products: ['trufas', 'postre-vaso', 'empanada'] },
    { id: 'sanvalentin', name: 'San Valentín', date: '2027-02-14', off: 10, products: ['amor', 'terciopelo', 'trufas'] },
    { id: 'pascua', name: 'Semana Santa', date: '2027-03-28', off: 10, products: ['trufas', 'regalo'] },
    { id: 'madre', name: 'Día de la Madre', date: '2027-05-09', off: 10, products: ['frambuesa', 'lucuma', 'regalo'] },
    { id: 'padre', name: 'Día del Padre', date: '2027-06-20', off: 10, products: ['moka', 'chocolate'] },
    { id: 'fiestaspatrias', name: 'Fiestas Patrias', date: '2027-09-18', off: 10, products: ['empanada', 'pan'] }
  ];
  const cutoff = p => iso(plus(new Date(p.date + 'T12:00'), -7));
  const activePromo = () => PEAKS.find(p => iso(today()) <= cutoff(p));

  /* ---------- Estado guardado (demo) ---------- */
  const KEY = 'sp-demo-v1';
  const read = () => { try { return JSON.parse(localStorage.getItem(KEY)) || {}; } catch (_) { return {}; } };
  const write = s => { try { localStorage.setItem(KEY, JSON.stringify(s)); } catch (_) {} };
  const get = (k, def) => { const s = read(); return k in s ? s[k] : def; };
  const set = (k, v) => { const s = read(); s[k] = v; write(s); };

  /* ---------- Cupos por categoría (los define el admin) ---------- */
  // Máximo diario por categoría. Las tortas se cuentan por tamaño; las empanadas por docena; lo demás por caja o pedido.
  const BUCKETS = [
    { id: 't8', label: 'Tortas de 8 personas', unit: 'tortas', max: 8 },
    { id: 't15', label: 'Tortas de 15 personas', unit: 'tortas', max: 8 },
    { id: 't25', label: 'Tortas de 25 personas', unit: 'tortas', max: 5 },
    { id: 't45', label: 'Tortas de 45 personas', unit: 'tortas', max: 2 },
    { id: 'tartas', label: 'Tartas y kuchen', unit: 'enteras', max: 6 },
    { id: 'cocteleria', label: 'Coctelería', unit: 'pedidos', max: 5 },
    { id: 'dulces', label: 'Trufas y alfajores', unit: 'cajas', max: 10 },
    { id: 'empanadas', label: 'Empanadas', unit: 'docenas', max: 12 },
    { id: 'pizzas', label: 'Pizzas', unit: 'pizzas', max: 6 },
    { id: 'pan', label: 'Pan por encargo', unit: 'pedidos', max: 8 },
    { id: 'regalos', label: 'Cajas de regalo', unit: 'cajas', max: 4 }
  ];
  const bucket = id => BUCKETS.find(b => b.id === id);
  const bucketOf = (id, size) => {
    const p = byId(id); if (!p) return null;
    if (p.cat === 'tortas') return 't' + parseInt(size, 10);
    if (id === 'pizza') return 'pizzas';
    return { tartas: 'tartas', cocteleria: 'cocteleria', alfajoreria: 'dulces', panaderia: 'pan', salado: 'empanadas', regalos: 'regalos' }[p.cat];
  };
  // cuánto ocupa una línea del pedido en su categoría
  const unitsOf = i => {
    const b = bucketOf(i.id, i.size);
    if (b === 'cocteleria' || b === 'pan') return 1;
    if (i.size === 'Unidad') return i.qty / (b === 'empanadas' ? 12 : 6);
    if (i.size === 'Por trozo') return i.qty / 8;
    return i.qty;
  };
  const DEF_CUPOS = { closed: [0], max: {}, extra: {}, blocked: {}, alerts: { email: true, wa: false, web: true, popup: true } };
  const cupos = () => { const c = get('cupos', {}); return { ...DEF_CUPOS, ...c, alerts: { ...DEF_CUPOS.alerts, ...(c.alerts || {}) } }; };
  const seed = s => { let h = 0; for (const c of s) h = (h * 31 + c.charCodeAt(0)) >>> 0; return h; };
  const isOpen = date => { const c = cupos(); return !c.blocked[date] && !c.closed.includes(new Date(date + 'T12:00').getDay()); };
  const baseMax = b => { const c = cupos(); return b in c.max ? +c.max[b] : bucket(b).max; };
  const maxB = (date, b) => isOpen(date) ? Math.max(0, baseMax(b) + +((cupos().extra[date] || {})[b] || 0)) : 0;
  // ocupado: simulado de forma estable (más lleno mientras más cerca) + lo pedido en esta demo
  const simB = (date, b) => {
    const diff = Math.round((new Date(date + 'T12:00') - today()) / 864e5), base = baseMax(b), h = seed(date + b);
    if (diff < 1 || !isOpen(date) || !base) return 0;
    if (diff >= 2 && diff <= 6 && h % 9 === 0) return base;
    const near = diff <= 1 ? .9 : diff <= 3 ? .62 : diff <= 7 ? .38 : .15;
    return Math.min(base, Math.round(base * near * (.6 + (h % 50) / 100)));
  };
  const ownB = (date, b) => get('orders', []).filter(o => o.date === date && o.status !== 'cancelado')
    .reduce((s, o) => s + o.items.filter(i => bucketOf(i.id, i.size) === b).reduce((t, i) => t + unitsOf(i), 0), 0);
  const takenB = (date, b) => simB(date, b) + ownB(date, b);
  const needOf = items => { const n = {}; (items || []).forEach(i => { const b = bucketOf(i.id, i.size); if (b) n[b] = (n[b] || 0) + unitsOf(i); }); return n; };
  const listNames = a => a.length < 2 ? a[0] || '' : a.slice(0, -1).join(', ') + ' y ' + a[a.length - 1];
  // disponibilidad de un día; si se pasa el carrito, revisa solo las categorías que pide
  const availability = (date, items) => {
    const open = isOpen(date), need = needOf(items), asks = Object.keys(need).length;
    const rows = BUCKETS.map(b => { const max = maxB(date, b.id), taken = takenB(date, b.id); return { ...b, max, taken, left: Math.max(0, +(max - taken).toFixed(2)) }; });
    const max = rows.reduce((s, r) => s + r.max, 0), taken = rows.reduce((s, r) => s + Math.min(r.max, r.taken), 0);
    const full = rows.filter(r => r.max && r.left <= 0);
    const short = rows.filter(r => need[r.id] && r.left < need[r.id] - 1e-9);
    const tight = rows.filter(r => need[r.id] && r.left - need[r.id] < 2);
    const state = !open ? 'cerrado' : short.length ? 'completo' : !asks && full.length === rows.length ? 'completo' : tight.length ? 'pocos' : 'ok';
    const lower = a => listNames(a.map(r => r.label.charAt(0).toLowerCase() + r.label.slice(1)));
    const reason = !open ? 'Cerrado' : short.length ? 'Sin cupos de ' + lower(short) : tight.length ? 'Quedan pocos cupos de ' + lower(tight) : 'Con cupos';
    return { state, reason, rows, full, max, taken, left: Math.max(0, max - taken) };
  };
  const maxFor = date => availability(date).max;
  const taken = date => availability(date).taken;

  /* ---------- Club: puntos y premios (los define el admin) ---------- */
  // 1 punto cada $500. En la web no se muestra la regla: solo "más pedidos, más puntos".
  const DEF_PREMIOS = { per: 500, welcome: 50, levels: [
    { pts: 250, gifts: ['trufas|Caja chica', 'marplatense|Caja x6', 'postre-vaso|150 ml'] },
    { pts: 500, gifts: ['tartas|Entera', 'empanada|Docena', 'pizza|Familiar'] },
    { pts: 1000, gifts: ['menta|8 personas', 'milhoja|8 personas', 'regalo|Única'] }
  ] };
  const premios = () => { const p = { ...DEF_PREMIOS, ...get('premios', {}) }; p.levels = [...p.levels].sort((a, b) => a.pts - b.pts); return p; };
  const pointsFor = total => Math.floor((total || 0) / premios().per);
  const giftName = g => { const [id, size] = g.split('|'), p = byId(id); return p ? p.name + (p.sizes.length > 1 ? ' · ' + size : '') : g; };
  const giftImg = g => (byId(g.split('|')[0]) || {}).img || 'regalos';
  // Saludo de cumpleaños por correo, con descuento
  const DEF_BDAY = { on: true, off: 15, scope: 'semana' };
  const bday = () => ({ ...DEF_BDAY, ...get('bday', {}) });
  const bdayText = b => `${b.off}% de descuento ${b.scope === 'dia' ? 'el día de tu cumpleaños' : 'toda la semana de tu cumpleaños'}`;

  /* ---------- Sesión de demo ---------- */
  const session = () => get('session', null);
  const login = user => set('session', user);
  const logout = () => set('session', null);

  /* ---------- Pedidos de ejemplo del cliente ---------- */
  const sampleClientOrders = () => {
    const t = today();
    return [
      { id: 'SP-2418', date: iso(plus(t, plus(t, 3).getDay() === 0 ? 4 : 3)), created: iso(plus(t, -1)), status: 'confirmado', mode: 'Retiro en tienda', channel: 'Web',
        items: [{ id: 'menta', size: '15 personas', qty: 1 }], total: 32900, points: 65 },
      { id: 'SP-2290', date: iso(plus(t, -19)), created: iso(plus(t, -24)), status: 'entregado', mode: 'Despacho', channel: 'WhatsApp',
        items: [{ id: 'empanada', size: 'Docena', qty: 2 }, { id: 'trufas', size: 'Caja chica', qty: 1 }], total: 41600, points: 83 },
      { id: 'SP-2104', date: iso(plus(t, -52)), created: iso(plus(t, -58)), status: 'entregado', mode: 'Retiro en tienda', channel: 'Instagram',
        items: [{ id: 'milhoja', size: '25 personas', qty: 1 }], total: 46900, points: 93 }
    ];
  };
  const clientOrders = () => get('orders', []).concat(sampleClientOrders());

  return { CONTACT, CATS, PRODUCTS, TORTA_SIZES, byId, PEAKS, cutoff, activePromo, iso, today, plus, fmt, money,
    get, set, BUCKETS, bucket, simB, bucketOf, unitsOf, cupos, isOpen, baseMax, maxB, takenB, needOf, listNames, maxFor, taken, availability, premios, pointsFor, giftName, giftImg, bday, bdayText, session, login, logout, clientOrders, seed, WA };
})();
