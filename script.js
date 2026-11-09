/**
 * ==========================================================================
 * Guide Romand — Home page script (vanilla JS, no dependencies)
 * --------------------------------------------------------------------------
 * 1. DATA       Single source of truth for professions, domains, cities and
 *               popular rankings. Add a profession / city / ranking HERE only:
 *               the search, Block 2, Block 4 and the footer update themselves.
 * 2. HELPERS    DOM + URL utilities.
 * 3. RENDERERS  Search form, shared photo card + endless slider, Block 2 (filter),
 *               Block 4, hero stage animation (GSAP), footer.
 * 4. UI         Mobile drawer, header state, reveal-on-scroll, current year.
 * ==========================================================================
 */
(function () {
  'use strict';

  /* ========================================================================
     1. DATA
     ======================================================================== */

  /** Cities / regions. Key = URL slug. */
  const CITIES = {
    lausanne:  { label: 'Lausanne' },
    geneve:    { label: 'Genève' },
    neuchatel: { label: 'Neuchâtel' },
    fribourg:  { label: 'Fribourg' },
    nyon:      { label: 'Nyon' }
  };

  /** Domains, in display order (Block 2 groups, search <optgroup>s). */
  const DOMAINS = [
    {
      id: 'juridique-finance',
      label: 'Juridique et finance',
      description: 'Pour vos questions de droit, de comptabilité et de fiscalité, à titre privé ou pour votre entreprise.'
    },
    {
      id: 'construction-renovation',
      label: 'Construction et rénovation',
      description: 'Pour construire, transformer ou entretenir votre logement ou vos locaux commerciaux.'
    },
    {
      id: 'maison-jardin',
      label: 'Maison et jardin',
      description: 'Pour aménager et entretenir vos espaces extérieurs.'
    }
  ];

  /**
   * Professions, in display order.
   * - slug:   URL segment (/avocat/, /avocat/geneve/)
   * - label:  plural display name
   * - domain: DOMAINS[].id
   * - icon:   sprite id without the "i-" prefix (see index.html)
   * - cities: city slugs that HAVE a published ranking for this profession.
   *           Only these appear in the « Ville » select.
   *           NOTE: currently filled from the popular rankings list only —
   *           complete with every published ranking before going live.
   * - image:  optional. 800×600 JPG + WebP in /images (temporary Unsplash photos,
   *           credit kept next to each). Missing images fall back to the icon panel.
   */
  const PROFESSIONS = [
    {
      slug: 'avocat',
      label: 'Avocats',
      domain: 'juridique-finance',
      icon: 'scale',
      description: "Droit du travail, de la famille, du bail ou des affaires. Trouvez l'étude adaptée à votre situation.",
      cities: ['geneve', 'neuchatel', 'fribourg'],
      image: {
        src: 'images/avocats.jpg',
        webp: 'images/avocats.webp',
        alt: "Statue de la Justice tenant une balance et une épée",
        credit: 'Photo de Tingey Injury Law Firm sur Unsplash (photo-1589829545856-d10d557cf95f)'
      }
    },
    {
      slug: 'fiduciaire',
      label: 'Fiduciaires',
      domain: 'juridique-finance',
      icon: 'calculator',
      description: 'Comptabilité, déclaration d\'impôts, salaires et TVA. Trouvez une fiduciaire pour votre ménage ou votre PME.',
      cities: ['nyon'],
      image: {
        src: 'images/fiduciaires.jpg',
        webp: 'images/fiduciaires.webp',
        alt: "Bureau avec calculatrice, carnet et graphiques financiers",
        credit: 'Photo de Jakub Żerdzicki sur Unsplash (photo-1707157284454-553ef0a4ed0d)'
      }
    },
    {
      slug: 'architecte',
      label: 'Architectes',
      domain: 'construction-renovation',
      icon: 'compass',
      description: "Construction, transformation ou rénovation. Comparez les bureaux d'architectes, de l'avant-projet au chantier.",
      cities: ['lausanne', 'geneve'],
      image: {
        src: 'images/architectes.jpg',
        webp: 'images/architectes.webp',
        alt: "Architectes annotant des plans de construction",
        credit: 'Photo de Pedro Miranda sur Unsplash (photo-1608303588026-884930af2559)'
      }
    },
    {
      slug: 'sanitaire',
      label: 'Sanitaires',
      domain: 'construction-renovation',
      icon: 'droplet',
      description: 'Installation, rénovation de salle de bains ou dépannage. Trouvez une entreprise sanitaire près de chez vous.',
      cities: ['lausanne', 'nyon'],
      image: {
        src: 'images/sanitaires.jpg',
        webp: 'images/sanitaires.webp',
        alt: "Salle de bains moderne avec vasque en pierre et miroir",
        credit: 'Photo de Peter Muniz sur Unsplash (photo-1763485956310-55f3c0e822d5)'
      }
    },
    {
      slug: 'paysagiste',
      label: 'Paysagistes',
      domain: 'maison-jardin',
      icon: 'leaf',
      description: 'Création, aménagement ou entretien de jardin. Comparez les paysagistes actifs dans votre région.',
      cities: ['lausanne'],
      image: {
        src: 'images/paysagistes.jpg',
        webp: 'images/paysagistes.webp',
        alt: "Jardin paysager avec pelouse, arbustes taillés et allée de gravier",
        credit: 'Photo de Raelle Cameron sur Unsplash (photo-1668120089662-42642838cfef)'
      }
    }
  ];

  /**
   * Most viewed rankings (Block 4), in display order.
   * Swap rankings here only — the slider renders itself from this array.
   * - metier / ville: shown as « [metier] à [ville] »; metier is also the tag on the photo
   * - url:            ranking page
   * - image:          Unsplash base URL (size/crop params are added by the renderer).
   *                   Use a different photo for every card. A local file also works,
   *                   e.g. '/images/nyon.jpg' (then it is used as-is, no srcset).
   * - alt / credit:   French alt text; photographer credit (rendered as an HTML comment)
   * - updated / companies: placeholders until real values exist
   */
  const POPULAR_RANKINGS = [
    {
      metier: "Sanitaires",
      ville: "Lausanne",
      url: "/sanitaire/lausanne/",
      image: "https://images.unsplash.com/photo-1676721310073-71135ed5b5f9",
      alt: "Le château d'Ouchy et les quais de Lausanne au bord du Léman",
      credit: "Photo de Antonio Vivace sur Unsplash (photo-1676721310073-71135ed5b5f9)",
      updated: '[date]',
      companies: '[n]'
    },
    {
      metier: "Sanitaires",
      ville: "Nyon",
      url: "/sanitaire/nyon/",
      image: "https://images.unsplash.com/photo-1570050413326-c6b702fd734b",
      alt: "Maison ancienne entourée d'arbres au-dessus du Léman, à Nyon",
      credit: "Photo de Armand Khoury sur Unsplash (photo-1570050413326-c6b702fd734b)",
      updated: '[date]',
      companies: '[n]'
    },
    {
      metier: "Paysagistes",
      ville: "Lausanne",
      url: "/paysagiste/lausanne/",
      image: "https://images.unsplash.com/photo-1630138573594-65753e243a18",
      alt: "La cathédrale de Lausanne au-dessus des toits, avec le Léman et les Alpes",
      credit: "Photo de Wassim Chouak sur Unsplash (photo-1630138573594-65753e243a18)",
      updated: '[date]',
      companies: '[n]'
    },
    {
      metier: "Fiduciaires",
      ville: "Nyon",
      url: "/fiduciaire/nyon/",
      image: "https://images.unsplash.com/photo-1631629471765-4747cff092f5",
      alt: "Pédalos et petits bateaux sur le Léman, à Nyon",
      credit: "Photo de Jonathan Ansel Moy de Vitry sur Unsplash (photo-1631629471765-4747cff092f5)",
      updated: '[date]',
      companies: '[n]'
    },
    {
      metier: "Avocats",
      ville: "Genève",
      url: "/avocat/geneve/",
      image: "https://images.unsplash.com/photo-1633022326182-1b36700bc49a",
      alt: "Le Jet d'eau de Genève au milieu du lac Léman",
      credit: "Photo de Devam Jhabak sur Unsplash (photo-1633022326182-1b36700bc49a)",
      updated: '[date]',
      companies: '[n]'
    },
    {
      metier: "Avocats",
      ville: "Neuchâtel",
      url: "/avocat/neuchatel/",
      image: "https://images.unsplash.com/photo-1743836447602-3a1d69379f2b",
      alt: "Le château de Neuchâtel dominant la vieille ville et le lac",
      credit: "Photo de William Ducret sur Unsplash (photo-1743836447602-3a1d69379f2b)",
      updated: '[date]',
      companies: '[n]'
    },
    {
      metier: "Avocats",
      ville: "Fribourg",
      url: "/avocat/fribourg/",
      image: "https://images.unsplash.com/photo-1659367612854-870c43f27c65",
      alt: "La cathédrale Saint-Nicolas et la tour de l'hôtel de ville de Fribourg",
      credit: "Photo de diana shturm sur Unsplash (photo-1659367612854-870c43f27c65)",
      updated: '[date]',
      companies: '[n]'
    },
    {
      metier: "Architectes",
      ville: "Lausanne",
      url: "/architecte/lausanne/",
      image: "https://images.unsplash.com/photo-1571504532278-0486d021fa3d",
      alt: "Vue sur les toits de Lausanne, le Léman et les Alpes",
      credit: "Photo de Mark de Jong sur Unsplash (photo-1571504532278-0486d021fa3d)",
      updated: '[date]',
      companies: '[n]'
    },
    {
      metier: "Architectes",
      ville: "Genève",
      url: "/architecte/geneve/",
      image: "https://images.unsplash.com/photo-1584200463394-bba4b2117e4d",
      alt: "Vue aérienne du pont du Mont-Blanc et de la rade de Genève",
      credit: "Photo de Xavier von Erlach sur Unsplash (photo-1584200463394-bba4b2117e4d)",
      updated: '[date]',
      companies: '[n]'
    }
  ];

  /** Display settings that matter once the catalogue grows. */
  const SETTINGS = {
    cardColors: 6,             // Block 2 card colours --card-1 … --card-6 (styles.css), used in turn
    heroCycleMs: 3800,         // hero animation: time per ranking
    filterAllId: '*',          // value of the « Tous » chip
    filterAllLabel: 'Tous',
    footerTwoColumnsFrom: 9    // footer « Métiers » list splits into 2 columns from this count
  };


  /* ========================================================================
     2. HELPERS
     ======================================================================== */

  const SVG_NS = 'http://www.w3.org/2000/svg';
  const professionBySlug = new Map(PROFESSIONS.map((p) => [p.slug, p]));

  const $ = (selector, context = document) => context.querySelector(selector);
  const prefersReducedMotion = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /** French-aware alphabetical sort on .label */
  const byLabel = (a, b) => a.label.localeCompare(b.label, 'fr', { sensitivity: 'base' });

  const professionUrl = (professionSlug) => `/${professionSlug}/`;
  const rankingUrl = (professionSlug, citySlug) => `/${professionSlug}/${citySlug}/`;

  /**
   * Tiny element builder.
   * el('a', { class: 'x', href: '/' }, 'Text', childNode)
   */
  function el(tag, attrs, ...children) {
    const node = document.createElement(tag);
    if (attrs) {
      Object.entries(attrs).forEach(([key, value]) => {
        if (value === null || value === undefined || value === false) return;
        if (key === 'class') node.className = value;
        else node.setAttribute(key, value === true ? '' : value);
      });
    }
    children.flat().forEach((child) => {
      if (child === null || child === undefined || child === false) return;
      node.append(child);
    });
    return node;
  }

  /** Decorative inline SVG icon from the sprite. */
  function icon(name) {
    const svg = document.createElementNS(SVG_NS, 'svg');
    svg.setAttribute('class', 'icon');
    svg.setAttribute('aria-hidden', 'true');
    svg.setAttribute('focusable', 'false');
    const use = document.createElementNS(SVG_NS, 'use');
    use.setAttribute('href', `#i-${name || 'briefcase'}`);
    svg.append(use);
    return svg;
  }

  /** Cities of a profession that exist in CITIES, sorted A→Z. */
  function citiesFor(profession) {
    return (profession.cities || [])
      .filter((slug) => CITIES[slug])
      .map((slug) => ({ slug, label: CITIES[slug].label }))
      .sort(byLabel);
  }

  /** Light data check in the console — helps when the catalogue grows. */
  function validateData() {
    PROFESSIONS.forEach((p) => {
      if (!DOMAINS.some((d) => d.id === p.domain)) console.warn(`[Guide Romand] Domaine inconnu pour « ${p.slug} » : ${p.domain}`);
      (p.cities || []).forEach((c) => { if (!CITIES[c]) console.warn(`[Guide Romand] Ville inconnue pour « ${p.slug} » : ${c}`); });
    });
    const seenImages = new Set();
    POPULAR_RANKINGS.forEach((r) => {
      if (!/^\/[a-z0-9-]+\/[a-z0-9-]+\/$/.test(r.url)) console.warn(`[Guide Romand] Classement populaire : URL inattendue « ${r.url} »`);
      if (seenImages.has(r.image)) console.warn(`[Guide Romand] Classement populaire : photo utilisée deux fois (${r.image})`);
      seenImages.add(r.image);
    });
  }


  /* ========================================================================
     3. RENDERERS
     ======================================================================== */

  /* ---- 3.1 Search (Block 1) -------------------------------------------- */
  function initSearch() {
    const form = $('[data-search]');
    if (!form) return;

    const metierSelect = $('[data-search-metier]', form);
    const villeSelect = $('[data-search-ville]', form);
    const villeField = $('[data-search-ville-field]', form);

    // Professions grouped by domain (<optgroup>) — stays usable at 50+ items.
    DOMAINS.forEach((domain) => {
      const items = PROFESSIONS
        .filter((p) => p.domain === domain.id && citiesFor(p).length)
        .sort(byLabel);
      if (!items.length) return;
      const group = el('optgroup', { label: domain.label });
      items.forEach((p) => group.append(el('option', { value: p.slug }, p.label)));
      metierSelect.append(group);
    });

    // Rebuild « Ville » with only the cities ranked for the chosen profession.
    function updateCities() {
      const profession = professionBySlug.get(metierSelect.value);
      const previous = villeSelect.value;

      villeSelect.length = 1; // keep the placeholder option

      if (!profession) {
        villeSelect.value = '';
        villeSelect.disabled = true;
        villeField.classList.add('is-disabled');
        return;
      }

      const cities = citiesFor(profession);
      cities.forEach((city) => villeSelect.append(el('option', { value: city.slug }, city.label)));

      villeSelect.disabled = false;
      villeField.classList.remove('is-disabled');

      if (cities.some((c) => c.slug === previous)) villeSelect.value = previous;
      else if (cities.length === 1) villeSelect.value = cities[0].slug; // only one choice: preselect it
      else villeSelect.value = '';
    }

    metierSelect.addEventListener('change', updateCities);

    // Native "required" validation runs first; submit only fires when both fields are set.
    form.addEventListener('submit', (event) => {
      event.preventDefault();
      if (!metierSelect.value || !villeSelect.value) return;
      window.location.href = rankingUrl(metierSelect.value, villeSelect.value);
    });

    // Back/forward cache can restore a selected profession: resync the cities.
    window.addEventListener('pageshow', updateCities);
    updateCities();
  }

  /* ---- 3.2 Shared: photo card + endless slider (Blocks 2 and 4) -------- */

  /** Icon of the profession behind a ranking URL (/sanitaire/lausanne/ → droplet). */
  const iconForUrl = (url) => {
    const p = professionBySlug.get(url.split('/').filter(Boolean)[0]);
    return p ? p.icon : 'briefcase';
  };

  /**
   * One photo card: square photo with a white tag, bold title, small text.
   * The whole card is one link (stretched over the card from the title).
   *  - image: { src, srcset?, sizes?, webp?, alt, credit? }
   *  - icon:  optional sprite icon shown behind the photo (while loading / if missing)
   *  - color: true → full-colour card (Block 2): the whole card is one soft colour
   *           (set by the caller), with the pill, title and text inside — no photo, no icon
   */
  function photoCard({ href, title, tag, tagIsDecorative, text, image, icon: iconName, color, attrs }) {
    if (color) {
      return el('li', { class: 'photo-card photo-card--color', ...attrs },
        tag ? el('span', { class: 'photo-card__tag', 'aria-hidden': tagIsDecorative ? 'true' : null }, tag) : null,
        el('div', { class: 'photo-card__body' },
          el('h3', { class: 'photo-card__title' },
            el('a', { class: 'photo-card__link', href, draggable: 'false' }, title)
          ),
          text ? el('p', { class: 'photo-card__meta' }, text) : null
        )
      );
    }

    const card = el('li', { class: 'photo-card', ...attrs });
    const media = el('div', { class: 'photo-card__media' });

    if (iconName) media.append(el('span', { class: 'photo-card__fallback' }, icon(iconName)));

    if (image && image.src) {
      if (image.credit) media.append(document.createComment(` ${image.credit} `));
      const img = el('img', {
        src: image.src,
        srcset: image.srcset,
        sizes: image.sizes,
        alt: image.alt || '',
        width: image.width || 600,
        height: image.height || 600,
        loading: 'lazy',
        decoding: 'async',
        draggable: 'false'
      });
      // Missing / broken photo → keep the icon (or plain panel) instead of a broken image.
      img.addEventListener('error', () => (img.closest('picture') || img).remove(), { once: true });
      media.append(image.webp
        ? el('picture', null, el('source', { type: 'image/webp', srcset: image.webp }), img)
        : img);
    }

    if (tag) media.append(el('span', { class: 'photo-card__tag', 'aria-hidden': tagIsDecorative ? 'true' : null }, tag));

    card.append(
      media,
      el('h3', { class: 'photo-card__title' },
        el('a', { class: 'photo-card__link', href, draggable: 'false' }, title)
      ),
      text ? el('p', { class: 'photo-card__meta' }, text) : null
    );
    return card;
  }

  /**
   * Endless slider. Copies of the visible cards are added before and after
   * them (hidden from screen readers, links out of the tab order but still
   * clickable). When scrolling stops, the position jumps back by exactly one
   * set width — invisible, because the copies look identical. If every card
   * already fits on screen, no copies are made and the arrows are disabled.
   * Arrows move one card at a time; mouse drag snaps to the nearest card.
   *
   * getItems() returns the real cards to loop (e.g. only the filtered ones).
   * Returns { build(index) } to rebuild after the visible cards change.
   */
  function createLoopSlider({ track, prevBtn, nextBtn, getItems, autoplay = 4500 }) {
    const slider = track.parentElement;
    const behavior = () => (prefersReducedMotion() ? 'auto' : 'smooth');

    let items = [];
    let clones = [];
    let loopOn = false;
    let stepW = 0;        // one card + gap
    let setW = 0;         // one full set of real cards
    let start = 0;        // scrollLeft where the first real card sits on the content edge
    let frontIndex = 0;   // real card on the content edge (kept across resizes)
    let lastWidth = 0;    // slider width the loop was built for
    let drag = null;
    let suppressClick = false;

    // Viewport width without the scrollbar → CSS bleeds the row exactly to the screen edges.
    const setViewportVar = () =>
      document.documentElement.style.setProperty('--vw', `${document.documentElement.clientWidth}px`);
    setViewportVar();

    function cloneCard(card) {
      const copy = card.cloneNode(true);
      copy.classList.add('is-clone');
      copy.setAttribute('aria-hidden', 'true');
      copy.querySelectorAll('a, button').forEach((n) => { n.tabIndex = -1; });
      return copy;
    }

    function currentIndex() {
      if (!loopOn || !stepW || !items.length) return 0;
      const i = Math.round((track.scrollLeft - start) / stepW);
      return ((i % items.length) + items.length) % items.length;
    }

    function updateNav() {
      const max = track.scrollWidth - track.clientWidth;
      prevBtn.disabled = !loopOn && track.scrollLeft <= 1;
      nextBtn.disabled = !loopOn && track.scrollLeft >= max - 1;
    }

    function build(index = 0) {
      clones.forEach((c) => c.remove());
      clones = [];
      items = getItems();
      lastWidth = slider.clientWidth;

      if (!items.length) { loopOn = false; track.scrollLeft = 0; updateNav(); return; }

      const gap = parseFloat(getComputedStyle(track).columnGap) || 0;
      const contentLeft = slider.getBoundingClientRect().left;
      const room = document.documentElement.clientWidth - contentLeft;    // content edge → right screen edge
      stepW = items[0].getBoundingClientRect().width + gap;
      setW = stepW * items.length;
      loopOn = items.length > 1 && setW - gap > room + 1;

      if (loopOn) {
        const copies = Math.ceil(track.clientWidth / setW) + 1;         // buffer for long swipes / drags
        const before = [];
        const after = [];
        for (let i = 0; i < copies; i++) {
          before.push(...items.map(cloneCard));
          after.push(...items.map(cloneCard));
        }
        track.prepend(...before);
        track.append(...after);
        clones = before.concat(after);
        start = items[0].offsetLeft - (contentLeft - track.getBoundingClientRect().left);
        frontIndex = index % items.length;
        track.scrollLeft = start + frontIndex * stepW;
      } else {
        start = 0;
        frontIndex = 0;
        track.scrollLeft = 0;
      }
      updateNav();
    }

    // Move back into the real set once scrolling has stopped.
    function normalize() {
      if (drag || !loopOn || slider.clientWidth !== lastWidth) return;
      let x = track.scrollLeft;
      const from = x;
      while (x < start - stepW / 2) x += setW;
      while (x >= start + setW - stepW / 2) x -= setW;
      if (x !== from) track.scrollLeft = x;
      frontIndex = currentIndex();
    }

    /* Arrows: one card at a time */
    prevBtn.addEventListener('click', () => track.scrollBy({ left: -stepW, behavior: behavior() }));
    nextBtn.addEventListener('click', () => track.scrollBy({ left: stepW, behavior: behavior() }));

    let ticking = false;
    track.addEventListener('scroll', () => {
      if (!ticking) { window.requestAnimationFrame(() => { updateNav(); ticking = false; }); ticking = true; }
    }, { passive: true });

    if ('onscrollend' in window) {
      track.addEventListener('scrollend', normalize);
    } else {
      let idle;
      track.addEventListener('scroll', () => { clearTimeout(idle); idle = setTimeout(normalize, 200); }, { passive: true });
    }

    // Card widths change between 260 px and 300 px: rebuild with the same card in front.
    let resizeFrame;
    const onResize = () => {
      cancelAnimationFrame(resizeFrame);
      resizeFrame = requestAnimationFrame(() => {
        setViewportVar();
        if (slider.clientWidth === lastWidth) { updateNav(); return; }
        build(frontIndex);
      });
    };
    window.addEventListener('resize', onResize);
    if ('ResizeObserver' in window) new ResizeObserver(onResize).observe(slider);

    /* Mouse drag (touch and trackpad already scroll natively) */
    track.addEventListener('pointerdown', (event) => {
      if (event.pointerType !== 'mouse' || event.button !== 0) return;
      drag = { id: event.pointerId, x: event.clientX, left: track.scrollLeft, moved: false };
    });

    track.addEventListener('pointermove', (event) => {
      if (!drag || event.pointerId !== drag.id) return;
      const dx = event.clientX - drag.x;
      if (!drag.moved && Math.abs(dx) > 5) {
        drag.moved = true;
        track.setPointerCapture(drag.id);
        track.classList.add('is-dragging');     // also turns snapping off while dragging
      }
      if (drag.moved) track.scrollLeft = drag.left - dx;
    });

    function endDrag() {
      if (!drag) return;
      const moved = drag.moved;
      drag = null;
      if (!moved) return;
      suppressClick = true;                     // a drag must not open the card under the cursor
      setTimeout(() => { suppressClick = false; }, 50);

      // Glide to the nearest card, then hand back to CSS scroll-snap.
      const max = track.scrollWidth - track.clientWidth;
      const target = Math.min(max, Math.max(0, start + Math.round((track.scrollLeft - start) / stepW) * stepW));
      track.scrollTo({ left: target, behavior: behavior() });
      setTimeout(() => {
        track.classList.remove('is-dragging');
        normalize();
      }, prefersReducedMotion() ? 0 : 450);
    }
    track.addEventListener('pointerup', endDrag);
    track.addEventListener('pointercancel', endDrag);
    track.addEventListener('lostpointercapture', endDrag);
    track.addEventListener('click', (event) => {
      if (suppressClick) { event.preventDefault(); event.stopPropagation(); }
    }, true);
    track.addEventListener('dragstart', (event) => event.preventDefault());

    /* Auto-loop: one card every `autoplay` ms. Stops while the pointer is over the
       cards or the arrows, while a card or arrow has keyboard focus, during a drag,
       when the slider is off screen or the tab is hidden, and never runs with
       prefers-reduced-motion (WCAG 2.2.2: moving content can be paused). */
    if (autoplay && !prefersReducedMotion()) {
      const arrows = prevBtn.parentElement;
      let hovered = false;
      let focused = false;
      let visible = false;
      let timer = null;
      const running = () => loopOn && visible && !hovered && !focused && !drag && !document.hidden;
      const tick = () => { if (running()) track.scrollBy({ left: stepW, behavior: 'smooth' }); };
      const restart = () => { clearInterval(timer); timer = setInterval(tick, autoplay); };

      [slider, arrows].forEach((zone) => {
        zone.addEventListener('pointerenter', (e) => { if (e.pointerType === 'mouse') hovered = true; });
        zone.addEventListener('pointerleave', (e) => { if (e.pointerType === 'mouse') { hovered = false; restart(); } });
        zone.addEventListener('focusin', () => { focused = true; });
        zone.addEventListener('focusout', () => { focused = false; restart(); });
      });
      [prevBtn, nextBtn].forEach((b) => b.addEventListener('click', restart));   // a manual step resets the delay
      track.addEventListener('pointerdown', restart);

      if ('IntersectionObserver' in window) {
        new IntersectionObserver(([entry]) => { visible = entry.isIntersecting; }, { threshold: 0.3 }).observe(slider);
      } else {
        visible = true;
      }
      restart();
    }

    return { build };
  }

  /* ---- 3.3 Block 2: professions — domain filter + card slider ----------- */
  function initProfessionBrowser() {
    const root = $('[data-pro-browser]');
    if (!root) return;

    const filter = $('[data-pro-filter]', root);
    const intro = $('[data-pro-intro]', root);
    const track = $('[data-slider-track]', root);
    const ALL = SETTINGS.filterAllId;

    const domainLabel = new Map(DOMAINS.map((d) => [d.id, d.label]));
    const domains = DOMAINS.filter((d) => PROFESSIONS.some((p) => p.domain === d.id));

    // Cards: DOMAINS order, then PROFESSIONS order inside each domain.
    const ordered = domains.flatMap((d) => PROFESSIONS.filter((p) => p.domain === d.id));
    const cards = ordered.map((p) => photoCard({
      href: professionUrl(p.slug),
      title: p.label,
      tag: domainLabel.get(p.domain),            // category pill, top left
      text: p.description,
      color: true,                               // full-colour card (colour set in applyFilter)
      attrs: { 'data-domain': p.domain }
    }));
    track.append(...cards);

    // Domain intros (H3 + description), only one visible at a time.
    const intros = domains.map((d) =>
      el('div', { class: 'domain-intro', 'data-domain': d.id, hidden: true },
        el('h3', { class: 'domain-intro__title' }, d.label),
        el('p', { class: 'domain-intro__desc' }, d.description)
      )
    );
    intro.append(...intros);

    // Filter chips: « Tous » + one per domain that has professions.
    const chips = [{ id: ALL, label: SETTINGS.filterAllLabel }, ...domains].map((d) =>
      el('button', {
        class: 'filter__chip',
        type: 'button',
        'aria-pressed': 'false',
        'aria-controls': track.id,
        'data-filter': d.id
      }, d.label)
    );
    filter.append(...chips);
    if (domains.length < 2) filter.hidden = true;

    const slider = createLoopSlider({
      track,
      prevBtn: $('[data-slider-prev]', root),
      nextBtn: $('[data-slider-next]', root),
      getItems: () => cards.filter((c) => !c.hidden)
    });

    let animTimer;
    function applyFilter(id, animate) {
      chips.forEach((chip) => chip.setAttribute('aria-pressed', String(chip.dataset.filter === id)));
      intros.forEach((panel) => { panel.hidden = panel.dataset.domain !== id; });

      let index = 0;
      cards.forEach((card) => {
        const show = id === ALL || card.dataset.domain === id;
        card.hidden = !show;
        if (show) card.style.setProperty('--i', index++);
      });

      // One soft colour per visible card, in turn. If the last card would get the same
      // colour as the first (where the loop wraps around), it takes a different one.
      const shown = cards.filter((c) => !c.hidden);
      const n = SETTINGS.cardColors;
      shown.forEach((card, i) => {
        let c = i % n;
        if (i === shown.length - 1 && shown.length > 1 && c === 0) c = Math.floor(n / 2);
        card.style.setProperty('--card-bg', `var(--card-${c + 1})`);
      });

      slider.build(0);

      // Short staggered fade-in of the new set (CSS skips it with reduced motion).
      if (animate) {
        track.classList.remove('is-animating');
        void track.offsetWidth; // restart the animation
        track.classList.add('is-animating');
        clearTimeout(animTimer);
        animTimer = setTimeout(() => track.classList.remove('is-animating'), 600 + index * 50);
      }
    }

    filter.addEventListener('click', (event) => {
      const chip = event.target.closest('[data-filter]');
      if (!chip || chip.getAttribute('aria-pressed') === 'true') return;
      applyFilter(chip.dataset.filter, true);
      chip.scrollIntoView({ block: 'nearest', inline: 'nearest', behavior: prefersReducedMotion() ? 'auto' : 'smooth' });
    });

    applyFilter(ALL, false);
  }

  /* ---- 3.4 Block 4: popular rankings — photo slider ---------------------- */

  /** Unsplash URLs get square crops at 3 sizes; local files are used as-is. */
  function rankingImage(src) {
    if (!/^https:\/\/images\.unsplash\.com\//.test(src)) return { src };
    const at = (w) => `${src}?auto=format&fit=crop&w=${w}&h=${w}&q=75`;
    return {
      src: at(600),
      srcset: `${at(300)} 300w, ${at(600)} 600w, ${at(900)} 900w`,
      sizes: '(min-width: 640px) 300px, 260px'
    };
  }

  function initRankings() {
    const root = $('[data-rank-slider]');
    const track = $('[data-rank-track]', root || document);
    if (!root || !track) return;

    const cards = POPULAR_RANKINGS.map((r) => photoCard({
      href: r.url,
      title: `${r.metier} à ${r.ville}`,
      tag: r.metier,
      tagIsDecorative: true,                     // the title already says the profession
      text: `Mis à jour le ${r.updated} · ${r.companies} entreprises analysées`,
      image: { ...rankingImage(r.image), alt: r.alt, credit: r.credit }
    }));
    track.append(...cards);

    createLoopSlider({
      track,
      prevBtn: $('[data-rank-prev]', root),
      nextBtn: $('[data-rank-next]', root),
      getItems: () => cards
    }).build(0);
  }

  /* ---- 3.6 Hero stage: animated journey (GSAP 3.12.5) ---------------------
   * One 10-second GSAP timeline, repeated forever, built from the spec below
   * (no hand-written tweens). Each track animates one element ([data-hs="…"])
   * through keyframes [time in s, value, ease?]. The first key of every track
   * is at 0 s, so every element gets its start value at the start of each loop.
   * Props: o = opacity · x / y = move (design px) · s = scale · sx = scaleX ·
   *        draw = SVG stroke drawn (0 → 1) · type = text typed letter by letter (0 → 1).
   * Retime a scene by editing its numbers here; nothing else needs to change.
   * ------------------------------------------------------------------------ */
  const HERO_STAGE_SPEC = (() => {
    const tracks = [];
    const add = (target, prop, keys) => tracks.push({ target, prop, keys });

    // Scene 1 — the search (0–2.7 s). Fades back in during the reset (8.8–10 s).
    add('s1', 'o', [[0, 1], [2.7, 1], [3.0, 0, 'power2.inOut'], [8.8, 0], [10, 1, 'power2.out']]);
    add('s1', 'y', [[0, 0], [2.7, 0], [3.0, -14, 'power2.inOut'], [8.8, 14], [10, 0, 'power3.out']]);
    //   « Tous » active → domain chip active once the profession is typed (0.9–1.15 s).
    //   Keys at 8.79/8.8 reset the scene while it is invisible, before it fades back in.
    add('all-on', 'o', [[0, 1], [0.9, 1], [1.15, 0, 'power2.out'], [8.79, 0], [8.8, 1]]);
    add('dom-on', 'o', [[0, 0], [0.9, 0], [1.15, 1, 'power2.out'], [8.79, 1], [8.8, 0]]);
    //   Métier typed 0.45–1.0 s, Ville typed 1.15–1.6 s.
    add('m-ph', 'o', [[0, 1], [0.4, 1], [0.45, 0], [8.79, 0], [8.8, 1]]);
    add('m-text', 'type', [[0, 0], [0.45, 0], [1.0, 1], [8.79, 1], [8.8, 0]]);
    add('m-caret', 'o', [[0, 0], [0.4, 0], [0.41, 1], [1.05, 1], [1.06, 0]]);
    add('v-ph', 'o', [[0, 1], [1.1, 1], [1.15, 0], [8.79, 0], [8.8, 1]]);
    add('v-text', 'type', [[0, 0], [1.15, 0], [1.6, 1], [8.79, 1], [8.8, 0]]);
    add('v-caret', 'o', [[0, 0], [1.1, 0], [1.11, 1], [1.75, 1], [1.76, 0]]);
    //   Soft press on « Voir le classement » (1.95–2.25 s).
    add('btn', 's', [[0, 1], [1.95, 1], [2.08, 0.97, 'power2.out'], [2.25, 1, 'power2.out']]);

    // Scene 2 — comparing (2.7–4.8 s): slides in from y 14, out to y -14.
    add('s2', 'o', [[0, 0], [2.75, 0], [3.1, 1, 'power2.out'], [4.8, 1], [5.1, 0, 'power2.inOut']]);
    add('s2', 'y', [[0, 14], [2.75, 14], [3.1, 0, 'power3.out'], [4.8, 0], [5.1, -14, 'power2.inOut']]);
    add('progress', 'sx', [[0, 0], [3.0, 0], [4.4, 1, 'power2.inOut']]);       // line under the title
    for (let i = 0; i < 5; i++) {                                               // 5 criteria, 0.2 s apart
      const t = 3.0 + i * 0.2;
      add(`c${i + 1}`, 'o', [[0, 0], [t, 0], [t + 0.4, 1, 'power3.out']]);
      add(`c${i + 1}`, 'y', [[0, 16], [t, 16], [t + 0.4, 0, 'power3.out']]);
      add(`k${i + 1}`, 'draw', [[0, 0], [t + 0.25, 0], [t + 0.55, 1, 'power2.out']]);   // check mark
    }

    // Scene 3 — the ranking (4.8–9.3 s). Finished by 7.5 s; still frame = 8.0 s.
    add('s3', 'o', [[0, 0], [4.85, 0], [5.2, 1, 'power2.out'], [8.8, 1], [9.4, 0, 'power2.inOut']]);
    add('s3', 'y', [[0, 14], [4.85, 14], [5.2, 0, 'power3.out']]);
    for (let i = 0; i < 5; i++) {                                               // Top 5 rows, 0.12 s apart
      const t = 5.15 + i * 0.12;
      add(`r${i + 1}`, 'o', [[0, 0], [t, 0], [t + 0.4, 1, 'power3.out']]);
      add(`r${i + 1}`, 'x', [[0, -12], [t, -12], [t + 0.4, 0, 'power3.out']]);
    }
    add('tint', 'o', [[0, 0], [5.75, 0], [6.1, 1, 'power2.out']]);              // row 1 tint
    add('marker', 'o', [[0, 0], [5.75, 0], [5.9, 1]]);                          // amber rank marker
    add('marker', 's', [[0, 0.6], [5.75, 0.6], [6.15, 1, 'back.out(1.6)']]);
    [['chipA', 6.1], ['chipB', 6.3], ['chipC', 6.5]].forEach(([chip, t]) => {    // trust chips
      add(chip, 'o', [[0, 0], [t, 0], [t + 0.45, 1, 'power3.out']]);
      add(chip, 'y', [[0, 14], [t, 14], [t + 0.45, 0, 'power3.out']]);
    });
    add('caption', 'o', [[0, 0], [7.0, 0], [7.5, 1, 'power2.out']]);
    add('caption', 'y', [[0, 6], [7.0, 6], [7.5, 0, 'power2.out']]);

    return {
      duration: 10,      // loop length (s)
      still: 8.0,        // frame shown with reduced motion / no JS
      nextSearchAt: 8.8, // scene 1 switches to the next ranking (while invisible)
      nextCardsAt: 0.05, // scenes 2–3 switch to it at the start of the next loop
      tracks
    };
  })();

  function initHeroStage() {
    const stage = $('[data-hero-stage]');
    if (!stage) return;

    const reduced = prefersReducedMotion();
    if (reduced || typeof window.gsap === 'undefined' || !POPULAR_RANKINGS.length) {
      stage.classList.add('is-still');           // CSS still frame (8.0 s) of « Avocats à Genève »
      return;
    }

    /* Rankings in loop order, starting with « Avocats à Genève ». */
    const startAt = Math.max(0, POPULAR_RANKINGS.findIndex((r) => r.metier === 'Avocats' && r.ville === 'Genève'));
    const order = POPULAR_RANKINGS.map((_, i) => POPULAR_RANKINGS[(startAt + i) % POPULAR_RANKINGS.length]);
    const domainOf = (r) => {
      const p = professionBySlug.get(r.url.split('/').filter(Boolean)[0]);
      const d = p && DOMAINS.find((x) => x.id === p.domain);
      return d ? d.label : '';
    };
    const all = (sel) => stage.querySelectorAll(sel);
    const hs = (name) => all(`[data-hs="${name}"]`);

    let current = 0;      // ranking shown by scenes 2–3
    let pending = null;   // ranking already shown by scene 1, waiting for scenes 2–3

    function showSearch(i) {
      const r = order[i];
      hs('m-text').forEach((n) => { n.dataset.full = r.metier; });
      hs('v-text').forEach((n) => { n.dataset.full = r.ville; });
      all('[data-hs-domain]').forEach((n) => { n.textContent = domainOf(r); });
    }
    function showCards(i) {
      const r = order[i];
      all('[data-hs-title]').forEach((n) => { n.textContent = `${r.metier} à ${r.ville}`; });
      all('[data-hs-icon]').forEach((n) => n.replaceChildren(icon(iconForUrl(r.url))));
    }

    /* Build the timeline from the spec. */
    const PROP = { o: 'opacity', x: 'x', y: 'y', s: 'scale', sx: 'scaleX', draw: 'strokeDashoffset', type: 'p' };
    const tl = gsap.timeline({ repeat: -1, paused: true });
    const typers = [];

    HERO_STAGE_SPEC.tracks.forEach(({ target, prop, keys }) => {
      const els = hs(target);
      if (!els.length) return;
      const key = PROP[prop];
      let tgt = els;
      let value = (v) => v;
      if (prop === 'draw') value = (v) => 1 - v;                 // pathLength 1: offset 1 = hidden
      if (prop === 'type') { tgt = { p: 0, els }; typers.push(tgt); }

      tl.set(tgt, { [key]: value(keys[0][1]) }, keys[0][0]);     // start value, every loop
      for (let k = 1; k < keys.length; k++) {
        const t0 = keys[k - 1][0];
        const [t, v, ease = 'power2.out'] = keys[k];
        tl.to(tgt, { [key]: value(v), duration: Math.max(0, t - t0), ease: prop === 'type' ? 'none' : ease, immediateRender: false }, t0);
      }
    });
    tl.set({}, {}, HERO_STAGE_SPEC.duration);                    // exact loop length

    const renderTypes = () => typers.forEach(({ p, els }) => els.forEach((n) => {
      const full = n.dataset.full || '';
      n.textContent = full.slice(0, Math.round(p * full.length));
    }));
    tl.eventCallback('onUpdate', renderTypes);

    // Next ranking: scene 1 picks it up while invisible (8.8 s), scenes 2–3 at the next loop start.
    tl.call(() => { pending = (current + 1) % order.length; showSearch(pending); }, null, HERO_STAGE_SPEC.nextSearchAt);
    tl.call(() => { if (pending !== null) { current = pending; pending = null; showCards(current); } }, null, HERO_STAGE_SPEC.nextCardsAt);

    showSearch(0);
    showCards(0);
    tl.seek(0, true);
    renderTypes();

    // Only run while the stage is on screen.
    if ('IntersectionObserver' in window) {
      new IntersectionObserver(([entry]) => (entry.isIntersecting ? tl.play() : tl.pause()), { threshold: 0.05 }).observe(stage);
    } else {
      tl.play();
    }
  }

  /* ---- 3.7 Footer « Métiers » ------------------------------------------- */
  function initFooterProfessions() {
    const list = $('[data-footer-professions]');
    if (!list) return;
    list.replaceChildren(...PROFESSIONS.map((p) =>
      el('li', null, el('a', { href: professionUrl(p.slug) }, p.label))
    ));
    list.classList.toggle('is-multi', PROFESSIONS.length >= SETTINGS.footerTwoColumnsFrom);
  }


  /* ========================================================================
     4. UI
     ======================================================================== */

  /* ---- 4.1 Mobile navigation: slide-in drawer ----------------------- */
  function initDrawer() {
    const drawer = $('[data-drawer]');
    const openBtn = $('[data-drawer-open]');
    if (!drawer || !openBtn) return;

    const panel = $('.drawer__panel', drawer);
    const desktop = window.matchMedia('(min-width: 960px)');
    const background = ['.site-header', 'main', '.site-footer'].map((sel) => $(sel)).filter(Boolean);
    let closeTimer;

    // Profession links follow PROFESSIONS (same order as the footer).
    const proList = $('[data-drawer-professions]', drawer);
    if (proList) {
      proList.replaceChildren(...PROFESSIONS.map((p) =>
        el('li', null, el('a', { class: 'drawer__link', href: professionUrl(p.slug) }, icon(p.icon), p.label))
      ));
    }

    const focusables = () => [...panel.querySelectorAll('a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])')]
      .filter((n) => n.offsetParent !== null);

    function open() {
      clearTimeout(closeTimer);
      // Lock page scroll without a layout jump (desktop browsers with a classic scrollbar).
      document.documentElement.style.setProperty('--scrollbar-w', `${window.innerWidth - document.documentElement.clientWidth}px`);
      document.documentElement.classList.add('is-scroll-locked');
      drawer.hidden = false;
      background.forEach((n) => { n.inert = true; });          // page behind: not focusable, not clickable
      openBtn.setAttribute('aria-expanded', 'true');
      requestAnimationFrame(() => {
        drawer.classList.add('is-open');
        $('.drawer__close', drawer).focus();
      });
    }

    function close({ returnFocus = true } = {}) {
      if (drawer.hidden) return;
      drawer.classList.remove('is-open');
      openBtn.setAttribute('aria-expanded', 'false');
      background.forEach((n) => { n.inert = false; });
      document.documentElement.classList.remove('is-scroll-locked');
      closeTimer = setTimeout(() => { drawer.hidden = true; }, prefersReducedMotion() ? 0 : 350);
      if (returnFocus) openBtn.focus();
    }

    openBtn.addEventListener('click', open);

    // × button, dimmed page, or any link inside closes it.
    drawer.addEventListener('click', (event) => {
      if (event.target.closest('[data-drawer-close]')) close();
      else if (event.target.closest('a[href]')) close({ returnFocus: false });
    });

    // Esc closes; Tab / Shift+Tab stay inside the panel.
    drawer.addEventListener('keydown', (event) => {
      if (event.key === 'Escape') { event.preventDefault(); close(); return; }
      if (event.key !== 'Tab') return;
      const items = focusables();
      if (!items.length) return;
      const first = items[0];
      const last = items[items.length - 1];
      if (event.shiftKey && (document.activeElement === first || document.activeElement === panel)) {
        event.preventDefault(); last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault(); first.focus();
      }
    });

    // Switching to the desktop layout closes it.
    desktop.addEventListener('change', (event) => { if (event.matches) close({ returnFocus: false }); });
  }

  /* ---- 4.2 Header hairline once the page scrolls ------------------------ */
  function initHeader() {
    const header = $('[data-header]');
    if (!header) return;
    let ticking = false;
    const update = () => {
      header.classList.toggle('is-scrolled', window.scrollY > 8);
      ticking = false;
    };
    window.addEventListener('scroll', () => {
      if (!ticking) { window.requestAnimationFrame(update); ticking = true; }
    }, { passive: true });
    update();
  }

  /* ---- 4.3 Reveal on scroll (skipped with prefers-reduced-motion) ------- */
  function initReveal() {
    const items = document.querySelectorAll('[data-reveal]');
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (reduced || !('IntersectionObserver' in window)) {
      items.forEach((item) => item.classList.add('is-visible'));
      return;
    }

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('is-visible');
        observer.unobserve(entry.target);
      });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.08 });

    items.forEach((item) => observer.observe(item));
  }

  /* ---- 4.4 FAQ: one question open at a time, smooth height animation -----
     Native <details name="faq"> already keeps one open without JS (no animation).
     With JS the `name` is removed and each open/close animates the item's height
     (Web Animations API). Reduced motion: instant toggle, same one-open rule. */
  function initFaq() {
    const items = [...document.querySelectorAll('.faq__item')];
    if (!items.length) return;
    const DURATION = 380;
    const EASING = 'cubic-bezier(0.2, 0.7, 0.2, 1)';
    const running = new Map();   // item → current Animation

    const summaryOf = (item) => item.querySelector('summary');
    const canAnimate = () => !prefersReducedMotion() && typeof Element.prototype.animate === 'function';

    function animateHeight(item, from, to, done) {
      const prev = running.get(item);
      if (prev) prev.cancel();
      item.classList.add('is-animating');
      const anim = item.animate({ height: [`${from}px`, `${to}px`] }, { duration: DURATION, easing: EASING });
      running.set(item, anim);
      const settle = () => {                         // ignore events from an animation already replaced
        if (running.get(item) !== anim) return false;
        running.delete(item);
        item.classList.remove('is-animating');
        return true;
      };
      anim.onfinish = () => { if (settle() && done) done(); };
      anim.oncancel = settle;
    }

    function close(item) {
      if (!item.open || item.dataset.closing) return;
      if (!canAnimate()) { item.open = false; return; }
      const from = item.offsetHeight;
      const to = summaryOf(item).offsetHeight;
      item.dataset.closing = '1';
      animateHeight(item, from, to, () => { item.open = false; delete item.dataset.closing; });
    }

    function open(item) {
      items.forEach((other) => { if (other !== item) close(other); });   // one open at a time
      if (item.dataset.closing) {                    // re-opened while closing: grow back from where it is
        const from = item.offsetHeight;
        const closing = running.get(item);
        running.delete(item);
        if (closing) closing.cancel();
        delete item.dataset.closing;
        animateHeight(item, from, item.offsetHeight);
        return;
      }
      if (item.open) return;
      if (!canAnimate()) { item.open = true; return; }
      const from = item.offsetHeight;
      item.open = true;
      const to = item.offsetHeight;
      animateHeight(item, from, to);
    }

    items.forEach((item) => {
      item.removeAttribute('name');                  // JS handles the one-open rule (so closing can animate)
      summaryOf(item).addEventListener('click', (e) => {
        e.preventDefault();                          // also covers Enter / Space on the summary
        if (item.open && !item.dataset.closing) close(item);
        else open(item);
      });
    });
  }

  /* ---- 4.5 Contact form (contact page) ----------------------------------
     · ?sujet=question|erreur|evaluation|correction preselects the subject
       (links from the other pages use these).
     · Extra fields appear only for their subjects, and are disabled otherwise
       so they are not sent.
     · Static front end: a valid form shows the confirmation message. In
       WordPress, connect the form to the real handler (e.g. Elementor Pro Form). */
  function initContactForm() {
    const form = $('[data-contact-form]');
    if (!form) return;
    const subject = $('[data-contact-sujet]', form);
    const success = $('[data-contact-success]');
    const extras = [...form.querySelectorAll('[data-contact-extra]')];

    function syncExtras() {
      extras.forEach((box) => {
        const on = box.dataset.contactExtra.split(' ').includes(subject.value);
        box.hidden = !on;
        box.querySelectorAll('input, select, textarea').forEach((field) => { field.disabled = !on; });
      });
    }

    const preset = new URLSearchParams(window.location.search).get('sujet');
    if (preset && [...subject.options].some((o) => o.value === preset)) subject.value = preset;
    subject.addEventListener('change', syncExtras);
    syncExtras();

    form.addEventListener('submit', (event) => {
      event.preventDefault();
      if (!form.checkValidity()) {
        form.reportValidity();               // native messages, in the visitor's browser language
        return;
      }
      form.hidden = true;
      if (success) {
        success.hidden = false;
        success.focus();
      }
    });
  }

  /* ---- 4.6 Current year in the footer ---------------------------------- */
  function initYear() {
    const year = $('[data-year]');
    if (year) year.textContent = String(new Date().getFullYear());
  }


  /* ========================================================================
     INIT (script is loaded with "defer": the DOM is ready)
     ======================================================================== */
  validateData();
  initSearch();
  initProfessionBrowser();
  initRankings();
  initHeroStage();
  initFooterProfessions();
  initDrawer();
  initHeader();
  initReveal();
  initFaq();
  initContactForm();
  initYear();
})();
