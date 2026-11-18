document.addEventListener('DOMContentLoaded', () => {
  const body = document.body;

  // hamburger menu
  const navToggle = document.querySelector('.nav-toggle');
  const navLinks = document.getElementById('nav-links');
  const setMenu = (open) => {
    navLinks.classList.toggle('open', open);
    navToggle.classList.toggle('open', open);
    navToggle.setAttribute('aria-expanded', String(open));
  };
  navToggle.addEventListener('click', () => setMenu(!navLinks.classList.contains('open')));
  navLinks.querySelectorAll('a').forEach((link) => {
    link.addEventListener('click', () => setMenu(false));
  });

  // highlight the nav link of the section in view
  const links = Array.from(navLinks.querySelectorAll('a'));
  if ('IntersectionObserver' in window) {
    const spy = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        links.forEach((link) => {
          const on = link.getAttribute('href') === '#' + entry.target.id;
          link.classList.toggle('active', on);
          if (on) {
            link.setAttribute('aria-current', 'page');
          } else {
            link.removeAttribute('aria-current');
          }
        });
      });
    }, { rootMargin: '-45% 0px -50% 0px' });
    document.querySelectorAll('main section[id]').forEach((section) => spy.observe(section));
  }

  // scroll reveal
  const revealItems = document.querySelectorAll('.reveal');
  if ('IntersectionObserver' in window) {
    const reveal = new IntersectionObserver((entries, obs) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          obs.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12 });
    revealItems.forEach((item) => reveal.observe(item));
  } else {
    revealItems.forEach((item) => item.classList.add('visible'));
  }

  // saved pins (heart button), remembered in this browser
  const STORE_KEY = 'keerthana-saved-pins';
  const savedCount = document.getElementById('saved-count');
  const savedPill = document.querySelector('.saved-pill');
  const readSaved = () => {
    try {
      return JSON.parse(localStorage.getItem(STORE_KEY)) || [];
    } catch (err) {
      return [];
    }
  };
  const writeSaved = (list) => {
    try {
      localStorage.setItem(STORE_KEY, JSON.stringify(list));
    } catch (err) {
      // storage not available, saving just lasts for this visit
    }
  };
  let saved = readSaved();
  const showCount = (bump) => {
    savedCount.textContent = String(saved.length);
    if (bump) {
      savedPill.classList.remove('bump');
      void savedPill.offsetWidth;
      savedPill.classList.add('bump');
    }
  };
  document.querySelectorAll('.pin').forEach((pin) => {
    const btn = pin.querySelector('.pin-save');
    const id = pin.dataset.id;
    btn.setAttribute('aria-pressed', String(saved.indexOf(id) !== -1));
    btn.addEventListener('click', () => {
      const has = saved.indexOf(id) !== -1;
      saved = has ? saved.filter((item) => item !== id) : saved.concat(id);
      btn.setAttribute('aria-pressed', String(!has));
      writeSaved(saved);
      showCount(true);
    });
  });
  showCount(false);

  // pin modal
  const modal = document.getElementById('pin-modal');
  const modalMedia = modal.querySelector('.modal-media');
  const modalTag = modal.querySelector('.pin-tag');
  const modalTitle = document.getElementById('modal-title');
  const modalDesc = modal.querySelector('.modal-desc');
  const modalExtra = modal.querySelector('.modal-extra');
  const closeBtn = modal.querySelector('.modal-close');
  let lastFocused = null;

  const openModal = (pin) => {
    const media = pin.querySelector('.pin-media');
    const copy = media.cloneNode(true);
    copy.querySelectorAll('.pin-save').forEach((btn) => btn.remove());
    const tints = Array.from(media.classList).filter((name) => name.indexOf('tint-') === 0);
    modalMedia.className = 'modal-media ' + tints.join(' ');
    modalMedia.replaceChildren(...copy.childNodes);
    modalTag.textContent = pin.querySelector('.pin-tag').textContent;
    modalTitle.textContent = pin.querySelector('.pin-open').textContent.trim();
    modalDesc.textContent = pin.querySelector('.pin-desc').textContent;
    const extra = pin.querySelector('.pin-extra');
    modalExtra.innerHTML = extra ? extra.innerHTML : '';
    lastFocused = document.activeElement;
    modal.classList.add('open');
    body.classList.add('modal-open');
    closeBtn.focus();
  };
  const closeModal = () => {
    modal.classList.remove('open');
    body.classList.remove('modal-open');
    if (lastFocused) lastFocused.focus();
  };

  document.querySelectorAll('.pin').forEach((pin) => {
    pin.querySelector('.pin-open').addEventListener('click', () => openModal(pin));
  });
  closeBtn.addEventListener('click', closeModal);
  modal.addEventListener('click', (e) => {
    if (e.target === modal) closeModal();
  });
  modal.addEventListener('keydown', (e) => {
    if (e.key === 'Tab') {
      e.preventDefault();
      closeBtn.focus();
    }
  });
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && modal.classList.contains('open')) closeModal();
  });

  // back to top
  const topBtn = document.querySelector('.back-to-top');
  window.addEventListener('scroll', () => {
    topBtn.classList.toggle('show', window.scrollY > 500);
  });
  topBtn.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });

  // footer year
  const year = document.getElementById('year');
  if (year) year.textContent = new Date().getFullYear();
});
