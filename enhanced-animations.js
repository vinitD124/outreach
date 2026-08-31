/* =====================================================================
   ENHANCED SMOOTH SCROLL JAVASCRIPT
   Add this to enhance scroll behavior and animations
   ===================================================================== */

(function() {
  "use strict";

  // 1. SMOOTH SCROLL WITH EASING
  function smoothScrollTo(target, duration = 800) {
    const targetPosition = target.getBoundingClientRect().top + window.pageYOffset - 80;
    const startPosition = window.pageYOffset;
    const distance = targetPosition - startPosition;
    let startTime = null;

    function animation(currentTime) {
      if (startTime === null) startTime = currentTime;
      const timeElapsed = currentTime - startTime;
      const progress = Math.min(timeElapsed / duration, 1);

      // Easing function (easeInOutCubic)
      const ease = progress < 0.5
        ? 4 * progress * progress * progress
        : 1 - Math.pow(-2 * progress + 2, 3) / 2;

      window.scrollTo(0, startPosition + distance * ease);

      if (timeElapsed < duration) {
        requestAnimationFrame(animation);
      }
    }

    requestAnimationFrame(animation);
  }

  // Apply smooth scroll to all anchor links
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
      const href = this.getAttribute('href');
      if (href === '#' || href === '#top-sentinel') {
        e.preventDefault();
        smoothScrollTo(document.body, 600);
      } else {
        const target = document.querySelector(href);
        if (target) {
          e.preventDefault();
          smoothScrollTo(target, 800);
        }
      }
    });
  });

  // 2. ENHANCED RAIL PROGRESS WITH SMOOTH TRACKING
  const stackEl = document.getElementById('stack');
  if (stackEl) {
    const railFill = stackEl.querySelector('.steps__fill');
    const railNib = stackEl.querySelector('.steps__nib');

    if (railFill && railNib) {
      let ticking = false;

      function updateRailProgress() {
        const rect = stackEl.getBoundingClientRect();
        const vh = window.innerHeight;
        const start = vh * 0.7;
        const end = vh * 0.3;

        // Calculate smooth progress
        const progress = Math.min(
          Math.max((start - rect.top) / (rect.height + (start - end)), 0),
          1
        );

        // Apply with smooth easing
        railFill.style.transform = `scaleY(${progress})`;

        if (railNib) {
          const nibOpacity = progress > 0.02 && progress < 0.98 ? 1 : 0;
          const nibPosition = progress * (rect.height - 20);

          railNib.style.opacity = nibOpacity;
          railNib.style.transform = `translateY(${nibPosition}px)`;
        }

        ticking = false;
      }

      function onScroll() {
        if (!ticking) {
          requestAnimationFrame(updateRailProgress);
          ticking = true;
        }
      }

      window.addEventListener('scroll', onScroll, { passive: true });
      updateRailProgress(); // Initial call
    }
  }

  // 3. ENHANCED REVEAL ANIMATIONS WITH INTERSECTION OBSERVER
  const observerOptions = {
    threshold: [0, 0.1, 0.2, 0.3, 0.4, 0.5],
    rootMargin: '0px 0px -8% 0px'
  };

  const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting && entry.intersectionRatio > 0.1) {
        entry.target.classList.add('is-in');
      } else if (entry.intersectionRatio < 0.05) {
        // Remove class when scrolling back up for replay
        entry.target.classList.remove('is-in');
      }
    });
  }, observerOptions);

  // Observe all reveal elements
  document.querySelectorAll('.reveal, .split').forEach(el => {
    revealObserver.observe(el);
  });

  // 4. ENHANCED STEP ACTIVATION WITH SMOOTHER TRANSITIONS
  const stepCards = document.querySelectorAll('#stack .step');
  if (stepCards.length) {
    const stepObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const index = Array.from(stepCards).indexOf(entry.target);

          stepCards.forEach((card, i) => {
            card.classList.remove('is-active', 'is-done');

            if (i < index) {
              card.classList.add('is-done');
            } else if (i === index) {
              card.classList.add('is-active');
            }
          });
        }
      });
    }, {
      threshold: 0.5,
      rootMargin: '-30% 0px -30% 0px'
    });

    stepCards.forEach(card => stepObserver.observe(card));
  }

  // 5. SMOOTH PARALLAX FOR HERO ELEMENTS
  const heroMedia = document.querySelector('.hero__media');
  const heroCards = document.querySelectorAll('.hero__id, .hero__trust, .hero__seal');

  if (heroMedia && window.matchMedia('(prefers-reduced-motion: no-preference)').matches) {
    let parallaxTicking = false;

    function updateParallax() {
      const scrolled = window.pageYOffset;
      const rate = scrolled * 0.4;

      if (heroMedia) {
        heroMedia.style.transform = `translate3d(0, ${rate}px, 0)`;
      }

      heroCards.forEach((card, i) => {
        const cardRate = scrolled * (0.2 + i * 0.05);
        card.style.transform = `translate3d(0, ${cardRate}px, 0)`;
      });

      parallaxTicking = false;
    }

    function onScrollParallax() {
      if (!parallaxTicking) {
        requestAnimationFrame(updateParallax);
        parallaxTicking = true;
      }
    }

    window.addEventListener('scroll', onScrollParallax, { passive: true });
  }

  // 6. ENHANCED SERVICE SECTION IMAGE SWITCHER
  const svcSection = document.getElementById('svc');
  if (svcSection) {
    const rows = svcSection.querySelectorAll('.svc__row');
    const figs = svcSection.querySelectorAll('.svc__fig');
    let currentIndex = 0;
    let switchTimeout;

    function switchImage(index, immediate = false) {
      if (index === currentIndex && !immediate) return;

      rows.forEach((row, i) => {
        row.classList.toggle('is-on', i === index);
      });

      figs.forEach((fig, i) => {
        fig.classList.toggle('is-on', i === index);
      });

      currentIndex = index;
    }

    // Smooth scroll-based switching
    let svcTicking = false;
    function updateServiceImage() {
      const rect = svcSection.getBoundingClientRect();

      if (rect.top > window.innerHeight || rect.bottom < 0) {
        svcTicking = false;
        return;
      }

      const focusY = window.innerHeight * 0.42;
      let bestIdx = currentIndex;
      let minDiff = Infinity;

      rows.forEach((row, idx) => {
        const rRect = row.getBoundingClientRect();
        const rowCenter = rRect.top + rRect.height / 2;
        const diff = Math.abs(rowCenter - focusY);

        if (diff < minDiff) {
          minDiff = diff;
          bestIdx = idx;
        }
      });

      if (bestIdx !== currentIndex) {
        switchImage(bestIdx);
      }

      svcTicking = false;
    }

    window.addEventListener('scroll', () => {
      if (!svcTicking) {
        requestAnimationFrame(updateServiceImage);
        svcTicking = true;
      }
    }, { passive: true });

    // Also handle hover for desktop
    rows.forEach((row, i) => {
      const btn = row.querySelector('.svc__btn');
      if (btn) {
        row.addEventListener('mouseenter', () => {
          clearTimeout(switchTimeout);
          switchTimeout = setTimeout(() => switchImage(i), 100);
        });

        btn.addEventListener('focus', () => switchImage(i));
        btn.addEventListener('click', () => switchImage(i));
      }
    });

    switchImage(0, true); // Initialize
  }

  // 7. SMOOTH STATS COUNTER WITH INTERSECTION
  const stats = document.querySelectorAll('[data-count]');
  if (stats.length) {
    const statsObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const el = entry.target;
          const target = parseFloat(el.dataset.count);
          const decimals = parseInt(el.dataset.decimals || '0', 10);
          const suffix = el.dataset.suffix || '';
          const duration = 2000;
          const start = performance.now();

          function animate(currentTime) {
            const elapsed = currentTime - start;
            const progress = Math.min(elapsed / duration, 1);

            // Smooth easing
            const eased = 1 - Math.pow(1 - progress, 3);
            const current = target * eased;

            el.textContent = current.toLocaleString(undefined, {
              minimumFractionDigits: decimals,
              maximumFractionDigits: decimals
            }) + (progress === 1 ? suffix : '');

            if (progress < 1) {
              requestAnimationFrame(animate);
            }
          }

          requestAnimationFrame(animate);
          statsObserver.unobserve(el);
        }
      });
    }, { threshold: 0.3 });

    stats.forEach(el => statsObserver.observe(el));
  }

  // 8. SMOOTH DOORWAY QUOTE REVEAL
  const doorQuote = document.querySelector('.door__quote');
  if (doorQuote) {
    const quoteObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting && entry.intersectionRatio > 0.3) {
          entry.target.classList.add('is-lit');
        }
      });
    }, {
      threshold: [0, 0.3, 0.5],
      rootMargin: '-15% 0px -15% 0px'
    });

    quoteObserver.observe(doorQuote);
  }

  // 9. PERFORMANCE: Debounce resize events
  let resizeTimeout;
  window.addEventListener('resize', () => {
    clearTimeout(resizeTimeout);
    resizeTimeout = setTimeout(() => {
      // Recalculate any position-dependent animations
      if (stackEl) updateRailProgress();
    }, 150);
  }, { passive: true });

  console.log('✨ Enhanced smooth scroll animations loaded');
})();
