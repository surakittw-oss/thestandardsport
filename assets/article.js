/* TSD Sport — single article behaviour. Theme toggle, YouTube lightbox and
   scroll reveal already ship in sport.js; this only adds what an article needs. */
(function () {
	'use strict';

	function ready(fn) {
		if (document.readyState !== 'loading') { fn(); return; }
		document.addEventListener('DOMContentLoaded', fn);
	}

	/* ── Reading progress ──────────────────────────────────────────── */
	ready(function () {
		var bar = document.getElementById('tsd-prog');
		if (!bar) { return; }

		var ticking = false;
		function update() {
			var h = document.documentElement.scrollHeight - window.innerHeight;
			bar.style.width = (h > 0 ? (window.scrollY / h) * 100 : 0) + '%';
			ticking = false;
		}
		function onScroll() {
			if (ticking) { return; }
			ticking = true;
			window.requestAnimationFrame(update);
		}

		window.addEventListener('scroll', onScroll, { passive: true });
		window.addEventListener('resize', onScroll, { passive: true });
		update();
	});

	/* ── Copy link ─────────────────────────────────────────────────── */
	document.addEventListener('click', function (e) {
		var btn = e.target.closest ? e.target.closest('[data-tsd-copy]') : null;
		if (!btn) { return; }

		var url = btn.getAttribute('data-tsd-copy');
		var done = function () {
			btn.classList.add('is-done');
			window.setTimeout(function () { btn.classList.remove('is-done'); }, 1600);
		};

		// navigator.clipboard needs a secure context — a plain-http staging site
		// would otherwise silently do nothing, so keep the textarea fallback.
		if (navigator.clipboard && window.isSecureContext) {
			navigator.clipboard.writeText(url).then(done, function () {});
			return;
		}

		var field = document.createElement('textarea');
		field.value = url;
		field.setAttribute('readonly', '');
		field.style.cssText = 'position:absolute;left:-9999px';
		document.body.appendChild(field);
		field.select();
		try { document.execCommand('copy'); done(); } catch (err) {}
		document.body.removeChild(field);
	});

	/* ── Wide tables ───────────────────────────────────────────────
	 * A table pasted into the Classic Editor has no idea how narrow the
	 * article column is. Wrapping it here keeps the page from scrolling
	 * sideways as a whole.
	 */
	ready(function () {
		var tables = document.querySelectorAll('.tsd-body table');
		Array.prototype.forEach.call(tables, function (table) {
			if (table.parentNode && table.parentNode.classList.contains('tsd-tablescroll')) { return; }
			var wrap = document.createElement('div');
			wrap.className = 'tsd-tablescroll';
			table.parentNode.insertBefore(wrap, table);
			wrap.appendChild(table);
		});
	});

	/* ── Image lightbox ────────────────────────────────────────────
	 * Body images only. An image the editor wrapped in a link keeps that
	 * link — following it is what the editor asked for.
	 */
	var box = null;
	var lastFocus = null;
	var list = [];   // [{ src, alt, caption }]
	var at = 0;

	function buildBox() {
		if (box) { return box; }

		box = document.createElement('div');
		box.className = 'tsd-ilb';
		box.setAttribute('role', 'dialog');
		box.setAttribute('aria-modal', 'true');
		box.hidden = true;
		box.innerHTML =
			'<div class="tsd-ilb-bar">' +
				'<span class="tsd-ilb-count"></span>' +
				'<button type="button" class="tsd-ilb-close" aria-label="Close">&times;</button>' +
			'</div>' +
			'<button type="button" class="tsd-ilb-nav is-prev" aria-label="Previous">' +
				'<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M15 18l-6-6 6-6"/></svg>' +
			'</button>' +
			'<div class="tsd-ilb-stage"><img alt=""></div>' +
			'<button type="button" class="tsd-ilb-nav is-next" aria-label="Next">' +
				'<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M9 6l6 6-6 6"/></svg>' +
			'</button>' +
			'<div class="tsd-ilb-cap"></div>';

		box.addEventListener('click', function (e) {
			if (e.target.closest('.tsd-ilb-close')) { close(); return; }
			if (e.target.closest('.tsd-ilb-nav.is-prev')) { step(-1); return; }
			if (e.target.closest('.tsd-ilb-nav.is-next')) { step(1); return; }
			// Backdrop, or the padding around the image.
			if (e.target === box || e.target.classList.contains('tsd-ilb-stage')) { close(); }
		});

		document.body.appendChild(box);
		return box;
	}

	function render() {
		var item = list[at];
		if (!item) { return; }

		var img = box.querySelector('.tsd-ilb-stage img');
		img.src = item.src;
		img.alt = item.alt || '';

		var many = list.length > 1;
		box.querySelector('.tsd-ilb-count').textContent = many ? (at + 1) + ' / ' + list.length : '';
		box.querySelector('.tsd-ilb-cap').textContent = item.caption || '';
		Array.prototype.forEach.call(box.querySelectorAll('.tsd-ilb-nav'), function (b) {
			b.hidden = !many;
		});
	}

	function step(d) {
		if (list.length < 2) { return; }
		at = (at + d + list.length) % list.length;
		render();
	}

	function openList(items, index) {
		if (!items || !items.length) { return; }
		buildBox();
		lastFocus = document.activeElement;

		list = items;
		at = Math.max(0, Math.min(index || 0, items.length - 1));
		render();

		box.hidden = false;
		document.documentElement.classList.add('tsd-lb-open');
		box.querySelector('.tsd-ilb-close').focus();
	}

	function close() {
		if (!box || box.hidden) { return; }
		box.hidden = true;
		box.querySelector('.tsd-ilb-stage img').removeAttribute('src');
		list = [];
		document.documentElement.classList.remove('tsd-lb-open');
		if (lastFocus && lastFocus.focus) { lastFocus.focus(); }
	}

	/* Every slide of a gallery, so the lightbox can page through the album. */
	function galleryItems(fig) {
		return Array.prototype.map.call(fig.querySelectorAll('.ts-gallery-slide'), function (s) {
			return {
				src: s.currentSrc || s.src,
				alt: s.alt,
				caption: s.getAttribute('data-caption') || ''
			};
		});
	}

	document.addEventListener('click', function (e) {
		var img = e.target;
		if (!img || 'IMG' !== img.tagName) { return; }
		if (!img.closest || !img.closest('.tsd-body')) { return; }
		if (img.closest('a')) { return; } // linked by the editor — respect the link
		// Thumbnails switch the slide instead; the gallery handles those itself.
		if (img.closest('.ts-gallery-thumb')) { return; }
		if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) { return; }

		e.preventDefault();

		var fig = img.closest('[data-ts-gallery]');
		if (fig) {
			var slides = fig.querySelectorAll('.ts-gallery-slide');
			openList(galleryItems(fig), Array.prototype.indexOf.call(slides, img));
			return;
		}

		// Prefer the full-size file when WordPress gave us a srcset candidate.
		openList([{ src: img.currentSrc || img.src, alt: img.alt, caption: '' }], 0);
	});

	document.addEventListener('keydown', function (e) {
		if ('Escape' === e.key || 'Esc' === e.key) { close(); return; }
		if (!box || box.hidden) { return; }
		if ('ArrowLeft' === e.key) { step(-1); }
		if ('ArrowRight' === e.key) { step(1); }
	});

	/* ── Theme gallery slider ──────────────────────────────────────
	 * The theme renders this markup server-side but its runtime ships in a
	 * text/babel components.jsx that only the theme's own templates pull in
	 * (via ts_the_runtime_scripts(), which is not hooked to wp_footer). This
	 * template is standalone, so the arrows and thumbnails arrived dead.
	 * Driving them here keeps the article page free of React + Babel.
	 */
	function initGallery(fig) {
		if (fig.getAttribute('data-tsd-gallery-ready')) { return; }
		fig.setAttribute('data-tsd-gallery-ready', '1');

		var slides = fig.querySelectorAll('.ts-gallery-slide');
		if (!slides.length) { return; }

		// The stage is a fixed 16:10, so a landscape photo shown whole left
		// black bands at its sides. Landscapes (3:2, 4:3, 16:9) fill the frame
		// with a slight trim; portraits and squares stay whole on black.
		Array.prototype.forEach.call(slides, function (s) {
			function fit() {
				if (s.naturalWidth && s.naturalHeight) {
					s.classList.toggle('is-wide', s.naturalWidth / s.naturalHeight >= 1.3);
				}
			}
			if (s.complete) { fit(); } else { s.addEventListener('load', fit); }
		});

		var thumbs = fig.querySelectorAll('.ts-gallery-thumb');
		var count = fig.querySelector('.ts-gallery-current');
		var cap = fig.querySelector('.ts-gallery-caption');
		var prev = fig.querySelector('.ts-gallery-nav.is-prev');
		var next = fig.querySelector('.ts-gallery-nav.is-next');
		var i = 0;

		function show(n) {
			i = (n + slides.length) % slides.length;

			Array.prototype.forEach.call(slides, function (s, k) {
				s.classList.toggle('is-active', k === i);
			});

			// Slides past the first are lazy; the one being shown is wanted now.
			if (!slides[i].complete) { slides[i].setAttribute('loading', 'eager'); }
			Array.prototype.forEach.call(thumbs, function (t, k) {
				t.classList.toggle('is-active', k === i);
			});

			if (count) { count.textContent = i + 1; }
			if (cap) { cap.textContent = slides[i].getAttribute('data-caption') || ''; }

			// Keep the active thumbnail inside the strip's scroll window.
			if (thumbs[i] && thumbs[i].scrollIntoView) {
				thumbs[i].scrollIntoView({ block: 'nearest', inline: 'nearest' });
			}
		}

		if (prev) { prev.addEventListener('click', function () { show(i - 1); }); }
		if (next) { next.addEventListener('click', function () { show(i + 1); }); }

		Array.prototype.forEach.call(thumbs, function (t, k) {
			t.addEventListener('click', function () { show(k); });
		});

		// A single image needs no controls.
		if (slides.length < 2) {
			if (prev) { prev.hidden = true; }
			if (next) { next.hidden = true; }
			var strip = fig.querySelector('.ts-gallery-thumbs');
			var counter = fig.querySelector('.ts-gallery-counter');
			if (strip) { strip.hidden = true; }
			if (counter) { counter.hidden = true; }
		}

		show(0);
	}

	ready(function () {
		Array.prototype.forEach.call(
			document.querySelectorAll('.tsd-body [data-ts-gallery]'),
			initGallery
		);
	});
})();
