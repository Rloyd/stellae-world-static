/* Stellae Room · 诸界书房（独立新版）启动器
 * 把官网当前登录的星黎账号 token 以 URL fragment 形式带给独立部署的诸界书房应用，
 * 实现「从官网进入则无需再次登录」。
 *
 * 用法：openStellaeNovel()  或  openStellaeNovel('/studio')
 * 覆盖目标地址：window.__STELLAE_NOVEL_URL__ = 'https://www.stellae.world/story'
 */
(function () {
  function novelBase() {
    if (window.__STELLAE_NOVEL_URL__) return String(window.__STELLAE_NOVEL_URL__).replace(/\/$/, '');
    var h = location.hostname;
    var isLocal = h === 'localhost' || h === '127.0.0.1' || h.endsWith('.local');
    // 本地开发：诸界书房 Next.js 跑在 :3030（根路径，无 /story 前缀）
    if (isLocal) return location.protocol + '//' + h + ':3030';
    // 生产：与官网同域、挂在 /story 子路径下
    return 'https://www.stellae.world/story';
  }

  function currentToken() {
    try {
      if (window.StellaeAuth && StellaeAuth.token) return StellaeAuth.token;
      return localStorage.getItem('sr_auth_token') || '';
    } catch (e) { return ''; }
  }

  // path 默认进书架 /studio；带 token 时放在 fragment（不进 referer / 服务器日志）
  function openStellaeNovel(path) {
    var base = novelBase();
    var p = path || '/studio';
    if (p[0] !== '/') p = '/' + p;
    var token = currentToken();
    var url = base + p + '?from=stellae-room' + (token ? ('#sr_token=' + encodeURIComponent(token)) : '');
    window.open(url, '_blank', 'noopener');
  }

  window.openStellaeNovel = openStellaeNovel;
})();
