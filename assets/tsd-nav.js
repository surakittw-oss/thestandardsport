/* THE STANDARD SPORT — แถบเมนูที่ทุกหน้าใช้ร่วมกัน (JSX, แปลงด้วย Babel standalone)
   เดิมโค้ดชุดนี้ถูกคัดลอกไว้ทั้งใน index.html และ article.html ทำให้แก้ดีไซน์
   ทีหนึ่งต้องไล่แก้สองที่ ตอนนี้อยู่ไฟล์เดียว สองหน้าโหลดไฟล์นี้เหมือนกัน
   รายการเมนูยังมาจาก assets/tsd-menu.js เช่นเดิม */

const IconMoon = () => <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>;
const IconSun  = () => <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round"><circle cx="12" cy="12" r="5"/><path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"/></svg>;

// ไม่ใส่ความสูงมาก็ปล่อยให้ CSS ของที่ที่มันไปวางเป็นคนกำหนด
// (เดิม default 26px เป็น inline style ซึ่งทับกฎใน tsd-core.css เสมอ)
function LogoLockup({ height }) {
  return <img src="uploads/logo-sport-lockup.png" alt="THE STANDARD SPORT"
    style={{ height, width:"auto", display:"block", userSelect:"none" }} />;
}

const CAN_HOVER = typeof window !== 'undefined' && !!window.matchMedia &&
                  window.matchMedia('(hover: hover)').matches;

// useHover: เปิดด้วยการชี้เมาส์เฉพาะตอนเป็นเมนูแถวเดียวเท่านั้น
// ในแผงแบบแอกคอร์เดียน ถ้ายังเปิดด้วย hover อยู่ การคลิกจะกลายเป็นการ "ปิด"
// สิ่งที่ hover เพิ่งเปิดไป เมนูย่อยจึงไม่มีทางกางบนเครื่องที่มีทั้งจอสัมผัสและเมาส์
function NavItem({ item, openKey, setOpenKey, useHover }) {
  const hasPanel = !!(item.items && item.items.length);
  const isOpen = hasPanel && openKey === item.key;
  const closeIfOutside = (e) => { if (!e.currentTarget.contains(e.relatedTarget)) setOpenKey(null); };
  return (
    <div className={"nav-dd" + (isOpen ? " open" : "")}
      onMouseEnter={useHover && hasPanel ? () => setOpenKey(item.key) : undefined}
      onMouseLeave={useHover && hasPanel ? () => setOpenKey(null) : undefined}
      onBlur={hasPanel ? closeIfOutside : undefined}>
      <a className="nav-dd-top" href={item.href || "index.html"}
        aria-haspopup={hasPanel ? "true" : undefined}
        aria-expanded={hasPanel ? (isOpen ? "true" : "false") : undefined}
        onFocus={useHover && hasPanel ? () => setOpenKey(item.key) : undefined}
        onClick={hasPanel ? (e) => { e.preventDefault(); setOpenKey(k => k === item.key ? null : item.key); } : undefined}>
        {item.live && <span className="nav-live-dot" aria-hidden="true" />}
        <span>{item.label}</span>
        {hasPanel && <span className="nav-caret" aria-hidden="true">▾</span>}
      </a>
      {hasPanel && (
        <div className="nav-dd-panel">
          {item.panelNote && <div className="nav-dd-note">{item.panelNote}</div>}
          {item.items.map((it, i) => it.divider
            ? <div key={"sep" + i} className="nav-dd-sep" aria-hidden="true" />
            : (
              <a key={it.label} className={"nav-dd-link" + (it.tool ? " is-tool" : "")} href={it.href || "index.html"}>
                <span>{it.label}</span>
                {it.note && <span className="nav-dd-tag">{it.note}</span>}
              </a>
            ))}
        </div>
      )}
    </div>
  );
}

// solid: หน้าที่ไม่มีภาพ hero เต็มจอรองอยู่ (เช่นหน้าบทความ) ต้องทึบตั้งแต่แรก
// ไม่งั้นตัวหนังสือสีขาวของเมนูจะลอยอยู่บนพื้นเปล่า
function Navbar({ dark, onToggleDark, solid = false }) {
  const [menuOpen, setMenuOpen] = React.useState(false);
  const [openKey, setOpenKey] = React.useState(null);
  const [scrolled, setScrolled] = React.useState(false);
  const MENU = (typeof window !== 'undefined' && window.__TSD_MENU__) || [];

  React.useEffect(() => {
    const onKey = (e) => { if (e.key === "Escape") { setOpenKey(null); setMenuOpen(false); } };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  React.useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive:true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // แผงเมนูเต็มจอบนมือถือไม่ควรให้หน้าหลังเลื่อนตาม
  React.useEffect(() => {
    document.body.style.overflow = menuOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [menuOpen]);

  const HamIcon = () => menuOpen
    ? <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round"><path d="M18 6L6 18M6 6l12 12"/></svg>
    : <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round"><path d="M3 12h18M3 6h18M3 18h18"/></svg>;

  return (
    <nav className={"tsdx-nav" + (solid || scrolled || menuOpen ? " is-stuck" : "")}>
      <div className="tsdx-navrow">
        <button className="nav-mob tsdx-iconbtn" onClick={()=>setMenuOpen(o=>!o)} aria-label="เมนู"
          aria-expanded={menuOpen ? "true" : "false"}>
          <HamIcon />
        </button>
        <a className="tsdx-navlogo" href="index.html" aria-label="Home"><LogoLockup /></a>
        <div className={"nav-bar" + (menuOpen ? " open" : "")}>
          <div className="nav-items">
            {MENU.map(it => <NavItem key={it.key} item={it} openKey={openKey}
              setOpenKey={setOpenKey} useHover={CAN_HOVER && !menuOpen} />)}
          </div>
        </div>
        <div className="tsdx-navtools">
          <button className="tsdx-iconbtn" onClick={onToggleDark} title={dark?"Light mode":"Dark mode"}>
            {dark ? <IconSun /> : <IconMoon />}
          </button>
        </div>
      </div>
    </nav>
  );
}

Object.assign(window, { Navbar, NavItem, LogoLockup, IconSun, IconMoon });
