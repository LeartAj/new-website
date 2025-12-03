// PillNav Animation Implementation
// Based on pillnav.js React component, adapted for vanilla JavaScript

class PillNavigation {
  constructor(options = {}) {
    this.options = {
      ease: 'power3.out',
      baseColor: '#000',
      pillColor: '#fff',
      hoveredPillTextColor: '#fff',
      pillTextColor: '#000',
      initialLoadAnimation: true,
      ...options
    };

    this.circleRefs = [];
    this.tlRefs = [];
    this.activeTweenRefs = [];
    this.logoTweenRef = null;
    this.isMobileMenuOpen = false;

    this.init();
  }

  init() {
    this.cacheElements();
    this.setupCSSVariables();
    this.setupEventListeners();
    this.layout();
    this.setupResizeObserver();
    this.setupFontsReady();
    this.setupInitialAnimation();
    this.setupMobileMenu();
  }

  cacheElements() {
    this.navContainer = document.getElementById('nav-container');
    this.logoLink = document.getElementById('logo-link');
    this.logoImg = document.getElementById('logo-img');
    this.navItems = document.getElementById('nav-items');
    this.pills = document.querySelectorAll('.pill');
    this.mobileMenuBtn = document.getElementById('mobile-menu-btn');
    this.mobileMenu = document.getElementById('mobile-menu');
    this.mobileMenuLinks = document.querySelectorAll('.mobile-menu-link');
  }

  setupCSSVariables() {
    const nav = document.querySelector('.pill-nav');
    if (nav) {
      nav.style.setProperty('--base', this.options.baseColor);
      nav.style.setProperty('--pill-bg', this.options.pillColor);
      nav.style.setProperty('--hover-text', this.options.hoveredPillTextColor);
      nav.style.setProperty('--pill-text', this.options.pillTextColor);
    }

    const mobileMenuPopover = document.querySelector('.mobile-menu-popover');
    if (mobileMenuPopover) {
      mobileMenuPopover.style.setProperty('--base', this.options.baseColor);
      mobileMenuPopover.style.setProperty('--pill-bg', this.options.pillColor);
      mobileMenuPopover.style.setProperty('--hover-text', this.options.hoveredPillTextColor);
      mobileMenuPopover.style.setProperty('--pill-text', this.options.pillTextColor);
    }
  }

  setupEventListeners() {
    // Logo hover
    if (this.logoLink) {
      this.logoLink.addEventListener('mouseenter', () => this.handleLogoEnter());
    }

    // Pill hover effects
    this.pills.forEach((pill, index) => {
      const circle = pill.querySelector('.hover-circle');
      if (circle) {
        this.circleRefs[index] = circle;
      }

      pill.addEventListener('mouseenter', () => this.handleEnter(index));
      pill.addEventListener('mouseleave', () => this.handleLeave(index));
    });

    // Mobile menu toggle
    if (this.mobileMenuBtn) {
      this.mobileMenuBtn.addEventListener('click', () => this.toggleMobileMenu());
    }

    // Close mobile menu when clicking links
    this.mobileMenuLinks.forEach(link => {
      link.addEventListener('click', () => {
        if (this.isMobileMenuOpen) {
          this.toggleMobileMenu();
        }
      });
    });
  }

  layout() {
    this.circleRefs.forEach((circle, index) => {
      if (!circle?.parentElement) return;

      const pill = circle.parentElement;
      const rect = pill.getBoundingClientRect();
      const { width: w, height: h } = rect;

      // Calculate circle dimensions for pill effect
      const R = ((w * w) / 4 + h * h) / (2 * h);
      const D = Math.ceil(2 * R) + 2;
      const delta = Math.ceil(R - Math.sqrt(Math.max(0, R * R - (w * w) / 4))) + 1;
      const originY = D - delta;

      circle.style.width = `${D}px`;
      circle.style.height = `${D}px`;
      circle.style.bottom = `-${delta}px`;

      gsap.set(circle, {
        xPercent: -50,
        scale: 0,
        transformOrigin: `50% ${originY}px`
      });

      const label = pill.querySelector('.pill-label');
      const hoverLabel = pill.querySelector('.pill-label-hover');

      if (label) gsap.set(label, { y: 0 });
      if (hoverLabel) gsap.set(hoverLabel, { y: h + 12, opacity: 0 });

      // Kill existing timeline
      if (this.tlRefs[index]) {
        this.tlRefs[index].kill();
      }

      // Create hover timeline
      const tl = gsap.timeline({ paused: true });

      tl.to(circle, {
        scale: 1.2,
        xPercent: -50,
        duration: 2,
        ease: this.options.ease,
        overwrite: 'auto'
      }, 0);

      if (label) {
        tl.to(label, {
          y: -(h + 8),
          duration: 2,
          ease: this.options.ease,
          overwrite: 'auto'
        }, 0);
      }

      if (hoverLabel) {
        gsap.set(hoverLabel, { y: Math.ceil(h + 100), opacity: 0 });
        tl.to(hoverLabel, {
          y: 0,
          opacity: 1,
          duration: 2,
          ease: this.options.ease,
          overwrite: 'auto'
        }, 0);
      }

      this.tlRefs[index] = tl;
    });
  }

  handleEnter(index) {
    const tl = this.tlRefs[index];
    if (!tl) return;

    if (this.activeTweenRefs[index]) {
      this.activeTweenRefs[index].kill();
    }

    this.activeTweenRefs[index] = tl.tweenTo(tl.duration(), {
      duration: 0.3,
      ease: this.options.ease,
      overwrite: 'auto'
    });
  }

  handleLeave(index) {
    const tl = this.tlRefs[index];
    if (!tl) return;

    if (this.activeTweenRefs[index]) {
      this.activeTweenRefs[index].kill();
    }

    this.activeTweenRefs[index] = tl.tweenTo(0, {
      duration: 0.2,
      ease: this.options.ease,
      overwrite: 'auto'
    });
  }

  handleLogoEnter() {
    if (!this.logoImg) return;

    if (this.logoTweenRef) {
      this.logoTweenRef.kill();
    }

    gsap.set(this.logoImg, { rotate: 0 });
    this.logoTweenRef = gsap.to(this.logoImg, {
      rotate: 360,
      duration: 0.2,
      ease: this.options.ease,
      overwrite: 'auto'
    });
  }

  toggleMobileMenu() {
    this.isMobileMenuOpen = !this.isMobileMenuOpen;

    const hamburgerLines = this.mobileMenuBtn.querySelectorAll('.hamburger-line');

    if (this.isMobileMenuOpen) {
      // Animate hamburger to X
      gsap.to(hamburgerLines[0], {
        rotation: 45,
        y: 3,
        duration: 0.3,
        ease: this.options.ease
      });
      gsap.to(hamburgerLines[1], {
        rotation: -45,
        y: -3,
        duration: 0.3,
        ease: this.options.ease
      });

      // Show mobile menu
      gsap.set(this.mobileMenu, { visibility: 'visible' });
      gsap.fromTo(
        this.mobileMenu,
        { opacity: 0, y: 10, scaleY: 1 },
        {
          opacity: 1,
          y: 0,
          scaleY: 1,
          duration: 0.3,
          ease: this.options.ease,
          transformOrigin: 'top center'
        }
      );
    } else {
      // Animate X back to hamburger
      gsap.to(hamburgerLines[0], {
        rotation: 0,
        y: 0,
        duration: 0.3,
        ease: this.options.ease
      });
      gsap.to(hamburgerLines[1], {
        rotation: 0,
        y: 0,
        duration: 0.3,
        ease: this.options.ease
      });

      // Hide mobile menu
      gsap.to(this.mobileMenu, {
        opacity: 0,
        y: 10,
        scaleY: 1,
        duration: 0.2,
        ease: this.options.ease,
        transformOrigin: 'top center',
        onComplete: () => {
          gsap.set(this.mobileMenu, { visibility: 'hidden' });
        }
      });
    }
  }

  setupMobileMenu() {
    if (this.mobileMenu) {
      gsap.set(this.mobileMenu, { visibility: 'hidden', opacity: 0, scaleY: 1 });
    }
  }

  setupInitialAnimation() {
    if (!this.options.initialLoadAnimation) return;

    if (this.logoLink) {
      gsap.set(this.logoLink, { scale: 0 });
      gsap.to(this.logoLink, {
        scale: 1,
        duration: 0.6,
        ease: this.options.ease
      });
    }

    if (this.navItems) {
      gsap.set(this.navItems, { width: 0, overflow: 'hidden' });
      gsap.to(this.navItems, {
        width: 'auto',
        duration: 0.6,
        ease: this.options.ease
      });
    }
  }

  setupResizeObserver() {
    window.addEventListener('resize', () => this.layout());
  }

  setupFontsReady() {
    if (document.fonts?.ready) {
      document.fonts.ready.then(() => this.layout()).catch(() => {});
    }
  }
}

// Contact form handling
class ContactForm {
  constructor() {
    this.form = document.querySelector('.contact-form');
    if (this.form) {
      this.setupFormSubmission();
    }
  }

  setupFormSubmission() {
    this.form.addEventListener('submit', (e) => {
      e.preventDefault();

      const formData = new FormData(this.form);
      const data = Object.fromEntries(formData);

      console.log('Form submitted:', data);

      // Show success message
      alert('Thank you for your message! We will get back to you soon.');

      // Reset form
      this.form.reset();
    });
  }
}

// Smooth scroll for anchor links
function setupSmoothScroll() {
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
      const href = this.getAttribute('href');

      if (href === '#') {
        e.preventDefault();
        window.scrollTo({ top: 0, behavior: 'smooth' });
        return;
      }

      const target = document.querySelector(href);
      if (target) {
        e.preventDefault();
        target.scrollIntoView({ behavior: 'smooth' });
      }
    });
  });
}

// Active navigation state based on scroll position
function setupScrollSpy() {
  const sections = document.querySelectorAll('section[id]');
  const navLinks = document.querySelectorAll('.pill');
  const mobileLinks = document.querySelectorAll('.mobile-menu-link');

  function updateActiveNav() {
    let currentSection = '';

    sections.forEach(section => {
      const sectionTop = section.offsetTop;
      const sectionHeight = section.clientHeight;

      if (window.scrollY >= sectionTop - 100) {
        currentSection = section.getAttribute('id');
      }
    });

    // Update desktop nav
    navLinks.forEach(link => {
      link.classList.remove('is-active');
      const href = link.getAttribute('href');
      if (href === `#${currentSection}` || (currentSection === 'home' && href === '#')) {
        link.classList.add('is-active');
      }
    });

    // Update mobile nav
    mobileLinks.forEach(link => {
      link.classList.remove('is-active');
      const href = link.getAttribute('href');
      if (href === `#${currentSection}` || (currentSection === 'home' && href === '#')) {
        link.classList.add('is-active');
      }
    });
  }

  window.addEventListener('scroll', updateActiveNav);
  updateActiveNav();
}

// Dark Mode Toggle
class DarkModeToggle {
  constructor() {
    this.toggleButton = document.getElementById('dark-mode-toggle');

    // Check if user has a saved preference
    const savedPreference = localStorage.getItem('darkMode');

    if (savedPreference !== null) {
      // Use saved preference
      this.isDarkMode = savedPreference === 'true';
    } else {
      // No saved preference - default based on time of day
      this.isDarkMode = this.isNightTime();
    }

    this.init();
  }

  isNightTime() {
    // Get current hour (0-23)
    const hour = new Date().getHours();

    // Consider night time as 6 PM (18:00) to 6 AM (06:00)
    return hour >= 18 || hour < 6;
  }

  init() {
    // Apply saved preference or time-based default
    if (this.isDarkMode) {
      document.body.classList.add('dark-mode');
    }

    // Setup event listener
    if (this.toggleButton) {
      this.toggleButton.addEventListener('click', () => this.toggle());
    }

    // Update PillNav colors when dark mode changes
    this.updatePillNavColors();
  }

  toggle() {
    this.isDarkMode = !this.isDarkMode;
    document.body.classList.toggle('dark-mode');

    // Save preference
    localStorage.setItem('darkMode', this.isDarkMode);

    // Update PillNav colors
    this.updatePillNavColors();

    // Add rotation animation to button
    gsap.to(this.toggleButton, {
      rotation: '+=360',
      duration: 0.5,
      ease: 'power2.out'
    });
  }

  updatePillNavColors() {
    const nav = document.querySelector('.pill-nav');
    const mobileMenuPopover = document.querySelector('.mobile-menu-popover');
    const logoImg = document.getElementById('logo-img');

    if (this.isDarkMode) {
      // Dark mode: white background, black pills, black logo
      if (nav) {
        nav.style.setProperty('--base', '#fff');
        nav.style.setProperty('--pill-bg', '#000');
        nav.style.setProperty('--hover-text', '#000');
        nav.style.setProperty('--pill-text', '#fff');
      }
      if (mobileMenuPopover) {
        mobileMenuPopover.style.setProperty('--base', '#fff');
        mobileMenuPopover.style.setProperty('--pill-bg', '#000');
        mobileMenuPopover.style.setProperty('--hover-text', '#000');
        mobileMenuPopover.style.setProperty('--pill-text', '#fff');
      }
      if (logoImg) {
        logoImg.src = 'logo2black.svg';
      }
    } else {
      // Light mode: black background, white pills, white logo
      if (nav) {
        nav.style.setProperty('--base', '#000');
        nav.style.setProperty('--pill-bg', '#fff');
        nav.style.setProperty('--hover-text', '#fff');
        nav.style.setProperty('--pill-text', '#000');
      }
      if (mobileMenuPopover) {
        mobileMenuPopover.style.setProperty('--base', '#000');
        mobileMenuPopover.style.setProperty('--pill-bg', '#fff');
        mobileMenuPopover.style.setProperty('--hover-text', '#fff');
        mobileMenuPopover.style.setProperty('--pill-text', '#000');
      }
      if (logoImg) {
        logoImg.src = 'logo2white.svg';
      }
    }
  }
}

// Initialize everything when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  // Initialize PillNav with custom options
  const pillNav = new PillNavigation({
    ease: 'power3.out',
    baseColor: '#000',
    pillColor: '#fff',
    hoveredPillTextColor: '#fff',
    pillTextColor: '#000',
    initialLoadAnimation: true
  });

  // Initialize contact form
  const contactForm = new ContactForm();

  // Initialize dark mode toggle
  const darkModeToggle = new DarkModeToggle();

  // Setup smooth scrolling
  setupSmoothScroll();

  // Setup scroll spy
  setupScrollSpy();
});
