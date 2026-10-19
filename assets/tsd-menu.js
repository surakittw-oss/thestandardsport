/* เมนูบาร์ของ THE STANDARD SPORT — ชุดเดียวกับเมนู "SPORT" ใน WordPress
   (Appearance → Menus ของธีม / ปลั๊กอิน tsd-sport-skin) ทั้งลำดับ ชื่อ และเมนูย่อย
   หน้าแรกและทุกหน้าในเว็บนี้อ่านจากไฟล์นี้ไฟล์เดียว (assets/tsd-render.js)

   href: หมวดที่มีหน้าในเว็บนี้ (football.html / motorsport.html) ลิงก์ไปหน้านั้น
   หมวดอื่นยังไม่มีหน้า จึงชี้ไปหน้าแรกพร้อม ?cat= ไว้ก่อน
   href "#" = รายการที่ไม่มีหน้าของตัวเอง (MORE SPORTS) คลิกแล้วเปิดเมนูย่อยแทน */
window.__TSD_MENU__ = [
  { key: "home", label: "Home", href: "index.html" },
  {
    key: "football", label: "FOOTBALL", href: "football.html",
    items: [
      { label: "Premier League", href: "index.html?cat=premier-league" },
      { label: "UEFA",           href: "index.html?cat=uefa" },
      { label: "World Cup",      href: "index.html?cat=world-cup" },
    ],
  },
  { key: "motorsport", label: "MOTORSPORT", href: "motorsport.html" },
  {
    key: "thai-team", label: "THAI TEAM", href: "index.html?cat=thai-team",
    items: [
      { label: "Volleyball", href: "index.html?cat=volleyball" },
      { label: "Badminton",  href: "index.html?cat=badminton" },
      { label: "FA Thai",    href: "index.html?cat=fa-thai" },
    ],
  },
  { key: "tennis",  label: "TENNIS",  href: "index.html?cat=tennis" },
  { key: "golf",    label: "GOLF",    href: "index.html?cat=golf" },
  { key: "gadgets", label: "GADGETS", href: "index.html?cat=shoes-gadgets" },
  {
    key: "more-sports", label: "MORE SPORTS", href: "#",
    items: [
      { label: "Running", href: "index.html?cat=running" },
      { label: "Hyrox",   href: "index.html?cat=hyrox" },
    ],
  },
];
