/* TSD Sport Skin — scroll reveal. Plain JS, no framework, no build step. */

/* The masthead floats over the cover and turns solid once the reader has left
   it behind. 40px is early enough that the bar is opaque before any content has
   scrolled under it, and late enough that it does not flicker on a nudge.
   A page with no cover under the bar ships is-stuck in the markup, so this only
   ever adds the class — it never has to decide to take it away on those. */
(function () {
	var nav = document.querySelector('.tsd-nav');
	if (!nav || nav.hasAttribute('data-tsd-nav-solid')) { return; }

	var ticking = false;
	function apply() {
		nav.classList.toggle('is-stuck', window.scrollY > 40);
		ticking = false;
	}
	function onScroll() {
		if (ticking) { return; }
		ticking = true;
		window.requestAnimationFrame(apply);
	}

	apply();
	window.addEventListener('scroll', onScroll, { passive: true });
})();

(function () {
	'use strict';

	function ready(fn) {
		if (document.readyState !== 'loading') { fn(); return; }
		document.addEventListener('DOMContentLoaded', fn);
	}

	/*
	 * YouTube serves maxresdefault (1280×720) for most uploads but not all; when it
	 * is missing the request 404s. Swap in the hqdefault URL we kept alongside it.
	 * Bound during capture because <img> error events do not bubble.
	 */
	document.addEventListener('error', function (e) {
		var img = e.target;
		if (!img || 'IMG' !== img.tagName) { return; }

		var fallback = img.getAttribute('data-fallback');
		if (fallback && img.src !== fallback) {
			img.removeAttribute('data-fallback');
			img.src = fallback;
			return;
		}

		/*
		 * A standings portrait that will not load — a Drive file whose sharing
		 * was revoked, a deleted upload. Drop it rather than leave a broken-image
		 * icon sitting in the middle of the table; the row still reads fine.
		 */
		if (img.classList.contains('tsd-avatar-img')) { img.hidden = true; }
	}, true);

	/* ── Theme toggle ──────────────────────────────────────────────────
	 * Three states: no attribute = follow the OS, "light"/"dark" = the reader
	 * has overridden it. The choice persists in localStorage and is applied by
	 * a tiny inline script in <head> so there is no flash on load.
	 */
	function currentTheme() {
		var set = document.documentElement.getAttribute('data-tsd-theme');
		if ('dark' === set || 'light' === set) { return set; }
		return (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches)
			? 'dark' : 'light';
	}

	function syncToggle() {
		var dark = 'dark' === currentTheme();
		var btns = document.querySelectorAll('[data-tsd-theme-toggle]');
		Array.prototype.forEach.call(btns, function (b) {
			b.setAttribute('aria-pressed', dark ? 'true' : 'false');
		});
	}

	document.addEventListener('click', function (e) {
		var btn = e.target.closest ? e.target.closest('[data-tsd-theme-toggle]') : null;
		if (!btn) { return; }
		var next = 'dark' === currentTheme() ? 'light' : 'dark';
		document.documentElement.setAttribute('data-tsd-theme', next);
		try { localStorage.setItem('tsdSportTheme', next); } catch (err) {}
		syncToggle();
	});

	// Follow the OS while the reader has not chosen for themselves.
	if (window.matchMedia) {
		var mq = window.matchMedia('(prefers-color-scheme: dark)');
		var onChange = function () {
			if (!document.documentElement.getAttribute('data-tsd-theme')) { syncToggle(); }
		};
		if (mq.addEventListener) { mq.addEventListener('change', onChange); }
		else if (mq.addListener) { mq.addListener(onChange); }
	}

	ready(syncToggle);

	/* ── YouTube lightbox ──────────────────────────────────────────────
	 * Links keep their real YouTube href, so middle-click, cmd/ctrl-click,
	 * "open in new tab" and no-JS visitors all still work. Only a plain
	 * left-click is intercepted and turned into an in-page player.
	 */
	var box = null;
	var frame = null;
	var lastFocus = null;

	function buildBox() {
		if (box) { return box; }

		box = document.createElement('div');
		box.className = 'tsd-lb';
		box.setAttribute('role', 'dialog');
		box.setAttribute('aria-modal', 'true');
		box.setAttribute('aria-label', 'YouTube');
		box.hidden = true;
		box.innerHTML =
			'<div class="tsd-lb-inner">' +
				'<button type="button" class="tsd-lb-close" aria-label="Close">&times;</button>' +
				'<div class="tsd-lb-stage"></div>' +
			'</div>';

		box.addEventListener('click', function (e) {
			// Backdrop click, but not clicks inside the player itself.
			if (e.target === box || e.target.classList.contains('tsd-lb-inner')) { close(); }
		});
		box.querySelector('.tsd-lb-close').addEventListener('click', close);

		document.body.appendChild(box);
		return box;
	}

	function open(id, kind) {
		buildBox();
		lastFocus = document.activeElement;

		var stage = box.querySelector('.tsd-lb-stage');
		stage.className = 'tsd-lb-stage' + ('short' === kind ? ' is-short' : '');
		stage.innerHTML = '';

		frame = document.createElement('iframe');
		// nocookie host so viewers are not tracked before they press play.
		frame.src = 'https://www.youtube-nocookie.com/embed/' + encodeURIComponent(id) +
			'?autoplay=1&rel=0&playsinline=1';
		frame.title = 'YouTube';
		frame.allow = 'accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture; web-share';
		frame.setAttribute('allowfullscreen', '');
		frame.setAttribute('referrerpolicy', 'strict-origin-when-cross-origin');
		stage.appendChild(frame);

		box.hidden = false;
		document.documentElement.classList.add('tsd-lb-open');
		box.querySelector('.tsd-lb-close').focus();
	}

	function close() {
		if (!box || box.hidden) { return; }
		box.hidden = true;
		// Dropping the iframe is what actually stops playback.
		box.querySelector('.tsd-lb-stage').innerHTML = '';
		frame = null;
		document.documentElement.classList.remove('tsd-lb-open');
		if (lastFocus && lastFocus.focus) { lastFocus.focus(); }
	}

	document.addEventListener('click', function (e) {
		var link = e.target.closest ? e.target.closest('[data-yt]') : null;
		if (!link) { return; }
		// Let the browser handle modified clicks and non-primary buttons.
		if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || (e.button && 0 !== e.button)) { return; }

		var id = link.getAttribute('data-yt');
		if (!id) { return; }

		e.preventDefault();
		open(id, link.getAttribute('data-yt-kind'));
	});

	document.addEventListener('keydown', function (e) {
		if ('Escape' === e.key || 'Esc' === e.key) { close(); }
	});

	/* ── Standings tabs ────────────────────────────────────────────────
	 * Panels are rendered server-side and hidden with [hidden], so the tables
	 * are in the page (and indexable) whether or not this script runs; without
	 * JS every panel simply shows, stacked, which is the old behaviour.
	 */
	function activateTab(tabs, panels, next) {
		tabs.forEach(function (tab, i) {
			var on = i === next;
			tab.classList.toggle('is-active', on);
			tab.setAttribute('aria-selected', on ? 'true' : 'false');
			tab.setAttribute('tabindex', on ? '0' : '-1');
		});

		panels.forEach(function (panel, i) {
			var on = i === next;
			panel.hidden = !on;
			panel.classList.toggle('is-active', on);

			// Rows inside a hidden panel never intersected, so the reveal
			// observer left them at opacity 0. Show them on first display.
			if (on) {
				Array.prototype.forEach.call(panel.querySelectorAll('.tsd-reveal'), function (el) {
					el.classList.add('in');
				});
			}
		});
	}

	ready(function () {
		Array.prototype.forEach.call(document.querySelectorAll('.tsd-tabset.is-tabbed'), function (set) {
			var tabs = Array.prototype.slice.call(set.querySelectorAll('.tsd-tab'));
			var panels = Array.prototype.slice.call(set.querySelectorAll('.tsd-panel'));
			if (tabs.length < 2 || tabs.length !== panels.length) { return; }

			tabs.forEach(function (tab, i) {
				tab.addEventListener('click', function () { activateTab(tabs, panels, i); });

				tab.addEventListener('keydown', function (e) {
					var step = 0;
					if ('ArrowRight' === e.key) { step = 1; }
					else if ('ArrowLeft' === e.key) { step = -1; }
					else if ('Home' === e.key) { step = -i; }
					else if ('End' === e.key) { step = tabs.length - 1 - i; }
					else { return; }

					e.preventDefault();
					var next = (i + step + tabs.length) % tabs.length;
					activateTab(tabs, panels, next);
					tabs[next].focus();
				});
			});
		});
	});

	/* ── Hero slider ───────────────────────────────────────────────────
	 * Every pinned slide is rendered server-side; without this script they
	 * stack and all of them stay readable. The script only decides which one
	 * is showing.
	 */
	ready(function () {
		var hero = document.querySelector('[data-tsd-slider]');
		if (!hero) { return; }

		var slides = Array.prototype.slice.call(hero.querySelectorAll('[data-tsd-slide]'));
		var dots   = Array.prototype.slice.call(hero.querySelectorAll('[data-tsd-slide-to]'));
		if (slides.length < 2) { return; }

		var at = 0;
		var timer = null;
		var paused = false;
		/* How long each pinned story holds, in seconds, set in Settings → SPORT.
		   Read off the hero itself so the markup carries the desk's choice and
		   the script keeps working with no attribute at all. Clamped here as
		   well as in PHP: a hand-edited attribute should not be able to spin
		   the slider or stop it dead. */
		var held = parseFloat(hero.getAttribute('data-tsd-slide-seconds'));
		if (!isFinite(held) || held <= 0) { held = 7; }
		var interval = Math.min(60, Math.max(2, held)) * 1000;

		function show(next) {
			at = (next + slides.length) % slides.length;

			slides.forEach(function (slide, i) {
				var on = i === at;
				slide.classList.toggle('is-active', on);
				// The inactive ones are display:none, but a screen reader that
				// ignores that still needs telling.
				if (on) { slide.removeAttribute('aria-hidden'); }
				else { slide.setAttribute('aria-hidden', 'true'); }
			});

			dots.forEach(function (dot, i) {
				dot.classList.toggle('is-active', i === at);
				dot.setAttribute('aria-selected', i === at ? 'true' : 'false');
			});
		}

		function stopAuto() {
			if (timer) {
				window.clearInterval(timer);
				timer = null;
			}
		}

		function startAuto() {
			stopAuto();
			if (paused || document.hidden) { return; }
			timer = window.setInterval(function () {
				show(at + 1);
			}, interval);
		}

		Array.prototype.forEach.call(hero.querySelectorAll('[data-tsd-slide-step]'), function (btn) {
			btn.addEventListener('click', function () {
				show(at + parseInt(btn.getAttribute('data-tsd-slide-step'), 10));
				startAuto();
			});
		});

		dots.forEach(function (dot) {
			dot.addEventListener('click', function () {
				show(parseInt(dot.getAttribute('data-tsd-slide-to'), 10));
				startAuto();
			});
		});

		hero.addEventListener('keydown', function (e) {
			if ('ArrowRight' === e.key) { e.preventDefault(); show(at + 1); startAuto(); }
			else if ('ArrowLeft' === e.key) { e.preventDefault(); show(at - 1); startAuto(); }
		});

		/*
		 * Swipe remains available on touch screens. It also resets the timer, so
		 * a reader never gets moved away from the story immediately after a
		 * deliberate swipe.
		 */
		var x0 = null, y0 = null;
		hero.addEventListener('touchstart', function (e) {
			x0 = e.touches[0].clientX;
			y0 = e.touches[0].clientY;
		}, { passive: true });

		hero.addEventListener('touchend', function (e) {
			if (null === x0) { return; }
			var dx = e.changedTouches[0].clientX - x0;
			var dy = e.changedTouches[0].clientY - y0;
			x0 = null;
			if (Math.abs(dx) > 45 && Math.abs(dx) > Math.abs(dy) * 1.5) {
				show(at + (dx < 0 ? 1 : -1));
				startAuto();
			}
		}, { passive: true });

		/* Pause while the reader is interacting with the cover via keyboard. */
		hero.addEventListener('focusin', function () { paused = true; stopAuto(); });
		hero.addEventListener('focusout', function () {
			window.setTimeout(function () {
				if (!hero.contains(document.activeElement)) { paused = false; startAuto(); }
			}, 0);
		});
		document.addEventListener('visibilitychange', startAuto);

		/*
		 * Drop the class the markup arrived with and put it back, so the first
		 * cover drifts like every other one: a transition does not run on the
		 * style a page loads with, and without this the opening slide would be
		 * the only one standing still.
		 */
		slides.forEach(function (slide) { slide.classList.remove('is-active'); });
		void hero.offsetWidth;
		show(0);
		startAuto();
	});

	/* ── Standings: paging between leagues ─────────────────────────────
	 * The card shows one league at a time. Server-side every league is printed,
	 * so without this script they simply stack — the same graceful fallback the
	 * tabs above use. The arrows only appear once there is a second league to
	 * reach, which is why they are hidden in the markup rather than here.
	 */
	ready(function () {
		var card = document.querySelector('.tsd-rankcard');
		var nav  = document.querySelector('.tsd-rank-nav');
		if (!card || !nav) { return; }

		var sets = Array.prototype.slice.call(card.querySelectorAll('.tsd-tabset'));
		if (sets.length < 2) { return; }

		var at = 0;

		function show(next) {
			at = (next + sets.length) % sets.length;

			sets.forEach(function (set, i) {
				set.hidden = i !== at;

				// Rows inside a hidden league never intersected, so the reveal
				// observer left them at opacity 0. Show them on first display.
				if (i === at) {
					Array.prototype.forEach.call(set.querySelectorAll('.tsd-reveal'), function (el) {
						el.classList.add('in');
					});
				}
			});
		}

		Array.prototype.forEach.call(nav.querySelectorAll('[data-tsd-step]'), function (btn) {
			btn.addEventListener('click', function () {
				show(at + parseInt(btn.getAttribute('data-tsd-step'), 10));
			});
		});

		nav.hidden = false;
		show(0);
	});

	ready(function () {
		var items = document.querySelectorAll('.tsd-reveal');
		if (!items.length) { return; }

		var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

		// No observer support, or the visitor asked for less motion: show everything at once.
		if (reduce || !('IntersectionObserver' in window)) {
			Array.prototype.forEach.call(items, function (el) { el.classList.add('in'); });
			return;
		}

		var io = new IntersectionObserver(function (entries) {
			entries.forEach(function (entry) {
				if (!entry.isIntersecting) { return; }
				entry.target.classList.add('in');
				io.unobserve(entry.target);
			});
		}, { threshold: 0.15, rootMargin: '0px 0px -8% 0px' });

		Array.prototype.forEach.call(items, function (el) { io.observe(el); });
	});
})();

/* ── Menu bar ─────────────────────────────────────────────────────────────
 * Two jobs, both about the same strip:
 *   • on a phone it is a list behind the burger, so it has to open and close;
 *   • on a tablet it can still be a strip wide enough to scroll, and the
 *     category being read may start off to the right of the fold.
 */
(function () {
	var menu = document.querySelector('.tsd-nav-menu');
	var burger = document.getElementById('tsd-burger');
	if (!menu) { return; }

	/* ── Open and close ───────────────────────────────────────────────── */
	if (burger) {
		var setOpen = function (open) {
			burger.setAttribute('aria-expanded', open ? 'true' : 'false');
			menu.classList.toggle('is-open', open);
		};

		burger.addEventListener('click', function () {
			setOpen(burger.getAttribute('aria-expanded') !== 'true');
		});

		// Following a link leaves the page anyway, but the panel must not still
		// be open if the browser restores this page from its back/forward cache.
		menu.addEventListener('click', function (e) {
			if (e.target.closest('a')) { setOpen(false); }
		});

		document.addEventListener('keydown', function (e) {
			if ('Escape' === e.key && 'true' === burger.getAttribute('aria-expanded')) {
				setOpen(false);
				burger.focus();
			}
		});

		document.addEventListener('click', function (e) {
			if (!e.target.closest('.tsd-nav') && 'true' === burger.getAttribute('aria-expanded')) {
				setOpen(false);
			}
		});

		// Rotating a phone can cross the breakpoint; the burger disappears and
		// would otherwise leave the strip stuck in its opened state.
		window.addEventListener('resize', function () {
			if ('none' === getComputedStyle(burger).display) { setOpen(false); }
		});
	}

	/* ── Submenus in the burger list ──────────────────────────────────
	 * The mega panel opens on hover, so on a phone it never opens at all and
	 * this list is the only route to the sub-topics. Each parent gets a
	 * chevron that expands its own group.
	 *
	 * Built here rather than in the template because it is a script-only
	 * affordance: with no JS the stylesheet leaves every group open, which is
	 * longer to scroll but never hides anything.
	 */
	(function () {
		var parents = Array.prototype.slice.call(
			menu.querySelectorAll('.menu-item-has-children')
		).filter(function (li) { return li.querySelector('.sub-menu'); });

		if (!parents.length) { return; }

		menu.classList.add('tsd-nav-js'); // Lets the CSS collapse them.

		parents.forEach(function (li) {
			var link = li.querySelector(':scope > a');
			var sub = li.querySelector(':scope > .sub-menu');
			if (!link || !sub) { return; }

			// The label and the chevron share a row so the chevron is its own
			// target instead of sitting on top of the link.
			var row = document.createElement('div');
			row.className = 'tsd-navrow';
			li.insertBefore(row, link);
			row.appendChild(link);

			var btn = document.createElement('button');
			btn.type = 'button';
			btn.className = 'tsd-navsub';
			btn.setAttribute('aria-expanded', 'false');
			btn.setAttribute('aria-label', (link.textContent || '').trim());
			btn.innerHTML = '<svg viewBox="0 0 24 24" width="16" height="16" fill="none" ' +
				'stroke="currentColor" stroke-width="2" stroke-linecap="round" ' +
				'stroke-linejoin="round"><path d="M6 9l6 6 6-6"/></svg>';
			row.appendChild(btn);

			function toggle() {
				var open = btn.getAttribute('aria-expanded') === 'true';
				btn.setAttribute('aria-expanded', open ? 'false' : 'true');
				li.classList.toggle('is-open', !open);
			}

			btn.addEventListener('click', function (e) {
				e.preventDefault();
				e.stopPropagation();
				toggle();
			});

			/*
			 * A parent whose own menu item is still a placeholder "#" has
			 * nowhere to send anybody — tapping it did nothing at all. Let it
			 * open its group instead, so no row on the phone is a dead tap.
			 */
			var href = link.getAttribute('href');
			if (!href || '#' === href) {
				link.addEventListener('click', function (e) {
					e.preventDefault();
					e.stopPropagation();
					toggle();
				});
			}
		});
	})();

	/* ── Mega panel ───────────────────────────────────────────────────────────
 * One panel per bar item, opened by the item it belongs to. The panels are
 * matched to their items by the menu item id WordPress already puts on every
 * <li> as `menu-item-<ID>`, so nothing has to be inferred from labels or
 * addresses — an item renamed in Appearance → Menus still opens its own panel.
 *
 * An item with no submenu has no panel and opens nothing.
 *
 * Wired only where hovering is real. On a phone the bar is a burger list and a
 * panel that opens on tap is a detour, so there the links do the navigating.
 */
(function () {
	var nav = document.querySelector('.tsd-nav');
	if (!nav) { return; }

	var panels = Array.prototype.slice.call(document.querySelectorAll('[data-tsd-mega]'));
	if (!panels.length) { return; }
	if (!window.matchMedia || !window.matchMedia('(hover: hover)').matches) { return; }

	var items = Array.prototype.slice.call(nav.querySelectorAll('.tsd-nav-menu > li'));
	var byId = {};
	panels.forEach(function (p) { byId[p.getAttribute('data-tsd-mega')] = p; });

	var timer;
	var open = null;
	/*
	 * A pointer always fires mouseenter before click, so by the time a click
	 * on a sport arrives its panel is already open. Without remembering that,
	 * the click would read "already open" and close the panel again — the
	 * reader would click FOOTBALL and watch its menu blink shut. The flag is
	 * set when a panel is opened and spent by the first click after it.
	 */
	var justOpened = false;

	// WordPress stamps every menu <li> with menu-item-<ID>; that id is the one
	// the panels were keyed on server-side.
	function panelFor(li) {
		var m = /(?:^|\s)menu-item-(\d+)(?:\s|$)/.exec(li.className || '');
		return m ? byId[m[1]] || null : null;
	}

	// The bar's own link for an item. On a phone the script wraps it in a row
	// with the accordion chevron, so it is not always the direct child.
	function linkIn(li) {
		return li.querySelector(':scope > a') || li.querySelector(':scope > .tsd-navrow > a');
	}

	function closeAll() {
		panels.forEach(function (p) { p.hidden = true; });
		items.forEach(function (li) {
			var a = linkIn(li);
			if (a) { a.removeAttribute('aria-expanded'); }
		});
		nav.classList.remove('is-mega');
		open = null;
		justOpened = false;
	}

	function show(li) {
		window.clearTimeout(timer);

		var panel = panelFor(li);
		if (!panel) {
			// Hovering a plain item closes whatever was open rather than leaving
			// the previous sport's panel hanging under an unrelated label.
			closeAll();
			return;
		}
		if (panel === open) { return; }

		closeAll();
		panel.hidden = false;
		var a = linkIn(li);
		if (a) { a.setAttribute('aria-expanded', 'true'); }
		nav.classList.add('is-mega');
		open = panel;
		justOpened = true;
	}

	function hide() {
		// A short grace period, so crossing the gap between the bar and the panel
		// does not close it on the way.
		timer = window.setTimeout(closeAll, 140);
	}

	items.forEach(function (li) {
		li.addEventListener('mouseenter', function () { show(li); });
		li.addEventListener('mouseleave', hide);
		li.addEventListener('focusin', function () { show(li); });
		li.addEventListener('focusout', hide);

		/*
		 * Hover (or keyboard focus) opens the panel; a click on the bar item
		 * itself goes to that page — FOOTBALL opens the football hub, the way
		 * a reader expects a menu label to behave. Only an item whose own link
		 * is a placeholder "#" has nowhere to go, so a click there toggles its
		 * panel instead of doing nothing.
		 */
		var panel = panelFor(li);
		var link = linkIn(li);
		if (!panel || !link) { return; }

		var href = link.getAttribute('href');
		if (href && '#' !== href) { return; }

		link.addEventListener('click', function (e) {
			e.preventDefault();

			// The hover that preceded this click already opened the panel;
			// spend the flag and leave it open.
			if (justOpened) { justOpened = false; return; }

			if (open === panel) { closeAll(); return; }

			show(li);
			justOpened = false;
		});
	});

	panels.forEach(function (panel) {
		panel.addEventListener('mouseenter', function () { window.clearTimeout(timer); });
		panel.addEventListener('mouseleave', hide);
		panel.addEventListener('focusin', function () { window.clearTimeout(timer); });
		panel.addEventListener('focusout', hide);
	});

	document.addEventListener('keydown', function (e) {
		if ('Escape' === e.key && open) { closeAll(); }
	});
})();

/* ── Bring the current section into view ──────────────────────────── */
	var current = menu.querySelector(
		'.current-menu-item, .current-menu-ancestor, .current-category-ancestor, .current-menu-parent'
	);
	// scrollWidth is 0 while the panel is hidden, which rules this out on a
	// phone without needing to know the breakpoint here.
	if (!current || menu.scrollWidth <= menu.clientWidth) { return; }

	var strip = menu.getBoundingClientRect();
	var item = current.getBoundingClientRect();

	// Already fully visible — leave the strip where it is.
	if (item.left >= strip.left && item.right <= strip.right) { return; }

	// Centre it when there is room on both sides; the browser clamps the rest.
	menu.scrollLeft += (item.left - strip.left) - (strip.width - item.width) / 2;
})();

/* Hub strip: arrows page the row one card at a time and only show when the
   row actually overflows — four stories on a desktop fit, so no arrows. */
(function () {
	Array.prototype.forEach.call(document.querySelectorAll('[data-tsd-hub-strip]'), function (strip) {
		var track = strip.querySelector('.tsd-hub-track');
		var prev = strip.querySelector('[data-tsd-hub-step="-1"]');
		var next = strip.querySelector('[data-tsd-hub-step="1"]');
		if (!track || !prev || !next) { return; }

		function sync() {
			var over = track.scrollWidth - track.clientWidth > 2;
			prev.hidden = next.hidden = !over;
			prev.disabled = track.scrollLeft <= 2;
			next.disabled = track.scrollLeft >= track.scrollWidth - track.clientWidth - 2;
		}
		function step(dir) {
			var card = track.querySelector('.tsd-hub-card');
			var gap = parseFloat(getComputedStyle(track).columnGap) || 0;
			track.scrollBy({ left: dir * ((card ? card.getBoundingClientRect().width : track.clientWidth) + gap), behavior: 'smooth' });
		}
		prev.addEventListener('click', function () { step(-1); });
		next.addEventListener('click', function () { step(1); });
		track.addEventListener('scroll', sync, { passive: true });
		window.addEventListener('resize', sync);
		sync();
	});
})();

/* Podium standings board: Drivers / Teams tabs, and "Show all" on a long table. */
(function () {
	Array.prototype.forEach.call(document.querySelectorAll('[data-tsd-board]'), function (board) {
		var tabs = Array.prototype.slice.call(board.querySelectorAll('.tsd-board-tab'));
		var panels = Array.prototype.slice.call(board.querySelectorAll('.tsd-board-panel'));
		function show(i, focus) {
			tabs.forEach(function (t, n) {
				var on = n === i;
				t.classList.toggle('is-active', on);
				t.setAttribute('aria-selected', on ? 'true' : 'false');
				t.tabIndex = on ? 0 : -1;
				if (panels[n]) { panels[n].hidden = !on; }
			});
			if (focus) { tabs[i].focus(); }
		}
		tabs.forEach(function (t, i) {
			t.addEventListener('click', function () { show(i, false); });
			t.addEventListener('keydown', function (e) {
				if ('ArrowRight' === e.key || 'ArrowLeft' === e.key) {
					e.preventDefault();
					show((i + ('ArrowRight' === e.key ? 1 : tabs.length - 1)) % tabs.length, true);
				}
			});
		});
		Array.prototype.forEach.call(board.querySelectorAll('[data-tsd-board-more]'), function (btn) {
			btn.addEventListener('click', function () {
				var table = btn.closest('.tsd-board-table');
				var open = table.classList.toggle('is-open');
				btn.setAttribute('aria-expanded', open ? 'true' : 'false');
				btn.querySelector('[data-open]').hidden = open;
				btn.querySelector('[data-close]').hidden = !open;
			});
		});
	});
})();

/* Hub ghost watermark: fit the outlined name to the strip's full width, and
   let it drift a few pixels against the scroll — the "kinetic" half. */
(function () {
	var title = document.querySelector('[data-tsd-hub-ghost]');
	if (!title) { return; }
	var ghost = title.querySelector('.tsd-hub-ghost');
	var still = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
	function fit() {
		title.style.fontSize = '100px';
		var w = ghost.offsetWidth;
		if (w) { title.style.fontSize = (100 * title.clientWidth / w).toFixed(2) + 'px'; }
	}
	var ticking = false;
	function drift() {
		ticking = false;
		// Capped well inside the side padding, so the first letter never
		// slides out of the frame.
		var x = Math.min((window.scrollY || 0) * 0.06, 24);
		ghost.style.setProperty('--ghost-x', (-x).toFixed(1) + 'px');
	}
	fit();
	if (document.fonts && document.fonts.ready) { document.fonts.ready.then(fit); }
	window.addEventListener('resize', fit);
	if (!still) {
		window.addEventListener('scroll', function () {
			if (!ticking) { ticking = true; requestAnimationFrame(drift); }
		}, { passive: true });
	}
})();

/* ── Sport hub · Index layout: filters, "โหลดเพิ่ม", standings tabs ───── */
(function () {
	var grid = document.querySelector('[data-tsd-fb-grid]');
	if (grid) {
		var cards = Array.prototype.slice.call(grid.querySelectorAll('.tsd-fb-cell'));
		var step = parseInt(grid.getAttribute('data-step'), 10) || 6;
		var more = document.querySelector('[data-tsd-fb-more]');
		var empty = grid.querySelector('[data-tsd-fb-empty]');
		var title = document.querySelector('[data-tsd-fb-title]');
		var count = document.querySelector('[data-tsd-fb-count]');
		var filters = document.querySelector('[data-tsd-fb-filters]');
		var cur = 'all', shown = step;

		var render = function () {
			var list = cards.filter(function (c) {
				return 'all' === cur || (' ' + c.getAttribute('data-f') + ' ').indexOf(' ' + cur + ' ') > -1;
			});
			cards.forEach(function (c) { c.hidden = true; });
			list.slice(0, shown).forEach(function (c) { c.hidden = false; });
			if (more) { more.hidden = list.length <= shown; }
			if (empty && cards.length) { empty.hidden = list.length > 0; }
			if (count) { count.textContent = list.length + ' ' + count.getAttribute('data-unit'); }
		};
		render();

		if (more) {
			more.addEventListener('click', function () { shown += step; render(); });
		}
		if (filters) {
			filters.addEventListener('click', function (e) {
				var b = e.target.closest('button');
				if (!b) { return; }
				Array.prototype.forEach.call(filters.querySelectorAll('button'), function (x) { x.classList.toggle('is-on', x === b); });
				cur = b.getAttribute('data-f');
				shown = step;
				if (title) { title.textContent = 'all' === cur ? title.getAttribute('data-all') : b.textContent; }
				render();
			});
		}
	}

	Array.prototype.forEach.call(document.querySelectorAll('[data-tsd-fb-tbl]'), function (tbl) {
		var tabs = tbl.querySelectorAll('[data-tsd-fb-tab]');
		var panes = tbl.querySelectorAll('[data-tsd-fb-pane]');
		Array.prototype.forEach.call(tabs, function (t) {
			t.addEventListener('click', function () {
				var k = t.getAttribute('data-tsd-fb-tab');
				Array.prototype.forEach.call(tabs, function (x) {
					x.classList.toggle('is-on', x === t);
					x.setAttribute('aria-selected', x === t ? 'true' : 'false');
				});
				Array.prototype.forEach.call(panes, function (p) { p.hidden = p.getAttribute('data-tsd-fb-pane') !== k; });
			});
		});
		Array.prototype.forEach.call(tbl.querySelectorAll('[data-tsd-fb-all]'), function (b) {
			b.addEventListener('click', function () {
				var pane = b.closest('[data-tsd-fb-pane]');
				var open = pane.classList.toggle('is-open');
				b.textContent = b.getAttribute(open ? 'data-less' : 'data-more');
			});
		});
	});
})();

/* ── Special Column cards: 3D tilt + holographic sheen ────────────────
 * The card leans toward the pointer (up to 8°) and the sheen in its ::after
 * follows it. Mouse and touch alike; nothing under reduced motion.
 */
(function () {
	if (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) { return; }
	var MAX = 8;
	Array.prototype.forEach.call(document.querySelectorAll('.tsd-spc-link'), function (card) {
		var raf = 0, last = null;
		var paint = function () {
			raf = 0;
			if (!last) { return; }
			var r = card.getBoundingClientRect();
			var x = Math.min(Math.max((last.clientX - r.left) / r.width, 0), 1);
			var y = Math.min(Math.max((last.clientY - r.top) / r.height, 0), 1);
			card.style.setProperty('--ry', ((x - 0.5) * 2 * MAX).toFixed(2) + 'deg');
			card.style.setProperty('--rx', ((0.5 - y) * 2 * MAX).toFixed(2) + 'deg');
			card.style.setProperty('--mx', (x * 100).toFixed(1) + '%');
			card.style.setProperty('--my', (y * 100).toFixed(1) + '%');
		};
		var move = function (e) {
			last = e;
			card.classList.add('is-tilting');
			if (!raf) { raf = requestAnimationFrame(paint); }
		};
		var reset = function () {
			last = null;
			card.classList.remove('is-tilting');
			['--rx', '--ry', '--mx', '--my'].forEach(function (k) { card.style.removeProperty(k); });
		};
		card.addEventListener('pointermove', move);
		card.addEventListener('pointerdown', move);
		card.addEventListener('pointerleave', reset);
		card.addEventListener('pointercancel', reset);
		card.addEventListener('pointerup', function (e) { if ('mouse' !== e.pointerType) { reset(); } });
	});
})();
