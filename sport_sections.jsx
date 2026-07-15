// sport_sections.jsx – THE STANDARD SPORT · All section components + mock data
const { useState, useEffect } = React;

// ── DATA ──────────────────────────────────────────────────────────────────────

const F1_DRIVERS = [
  { pos:1,  name:"Lando Norris",    team:"McLaren",      flag:"🇬🇧", pts:169, wins:4, color:"#FF8000" },
  { pos:2,  name:"Charles Leclerc", team:"Ferrari",      flag:"🇲🇨", pts:151, wins:3, color:"#E8002D" },
  { pos:3,  name:"Oscar Piastri",   team:"McLaren",      flag:"🇦🇺", pts:143, wins:2, color:"#FF8000" },
  { pos:4,  name:"Lewis Hamilton",  team:"Ferrari",      flag:"🇬🇧", pts:118, wins:0, color:"#E8002D" },
  { pos:5,  name:"Max Verstappen",  team:"Red Bull",     flag:"🇳🇱", pts:107, wins:0, color:"#3671C6" },
  { pos:6,  name:"George Russell",  team:"Mercedes",     flag:"🇬🇧", pts:98,  wins:0, color:"#27F4D2" },
  { pos:7,  name:"Carlos Sainz",    team:"Williams",     flag:"🇪🇸", pts:72,  wins:0, color:"#64C4FF" },
  { pos:8,  name:"Fernando Alonso", team:"Aston Martin", flag:"🇪🇸", pts:55,  wins:0, color:"#358C75" },
  { pos:9,  name:"Kimi Antonelli",  team:"Mercedes",     flag:"🇮🇹", pts:47,  wins:0, color:"#27F4D2" },
  { pos:10, name:"Pierre Gasly",    team:"Alpine",       flag:"🇫🇷", pts:28,  wins:0, color:"#FF87BC" },
];

const F1_CONSTRUCTORS = [
  { pos:1,  name:"McLaren",      pts:312, color:"#FF8000" },
  { pos:2,  name:"Ferrari",      pts:269, color:"#E8002D" },
  { pos:3,  name:"Mercedes",     pts:145, color:"#27F4D2" },
  { pos:4,  name:"Red Bull",     pts:124, color:"#3671C6" },
  { pos:5,  name:"Williams",     pts:85,  color:"#64C4FF" },
  { pos:6,  name:"Aston Martin", pts:78,  color:"#358C75" },
  { pos:7,  name:"Alpine",       pts:34,  color:"#FF87BC" },
  { pos:8,  name:"RB",           pts:21,  color:"#6692FF" },
  { pos:9,  name:"Haas",         pts:12,  color:"#B6BABD" },
  { pos:10, name:"Kick Sauber",  pts:4,   color:"#52E252" },
];

const F1_CALENDAR = [
  { rd:1,  flag:"🇧🇭", name:"Bahrain GP",        date:"15 มี.ค.", winner:"Norris",   status:"done" },
  { rd:2,  flag:"🇸🇦", name:"Saudi Arabia GP",   date:"22 มี.ค.", winner:"Leclerc",  status:"done" },
  { rd:3,  flag:"🇦🇺", name:"Australian GP",     date:"6 เม.ย.",  winner:"Norris",   status:"done" },
  { rd:4,  flag:"🇯🇵", name:"Japanese GP",       date:"13 เม.ย.", winner:"Piastri",  status:"done" },
  { rd:5,  flag:"🇨🇳", name:"Chinese GP",        date:"27 เม.ย.", winner:"Leclerc",  status:"done" },
  { rd:6,  flag:"🇺🇸", name:"Miami GP",          date:"4 พ.ค.",   winner:"Norris",   status:"done" },
  { rd:7,  flag:"🇮🇹", name:"Emilia Romagna GP", date:"18 พ.ค.",  winner:"Leclerc",  status:"done" },
  { rd:8,  flag:"🇲🇨", name:"Monaco GP",         date:"25 พ.ค.",  winner:"Hamilton", status:"done" },
  { rd:9,  flag:"🇪🇸", name:"Spanish GP",        date:"1 มิ.ย.",  winner:"Norris",   status:"done" },
  { rd:10, flag:"🇨🇦", name:"Canadian GP",       date:"15 มิ.ย.", winner:null,        status:"next" },
  { rd:11, flag:"🇦🇹", name:"Austrian GP",       date:"29 มิ.ย.", winner:null,        status:"upcoming" },
  { rd:12, flag:"🇬🇧", name:"British GP",        date:"6 ก.ค.",   winner:null,        status:"upcoming" },
  { rd:13, flag:"🇭🇺", name:"Hungarian GP",      date:"27 ก.ค.",  winner:null,        status:"upcoming" },
  { rd:14, flag:"🇧🇪", name:"Belgian GP",        date:"3 ส.ค.",   winner:null,        status:"upcoming" },
  { rd:15, flag:"🇳🇱", name:"Dutch GP",          date:"31 ส.ค.",  winner:null,        status:"upcoming" },
  { rd:16, flag:"🇮🇹", name:"Italian GP",        date:"7 ก.ย.",   winner:null,        status:"upcoming" },
  { rd:17, flag:"🇦🇿", name:"Azerbaijan GP",     date:"21 ก.ย.",  winner:null,        status:"upcoming" },
  { rd:18, flag:"🇸🇬", name:"Singapore GP",      date:"5 ต.ค.",   winner:null,        status:"upcoming" },
  { rd:19, flag:"🇺🇸", name:"United States GP",  date:"19 ต.ค.",  winner:null,        status:"upcoming" },
  { rd:20, flag:"🇲🇽", name:"Mexico GP",         date:"26 ต.ค.",  winner:null,        status:"upcoming" },
  { rd:21, flag:"🇧🇷", name:"Brazilian GP",      date:"9 พ.ย.",   winner:null,        status:"upcoming" },
  { rd:22, flag:"🇦🇪", name:"Abu Dhabi GP",      date:"23 พ.ย.",  winner:null,        status:"upcoming" },
];

const F1_RESULTS = [
  { pos:1,  flag:"🇬🇧", name:"L. Norris",     team:"McLaren",      time:"1:29:43.234", pts:25, color:"#FF8000" },
  { pos:2,  flag:"🇲🇨", name:"C. Leclerc",    team:"Ferrari",      time:"+4.234s",     pts:18, color:"#E8002D" },
  { pos:3,  flag:"🇦🇺", name:"O. Piastri",    team:"McLaren",      time:"+8.567s",     pts:15, color:"#FF8000" },
  { pos:4,  flag:"🇬🇧", name:"L. Hamilton",   team:"Ferrari",      time:"+15.123s",    pts:12, color:"#E8002D" },
  { pos:5,  flag:"🇳🇱", name:"M. Verstappen", team:"Red Bull",     time:"+21.456s",    pts:10, color:"#3671C6" },
  { pos:6,  flag:"🇬🇧", name:"G. Russell",    team:"Mercedes",     time:"+28.789s",    pts:8,  color:"#27F4D2" },
  { pos:7,  flag:"🇪🇸", name:"C. Sainz",      team:"Williams",     time:"+35.234s",    pts:6,  color:"#64C4FF" },
  { pos:8,  flag:"🇪🇸", name:"F. Alonso",     team:"Aston Martin", time:"+42.678s",    pts:4,  color:"#358C75" },
  { pos:9,  flag:"🇮🇹", name:"K. Antonelli",  team:"Mercedes",     time:"+49.123s",    pts:2,  color:"#27F4D2" },
  { pos:10, flag:"🇫🇷", name:"P. Gasly",      team:"Alpine",       time:"+56.789s",    pts:1,  color:"#FF87BC" },
];

const STANDINGS = {
  premier: {
    label: "Premier League 2025/26",
    rows: [
      { pos:1,  name:"Arsenal",      p:38, w:28, d:6,  l:4,  gd:"+65", pts:90 },
      { pos:2,  name:"Liverpool",    p:38, w:26, d:7,  l:5,  gd:"+58", pts:85 },
      { pos:3,  name:"Chelsea",      p:38, w:24, d:8,  l:6,  gd:"+42", pts:80 },
      { pos:4,  name:"Man City",     p:38, w:23, d:7,  l:8,  gd:"+38", pts:76 },
      { pos:5,  name:"Tottenham",    p:38, w:20, d:9,  l:9,  gd:"+18", pts:69 },
      { pos:6,  name:"Newcastle",    p:38, w:19, d:8,  l:11, gd:"+12", pts:65 },
      { pos:7,  name:"Aston Villa",  p:38, w:18, d:8,  l:12, gd:"+8",  pts:62 },
      { pos:8,  name:"Man United",   p:38, w:16, d:9,  l:13, gd:"0",   pts:57 },
      { pos:9,  name:"Brighton",     p:38, w:15, d:10, l:13, gd:"+5",  pts:55 },
      { pos:10, name:"West Ham",     p:38, w:14, d:9,  l:15, gd:"-5",  pts:51 },
    ],
  },
  thai: {
    label: "Thai League 1 · 2026",
    rows: [
      { pos:1,  name:"บุรีรัมย์ ยูไนเต็ด", p:30, w:22, d:5, l:3,  gd:"+48", pts:71 },
      { pos:2,  name:"ชลบุรี เอฟซี",       p:30, w:18, d:8, l:4,  gd:"+28", pts:62 },
      { pos:3,  name:"เมืองทอง ยูไนเต็ด",  p:30, w:17, d:7, l:6,  gd:"+22", pts:58 },
      { pos:4,  name:"ราชบุรี มิตรผล",      p:30, w:15, d:8, l:7,  gd:"+12", pts:53 },
      { pos:5,  name:"พอร์ต เอฟซี",         p:30, w:14, d:9, l:7,  gd:"+9",  pts:51 },
      { pos:6,  name:"ขอนแก่น ยูไนเต็ด",    p:30, w:13, d:8, l:9,  gd:"+4",  pts:47 },
      { pos:7,  name:"สุพรรณบุรี เอฟซี",    p:30, w:11, d:9, l:10, gd:"-2",  pts:42 },
      { pos:8,  name:"ราชประชา เอฟซี",      p:30, w:10, d:8, l:12, gd:"-8",  pts:38 },
      { pos:9,  name:"เชียงราย ยูไนเต็ด",   p:30, w:8,  d:9, l:13, gd:"-15", pts:33 },
      { pos:10, name:"กรุงเทพ คริสเตียน",   p:30, w:5,  d:6, l:19, gd:"-38", pts:21 },
    ],
  },
  laliga: {
    label: "La Liga 2025/26",
    rows: [
      { pos:1,  name:"Real Madrid",      p:38, w:27, d:7,  l:4,  gd:"+68", pts:88 },
      { pos:2,  name:"Barcelona",        p:38, w:26, d:6,  l:6,  gd:"+55", pts:84 },
      { pos:3,  name:"Atlético Madrid",  p:38, w:22, d:9,  l:7,  gd:"+35", pts:75 },
      { pos:4,  name:"Athletic Bilbao",  p:38, w:19, d:8,  l:11, gd:"+18", pts:65 },
      { pos:5,  name:"Real Sociedad",    p:38, w:17, d:9,  l:12, gd:"+10", pts:60 },
      { pos:6,  name:"Villarreal",       p:38, w:16, d:8,  l:14, gd:"+5",  pts:56 },
      { pos:7,  name:"Sevilla",          p:38, w:14, d:10, l:14, gd:"-2",  pts:52 },
      { pos:8,  name:"Valencia",         p:38, w:13, d:9,  l:16, gd:"-8",  pts:48 },
      { pos:9,  name:"Real Betis",       p:38, w:12, d:11, l:15, gd:"-5",  pts:47 },
      { pos:10, name:"Osasuna",          p:38, w:11, d:9,  l:18, gd:"-18", pts:42 },
    ],
  },
};

const NEWS = [
  { id:1, cat:"F1",         hot:true,  date:"1 มิ.ย. 2026",  author:"ภัทรพล สินพิมล",  read:"4 นาที",
    bg:"linear-gradient(135deg,#b84800 0%,#ff6b35 100%)",
    title:"นอร์ริส ขยับช่องว่าง หลังคว้าชัย สเปน GP ยอดสะสม 169 แต้มนำโด่ง" },
  { id:2, cat:"ฟุตบอล",    hot:false, date:"31 พ.ค. 2026",  author:"กมลชนก วัฒนา",    read:"3 นาที",
    bg:"linear-gradient(135deg,#8b0000 0%,#cc0000 100%)",
    title:"อาร์เซนอล คว้าแชมป์พรีเมียร์ลีก สมัยที่ 2 ติดต่อกัน จบฤดูกาล 90 แต้ม" },
  { id:3, cat:"ฟุตบอลไทย", hot:false, date:"31 พ.ค. 2026",  author:"ธนเดช ประทุม",     read:"3 นาที",
    bg:"linear-gradient(135deg,#003087 0%,#006400 100%)",
    title:"บุรีรัมย์ บดขยี้ เมืองทอง 3-1 ยืนจ่าฝูงไทยลีก ทิ้งห่าง 9 แต้ม" },
  { id:4, cat:"วอลเลย์บอล",hot:false, date:"30 พ.ค. 2026",  author:"พัชราภา โสภา",     read:"2 นาที",
    bg:"linear-gradient(135deg,#6a0040 0%,#c2185b 100%)",
    title:"สาวไทย พ่าย บราซิล 0-3 เซต VNL 2026 รอบแรก" },
  { id:5, cat:"เทนนิส",    hot:false, date:"30 พ.ค. 2026",  author:"ชนาธิป รุ่งเรือง", read:"2 นาที",
    bg:"linear-gradient(135deg,#3e2723 0%,#795548 100%)",
    title:"ซิน บุกรอบ 8 คน โรลอง การ์รอส หวังแชมป์ Grand Slam สมัยที่ 3" },
  { id:6, cat:"F1",         hot:false, date:"2 มิ.ย. 2026",  author:"ภัทรพล สินพิมล",  read:"3 นาที",
    bg:"linear-gradient(135deg,#6a0000 0%,#b71c1c 100%)",
    title:"แฮมิลตัน เผย ชินรถ Ferrari แล้ว หวังโชว์ฟอร์มดี สนาม Canada" },
];

// ── SMALL UI COMPONENTS ───────────────────────────────────────────────────────

function CatTag({ label, hot }) {
  return (
    <span style={{
      display: "inline-block", padding: "2px 9px",
      background: hot ? "#ffa5f7" : "#0d0d0d",
      color: hot ? "#0d0d0d" : "#fff",
      fontFamily: "Space Grotesk, sans-serif",
      fontWeight: 700, fontSize: 10, letterSpacing: "0.13em", textTransform: "uppercase",
    }}>{label}</span>
  );
}

function NewsCard({ item, font }) {
  const ff = font === "serif" ? "Noto Serif Thai, serif" : "Sarabun, sans-serif";
  const [hov, setHov] = useState(false);
  return (
    <div style={{ cursor: "pointer", transform: hov ? "translateY(-3px)" : "translateY(0)", transition: "transform 0.2s ease" }}
      onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)}>
      <div style={{ height: 164, background: item.bg, marginBottom: 14, position: "relative", overflow: "hidden" }}>
        {item.hot && (
          <span style={{ position: "absolute", top: 10, left: 10, background: "#ffa5f7", color: "#0d0d0d",
            padding: "2px 8px", fontSize: 9, fontWeight: 800, fontFamily: "Space Grotesk", letterSpacing: "0.15em" }}>HOT</span>
        )}
      </div>
      <CatTag label={item.cat} />
      <h4 style={{ fontFamily: ff, fontWeight: 700, fontSize: 15, lineHeight: 1.45, margin: "8px 0 6px", color: "#0d0d0d", textWrap: "pretty" }}>{item.title}</h4>
      <p style={{ fontFamily: "Sarabun, sans-serif", fontSize: 12, color: "#aaa", margin: 0 }}>{item.author} · {item.date}</p>
    </div>
  );
}

// ── NAVBAR ────────────────────────────────────────────────────────────────────

function Navbar({ font }) {
  const [active, setActive] = useState("หน้าแรก");
  const ff = font === "serif" ? "Noto Serif Thai, serif" : "Sarabun, sans-serif";
  const items = ["หน้าแรก", "ฟุตบอล", "F1", "บาสเก็ตบอล", "วอลเลย์บอล", "เทนนิส"];
  return (
    <nav style={{ position: "sticky", top: 0, zIndex: 100, background: "#fff", borderBottom: "1px solid #e8e8e8",
      display: "flex", alignItems: "center", padding: "0 40px", height: 64, gap: 28 }}>
      {/* Logo */}
      <div style={{ display: "flex", alignItems: "center", gap: 10, flexShrink: 0 }}>
        <img src="uploads/pasted-1780532490478-0.png"
          style={{ width: 40, height: 40, objectFit: "cover", flexShrink: 0 }} alt="The Standard Logo" />
        <div style={{ lineHeight: 1.15 }}>
          <div style={{ fontFamily: "Space Grotesk, sans-serif", fontWeight: 800, fontSize: 9,
            letterSpacing: "0.28em", color: "#888", textTransform: "uppercase" }}>THE STANDARD</div>
          <div style={{ fontFamily: "Space Grotesk, sans-serif", fontWeight: 800, fontSize: 15,
            letterSpacing: "0.22em", color: "#ffa5f7", textTransform: "uppercase" }}>SPORT</div>
        </div>
      </div>
      <div style={{ width: 1, height: 32, background: "#e8e8e8", flexShrink: 0 }}></div>
      {/* Nav items */}
      <div style={{ display: "flex", flex: 1, gap: 0 }}>
        {items.map(item => (
          <button key={item} onClick={() => setActive(item)} style={{
            background: "none", border: "none", cursor: "pointer",
            padding: "0 15px", height: 64,
            fontFamily: ff, fontWeight: 600, fontSize: 14,
            color: active === item ? "#0d0d0d" : "#888",
            borderBottom: `2px solid ${active === item ? "#ffa5f7" : "transparent"}`,
            transition: "all 0.15s", whiteSpace: "nowrap",
          }}>{item}</button>
        ))}
      </div>
      {/* Right actions */}
      <div style={{ display: "flex", gap: 10, flexShrink: 0 }}>
        <button style={{ background: "none", border: "1px solid #e0e0e0", padding: "7px 16px",
          fontFamily: "Sarabun, sans-serif", fontSize: 13, fontWeight: 600, color: "#666",
          display: "flex", gap: 6, alignItems: "center" }}>🔍 ค้นหา</button>
        <button style={{ background: "#ffa5f7", border: "none", padding: "8px 18px",
          fontFamily: "Space Grotesk, sans-serif", fontSize: 11, fontWeight: 800,
          letterSpacing: "0.1em", color: "#0d0d0d", cursor: "pointer" }}>SUBSCRIBE</button>
      </div>
    </nav>
  );
}

// ── HERO VARIANTS ─────────────────────────────────────────────────────────────

function HeroFull({ font }) {
  const ff = font === "serif" ? "Noto Serif Thai, serif" : "Sarabun, sans-serif";
  return (
    <div style={{ position: "relative", minHeight: 500, overflow: "hidden",
      background: "linear-gradient(150deg,#080808 0%,#10101a 50%,#0c0c14 100%)" }}>
      {/* Atmospheric glow */}
      <div style={{ position: "absolute", top: "-5%", right: "-2%", width: 520, height: 520,
        background: "radial-gradient(circle,rgba(255,165,247,0.10) 0%,transparent 60%)", pointerEvents: "none" }} />
      <div style={{ position: "absolute", bottom: "-10%", left: "30%", width: 360, height: 360,
        background: "radial-gradient(circle,rgba(255,165,247,0.05) 0%,transparent 55%)", pointerEvents: "none" }} />
      {/* Subtle grid */}
      <div style={{ position: "absolute", inset: 0, pointerEvents: "none",
        backgroundImage: "linear-gradient(rgba(255,255,255,0.025) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,0.025) 1px,transparent 1px)",
        backgroundSize: "56px 56px" }} />

      <div style={{ position: "relative", zIndex: 1, maxWidth: 1280, margin: "0 auto",
        padding: "52px 40px", display: "grid", gridTemplateColumns: "1fr 360px", gap: 48, alignItems: "start" }}>
        {/* Featured story */}
        <div>
          <div style={{ display: "flex", gap: 8, marginBottom: 20, alignItems: "center", flexWrap: "wrap" }}>
            <CatTag label="F1" hot={true} />
            <span style={{ fontFamily: "Space Grotesk, sans-serif", fontWeight: 700, fontSize: 10,
              letterSpacing: "0.18em", color: "rgba(255,165,247,0.6)" }}>SPANISH GP · ROUND 9/22</span>
          </div>
          <h1 style={{ fontFamily: ff, fontWeight: 800, fontSize: 46, lineHeight: 1.2,
            color: "#fff", margin: "0 0 20px", textWrap: "pretty", maxWidth: 580 }}>
            นอร์ริส ขยับช่องว่าง<br />หลังคว้าชัย สเปน GP<br />
            ยอดสะสม <span style={{ color: "#ffa5f7" }}>169 แต้ม</span> นำโด่ง
          </h1>
          <p style={{ fontFamily: ff, fontSize: 17, lineHeight: 1.75,
            color: "rgba(255,255,255,0.6)", margin: "0 0 28px", maxWidth: 520 }}>
            แลนโด้ นอร์ริส โชว์ฟอร์มยอดเยี่ยมบน Circuit de Catalunya นำทัพ McLaren คว้าชัยสมัยที่ 4 ของฤดูกาล 2026 ทิ้งห่างเลอแคลร์ 18 แต้มก่อนถึงสนาม Canada
          </p>
          <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
            <div style={{ width: 34, height: 34, borderRadius: "50%",
              background: "linear-gradient(135deg,#ffa5f7,#ff79c6)",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: 14, fontWeight: 700, color: "#0d0d0d", flexShrink: 0 }}>ภ</div>
            <div>
              <div style={{ fontFamily: "Space Grotesk, sans-serif", fontWeight: 600, fontSize: 12, color: "rgba(255,255,255,0.75)" }}>ภัทรพล สินพิมล</div>
              <div style={{ fontFamily: "Sarabun, sans-serif", fontSize: 12, color: "rgba(255,255,255,0.35)" }}>1 มิ.ย. 2026 · อ่าน 4 นาที</div>
            </div>
          </div>
        </div>
        {/* Sidebar stories */}
        <div style={{ borderLeft: "1px solid rgba(255,255,255,0.07)", paddingLeft: 36 }}>
          <div style={{ fontFamily: "Space Grotesk, sans-serif", fontSize: 9,
            letterSpacing: "0.22em", color: "rgba(255,255,255,0.28)", textTransform: "uppercase", marginBottom: 18 }}>ข่าวอื่นๆ</div>
          <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>
            {NEWS.slice(1, 5).map((n, i) => (
              <div key={n.id} style={{ paddingBottom: i < 3 ? 18 : 0, marginBottom: i < 3 ? 18 : 0,
                borderBottom: i < 3 ? "1px solid rgba(255,255,255,0.06)" : "none", cursor: "pointer" }}>
                <div style={{ display: "flex", gap: 12, alignItems: "flex-start" }}>
                  <div style={{ width: 54, height: 42, background: n.bg, flexShrink: 0 }}></div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <CatTag label={n.cat} />
                    <p style={{ fontFamily: ff, fontWeight: 600, fontSize: 13, color: "#fff",
                      margin: "5px 0 3px", lineHeight: 1.4 }}>{n.title}</p>
                    <p style={{ fontFamily: "Sarabun, sans-serif", fontSize: 11, color: "rgba(255,255,255,0.3)", margin: 0 }}>{n.date}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function HeroGrid({ font }) {
  const ff = font === "serif" ? "Noto Serif Thai, serif" : "Sarabun, sans-serif";
  return (
    <div style={{ background: "#fff", borderBottom: "1px solid #eee" }}>
      <div style={{ maxWidth: 1280, margin: "0 auto", padding: "28px 40px",
        display: "grid", gridTemplateColumns: "7fr 3fr", gap: 20 }}>
        {/* Main big story */}
        <div style={{ cursor: "pointer", position: "relative" }}>
          <div style={{ height: 360, background: NEWS[0].bg, position: "relative", overflow: "hidden" }}>
            <div style={{ position: "absolute", inset: 0,
              background: "linear-gradient(to top,rgba(0,0,0,0.82) 0%,rgba(0,0,0,0.15) 55%,transparent 100%)" }} />
            <div style={{ position: "absolute", bottom: 24, left: 24, right: 24 }}>
              <div style={{ display: "flex", gap: 8, marginBottom: 10 }}>
                <CatTag label={NEWS[0].cat} hot={true} />
              </div>
              <h2 style={{ fontFamily: ff, fontWeight: 800, fontSize: 26, color: "#fff", margin: "0 0 8px", lineHeight: 1.3 }}>{NEWS[0].title}</h2>
              <p style={{ fontFamily: "Sarabun, sans-serif", fontSize: 13, color: "rgba(255,255,255,0.6)", margin: 0 }}>{NEWS[0].author} · {NEWS[0].date}</p>
            </div>
          </div>
        </div>
        {/* Side stack */}
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          {NEWS.slice(1, 4).map((n, i) => (
            <div key={n.id} style={{ display: "grid", gridTemplateColumns: "72px 1fr", gap: 12, cursor: "pointer",
              paddingBottom: i < 2 ? 16 : 0, borderBottom: i < 2 ? "1px solid #eee" : "none" }}>
              <div style={{ height: 56, background: n.bg, flexShrink: 0 }}></div>
              <div>
                <CatTag label={n.cat} />
                <p style={{ fontFamily: ff, fontWeight: 700, fontSize: 13, margin: "5px 0 3px", lineHeight: 1.4, color: "#0d0d0d" }}>{n.title}</p>
                <p style={{ fontFamily: "Sarabun, sans-serif", fontSize: 11, color: "#bbb", margin: 0 }}>{n.date}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ── F1 SECTION ────────────────────────────────────────────────────────────────

function F1Section({ font }) {
  const [tab, setTab] = useState("calendar");
  const ff = font === "serif" ? "Noto Serif Thai, serif" : "Sarabun, sans-serif";
  const tabs = [
    { id: "calendar",     label: "ตารางแข่ง" },
    { id: "results",      label: "ผลล่าสุด" },
    { id: "drivers",      label: "อันดับนักแข่ง" },
    { id: "constructors", label: "อันดับทีม" },
  ];
  const thStyle = { fontFamily: "Space Grotesk, sans-serif", fontSize: 10, fontWeight: 700,
    letterSpacing: "0.12em", color: "#999", textTransform: "uppercase", padding: "10px 14px", textAlign: "left" };

  return (
    <div style={{ background: "#f4f4f4" }}>
      {/* F1 masthead */}
      <div style={{ background: "#0d0d0d", padding: "18px 40px", display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 12 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
          <div style={{ fontFamily: "Space Grotesk, sans-serif", fontWeight: 900, fontSize: 32,
            color: "#E8002D", letterSpacing: "-0.02em", lineHeight: 1 }}>F1</div>
          <div style={{ width: 1, height: 36, background: "rgba(255,255,255,0.15)" }}></div>
          <div>
            <div style={{ fontFamily: "Space Grotesk, sans-serif", fontWeight: 700, fontSize: 12,
              letterSpacing: "0.26em", color: "#fff", textTransform: "uppercase" }}>World Championship</div>
            <div style={{ fontFamily: "Space Grotesk, sans-serif", fontWeight: 400, fontSize: 11,
              letterSpacing: "0.1em", color: "rgba(255,255,255,0.38)" }}>Season 2026</div>
          </div>
        </div>
        <span style={{ fontFamily: "Sarabun, sans-serif", fontSize: 13, color: "rgba(255,255,255,0.38)" }}>ข้อมูลหลัง Spanish GP · Rd 9/22</span>
      </div>

      {/* Countdown */}
      <div style={{ background: "#161616", padding: "20px 40px", display: "flex", alignItems: "center", gap: 32, flexWrap: "wrap" }}>
        <div>
          <div style={{ fontFamily: "Space Grotesk, sans-serif", fontSize: 9, letterSpacing: "0.28em",
            color: "rgba(255,255,255,0.3)", textTransform: "uppercase", marginBottom: 8 }}>NEXT RACE</div>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <span style={{ fontSize: 24 }}>🇨🇦</span>
            <div>
              <div style={{ fontFamily: "Space Grotesk, sans-serif", fontWeight: 700, fontSize: 14, color: "#fff" }}>Canadian Grand Prix</div>
              <div style={{ fontFamily: "Sarabun, sans-serif", fontSize: 12, color: "rgba(255,255,255,0.4)" }}>Circuit Gilles Villeneuve · 15 มิ.ย. 2026</div>
            </div>
          </div>
        </div>
        <div style={{ width: 1, height: 44, background: "rgba(255,255,255,0.1)", flexShrink: 0 }}></div>
        <div style={{ display: "flex", gap: 24, alignItems: "center" }}>
          {[{ n: "11", l: "วัน" }, { n: "00", l: "ชั่วโมง" }, { n: "00", l: "นาที" }].map(({ n, l }) => (
            <div key={l} style={{ textAlign: "center" }}>
              <div style={{ fontFamily: "Space Grotesk, sans-serif", fontWeight: 800, fontSize: 38,
                color: "#ffa5f7", lineHeight: 1, letterSpacing: "-0.02em" }}>{n}</div>
              <div style={{ fontFamily: "Sarabun, sans-serif", fontSize: 11, color: "rgba(255,255,255,0.32)", marginTop: 4 }}>{l}</div>
            </div>
          ))}
        </div>
        <div style={{ marginLeft: "auto" }}>
          <span style={{ fontFamily: "Space Grotesk, sans-serif", fontWeight: 700, fontSize: 10,
            letterSpacing: "0.14em", color: "#E8002D", border: "1px solid rgba(232,0,45,0.45)", padding: "5px 14px" }}>● RD 10 / 22</span>
        </div>
      </div>

      {/* Tab bar */}
      <div style={{ background: "#fff", borderBottom: "1px solid #e8e8e8" }}>
        <div style={{ maxWidth: 1280, margin: "0 auto", padding: "0 40px", display: "flex" }}>
          {tabs.map(t => (
            <button key={t.id} onClick={() => setTab(t.id)} style={{
              background: "none", border: "none", cursor: "pointer",
              padding: "15px 22px",
              fontFamily: "Sarabun, sans-serif", fontWeight: 600, fontSize: 14,
              color: tab === t.id ? "#0d0d0d" : "#888",
              borderBottom: `2px solid ${tab === t.id ? "#ffa5f7" : "transparent"}`,
              transition: "all 0.15s",
            }}>{t.label}</button>
          ))}
        </div>
      </div>

      {/* Tab content */}
      <div style={{ maxWidth: 1280, margin: "0 auto", padding: "28px 40px" }}>

        {tab === "calendar" && (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 6 }}>
            {F1_CALENDAR.map(r => (
              <div key={r.rd} style={{
                background: "#fff", padding: "11px 18px",
                display: "grid", gridTemplateColumns: "28px 28px 1fr auto 60px", gap: 10, alignItems: "center",
                borderLeft: `3px solid ${r.status === "next" ? "#ffa5f7" : r.status === "done" ? "#22c55e" : "#ddd"}`,
                opacity: r.status === "upcoming" ? 0.5 : 1,
              }}>
                <span style={{ fontFamily: "Space Grotesk, sans-serif", fontSize: 10, color: "#bbb", fontWeight: 600, textAlign: "center" }}>R{r.rd}</span>
                <span style={{ fontSize: 16 }}>{r.flag}</span>
                <div>
                  <div style={{ fontFamily: "Space Grotesk, sans-serif", fontWeight: 600, fontSize: 12, color: "#0d0d0d" }}>{r.name}</div>
                  {r.status === "next" && <div style={{ fontFamily: "Space Grotesk, sans-serif", fontSize: 9, letterSpacing: "0.1em", color: "#ffa5f7", fontWeight: 700, marginTop: 1 }}>▶ NEXT</div>}
                </div>
                <span style={{ fontFamily: "Space Grotesk, sans-serif", fontSize: 11, color: "#bbb", textAlign: "right" }}>{r.date}</span>
                <span style={{ fontFamily: "Space Grotesk, sans-serif", fontSize: 11, fontWeight: 700, textAlign: "right",
                  color: r.status === "next" ? "#ffa5f7" : "#0d0d0d" }}>
                  {r.winner || (r.status === "next" ? "TBC" : "—")}
                </span>
              </div>
            ))}
          </div>
        )}

        {tab === "results" && (
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 20, paddingBottom: 16, borderBottom: "1px solid #eee" }}>
              <span style={{ fontSize: 24 }}>🇪🇸</span>
              <div>
                <div style={{ fontFamily: "Space Grotesk, sans-serif", fontWeight: 700, fontSize: 16 }}>Spanish Grand Prix — Circuit de Catalunya</div>
                <div style={{ fontFamily: "Sarabun, sans-serif", fontSize: 13, color: "#aaa" }}>1 มิถุนายน 2026 · Rd 9/22</div>
              </div>
            </div>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr style={{ borderBottom: "2px solid #0d0d0d" }}>
                  {["POS", "", "นักแข่ง", "ทีม", "เวลา / ห่าง", "แต้ม"].map((h, j) => (
                    <th key={j} style={{ ...thStyle, textAlign: h === "แต้ม" ? "right" : "left", paddingBottom: 10 }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {F1_RESULTS.map((r, i) => (
                  <tr key={r.pos} style={{ borderBottom: "1px solid #f0f0f0", background: i % 2 === 0 ? "#fff" : "#fafafa" }}>
                    <td style={{ fontFamily: "Space Grotesk, sans-serif", fontWeight: 800, fontSize: 15, padding: "13px 14px", color: r.pos === 1 ? "#ffa5f7" : "#0d0d0d", width: 40 }}>{r.pos}</td>
                    <td style={{ padding: "13px 4px", width: 24 }}><div style={{ width: 3, height: 22, background: r.color, borderRadius: 1 }}></div></td>
                    <td style={{ fontFamily: "Space Grotesk, sans-serif", fontWeight: 600, fontSize: 13, padding: "13px 14px" }}>{r.flag} {r.name}</td>
                    <td style={{ fontFamily: "Sarabun, sans-serif", fontSize: 13, color: "#aaa", padding: "13px 14px" }}>{r.team}</td>
                    <td style={{ fontFamily: "Space Grotesk, sans-serif", fontSize: 12, padding: "13px 14px", color: r.pos === 1 ? "#0d0d0d" : "#777" }}>{r.time}</td>
                    <td style={{ fontFamily: "Space Grotesk, sans-serif", fontWeight: 700, fontSize: 14, padding: "13px 14px", textAlign: "right" }}>{r.pts}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {tab === "drivers" && (
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ borderBottom: "2px solid #0d0d0d" }}>
                {["POS", "", "นักแข่ง", "ทีม", "ชัย", "คะแนน"].map((h, j) => (
                  <th key={j} style={{ ...thStyle, textAlign: h === "คะแนน" ? "right" : "left", paddingBottom: 10 }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {F1_DRIVERS.map((d, i) => (
                <tr key={d.pos} style={{ borderBottom: "1px solid #f0f0f0", background: i % 2 === 0 ? "#fff" : "#fafafa" }}>
                  <td style={{ fontFamily: "Space Grotesk, sans-serif", fontWeight: 800, fontSize: 15, padding: "13px 14px", color: d.pos === 1 ? "#ffa5f7" : "#0d0d0d", width: 40 }}>{d.pos}</td>
                  <td style={{ padding: "13px 4px", width: 24 }}><div style={{ width: 3, height: 22, background: d.color, borderRadius: 1 }}></div></td>
                  <td style={{ fontFamily: "Space Grotesk, sans-serif", fontWeight: 600, fontSize: 13, padding: "13px 14px" }}>{d.flag} {d.name}</td>
                  <td style={{ fontFamily: "Sarabun, sans-serif", fontSize: 13, color: "#aaa", padding: "13px 14px" }}>{d.team}</td>
                  <td style={{ fontFamily: "Space Grotesk, sans-serif", fontSize: 13, padding: "13px 14px", textAlign: "center" }}>{d.wins > 0 ? `🏆 ${d.wins}` : "—"}</td>
                  <td style={{ padding: "13px 14px" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 10, justifyContent: "flex-end" }}>
                      <div style={{ background: "#eee", height: 4, width: 80, borderRadius: 2, overflow: "hidden", flexShrink: 0 }}>
                        <div style={{ background: d.color, height: "100%", width: `${(d.pts / 169) * 100}%`, borderRadius: 2 }}></div>
                      </div>
                      <span style={{ fontFamily: "Space Grotesk, sans-serif", fontWeight: 800, fontSize: 14, minWidth: 36, textAlign: "right" }}>{d.pts}</span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}

        {tab === "constructors" && (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 10 }}>
            {F1_CONSTRUCTORS.map((c, i) => (
              <div key={c.pos} style={{ background: "#fff", padding: "16px 20px", display: "flex", alignItems: "center", gap: 16 }}>
                <span style={{ fontFamily: "Space Grotesk, sans-serif", fontWeight: 800, fontSize: 20,
                  color: i === 0 ? "#ffa5f7" : "#ccc", minWidth: 36, textAlign: "center" }}>{c.pos}</span>
                <div style={{ width: 4, height: 44, background: c.color, borderRadius: 2, flexShrink: 0 }}></div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontFamily: "Space Grotesk, sans-serif", fontWeight: 700, fontSize: 14 }}>{c.name}</div>
                  <div style={{ background: "#f0f0f0", height: 4, borderRadius: 2, overflow: "hidden", marginTop: 8 }}>
                    <div style={{ background: c.color, height: "100%", width: `${(c.pts / 312) * 100}%`, borderRadius: 2 }}></div>
                  </div>
                </div>
                <span style={{ fontFamily: "Space Grotesk, sans-serif", fontWeight: 800, fontSize: 18, minWidth: 48, textAlign: "right" }}>{c.pts}</span>
              </div>
            ))}
          </div>
        )}

      </div>
    </div>
  );
}

// ── FOOTBALL STANDINGS ────────────────────────────────────────────────────────

function FootballStandings({ font, defaultLeague }) {
  const [league, setLeague] = useState(defaultLeague || "premier");
  useEffect(() => { setLeague(defaultLeague); }, [defaultLeague]);
  const ff = font === "serif" ? "Noto Serif Thai, serif" : "Sarabun, sans-serif";
  const data = STANDINGS[league];
  const tabs = [["premier", "Premier League"], ["thai", "Thai League 1"], ["laliga", "La Liga"]];

  return (
    <div style={{ padding: "48px 0", background: "#fff" }}>
      <div style={{ maxWidth: 1280, margin: "0 auto", padding: "0 40px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: 24, flexWrap: "wrap", gap: 16 }}>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 6 }}>
              <div style={{ width: 4, height: 18, background: "#ffa5f7" }}></div>
              <span style={{ fontFamily: "Space Grotesk, sans-serif", fontSize: 10, letterSpacing: "0.18em", color: "#aaa", textTransform: "uppercase" }}>ตารางคะแนน</span>
            </div>
            <h2 style={{ fontFamily: ff, fontWeight: 800, fontSize: 22, margin: 0, color: "#0d0d0d" }}>{data.label}</h2>
          </div>
          <div style={{ display: "flex", gap: 4 }}>
            {tabs.map(([k, label]) => (
              <button key={k} onClick={() => setLeague(k)} style={{
                padding: "7px 16px", cursor: "pointer",
                fontFamily: "Space Grotesk, sans-serif", fontWeight: 600, fontSize: 11, letterSpacing: "0.04em",
                border: `1px solid ${league === k ? "#ffa5f7" : "#ddd"}`,
                background: league === k ? "#ffa5f7" : "#fff",
                color: "#0d0d0d", transition: "all 0.15s",
              }}>{label}</button>
            ))}
          </div>
        </div>

        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ borderBottom: "2px solid #0d0d0d" }}>
              {["#", "ทีม", "แข่ง", "ชนะ", "เสมอ", "แพ้", "GD", "แต้ม"].map((h, j) => (
                <th key={j} style={{ fontFamily: "Space Grotesk, sans-serif", fontSize: 10, fontWeight: 700,
                  letterSpacing: "0.12em", color: "#888", textTransform: "uppercase",
                  padding: "10px 12px", textAlign: j <= 1 ? "left" : "center" }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.rows.map((t, i) => (
              <tr key={t.pos} style={{
                borderBottom: "1px solid #f0f0f0",
                background: i % 2 === 0 ? "#fff" : "#fafafa",
                borderLeft: `3px solid ${i < 4 ? "#ffa5f7" : i >= data.rows.length - 3 ? "#fca5a5" : "transparent"}`,
              }}>
                <td style={{ fontFamily: "Space Grotesk, sans-serif", fontWeight: 700, fontSize: 13, padding: "12px 12px",
                  textAlign: "center", color: i < 4 ? "#ffa5f7" : "#bbb", width: 36 }}>{t.pos}</td>
                <td style={{ fontFamily: ff, fontWeight: 700, fontSize: 14, padding: "12px 12px" }}>{t.name}</td>
                {[t.p, t.w, t.d, t.l, t.gd, t.pts].map((v, j) => (
                  <td key={j} style={{ fontFamily: "Space Grotesk, sans-serif",
                    fontSize: j === 5 ? 14 : 12, fontWeight: j === 5 ? 800 : 400,
                    textAlign: "center", padding: "12px 12px", color: j === 5 ? "#0d0d0d" : "#777" }}>{v}</td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>

        <div style={{ display: "flex", gap: 20, marginTop: 14, paddingTop: 14, borderTop: "1px solid #f0f0f0" }}>
          {[["#ffa5f7", "แชมเปียนส์ลีก"], ["#fca5a5", "ตกชั้น"]].map(([col, label]) => (
            <div key={label} style={{ display: "flex", gap: 8, alignItems: "center" }}>
              <div style={{ width: 10, height: 10, background: col }}></div>
              <span style={{ fontFamily: "Sarabun, sans-serif", fontSize: 12, color: "#bbb" }}>{label}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ── NEWS GRID ─────────────────────────────────────────────────────────────────

function NewsGrid({ font }) {
  return (
    <div style={{ padding: "48px 0", background: "#f4f4f4" }}>
      <div style={{ maxWidth: 1280, margin: "0 auto", padding: "0 40px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 24 }}>
          <div style={{ width: 4, height: 18, background: "#ffa5f7" }}></div>
          <span style={{ fontFamily: "Space Grotesk, sans-serif", fontSize: 10,
            letterSpacing: "0.18em", color: "#888", textTransform: "uppercase" }}>ข่าวล่าสุด</span>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 24 }}>
          {NEWS.map(n => <NewsCard key={n.id} item={n} font={font} />)}
        </div>
      </div>
    </div>
  );
}

// ── FOOTER ────────────────────────────────────────────────────────────────────

function Footer() {
  return (
    <footer style={{ background: "#0d0d0d", padding: "28px 40px",
      display: "flex", alignItems: "center", justifyContent: "space-between", gap: 20, flexWrap: "wrap" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        <img src="uploads/pasted-1780532490478-0.png" style={{ width: 30, height: 30, objectFit: "cover" }} alt="" />
        <div>
          <div style={{ fontFamily: "Space Grotesk, sans-serif", fontWeight: 800, fontSize: 9,
            letterSpacing: "0.26em", color: "rgba(255,255,255,0.38)", textTransform: "uppercase" }}>THE STANDARD</div>
          <div style={{ fontFamily: "Space Grotesk, sans-serif", fontWeight: 800, fontSize: 13,
            letterSpacing: "0.22em", color: "#ffa5f7", textTransform: "uppercase" }}>SPORT</div>
        </div>
      </div>
      <div style={{ display: "flex", gap: 28 }}>
        {["ฟุตบอล", "F1", "วอลเลย์บอล", "เทนนิส", "เกี่ยวกับเรา"].map(l => (
          <span key={l} style={{ fontFamily: "Sarabun, sans-serif", fontSize: 12, color: "rgba(255,255,255,0.35)", cursor: "pointer" }}>{l}</span>
        ))}
      </div>
      <div style={{ fontFamily: "Space Grotesk, sans-serif", fontSize: 10, color: "rgba(255,255,255,0.2)", letterSpacing: "0.04em" }}>© 2026 The Standard Co., Ltd.</div>
    </footer>
  );
}

// ── EXPORTS ───────────────────────────────────────────────────────────────────
Object.assign(window, { Navbar, HeroFull, HeroGrid, F1Section, FootballStandings, NewsGrid, Footer });
