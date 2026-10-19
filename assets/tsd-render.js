/* THE STANDARD SPORT (Vercel) — page renderer.
 *
 * Prints the same markup as the WordPress SPORT plugin (tsd-sport-skin) so the
 * plugin's own sport.css / sport.js / article.css / article.js drive this site
 * unchanged: masthead + mega menu, hero slider, Special Column, Top Stories,
 * sport banners, video hub, the Motorsport and Football hubs, and the article.
 *
 * Data comes from the files this site already ships:
 *   data/sport-posts.js     window.__TSD_POSTS__    (300 real posts)
 *   data/sport-articles.js  window.__TSD_ARTICLES__ (full bodies, article page)
 *   uploads/youtube-data.js window.__YT_LIVE__
 *   data/standings.js       window.__TSD_STANDINGS__ (snapshots of the plugin's tables)
 *   assets/tsd-menu.js      window.__TSD_MENU__      (the 8-slot menu)
 *
 * Plain JS on purpose: the markup has to be in the page before sport.js runs,
 * so each page calls TSDR.render(<page>) inline, then loads sport.js.
 */
(function () {
	'use strict';

	var POSTS = window.__TSD_POSTS__ || [];
	var BODIES = window.__TSD_ARTICLES__ || {};
	var YT = window.__YT_LIVE__ || { videos: [], shorts: [] };
	var STANDINGS = window.__TSD_STANDINGS__ || {};
	var MENU = window.__TSD_MENU__ || [];

	/* ── helpers ─────────────────────────────────────────────────────── */
	function esc(s) {
		return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) {
			return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
		});
	}
	var LABELS = { FOOTBALL: 'Football', F1: 'Motorsport', TENNIS: 'Tennis', VOLLEYBALL: 'Volleyball',
		'ASIAN GAMES': 'Asian Games', SPORT: 'Sport', ATHLETICS: 'Athletics', BOXING: 'Boxing', GOLF: 'Golf',
		CYCLING: 'Cycling', BADMINTON: 'Badminton', ESPORTS: 'Esports', BASKETBALL: 'Basketball', SWIMMING: 'Swimming' };
	function label(p) { return LABELS[p.cat] || (p.cat ? p.cat.charAt(0) + p.cat.slice(1).toLowerCase() : ''); }
	function link(p) { return 'article.html?id=' + p.id; }
	function bg(p, small) { return "url('" + (small ? (p.thumb || p.img) : p.img) + "') center/cover no-repeat"; }
	function ratio(p) { return p.ratio || '52.3%'; }
	function dotDate(p) {
		var d = new Date(p.dateISO || '');
		if (isNaN(d)) { return p.date || ''; }
		var z = function (n) { return (n < 10 ? '0' : '') + n; };
		return z(d.getDate()) + '.' + z(d.getMonth() + 1) + '.' + d.getFullYear();
	}
	function shortDate(p) {
		var d = new Date(p.dateISO || '');
		return isNaN(d) ? (p.date || '') : d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });
	}
	function byCat(cat) { return POSTS.filter(function (p) { return p.cat === cat; }); }
	/** Up to n posts from list, preferring ones not yet used on the page. */
	function take(list, n, used) {
		var fresh = list.filter(function (p) { return !used[p.id]; });
		var out = fresh.slice(0, n);
		if (out.length < n) {
			out = out.concat(list.filter(function (p) { return out.indexOf(p) < 0; }).slice(0, n - out.length));
		}
		out.forEach(function (p) { used[p.id] = true; });
		return out;
	}
	function avatar(name) {
		var ch = String(name || '?').trim().charAt(0).toUpperCase() || '?';
		var svg = '<svg xmlns="http://www.w3.org/2000/svg" width="96" height="96"><rect width="96" height="96" fill="#1a1e2c"/>' +
			'<text x="50%" y="54%" dominant-baseline="middle" text-anchor="middle" font-family="Kanit,sans-serif" font-weight="700" font-size="42" fill="#ffa5f7">' +
			esc(ch) + '</text></svg>';
		return 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svg);
	}
	var ARROW = '<span aria-hidden="true">&rarr;</span>';

	/* ── masthead ────────────────────────────────────────────────────── */
	function hrefOf(item) { return item.href || 'index.html'; }

	function masthead(opts) {
		opts = opts || {};
		var id = 900, megas = '';
		var lis = MENU.map(function (item) {
			var mine = ++id;
			var subs = (item.items || []).filter(function (s) { return !s.divider; });
			var cls = 'menu-item menu-item-' + mine + (subs.length ? ' menu-item-has-children' : '') +
				(opts.current === item.key ? ' current-menu-item' : '');
			var li = '<li id="menu-item-' + mine + '" class="' + cls + '"><a href="' + esc(hrefOf(item)) + '">' + esc(item.label) + '</a>';
			if (subs.length) {
				li += '<ul class="sub-menu">' + subs.map(function (s) {
					return '<li class="menu-item"><a href="' + esc(s.href) + '">' + esc(s.label) + '</a></li>';
				}).join('') + '</ul>';
				megas += '<div class="tsd-mega" data-tsd-mega="' + mine + '" hidden><div class="tsd-wrap tsd-mega-in">' +
					'<div class="tsd-mega-head"><a class="tsd-mega-title" href="' + esc(hrefOf(item) === '#' ? '' : hrefOf(item)) + '">' + esc(item.label) + '</a>' +
					'<a class="tsd-mega-all" href="' + esc(hrefOf(item) === '#' ? '' : hrefOf(item)) + '">ดูทั้งหมด →</a></div>' +
					'<ul class="tsd-mega-list">' + subs.map(function (s) {
						return '<li><a href="' + esc(s.href) + '">' + esc(s.label) + '</a></li>';
					}).join('') + '</ul></div></div>';
			}
			return li + '</li>';
		}).join('');

		return '<nav class="tsd-nav' + (opts.solid ? ' is-stuck' : '') + '"' + (opts.solid ? ' data-tsd-nav-solid' : '') + '>' +
			'<div class="tsd-nav-top">' +
			'<button type="button" class="tsd-burger" id="tsd-burger" aria-expanded="false" aria-controls="tsd-nav-menu" aria-label="เมนูหมวดกีฬา">' +
			'<svg class="tsd-ico-bars" viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M3 6h18M3 12h18M3 18h18"/></svg>' +
			'<svg class="tsd-ico-close" viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M18 6L6 18M6 6l12 12"/></svg>' +
			'</button>' +
			'<a class="tsd-logo" href="index.html"><img src="uploads/logo-sport-lockup.png" alt="THE STANDARD SPORT" height="52"></a>' +
			'<ul id="tsd-nav-menu" class="tsd-nav-menu">' + lis + '</ul>' + megas +
			'<button type="button" class="tsd-theme-btn" data-tsd-theme-toggle aria-label="สลับโหมดสว่าง/มืด" aria-pressed="false">' +
			'<svg class="tsd-ico-moon" viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>' +
			'<svg class="tsd-ico-sun" viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/></svg>' +
			'</button></div>' +
			(opts.progress ? '<div class="tsd-prog" id="tsd-prog"></div>' : '') +
			'</nav>';
	}

	/* ── footer ──────────────────────────────────────────────────────── */
	var SOCIAL = [
		['Facebook', 'https://www.facebook.com/thestandardsport', '<path d="M15.5 8.2h-2a1 1 0 0 0-1 1v2.3h3l-.45 3.1H12.5V22h-3.1v-7.4H7.2v-3.1h2.2V9.2A4.1 4.1 0 0 1 13.5 5h2z" fill="currentColor"/>'],
		['Instagram', 'https://www.instagram.com/thestandardsport', '<rect x="3.2" y="3.2" width="17.6" height="17.6" rx="5" fill="none" stroke="currentColor" stroke-width="1.9"/><circle cx="12" cy="12" r="4.1" fill="none" stroke="currentColor" stroke-width="1.9"/><circle cx="17.2" cy="6.9" r="1.25" fill="currentColor"/>'],
		['X', 'https://x.com/STANDARDsportth', '<path d="M4.4 3.4h4.2l4.1 5.6 4.7-5.6h2.3l-6 7.1 6.4 8.7h-4.2l-4.4-6-5 6H4.2l6.4-7.6z" fill="currentColor"/>'],
		['TikTok', 'https://www.tiktok.com/@thestandardsport', '<path d="M14.1 3.2v10.2a3.4 3.4 0 1 1-2.9-3.36" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"/><path d="M14.1 3.2c.35 2.5 1.95 4.1 4.6 4.35" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"/>'],
		['YouTube', 'https://www.youtube.com/@THESTANDARDSPORT', '<path d="M21.6 7.2a2.6 2.6 0 0 0-1.8-1.8C18.2 5 12 5 12 5s-6.2 0-7.8.4A2.6 2.6 0 0 0 2.4 7.2 27 27 0 0 0 2 12a27 27 0 0 0 .4 4.8 2.6 2.6 0 0 0 1.8 1.8c1.6.4 7.8.4 7.8.4s6.2 0 7.8-.4a2.6 2.6 0 0 0 1.8-1.8A27 27 0 0 0 22 12a27 27 0 0 0-.4-4.8zM10 15V9l5.2 3z" fill="currentColor"/>']
	];
	function footer() {
		return '<footer class="tsd-footer"><div class="tsd-wrap"><div class="tsd-footer-brand">' +
			'<img class="tsd-footer-logo" src="uploads/logo-sport-lockup.png" alt="THE STANDARD SPORT" height="46">' +
			'<p>&copy; ' + new Date().getFullYear() + ' THE STANDARD</p></div>' +
			'<nav class="tsd-social" aria-label="ช่องทางโซเชียล">' + SOCIAL.map(function (s) {
				return '<a class="tsd-social-btn" href="' + s[1] + '" target="_blank" rel="noopener noreferrer" aria-label="' + s[0] + '">' +
					'<svg viewBox="0 0 24 24" width="19" height="19" aria-hidden="true" focusable="false">' + s[2] + '</svg></a>';
			}).join('') + '</nav></div></footer>';
	}

	/* ── shared pieces ───────────────────────────────────────────────── */
	function newsCard(p, size) {
		size = size || 'l';
		return '<article class="tsd-ncard tsd-reveal is-' + size + '"><a href="' + link(p) + '"><div class="tsd-ncard-rowbody">' +
			'<div class="tsd-ncard-frame" style="padding-bottom:' + ratio(p) + '"><i style="background:' + esc(bg(p, size === 'row')) + '"></i></div>' +
			'<div class="tsd-ncard-body"><div class="tsd-ncard-kicker"><span>' + esc(label(p)) + '</span></div><h3>' + esc(p.title) + '</h3></div>' +
			'</div></a></article>';
	}
	function sectionHead(l1, l2, more, href) {
		return '<div class="tsd-head"><h2 class="tsd-headline">' + esc(l1) + (l2 ? ' <em>' + esc(l2) + '</em>' : '') + '</h2>' +
			(more ? '<a class="tsd-headnote" href="' + esc(href) + '">' + esc(more) + ' ' + ARROW + '</a>' : '') + '</div>';
	}
	function leadRow(list) {
		return '<div class="tsd-leadrow">' + newsCard(list[0], 'xl') + '<div class="tsd-leadlist">' +
			list.slice(1, 4).map(function (p) { return newsCard(p, 'row'); }).join('') + '</div></div>';
	}
	function grid(list, even) {
		return '<div class="tsd-newsgrid' + (even ? ' is-even' : '') + '">' + list.map(function (p) { return newsCard(p, 'l'); }).join('') + '</div>';
	}
	function banner(name, href, art, pos, fallback) {
		var auto = !art && fallback;
		var url = art || (fallback ? fallback.img : '');
		return '<div class="tsd-banner"><div class="tsd-banner-art' + (auto ? ' is-auto' : '') + (url ? '' : ' is-empty') + '" aria-hidden="true">' +
			(url ? '<i style="background-image:url(\'' + esc(url) + '\');background-position:' + (pos || '50% 50%') + '"></i>' : '') + '</div>' +
			'<div class="tsd-banner-panel"><span class="tsd-banner-ghost" aria-hidden="true" style="--len:' + name.length + '">' + esc(name) + '</span>' +
			'<h2 class="tsd-banner-title">' + esc(name) + '</h2></div></div>' +
			'<div class="tsd-banner-foot"><a class="tsd-headnote" href="' + esc(href) + '">ดูทั้งหมด ' + ARROW + '</a></div>';
	}

	/* ── home ────────────────────────────────────────────────────────── */
	function home() {
		var used = {};
		var heroes = take(POSTS, 4, used);
		var hero = '<header class="tsd-hero" data-tsd-slider data-tsd-slide-seconds="8"><div class="tsd-slides">' +
			heroes.map(function (p, i) {
				return '<div class="tsd-slide' + (i ? '' : ' is-active') + '" data-tsd-slide="' + i + '"' + (i ? ' aria-hidden="true"' : '') + '>' +
					'<div class="tsd-slide-bg" style="background-image:url(\'' + esc(p.img) + '\')" aria-hidden="true"></div>' +
					'<div class="tsd-wrap tsd-slide-in"><div class="tsd-slide-copy">' +
					'<p class="tsd-slide-kicker"><a href="index.html?cat=' + encodeURIComponent(String(p.cat).toLowerCase()) + '">' + esc(label(p)) + '</a></p>' +
					'<h1 class="tsd-slide-title"><a href="' + link(p) + '">' + esc(p.title) + '</a></h1>' +
					'<p class="tsd-slide-meta">เรื่อง <b>' + esc(p.author) + '</b></p>' +
					'<a class="tsd-btn" href="' + link(p) + '">อ่านเรื่องนี้ ' + ARROW + '</a>' +
					'</div></div></div>';
			}).join('') + '</div>' +
			'<button type="button" class="tsd-slidenav is-prev" data-tsd-slide-step="-1" aria-label="ข่าวก่อนหน้า"><svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M15 18l-6-6 6-6"/></svg></button>' +
			'<button type="button" class="tsd-slidenav is-next" data-tsd-slide-step="1" aria-label="ข่าวถัดไป"><svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 18l6-6-6-6"/></svg></button>' +
			'<div class="tsd-slidedots" role="tablist" aria-label="เลือกข่าวที่ปักหมุด">' + heroes.map(function (p, i) {
				return '<button type="button" class="tsd-slidedot' + (i ? '' : ' is-active') + '" role="tab" data-tsd-slide-to="' + i + '" aria-selected="' + (i ? 'false' : 'true') + '" aria-label="' + esc(p.title) + '"></button>';
			}).join('') + '</div></header>';

		// Special Column: long reads — stories with a full body on this site first.
		var withBody = POSTS.filter(function (p) { return BODIES[String(p.id)]; });
		var special = take(withBody.length >= 3 ? withBody : POSTS, 3, used);
		var spc = '<section><div class="tsd-toty-head"><h2 class="tsd-toty"><span class="tsd-toty-rib"><span>Special</span></span>' +
			'<span class="tsd-toty-holo">Column</span></h2></div><div class="tsd-spc-grid">' +
			special.map(function (p) {
				return '<article class="tsd-spc tsd-reveal"><a class="tsd-spc-link" href="' + link(p) + '">' +
					'<div class="tsd-spc-media"><div class="tsd-spc-frame" style="padding-bottom:' + ratio(p) + '"><i style="background:' + esc(bg(p)) + '"></i></div></div>' +
					'<div class="tsd-spc-body"><h3>' + esc(p.title) + '</h3></div>' +
					'<div class="tsd-spc-foot"><img class="tsd-spc-avatar" src="' + avatar(p.author) + '" alt="" width="96" height="96">' +
					'<span class="tsd-spc-who"><span class="tsd-spc-name">' + esc(p.author) + '</span></span>' +
					'<span class="tsd-spc-go" aria-hidden="true">&rarr;</span></div></a></article>';
			}).join('') + '</div></section>';

		var top = take(POSTS, 4, used);
		var topStories = '<section>' + sectionHead('Top', 'Stories', 'ดูข่าวกีฬาทั้งหมด', 'https://thestandard.co/category/news/sport/') + leadRow(top) + '</section>';

		// One block per sport, alternating the lead row and the three-up grid.
		var blocks = [
			['Motorsport', 'F1', 'motorsport.html', 'uploads/hub/isaac-maffeis-UU1txX-LtEA-unsplash.jpg', '31% 38%', 'lead'],
			['Football', 'FOOTBALL', 'football.html', 'uploads/hub/image-1024x683.jpg', '49% 18%', 'grid'],
			['Volleyball', 'VOLLEYBALL', 'index.html?cat=volleyball', 'uploads/hub/volleyball-thai-1024x683.jpg', '41% 28%', 'lead'],
			['Tennis', 'TENNIS', 'index.html?cat=tennis', '', '', 'grid']
		];
		var sportBlocks = '<section class="tsd-scoreduo is-newsonly"><div class="tsd-newscol tsd-sportblocks">' +
			blocks.map(function (b) {
				var list = byCat(b[1]);
				if (!list.length) { return ''; }
				var picks = take(list, b[5] === 'lead' ? 4 : 3, used);
				var next = list.filter(function (p) { return picks.indexOf(p) < 0; })[0] || picks[0];
				return '<div class="tsd-sportblock">' + banner(b[0], b[2], b[3], b[4], b[3] ? null : next) +
					(b[5] === 'lead' && picks.length >= 4 ? leadRow(picks) : grid(picks, true)) + '</div>';
			}).join('') + '</div></section>';

		return hero + '<main><div class="tsd-wrap tsd-wrap-flow">' + spc + topStories + sportBlocks + video() + '</div></main>';
	}

	function video() {
		var vids = YT.videos || [], shorts = YT.shorts || [];
		if (!vids.length && !shorts.length) { return ''; }
		var f = vids[0];
		var left = f ? '<div class="hub-left"><a class="tsd-yt-feature tsd-reveal" href="' + esc(f.url) + '" data-yt="' + esc(f.id) + '" data-yt-kind="video" target="_blank" rel="noopener">' +
			'<span class="tsd-yt-thumb"><img class="tsd-zoom-img" src="https://i.ytimg.com/vi/' + esc(f.id) + '/maxresdefault.jpg" data-fallback="https://i.ytimg.com/vi/' + esc(f.id) + '/hqdefault.jpg" alt="" loading="lazy" width="1280" height="720">' +
			'<span class="tsd-play" aria-hidden="true"></span></span><span class="tsd-yt-name">' + esc(f.title) + '</span></a>' +
			'<div class="hub-rows">' + vids.slice(1, 5).map(function (v) {
				return '<a class="tsd-yt-row tsd-reveal" href="' + esc(v.url) + '" data-yt="' + esc(v.id) + '" data-yt-kind="video" target="_blank" rel="noopener">' +
					'<span class="tsd-yt-thumb tsd-yt-thumb-sm"><img class="tsd-zoom-img" src="https://i.ytimg.com/vi/' + esc(v.id) + '/hqdefault.jpg" alt="" loading="lazy" width="480" height="360"><span class="tsd-play tsd-play-sm" aria-hidden="true"></span></span>' +
					'<span><span class="tsd-yt-row-name">' + esc(v.title) + '</span></span></a>';
			}).join('') + '</div></div>' : '';
		var side = shorts.length ? '<div class="hub-side"><div class="hub-shorts">' + shorts.slice(0, 6).map(function (s) {
			var thumb = 'https://i.ytimg.com/vi/' + esc(s.id) + '/frame0.jpg';
			return '<a class="tsd-short tsd-reveal" href="' + esc(s.url || ('https://www.youtube.com/shorts/' + s.id)) + '" data-yt="' + esc(s.id) + '" data-yt-kind="short" target="_blank" rel="noopener">' +
				'<span class="tsd-short-img"><img class="tsd-zoom-img" src="' + thumb + '" data-fallback="' + esc(s.thumbnail || thumb) + '" alt="" loading="lazy" width="720" height="1280"><span class="tsd-play tsd-play-sm" aria-hidden="true"></span></span>' +
				'<span class="tsd-short-title">' + esc(s.title) + '</span></a>';
		}).join('') + '</div></div>' : '';
		return '<section class="tsd-yt">' + sectionHead('Video', '', 'ดูทั้งหมด', (YT.channel && YT.channel.url ? YT.channel.url : 'https://www.youtube.com/@THESTANDARDSPORT') + '/videos') +
			'<div class="watch-hub' + (left ? ' has-videos' : '') + (side ? ' has-shorts' : '') + '">' + left + side + '</div></section>';
	}

	/* ── Motorsport hub (Race layout) ────────────────────────────────── */
	function motorsport() {
		var list = byCat('F1');
		var strip = list.slice(0, 4), rest = list.slice(4, 16);
		return '<main class="tsd-hub"><header class="tsd-hub-hero">' +
			'<picture class="tsd-hub-art"><source media="(max-width: 767px)" srcset="uploads/hub/motorsport-mobile.jpg"><img src="uploads/hub/motorsport.jpg" alt="" fetchpriority="high" decoding="async"></picture>' +
			'<div class="tsd-hub-shade" aria-hidden="true"></div><div class="tsd-hub-hero-in"><div class="tsd-hub-strip" data-tsd-hub-strip>' +
			'<div class="tsd-hub-bar"><h1 class="tsd-hub-title" data-tsd-hub-ghost><span class="tsd-hub-ghost">Motorsport</span></h1>' +
			'<div class="tsd-hub-bar-end">' +
			'<button type="button" class="tsd-hub-arr is-prev" data-tsd-hub-step="-1" aria-label="ก่อนหน้า" hidden><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"><path d="M15 18l-6-6 6-6"/></svg></button>' +
			'<button type="button" class="tsd-hub-arr is-next" data-tsd-hub-step="1" aria-label="ถัดไป" hidden><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"><path d="M9 6l6 6-6 6"/></svg></button>' +
			'</div></div>' + hubTrack(strip) + '</div></div></header>' +
			'<div class="tsd-wrap tsd-wrap-flow">' + (STANDINGS.f1 || '') +
			(rest.length ? '<section id="tsd-hub-all">' + sectionHead('All', 'Articles') + grid(rest, true) + '</section>' : '') +
			'</div></main>';
	}
	function hubTrack(list, extra) {
		return '<div class="tsd-hub-track' + (extra ? ' ' + extra : '') + '" style="--n:' + list.length + '">' + list.map(function (p) {
			return '<a class="tsd-hub-card" href="' + link(p) + '"><span class="tsd-hub-card-img" style="padding-bottom:' + ratio(p) + '"><i style="background:' + esc(bg(p)) + '"></i></span>' +
				'<span class="tsd-hub-card-title">' + esc(p.title) + '</span></a>';
		}).join('') + '</div>';
	}

	/* ── Football hub (Index layout) ─────────────────────────────────── */
	function football() {
		var list = byCat('FOOTBALL');
		var top = list.slice(0, 4), rest = list.slice(4, 40);
		var letters = 'Football'.split('').map(function (c, i) { return '<span class="ch" style="--i:' + i + '">' + esc(c) + '</span>'; }).join('');
		var mr = list.slice(0, 5);
		return '<main class="tsd-fb"><section class="tsd-fbc is-photo">' +
			'<picture class="tsd-hub-art"><img src="uploads/hub/Champions-League-Legends-Under-Lights.jpg" alt="" fetchpriority="high" decoding="async"></picture>' +
			'<span class="tsd-fbc-shade" aria-hidden="true"></span>' +
			'<h1 class="tsd-fbc-title is-one" style="--len:8"><span class="is-1" aria-hidden="true">' + letters + '</span> <span class="screen-reader-text">Football</span></h1></section>' +
			'<div class="tsd-wrap">' +
			'<section id="tsd-fb-news" class="tsd-fb-top">' + hubTrack(top, 'tsd-fb-track') + '</section>' +
			'<section id="tsd-fb-all" class="tsd-fb-body"><div class="tsd-fb-main">' +
			'<div class="tsd-fb-sh"><h2 data-tsd-fb-title data-all="ข่าวล่าสุด">ข่าวล่าสุด</h2><span class="tsd-fb-sh-r" data-tsd-fb-count data-unit="เรื่อง">' + rest.length + ' เรื่อง</span></div>' +
			'<div class="tsd-fb-grid" data-tsd-fb-grid data-step="6">' + rest.map(function (p) {
				return '<div class="tsd-fb-cell" data-f="">' + newsCard(p, 'l') + '</div>';
			}).join('') + '<p class="tsd-fb-empty" data-tsd-fb-empty' + (rest.length ? ' hidden' : '') + '>ยังไม่มีบทความเพิ่มเติมในหมวดนี้</p></div>' +
			'<div class="tsd-fb-more"><button type="button" class="tsd-fb-btn" data-tsd-fb-more hidden>โหลดเพิ่ม</button></div></div>' +
			'<aside class="tsd-fb-side">' + (STANDINGS.pl || '') +
			'<div class="tsd-fb-mr"><h3>อ่านมากที่สุด</h3>' + mr.map(function (p, i) {
				return '<a href="' + link(p) + '"><b>' + (i + 1) + '</b><span>' + esc(p.title) + ' <small>' + esc(label(p)) + ' · ' + esc(shortDate(p)) + '</small></span></a>';
			}).join('') + '</div></aside></section></div></main>';
	}

	/* ── article ─────────────────────────────────────────────────────── */
	var SHARE = {
		fb: '<svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/></svg>',
		x: '<svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.746l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>',
		line: '<svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M24 10.314C24 4.943 18.615.572 12 .572S0 4.943 0 10.314c0 4.811 4.27 8.842 10.035 9.608.391.082.923.258 1.058.59.12.301.079.766.038 1.08l-.164 1.02c-.045.301-.24 1.186 1.049.645 1.291-.539 6.916-4.078 9.436-6.975C23.176 14.393 24 12.458 24 10.314"/></svg>',
		copy: '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/></svg>'
	};
	function article() {
		var want = parseInt(new URLSearchParams(location.search).get('id'), 10);
		var p = POSTS.filter(function (x) { return x.id === want; })[0] || POSTS[0];
		if (!p) { return '<main class="tsd-wrap"><p>ไม่พบบทความ</p></main>'; }
		document.title = p.title + ' · THE STANDARD SPORT';
		var url = encodeURIComponent(p.link || location.href);
		// thestandard.co refuses cross-origin image loads, so pictures inside the
		// body go through the same image proxy the covers already use.
		var body = (BODIES[String(p.id)] || '').replace(/(<(?:img|source)\b[^>]*?\s)(src|srcset)=(["'])([^"']*)\3/gi, function (m, pre, attr, q, val) {
			if (attr.toLowerCase() === 'srcset') { return pre; }
			if (!/^https?:\/\/(www\.)?thestandard\.co\//i.test(val)) { return m; }
			return pre + 'src=' + q + 'https://wsrv.nl/?url=' + encodeURIComponent(val) + '&w=1200&output=jpg&q=82' + q;
		});
		var bodyHtml = body ||
			('<p>' + esc(p.excerpt) + '</p><p><a class="tsd-btn" href="' + esc(p.link) + '" target="_blank" rel="noopener">อ่านฉบับเต็มบน THE STANDARD ' + ARROW + '</a></p>');
		var latest = POSTS.filter(function (x) { return x.id !== p.id; }).slice(0, 4);
		var tags = p.tags || [];
		var related = POSTS.filter(function (x) {
			return x.id !== p.id && (x.tags || []).some(function (t) { return tags.indexOf(t) > -1; });
		});
		if (related.length < 3) {
			related = related.concat(POSTS.filter(function (x) { return x.id !== p.id && x.cat === p.cat && related.indexOf(x) < 0; }));
		}
		related = related.slice(0, 3);

		return '<div class="tsd-wrap"><nav class="tsd-crumb" aria-label="เส้นทาง"><a href="index.html">SPORT</a><span>/</span><span class="tsd-crumb-now">' + esc(label(p)) + '</span></nav>' +
			'<div class="tsd-shell"><article class="tsd-article">' +
			'<div class="tsd-kicker"><span class="tsd-label">' + esc(label(p)) + '</span><span class="tsd-kicker-date">' + esc(dotDate(p)) + '</span></div>' +
			'<h1 class="tsd-title">' + esc(p.title) + '</h1>' +
			'<div class="tsd-byline"><span class="tsd-avatar" aria-hidden="true">' + esc(String(p.author || '?').charAt(0).toUpperCase()) + '</span>' +
			'<div><div class="tsd-byline-name">' + esc(p.author) + '</div></div><div class="tsd-share">' +
			'<a href="https://www.facebook.com/sharer/sharer.php?u=' + url + '" target="_blank" rel="noopener" aria-label="Facebook">' + SHARE.fb + '</a>' +
			'<a href="https://twitter.com/intent/tweet?url=' + url + '&text=' + encodeURIComponent(p.title) + '" target="_blank" rel="noopener" aria-label="X">' + SHARE.x + '</a>' +
			'<a href="https://social-plugins.line.me/lineit/share?url=' + url + '" target="_blank" rel="noopener" aria-label="LINE">' + SHARE.line + '</a>' +
			'<button type="button" class="tsd-copy" data-tsd-copy="' + esc(p.link || location.href) + '" aria-label="คัดลอกลิงก์">' + SHARE.copy + '</button>' +
			'</div></div>' +
			'<figure class="tsd-lead-img"><img src="' + esc(p.img) + '" alt="" loading="eager" decoding="async"></figure>' +
			'<div class="tsd-body">' + bodyHtml + '</div>' +
			(tags.length ? '<div class="tsd-posttags">' + tags.map(function (t) {
				return '<a href="https://thestandard.co/tag/' + encodeURIComponent(t) + '/" target="_blank" rel="noopener">#' + esc(t) + '</a>';
			}).join('') + '</div>' : '') +
			'</article><aside class="tsd-aside"><div><div class="tsd-blockhead"><i></i><span>Latest</span></div>' +
			latest.map(function (x) {
				return '<a class="tsd-mini" href="' + link(x) + '"><span class="tsd-mini-img" style="background:' + esc(bg(x, true)) + '"></span>' +
					'<span><span class="tsd-label">' + esc(label(x)) + '</span><span class="tsd-mini-title">' + esc(x.title) + '</span><small>' + esc(dotDate(x)) + '</small></span></a>';
			}).join('') + '</div></aside></div></div>' +
			(related.length ? '<section class="tsd-related"><div class="tsd-wrap"><div class="tsd-blockhead"><i></i><span>Related Stories</span></div><div class="tsd-rgrid">' +
				related.map(function (x) {
					return '<a class="tsd-card tsd-reveal" href="' + link(x) + '"><span class="tsd-zoom" style="padding-bottom:' + ratio(x) + '"><span class="tsd-zoom-img" style="background:' + esc(bg(x)) + '"></span></span>' +
						'<span class="tsd-label">' + esc(label(x)) + '</span><h4>' + esc(x.title) + '</h4><small>' + esc(x.author) + ' · ' + esc(dotDate(x)) + '</small></a>';
				}).join('') + '</div></div></section>' : '');
	}

	/* ── entry ───────────────────────────────────────────────────────── */
	var PAGES = {
		home: function () { return masthead() + home() + footer(); },
		motorsport: function () { return masthead({ current: 'motorsport' }) + motorsport() + footer(); },
		football: function () { return masthead({ current: 'football' }) + football() + footer(); },
		article: function () { return masthead({ solid: true, progress: true }) + article() + footer(); }
	};
	window.TSDR = {
		render: function (page) {
			var root = document.getElementById('root');
			if (!POSTS.length) {
				root.innerHTML = '<div class="tsd-wrap" style="padding:120px 0">ไม่พบข้อมูลข่าว — รัน <code>python3 scripts/build_data.py</code> ก่อน</div>';
				return;
			}
			root.innerHTML = (PAGES[page] || PAGES.home)();
		}
	};
})();
