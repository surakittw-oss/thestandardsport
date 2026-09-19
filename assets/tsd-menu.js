/* เมนูบาร์ของ THE STANDARD SPORT — ข้อมูลชุดเดียวที่หน้าแรกและหน้าบทความใช้ร่วมกัน
   (แยกออกมาเป็นไฟล์ .js ธรรมดา เพราะ Babel โหลดไฟล์ .jsx ภายนอกผ่าน file:// ไม่ได้)

   โครงสร้าง 8 ช่องตาม IA ที่กำหนดไว้:
     1 Football (405)   2 Volleyball (21)   3 Thai Sport (88)   4 Active (68)
     5 Motorsport (126) 6 Other Sports (182) 7 Long Reads (36)  8 ● Asian Games (ช่องอีเวนต์)
   ปุ่ม "Fixtures & Results" ชิดขวาเป็นปุ่มถาวร ไม่นับเป็นรายการในเมนู

   หมายเหตุ
   - count = จำนวนบทความตามแผนคอนเทนต์ (ไม่ใช่ตัวเลขที่ดึงสดจากเว็บ ทุกวันนี้เว็บจริงยังมี
     category เดียวคือ Sport แล้วแยกด้วยแท็ก ถ้าต้องการให้ตัวเลขนี้มาจากของจริง
     ให้ดึง /wp-json/wp/v2/tags?search=<ชื่อแท็ก> แล้วอ่านฟิลด์ count มาใส่แทน)
   - href ทุกอันเป็น "hook" รอหน้า Landing ของหมวดจริง ยังไม่มีหน้าเหล่านั้น
     จึงพากลับไปที่หน้าแรกพร้อม ?cat= / ?page= ให้เห็นเจตนาใน URL
   - divider: true = เส้นคั่นก่อนกลุ่ม "เครื่องมือ" (tool) ท้ายเมนู ซึ่งเป็นหน้าเฉพาะ
     ไม่ใช่รายการโพสต์ → แสดงเป็นสีชมพูเพื่อแยกออกจากรายการข่าว
*/
window.__TSD_MENU__ = [
  {
    key: "football", label: "Football", count: 405, href: "index.html?cat=football",
    items: [
      { label: "FIFA World Cup 2026",          href: "index.html?cat=world-cup-2026" },
      { label: "Thailand / Thai League",       href: "index.html?cat=thai-football" },
      { label: "La Liga & European Leagues",   href: "index.html?cat=la-liga-europe" },
      { label: "Other National Teams",         href: "index.html?cat=national-teams" },
      { label: "Premier League",               href: "index.html?cat=premier-league" },
      { divider: true },
      { label: "Fixtures & Results", href: "index.html?page=fixtures", tool: true, note: "live page" },
    ],
  },
  // ไม่มีดรอปดาวน์ — กดแล้วเข้าหน้ารวมของวอลเลย์บอลเลย
  { key: "volleyball", label: "Volleyball", count: 21, href: "index.html?cat=volleyball" },
  {
    key: "thai-sport", label: "Thai Sport", count: 88, href: "index.html?cat=thai-sport",
    items: [
      { label: "Thai National Teams (every sport)", href: "index.html?cat=thai-national-teams" },
      { label: "Thai Football / Thai League",       href: "index.html?cat=thai-football-league" },
      { label: "Badminton",                          href: "index.html?cat=badminton" },
      { label: "Muay Thai / Combat Sports",          href: "index.html?cat=muay-thai-combat" },
      { label: "Thai Sports Industry / Policy",      href: "index.html?cat=thai-sports-policy" },
    ],
  },
  {
    key: "active", label: "Active", count: 68, href: "index.html?cat=active",
    items: [
      { label: "Shoes & Gadgets",           href: "index.html?cat=shoes-gadgets" },
      { label: "HYROX & Competitive Fitness", href: "index.html?cat=hyrox-fitness" },
      { label: "Training & Health",         href: "index.html?cat=training-health" },
      { label: "Running & Marathon",        href: "index.html?cat=running-marathon" },
      { divider: true },
      { label: "Gear Comparison & Reviews", href: "index.html?page=gear-reviews", tool: true },
    ],
  },
  {
    key: "motorsport", label: "Motorsport", count: 126, href: "index.html?cat=motorsport",
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
    key: "other-sports", label: "Other Sports", count: 182, href: "index.html?cat=other-sports",
    items: [
      { label: "Tennis",            href: "index.html?cat=tennis" },
      { label: "Golf",              href: "index.html?cat=golf" },
      { label: "Boxing & Combat",   href: "index.html?cat=boxing" },
      { label: "Basketball",        href: "index.html?cat=basketball" },
      { label: "Esports",           href: "index.html?cat=esports" },
      { divider: true },
      // ยังไม่มีเนื้อหา — เปิดช่องไว้รอทดลอง
      { label: "Padel & Pickleball", href: "index.html?cat=padel-pickleball", tool: true, note: "soon" },
    ],
  },
  {
    // แกนตัดขวาง ไม่ใช่ชนิดกีฬา
    key: "long-reads", label: "Long Reads", count: 36, href: "index.html?cat=long-reads",
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
      { label: "Fixtures & Medals",    href: "index.html?cat=fixtures-medals" },
    ],
  },
];

// ปุ่มถาวรชิดขวาของเมนูบาร์ (ไม่ใช่รายการในเมนู)
window.__TSD_MENU_CTA__ = { label: "Fixtures & Results", href: "index.html?page=fixtures" };
