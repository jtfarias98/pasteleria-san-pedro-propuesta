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
    { id: 'navidad', name: 'Navidad', date: '2026-12-25', off: 15, products: ['selva', 'bombon', 'manjar-nuez', 'amaretto'] },
    { id: 'anionuevo', name: 'Año Nuevo', date: '2026-12-31', off: 10, products: ['trufas', 'postre-vaso', 'empanada'] },
    { id: 'sanvalentin', name: 'San Valentín', date: '2027-02-14', off: 10, products: ['amor', 'terciopelo', 'trufas'] },
    { id: 'pascua', name: 'Semana Santa', date: '2027-03-28', off: 10, products: ['trufas', 'regalo'] },
    { id: 'madre', name: 'Día de la Madre', date: '2027-05-09', off: 12, products: ['frambuesa', 'lucuma', 'regalo'] },
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

  /* ---------- Cupos diarios (los define el admin) ---------- */
  const DEFAULT_CAP = { base: 30, tortas: 18, week: { 0: 0, 1: 26, 2: 26, 3: 28, 4: 28, 5: 34, 6: 38 }, overrides: {}, blocked: {} };
  const capacity = () => Object.assign({}, DEFAULT_CAP, get('capacity', {}));
  const seed = s => { let h = 0; for (const c of s) h = (h * 31 + c.charCodeAt(0)) >>> 0; return h; };
  // pedidos ya tomados para un día (simulado de forma estable + los pedidos hechos en la demo)
  const taken = date => {
    const d = new Date(date + 'T12:00'), diff = Math.round((d - today()) / 864e5);
    const cap = maxFor(date);
    if (!cap) return 0;
    const near = diff <= 1 ? 1.05 : diff <= 3 ? .78 : diff <= 7 ? .45 : .2;
    const base = Math.round(cap * near + (seed(date) % 7) - 3);
    const own = get('orders', []).filter(o => o.date === date && o.status !== 'cancelado').length;
    return Math.max(0, Math.min(cap, base + own));
  };
  const maxFor = date => {
    const c = capacity();
    if (c.blocked[date]) return 0;
    if (date in c.overrides) return +c.overrides[date];
    const wd = new Date(date + 'T12:00').getDay();
    return +(c.week[wd] ?? c.base);
  };
  const availability = date => {
    const max = maxFor(date), t = taken(date), left = max - t;
    const state = !max ? 'cerrado' : left <= 0 ? 'completo' : left <= Math.max(3, max * .15) ? 'pocos' : 'ok';
    return { max, taken: t, left: Math.max(0, left), state };
  };

  /* ---------- Sesión de demo ---------- */
  const session = () => get('session', null);
  const login = user => set('session', user);
  const logout = () => set('session', null);

  /* ---------- Pedidos de ejemplo del cliente ---------- */
  const sampleClientOrders = () => {
    const t = today();
    return [
      { id: 'SP-2418', date: iso(plus(t, plus(t, 3).getDay() === 0 ? 4 : 3)), created: iso(plus(t, -1)), status: 'confirmado', mode: 'Retiro en tienda', channel: 'Web',
        items: [{ id: 'menta', size: '15 personas', qty: 1 }], total: 32900, points: 33 },
      { id: 'SP-2290', date: iso(plus(t, -19)), created: iso(plus(t, -24)), status: 'entregado', mode: 'Despacho', channel: 'WhatsApp',
        items: [{ id: 'empanada', size: 'Docena', qty: 2 }, { id: 'trufas', size: 'Caja chica', qty: 1 }], total: 41600, points: 42 },
      { id: 'SP-2104', date: iso(plus(t, -52)), created: iso(plus(t, -58)), status: 'entregado', mode: 'Retiro en tienda', channel: 'Instagram',
        items: [{ id: 'milhoja', size: '25 personas', qty: 1 }], total: 46900, points: 47 }
    ];
  };
  const clientOrders = () => get('orders', []).concat(sampleClientOrders());

  return { CONTACT, CATS, PRODUCTS, TORTA_SIZES, byId, PEAKS, cutoff, activePromo, iso, today, plus, fmt, money,
    get, set, capacity, maxFor, taken, availability, session, login, logout, clientOrders, seed, WA };
})();
