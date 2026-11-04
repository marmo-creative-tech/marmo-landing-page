/**
 * MARMO PRODUCTION HOUSE — MAIN JAVASCRIPT
 * Interactive Planet Orbit Flick Mini-Game, Business Mode Switcher, Mascot Parallax & Portfolio
 */

document.addEventListener('DOMContentLoaded', () => {
  initNavbarScroll();
  initHeroOrbitFlickGame();
  initHeroOrbitScroll();
  initMascotInteractivity();
  initBusinessSwitcher();
  initServiceCardEffects();
  initPortfolioFilters();
  initProjectModal();
  initContactForm();
});

/* ===================================================================
   1. NAVBAR SCROLL EFFECT
   =================================================================== */
function initNavbarScroll() {
  const header = document.querySelector('.site-header');
  const navLinks = document.querySelectorAll('.nav-link');
  if (!header) return;

  // Header background on scroll
  window.addEventListener('scroll', () => {
    if (window.scrollY > 30) {
      header.classList.add('scrolled');
    } else {
      header.classList.remove('scrolled');
    }
  });

  // Click on nav links updates active underline immediately
  navLinks.forEach(link => {
    link.addEventListener('click', () => {
      navLinks.forEach(l => l.classList.remove('active'));
      link.classList.add('active');
      header.classList.remove('mobile-open');
    });
  });

  // Scroll spy to update active link
  const sections = [
    { id: 'home', link: document.querySelector('.nav-link[href="#home"]') },
    { id: 'about', link: document.querySelector('.nav-link[href="#about"]') },
    { id: 'services', link: document.querySelector('.nav-link[href="#services"]') },
    { id: 'creativePortfolio', link: document.querySelector('.nav-link[href="#creativePortfolio"]') },
    { id: 'contact', link: document.querySelector('.nav-link[href="#contact"]') }
  ];

  window.addEventListener('scroll', () => {
    const scrollPos = window.scrollY + 180;
    for (let i = sections.length - 1; i >= 0; i--) {
      const secEl = document.getElementById(sections[i].id);
      if (secEl && secEl.offsetTop <= scrollPos) {
        navLinks.forEach(l => l.classList.remove('active'));
        sections[i].link?.classList.add('active');
        break;
      }
    }
  }, { passive: true });

  // Mobile menu toggle
  const mobileToggle = document.querySelector('.mobile-menu-toggle');
  if (mobileToggle) {
    mobileToggle.addEventListener('click', () => {
      header.classList.toggle('mobile-open');
    });
  }
}

/* ===================================================================
   2. ORBIT PLANET FLICK MINI-GAME (CLICK TO FLICK & ACCELERATE)
   "if user click, the round circle on the orbit is moving like got flicked
    and move fast around the orbit, its like a small games."
   =================================================================== */
function initHeroOrbitFlickGame() {
  const pContainer = document.getElementById('orbitParticlesContainer');
  const hudSpeed = document.getElementById('hudSpeedBadge');
  const hudFlicks = document.getElementById('hudFlicksBadge');

  let totalFlicks = 0;

  // Planet entities on concentric orbits
  const planets = [
    {
      id: 'planetOrange',
      el: document.getElementById('planetOrange'),
      ringEl: document.getElementById('orbitRing1'),
      radius: 240,
      angle: 0,
      baseSpeed: 0.009,
      velocity: 0.009,
      name: 'Solar Orange',
      color: '#FF9E1B'
    },
    {
      id: 'planetPurple',
      el: document.getElementById('planetPurple'),
      ringEl: document.getElementById('orbitRing2'),
      radius: 370,
      angle: 2.1,
      baseSpeed: -0.007,
      velocity: -0.007,
      name: 'Tech Purple',
      color: '#9B7AE8'
    },
    {
      id: 'planetGold',
      el: document.getElementById('planetGold'),
      ringEl: document.getElementById('orbitRing2'),
      radius: 370,
      angle: 5.2,
      baseSpeed: -0.007,
      velocity: -0.007,
      name: 'Nova Gold',
      color: '#FFD13B'
    },
    {
      id: 'planetCyan',
      el: document.getElementById('planetCyan'),
      ringEl: document.getElementById('orbitRing3'),
      radius: 490,
      angle: 3.8,
      baseSpeed: 0.005,
      velocity: 0.005,
      name: 'Cyan Star',
      color: '#38BDF8'
    }
  ];

  // Flick Quotes / Floating Comic Text
  const flickPhrases = [
    "⚡ FLICK! +100 SPEED",
    "🔥 HYPERDRIVE!",
    "🚀 LIGHTSPEED!",
    "💫 COSMIC ACCEL!",
    "💥 SUPERNOVA!",
    "✨ COMBO x2!",
    "🌟 ORBITAL DRIFT!"
  ];

  // Sound generator (Web Audio API synth - zero external files)
  function playFlickSound(freqBoost = 1) {
    try {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      if (!AudioContext) return;
      const ctx = new AudioContext();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(320 * freqBoost, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(880 * freqBoost, ctx.currentTime + 0.14);

      gain.gain.setValueAtTime(0.09, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.14);

      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.14);
    } catch (e) {}
  }

  // Trigger Flick Impulse on Planet
  function flickPlanet(planet, clientX, clientY) {
    totalFlicks++;

    // Instant velocity boost impulse in orbit direction (stackable!)
    const boostDir = planet.baseSpeed >= 0 ? 1 : -1;
    const impulse = 0.32 * boostDir;
    planet.velocity += impulse;

    // Audio feedback
    playFlickSound(1 + (Math.abs(planet.velocity) * 2));

    // Spawn floating score badge
    const phrase = flickPhrases[Math.floor(Math.random() * flickPhrases.length)];
    spawnFlickPopup(phrase, clientX, clientY, planet.color);

    // Spawn burst of stardust
    for (let i = 0; i < 8; i++) {
      spawnStardust(clientX, clientY, planet.color);
    }

    // Update HUD Badges
    if (hudFlicks) hudFlicks.textContent = `${totalFlicks} Flicks`;
    const speedMult = Math.abs(planet.velocity / planet.baseSpeed).toFixed(1);
    if (hudSpeed) {
      hudSpeed.textContent = `${speedMult}x Speed 🔥`;
      hudSpeed.style.color = planet.color;
      setTimeout(() => {
        if (hudSpeed) hudSpeed.style.color = '#FFF';
      }, 500);
    }
  }

  // Spawn Comic Text Popup
  function spawnFlickPopup(text, x, y, color) {
    if (!pContainer) return;
    const popup = document.createElement('div');
    popup.className = 'flick-score-popup';
    popup.textContent = text;
    popup.style.left = `${x}px`;
    popup.style.top = `${y}px`;
    popup.style.color = color;
    pContainer.appendChild(popup);
    setTimeout(() => popup.remove(), 1000);
  }

  // Spawn Stardust Sparkle
  function spawnStardust(x, y, color) {
    if (!pContainer) return;
    const star = document.createElement('div');
    star.className = 'orbit-stardust';
    const size = Math.random() * 8 + 4;
    star.style.width = `${size}px`;
    star.style.height = `${size}px`;
    star.style.background = color;
    star.style.boxShadow = `0 0 10px ${color}`;
    star.style.left = `${x + (Math.random() * 30 - 15)}px`;
    star.style.top = `${y + (Math.random() * 30 - 15)}px`;
    pContainer.appendChild(star);
    setTimeout(() => star.remove(), 700);
  }

  // Attach click and hover listeners to each planet
  planets.forEach(p => {
    p.isHovered = false;

    if (p.el) {
      // Hover detection to stabilize and catch planet under cursor
      p.el.addEventListener('mouseenter', () => {
        p.isHovered = true;
      });
      p.el.addEventListener('mouseleave', () => {
        p.isHovered = false;
      });

      // Instant responsive click / pointerdown trigger
      const triggerFlick = (e) => {
        e.stopPropagation();
        const rect = p.el.getBoundingClientRect();
        const wrapRect = pContainer ? pContainer.getBoundingClientRect() : { left: 0, top: 0 };
        const localX = rect.left + rect.width / 2 - wrapRect.left;
        const localY = rect.top + rect.height / 2 - wrapRect.top;
        flickPlanet(p, localX, localY);
      };

      p.el.addEventListener('pointerdown', triggerFlick);
      p.el.addEventListener('click', triggerFlick);
    }
  });

  // Physics Animation Loop
  let lastTime = performance.now();
  function animateOrbits(time) {
    const dt = Math.min((time - lastTime) / 16.66, 2.5);
    lastTime = time;

    let maxVelocityRatio = 1.0;

    planets.forEach(p => {
      if (!p.el) return;

      // When hovered, slow down orbit progression so it's effortless to click!
      const activeDt = p.isHovered ? dt * 0.12 : dt;

      // Update angle
      p.angle += p.velocity * activeDt;

      // Friction: smooth deceleration back to baseSpeed
      p.velocity = p.velocity * 0.965 + p.baseSpeed * 0.035;

      // Track highest ratio for HUD
      const ratio = Math.abs(p.velocity / p.baseSpeed);
      if (ratio > maxVelocityRatio) maxVelocityRatio = ratio;

      // Position on elliptical orbit
      const x = Math.cos(p.angle) * p.radius;
      const y = Math.sin(p.angle) * p.radius;

      p.el.style.left = `calc(50% + ${x}px)`;
      p.el.style.top = `calc(50% + ${y}px)`;

      // Spawn stardust trails while in high speed flick
      if (Math.abs(p.velocity) > 0.04 && Math.random() < 0.45 && pContainer) {
        const wrapRect = pContainer.getBoundingClientRect();
        const elRect = p.el.getBoundingClientRect();
        spawnStardust(
          elRect.left + elRect.width / 2 - wrapRect.left,
          elRect.top + elRect.height / 2 - wrapRect.top,
          p.color
        );
      }
    });

    // Update HUD Cruise/Speed display smoothly
    if (hudSpeed && maxVelocityRatio <= 1.2 && totalFlicks > 0) {
      hudSpeed.textContent = 'Cruising Orbit';
    }

    requestAnimationFrame(animateOrbits);
  }

  requestAnimationFrame(animateOrbits);
}

/* ===================================================================
   3. HERO SCROLL-REACTIVE PLANETARY PERSPECTIVE TILT
   =================================================================== */
function initHeroOrbitScroll() {
  const orbitWrap = document.querySelector('.hero-orbit-canvas-wrap');
  const scrollOrbitPlanet = document.querySelector('.orbiting-planet-dot');

  if (!orbitWrap) return;

  window.addEventListener('scroll', () => {
    const scrollY = window.scrollY;
    const heroHeight = window.innerHeight;

    if (scrollY < heroHeight * 1.5) {
      // 3D tilt perspective of the orbit galaxy as user scrolls down
      const tiltX = Math.min(scrollY * 0.035, 26);
      const rotZ = scrollY * 0.06;
      orbitWrap.style.transform = `translate(-50%, -50%) perspective(950px) rotateX(${tiltX}deg) rotateZ(${rotZ}deg)`;

      if (scrollOrbitPlanet) {
        scrollOrbitPlanet.style.transform = `translateX(-50%) rotate(${scrollY * 0.5}deg)`;
      }
    }
  }, { passive: true });
}

/* ===================================================================
   4. BUSINESS SWITCHER (MATCHES IMAGE 2: CREATIVE VS TECH)
   "For the Marmo Creative! Showroom, move it into new page when user click on the hero or on the switch on the header and also for the marmo tech itself."
   =================================================================== */
function initBusinessSwitcher() {
  const btnCreative = document.getElementById('btnMarmoCreative');
  const btnTech = document.getElementById('btnMarmoTech');

  const currentPage = window.location.pathname.split('/').pop() || 'index.html';

  if (btnCreative) {
    btnCreative.addEventListener('click', (e) => {
      if (currentPage === 'creative.html') {
        e.preventDefault();
        const target = document.querySelector('#creativeShowroom');
        if (target) target.scrollIntoView({ behavior: 'smooth' });
      } else {
        // Navigate to creative page
        window.location.href = 'creative.html';
      }
    });
  }

  if (btnTech) {
    btnTech.addEventListener('click', (e) => {
      if (currentPage === 'tech.html') {
        e.preventDefault();
        const target = document.querySelector('#techShowroom');
        if (target) target.scrollIntoView({ behavior: 'smooth' });
      } else {
        // Navigate to tech page
        window.location.href = 'tech.html';
      }
    });
  }
}

/* ===================================================================
   5. HERO MASCOT & FLOATING GROUND INTERACTIVITY & PARALLAX
   =================================================================== */
function initMascotInteractivity() {
  const monkey = document.getElementById('mainMascot') || document.querySelector('.hero-monkey-character');
  const bubble = document.getElementById('mascotBubble') || document.querySelector('.mascot-speech-bubble');
  const stage = document.getElementById('heroMascotStage') || document.querySelector('.hero-mascot-stage');
  const parallaxWrap = document.getElementById('mascotParallaxWrap');
  const unit = document.getElementById('mascotFloatingUnit');
  const ground = document.getElementById('mascotGround');

  if (!monkey || !stage) return;

  // Multi-Character & Greeting Pose Roster
  const mascotRoster = [
    {
      img: "assets/images/sprites/mandrill_3d_standing.png",
      alt: "Marmo Mandrill Mascot",
      quote: "leave a mark. no fluff, just magic! ✨"
    },
    {
      img: "assets/images/team/rifqy_pilot.png",
      alt: "Captain Rifqy - Tech Pilot",
      quote: "Captain Rifqy at the helm! Full throttle ahead! ✈️🕹️"
    },
    {
      img: "assets/images/team/boy_copilot.png",
      alt: "Co-Pilot Boy - Creative Direction",
      quote: "Co-Pilot Boy here! Navigating storytelling & magic! 🛫🌟"
    },
    {
      img: "assets/images/team/khalf_creative.png",
      alt: "Khalf Chameleon - Creative Showroom",
      quote: "Welcome to Marmo Creative Showroom! 🎨🦎"
    },
    {
      img: "assets/images/team/ega_tech.png",
      alt: "Ega Tech Pilot - Systems Engineer",
      quote: "Marmo Tech is ready to engineer your digital engine! 💻⚡"
    },
    {
      img: "assets/images/sprites/mandrill_crouch_clean.png",
      alt: "Action Mandrill",
      quote: "Zero fluff, high impact! Ready to produce! 🎬⚡"
    },
    {
      img: "assets/images/team/fico_creative.png",
      alt: "Fico Snake - Creative Division",
      quote: "Smooth workflows & lightning-fast delivery! 🐍✨"
    },
    {
      img: "assets/images/team/mevy_creative.png",
      alt: "Mevy Beetle - Production Specialist",
      quote: "Precision crafted! 10+ partners trust our craft! 🐞🔥"
    }
  ];

  // Preload all character images so switches are instantaneous with zero flicker
  mascotRoster.forEach(item => {
    const preload = new Image();
    preload.src = item.img;
  });

  let currentIndex = 0;
  let isTransitioning = false;

  function switchMascot() {
    if (isTransitioning) return;
    isTransitioning = true;

    currentIndex = (currentIndex + 1) % mascotRoster.length;
    const nextItem = mascotRoster[currentIndex];

    // Animate speech bubble pop-out
    if (bubble) {
      bubble.style.transform = 'scale(0.8)';
      bubble.style.opacity = '0.5';
    }

    // Animate character pop-out
    monkey.classList.add('switching-out');

    // Pulse the white floating ground
    if (ground) {
      ground.classList.add('ripple-pulse');
      setTimeout(() => ground.classList.remove('ripple-pulse'), 450);
    }

    setTimeout(() => {
      // Update character image and speech greeting
      monkey.src = nextItem.img;
      monkey.alt = nextItem.alt;

      if (bubble) {
        bubble.textContent = nextItem.quote;
        bubble.style.transform = 'scale(1.08)';
        bubble.style.opacity = '1';
        setTimeout(() => {
          bubble.style.transform = '';
        }, 220);
      }

      monkey.classList.remove('switching-out');
      monkey.classList.add('switching-in');

      setTimeout(() => {
        monkey.classList.remove('switching-in');
        isTransitioning = false;
      }, 300);
    }, 160);
  }

  // Click handler on character image, unit, and speech bubble
  if (unit) {
    unit.addEventListener('click', switchMascot);
  } else {
    monkey.addEventListener('click', switchMascot);
  }

  if (bubble) {
    bubble.addEventListener('click', (e) => {
      e.stopPropagation();
      switchMascot();
    });
  }

  // Mouse Parallax on Stage (moves parallax wrapper smoothly without disturbing floating unit)
  stage.addEventListener('mousemove', (e) => {
    const rect = stage.getBoundingClientRect();
    const x = e.clientX - rect.left - rect.width / 2;
    const y = e.clientY - rect.top - rect.height / 2;

    const moveX = (x / rect.width) * 16;
    const moveY = (y / rect.height) * 12;

    const target = parallaxWrap || monkey;
    target.style.transform = `translate(${moveX}px, ${moveY}px) rotate(${moveX * 0.15}deg)`;
  });

  stage.addEventListener('mouseleave', () => {
    const target = parallaxWrap || monkey;
    target.style.transform = '';
  });
}

/* ===================================================================
   6. SERVICE CARDS: 3D TILT & PLANET ORBIT PULSE
   =================================================================== */
function initServiceCardEffects() {
  const cards = document.querySelectorAll('.service-card');

  cards.forEach(card => {
    card.addEventListener('mousemove', (e) => {
      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      const centerX = rect.width / 2;
      const centerY = rect.height / 2;

      const rotateX = ((y - centerY) / centerY) * -8;
      const rotateY = ((x - centerX) / centerX) * 8;

      card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-8px) scale(1.02)`;
    });

    card.addEventListener('mouseleave', () => {
      card.style.transform = '';
    });
  });
}

/* ===================================================================
   7. MARMO CREATIVE PORTFOLIO FILTER
   =================================================================== */
function initPortfolioFilters() {
  const filterBtns = document.querySelectorAll('.filter-btn');
  const items = document.querySelectorAll('.portfolio-card');

  filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      filterBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      const filterValue = btn.getAttribute('data-filter');

      items.forEach(item => {
        const category = item.getAttribute('data-category');
        if (filterValue === 'all' || category === filterValue) {
          item.style.display = 'flex';
          item.style.animation = 'modalScaleUp 0.35s ease-out';
        } else {
          item.style.display = 'none';
        }
      });
    });
  });
}

/* ===================================================================
   8. CASE STUDY MODAL & FULL PORTFOLIO DATA (FROM PDF)
   =================================================================== */
const portfolioData = {
  esco: {
    title: "Esco Lifescience Group Booklet",
    year: "2023",
    format: "Booklet (Print & Digital)",
    category: "Company Profile",
    image: "assets/images/portfolio/esco_logo.png",
    client: "Esco Lifescience Group",
    desc: "Esco is an international manufacturer of laboratory and biopharma equipment. We were tasked with creating their company profile booklet, highlighting their journey from the beginning to their future plans.",
    deliverables: ["Comprehensive corporate history timeline", "Product and service management layout", "Life science transition narrative", "Print-ready high-DPI booklet and interactive digital PDF"]
  },
  dharma: {
    title: "Dharma Polimetal Tbk Video Profile",
    year: "2024",
    format: "Video (4K Cinema Production)",
    category: "Video & Company Profile",
    image: "assets/images/portfolio/dharma_logo.png",
    client: "Dharma Polimetal Tbk",
    desc: "Dharma Polimetal Tbk specializes in precision industrial tooling and manufacturing. They have collaborated with major companies such as Astra Honda Motor, Toyota, and Yamaha. This company profile video highlights their vision, facilities, product range, and client portfolio.",
    deliverables: ["On-site 500T & 300T Press Machine facility filming", "Industrial dies & cutting tool segment showcase", "Client collaboration credibility segment (Honda, Toyota, Yamaha)", "Cinematic motion graphics & color grading"]
  },
  belpin: {
    title: "Belpin Blessin Indonesia Reels",
    year: "2025",
    format: "Reels & Short Video",
    category: "Social Media & Reels",
    image: "assets/images/portfolio/belpin_logo.png",
    client: "Belpin Blessin Indonesia",
    desc: "Belpin Blessin Indonesia has become a supplier of IT-related hardware and software products. The content we've created will be posted on their social media as part of their marketing efforts. This includes both product promotions and trend-based content aimed at increasing brand awareness.",
    deliverables: ["Product spotlight reels (HP Pavilion X360 Yoga)", "Viral office comedy skits & trend-jacking", "In-app 'Keranjang Kuning' conversion hooks", "Consistent brand tone and high-energy pacing"]
  },
  bca: {
    title: "BCA Graphic Design and Motion",
    year: "2024",
    format: "Digital Ad Creatives & Motion Graphics",
    category: "Graphic Design & Motion",
    image: "assets/images/portfolio/bca_logo.png",
    client: "Bank Central Asia (BCA)",
    desc: "Digital ad creatives, motion design, and promotional materials crafted for WhatsApp blasts, email campaigns, the myBCA app, and digital marketing channels.",
    deliverables: ["Flazz BCA Rp 1.000.000 cashback campaign visual", "Diskon 5% Supermarket Credit Card creatives", "WhatsApp blast motion banners & direct response layouts", "High-conversion myBCA mobile application hero assets"]
  },
  summarecon: {
    title: "Summarecon Group Culture Videos",
    year: "2024",
    format: "Reels & Video Production",
    category: "Employer Branding",
    image: "assets/images/portfolio/summarecon_logo.png",
    client: "Summarecon Group",
    desc: "Summarecon Career gives insight into their internal activities while also posting job vacancies for job seekers. The videos were recorded and edited for use on their social media.",
    deliverables: ["Internal sports activities & team building coverage", "17 Agustus Independence Day flag ceremony reel", "Food festival & corporate life insights", "Interactive job fair & recruitment vacancy video clips"]
  },
  cpopc_profile: {
    title: "CPOPC Video Company profile and Social Media Post",
    year: "2024",
    format: "Corporate Film & Social Campaign",
    category: "Company Profile & Video",
    image: "assets/images/clients/cpopc.svg",
    client: "Council of Palm oil Producing Countries (CPOPC)",
    desc: "CPOPC is an intergovernmental organization that promotes, develops, and establishes cooperation in palm oil production. We crafted their official corporate video profile and accompanying social media campaign, highlighting sustainable agriculture practices, economic impact, and international leadership.",
    deliverables: [
      "Cinematic 4K corporate video profile with international voiceover",
      "Executive interview staging & global supply chain narrative",
      "Multi-platform social media post pack and teaser reels",
      "Digital brochure and infographics for diplomatic summits"
    ]
  },
  cpopc_social: {
    title: "CPOPC Short and Long social Media post",
    year: "2024-2025",
    format: "Short & Long Video Content",
    category: "Video & Social Media",
    image: "assets/images/clients/cpopc.svg",
    client: "Council of Palm oil Producing Countries (CPOPC)",
    desc: "A comprehensive digital communication series featuring dynamic short-form reels for fast engagement and deep-dive long-form video content educating global stakeholders on environmental sustainability standards, smallholder farmer livelihoods, and fair trade policies.",
    deliverables: [
      "High-retention 9:16 vertical short reels for Instagram & TikTok",
      "In-depth 16:9 documentary-style long-form video essays",
      "Animated kinetic data graphics & statistical charts",
      "Multilingual captions and stakeholder-ready presentation edits"
    ]
  },
  fortius_web: {
    title: "Fortius WEB HR Platform UI",
    year: "2024",
    format: "Enterprise Web App & SaaS Architecture",
    category: "Web & UI/UX Systems",
    image: "assets/images/portfolio/fortius_web_preview.svg",
    client: "Fortius HRIS",
    desc: "Fortius helps companies optimize and digitize their entire human resource workflow. We architected the web application user interface, onboarding guides, and interactive dashboard design to give HR managers effortless control over employee scheduling, compliance, and automated payroll operations.",
    deliverables: [
      "Web application and mobile app SaaS interface system",
      "Employee attendance & real-time payroll accuracy dashboard UI",
      "Interactive onboarding flows and feature guide design",
      "Maintenance & update alert illustration kit with clean responsive SaaS product marketing pages"
    ]
  },
  segari: {
    title: "Segari Mascot & Packaging Ecosystem",
    year: "2024",
    format: "Mascot Character & Packaging",
    category: "Mascot & Brand Identity",
    image: "assets/images/portfolio/segari_preview.svg",
    client: "Segari Fresh Groceries",
    desc: "Segari delivers daily essentials to customers with just a tap on the app. The mascot is developed from the early stages and will be featured across their social media, products, and packaging.",
    deliverables: ["Full mascot character sheet and expression system", "Delivery scooter & fresh vegetable character variations", "Social media 'Belanja Pas Gajian' cashback banners", "Product packaging boxes, paper bags & sticker kits"]
  },
  fortius_social: {
    title: "Fortius Social Media & Thought Leadership",
    year: "2024-2025",
    format: "Educational Carousels & Reels",
    category: "Social Media Strategy",
    image: "assets/images/portfolio/fortius_social_preview.svg",
    client: "Fortius HRIS",
    desc: "Fortius helps companies optimize their human resource management. The designs created here will be used on their social media to showcase Fortius's features and increase brand awareness.",
    deliverables: ["'Tau Gak Sih?' educational carousels", "HR Burnout prevention actionable tips", "Relatable Gen Z workplace memes and reels", "Feature spotlight & software onboarding carousels"]
  },

  /* ==================== MARMO TECH! PORTFOLIO ==================== */
  haho: {
    title: "Haho: Where Indonesia's Creatives Find Work That Actually Fits",
    year: "2024",
    format: "Web App & Talent Marketplace",
    category: "Full-Stack Web App",
    image: "assets/images/portfolio/tech/haho.png",
    client: "Haho Indonesia",
    tagline: "Where Indonesia's Creatives Find Work that actually fits.",
    desc: "Talent and opportunity, scattered everywhere — Haho puts them in one place. Matches the right creative people to the right work with verified creator profiles, transparent service pricelists, upfront booking terms, and instant service dispatch.",
    deliverables: [
      "Creator Profile & Portfolio System ('See who they are, what they do, and why they're the right fit')",
      "Book a Service Engine with upfront rates and transparent terms",
      "Dynamic talent filtering by discipline, city, and client ratings",
      "Streamlined client-to-creator direct hiring workflow"
    ]
  },
  bankpromo: {
    title: "Bank Promo: All of the Nation's Promos, In One Place",
    year: "2024",
    format: "Fintech Web App & Calendar",
    category: "Full-Stack & Aggregator",
    image: "assets/images/portfolio/tech/bankpromo.png",
    client: "Bank Promo",
    liveUrl: "https://bankpromo.my.id",
    tagline: "All of the Nation's Promos, in One Place. Updated Daily.",
    desc: "Every bank, e-wallet, and credit card promotion in Indonesia aggregated into one clean, interactive calendar. Over 1,600+ verified active deals updated daily with zero guesswork so users see what's actually worth their money today.",
    deliverables: [
      "Unified national promo calendar with daily, weekly, and expiring-soon timelines",
      "Browse Brands directory (BCA, Mandiri, Blibli, Shopee, Cinema XXI, Telkomsel)",
      "Daily automated verification engine keeping all 1,600+ deals fresh and valid",
      "Direct integration with WhatsApp and Telegram alert channels"
    ]
  },
  transflynd: {
    title: "TRANSFLYND: Fleet Management & Route Optimization",
    year: "2024",
    format: "Enterprise TMS & Logistics",
    category: "Cloud Systems & Optimization",
    image: "assets/images/portfolio/tech/transflynd.png",
    client: "Transflynd Logistics",
    tagline: "Fleet operations made actually easy — no spreadsheets required.",
    desc: "A transport management system engineered to make dispatching and fleet utilization painless. Features live order tracking, automated driver onboarding, and algorithmic route calculation that finds optimal paths in seconds.",
    deliverables: [
      "Central Control Center managing orders, vehicles, and status on one screen",
      "Algorithmic Route Optimization ('Jarvis, find the best route')",
      "Automated truck dispatching and multi-drop delivery sequencing",
      "Elimination of cumbersome manual Excel spreadsheets"
    ]
  },
  sahabat_outlet: {
    title: "Sahabat Outlet Redesign: A PPOB App for Bills, Credit, E-Wallets & Health Insurance",
    year: "2024",
    format: "Retail Fintech SuperApp",
    category: "Fintech & Mobile UI/UX",
    image: "assets/images/portfolio/tech/sahabat_outlet.png",
    client: "Sahabat Outlet",
    tagline: "A PPOB App for Bills, Credit, E-Wallets, and Health Insurance.",
    desc: "Complete modernization of the Sahabat Outlet PPOB retail agent platform. Replaced legacy, sluggish interfaces with a high-speed transactional workflow for PLN electricity tokens, PDAM municipal water, BPJS healthcare, phone credit, and instant e-wallet top-ups.",
    deliverables: [
      "One-Click Bill Settlement Engine for PLN, PDAM, and BPJS Kesehatan",
      "Instant top-ups for 100+ digital providers and major e-wallets",
      "Real-time retail agent balance ledger and automated profit margin calculation",
      "Hardened 2FA biometric PIN verification for frictionless security"
    ]
  },
  wright_partner: {
    title: "Wright Partner: Sustainable Venture Building Profile",
    year: "2024",
    format: "Corporate Venture Web Platform",
    category: "Corporate Web Platform",
    image: "assets/images/portfolio/tech/wright_partner.png",
    client: "Wright Partners",
    liveUrl: "https://wright.partners",
    tagline: "A Company Profile for a Firm that Builds Sustainable, Investable Businesses.",
    desc: "High-performance digital presence for Wright Partners, a venture studio that collaborates with enterprise giants to co-found and scale sustainable, investable new ventures. Features deep venture methodology, team credentials, and research perspectives.",
    deliverables: [
      "Execution Forward methodology showcase (Venture Partners, Commercial x Product x Governance)",
      "Corporate Insights & White Papers repository ('Corporate Venture Valley of Death')",
      "Institutional-grade typography, layout, and lightning-fast loading speed",
      "Engaging corporate portfolio and investment thesis display"
    ]
  },
  custom_birthday_web: {
    title: "Custom Birthday Web: Interactive Celebration Platform",
    year: "2024",
    format: "Interactive AI Web App",
    category: "Creative AI & Web App",
    image: "assets/images/portfolio/tech/custom_birthday_web.png",
    client: "Rafiendra 24th Celebration",
    liveUrl: "https://rafiendra-birthday.vercel.app",
    tagline: "A Fully Custom Website Created to Celebrate a Friend's Birthday.",
    desc: "A bespoke designer-driven web experience packed with delightful interactive widgets, flower bouquet unboxing, and AI-powered interactions built for a creative director's 24th birthday. Proves that software can be personal, emotional, and magical.",
    deliverables: [
      "Interactive AI Chatbot ('Chat with Your Design Mentor' for creative brainstorms)",
      "AI Creative Forecast diagnosing creative syndrome with witty prescriptions",
      "Personalized draggable notes and interactive bouquet animations",
      "Deployed instantly on Vercel with zero downtime and fluid micro-animations"
    ]
  }
};

function initProjectModal() {
  const modal = document.getElementById('projectModal');
  const closeBtn = document.querySelector('.modal-close-btn');
  const viewBtns = document.querySelectorAll('.view-case-btn');

  if (!modal) return;

  viewBtns.forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const projectId = btn.getAttribute('data-project');
      const data = portfolioData[projectId];
      if (!data) return;

      document.getElementById('modalTitle').textContent = data.title;
      document.getElementById('modalYear').textContent = data.year;
      document.getElementById('modalFormat').textContent = data.format;
      document.getElementById('modalClient').textContent = data.client;
      document.getElementById('modalDesc').textContent = data.desc;
      document.getElementById('modalImg').src = data.image;

      const delivList = document.getElementById('modalDeliverables');
      delivList.innerHTML = '';
      data.deliverables.forEach(item => {
        const li = document.createElement('li');
        li.textContent = item;
        delivList.appendChild(li);
      });

      // Handle live URL if available
      let liveBtn = document.getElementById('modalLiveLink');
      if (data.liveUrl) {
        if (!liveBtn) {
          liveBtn = document.createElement('a');
          liveBtn.id = 'modalLiveLink';
          liveBtn.className = 'cta-btn-tech';
          liveBtn.target = '_blank';
          liveBtn.style.padding = '10px 20px';
          liveBtn.style.fontSize = '14px';
          liveBtn.style.textDecoration = 'none';
          const actionsDiv = modal.querySelector('.modal-body > div:last-child');
          if (actionsDiv) actionsDiv.insertBefore(liveBtn, actionsDiv.firstChild);
        }
        liveBtn.href = data.liveUrl;
        liveBtn.innerHTML = '<i class="fa-solid fa-arrow-up-right-from-square"></i> Visit Live Website';
        liveBtn.style.display = 'inline-flex';
      } else if (liveBtn) {
        liveBtn.style.display = 'none';
      }

      modal.classList.add('active');
      document.body.style.overflow = 'hidden';
    });
  });

  const closeModal = () => {
    modal.classList.remove('active');
    document.body.style.overflow = '';
  };

  if (closeBtn) closeBtn.addEventListener('click', closeModal);
  modal.addEventListener('click', (e) => {
    if (e.target === modal) closeModal();
  });
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && modal.classList.contains('active')) closeModal();
  });
}

/* ===================================================================
   9. CONTACT FORM EMAIL SUBMISSION & TOAST NOTIFICATION
   =================================================================== */
function initContactForm() {
  const form = document.getElementById('magicContactForm');
  const toast = document.getElementById('toastNotification');

  if (!form) return;

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const emailInput = form.querySelector('.contact-email-input');
    const email = emailInput?.value.trim();

    if (!email || !email.includes('@')) {
      showToast('⚠️ Please enter a valid email address!');
      return;
    }

    // Success response
    showToast(`🎉 Awesome! We'll send magic to ${email} shortly!`);
    if (emailInput) emailInput.value = '';
  });

  function showToast(message) {
    if (!toast) return;
    toast.textContent = message;
    toast.classList.add('show');
    setTimeout(() => {
      toast.classList.remove('show');
    }, 4500);
  }
}
