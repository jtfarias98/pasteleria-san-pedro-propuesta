/* Pastelería San Pedro — sitio público: catálogo, pedido, cuenta (sin librerías) */
(() => {
  const $ = (s, c = document) => c.querySelector(s);
  const $$ = (s, c = document) => [...c.querySelectorAll(s)];
  const body = document.body;
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const esc = s => String(s ?? '').replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));

  /* MODO DEMO: los pedidos y cuentas se guardan solo en este navegador.
     En la versión real se conectan a la base de datos y al login de Google. */
  const DEMO = true;

  const toastEl = $('#toast'); let toastT;
  const toast = msg => { toastEl.textContent = msg; toastEl.classList.add('is-on'); clearTimeout(toastT); toastT = setTimeout(() => toastEl.classList.remove('is-on'), 3200); };

  /* ---------- Header ---------- */
  const header = $('#header');
  const placeSubnav = () => document.documentElement.style.setProperty('--subnav-top', header.offsetHeight + 'px');
  const onScroll = () => { header.classList.toggle('is-solid', scrollY > 60); placeSubnav(); };
  addEventListener('scroll', onScroll, { passive: true });
  header.addEventListener('transitionend', placeSubnav);
  addEventListener('resize', placeSubnav);

  /* ---------- Promoción activa (fecha peak) ---------- */
  const promo = SP.activePromo();
  if (promo) {
    // Sin descuentos en la web: solo se invita a encargar con anticipación (el producto se hace fresco para la fecha)
    $('#announce').hidden = false;
    $('[data-promo-text]').textContent = `${promo.name}: encarga con anticipación y asegura tu cupo. La preparamos fresca para el día que elijas`;
    $('[data-promo-name]').textContent = promo.name + ' · ' + SP.fmt(promo.date, { day: 'numeric', month: 'long' });
    $('[data-promo-name-low]').textContent = promo.name;
    $('[data-promo-name-short]').textContent = promo.name;
    $('[data-cd-d]').textContent = Math.max(0, Math.round((new Date(promo.date + 'T12:00') - SP.today()) / 864e5));
  } else $('#promo-card').hidden = true;
  onScroll();

  /* ---------- Tarjetas de producto ---------- */
  const catName = id => (SP.CATS.find(c => c[0] === id) || [, ''])[1];
  const promoFor = () => false; // los descuentos quedan como propuesta, no se muestran en la web
  const card = p => `
    <article class="card" data-cat="${p.cat}" data-id="${p.id}">
      <div class="card__img">
        <img src="img/${p.img}-800.webp" alt="${esc(p.name)}" loading="lazy" decoding="async" width="800" height="800">
        <div class="card__tags">${promoFor(p) ? `<span class="tag tag--promo">-${promo.off}% ${esc(promo.name)}</span>` : ''}${p.tag ? `<span class="tag">${esc(p.tag)}</span>` : ''}</div>
      </div>
      <div class="card__body">
        <p class="card__cat">${esc(catName(p.cat))}</p>
        <h3 class="card__name">${esc(p.name)}</h3>
        ${p.desc ? `<p class="card__desc">${esc(p.desc)}</p>` : ''}
        <div class="card__row">
          <select aria-label="Tamaño de ${esc(p.name)}">${p.sizes.map(s => `<option>${esc(s)}</option>`).join('')}</select>
          <button class="add" type="button" data-add="${p.id}"><svg><use href="#i-bag"/></svg>Agregar</button>
        </div>
      </div>
    </article>`;

  const weekIds = ['menta', 'milhoja', 'selva', 'trufas', 'tartas'];
  $('[data-week-rail]').innerHTML = weekIds.map(id => card(SP.byId(id))).join('');

  const productsEl = $('[data-products]');
  productsEl.innerHTML = SP.PRODUCTS.map(card).join('');
  const filters = [['all', 'Todo'], ...SP.CATS];
  $('[data-filters]').innerHTML = filters.map(([id, n], i) =>
    `<button class="filter${id === 'promo' ? ' filter--promo' : ''}${i ? '' : ' is-active'}" role="tab" data-filter="${id}">${esc(n)}</button>`).join('');
  const applyFilter = f => {
    $$('.filter').forEach(b => { b.classList.toggle('is-active', b.dataset.filter === f); b.setAttribute('aria-selected', b.dataset.filter === f); });
    $$('.card', productsEl).forEach((c, k) => {
      const p = SP.byId(c.dataset.id);
      const show = f === 'all' || (f === 'promo' ? promoFor(p) : p.cat === f);
      if (show && c.hidden) {
        c.hidden = false; c.classList.add('is-entering');
        requestAnimationFrame(() => requestAnimationFrame(() => { c.style.transitionDelay = (k % 8) * 40 + 'ms'; c.classList.remove('is-entering'); }));
      } else if (!show) { c.hidden = true; c.style.transitionDelay = ''; }
    });
  };
  $('[data-filters]').addEventListener('click', e => { const b = e.target.closest('[data-filter]'); if (b) applyFilter(b.dataset.filter); });
  $$('[data-filter-link]').forEach(a => a.addEventListener('click', () => applyFilter(a.dataset.filterLink)));

  /* ---------- Carro ---------- */
  let cart = SP.get('cart', []);
  const saveCart = () => { SP.set('cart', cart); renderCart(); if (current === 'book') renderDays(); };
  const bagBtn = $('#bag-btn'), bagCount = $('[data-bag-count]');
  document.addEventListener('click', e => {
    const b = e.target.closest('[data-add]');
    if (!b) return;
    const size = b.closest('.card').querySelector('select').value;
    const ex = cart.find(l => l.id === b.dataset.add && l.size === size);
    ex ? ex.qty++ : cart.push({ id: b.dataset.add, size, qty: 1 });
    saveCart();
    b.classList.add('is-added'); b.lastChild.textContent = 'Listo';
    setTimeout(() => { b.classList.remove('is-added'); b.lastChild.textContent = 'Agregar'; }, 1400);
    bagBtn.classList.remove('is-bump'); void bagBtn.offsetWidth; bagBtn.classList.add('is-bump');
    toast(`${SP.byId(b.dataset.add).name} (${size}) agregado a tu pedido`);
  });

  const cartEl = $('[data-cart]'), form = $('[data-checkout]'), summary = $('[data-summary]');
  let day = null;
  const renderCart = () => {
    const n = cart.reduce((s, l) => s + l.qty, 0);
    bagCount.hidden = !n; bagCount.textContent = n;
    cartEl.innerHTML = cart.length ? cart.map((l, i) => {
      const p = SP.byId(l.id);
      return `<div class="line"><img src="img/${p.img}-800.webp" alt="" loading="lazy">
        <div><p class="line__name">${esc(p.name)}</p><p class="line__meta">${esc(l.size)} ${promoFor(p) ? `<span class="tag tag--promo">-${promo.off}%</span>` : ''}</p></div>
        <div class="qty"><button type="button" data-q="${i}" data-d="-1" aria-label="Quitar uno">−</button><span>${l.qty}</span><button type="button" data-q="${i}" data-d="1" aria-label="Agregar uno">+</button></div></div>`;
    }).join('') : `<p class="cart__empty">Tu pedido está vacío. <a href="#catalogo" data-close-panel>Mira el catálogo</a></p>`;
    updateSummary();
  };
  cartEl.addEventListener('click', e => {
    const b = e.target.closest('[data-q]'); if (!b) return;
    const l = cart[+b.dataset.q]; l.qty += +b.dataset.d;
    if (l.qty <= 0) cart.splice(+b.dataset.q, 1);
    saveCart();
  });

  // Días con cupos: dependen de lo que lleva el pedido (cada categoría tiene su máximo diario)
  const daysEl = $('[data-days]'), dayNote = $('[data-day-note]');
  const renderDays = () => {
    const out = [], avs = {};
    for (let k = 1; k <= 16; k++) { const d = SP.iso(SP.plus(SP.today(), k)); avs[d] = SP.availability(d, cart); }
    const isOff = a => a.state === 'cerrado' || a.state === 'completo';
    if (day && (!avs[day] || isOff(avs[day]))) day = null;
    for (const d in avs) {
      const a = avs[d], off = isOff(a);
      if (!day && !off) day = d;
      const dt = new Date(d + 'T12:00');
      out.push(`<button type="button" class="day${off ? ' is-off' : ''}${a.state === 'pocos' ? ' is-pocos' : ''}${d === day ? ' is-selected' : ''}" data-day="${d}" ${off ? 'aria-disabled="true"' : ''}
        title="${esc(a.reason)}" data-reason="${esc(a.reason)}">
        <small>${dt.toLocaleDateString('es-CL', { weekday: 'short' })}</small><b>${dt.getDate()}</b><small>${dt.toLocaleDateString('es-CL', { month: 'short' })}</small></button>`);
    }
    daysEl.innerHTML = out.join('');
    const skipped = Object.keys(avs).filter(d => d < day && avs[d].state === 'completo');
    if (dayNote) { dayNote.hidden = !skipped.length; dayNote.textContent = skipped.length ? `${avs[skipped[0]].reason} el ${SP.fmt(skipped[0], { weekday: 'long', day: 'numeric' })}. Te mostramos el primer día disponible.` : ''; }
  };
  daysEl.addEventListener('click', e => {
    const b = e.target.closest('[data-day]'); if (!b) return;
    if (b.classList.contains('is-off')) { toast(b.dataset.reason === 'Cerrado' ? 'Ese día estamos cerrados' : `${b.dataset.reason} ese día. Prueba otro`); return; }
    day = b.dataset.day; $$('.day', daysEl).forEach(x => x.classList.toggle('is-selected', x === b)); updateSummary();
  });

  const updateSummary = () => {
    summary.classList.remove('is-error');
    if (!cart.length) { summary.textContent = 'Agrega productos para continuar'; return; }
    const n = cart.reduce((s, l) => s + l.qty, 0), a = day ? SP.availability(day, cart) : null;
    summary.textContent = `${n} ${n === 1 ? 'producto' : 'productos'} · ${form.elements.mode.value} · ${day ? SP.fmt(day, { weekday: 'long', day: 'numeric', month: 'long' }) : 'elige un día'}${a && a.state === 'pocos' ? ` · ${a.reason.toLowerCase()}` : ''}`;
  };
  form.addEventListener('change', e => {
    if (e.target.name === 'mode') $('[data-address]').hidden = e.target.value !== 'Despacho';
    updateSummary();
  });

  const fillUser = () => {
    const u = SP.session();
    if (!u) return;
    if (!form.elements.name.value) form.elements.name.value = u.name || '';
    if (!form.elements.phone.value) form.elements.phone.value = u.phone || '';
  };
  const validate = () => {
    let ok = true;
    $$('.field', form).forEach(f => f.classList.remove('is-invalid'));
    ['name', 'phone'].forEach(n => { if (!form.elements[n].value.trim()) { form.elements[n].closest('.field').classList.add('is-invalid'); ok = false; } });
    if (form.elements.mode.value === 'Despacho' && !form.elements.address.value.trim()) { form.elements.address.closest('.field').classList.add('is-invalid'); ok = false; }
    if (!cart.length) { summary.classList.add('is-error'); summary.textContent = 'Tu pedido está vacío'; return false; }
    if (!day) { summary.classList.add('is-error'); summary.textContent = 'Elige un día con cupos'; return false; }
    if (!ok) { summary.classList.add('is-error'); summary.textContent = 'Completa los datos marcados'; }
    return ok;
  };

  const orderText = () => {
    const f = form.elements;
    return [`Hola San Pedro, quiero hacer este pedido:`, ...cart.map(l => `• ${l.qty} × ${SP.byId(l.id).name} (${l.size})`),
      `Para: ${SP.fmt(day, { weekday: 'long', day: 'numeric', month: 'long' })}`, `Entrega: ${f.mode.value}${f.mode.value === 'Despacho' ? ' a ' + f.address.value : ''}`,
      f.note.value ? `Comentario: ${f.note.value}` : '', `Nombre: ${f.name.value} · ${f.phone.value}`].filter(Boolean).join('\n');
  };
  $('[data-send-wa]').addEventListener('click', () => {
    if (!validate()) return;
    window.open(`https://wa.me/${SP.WA}?text=${encodeURIComponent(orderText())}`, '_blank', 'noopener');
  });

  form.addEventListener('submit', e => {
    e.preventDefault();
    if (!validate()) return;
    const u = SP.session();
    if (!u) { openAuth('login', 'Ingresa o crea tu cuenta para confirmar y sumar puntos. También puedes enviarlo por WhatsApp.'); return; }
    const orders = SP.get('orders', []);
    const id = 'SP-' + (2500 + orders.length + 1);
    const f = form.elements;
    orders.unshift({ id, date: day, created: SP.iso(SP.today()), status: 'recibido', mode: f.mode.value, channel: 'Web',
      items: cart.map(l => ({ ...l })), note: f.note.value, total: null, points: null });
    SP.set('orders', orders);
    cart = []; saveCart(); renderDays();
    $('[data-done-text]').innerHTML = `Tu pedido <b>${id}</b> para el <b>${SP.fmt(day, { weekday: 'long', day: 'numeric', month: 'long' })}</b> quedó registrado. Te avisaremos por correo y WhatsApp cuando la pastelería lo confirme con el valor final.`;
    form.hidden = true; $('[data-done]').hidden = false;
  });

  /* ---------- Paneles laterales (menú y pedido) ---------- */
  const burger = $('#burger'), veil = $('#veil'), heroText = $('.hero__content');
  const panels = { menu: $('#menu'), book: $('#pedido') };
  let current = null;
  $$('#menu .menu__list li, #menu .menu__foot').forEach((el, i) => { el.dataset.stagger = ''; el.style.setProperty('--i', i); });
  $$('#pedido .panel__body > *').forEach((el, i) => { el.dataset.stagger = ''; el.style.setProperty('--i', i); });
  const shiftHero = on => {
    if (!on || innerWidth <= 720 || scrollY > innerHeight * .6) { heroText.style.transform = ''; return; }
    const pw = panels.menu.getBoundingClientRect().width, avail = innerWidth - pw - 96;
    const w = Math.max(heroText.offsetWidth, ...[...heroText.children].map(c => c.scrollWidth));
    heroText.style.transform = `translateX(${-pw / 2}px) scale(${Math.min(1, avail / w).toFixed(3)})`;
  };
  const openPanel = name => {
    if (current === name) return closePanel();
    if (current) { panels[current].classList.remove('is-open'); panels[current].setAttribute('aria-hidden', 'true'); }
    current = name;
    const el = panels[name];
    if (name === 'book') { renderDays(); fillUser(); updateSummary(); if (!cart.length || $('[data-done]').hidden === false) { form.hidden = false; $('[data-done]').hidden = true; } }
    el.classList.add('is-open'); el.setAttribute('aria-hidden', 'false');
    body.classList.add('panel-open', 'is-locked');
    burger.setAttribute('aria-expanded', name === 'menu');
    shiftHero(true);
    setTimeout(() => (el.querySelector('.menu__list a') || el).focus({ preventScroll: true }), 650);
  };
  const closePanel = () => {
    if (!current) return;
    const el = panels[current];
    el.classList.remove('is-open'); el.setAttribute('aria-hidden', 'true');
    body.classList.remove('panel-open', 'is-locked');
    burger.setAttribute('aria-expanded', 'false');
    shiftHero(false);
    current = null;
  };
  burger.addEventListener('click', () => openPanel('menu'));
  bagBtn.addEventListener('click', () => openPanel('book'));
  veil.addEventListener('click', closePanel);
  document.addEventListener('click', e => { if (e.target.closest('[data-close-panel]')) closePanel(); });
  addEventListener('keydown', e => { if (e.key === 'Escape') { if (!$('#auth').hidden) closeAuth(); else if (current) closePanel(); } });
  addEventListener('resize', () => { if (current) shiftHero(true); });
  $$('#menu a[href^="#"]').forEach(a => a.addEventListener('click', e => {
    e.preventDefault(); closePanel();
    setTimeout(() => $(a.hash)?.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth' }), 450);
  }));

  /* ---------- Cuenta: ingresar / crear cuenta ---------- */
  const auth = $('#auth');
  let lastFocus = null;
  const setTab = t => {
    $$('[data-auth-tab]').forEach(b => b.setAttribute('aria-selected', b.dataset.authTab === t));
    $$('[data-form]', auth).forEach(f => f.hidden = f.dataset.form !== t);
    $('[data-google-label]').textContent = t === 'login' ? 'Continuar con Google' : 'Crear cuenta con Google';
  };
  const openAuth = (tab = 'login', msg = '') => {
    lastFocus = document.activeElement;
    setTab(tab); auth.hidden = false; body.classList.add('is-locked');
    $$('[data-error]', auth).forEach(e => e.textContent = '');
    if (msg) $(`[data-form="${tab}"] [data-error]`, auth).textContent = msg;
    setTimeout(() => $(`[data-form="${tab}"] input`, auth).focus(), 300);
  };
  const closeAuth = () => { auth.hidden = true; if (!current) body.classList.remove('is-locked'); lastFocus?.focus?.(); };
  $$('[data-auth-tab]').forEach(b => b.addEventListener('click', () => setTab(b.dataset.authTab)));
  $$('[data-open-auth]').forEach(b => b.addEventListener('click', () => openAuth(b.dataset.openAuth)));
  $('[data-close-auth]').addEventListener('click', closeAuth);
  auth.addEventListener('click', e => { if (e.target === auth) closeAuth(); });

  const signIn = (user, msg) => {
    SP.login(user); closeAuth(); renderAccount(); fillUser();
    toast(msg || `Hola, ${user.name.split(' ')[0]}. Ya puedes confirmar pedidos y sumar puntos`);
  };
  $('[data-google]').addEventListener('click', () => signIn({ name: 'Valentina Soto', email: 'valentina.demo@gmail.com', phone: '+56 9 1234 5678', provider: 'google', promos: true }));
  $('[data-demo-client]').addEventListener('click', () => { SP.login({ name: 'Valentina Soto', email: 'valentina.demo@gmail.com', phone: '+56 9 1234 5678', provider: 'google', promos: true }); location.href = 'cuenta.html'; });
  const isEmail = v => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
  $('[data-form="login"]').addEventListener('submit', e => {
    e.preventDefault();
    const f = e.target.elements, err = $('[data-error]', e.target);
    if (!isEmail(f.email.value)) return err.textContent = 'Revisa tu correo';
    if (f.password.value.length < 6) return err.textContent = 'La contraseña tiene al menos 6 caracteres';
    const name = f.email.value.split('@')[0].replace(/[._-]+/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
    signIn({ name, email: f.email.value, provider: 'email', promos: false });
  });
  $('[data-form="register"]').addEventListener('submit', e => {
    e.preventDefault();
    const f = e.target.elements, err = $('[data-error]', e.target);
    if (!f.name.value.trim()) return err.textContent = 'Escribe tu nombre';
    if (!isEmail(f.email.value)) return err.textContent = 'Revisa tu correo';
    if (f.password.value.length < 6) return err.textContent = 'Usa una contraseña de al menos 6 caracteres';
    if (!f.terms.checked) return err.textContent = 'Debes aceptar los términos';
    signIn({ name: f.name.value.trim(), email: f.email.value, phone: f.phone.value, birthday: f.birthday.value, provider: 'email', promos: f.promos.checked },
      `¡Bienvenido al Club San Pedro! Te regalamos 50 puntos de bienvenida`);
  });

  const accBtn = $('#account-btn'), accMenu = $('#account-menu');
  const renderAccount = () => {
    const u = SP.session();
    const label = $('[data-account-label]');
    if (u) {
      const ini = u.name.split(' ').map(w => w[0]).slice(0, 2).join('').toUpperCase();
      accBtn.querySelector('svg').outerHTML = `<span class="avatar">${esc(ini)}</span>`;
      label.textContent = u.name.split(' ')[0];
      $('[data-user-name]').textContent = u.name.split(' ')[0];
      $('[data-points-note]').textContent = 'Este pedido suma puntos en tu cuenta del Club San Pedro.';
    } else {
      const a = accBtn.querySelector('.avatar'); if (a) a.outerHTML = '<svg><use href="#i-user"/></svg>';
      label.textContent = 'Ingresar';
    }
  };
  accBtn.addEventListener('click', e => {
    e.stopPropagation();
    if (!SP.session()) return openAuth('login');
    accMenu.hidden = !accMenu.hidden;
  });
  document.addEventListener('click', e => { if (!accMenu.hidden && !e.target.closest('#account-menu')) accMenu.hidden = true; });
  $('[data-logout]').addEventListener('click', () => { SP.logout(); accMenu.hidden = true; renderAccount(); toast('Cerraste sesión'); });

  // Atajo: index.html#ingresar abre el login; #pedido abre el carro
  if (location.hash === '#ingresar') openAuth('login');
  if (location.hash === '#crear-cuenta') openAuth('register');
  if (location.hash === '#pedido') setTimeout(() => openPanel('book'), 300);

  /* ---------- Revelado al hacer scroll ---------- */
  const io = new IntersectionObserver(entries => entries.forEach(en => {
    if (en.isIntersecting) { en.target.classList.add('is-in'); io.unobserve(en.target); }
  }), { rootMargin: '0px 0px -8% 0px', threshold: .08 });
  $$('.reveal').forEach(el => io.observe(el));

  /* ---------- Contadores ---------- */
  const countIO = new IntersectionObserver(entries => entries.forEach(en => {
    if (!en.isIntersecting) return;
    const el = en.target, end = +el.dataset.count, from = end > 1000 ? end - 60 : 0;
    const t0 = performance.now(), dur = reduce ? 1 : 1600;
    const tick = t => { const p = Math.min(1, (t - t0) / dur), k = 1 - Math.pow(1 - p, 4); el.textContent = Math.round(from + (end - from) * k); if (p < 1) requestAnimationFrame(tick); };
    requestAnimationFrame(tick); countIO.unobserve(el);
  }), { threshold: .6 });
  $$('[data-count]').forEach(el => countIO.observe(el));

  /* ---------- Subnav: sección actual ---------- */
  const subLinks = $$('.subnav a');
  const secIO = new IntersectionObserver(entries => entries.forEach(en => {
    if (en.isIntersecting) subLinks.forEach(a => a.classList.toggle('is-current', a.hash === '#' + en.target.id));
  }), { rootMargin: '-45% 0px -50% 0px' });
  subLinks.forEach(a => { const s = $(a.hash); if (s) secIO.observe(s); });

  /* ---------- Mapa bajo demanda ---------- */
  const mapBtn = $('[data-map]');
  mapBtn?.addEventListener('click', () => {
    const f = document.createElement('iframe');
    f.src = 'https://www.google.com/maps?q=Ernesto+Wagner+1327+Villarrica&output=embed';
    f.loading = 'lazy'; f.title = 'Mapa Pastelería San Pedro'; f.referrerPolicy = 'no-referrer-when-downgrade';
    mapBtn.replaceWith(f);
  });

  renderCart(); renderAccount();
  if (DEMO) console.info('Demo San Pedro: pedidos y cuentas se guardan solo en este navegador.');
})();
