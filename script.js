const revealElements = document.querySelectorAll('.reveal');
const staggerGroups = document.querySelectorAll('.stagger');
const progress = document.querySelector('.progress');
const backdrop = document.querySelector('.backdrop');
const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

staggerGroups.forEach((group) => {
  Array.from(group.children).forEach((child, index) => {
    child.style.setProperty('--delay', `${index * 0.12}s`);
  });
});

const observer = new IntersectionObserver(
  (entries, obs) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
        obs.unobserve(entry.target);
      }
    });
  },
  { threshold: 0.2 }
);

revealElements.forEach((el) => observer.observe(el));

const scrollButtons = document.querySelectorAll('[data-scroll]');
scrollButtons.forEach((button) => {
  button.addEventListener('click', () => {
    const target = document.querySelector(button.dataset.scroll);
    if (target) {
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  });
});

const counters = document.querySelectorAll('[data-count]');
const scrubElements = document.querySelectorAll('[data-scrub]');
const mediaStack = document.querySelector('.media-stack__inner');
const heroMedia = document.querySelector('.hero__media');
const counterObserver = new IntersectionObserver(
  (entries, obs) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      const el = entry.target;
      const target = Number(el.dataset.count || 0);
      const suffix = el.dataset.suffix || '';

      if (prefersReducedMotion) {
        el.textContent = `${target}${suffix}`;
        obs.unobserve(el);
        return;
      }

      const duration = 1200;
      const start = performance.now();

      const animate = (time) => {
        const progress = Math.min((time - start) / duration, 1);
        const value = Math.floor(progress * target);
        el.textContent = `${value}${suffix}`;
        if (progress < 1) {
          requestAnimationFrame(animate);
        }
      };

      requestAnimationFrame(animate);
      obs.unobserve(el);
    });
  },
  { threshold: 0.6 }
);

counters.forEach((counter) => counterObserver.observe(counter));

const updateProgress = () => {
  if (!progress) return;
  const scrollTop = window.scrollY;
  const docHeight = document.documentElement.scrollHeight - window.innerHeight;
  const percent = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;
  progress.style.setProperty('--scroll', `${percent}%`);
};

const updateScrub = () => {
  if (prefersReducedMotion || scrubElements.length === 0) return;
  const scrollTop = window.scrollY;
  scrubElements.forEach((el) => {
    const speed = parseFloat(el.dataset.scrub || '0');
    const offset = scrollTop * speed * -0.3;
    el.style.setProperty('--scrub-y', `${offset}px`);
  });
};

const onScroll = () => {
  updateProgress();
  updateScrub();
};

window.addEventListener('scroll', onScroll, { passive: true });
onScroll();

if (backdrop && !prefersReducedMotion) {
  window.addEventListener('pointermove', (event) => {
    const x = (event.clientX / window.innerWidth - 0.5) * 12;
    const y = (event.clientY / window.innerHeight - 0.5) * 12;
    backdrop.style.setProperty('--x', `${x}px`);
    backdrop.style.setProperty('--y', `${y}px`);
  });
}

if (scrubElements.length > 0 && !prefersReducedMotion) {
  updateScrub();
}

if (heroMedia && mediaStack && !prefersReducedMotion) {
  const handleTilt = (event) => {
    const rect = heroMedia.getBoundingClientRect();
    const relX = (event.clientX - rect.left) / rect.width - 0.5;
    const relY = (event.clientY - rect.top) / rect.height - 0.5;
    const tiltX = relX * 18;
    const tiltY = relY * 18;
    mediaStack.style.setProperty('--tilt-x', `${tiltX}px`);
    mediaStack.style.setProperty('--tilt-y', `${tiltY}px`);
    mediaStack.style.setProperty('--tilt-r', `${relX * 4}deg`);
  };

  const resetTilt = () => {
    mediaStack.style.setProperty('--tilt-x', '0px');
    mediaStack.style.setProperty('--tilt-y', '0px');
    mediaStack.style.setProperty('--tilt-r', '0deg');
  };

  heroMedia.addEventListener('pointermove', handleTilt);
  heroMedia.addEventListener('pointerleave', resetTilt);
}

const form = document.querySelector('.contact-form');
if (form) {
  form.addEventListener('submit', (event) => {
    event.preventDefault();
    form.classList.add('sent');
    const button = form.querySelector('button');
    if (button) button.textContent = 'Message Sent';
  });
}
