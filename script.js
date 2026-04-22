// ── COOKIE CONSENT ──────────────────────────────────────────────
function loadMetaPixel() {
  if (window._metaPixelLoaded) return;
  window._metaPixelLoaded = true;
  !function(f,b,e,v,n,t,s){if(f.fbq)return;n=f.fbq=function(){n.callMethod?
  n.callMethod.apply(n,arguments):n.queue.push(arguments)};if(!f._fbq)f._fbq=n;
  n.push=n;n.loaded=!0;n.version='2.0';n.queue=[];t=b.createElement(e);t.async=!0;
  t.src=v;s=b.getElementsByTagName(e)[0];s.parentNode.insertBefore(t,s)}(window,
  document,'script','https://connect.facebook.net/en_US/fbevents.js');
  fbq('init', '1723810925654183');
  fbq('track', 'PageView');
}

function setCookieConsent(choice) {
  localStorage.setItem('cookie_consent', choice);
  const banner = document.getElementById('cookieBanner');
  if (banner) banner.classList.add('hidden');
  if (choice === 'accepted') loadMetaPixel();
}

(function initCookieConsent() {
  const consent = localStorage.getItem('cookie_consent');
  if (consent === 'accepted') {
    loadMetaPixel();
  }
  if (consent !== null) {
    const banner = document.getElementById('cookieBanner');
    if (banner) banner.classList.add('hidden');
  }
})();

function toggleFaq(btn) {
  const item = btn.parentElement;
  const isOpen = item.classList.contains('open');
  document.querySelectorAll('.faq-item').forEach(i => i.classList.remove('open'));
  if (!isOpen) item.classList.add('open');
}

// ── CONFIGURATOR STATE ──────────────────────────────────────────
const configState = {
  price: 960,
  oldPrice: 1404,
  kwh: '2,4',
  img: 'images/product-2-4kwh.png',
  name: 'S2400 Basis',
  modules: 'A2400 + 1× B2400',
  addons: [],
  giftCombo: 'standard',
  servicePrice: 99,
  serviceName: 'Levering + Installatie'
};

function fmtPrice(n) {
  return '€' + n.toLocaleString('nl-NL', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function updateConfigTotal() {
  const addonTotal = configState.addons.reduce((s, a) => s + a.price, 0);
  const total = configState.price + addonTotal + configState.servicePrice;
  const el = document.getElementById('configTotal');
  if (el) el.textContent = fmtPrice(total);

  const priceNew = document.getElementById('configPriceNew');
  const prodName = document.getElementById('configProductName');
  if (priceNew) priceNew.textContent = fmtPrice(configState.price);
  if (prodName) prodName.textContent = 'Sunpura S2400 ' + configState.name.replace('S2400 ', '') + ' · ' + configState.kwh + ' kWh';
}

function toggleGiftCombo(hasHomeWizard) {
  configState.giftCombo = hasHomeWizard ? 'homewizard' : 'standard';
  const p1Item = document.getElementById('giftItemP1');
  const plugName = document.getElementById('giftPlugName');
  const plugVal = document.getElementById('giftPlugVal');
  if (hasHomeWizard) {
    if (p1Item) p1Item.style.display = 'none';
    if (plugName) plugName.innerHTML = 'Smart Plug ×2 <span class="config-gift-free">€0,00</span>';
    if (plugVal) plugVal.textContent = 't.w.v. €46,00';
  } else {
    if (p1Item) p1Item.style.display = '';
    if (plugName) plugName.innerHTML = 'Smart Plug <span class="config-gift-free">€0,00</span>';
    if (plugVal) plugVal.textContent = 't.w.v. €23,00';
  }
}

// Capacity buttons
document.querySelectorAll('.cap-btn').forEach(function(btn) {
  btn.addEventListener('click', function() {
    document.querySelectorAll('.cap-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');

    configState.price    = parseInt(btn.dataset.price, 10);
    configState.oldPrice = parseInt(btn.dataset.oldPrice, 10);
    configState.kwh      = btn.dataset.kwh;
    configState.name     = btn.dataset.name;
    configState.modules  = btn.dataset.modules;

    const newImg = btn.dataset.img;
    const imgEl  = document.getElementById('configImg');
    const badge  = document.getElementById('popularBadge');
    if (imgEl) {
      imgEl.style.opacity = '0';
      setTimeout(function() {
        imgEl.src = newImg;
        imgEl.onload = function() { imgEl.style.opacity = '1'; };
        imgEl.style.opacity = '1';
      }, 150);
    }
    configState.img = newImg;

    if (badge) badge.classList.toggle('visible', configState.kwh === '4,8' && configState.name !== 'B2400 Uitbreiding');

    updateConfigTotal();
  });
});

// Addon checkboxes
[
  { id: 'addonPlug',    label: 'Extra Smart Plug' },
  { id: 'addonGlass420', label: 'Glazen zonnepanelen 420W' },
  { id: 'addonFlex2',   label: 'Flexibele zonnepanelen 2×200W' },
  { id: 'addonFlex4',   label: 'Flexibele zonnepanelen 4×200W' }
].forEach(function(item) {
  const el = document.getElementById(item.id);
  if (!el) return;
  el.addEventListener('change', function() {
    const price = parseInt(el.value, 10);
    configState.addons = configState.addons.filter(a => a.id !== item.id);
    if (el.checked) configState.addons.push({ id: item.id, label: item.label, price: price });
    updateConfigTotal();
  });
});

// Service radios
document.querySelectorAll('input[name="cfgService"]').forEach(function(radio) {
  radio.addEventListener('change', function() {
    configState.servicePrice = parseInt(radio.value, 10);
    const labels = { '0': 'Levering (gratis)', '99': 'Levering + Installatie', '179': 'Volledig ontzorgd' };
    configState.serviceName = labels[radio.value] || '';
    updateConfigTotal();
  });
});

// ── ORDER POPUP ──────────────────────────────────────────────────
function openOrderPopup() {
  const addonTotal = configState.addons.reduce((s, a) => s + a.price, 0);
  const total      = configState.price + addonTotal + configState.servicePrice;

  const img = document.getElementById('sumImg');
  if (img) img.src = configState.img;

  const items = document.getElementById('sumItems');
  if (items) {
    let html = '<strong>' + configState.name + '</strong> (' + configState.kwh + ' kWh)<br>';
    html += '<span style="opacity:.6; font-size:12px;">' + configState.modules + '</span><br><br>';
    const giftLabel = configState.giftCombo === 'homewizard' ? '2× Smart Plug' : 'P1 Meter + Smart Plug';
    html += '🎁 <span style="color:#4dd98a;">Gratis: ' + giftLabel + '</span><br>';
    configState.addons.forEach(function(a) {
      html += a.label + ' <span style="opacity:.6;">+€' + a.price + '</span><br>';
    });
    html += '<br><span style="opacity:.4; font-size:11px; display:block; border-top:1px solid rgba(255,255,255,.1); padding-top:8px; margin-top:4px; text-transform:uppercase; letter-spacing:.05em;">Service</span>';
    html += '<strong>' + configState.serviceName + '</strong> <span style="opacity:.6;">' + (configState.servicePrice > 0 ? '+€' + configState.servicePrice : 'gratis') + '</span>';
    items.innerHTML = html;
  }

  const sumTotal = document.getElementById('sumTotal');
  if (sumTotal) sumTotal.textContent = fmtPrice(total);

  const hidden = document.getElementById('hiddenConfiguratie');
  if (hidden) {
    const giftLabel = configState.giftCombo === 'homewizard' ? '2x Smart Plug' : 'P1 Meter + Smart Plug';
    var lines = [];
    lines.push('=== BESTELLING ===');
    lines.push('');
    lines.push('Sunpura ' + configState.name + ' · ' + configState.kwh + ' kWh');
    lines.push('  Modules: ' + configState.modules);
    lines.push('  Prijs: ' + fmtPrice(configState.price));
    lines.push('');
    lines.push('Gratis accessoires: ' + giftLabel);
    lines.push('  Prijs: €0');
    if (configState.addons.length > 0) {
      lines.push('');
      lines.push('Aanvullingen:');
      configState.addons.forEach(function(a) {
        lines.push('  ' + a.label + ' · ' + fmtPrice(a.price));
      });
    }
    lines.push('');
    lines.push('Service: ' + configState.serviceName);
    lines.push('  Prijs: ' + (configState.servicePrice > 0 ? fmtPrice(configState.servicePrice) : 'gratis'));
    lines.push('');
    lines.push('──────────────────');
    lines.push('TOTAAL incl. BTW: ' + fmtPrice(total));
    hidden.value = lines.join('\n');
  }

  const orderForm = document.getElementById('orderForm');
  const orderSuccess = document.getElementById('orderSuccess');
  if (orderForm)    { orderForm.style.display = ''; orderForm.reset(); }
  if (orderSuccess) orderSuccess.style.display = 'none';

  openModal('modal-order');
}

// Order form submit
(function() {
  const form = document.getElementById('orderForm');
  if (!form) return;
  const submitBtn = document.getElementById('orderSubmitBtn');

  const errorMsg = document.getElementById('formErrorMsg');
  const requiredFields = form.querySelectorAll('[required]');

  requiredFields.forEach(function(field) {
    field.addEventListener('input', function() {
      if (field.value.trim()) field.classList.remove('field-invalid');
      if (form.querySelectorAll('.field-invalid').length === 0 && errorMsg) {
        errorMsg.style.visibility = 'hidden';
      }
    });
  });

  form.addEventListener('submit', async function(e) {
    e.preventDefault();

    const invalid = [];
    requiredFields.forEach(function(field) {
      field.classList.remove('field-invalid');
      if (!field.value.trim()) {
        field.classList.add('field-invalid');
        invalid.push(field);
      }
    });
    if (invalid.length > 0) {
      if (errorMsg) errorMsg.style.visibility = 'visible';
      invalid[0].focus();
      return;
    }
    if (errorMsg) errorMsg.style.visibility = 'hidden';

    submitBtn.disabled = true;
    submitBtn.textContent = 'Verzenden...';

    const formData = new FormData(form);
    const object   = Object.fromEntries(formData);

    try {
      const response = await fetch('https://api.web3forms.com/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
        body: JSON.stringify(object)
      });
      const result = await response.json();

      if (result.success) {
        form.style.display = 'none';
        document.getElementById('orderSuccess').style.display = 'block';
        if (typeof fbq !== 'undefined') fbq('track', 'Lead');
      } else {
        submitBtn.disabled = false;
        submitBtn.textContent = 'Aanvraag verzenden →';
        alert('Er ging iets mis. Probeer het opnieuw of mail ons direct.');
      }
    } catch (err) {
      submitBtn.disabled = false;
      submitBtn.textContent = 'Aanvraag verzenden →';
      alert('Verbindingsfout. Controleer je internet en probeer opnieuw.');
    }
  });
})();

// GALLERY SLIDESHOW (fade)
(function() {
  const slider = document.getElementById('gallerySlider');
  if (!slider) return;
  const slides = slider.querySelectorAll('.gallery-slide');
  const dotsWrap = document.getElementById('galleryDots');
  const total = slides.length;
  let current = 0;

  slides.forEach((_, i) => {
    const d = document.createElement('span');
    d.className = 'gallery-dot' + (i === 0 ? ' active' : '');
    dotsWrap.appendChild(d);
  });
  const dots = dotsWrap.querySelectorAll('.gallery-dot');

  function goTo(idx) {
    slides[current].classList.remove('active');
    dots[current].classList.remove('active');
    current = (idx + total) % total;
    slides[current].classList.add('active');
    dots[current].classList.add('active');
  }

  setInterval(() => goTo(current + 1), 4000);
})();

// Hero rotating phrases
(function() {
  const phrases = ['voor zonnepanelen', 'op dynamisch tarief', 'met noodstroom'];
  const subs = [
    'Heb je zonnepanelen? Sla het overschot op in plaats van terug te leveren — zo vermijd je terugleverkosten en gebruik je maximaal je eigen stroom.',
    'Laad op wanneer stroom goedkoop is en gebruik je opgeslagen energie als de prijs stijgt. Werkt met elk dynamisch contract.',
    'Bij stroomuitval schakelt de S2400 automatisch over en houdt je essentiële apparaten — koelkast, router, medische apparatuur — aan de stroom.'
  ];
  let idx = 0;
  const el = document.getElementById('heroRotating');
  const sub = document.getElementById('heroSub');
  if (!el) return;
  setInterval(function() {
    el.classList.add('fade');
    if (sub) sub.classList.add('fade');
    setTimeout(function() {
      idx = (idx + 1) % phrases.length;
      el.textContent = phrases[idx];
      if (sub) sub.textContent = subs[idx];
      el.classList.remove('fade');
      if (sub) sub.classList.remove('fade');
    }, 350);
  }, 5000);
})();

// Smooth scroll for nav links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', function(e) {
    const href = this.getAttribute('href');
    if (!href || href === '#') return;
    const target = document.querySelector(href);
    if (target) {
      e.preventDefault();
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  });
});

// Animate on scroll
const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.style.opacity = '1';
      entry.target.style.transform = 'translateY(0)';
      observer.unobserve(entry.target);
    }
  });
}, { threshold: 0.12 });

document.querySelectorAll('.why-card, .package-card, .service-card, .step, .acc-card, .cert-item').forEach(el => {
  observer.observe(el);
});

// Mobile hamburger menu
const hamburger = document.getElementById('navHamburger');
const mobileNav = document.getElementById('mobileNav');

hamburger.addEventListener('click', function() {
  const isOpen = mobileNav.classList.toggle('open');
  hamburger.classList.toggle('open', isOpen);
  hamburger.setAttribute('aria-expanded', isOpen);
  mobileNav.setAttribute('aria-hidden', !isOpen);
});

mobileNav.querySelectorAll('a').forEach(link => {
  link.addEventListener('click', function() {
    mobileNav.classList.remove('open');
    hamburger.classList.remove('open');
    hamburger.setAttribute('aria-expanded', 'false');
    mobileNav.setAttribute('aria-hidden', 'true');
  });
});

// Modal open / close
function openModal(id) {
  document.getElementById(id).classList.add('open');
  document.body.style.overflow = 'hidden';
}
function closeModal(id) {
  document.getElementById(id).classList.remove('open');
  document.body.style.overflow = '';
}

function closeModalAndScroll(modalId, targetId) {
  closeModal(modalId);
  setTimeout(function() {
    const el = document.getElementById(targetId);
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }, 150);
}

document.querySelectorAll('.modal-overlay').forEach(function(overlay) {
  overlay.addEventListener('click', function(e) {
    if (e.target === overlay) closeModal(overlay.id);
  });
});

document.addEventListener('keydown', function(e) {
  if (e.key === 'Escape') {
    document.querySelectorAll('.modal-overlay.open').forEach(function(m) {
      closeModal(m.id);
    });
  }
});
