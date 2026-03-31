/* ═══════════════════════════════════════════════════════════════
   AMAN KHAN — PORTFOLIO SCRIPT
   Three.js · GSAP · ScrollTrigger · Cursor · Interactions
   ═══════════════════════════════════════════════════════════════ */

(() => {
  'use strict';

  /* ─────────────────────────────────────
     1. PRELOADER
     ───────────────────────────────────── */
  const preloader = document.getElementById('preloader');
  window.addEventListener('load', () => {
    setTimeout(() => {
      preloader.classList.add('hidden');
      initHeroAnimations();
    }, 1200);
  });

  /* ─────────────────────────────────────
     2. CUSTOM CURSOR
     ───────────────────────────────────── */
  const cursorDot = document.getElementById('cursor-dot');
  const cursorRing = document.getElementById('cursor-ring');
  let mouseX = 0, mouseY = 0;
  let ringX = 0, ringY = 0;

  document.addEventListener('mousemove', (e) => {
    mouseX = e.clientX;
    mouseY = e.clientY;
    cursorDot.style.left = mouseX + 'px';
    cursorDot.style.top = mouseY + 'px';
  });

  function animateCursor() {
    ringX += (mouseX - ringX) * 0.12;
    ringY += (mouseY - ringY) * 0.12;
    cursorRing.style.left = ringX + 'px';
    cursorRing.style.top = ringY + 'px';
    requestAnimationFrame(animateCursor);
  }
  animateCursor();

  // Hover effect on interactive elements
  const hoverTargets = 'a, button, .skill-card, .project-card, .stat-card, .social-link, .timeline-card';
  document.addEventListener('mouseover', (e) => {
    if (e.target.closest(hoverTargets)) {
      cursorDot.classList.add('hovered');
      cursorRing.classList.add('hovered');
    }
  });
  document.addEventListener('mouseout', (e) => {
    if (e.target.closest(hoverTargets)) {
      cursorDot.classList.remove('hovered');
      cursorRing.classList.remove('hovered');
    }
  });

  /* ─────────────────────────────────────
     3. THREE.JS — PARTICLE BACKGROUND
     ───────────────────────────────────── */
  const canvas = document.getElementById('three-canvas');
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 1000);
  camera.position.z = 50;

  const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

  // Particles
  const particleCount = 600;
  const positions = new Float32Array(particleCount * 3);
  const velocities = [];
  const colors = new Float32Array(particleCount * 3);

  const tealColor = new THREE.Color(0x14b8a6);
  const yellowColor = new THREE.Color(0xfacc15);
  const whiteColor = new THREE.Color(0xffffff);

  for (let i = 0; i < particleCount; i++) {
    const i3 = i * 3;
    positions[i3] = (Math.random() - 0.5) * 100;
    positions[i3 + 1] = (Math.random() - 0.5) * 100;
    positions[i3 + 2] = (Math.random() - 0.5) * 60;

    velocities.push({
      x: (Math.random() - 0.5) * 0.02,
      y: (Math.random() - 0.5) * 0.02,
      z: (Math.random() - 0.5) * 0.01
    });

    // Random color pick
    const r = Math.random();
    let c;
    if (r < 0.4) c = tealColor;
    else if (r < 0.6) c = yellowColor;
    else c = whiteColor;
    colors[i3] = c.r;
    colors[i3 + 1] = c.g;
    colors[i3 + 2] = c.b;
  }

  const particleGeometry = new THREE.BufferGeometry();
  particleGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  particleGeometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));

  const particleMaterial = new THREE.PointsMaterial({
    size: 0.15,
    vertexColors: true,
    transparent: true,
    opacity: 0.7,
    sizeAttenuation: true,
    blending: THREE.AdditiveBlending,
    depthWrite: false
  });

  const particles = new THREE.Points(particleGeometry, particleMaterial);
  scene.add(particles);

  // Floating geometric shapes
  const shapes = [];
  const shapeMaterial = new THREE.MeshBasicMaterial({
    color: 0x14b8a6,
    wireframe: true,
    transparent: true,
    opacity: 0.12
  });

  // Icosahedron
  const ico = new THREE.Mesh(new THREE.IcosahedronGeometry(3, 1), shapeMaterial);
  ico.position.set(25, 15, -15);
  scene.add(ico);
  shapes.push({ mesh: ico, rotSpeed: { x: 0.003, y: 0.005 }, floatSpeed: 0.5, floatAmp: 3 });

  // Octahedron
  const oct = new THREE.Mesh(
    new THREE.OctahedronGeometry(2.5, 0),
    new THREE.MeshBasicMaterial({ color: 0xfacc15, wireframe: true, transparent: true, opacity: 0.10 })
  );
  oct.position.set(-28, -12, -10);
  scene.add(oct);
  shapes.push({ mesh: oct, rotSpeed: { x: 0.004, y: 0.003 }, floatSpeed: 0.7, floatAmp: 4 });

  // Torus
  const torus = new THREE.Mesh(
    new THREE.TorusGeometry(4, 0.5, 8, 32),
    new THREE.MeshBasicMaterial({ color: 0x14b8a6, wireframe: true, transparent: true, opacity: 0.08 })
  );
  torus.position.set(0, -20, -20);
  scene.add(torus);
  shapes.push({ mesh: torus, rotSpeed: { x: 0.002, y: 0.006 }, floatSpeed: 0.3, floatAmp: 2 });

  // Dodecahedron
  const dodec = new THREE.Mesh(
    new THREE.DodecahedronGeometry(2, 0),
    new THREE.MeshBasicMaterial({ color: 0xfacc15, wireframe: true, transparent: true, opacity: 0.09 })
  );
  dodec.position.set(-20, 20, -18);
  scene.add(dodec);
  shapes.push({ mesh: dodec, rotSpeed: { x: 0.005, y: 0.002 }, floatSpeed: 0.6, floatAmp: 3.5 });

  // Connection lines between nearby particles
  const linesMaterial = new THREE.LineBasicMaterial({
    color: 0x14b8a6,
    transparent: true,
    opacity: 0.04,
    blending: THREE.AdditiveBlending,
    depthWrite: false
  });

  let linesGeometry = new THREE.BufferGeometry();
  const maxLines = 300;
  const linePositions = new Float32Array(maxLines * 6);
  linesGeometry.setAttribute('position', new THREE.BufferAttribute(linePositions, 3));
  const lineMesh = new THREE.LineSegments(linesGeometry, linesMaterial);
  scene.add(lineMesh);

  // Mouse parallax on scene
  let sceneMX = 0, sceneMY = 0;
  document.addEventListener('mousemove', (e) => {
    sceneMX = (e.clientX / window.innerWidth - 0.5) * 2;
    sceneMY = (e.clientY / window.innerHeight - 0.5) * 2;
  });

  // Animation loop
  const clock = new THREE.Clock();
  function animate() {
    requestAnimationFrame(animate);
    const t = clock.getElapsedTime();
    const posArray = particleGeometry.attributes.position.array;

    // Update particle positions
    for (let i = 0; i < particleCount; i++) {
      const i3 = i * 3;
      posArray[i3] += velocities[i].x;
      posArray[i3 + 1] += velocities[i].y;
      posArray[i3 + 2] += velocities[i].z;

      // Wrap around bounds
      if (posArray[i3] > 50) posArray[i3] = -50;
      if (posArray[i3] < -50) posArray[i3] = 50;
      if (posArray[i3 + 1] > 50) posArray[i3 + 1] = -50;
      if (posArray[i3 + 1] < -50) posArray[i3 + 1] = 50;
    }
    particleGeometry.attributes.position.needsUpdate = true;

    // Update connection lines
    let lineIdx = 0;
    const threshold = 12;
    for (let i = 0; i < particleCount && lineIdx < maxLines; i++) {
      for (let j = i + 1; j < particleCount && lineIdx < maxLines; j++) {
        const dx = posArray[i * 3] - posArray[j * 3];
        const dy = posArray[i * 3 + 1] - posArray[j * 3 + 1];
        const dz = posArray[i * 3 + 2] - posArray[j * 3 + 2];
        const dist = dx * dx + dy * dy + dz * dz;
        if (dist < threshold * threshold) {
          const li = lineIdx * 6;
          linePositions[li] = posArray[i * 3];
          linePositions[li + 1] = posArray[i * 3 + 1];
          linePositions[li + 2] = posArray[i * 3 + 2];
          linePositions[li + 3] = posArray[j * 3];
          linePositions[li + 4] = posArray[j * 3 + 1];
          linePositions[li + 5] = posArray[j * 3 + 2];
          lineIdx++;
        }
      }
    }
    // Clear remaining line positions
    for (let i = lineIdx * 6; i < maxLines * 6; i++) {
      linePositions[i] = 0;
    }
    linesGeometry.attributes.position.needsUpdate = true;

    // Animate shapes
    shapes.forEach((s) => {
      s.mesh.rotation.x += s.rotSpeed.x;
      s.mesh.rotation.y += s.rotSpeed.y;
      s.mesh.position.y += Math.sin(t * s.floatSpeed) * 0.015 * s.floatAmp;
    });

    // Mouse parallax – slow smooth follow
    camera.position.x += (sceneMX * 3 - camera.position.x) * 0.02;
    camera.position.y += (-sceneMY * 2 - camera.position.y) * 0.02;
    camera.lookAt(0, 0, 0);

    renderer.render(scene, camera);
  }
  animate();

  // Resize handler
  window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
  });

  /* ─────────────────────────────────────
     4. NAVBAR
     ───────────────────────────────────── */
  const navbar = document.getElementById('navbar');
  const navToggle = document.getElementById('nav-toggle');
  const mobileMenu = document.getElementById('mobile-menu');
  const mobileLinks = mobileMenu.querySelectorAll('a');

  window.addEventListener('scroll', () => {
    navbar.classList.toggle('scrolled', window.scrollY > 60);
  });

  navToggle.addEventListener('click', () => {
    navToggle.classList.toggle('active');
    mobileMenu.classList.toggle('open');
    document.body.style.overflow = mobileMenu.classList.contains('open') ? 'hidden' : '';
  });

  mobileLinks.forEach((link) => {
    link.addEventListener('click', () => {
      navToggle.classList.remove('active');
      mobileMenu.classList.remove('open');
      document.body.style.overflow = '';
    });
  });

  // Active nav link on scroll
  const sections = document.querySelectorAll('section[id]');
  const navAnchors = document.querySelectorAll('.nav-links a');
  window.addEventListener('scroll', () => {
    let current = '';
    sections.forEach((sec) => {
      const top = sec.offsetTop - 120;
      if (window.scrollY >= top) current = sec.getAttribute('id');
    });
    navAnchors.forEach((a) => {
      a.classList.toggle('active', a.getAttribute('href') === '#' + current);
    });
  });

  /* ─────────────────────────────────────
     5. GSAP HERO ANIMATIONS
     ───────────────────────────────────── */
  gsap.registerPlugin(ScrollTrigger);

  function initHeroAnimations() {
    const tl = gsap.timeline({ defaults: { ease: 'power3.out' } });

    tl.to('#hero-badge', { opacity: 1, y: 0, duration: 0.6 }, 0.1)
      .to('.char-wrap', { opacity: 1, y: 0, duration: 0.8, stagger: 0.15 }, 0.3)
      .to('#hero-subtitle', { opacity: 1, y: 0, duration: 0.6 }, 0.9)
      .to('#hero-desc', { opacity: 1, y: 0, duration: 0.6 }, 1.1)
      .to('#hero-cta', { opacity: 1, y: 0, duration: 0.6 }, 1.3)
      .to('#hero-image-wrap', { opacity: 1, scale: 1, duration: 0.9, ease: 'back.out(1.4)' }, 0.6)
      .to('#scroll-indicator', { opacity: 1, duration: 0.6 }, 1.6);
  }

  /* ─────────────────────────────────────
     6. SCROLL REVEAL ANIMATIONS
     ───────────────────────────────────── */
  // Section headers
  gsap.utils.toArray('.section-header').forEach((header) => {
    gsap.from(header.children, {
      scrollTrigger: { trigger: header, start: 'top 85%', toggleActions: 'play none none none' },
      y: 40,
      opacity: 0,
      duration: 0.7,
      stagger: 0.12,
      ease: 'power3.out'
    });
  });

  // About text
  gsap.utils.toArray('.about-text p').forEach((p, i) => {
    gsap.from(p, {
      scrollTrigger: { trigger: p, start: 'top 85%' },
      y: 30,
      opacity: 0,
      duration: 0.6,
      delay: i * 0.1,
      ease: 'power3.out'
    });
  });

  // Stat cards
  gsap.utils.toArray('.stat-card').forEach((card, i) => {
    gsap.from(card, {
      scrollTrigger: { trigger: card, start: 'top 88%' },
      y: 40,
      opacity: 0,
      duration: 0.6,
      delay: i * 0.1,
      ease: 'power3.out'
    });
  });

  // Animate stat numbers when in view
  const statNumbers = document.querySelectorAll('.stat-number');
  statNumbers.forEach((num) => {
    const target = parseInt(num.dataset.target);
    ScrollTrigger.create({
      trigger: num,
      start: 'top 88%',
      onEnter: () => {
        gsap.to(num, {
          innerText: target,
          duration: 1.5,
          snap: { innerText: 1 },
          ease: 'power2.out'
        });
      },
      once: true
    });
  });

  // Skill categories
  gsap.utils.toArray('.skill-category').forEach((cat) => {
    gsap.from(cat.querySelector('.category-title'), {
      scrollTrigger: { trigger: cat, start: 'top 85%' },
      x: -30,
      opacity: 0,
      duration: 0.6,
      ease: 'power3.out'
    });

    gsap.utils.toArray(cat.querySelectorAll('.skill-card')).forEach((card, i) => {
      gsap.from(card, {
        scrollTrigger: { trigger: card, start: 'top 90%' },
        y: 30,
        opacity: 0,
        duration: 0.5,
        delay: i * 0.08,
        ease: 'power3.out'
      });
    });
  });

  // Skill bar fill animation
  gsap.utils.toArray('.skill-fill').forEach((fill) => {
    ScrollTrigger.create({
      trigger: fill,
      start: 'top 90%',
      onEnter: () => fill.classList.add('animate'),
      once: true
    });
  });

  // Project cards
  gsap.utils.toArray('.project-card').forEach((card, i) => {
    gsap.from(card, {
      scrollTrigger: { trigger: card, start: 'top 88%' },
      y: 50,
      opacity: 0,
      duration: 0.7,
      delay: (i % 3) * 0.1,
      ease: 'power3.out'
    });
  });

  // Timeline items
  gsap.utils.toArray('.timeline-item').forEach((item, i) => {
    gsap.from(item, {
      scrollTrigger: { trigger: item, start: 'top 85%' },
      x: -40,
      opacity: 0,
      duration: 0.7,
      delay: i * 0.15,
      ease: 'power3.out'
    });
  });

  // Contact section
  gsap.from('.contact-info', {
    scrollTrigger: { trigger: '.contact-grid', start: 'top 80%' },
    x: -40,
    opacity: 0,
    duration: 0.7,
    ease: 'power3.out'
  });
  gsap.from('.contact-form', {
    scrollTrigger: { trigger: '.contact-grid', start: 'top 80%' },
    x: 40,
    opacity: 0,
    duration: 0.7,
    delay: 0.15,
    ease: 'power3.out'
  });

  /* ─────────────────────────────────────
     7. PROJECT CARD 3D TILT
     ───────────────────────────────────── */
  document.querySelectorAll('.project-card').forEach((card) => {
    const inner = card.querySelector('.project-card-inner');

    card.addEventListener('mousemove', (e) => {
      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      const centerX = rect.width / 2;
      const centerY = rect.height / 2;
      const rotateX = ((y - centerY) / centerY) * -6;
      const rotateY = ((x - centerX) / centerX) * 6;

      inner.style.transform = `translateY(-8px) rotateX(${rotateX}deg) rotateY(${rotateY}deg)`;
    });

    card.addEventListener('mouseleave', () => {
      inner.style.transform = 'translateY(0) rotateX(0deg) rotateY(0deg)';
    });
  });

  /* ─────────────────────────────────────
     8. SKILL CARD TILT
     ───────────────────────────────────── */
  document.querySelectorAll('.skill-card').forEach((card) => {
    card.addEventListener('mousemove', (e) => {
      const rect = card.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / rect.width - 0.5) * 8;
      const y = ((e.clientY - rect.top) / rect.height - 0.5) * -8;
      card.style.transform = `translateY(-6px) rotateX(${y}deg) rotateY(${x}deg)`;
    });

    card.addEventListener('mouseleave', () => {
      card.style.transform = '';
    });
  });

  /* ─────────────────────────────────────
     9. PARALLAX ON HERO ELEMENTS
     ───────────────────────────────────── */
  const heroSection = document.getElementById('hero');
  heroSection.addEventListener('mousemove', (e) => {
    const mx = (e.clientX / window.innerWidth - 0.5) * 2;
    const my = (e.clientY / window.innerHeight - 0.5) * 2;

    const blob = document.querySelector('.hero-blob');
    const imgContainer = document.querySelector('.hero-img-container');

    if (blob) blob.style.transform = `translate(${mx * 15}px, ${my * 15}px)`;
    if (imgContainer) imgContainer.style.transform = `translate(${mx * -8}px, ${my * -8}px)`;

    document.querySelectorAll('.hero-float').forEach((f, i) => {
      const factor = (i + 1) * 10;
      f.style.transform = `translate(${mx * factor}px, ${my * factor}px)`;
    });
  });

  /* ─────────────────────────────────────
     10. CONTACT FORM
     ───────────────────────────────────── */
  const form = document.getElementById('contact-form');
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const btn = document.getElementById('btn-submit');
    const originalHTML = btn.innerHTML;
    btn.innerHTML = '<span>Message Sent! ✓</span>';
    btn.style.background = 'linear-gradient(135deg, #22c55e, #16a34a)';
    btn.disabled = true;

    setTimeout(() => {
      btn.innerHTML = originalHTML;
      btn.style.background = '';
      btn.disabled = false;
      form.reset();
    }, 3000);
  });

  /* ─────────────────────────────────────
     11. SMOOTH SCROLL
     ───────────────────────────────────── */
  document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
    anchor.addEventListener('click', (e) => {
      e.preventDefault();
      const target = document.querySelector(anchor.getAttribute('href'));
      if (target) {
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    });
  });

})();
