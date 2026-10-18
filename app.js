/* ═══════════════ ZYRAXON-Pro · app.js ═══════════════ */
(function () {
  'use strict';

  /* ─── nav solid on scroll ─── */
  const nav = document.getElementById('nav');
  const onScroll = () => nav.classList.toggle('solid', window.scrollY > 40);
  onScroll();
  window.addEventListener('scroll', onScroll, { passive: true });

  /* ─── burger ─── */
  const burger = document.getElementById('burger');
  const links = document.querySelector('.nav-links');
  if (burger) {
    burger.addEventListener('click', () => links.classList.toggle('open'));
    links.querySelectorAll('a').forEach(a =>
      a.addEventListener('click', () => links.classList.remove('open'))
    );
  }

  /* ─── counters ─── */
  const counters = document.querySelectorAll('.stat-num[data-count]');
  const runCount = el => {
    const target = parseFloat(el.dataset.count);
    const suffix = el.dataset.suffix || '';
    const dur = 1500;
    const t0 = performance.now();
    const tick = now => {
      const p = Math.min((now - t0) / dur, 1);
      const eased = 1 - Math.pow(1 - p, 3);
      el.textContent = Math.round(target * eased) + suffix;
      if (p < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  };
  const cObs = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (e.isIntersecting) { runCount(e.target); cObs.unobserve(e.target); }
    });
  }, { threshold: 0.5 });
  counters.forEach(c => cObs.observe(c));

  /* ─── card spotlight ─── */
  document.querySelectorAll('.card').forEach(card => {
    card.addEventListener('mousemove', ev => {
      const r = card.getBoundingClientRect();
      card.style.setProperty('--mx', (ev.clientX - r.left) + 'px');
      card.style.setProperty('--my', (ev.clientY - r.top) + 'px');
    });
  });

  /* ─── toast ─── */
  const toastEl = document.getElementById('toast');
  let toastT;
  function toast(msg) {
    toastEl.textContent = msg;
    toastEl.classList.add('on');
    clearTimeout(toastT);
    toastT = setTimeout(() => toastEl.classList.remove('on'), 3400);
  }

  /* ─── build console ─── */
  const consoleBody = document.getElementById('consoleBody');
  function cl(text, cls) {
    const p = document.createElement('p');
    p.className = 'cl' + (cls ? ' ' + cls : '');
    p.textContent = text;
    consoleBody.appendChild(p);
    consoleBody.scrollTop = consoleBody.scrollHeight;
    return p;
  }

  const PLANS = {
    web: {
      name: 'Web',
      steps: [
        ['প্রজেক্ট স্ক্যাফোল্ডিং', 'index.html · styles.css · app.js'],
        ['কম্পোনেন্ট বিল্ড', 'Hero · Cards · Build Row · Console · Owner'],
        ['ইন্টারঅ্যাকশন ওয়্যারিং', 'কাউন্টার · কার্ড স্পটলাইট · কমান্ড প্যালেট'],
        ['রেসপন্সিভ অডিট', '860px · 560px ব্রেকপয়েন্ট'],
        ['GitHub Pages ডিপ্লয়', 'HTTPS · পাবলিক URL']
      ]
    },
    android: {
      name: 'Android APK',
      steps: [
        ['ক্যাপাসিটর কনফিগ', 'appId · webDir · অ্যাসেট বান্ডলিং'],
        ['অ্যান্ড্রয়েড স্ক্যাফোল্ড', 'MainActivity · AndroidManifest · res/'],
        ['রিসোর্স কম্পাইল', 'aapt2 → R.java জেনারেশন'],
        ['বাইটকোড বিল্ড', 'javac → d8 (dex)'],
        ['সাইন ও সারিবদ্ধ', 'zipalign → apksigner (v1+v2+v3)'],
        ['APK প্রস্তুত', 'ইনস্টলযোগ্য, পাবলিক লিংক']
      ]
    },
    windows: {
      name: 'Windows',
      steps: [
        ['ইলেকট্রন/Tauri প্রজেক্ট', 'main · preload · renderer'],
        ['NSIS ইনস্টলার স্ক্রিপ্ট', 'shortcut · আইকন · আনইনস্টল'],
        ['CI ম্যাট্রিক্স', 'windows-latest রানার'],
        ['বিল্ড ও প্যাকেজ', '.exe আর্টিফ্যাক্ট'],
        ['রিলিজ আপলোড', 'পাবলিক ডাউনলোড লিংক']
      ]
    },
    macos: {
      name: 'macOS',
      steps: [
        ['ডেস্কটপ প্রজেক্ট', 'Tauri v2 কনফিগ'],
        ['DMG বিল্ড স্ক্রিপ্ট', 'bundle · volume layout'],
        ['CI ম্যাট্রিক্স', 'macos-latest রানার'],
        ['কোড সাইন ধাপ', 'codesign · notarize'],
        ['.dmg প্রস্তুত', 'ডাউনলোড লিংক']
      ]
    },
    linux: {
      name: 'Linux',
      steps: [
        ['ডেস্কটপ প্রজেক্ট', 'Electron শেল + ওয়েব UI'],
        ['ডেব প্যাকেজিং', 'DEBIAN/control · ফাইল ম্যাপিং'],
        ['portable টারিবল', '.tar.gz বিল্ড'],
        ['AppImage কনফিগ', 'appimage-builder'],
        ['আর্টিফ্যাক্ট প্রস্তুত', '.deb · .AppImage · .tar.gz']
      ]
    }
  };

  let running = false;
  function runBuild(key) {
    const plan = PLANS[key];
    if (!plan) return;
    if (running) return;
    running = true;

    document.querySelectorAll('.build').forEach(b =>
      b.classList.toggle('on', b.dataset.t === key)
    );

    consoleBody.innerHTML = '';
    cl(`$ zyraxon build --target ${key}`, 'dim');
    cl(`  → ${plan.name} পাইপলাইন শুরু`, 'ok');

    let i = 0;
    const tick = () => {
      if (i >= plan.steps.length) {
        cl(`✓ ${plan.name} সম্পূর্ণ — লিংক প্রস্তুত।`, 'ok');
        cl(`  জান, বলো — এখনই বানিয়ে দিই?`, '');
        running = false;
        return;
      }
      const [a, b] = plan.steps[i];
      const line = cl(`  [${String(i + 1).padStart(2, '0')}/${plan.steps.length}] ${a} …`);
      setTimeout(() => {
        line.textContent = `  [${String(i + 1).padStart(2, '0')}/${plan.steps.length}] ${a} → ${b}`;
        line.classList.add('ok');
        i++;
        setTimeout(tick, 260);
      }, 520);
    };
    setTimeout(tick, 380);
  }

  document.querySelectorAll('.build').forEach(btn =>
    btn.addEventListener('click', () => runBuild(btn.dataset.t))
  );

  /* ─── command palette ─── */
  const cmdk = document.getElementById('cmdk');
  const cmdkInput = document.getElementById('cmdkInput');
  const openCmd = () => {
    cmdk.classList.add('on');
    cmdk.setAttribute('aria-hidden', 'false');
    setTimeout(() => cmdkInput.focus(), 60);
  };
  const closeCmd = () => {
    cmdk.classList.remove('on');
    cmdk.setAttribute('aria-hidden', 'true');
    cmdkInput.value = '';
    filter('');
  };
  document.getElementById('navStart').addEventListener('click', openCmd);
  document.getElementById('ctaBtn').addEventListener('click', openCmd);
  document.getElementById('heroStart').addEventListener('click', openCmd);
  document.getElementById('heroCaps').addEventListener('click', () =>
    document.getElementById('capabilities').scrollIntoView({ behavior: 'smooth' })
  );
  document.getElementById('cmdkX').addEventListener('click', closeCmd);
  cmdk.addEventListener('click', e => { if (e.target === cmdk) closeCmd(); });
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape' && cmdk.classList.contains('on')) closeCmd();
    if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
      e.preventDefault();
      cmdk.classList.contains('on') ? closeCmd() : openCmd();
    }
  });

  const rows = Array.from(document.querySelectorAll('.cmd-row'));
  function filter(q) {
    const s = q.trim().toLowerCase();
    rows.forEach(r => {
      r.style.display = !s || r.textContent.toLowerCase().includes(s) ? '' : 'none';
    });
  }
  cmdkInput.addEventListener('input', e => filter(e.target.value));
  cmdkInput.addEventListener('keydown', e => {
    if (e.key === 'Enter') {
      const first = rows.find(r => r.style.display !== 'none');
      if (first) first.click();
    }
  });
  rows.forEach(r => r.addEventListener('click', () => {
    closeCmd();
    toast('✓ "' + r.dataset.cmd + '" — জান, এখনই বানাচ্ছি!');
  }));

  /* ─── boot log ─── */
  setTimeout(() => toast('আমি ZYRAXON-Pro · onelpawarai-X কর্তৃক ZYRAXON Lab-এ তৈরি'), 900);
})();