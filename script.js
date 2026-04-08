'use strict';

/* ═══════════════════════════════════════════════
   AMAN KHAN PORTFOLIO — script.js
   Three.js Anti-Gravity Particles + All Interactions
   ═══════════════════════════════════════════════ */

// ─── Theme Toggle ─────────────────────────────────────────────────────────────
(function initTheme() {
  const html   = document.documentElement;
  const btn    = document.getElementById('themeToggle');
  if (!btn) return;

  // Load saved preference (default: dark)
  const saved = localStorage.getItem('theme') || 'dark';
  html.setAttribute('data-theme', saved);

  btn.addEventListener('click', () => {
    const current = html.getAttribute('data-theme');
    const next    = current === 'dark' ? 'light' : 'dark';
    html.setAttribute('data-theme', next);
    localStorage.setItem('theme', next);

    // Re-init Three.js colors to match theme
    updateParticleTheme(next);
  });
})();


// ─── Three.js Anti-Gravity Particle Background ────────────────────────────────
let particleScene, particleMaterial;

(function initThreeBackground() {
  const canvas = document.getElementById('bgCanvas');
  if (!canvas || typeof THREE === 'undefined') return;

  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setClearColor(0x000000, 0);

  const scene  = new THREE.Scene();
  particleScene = scene;

  const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
  camera.position.z = 80;

  const particleCount = 280;
  const positions  = new Float32Array(particleCount * 3);
  const velocities = [];
  const colors     = new Float32Array(particleCount * 3);
  const sizes      = new Float32Array(particleCount);

  const darkPalette = [
    new THREE.Color(0x8b5cf6),
    new THREE.Color(0x6366f1),
    new THREE.Color(0xa78bfa),
    new THREE.Color(0x818cf8),
    new THREE.Color(0xc4b5fd),
    new THREE.Color(0x4338ca),
  ];
  const lightPalette = [
    new THREE.Color(0x7c3aed),
    new THREE.Color(0x6d28d9),
    new THREE.Color(0x8b5cf6),
    new THREE.Color(0x4f46e5),
    new THREE.Color(0x6366f1),
    new THREE.Color(0x4338ca),
  ];

  function currentPalette() {
    return document.documentElement.getAttribute('data-theme') === 'light'
      ? lightPalette : darkPalette;
  }

  for (let i = 0; i < particleCount; i++) {
    const i3 = i * 3;
    positions[i3]     = (Math.random() - 0.5) * 200;
    positions[i3 + 1] = (Math.random() - 0.5) * 140;
    positions[i3 + 2] = (Math.random() - 0.5) * 80;
    velocities.push({
      x: (Math.random() - 0.5) * 0.04,
      y: Math.random() * 0.04 + 0.01, // always slightly upward
      z: (Math.random() - 0.5) * 0.02,
    });
    sizes[i] = Math.random() * 2.5 + 0.5;
    const col = darkPalette[Math.floor(Math.random() * darkPalette.length)];
    colors[i3] = col.r; colors[i3+1] = col.g; colors[i3+2] = col.b;
  }

  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  geometry.setAttribute('color',    new THREE.BufferAttribute(colors, 3));
  geometry.setAttribute('size',     new THREE.BufferAttribute(sizes, 1));

  particleMaterial = new THREE.PointsMaterial({
    size: 1.2,
    vertexColors: true,
    transparent: true,
    opacity: 0.65,
    sizeAttenuation: true,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
  });

  const particles = new THREE.Points(geometry, particleMaterial);
  scene.add(particles);

  // Expose function to re-color particles on theme change
  window.updateParticleTheme = function(theme) {
    const palette = theme === 'light' ? lightPalette : darkPalette;
    const col_arr = geometry.attributes.color.array;
    for (let i = 0; i < particleCount; i++) {
      const i3  = i * 3;
      const col = palette[Math.floor(Math.random() * palette.length)];
      col_arr[i3] = col.r; col_arr[i3+1] = col.g; col_arr[i3+2] = col.b;
    }
    geometry.attributes.color.needsUpdate = true;
    particleMaterial.opacity = theme === 'light' ? 0.35 : 0.65;
  };

  const mouse = { x: 0, y: 0 };
  window.addEventListener('mousemove', (e) => {
    mouse.x = (e.clientX / window.innerWidth  - 0.5) * 2;
    mouse.y = (e.clientY / window.innerHeight - 0.5) * 2;
  });

  const posArr = geometry.attributes.position.array;

  function animate() {
    requestAnimationFrame(animate);

    for (let i = 0; i < particleCount; i++) {
      const i3 = i * 3;
      posArr[i3]     += velocities[i].x;
      posArr[i3 + 1] += velocities[i].y;
      posArr[i3 + 2] += velocities[i].z;
      if (posArr[i3 + 1] >  80)  posArr[i3 + 1] = -80;
      if (posArr[i3]     >  105) posArr[i3]      = -105;
      if (posArr[i3]     < -105) posArr[i3]      =  105;
    }
    geometry.attributes.position.needsUpdate = true;

    camera.position.x += (mouse.x * 8  - camera.position.x) * 0.03;
    camera.position.y += (-mouse.y * 5 - camera.position.y) * 0.03;
    camera.lookAt(scene.position);

    particles.rotation.y += 0.0008;
    renderer.render(scene, camera);
  }
  animate();

  window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
  });
})();


// ─── Custom Cursor ────────────────────────────────────────────────────────────
/*
  Fixes for GitHub Pages / production deployment:
  ─ Only enable on true pointer:fine devices (real mouse, not touch)
  ─ Add .has-mouse to <body> so CSS cursor:none only fires on mouse users
  ─ Reveal cursor on first mousemove (opacity 0→1), avoiding (0,0) flash
  ─ No mix-blend-mode; use direct pixel positioning for reliability
*/
(function initCursor() {
  const cursor      = document.getElementById('cursor');
  const cursorTrail = document.getElementById('cursorTrail');
  if (!cursor || !cursorTrail) return;

  // Detect if device has a real mouse pointer
  const hasFinePointer = window.matchMedia('(pointer: fine)').matches;
  if (!hasFinePointer) return; // touch device — leave native cursor alone

  // Confirm mouse device to CSS
  document.body.classList.add('has-mouse');

  let cx = 0, cy = 0, tx = -200, ty = -200;
  let activated = false;
  let rafId;

  function moveCursorTrail() {
    cx += (tx - cx) * 0.13;
    cy += (ty - cy) * 0.13;
    cursorTrail.style.left = cx + 'px';
    cursorTrail.style.top  = cy + 'px';
    rafId = requestAnimationFrame(moveCursorTrail);
  }
  moveCursorTrail();

  document.addEventListener('mousemove', (e) => {
    tx = e.clientX;
    ty = e.clientY;

    // Direct pixel position for the dot — fastest and most reliable
    cursor.style.left = tx + 'px';
    cursor.style.top  = ty + 'px';

    // Reveal on first real movement
    if (!activated) {
      activated = true;
      cursor.classList.add('cursor-active');
      cursorTrail.classList.add('cursor-active');
    }
  });

  // Hide when mouse leaves the window
  document.addEventListener('mouseleave', () => {
    cursor.style.opacity   = '0';
    cursorTrail.style.opacity = '0';
  });
  document.addEventListener('mouseenter', () => {
    if (activated) {
      cursor.style.opacity   = '1';
      cursorTrail.style.opacity = '0.55';
    }
  });

  // Hover states
  document.querySelectorAll('a, button, .tilt-card, .skill-tag, .tech-chip, .theme-toggle').forEach(el => {
    el.addEventListener('mouseenter', () => {
      cursor.classList.add('cursor-hover');
      cursorTrail.classList.add('cursor-hover');
    });
    el.addEventListener('mouseleave', () => {
      cursor.classList.remove('cursor-hover');
      cursorTrail.classList.remove('cursor-hover');
    });
  });
})();


// ─── Navbar scroll + active link ──────────────────────────────────────────────
(function initNavbar() {
  const navbar    = document.getElementById('navbar');
  const navLinks  = document.querySelectorAll('.nav-link');
  const sections  = document.querySelectorAll('section[id]');
  const navToggle = document.getElementById('navToggle');
  const navLinksContainer = document.getElementById('navLinks');

  window.addEventListener('scroll', () => {
    navbar.classList.toggle('scrolled', window.scrollY > 60);

    let current = '';
    sections.forEach(sec => {
      if (window.scrollY >= sec.offsetTop - 120) current = sec.getAttribute('id');
    });
    navLinks.forEach(link => {
      link.classList.toggle('active', link.getAttribute('href') === '#' + current);
    });
  }, { passive: true });

  navToggle.addEventListener('click', () => {
    navToggle.classList.toggle('open');
    navLinksContainer.classList.toggle('open');
  });

  navLinks.forEach(link => {
    link.addEventListener('click', () => {
      navToggle.classList.remove('open');
      navLinksContainer.classList.remove('open');
    });
  });
})();


// ─── Typewriter Effect ────────────────────────────────────────────────────────
(function initTypewriter() {
  const el = document.getElementById('typewriter');
  if (!el) return;

  const words = [
    'Python Developer',
    'ML Engineer',
    'Data Scientist',
    'AI Enthusiast',
    'Problem Solver',
  ];

  let wordIndex = 0, charIndex = 0, deleting = false;

  function type() {
    const current = words[wordIndex];
    el.textContent = deleting
      ? current.substring(0, charIndex - 1)
      : current.substring(0, charIndex + 1);

    if (deleting) charIndex--; else charIndex++;

    let delay = deleting ? 60 : 110;
    if (!deleting && charIndex === current.length) { delay = 2000; deleting = true; }
    else if (deleting && charIndex === 0) { deleting = false; wordIndex = (wordIndex + 1) % words.length; delay = 400; }

    setTimeout(type, delay);
  }
  type();
})();


// ─── Scroll Reveal ────────────────────────────────────────────────────────────
(function initScrollReveal() {
  document.querySelectorAll('.glass-card, .section-header, .timeline-item, .cert-card').forEach(el => {
    if (!el.classList.contains('reveal-up') && !el.classList.contains('reveal-right')) {
      el.classList.add('reveal-up');
    }
  });

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) entry.target.classList.add('in-view');
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });

  document.querySelectorAll('.reveal-up, .reveal-right').forEach(el => observer.observe(el));
})();


// ─── Skill Bars ───────────────────────────────────────────────────────────────
(function initSkillBars() {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.style.width = entry.target.getAttribute('data-width') + '%';
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.3 });

  document.querySelectorAll('.skill-bar-fill').forEach(bar => observer.observe(bar));
})();


// ─── 3D Card Tilt ─────────────────────────────────────────────────────────────
(function initTiltEffect() {
  document.querySelectorAll('.tilt-card').forEach(card => {
    card.addEventListener('mousemove', (e) => {
      const rect = card.getBoundingClientRect();
      const rotY =  ((e.clientX - rect.left  - rect.width  / 2) / (rect.width  / 2)) * 10;
      const rotX = -((e.clientY - rect.top   - rect.height / 2) / (rect.height / 2)) * 10;
      card.style.transition = 'transform 0.1s ease-out';
      card.style.transform  = `perspective(800px) rotateX(${rotX}deg) rotateY(${rotY}deg) translateZ(4px)`;
    });
    card.addEventListener('mouseleave', () => {
      card.style.transition = 'transform 0.5s cubic-bezier(0.4,0,0.2,1)';
      card.style.transform  = 'perspective(800px) rotateX(0deg) rotateY(0deg) translateZ(0)';
    });
  });
})();


// ─── Contact Form ─────────────────────────────────────────────────────────────
(function initContactForm() {
  const form    = document.getElementById('contactForm');
  const success = document.getElementById('formSuccess');
  const btn     = document.getElementById('submitBtn');
  if (!form) return;

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const name    = document.getElementById('contactName').value.trim();
    const email   = document.getElementById('contactEmail').value.trim();
    const message = document.getElementById('contactMessage').value.trim();

    if (!name || !email || !message) {
      form.style.animation = 'shake 0.4s ease';
      setTimeout(() => { form.style.animation = ''; }, 400);
      return;
    }

    btn.innerHTML = '<span>Sending…</span>';
    btn.disabled  = true;
    btn.style.opacity = '0.7';

    setTimeout(() => {
      btn.innerHTML = '<span>Send Message</span><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z"/></svg>';
      btn.disabled  = false;
      btn.style.opacity = '1';
      success.classList.add('show');
      form.reset();
      setTimeout(() => success.classList.remove('show'), 5000);
    }, 1600);
  });
})();


// ─── Hero parallax ────────────────────────────────────────────────────────────
(function initHeroParallax() {
  const oc = document.getElementById('orbitContainer');
  if (!oc) return;
  window.addEventListener('scroll', () => {
    if (window.scrollY < window.innerHeight) {
      oc.style.transform = `translateY(${window.scrollY * 0.15}px)`;
    }
  }, { passive: true });
})();


// ─── Initial hero reveal ──────────────────────────────────────────────────────
window.addEventListener('load', () => {
  setTimeout(() => {
    document.querySelectorAll('.hero .reveal-up, .hero .reveal-right').forEach(el => {
      el.classList.add('in-view');
    });
  }, 100);
});
