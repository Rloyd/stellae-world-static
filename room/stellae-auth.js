/* Stellae Room · auth bundle (Option A MVP)
 * Injects the login button into the existing topbar-nav.
 * 启用条件：localhost、file:// 本地预览、正式 /room/、预发 /room-staging/、子域 room-staging、?auth=beta
 */
(function () {
  const LS_TOKEN = 'sr_auth_token';
  const LS_USER  = 'sr_auth_user';
  const LS_FLAG  = 'sr_auth_beta';

  // ---- activation gate ----
  const host = location.hostname;
  const path = location.pathname || '/';
  const isFilePreview = location.protocol === 'file:';
  const isLocal = host === 'localhost' || host === '127.0.0.1' || host.endsWith('.local');
  const isMainHost = /^(www\.)?stellae\.(world|me)$/i.test(host) || host === '124.223.15.87';
  const isRoomStagingHost = /^room-staging\.stellae\.(world|me)$/i.test(host);
  const isRoomStagingPath =
    path.startsWith('/room-staging/') &&
    isMainHost;
  const isRoomStaging = isRoomStagingHost || isRoomStagingPath;
  // 把根域名也视为正式 Room 部署：path === '/' 或 '/index.html' 或 '/room/' 都启用
  // 但避免污染其他独立小站（/test/、/AlphaTesting/ 等）
  const isExcludedSubpath = /^\/(test|AlphaTesting|bp|cocreate|server)(\/|$)/.test(path);
  const isProductionRoomPath =
    isMainHost &&
    !isExcludedSubpath &&
    (path === '/' || path === '/index.html' ||
     path === '/room' || path.startsWith('/room/'));
  const params = new URLSearchParams(location.search);
  if (params.get('auth') === 'beta') localStorage.setItem(LS_FLAG, '1');
  if (params.get('auth') === 'off') localStorage.removeItem(LS_FLAG);
  const active = isFilePreview || isLocal || isRoomStaging || isProductionRoomPath || localStorage.getItem(LS_FLAG) === '1';
  if (!active) return;

  // ---- api base ----
  // 本地：必须与页面同源（127.0.0.1 与 localhost 在 CSP 里视为不同源，硬编码 localhost 会导致在 127.0.0.1 打开时请求被拦截）
  // 正式环境已在 nginx 为 www.stellae.world / stellae.world 配置 /api/v1/ 反代到本机 18787。
  function localApiBase() {
    try {
      if (typeof location !== 'undefined' && /^https?:$/i.test(location.protocol || '') && location.host) {
        return location.origin + '/api/v1';
      }
    } catch (e) { /* ignore */ }
    return 'http://127.0.0.1:8787/api/v1';
  }
  const apiBase = window.__STELLAE_API_BASE__ ||
    (isLocal ? localApiBase()
      : isRoomStagingHost ? (location.origin + '/api/v1')
        : isRoomStagingPath ? (location.origin + '/room-staging-api/api/v1')
          : (location.origin + '/api/v1'));

  // ---- tiny api client ----
  function authHeader() {
    const t = localStorage.getItem(LS_TOKEN);
    return t ? { 'Authorization': 'Bearer ' + t } : {};
  }
  async function api(path, opts = {}) {
    const r = await fetch(apiBase + path, {
      method: opts.method || 'GET',
      headers: { 'Content-Type': 'application/json', ...authHeader(), ...(opts.headers || {}) },
      credentials: 'include',
      body: opts.body ? JSON.stringify(opts.body) : undefined,
    });
    let data = null; try { data = await r.json(); } catch (e) {}
    if (!r.ok) {
      const err = new Error((data && data.message) || ('HTTP ' + r.status));
      err.status = r.status; err.data = data; throw err;
    }
    return data;
  }
  const StellaeAuth = {
    base: apiBase,
    get token() { return localStorage.getItem(LS_TOKEN) || ''; },
    get user() { try { return JSON.parse(localStorage.getItem(LS_USER) || 'null'); } catch (e) { return null; } },
    isLoggedIn() { return !!localStorage.getItem(LS_TOKEN); },
    // Phone-first auth
    requestSmsOtp(phone) { return api('/auth/sms/request', { method:'POST', body:{ phone } }); },
    phoneRegister(payload) { return api('/auth/phone/register', { method:'POST', body: payload }).then(persist); },
    phoneLogin(phone, password) { return api('/auth/phone/login', { method:'POST', body:{ phone, password } }).then(persist); },
    phoneResetPassword(payload) { return api('/auth/phone/password/reset', { method:'POST', body: payload }).then(persist); },
    // Email auxiliary auth
    requestEmailOtp(email) { return api('/auth/email/request', { method:'POST', body:{ email } }); },
    register(payload) { return api('/auth/register', { method:'POST', body: payload }).then(persist); },
    login(email, password) { return api('/auth/login', { method:'POST', body:{ email, password } }).then(persist); },
    resetPassword(payload) { return api('/auth/password/reset', { method:'POST', body: payload }).then(persist); },
    // Legacy OTP-only login (only works for users who haven't set a password yet)
    verifyEmailOtp(email, code, nickname) {
      return api('/auth/email/verify', { method:'POST', body:{ email, code, nickname } }).then(persist);
    },
    async me() {
      const d = await api('/me');
      if (d && d.user) localStorage.setItem(LS_USER, JSON.stringify(d.user));
      return d && d.user;
    },
    async logout() {
      try { await api('/auth/logout', { method:'POST' }); } catch (e) {}
      localStorage.removeItem(LS_TOKEN);
      localStorage.removeItem(LS_USER);
    },
    updateMe(patch) { return api('/me', { method:'PATCH', body: patch }); },
    submitReservation(type, form) { return api('/reservations', { method:'POST', body:{ type, form } }); },
    saveNovelDraft(draft) { return api('/novel/drafts', { method:'POST', body: draft }); },
    listNovelDrafts() { return api('/novel/drafts'); },
    sponsorIntent(amount, channel, extra) { return api('/sponsorships/intent', { method:'POST', body: Object.assign({ amount, channel }, extra || {}) }); },
    getSettings() { return api('/me/settings'); },
    updateSettings(patch) { return api('/me/settings', { method:'PATCH', body: patch }); },
  };
  function persist(data) {
    if (data && data.access_token) {
      localStorage.setItem(LS_TOKEN, data.access_token);
      localStorage.setItem(LS_USER, JSON.stringify(data.user));
    }
    return data;
  }
  window.StellaeAuth = StellaeAuth;

  // ---- styles ----
  const css = `
  .nav-btn.sr-auth-nav{position:relative;border:none;font-weight:700;border-radius:22px;padding:7px 20px;
    background:linear-gradient(135deg,#7c6df5,#a855f7,#c084fc);color:#fff;font-size:11.5px;
    box-shadow:0 2px 16px rgba(124,109,245,.35),inset 0 1px 0 rgba(255,255,255,.15);
    overflow:hidden;transition:all .3s}
  .nav-btn.sr-auth-nav::before{content:'';position:absolute;inset:0;border-radius:22px;
    background:linear-gradient(135deg,rgba(255,255,255,.18),transparent 60%);pointer-events:none}
  .nav-btn.sr-auth-nav:hover{box-shadow:0 4px 24px rgba(124,109,245,.5),inset 0 1px 0 rgba(255,255,255,.2);
    transform:translateY(-1px);filter:brightness(1.1)}
  .nav-btn.sr-auth-nav.logged{background:linear-gradient(135deg,#22c55e,#0ea5e9);
    box-shadow:0 2px 16px rgba(34,197,110,.3),inset 0 1px 0 rgba(255,255,255,.15)}
  .nav-btn.sr-auth-nav .sr-dot{width:5px;height:5px;border-radius:50%;background:#fff;opacity:.85;margin-right:3px;display:inline-block;vertical-align:1px;
    box-shadow:0 0 6px rgba(255,255,255,.6)}

  .sr-auth-mask{position:fixed;inset:0;z-index:3100;background:rgba(6,4,18,.65);backdrop-filter:blur(8px);
    -webkit-backdrop-filter:blur(8px);display:none;align-items:center;justify-content:center;padding:16px}
  .sr-auth-mask.open{display:flex}
  .sr-auth-card{width:400px;max-width:100%;background:linear-gradient(160deg,rgba(30,24,70,.94),rgba(12,10,28,.96));
    border:1px solid rgba(167,139,250,.3);border-radius:18px;padding:22px;color:#f3efff;box-shadow:0 20px 50px rgba(0,0,0,.5);font-family:inherit}
  .sr-auth-card h3{font-size:16px;font-weight:700;margin:0 0 4px;display:flex;justify-content:space-between;align-items:center}
  .sr-auth-card h3 .sr-close{background:transparent;border:none;color:#a4a0c7;font-size:18px;cursor:pointer;padding:0 4px;font-family:inherit}
  .sr-auth-card .sr-hint{font-size:11px;color:#a4a0c7;line-height:1.6;margin-bottom:14px}
  .sr-auth-field{display:flex;flex-direction:column;gap:6px;margin-bottom:12px}
  .sr-auth-field label{font-size:11px;color:#c8c2ef}
  .sr-auth-field input{padding:11px 12px;border-radius:10px;border:1px solid rgba(167,139,250,.22);
    background:rgba(255,255,255,.04);color:#fff;font-size:13px;outline:none;font-family:inherit}
  .sr-auth-field input:focus{border-color:#a78bfa;box-shadow:0 0 0 3px rgba(167,139,250,.15)}
  .sr-auth-row{display:flex;gap:8px;align-items:stretch}
  .sr-auth-row .sr-auth-field{flex:1;margin-bottom:0}
  .sr-auth-btn{padding:10px 14px;border-radius:10px;border:1px solid rgba(167,139,250,.35);
    background:rgba(124,109,245,.16);color:#ece8ff;font-size:12px;font-weight:600;cursor:pointer;font-family:inherit;white-space:nowrap}
  .sr-auth-btn:hover{background:rgba(124,109,245,.24)}
  .sr-auth-btn[disabled]{opacity:.55;cursor:not-allowed}
  .sr-auth-btn.primary{background:linear-gradient(135deg,#7c6df5,#a855f7);border-color:transparent;color:#fff;width:100%;padding:12px 14px;margin-top:6px;font-size:13px}
  .sr-auth-msg{font-size:11px;color:#a4a0c7;margin-top:10px;min-height:14px;line-height:1.5}
  .sr-auth-msg.error{color:#fca5a5}
  .sr-auth-msg.ok{color:#6ee7b7}
  .sr-menu{position:fixed;top:54px;right:14px;z-index:3050;display:none;flex-direction:column;gap:2px;padding:8px;
    background:rgba(12,10,28,.96);border:1px solid rgba(167,139,250,.3);border-radius:12px;min-width:230px;
    box-shadow:0 18px 40px rgba(0,0,0,.45);color:#ece8ff;font-size:12px;font-family:inherit}
  .sr-menu.open{display:flex}
  .sr-menu .sr-meta{padding:8px 10px;border-bottom:1px solid rgba(255,255,255,.08);margin-bottom:4px}
  .sr-menu .sr-meta b{font-size:12.5px}
  .sr-menu .sr-meta span{display:block;font-size:10px;color:#a4a0c7;margin-top:2px;word-break:break-all}
  .sr-menu button{background:transparent;border:none;color:#ece8ff;text-align:left;padding:8px 10px;border-radius:8px;
    font-size:12px;cursor:pointer;font-family:inherit}
  .sr-menu button:hover{background:rgba(124,109,245,.15)}
  .sr-menu button.danger{color:#fca5a5}

  @media(max-width:720px){
    .sr-auth-card{padding:18px}
  }
  `;
  const style = document.createElement('style');
  style.textContent = css; document.head.appendChild(style);

  // ---- helpers ----
  function el(tag, attrs, html) {
    const n = document.createElement(tag);
    if (attrs) for (const k in attrs) {
      if (k === 'onclick') n.addEventListener('click', attrs[k]);
      else n.setAttribute(k, attrs[k]);
    }
    if (html != null) n.innerHTML = html;
    return n;
  }
  function toast(msg) {
    if (typeof window.showToast === 'function') return window.showToast(msg);
    const t = el('div', {
      style: 'position:fixed;bottom:80px;left:50%;transform:translateX(-50%);z-index:4000;'+
             'background:rgba(12,10,28,.95);color:#fff;padding:10px 16px;border-radius:10px;'+
             'border:1px solid rgba(167,139,250,.35);font-size:12px;backdrop-filter:blur(6px)'
    }, msg);
    document.body.appendChild(t);
    setTimeout(() => t.remove(), 2400);
  }
  function escHtml(s) {
    return (s || '').replace(/[&<>"']/g, c => ({ '&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;', "'":'&#39;' }[c]));
  }

  // ---- button placement ----
  function findNavHost() {
    // Prefer the existing topbar nav if present.
    return document.querySelector('.topbar-nav') || document.querySelector('.topbar') || null;
  }

  function mountNavButton() {
    const host = findNavHost();
    if (!host) {
      // fallback: floating button for unusual layouts
      const fab = el('button', { id: 'srAuthFab', class: 'nav-btn sr-auth-nav',
        style: 'position:fixed;top:14px;right:14px;z-index:3000', title: 'Stellae Room 账号' });
      fab.innerHTML = `<span class="sr-dot"></span><span>登录 Stellae Room</span>`;
      fab.addEventListener('click', onFabClick);
      document.body.appendChild(fab);
      return fab;
    }
    let btn = document.getElementById('srAuthFab');
    if (btn) return btn;
    btn = el('button', { id: 'srAuthFab', class: 'nav-btn nav-login sr-auth-nav', title: 'Stellae Room 账号' });
    btn.innerHTML = `<span class="sr-dot"></span><span>登录</span>`;
    btn.addEventListener('click', onFabClick);
    host.appendChild(btn);
    return btn;
  }

  function refreshNavButton() {
    const btn = document.getElementById('srAuthFab'); if (!btn) return;
    const u = StellaeAuth.user;
    if (u) {
      btn.classList.add('logged');
      btn.innerHTML = `<span class="sr-dot"></span><span>${escHtml(u.nickname || '已登录')}</span>`;
    } else {
      btn.classList.remove('logged');
      btn.innerHTML = `<span class="sr-dot"></span><span>登录</span>`;
    }
  }

  function onFabClick(ev) {
    if (ev) ev.stopPropagation();
    if (!StellaeAuth.isLoggedIn()) return openLoginModal();
    const menu = buildMenu();
    menu.classList.toggle('open');
    setTimeout(() => {
      const onOut = (e) => {
        if (!menu.contains(e.target) && !e.target.closest('#srAuthFab')) {
          menu.classList.remove('open');
          document.removeEventListener('click', onOut, true);
        }
      };
      document.addEventListener('click', onOut, true);
    }, 0);
  }

  // ---- login / register / reset modal ----
  const REFERRAL_OPTIONS = [
    { v:'',              t:'不想说' },
    { v:'douyin',        t:'抖音' },
    { v:'xiaohongshu',   t:'小红书' },
    { v:'bilibili',      t:'B 站' },
    { v:'qq_group',      t:'QQ 群' },
    { v:'wechat_friend', t:'微信朋友' },
    { v:'friend',        t:'朋友推荐' },
    { v:'search',        t:'搜索引擎' },
    { v:'other',         t:'其他渠道' },
  ];

  function buildAuthModal() {
    const mask = el('div', { id: 'srAuthMask', class: 'sr-auth-mask' });
    mask.innerHTML = `
      <div class="sr-auth-card" role="dialog" aria-modal="true">
        <h3>登录 / 注册
          <button class="sr-close" aria-label="close">✕</button>
        </h3>
        <div class="sr-tabs" style="display:flex;gap:4px;padding:3px;background:rgba(255,255,255,.03);border:1px solid rgba(167,139,250,.2);border-radius:10px;margin-bottom:14px">
          <button class="sr-tab" data-tab="login"    style="flex:1;padding:7px 10px;border:none;border-radius:8px;background:rgba(124,109,245,.24);color:#fff;font-size:12px;font-weight:600;cursor:pointer;font-family:inherit">登录</button>
          <button class="sr-tab" data-tab="register" style="flex:1;padding:7px 10px;border:none;border-radius:8px;background:transparent;color:#c8c2ef;font-size:12px;font-weight:600;cursor:pointer;font-family:inherit">注册</button>
          <button class="sr-tab" data-tab="reset"    style="flex:1;padding:7px 10px;border:none;border-radius:8px;background:transparent;color:#c8c2ef;font-size:12px;font-weight:600;cursor:pointer;font-family:inherit">找回密码</button>
        </div>

        <!-- LOGIN PANE -->
        <div class="sr-pane" data-pane="login">
          <div class="sr-hint">手机号是主要登录方式；已绑定邮箱的老账号也可以直接输入邮箱登录。</div>
          <div class="sr-auth-field">
            <label>手机号 / 邮箱</label>
            <input type="text" id="srLoginAccount" placeholder="请输入手机号或邮箱" autocomplete="username" inputmode="tel">
          </div>
          <div class="sr-auth-field">
            <label>密码</label>
            <input type="password" id="srLoginPwd" placeholder="6-64 位字符" autocomplete="current-password">
          </div>
          <button class="sr-auth-btn primary" id="srLoginBtn">登录</button>
        </div>

        <!-- REGISTER PANE -->
        <div class="sr-pane" data-pane="register" style="display:none">
          <div class="sr-hint">使用手机号接收短信验证码，设置密码后即可登录；邮箱为可选辅助信息。</div>
          <div class="sr-auth-field">
            <label>手机号</label>
            <input type="tel" id="srRegPhone" placeholder="请输入 11 位手机号" maxlength="11" autocomplete="tel" inputmode="tel">
          </div>
          <div class="sr-auth-row">
            <div class="sr-auth-field">
              <label>短信验证码</label>
              <input type="text" id="srRegCode" maxlength="6" placeholder="6 位数字" inputmode="numeric" autocomplete="one-time-code">
            </div>
            <button class="sr-auth-btn" id="srRegSend" style="align-self:end;height:40px">发送</button>
          </div>
          <div class="sr-auth-field">
            <label>设置密码</label>
            <input type="password" id="srRegPwd" placeholder="6-64 位字符" autocomplete="new-password">
          </div>
          <div class="sr-auth-field">
            <label>昵称</label>
            <input type="text" id="srRegNickname" maxlength="40" placeholder="你希望被怎么称呼？">
          </div>
          <div class="sr-auth-field">
            <label>邮箱（选填）</label>
            <input type="email" id="srRegEmail" placeholder="用于后续通知或辅助找回" autocomplete="email">
          </div>
          <div class="sr-auth-field">
            <label>关注渠道（选填）</label>
            <select id="srRegReferral" style="padding:11px 12px;border-radius:10px;border:1px solid rgba(167,139,250,.22);background:rgba(255,255,255,.04);color:#fff;font-size:13px;outline:none;font-family:inherit">
              ${REFERRAL_OPTIONS.map(o => `<option value="${o.v}">${o.t}</option>`).join('')}
            </select>
          </div>
          <button class="sr-auth-btn primary" id="srRegBtn">注册</button>
        </div>

        <!-- RESET PANE -->
        <div class="sr-pane" data-pane="reset" style="display:none">
          <div class="sr-hint">输入手机号并获取短信验证码，即可重置密码。</div>
          <div class="sr-auth-field">
            <label>手机号</label>
            <input type="tel" id="srResetPhone" placeholder="请输入 11 位手机号" maxlength="11" autocomplete="tel" inputmode="tel">
          </div>
          <div class="sr-auth-row">
            <div class="sr-auth-field">
              <label>短信验证码</label>
              <input type="text" id="srResetCode" maxlength="6" placeholder="6 位数字" inputmode="numeric" autocomplete="one-time-code">
            </div>
            <button class="sr-auth-btn" id="srResetSend" style="align-self:end;height:40px">发送</button>
          </div>
          <div class="sr-auth-field">
            <label>新密码</label>
            <input type="password" id="srResetPwd" placeholder="6-64 位字符" autocomplete="new-password">
          </div>
          <button class="sr-auth-btn primary" id="srResetBtn">重置密码</button>
        </div>

        <div class="sr-auth-msg" id="srMsg"></div>
      </div>`;
    document.body.appendChild(mask);
    mask.addEventListener('click', e => { if (e.target === mask) closeLoginModal(); });
    mask.querySelector('.sr-close').addEventListener('click', closeLoginModal);
    mask.querySelectorAll('.sr-tab').forEach(btn => {
      btn.addEventListener('click', () => switchPane(btn.dataset.tab));
    });
    mask.querySelector('#srRegSend').addEventListener('click',   () => onSendSmsCode('srRegPhone',   'srRegSend', 'srRegCode'));
    mask.querySelector('#srResetSend').addEventListener('click', () => onSendSmsCode('srResetPhone', 'srResetSend', 'srResetCode'));
    mask.querySelector('#srLoginBtn').addEventListener('click', onLogin);
    mask.querySelector('#srRegBtn').addEventListener('click',   onRegister);
    mask.querySelector('#srResetBtn').addEventListener('click', onReset);
    mask.querySelector('#srLoginPwd').addEventListener('keydown',  e => { if (e.key === 'Enter') onLogin(); });
    mask.querySelector('#srRegPwd').addEventListener('keydown',    e => { if (e.key === 'Enter') onRegister(); });
    mask.querySelector('#srResetPwd').addEventListener('keydown',  e => { if (e.key === 'Enter') onReset(); });
    return mask;
  }

  function switchPane(name) {
    const mask = document.getElementById('srAuthMask'); if (!mask) return;
    mask.querySelectorAll('.sr-tab').forEach(b => {
      const on = b.dataset.tab === name;
      b.style.background = on ? 'rgba(124,109,245,.24)' : 'transparent';
      b.style.color = on ? '#fff' : '#c8c2ef';
    });
    mask.querySelectorAll('.sr-pane').forEach(p => {
      p.style.display = p.dataset.pane === name ? '' : 'none';
    });
    setMsg('', '');
  }

  function openLoginModal() {
    let mask = document.getElementById('srAuthMask');
    if (!mask) mask = buildAuthModal();
    mask.classList.add('open');
    switchPane('login');
    setTimeout(() => {
      const input = document.getElementById('srLoginAccount');
      if (input) input.focus();
    }, 50);
  }
  function closeLoginModal() {
    const m = document.getElementById('srAuthMask');
    if (m) m.classList.remove('open');
  }
  function setMsg(text, kind) {
    const elMsg = document.getElementById('srMsg'); if (!elMsg) return;
    elMsg.textContent = text || '';
    elMsg.className = 'sr-auth-msg' + (kind ? ' ' + kind : '');
  }

  function readableErr(err, fallback) {
    const msg = err && (err.message || String(err)) || '';
    if (!msg) return fallback;
    if (/Failed to fetch|NetworkError|Load failed/i.test(msg)) {
      return '网络连接失败：注册服务网关暂不可达，请稍后重试。';
    }
    return msg;
  }
  function isPhone(v) { return /^1\d{10}$/.test(String(v || '').trim()); }
  function isEmail(v) { return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(v || '').trim()); }

  const cooldownTimers = {};
  function startCooldown(btnId, sec) {
    const btn = document.getElementById(btnId); if (!btn) return;
    clearInterval(cooldownTimers[btnId]);
    btn.disabled = true;
    let left = sec;
    btn.textContent = left + 's';
    cooldownTimers[btnId] = setInterval(() => {
      left--;
      if (left <= 0) {
        clearInterval(cooldownTimers[btnId]);
        btn.disabled = false; btn.textContent = '发送';
      } else btn.textContent = left + 's';
    }, 1000);
  }

  async function onSendSmsCode(phoneInputId, btnId, codeFieldId) {
    const phone = (document.getElementById(phoneInputId).value || '').trim();
    if (!isPhone(phone)) { setMsg('请输入正确的 11 位手机号', 'error'); return; }
    setMsg('正在发送短信验证码…', '');
    try {
      const d = await StellaeAuth.requestSmsOtp(phone);
      if (d.dev_code) {
        const cf = document.getElementById(codeFieldId); if (cf) cf.value = d.dev_code;
        setMsg('本地模式已自动填入验证码：' + d.dev_code, 'ok');
      } else if (d.delivered) {
        setMsg('短信验证码已发送，5 分钟内有效。', 'ok');
      } else {
        setMsg('验证码已生成，请查看服务端控制台（短信未配置）', 'ok');
      }
      startCooldown(btnId, 60);
    } catch (e) {
      setMsg(readableErr(e, '发送失败'), 'error');
    }
  }

  async function onLogin() {
    const btn = document.getElementById('srLoginBtn');
    const account = (document.getElementById('srLoginAccount').value || '').trim();
    const pwd   = (document.getElementById('srLoginPwd').value || '');
    if (!isPhone(account) && !isEmail(account)) { setMsg('请输入正确的手机号或邮箱', 'error'); return; }
    if (!pwd) { setMsg('请输入密码', 'error'); return; }
    btn.disabled = true; setMsg('正在登录…', '');
    try {
      if (isPhone(account)) await StellaeAuth.phoneLogin(account, pwd);
      else await StellaeAuth.login(account, pwd);
      setMsg('登录成功 💜', 'ok');
      refreshNavButton();
      setTimeout(() => { closeLoginModal(); toast('登录成功'); }, 400);
    } catch (e) {
      setMsg(readableErr(e, '登录失败'), 'error');
    } finally { btn.disabled = false; }
  }

  async function onRegister() {
    const btn = document.getElementById('srRegBtn');
    const phone    = (document.getElementById('srRegPhone').value || '').trim();
    const email    = (document.getElementById('srRegEmail').value || '').trim();
    const code     = (document.getElementById('srRegCode').value || '').trim();
    const password = (document.getElementById('srRegPwd').value || '');
    const nickname = (document.getElementById('srRegNickname').value || '').trim();
    const referral = document.getElementById('srRegReferral').value || '';
    if (!isPhone(phone)) { setMsg('请输入正确的 11 位手机号', 'error'); return; }
    if (email && !isEmail(email)) { setMsg('邮箱格式不正确', 'error'); return; }
    if (!/^\d{6}$/.test(code)) { setMsg('请输入 6 位验证码', 'error'); return; }
    if (password.length < 6 || password.length > 64) { setMsg('密码长度需 6-64 位', 'error'); return; }
    if (!nickname) { setMsg('请填写昵称', 'error'); return; }
    btn.disabled = true; setMsg('正在注册…', '');
    try {
      await StellaeAuth.phoneRegister({ phone, email, code, password, nickname, referral_source: referral });
      setMsg('注册成功 ✨', 'ok');
      refreshNavButton();
      setTimeout(() => { closeLoginModal(); toast('欢迎加入星黎 💜'); }, 400);
    } catch (e) {
      setMsg(readableErr(e, '注册失败'), 'error');
    } finally { btn.disabled = false; }
  }

  async function onReset() {
    const btn = document.getElementById('srResetBtn');
    const phone    = (document.getElementById('srResetPhone').value || '').trim();
    const code     = (document.getElementById('srResetCode').value || '').trim();
    const password = (document.getElementById('srResetPwd').value || '');
    if (!isPhone(phone)) { setMsg('请输入正确的 11 位手机号', 'error'); return; }
    if (!/^\d{6}$/.test(code)) { setMsg('请输入 6 位验证码', 'error'); return; }
    if (password.length < 6 || password.length > 64) { setMsg('密码长度需 6-64 位', 'error'); return; }
    btn.disabled = true; setMsg('正在重置…', '');
    try {
      await StellaeAuth.phoneResetPassword({ phone, code, password });
      setMsg('密码已重置 ✅', 'ok');
      refreshNavButton();
      setTimeout(() => { closeLoginModal(); toast('密码已更新，已自动登录'); }, 400);
    } catch (e) {
      setMsg(readableErr(e, '重置失败'), 'error');
    } finally { btn.disabled = false; }
  }

  // ---- user menu ----
  function buildMenu() {
    let menu = document.getElementById('srMenu');
    if (menu) menu.remove();
    menu = el('div', { id: 'srMenu', class: 'sr-menu' });
    const u = StellaeAuth.user || {};
    menu.innerHTML = `
      <div class="sr-meta">
        <b>${escHtml(u.nickname || '未命名用户')}</b>
        <span>ID · ${escHtml(u.stellae_id || '')}</span>
        ${u.phone ? `<span>${escHtml(u.phone)}</span>` : ''}
        <span>${escHtml(u.email || '')}</span>
      </div>
      <button data-a="refresh">🔄 刷新资料</button>
      <button data-a="drafts">📚 我的诸界草稿</button>
      <button data-a="reservations">🎟️ 我的申请</button>
      <button data-a="support-room">☕ 支持星黎</button>
      <button data-a="sponsors">☕ 我的支持记录</button>
      <button data-a="copy-id">🆔 复制 Stellae ID</button>
      <button class="danger" data-a="logout">🚪 退出登录</button>`;
    document.body.appendChild(menu);
    menu.addEventListener('click', async (e) => {
      const t = e.target.closest('button'); if (!t) return;
      const a = t.dataset.a;
      menu.classList.remove('open');
      try {
        if (a === 'refresh') { await StellaeAuth.me(); refreshNavButton(); toast('已刷新'); }
        else if (a === 'drafts') {
          const d = await StellaeAuth.listNovelDrafts();
          toast(`共有 ${d.items.length} 份草稿`); console.table(d.items);
        }
        else if (a === 'reservations') {
          const r = await fetch(apiBase + '/reservations', { headers: authHeader(), credentials:'include' }).then(r=>r.json());
          toast(`共有 ${(r.items||[]).length} 次申请`); console.table(r.items);
        }
        else if (a === 'support-room') {
          if (typeof window.openModal === 'function') window.openModal('sponsor');
          else toast('请刷新页面后重试');
        }
        else if (a === 'sponsors') {
          const d = await fetch(apiBase + '/sponsorships/mine', { headers: authHeader(), credentials:'include' }).then(r=>r.json());
          if (d.ok) showSponsorHistory(d); else toast('获取支持记录失败');
        }
        else if (a === 'copy-id') { await navigator.clipboard.writeText(u.stellae_id || ''); toast('Stellae ID 已复制'); }
        else if (a === 'logout') { await StellaeAuth.logout(); refreshNavButton(); toast('已退出'); }
      } catch (err) { toast('操作失败：' + (err.message || '')); }
    });
    return menu;
  }

  // ---- sponsor history modal ----
  function showSponsorHistory(data) {
    let mask = document.getElementById('srSponsorMask');
    if (mask) mask.remove();
    mask = el('div', { id:'srSponsorMask', class:'sr-auth-mask' });
    const items = data.items || [];
    const stats = data.stats || { total_count:0, total_amount:0 };
    const statusMap = { intent:'待支付', pending:'待支付', success:'已完成', failed:'失败', expired:'已关闭' };
    const statusColor = { intent:'var(--gold,#f59e0b)', pending:'var(--gold,#f59e0b)', success:'#22c55e', failed:'#ef4444', expired:'#94a3b8' };
    let rows = '';
    if (items.length === 0) {
      rows = '<div style="text-align:center;color:#a4a0c7;padding:30px 0;font-size:12px">暂无支持记录<br><span style="font-size:10px;opacity:.6">给星黎买杯咖啡吧 ☕</span></div>';
    } else {
      rows = items.map(it => `
        <div style="display:flex;align-items:center;gap:10px;padding:10px 12px;border-radius:10px;background:rgba(255,255,255,.03);border:1px solid rgba(255,255,255,.06)">
          <div style="font-size:20px;flex-shrink:0">☕</div>
          <div style="flex:1;min-width:0">
            <div style="font-size:12px;font-weight:600;color:#ece8ff">¥${Number(it.amount).toFixed(1)}</div>
            <div style="font-size:9px;color:#a4a0c7;margin-top:2px">${escHtml(it.created_at || '')}</div>
          </div>
          <div style="font-size:10px;font-weight:600;padding:3px 8px;border-radius:5px;background:rgba(255,255,255,.05);color:${statusColor[it.status]||'#a4a0c7'}">${statusMap[it.status]||it.status}</div>
        </div>`).join('');
    }
    mask.innerHTML = `
      <div class="sr-auth-card" style="max-width:420px">
        <h3>☕ 我的支持记录
          <button class="sr-close" aria-label="close">✕</button>
        </h3>
        <div style="display:flex;gap:12px;margin:12px 0 16px">
          <div style="flex:1;padding:12px;border-radius:10px;background:rgba(124,109,245,.08);border:1px solid rgba(124,109,245,.2);text-align:center">
            <div style="font-size:22px;font-weight:800;color:#c084fc">${stats.total_count}</div>
            <div style="font-size:9px;color:#a4a0c7;margin-top:2px">累计次数</div>
          </div>
          <div style="flex:1;padding:12px;border-radius:10px;background:rgba(245,158,11,.06);border:1px solid rgba(245,158,11,.2);text-align:center">
            <div style="font-size:22px;font-weight:800;color:#fbbf24">¥${Number(stats.total_amount).toFixed(1)}</div>
            <div style="font-size:9px;color:#a4a0c7;margin-top:2px">累计金额</div>
          </div>
        </div>
        <div style="display:flex;flex-direction:column;gap:6px;max-height:300px;overflow-y:auto">${rows}</div>
      </div>`;
    document.body.appendChild(mask);
    mask.addEventListener('click', e => { if (e.target === mask) mask.remove(); });
    mask.querySelector('.sr-close').addEventListener('click', () => mask.remove());
    mask.classList.add('open');
  }

  // ---- boot ----
  function boot() {
    mountNavButton();
    refreshNavButton();
    if (StellaeAuth.isLoggedIn()) {
      StellaeAuth.me().then(refreshNavButton).catch(() => {
        localStorage.removeItem(LS_TOKEN); localStorage.removeItem(LS_USER); refreshNavButton();
      });
    }
    // If the topbar was rendered late (some sites rebuild nav), watch for it.
    const mo = new MutationObserver(() => {
      if (!document.getElementById('srAuthFab')) { mountNavButton(); refreshNavButton(); }
    });
    mo.observe(document.body, { childList:true, subtree:true });
  }
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else { boot(); }

  // ---- optional hooks: push reservation form to backend too ----
  const origHandleReserve = window.handleReserve;
  window.handleReserve = async function () {
    if (typeof origHandleReserve === 'function') origHandleReserve.apply(this, arguments);
    if (!StellaeAuth.isLoggedIn()) return;
    try {
      const form = {
        nickname: (document.getElementById('rsv-name') || {}).value || '',
        phone:    (document.getElementById('rsv-phone') || {}).value || '',
        email:    (document.getElementById('rsv-email') || {}).value || '',
      };
      if (!form.nickname && !form.phone && !form.email) return;
      await StellaeAuth.submitReservation('testflight', form);
      toast('申请已同步到你的账号');
    } catch (e) { console.warn('reservation sync fail', e); }
  };

  console.log('[StellaeAuth] active · api =', apiBase);
})();
