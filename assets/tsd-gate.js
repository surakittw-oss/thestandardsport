/* Access gate ของ THE STANDARD SPORT — JS ธรรมดา ไม่ผ่าน Babel
   (ต้องรันได้ทันทีโดยไม่รอ React/Babel โหลดเสร็จ) ใช้ร่วมกันทุกหน้า
   เดิมก้อนนี้ฝังอยู่ใน index.html

   หมายเหตุจากของเดิม: การตรวจ id_token ในเบราว์เซอร์หยุดโทเคนปลอมได้ แต่ไม่ได้
   หยุดคนที่เปิด devtools ลบ gate ทิ้ง - ไม่มีอะไรที่ทำได้ทั้งหมดฝั่ง client
   เพราะตัวหน้าเว็บก็อยู่ในเครื่องเขาแล้ว พอสำหรับกันคนนอก/เสิร์ชเอนจิน ไม่ใช่ auth จริง */
(function () {
  var CLIENT_ID = '854069548103-d459etq30iidinjm5u0pcj0p746o3q9h.apps.googleusercontent.com';
  var ALLOWED_HD = 'thestandard.co';
  var STORE_KEY = 'tsdGate';
  var ACCENT = '#d81b8f';

  function b64urlToBytes(b64url) {
    var b64 = b64url.replace(/-/g, '+').replace(/_/g, '/');
    b64 += '='.repeat((4 - (b64.length % 4)) % 4);
    var bin = atob(b64);
    var bytes = new Uint8Array(bin.length);
    for (var i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
    return bytes;
  }
  function b64urlToJson(b64url) {
    return JSON.parse(new TextDecoder().decode(b64urlToBytes(b64url)));
  }

  // Verifies the id_token's RS256 signature against Google's own public keys
  // (no secret involved — this is exactly what a server would check, just run
  // in the browser with Web Crypto instead).
  window.tsdVerifyGoogleIdToken = async function (idToken) {
    var parts = idToken.split('.');
    if (parts.length !== 3) throw new Error('malformed token');
    var header = b64urlToJson(parts[0]);
    var payload = b64urlToJson(parts[1]);

    var jwks = await fetch('https://www.googleapis.com/oauth2/v3/certs').then(function (r) { return r.json(); });
    var jwk = jwks.keys.find(function (k) { return k.kid === header.kid; });
    if (!jwk) throw new Error('unknown signing key');

    var key = await crypto.subtle.importKey(
      'jwk', jwk, { name: 'RSASSA-PKCS1-v1_5', hash: 'SHA-256' }, false, ['verify']
    );
    var data = new TextEncoder().encode(parts[0] + '.' + parts[1]);
    var sig = b64urlToBytes(parts[2]);
    var valid = await crypto.subtle.verify('RSASSA-PKCS1-v1_5', key, sig, data);
    if (!valid) throw new Error('bad signature');

    var now = Math.floor(Date.now() / 1000);
    if (payload.exp < now) throw new Error('expired');
    if (payload.aud !== CLIENT_ID) throw new Error('wrong audience');
    if (payload.iss !== 'https://accounts.google.com' && payload.iss !== 'accounts.google.com') {
      throw new Error('wrong issuer');
    }
    return payload;
  };

  function showError(msg) {
    var el = document.getElementById('tsd-gate-err');
    if (!el) { alert(msg); return; }
    el.textContent = msg;
    el.style.display = 'block';
    el.style.color = ACCENT;
  }

  window.tsdHandleCredential = async function (response) {
    var box = document.getElementById('tsd-gate-err');
    if (box) box.style.display = 'none';
    try {
      var payload = await window.tsdVerifyGoogleIdToken(response.credential);
      var email = typeof payload.email === 'string' ? payload.email : '';
      var domainOk = payload.email_verified === true &&
        (payload.hd === ALLOWED_HD || email.toLowerCase().endsWith('@' + ALLOWED_HD));
      if (!domainOk) {
        showError('เข้าถึงได้เฉพาะอีเมล @' + ALLOWED_HD + ' เท่านั้น (บัญชีนี้คือ ' + (email || 'ไม่ทราบ') + ')');
        return;
      }
      localStorage.setItem(STORE_KEY, JSON.stringify({
        email: email,
        exp: Date.now() + 7 * 24 * 60 * 60 * 1000,
      }));
      document.documentElement.classList.remove('tsd-locked');
      // หน้าที่โหลดข้อมูลหลัง gate ไว้ รอสัญญาณนี้แล้วค่อยทำงาน
      document.dispatchEvent(new CustomEvent('tsd:unlocked', { detail: { email: email } }));
    } catch (e) {
      showError('ยืนยันตัวตนกับ Google ไม่สำเร็จ กรุณาลองใหม่');
    }
  };

  window.tsdLogout = function () {
    localStorage.removeItem(STORE_KEY);
    location.reload();
  };

  // ใช้ตอนพัฒนา: ปลดล็อกหน้าในเครื่องตัวเองโดยไม่ต้องมีบัญชี @thestandard.co
  // (ไม่ได้ทำให้เว็บจริงอ่อนลง - gate นี้ฝั่ง client อยู่แล้วโดยเจตนา)
  window.tsdDevUnlock = function (email) {
    localStorage.setItem(STORE_KEY, JSON.stringify({
      email: email || ('dev@' + ALLOWED_HD), exp: Date.now() + 7 * 24 * 60 * 60 * 1000,
    }));
    document.documentElement.classList.remove('tsd-locked');
    document.dispatchEvent(new CustomEvent('tsd:unlocked', { detail: { email: email, dev: true } }));
    return 'unlocked';
  };

  (function initButton() {
    var btn = document.getElementById('tsd-gate-btn');
    if (!btn) return;                                  // หน้าไหนไม่มี gate ก็ข้าม
    if (!window.google || !google.accounts || !google.accounts.id) {
      setTimeout(initButton, 150); // gsi/client loads with async/defer
      return;
    }
    // เปิดผ่าน file:// จะใช้ Google Sign-In ไม่ได้ (Google ต้องมี origin จริง)
    if (location.protocol === 'file:') {
      btn.innerHTML = '<button type="button" onclick="tsdDevUnlock()" style="font-family:Sarabun,sans-serif;' +
        'font-size:14px;padding:11px 20px;border:1px solid var(--bdr);background:var(--bg-card);cursor:pointer">' +
        'ปลดล็อกชั่วคราวสำหรับดูแบบ (file://)</button>';
      return;
    }
    google.accounts.id.initialize({
      client_id: CLIENT_ID,
      callback: window.tsdHandleCredential,
      hd: ALLOWED_HD, // UI hint only — pre-filters the account chooser
    });
    google.accounts.id.renderButton(btn, {
      theme: 'outline', size: 'large', text: 'signin_with', shape: 'pill',
    });
  })();
})();
