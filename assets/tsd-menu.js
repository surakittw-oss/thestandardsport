/* เมนูบาร์ของ THE STANDARD SPORT — ชุดเดียวกับเมนู "SPORT" ใน WordPress
   (Appearance → Menus ของธีม / ปลั๊กอิน tsd-sport-skin) ทั้งลำดับ ชื่อ และเมนูย่อย
   หน้าแรกและทุกหน้าในเว็บนี้อ่านจากไฟล์นี้ไฟล์เดียว (assets/tsd-render.js)

<<<<<<< HEAD
   โครงสร้าง 11 ช่อง (8 ช่องเดิม + 3 ช่องจากแผนผัง Site Map ที่เพิ่มเข้ามา):
     Home · Football · Volleyball · Thai Sport · Active · Motorsport
     Tennis & Golf · Other Sports · Gadgets · Long Reads · ● Asian Games (ช่องอีเวนต์)
   "Thai Sport" คือช่อง "Thai Team" ในแผนผัง (เก็บชื่อเดิมไว้)
   หัวข้อรองที่ซ้ำกันข้ามเมนู (เช่น Tennis, Running) ใช้ href เดียวกัน = ปลายทางเดียว

   หมายเหตุ
   - เมนูไม่แสดงจำนวนบทความ เพื่อให้แถบอ่านง่ายและไม่ผูกกับตัวเลขที่เปลี่ยนตามข้อมูล
   - หากต้องการตัวเลข ให้แสดงในหน้า landing ของหมวดแทน
   - href ทุกอันเป็น "hook" รอหน้า Landing ของหมวดจริง ยังไม่มีหน้าเหล่านั้น
     จึงพากลับไปที่หน้าแรกพร้อม ?cat= / ?page= ให้เห็นเจตนาใน URL
   - divider: true = เส้นคั่นก่อนกลุ่ม "เครื่องมือ" (tool) ท้ายเมนู ซึ่งเป็นหน้าเฉพาะ
     ไม่ใช่รายการโพสต์ → แสดงเป็นสีชมพูเพื่อแยกออกจากรายการข่าว
*/
=======
   href: หมวดที่มีหน้าในเว็บนี้ (football.html / motorsport.html) ลิงก์ไปหน้านั้น
   หมวดอื่นยังไม่มีหน้า จึงชี้ไปหน้าแรกพร้อม ?cat= ไว้ก่อน
   href "#" = รายการที่ไม่มีหน้าของตัวเอง (MORE SPORTS) คลิกแล้วเปิดเมนูย่อยแทน */
>>>>>>> 93b7e4e24a4651f844bf08b0af3fe2c0e17edb0d
window.__TSD_MENU__ = [
  { key: "home", label: "Home", href: "index.html" },
  {
    key: "football", label: "FOOTBALL", href: "football.html",
    items: [
<<<<<<< HEAD
      { label: "FIFA World Cup 2026",          href: "index.html?cat=world-cup-2026" },
      { label: "Thailand / Thai League",       href: "index.html?cat=thai-football" },
      { label: "La Liga & European Leagues",   href: "index.html?cat=la-liga-europe" },
      { label: "UEFA",                         href: "index.html?cat=uefa" },
      { label: "Other National Teams",         href: "index.html?cat=national-teams" },
      { label: "Premier League",               href: "index.html?cat=premier-league" },
=======
      { label: "Premier League", href: "index.html?cat=premier-league" },
      { label: "UEFA",           href: "index.html?cat=uefa" },
      { label: "World Cup",      href: "index.html?cat=world-cup" },
>>>>>>> 93b7e4e24a4651f844bf08b0af3fe2c0e17edb0d
    ],
  },
  { key: "motorsport", label: "MOTORSPORT", href: "motorsport.html" },
  {
    key: "thai-team", label: "THAI TEAM", href: "index.html?cat=thai-team",
    items: [
<<<<<<< HEAD
      { label: "Thai National Teams (every sport)", href: "index.html?cat=thai-national-teams" },
      { label: "FA Thai",                            href: "index.html?cat=fa-thai" },
      { label: "Thai Football / Thai League",       href: "index.html?cat=thai-football-league" },
      { label: "Volleyball",                         href: "index.html?cat=thai-volleyball" },
      { label: "Badminton",                          href: "index.html?cat=badminton" },
      { label: "Boxing",                             href: "index.html?cat=thai-boxing" },
      { label: "Muay Thai / Combat Sports",          href: "index.html?cat=muay-thai-combat" },
      { label: "Thai Sports Industry / Policy",      href: "index.html?cat=thai-sports-policy" },
=======
      { label: "Volleyball", href: "index.html?cat=volleyball" },
      { label: "Badminton",  href: "index.html?cat=badminton" },
      { label: "FA Thai",    href: "index.html?cat=fa-thai" },
>>>>>>> 93b7e4e24a4651f844bf08b0af3fe2c0e17edb0d
    ],
  },
  { key: "tennis",  label: "TENNIS",  href: "index.html?cat=tennis" },
  { key: "golf",    label: "GOLF",    href: "index.html?cat=golf" },
  { key: "gadgets", label: "GADGETS", href: "index.html?cat=shoes-gadgets" },
  {
    key: "more-sports", label: "MORE SPORTS", href: "#",
    items: [
<<<<<<< HEAD
      { label: "Shoes & Gadgets",           href: "index.html?cat=shoes-gadgets" },
      { label: "HYROX & Competitive Fitness", href: "index.html?cat=hyrox-fitness" },
      { label: "Training & Health",         href: "index.html?cat=training-health" },
      { label: "Running & Marathon",        href: "index.html?cat=running-marathon" },
      { divider: true },
      { label: "Gear Comparison & Reviews", href: "index.html?page=gear-reviews", tool: true },
    ],
  },
  {
    key: "motorsport", label: "Motorsport", href: "index.html?cat=motorsport",
    items: [
      { label: "F1 2026 Calendar",   href: "index.html?cat=f1-calendar" },
      { label: "F1 News & Features", href: "index.html?cat=f1-news" },
      { label: "MotoGP & More",      href: "index.html?cat=motogp" },
      { divider: true },
      // หน้าเดียวอัปเดตในตัว ไม่ใช่โพสต์รายสนาม
      { label: "Championship Standings", href: "index.html?page=standings", tool: true, note: "one live page" },
    ],
  },
  {
    key: "tennis-golf", label: "Tennis & Golf", href: "index.html?cat=tennis-golf",
    items: [
      { label: "Tennis", href: "index.html?cat=tennis" },
      { label: "Golf",   href: "index.html?cat=golf" },
    ],
  },
  {
    key: "other-sports", label: "Other Sports", href: "index.html?cat=other-sports",
    items: [
      { label: "Tennis",            href: "index.html?cat=tennis" },
      { label: "Golf",              href: "index.html?cat=golf" },
      { label: "Boxing & Combat",   href: "index.html?cat=boxing" },
      { label: "Basketball",        href: "index.html?cat=basketball" },
      { label: "Esports",           href: "index.html?cat=esports" },
      { label: "Running & Marathon", href: "index.html?cat=running-marathon" },
      { label: "HYROX",             href: "index.html?cat=hyrox-fitness" },
      { label: "Training & Health", href: "index.html?cat=training-health" },
      { divider: true },
      // ยังไม่มีเนื้อหา — เปิดช่องไว้รอทดลอง
      { label: "Padel & Pickleball", href: "index.html?cat=padel-pickleball", tool: true, note: "soon" },
    ],
  },
  { key: "gadgets", label: "Gadgets", href: "index.html?cat=gadgets" },
  {
    // แกนตัดขวาง ไม่ใช่ชนิดกีฬา
    key: "long-reads", label: "Long Reads", href: "index.html?cat=long-reads",
    items: [
      { label: "Opinion / Columns",     href: "index.html?cat=opinion" },
      { label: "Goal of Life",          href: "index.html?cat=goal-of-life" },
      { label: "Features & Interviews", href: "index.html?cat=features-interviews" },
      { label: "SPORT Retro",           href: "index.html?cat=sport-retro", note: "paused" },
    ],
  },
  {
    // ช่องอีเวนต์ — เปลี่ยนตามปฏิทินการแข่งขัน
    key: "asian-games", label: "Asian Games", href: "index.html?cat=asian-games",
    live: true, panelNote: "Event slot · follows the competition calendar",
    items: [
      { label: "Asian Games News",     href: "index.html?cat=asian-games-news" },
      { label: "PLAYER Profile",       href: "index.html?cat=player-profile" },
=======
      { label: "Running", href: "index.html?cat=running" },
      { label: "Hyrox",   href: "index.html?cat=hyrox" },
>>>>>>> 93b7e4e24a4651f844bf08b0af3fe2c0e17edb0d
    ],
  },
];
