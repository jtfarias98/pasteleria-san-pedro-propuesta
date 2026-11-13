/* Pastelería San Pedro — Mi cuenta (cliente) */
(() => {
  const $ = (s, c = document) => c.querySelector(s);
  const $$ = (s, c = document) => [...c.querySelectorAll(s)];
  const esc = s => String(s ?? '').replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  const user = SP.session();
  if (!user) return;
  const toastEl = $('#toast'); let tt;
  const toast = m => { toastEl.textContent = m; toastEl.classList.add('is-on'); clearTimeout(tt); tt = setTimeout(() => toastEl.classList.remove('is-on'), 3000); };

  $('[data-initials]').textContent = user.name.split(' ').map(w => w[0]).slice(0, 2).join('').toUpperCase();
  $('[data-first]').textContent = user.name.split(' ')[0];
  $('[data-logout]').addEventListener('click', () => { SP.logout(); location.href = 'index.html'; });

  /* ---------- Navegación por secciones ---------- */
  const show = id => {
    if (!$('#v-' + id)) id = 'inicio';
    $$('.view').forEach(v => v.classList.toggle('is-on', v.id === 'v-' + id));
    $$('[data-view-link]').forEach(a => a.classList.toggle('is-current', a.dataset.viewLink === id));
    scrollTo(0, 0);
  };
  addEventListener('hashchange', () => show(location.hash.slice(1)));
  show(location.hash.slice(1) || 'inicio');

  /* ---------- Pedidos ---------- */
  const STEPS = ['recibido', 'confirmado', 'preparacion', 'listo', 'entregado'];
  const LABEL = { recibido: 'Recibido', confirmado: 'Confirmado', preparacion: 'En preparación', listo: 'Listo para retirar', entregado: 'Entregado', cancelado: 'Cancelado' };
  const orders = SP.clientOrders();
  const itemsText = o => o.items.map(i => `${i.qty} × ${SP.byId(i.id).name} (${i.size})`).join(' · ');
  const thumbs = o => o.items.slice(0, 3).map(i => `<img src="img/${SP.byId(i.id).img}-800.webp" alt="" loading="lazy">`).join('');
  const timeline = o => `<div class="timeline">${STEPS.map((s, k) => `<div class="${k <= STEPS.indexOf(o.status) ? 'is-done' : ''}">${LABEL[s]}</div>`).join('')}</div>`;
  const repeat = o => {
    const cart = SP.get('cart', []);
    o.items.forEach(i => { const ex = cart.find(l => l.id === i.id && l.size === i.size); ex ? ex.qty += i.qty : cart.push({ ...i }); });
    SP.set('cart', cart);
    location.href = 'index.html#pedido';
  };
  document.addEventListener('click', e => {
    const b = e.target.closest('[data-repeat]');
    if (b) repeat(orders.find(o => o.id === b.dataset.repeat));
  });

  $('[data-orders]').innerHTML = orders.map(o => `
    <article class="order">
      <div class="order__thumbs">${thumbs(o)}</div>
      <div>
        <p class="order__id">${o.id} <span class="st st--${o.status}">${LABEL[o.status]}</span></p>
        <p class="order__meta">${esc(itemsText(o))}</p>
        <p class="order__meta">Para el ${SP.fmt(o.date, { weekday: 'long', day: 'numeric', month: 'long' })} · ${o.mode} · pedido por ${o.channel}${o.total ? ` · ${SP.money(o.total)}` : ' · valor por confirmar'}</p>
      </div>
      <div class="order__actions">
        <button class="btn btn--solid btn--sm" data-repeat="${o.id}">Repetir pedido</button>
        <a class="btn btn--line btn--sm" href="https://wa.me/${SP.WA}?text=${encodeURIComponent('Hola, consulto por mi pedido ' + o.id)}" target="_blank" rel="noopener">Consultar</a>
      </div>
    </article>`).join('');

  const next = orders.filter(o => o.date >= SP.iso(SP.today()) && o.status !== 'cancelado').sort((a, b) => a.date.localeCompare(b.date))[0];
  const last = orders.find(o => o.status === 'entregado');
  $('[data-next-order]').innerHTML = next ? `
    <div class="box__head"><div><h2>Tu próximo pedido · ${next.id}</h2><p>Para el ${SP.fmt(next.date, { weekday: 'long', day: 'numeric', month: 'long' })} · ${next.mode}</p></div><span class="st st--${next.status}">${LABEL[next.status]}</span></div>
    <div style="display:flex;gap:14px;align-items:center"><div class="order__thumbs">${thumbs(next)}</div><p class="small" style="margin:0">${esc(itemsText(next))}</p></div>
    ${timeline(next)}
    ${last ? `<div style="display:flex;flex-wrap:wrap;gap:10px;align-items:center;justify-content:space-between;margin-top:22px;padding-top:18px;border-top:1px solid var(--sand)"><p class="small" style="margin:0">¿Lo de siempre? Tu último pedido fue <b>${esc(itemsText(last))}</b></p><button class="btn btn--line btn--sm" data-repeat="${last.id}">Repetir</button></div>` : ''}`
    : `<div class="empty">No tienes pedidos en curso. <a class="link" href="index.html#catalogo">Ver catálogo</a></div>`;

  /* ---------- Destacados ---------- */
  const promo = SP.activePromo();
  const week = ['menta', 'selva', 'trufas'].map(SP.byId);
  $('[data-week]').innerHTML = week.map(p => `<a href="index.html#catalogo" style="text-decoration:none"><img src="img/${p.img}-800.webp" alt="" loading="lazy" style="width:100%;aspect-ratio:1;object-fit:cover;border-radius:16px"><p style="margin:8px 0 0;font:400 17px/1.2 var(--serif)">${esc(p.name)}</p></a>`).join('');
  $('[data-promo-box]').innerHTML = promo ? `
    <p class="eyebrow eyebrow--peach">${promo.name} · ${SP.fmt(promo.date, { day: 'numeric', month: 'long' })}</p>
    <h2 style="color:#fff;font-size:26px">Asegura tu pedido con tiempo</h2>
    <p class="small" style="margin:8px 0 16px">Los cupos de las fechas especiales se llenan rápido. Encarga hoy y lo preparamos fresco para el día que elijas.</p>
    <a class="btn btn--cream btn--sm" href="index.html#catalogo">Encargar ahora</a>` : '<h2 style="color:#fff">Te avisamos de las próximas fechas especiales</h2>';

  /* ---------- Puntos ---------- */
  const moves = [
    { d: SP.iso(SP.plus(SP.today(), -200)), t: 'Pedidos anteriores', p: 240 },
    { d: SP.iso(SP.plus(SP.today(), -60)), t: 'Bono de bienvenida al Club', p: SP.premios().welcome },
    ...orders.filter(o => o.status === 'entregado' && o.total).map(o => ({ d: o.date, t: `Pedido ${o.id}`, p: SP.pointsFor(o.total) })),
    ...SP.get('redeemed', []).map(r => ({ d: r.d, t: `Canje: ${r.t}`, p: -r.p }))
  ].sort((a, b) => b.d.localeCompare(a.d));
  // Premios por nivel: los define el admin (cuántos puntos y qué productos se pueden elegir)
  const LEVELS = SP.premios().levels;
  const renderPoints = () => {
    const pts = moves.reduce((s, m) => s + m.p, 0);
    $('[data-points]').textContent = pts; $('[data-points2]').textContent = pts;
    const goal = LEVELS.find(l => l.pts > pts), reached = LEVELS.filter(l => l.pts <= pts).length;
    $('[data-points-bar]').style.width = goal ? Math.min(100, pts / goal.pts * 100) + '%' : '100%';
    $('[data-points-next]').innerHTML = goal ? `Te faltan ${goal.pts - pts} puntos para <b>${reached ? 'el siguiente nivel de premios' : 'elegir tu primer premio'}</b>` : 'Ya puedes elegir cualquier premio';
    $('[data-moves]').innerHTML = moves.map(m => `<tr><td class="muted">${SP.fmt(m.d, { day: 'numeric', month: 'short', year: 'numeric' })}</td><td>${esc(m.t)}</td><td class="num ${m.p > 0 ? 'up' : 'down'}">${m.p > 0 ? '+' : ''}${m.p}</td></tr>`).join('');
    $('[data-rewards]').innerHTML = LEVELS.map((l, li) => `<div class="level${pts >= l.pts ? ' is-open' : ''}">
      <p class="level__h"><b>${l.pts} puntos</b><span>${pts >= l.pts ? 'Elige uno' : `Te faltan ${l.pts - pts}`}</span></p>
      ${l.gifts.map(g => `<div class="reward"><img src="img/${SP.giftImg(g)}-800.webp" alt="" loading="lazy"><span><b>${esc(SP.giftName(g))}</b><small>De regalo</small></span>
        <button class="btn btn--sm ${pts >= l.pts ? 'btn--solid' : 'btn--line'}" data-redeem="${li}|${esc(g)}" ${pts >= l.pts ? '' : 'disabled'}>Elegir</button></div>`).join('')}</div>`).join('');
  };
  $('[data-rewards]').addEventListener('click', e => {
    const b = e.target.closest('[data-redeem]'); if (!b) return;
    const [li, g] = [+b.dataset.redeem.split('|')[0], b.dataset.redeem.split('|').slice(1).join('|')], name = SP.giftName(g);
    const red = SP.get('redeemed', []); const entry = { d: SP.iso(SP.today()), t: name, p: LEVELS[li].pts };
    red.push(entry); SP.set('redeemed', red); moves.unshift({ d: entry.d, t: `Canje: ${name}`, p: -entry.p }); renderPoints();
    toast(`Listo: “${name}” va de regalo en tu próximo pedido`);
  });
  renderPoints();

  /* ---------- Promociones ---------- */
  $('[data-peaks]').innerHTML = SP.PEAKS.map(p => `<tr><td class="muted">${SP.fmt(p.date, { day: 'numeric', month: 'short' })}</td><td><b>${p.name}</b></td><td>${SP.fmt(SP.iso(SP.plus(new Date(p.date + 'T12:00'), -21)), { day: 'numeric', month: 'short' })}</td></tr>`).join('');
  const mon = new Date(SP.today()); mon.setDate(mon.getDate() + ((8 - mon.getDay()) % 7 || 7));
  $('[data-mail]').innerHTML = `
    <div class="mail__bar"><b>Destacados de la semana en San Pedro</b><span>De: Pastelería San Pedro · ${SP.fmt(SP.iso(mon), { weekday: 'long', day: 'numeric', month: 'long' })}, 09:00</span></div>
    <div class="mail__hero"><img src="img/logo-128.webp" width="48" height="48" alt=""><h3>Esta semana en <em>San Pedro</em></h3></div>
    <div class="mail__body">
      <p style="margin:0">Hola ${esc(user.name.split(' ')[0])}, esto es lo que viene de temporada:</p>
      <div class="mail__items">${week.map(p => `<figure><img src="img/${p.img}-800.webp" alt="">${esc(p.name)}</figure>`).join('')}</div>
      ${promo ? `<p style="margin:0 0 12px"><b>${promo.name}:</b> ya puedes encargar para el ${SP.fmt(promo.date, { day: 'numeric', month: 'long' })}. Los cupos se llenan rápido.</p>` : ''}
      <a class="mail__cta" href="index.html#catalogo">Hacer mi pedido</a>
    </div>
    <p class="mail__foot">Recibes este correo porque lo aceptaste al crear tu cuenta · Darme de baja</p>`;

  /* ---------- Cumpleaños ---------- */
  const bd = SP.bday(), first = esc(user.name.split(' ')[0]);
  $('[data-bday-rule]').innerHTML = `<b>Cumpleaños:</b> te saludamos por correo con un ${SP.bdayText(bd)}.`;
  $('[data-bday-pref]').textContent = `Un correo en tu cumpleaños con ${SP.bdayText(bd)}`;
  $('[data-bday-mail]').innerHTML = `
    <div class="mail__bar"><b>¡Feliz cumpleaños, ${first}! 🎂</b><span>De: Pastelería San Pedro · ${user.birthday ? 'el ' + SP.fmt(SP.iso(SP.today()).slice(0, 4) + user.birthday.slice(4), { day: 'numeric', month: 'long' }) : 'el día de tu cumpleaños'}, 08:00</span></div>
    <div class="mail__hero"><img src="img/logo-128.webp" width="48" height="48" alt=""><h3>Feliz <em>cumpleaños</em></h3></div>
    <div class="mail__body">
      <p style="margin:0 0 12px">Hola ${first}, en San Pedro te queremos saludar. Para celebrar, tienes <b>${SP.bdayText(bd)}</b>.</p>
      <p style="margin:0 0 12px" class="small muted">Se aplica solo al pedir con tu cuenta, en la web o por WhatsApp.</p>
      <a class="mail__cta" href="index.html#catalogo">Elegir mi torta</a>
    </div>
    <p class="mail__foot">Recibes este correo porque nos diste tu fecha de cumpleaños · Darme de baja</p>`;

  /* ---------- Mis datos ---------- */
  const pf = $('[data-profile]');
  ['name', 'phone', 'email', 'birthday', 'address'].forEach(k => pf.elements[k].value = user[k] || '');
  $('[data-provider]').textContent = user.provider === 'google' ? 'Ingresas con tu cuenta de Google.' : 'Ingresas con correo y contraseña.';
  pf.addEventListener('submit', e => {
    e.preventDefault();
    ['name', 'phone', 'email', 'birthday', 'address'].forEach(k => user[k] = pf.elements[k].value);
    SP.login(user); toast('Tus datos quedaron guardados');
  });
  const prefs = Object.assign({ weekly: !!user.promos, promos: !!user.promos, wa: true, bday: true }, user.prefs || {});
  $$('[data-pref]').forEach(i => {
    i.checked = !!prefs[i.dataset.pref];
    i.addEventListener('change', () => { prefs[i.dataset.pref] = i.checked; user.prefs = prefs; SP.login(user); toast(i.checked ? 'Activado' : 'Desactivado'); });
  });
})();
