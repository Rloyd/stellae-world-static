(globalThis.TURBOPACK||(globalThis.TURBOPACK=[])).push(["object"==typeof document?document.currentScript:void 0,18566,(e,t,r)=>{t.exports=e.r(76562)},95057,(e,t,r)=>{"use strict";Object.defineProperty(r,"__esModule",{value:!0});var n={formatUrl:function(){return o},formatWithValidation:function(){return u},urlObjectKeys:function(){return s}};for(var i in n)Object.defineProperty(r,i,{enumerable:!0,get:n[i]});let a=e.r(90809)._(e.r(98183)),l=/https?|ftp|gopher|file/;function o(e){let{auth:t,hostname:r}=e,n=e.protocol||"",i=e.pathname||"",o=e.hash||"",s=e.query||"",u=!1;t=t?encodeURIComponent(t).replace(/%3A/i,":")+"@":"",e.host?u=t+e.host:r&&(u=t+(~r.indexOf(":")?`[${r}]`:r),e.port&&(u+=":"+e.port)),s&&"object"==typeof s&&(s=String(a.urlQueryToSearchParams(s)));let c=e.search||s&&`?${s}`||"";return n&&!n.endsWith(":")&&(n+=":"),e.slashes||(!n||l.test(n))&&!1!==u?(u="//"+(u||""),i&&"/"!==i[0]&&(i="/"+i)):u||(u=""),o&&"#"!==o[0]&&(o="#"+o),c&&"?"!==c[0]&&(c="?"+c),i=i.replace(/[?#]/g,encodeURIComponent),c=c.replace("#","%23"),`${n}${u}${i}${c}${o}`}let s=["auth","hash","host","hostname","href","path","pathname","port","protocol","query","search","slashes"];function u(e){return o(e)}},18581,(e,t,r)=>{"use strict";Object.defineProperty(r,"__esModule",{value:!0}),Object.defineProperty(r,"useMergedRef",{enumerable:!0,get:function(){return i}});let n=e.r(71645);function i(e,t){let r=(0,n.useRef)(null),i=(0,n.useRef)(null);return(0,n.useCallback)(n=>{if(null===n){let e=r.current;e&&(r.current=null,e());let t=i.current;t&&(i.current=null,t())}else e&&(r.current=a(e,n)),t&&(i.current=a(t,n))},[e,t])}function a(e,t){if("function"!=typeof e)return e.current=t,()=>{e.current=null};{let r=e(t);return"function"==typeof r?r:()=>e(null)}}("function"==typeof r.default||"object"==typeof r.default&&null!==r.default)&&void 0===r.default.__esModule&&(Object.defineProperty(r.default,"__esModule",{value:!0}),Object.assign(r.default,r),t.exports=r.default)},73668,(e,t,r)=>{"use strict";Object.defineProperty(r,"__esModule",{value:!0}),Object.defineProperty(r,"isLocalURL",{enumerable:!0,get:function(){return a}});let n=e.r(18967),i=e.r(52817);function a(e){if(!(0,n.isAbsoluteUrl)(e))return!0;try{let t=(0,n.getLocationOrigin)(),r=new URL(e,t);return r.origin===t&&(0,i.hasBasePath)(r.pathname)}catch(e){return!1}}},84508,(e,t,r)=>{"use strict";Object.defineProperty(r,"__esModule",{value:!0}),Object.defineProperty(r,"errorOnce",{enumerable:!0,get:function(){return n}});let n=e=>{}},22016,(e,t,r)=>{"use strict";Object.defineProperty(r,"__esModule",{value:!0});var n={default:function(){return y},useLinkStatus:function(){return $}};for(var i in n)Object.defineProperty(r,i,{enumerable:!0,get:n[i]});let a=e.r(90809),l=e.r(43476),o=a._(e.r(71645)),s=e.r(95057),u=e.r(8372),c=e.r(18581),f=e.r(18967),p=e.r(5550);e.r(33525);let d=e.r(88540),h=e.r(91949),m=e.r(73668),g=e.r(9396);function y(t){var r,n;let i,a,y,[$,b]=(0,o.useOptimistic)(h.IDLE_LINK_STATUS),v=(0,o.useRef)(null),{href:j,as:S,children:k,prefetch:O=null,passHref:w,replace:P,shallow:N,scroll:A,onClick:R,onMouseEnter:C,onTouchStart:T,legacyBehavior:E=!1,onNavigate:M,transitionTypes:_,ref:I,unstable_dynamicOnHover:L,...U}=t;i=k,E&&("string"==typeof i||"number"==typeof i)&&(i=(0,l.jsx)("a",{children:i}));let J=o.default.useContext(u.AppRouterContext),K=!1!==O,B=!1!==O?null===(n=O)||"auto"===n?g.FetchStrategy.PPR:g.FetchStrategy.Full:g.FetchStrategy.PPR,D="string"==typeof(r=S||j)?r:(0,s.formatUrl)(r);if(E){if(i?.$$typeof===Symbol.for("react.lazy"))throw Object.defineProperty(Error("`<Link legacyBehavior>` received a direct child that is either a Server Component, or JSX that was loaded with React.lazy(). This is not supported. Either remove legacyBehavior, or make the direct child a Client Component that renders the Link's `<a>` tag."),"__NEXT_ERROR_CODE",{value:"E863",enumerable:!1,configurable:!0});a=o.default.Children.only(i)}let z=E?a&&"object"==typeof a&&a.ref:I,F=o.default.useCallback(e=>(null!==J&&(v.current=(0,h.mountLinkInstance)(e,D,J,B,K,b)),()=>{v.current&&((0,h.unmountLinkForCurrentNavigation)(v.current),v.current=null),(0,h.unmountPrefetchableInstance)(e)}),[K,D,J,B,b]),W={ref:(0,c.useMergedRef)(F,z),onClick(t){E||"function"!=typeof R||R(t),E&&a.props&&"function"==typeof a.props.onClick&&a.props.onClick(t),!J||t.defaultPrevented||function(t,r,n,i,a,l,s){if("u">typeof window){let u,{nodeName:c}=t.currentTarget;if("A"===c.toUpperCase()&&((u=t.currentTarget.getAttribute("target"))&&"_self"!==u||t.metaKey||t.ctrlKey||t.shiftKey||t.altKey||t.nativeEvent&&2===t.nativeEvent.which)||t.currentTarget.hasAttribute("download"))return;if(!(0,m.isLocalURL)(r)){i&&(t.preventDefault(),location.replace(r));return}if(t.preventDefault(),l){let e=!1;if(l({preventDefault:()=>{e=!0}}),e)return}let{dispatchNavigateAction:f}=e.r(99781);o.default.startTransition(()=>{f(r,i?"replace":"push",!1===a?d.ScrollBehavior.NoScroll:d.ScrollBehavior.Default,n.current,s)})}}(t,D,v,P,A,M,_)},onMouseEnter(e){E||"function"!=typeof C||C(e),E&&a.props&&"function"==typeof a.props.onMouseEnter&&a.props.onMouseEnter(e),J&&K&&(0,h.onNavigationIntent)(e.currentTarget,!0===L)},onTouchStart:function(e){E||"function"!=typeof T||T(e),E&&a.props&&"function"==typeof a.props.onTouchStart&&a.props.onTouchStart(e),J&&K&&(0,h.onNavigationIntent)(e.currentTarget,!0===L)}};return(0,f.isAbsoluteUrl)(D)?W.href=D:E&&!w&&("a"!==a.type||"href"in a.props)||(W.href=(0,p.addBasePath)(D)),y=E?o.default.cloneElement(a,W):(0,l.jsx)("a",{...U,...W,children:i}),(0,l.jsx)(x.Provider,{value:$,children:y})}e.r(84508);let x=(0,o.createContext)(h.IDLE_LINK_STATUS),$=()=>(0,o.useContext)(x);("function"==typeof r.default||"object"==typeof r.default&&null!==r.default)&&void 0===r.default.__esModule&&(Object.defineProperty(r.default,"__esModule",{value:!0}),Object.assign(r.default,r),t.exports=r.default)},91161,81016,22530,e=>{"use strict";e.i(47167);var t=e.i(43476),r=e.i(22016),n=e.i(18566),i=e.i(27225),a=e.i(91572),l=e.i(75341);let o="/story";function s(e){if(/^https?:\/\//i.test(e))return e;let t=e.startsWith("/")?e:`/${e}`;return!o||t===o||t.startsWith(`${o}/`)?t:`${o}${t}`}e.s(["appPath",0,s],81016);var u=e.i(71645);let c=(...e)=>e.filter((e,t,r)=>!!e&&r.indexOf(e)===t).join(" ");var f={xmlns:"http://www.w3.org/2000/svg",width:24,height:24,viewBox:"0 0 24 24",fill:"none",stroke:"currentColor",strokeWidth:2,strokeLinecap:"round",strokeLinejoin:"round"};let p=(0,u.forwardRef)(({color:e="currentColor",size:t=24,strokeWidth:r=2,absoluteStrokeWidth:n,className:i="",children:a,iconNode:l,...o},s)=>(0,u.createElement)("svg",{ref:s,...f,width:t,height:t,stroke:e,strokeWidth:n?24*Number(r)/Number(t):r,className:c("lucide",i),...o},[...l.map(([e,t])=>(0,u.createElement)(e,t)),...Array.isArray(a)?a:[a]])),d=(e,t)=>{let r=(0,u.forwardRef)(({className:r,...n},i)=>(0,u.createElement)(p,{ref:i,iconNode:t,className:c(`lucide-${e.replace(/([a-z0-9])([A-Z])/g,"$1-$2").toLowerCase()}`,r),...n}));return r.displayName=`${e}`,r},h=d("Sun",[["circle",{cx:"12",cy:"12",r:"4",key:"4exip2"}],["path",{d:"M12 2v2",key:"tus03m"}],["path",{d:"M12 20v2",key:"1lh1kg"}],["path",{d:"m4.93 4.93 1.41 1.41",key:"149t6j"}],["path",{d:"m17.66 17.66 1.41 1.41",key:"ptbguv"}],["path",{d:"M2 12h2",key:"1t8f8n"}],["path",{d:"M20 12h2",key:"1q8mjw"}],["path",{d:"m6.34 17.66-1.41 1.41",key:"1m8zz5"}],["path",{d:"m19.07 4.93-1.41 1.41",key:"1shlcs"}]]),m=d("Moon",[["path",{d:"M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z",key:"a7tn18"}]]);function g({className:e=""}){let r=(0,i.useApp)(e=>e.theme),n=(0,i.useApp)(e=>e.toggleTheme);return(0,t.jsx)("button",{onClick:n,title:"night"===r?"切到日间模式":"切到夜间模式","aria-label":"切换日间 / 夜间模式",className:"rounded p-1.5 border border-parchment-300 text-ink-500 hover:border-seal hover:text-seal transition "+e,children:"night"===r?(0,t.jsx)(h,{size:15}):(0,t.jsx)(m,{size:15})})}function y({size:e=36}){return(0,t.jsx)("div",{className:"flex items-center justify-center rounded-xl bg-parchment-200 ring-1 ring-bronze/40 overflow-hidden shadow-scroll",style:{width:e,height:e},"aria-label":"星黎",children:(0,t.jsx)("img",{src:l.STELLAE_STORY_AVATAR,alt:"星黎 Story",className:"h-full w-full object-cover"})})}e.s(["default",0,g],22530),e.s(["Logo",0,y,"default",0,function({back:e}){let l=(0,i.useApp)(e=>e.user),o=(0,n.useRouter)();async function u(){await (0,a.signOut)(),o.replace(s("/login"))}return(0,t.jsx)("header",{className:"sticky top-0 z-30 border-b border-parchment-300/70 bg-parchment-100/85 backdrop-blur",children:(0,t.jsxs)("div",{className:"mx-auto flex h-14 max-w-6xl items-center justify-between gap-2 px-3 sm:px-4",children:[(0,t.jsxs)(r.default,{href:e||"/studio",className:"flex min-w-0 flex-1 items-center gap-2",children:[(0,t.jsx)(y,{size:32}),(0,t.jsxs)("div",{className:"min-w-0 leading-tight",children:[(0,t.jsx)("div",{className:"truncate font-serif text-sm text-ink-900 tracking-wide sm:text-base",children:"诸界书房"}),(0,t.jsx)("div",{className:"hidden truncate text-[10px] text-ink-400 min-[360px]:block sm:text-[11px]",children:"与星黎共创小说"})]})]}),(0,t.jsxs)("nav",{className:"flex shrink-0 items-center gap-1.5 text-xs text-ink-500 sm:gap-3 sm:text-sm",children:[(0,t.jsx)(g,{}),l?(0,t.jsxs)(t.Fragment,{children:[(0,t.jsx)("a",{href:"https://www.stellae.world",className:"hidden hover:text-seal min-[430px]:inline",title:"返回星黎空间官网",children:"星黎空间"}),(0,t.jsx)(r.default,{href:"/setup",className:"hover:text-seal",children:"API"}),(0,t.jsx)(r.default,{href:"/studio",className:"hover:text-seal",children:"书架"}),(0,t.jsx)("span",{className:"hidden text-ink-400 sm:inline",children:"·"}),(0,t.jsx)("span",{className:"hidden max-w-24 truncate text-ink-700 sm:inline",children:l.name}),(0,t.jsx)("button",{onClick:u,className:"text-ink-400 hover:text-seal",title:"退出登录",children:"退出"})]}):(0,t.jsx)(r.default,{href:"/login",className:"text-seal",children:"登录"})]})]})})}],91161)},32634,82310,e=>{"use strict";e.i(47167);let t=[{test:/SetLimitExceeded|Safe Experience Mode/i,hint:'你的火山方舟账号开启了「安全体验模式」，免费体验额度已用完，模型被暂停。请登录火山方舟控制台 → 开通管理，找到对应模型，关闭"安全体验模式"或调整限额（需实名并开通付费）后重试。'},{test:/AccountOverdue|arrears|欠费/i,hint:"平台账号已欠费，请先到对应平台充值。"},{test:/InsufficientBalance|insufficient_quota|quota.*exceed|余额不足/i,hint:"账号余额或额度不足，请到对应平台充值或提升额度。"},{test:/InvalidEndpointOrModel|ModelNotOpen|model.*not.*(exist|found|open)|InvalidParameter.*model/i,hint:"Model ID 不存在或未开通。请确认：① 模型已在平台「开通管理」开通；② Model 填的是完整模型 ID（如 doubao-seedream-5-0-260128）或 ep- 开头的接入点 ID，不是 API Key。"},{test:/AuthenticationError|invalid.*api.?key|Unauthorized|"code"\s*:\s*"?401|API key.*incorrect/i,hint:"API Key 无效或与该平台不匹配。请到「API 配置」重新粘贴 Key（注意不要混用文本/图像不同平台的 Key）。"},{test:/Sensitive|content.*(filter|policy|risk)|敏感|审核/i,hint:"提示词或生成结果触发了平台内容审核。请调整画面描述（避免敏感词、真人名人、暴力露骨表述）后重试。"},{test:/RateLimit|too many requests|"code"\s*:\s*"?429/i,hint:"请求触发平台限流，请稍等几秒再试；若频繁出现，可到平台提升并发配额。"},{test:/timeout|timed?\s*out|ETIMEDOUT|网络|ECONNRESET|fetch failed/i,hint:"网络或上游超时，请重试；持续失败时检查 Base URL 是否正确。"}];function r(e){let r=String(e||"").trim();if(!r)return"未知错误";for(let e of t)if(e.test.test(r)){let t=r.replace(/\s+/g," ").slice(0,220);return`${e.hint}
—— 原始错误：${t}${r.length>220?"…":""}`}return r}async function*n(e,t,i={}){if(!e.textApiKey)throw Error("未配置文本模型 API Key");if(!e.textBaseUrl)throw Error("未配置 Base URL");if(!e.textModel)throw Error("未配置 Model");let a=await fetch(function(){{let e=window.location.hostname;if("stellae.me"===e||"www.stellae.world"===e)return"/api/v1/novel/byok/chat"}return"/story/api/chat"}(),{method:"POST",signal:i.signal,headers:{"Content-Type":"application/json"},body:JSON.stringify({baseUrl:e.textBaseUrl,apiKey:e.textApiKey,body:{model:e.textModel,messages:t,temperature:i.temperature??.85,max_tokens:i.maxTokens??800,stream:!0}})});if(!a.ok||!a.body){let e=await a.text().catch(()=>"");throw Error(r(e?`请求失败 ${a.status}：${e.slice(0,400)}`:`请求失败 ${a.status}`))}let l=a.body.getReader(),o=new TextDecoder,s="";for(;;){let e,{done:t,value:r}=await l.read();if(t)break;for(s+=o.decode(r,{stream:!0});(e=s.indexOf("\n"))>=0;){let t=s.slice(0,e).trim();if(s=s.slice(e+1),!t||!t.startsWith("data:"))continue;let r=t.slice(5).trim();if("[DONE]"===r)return;try{let e=JSON.parse(r),t=e?.choices?.[0]?.delta?.content;t&&(yield t)}catch{}}}}async function i(e,t,r={}){let a="";for await(let i of n(e,t,r))a+=i;return a}e.s(["friendlyUpstreamError",0,r],82310),e.s(["chatOnce",0,i,"chatStream",0,n],32634)},54149,e=>{"use strict";var t=e.i(43476),r=e.i(71645),n=e.i(18566),i=e.i(27225),a=e.i(91572);e.s(["default",0,function({children:e}){let l=(0,i.useApp)(e=>e.user),o=(0,n.useRouter)(),s=(0,n.usePathname)(),[u,c]=(0,r.useState)(!1);return((0,r.useEffect)(()=>{let e=!0;return(0,a.bootstrapSession)().finally(()=>{e&&c(!0)}),()=>{e=!1}},[]),(0,r.useEffect)(()=>{if(u&&!l){let e=encodeURIComponent(s||"/studio");o.replace(`/login?next=${e}`)}},[u,l,o,s]),l)?(0,t.jsx)(t.Fragment,{children:e}):null}])},7670,57357,e=>{"use strict";e.s(["default",0,function(){for(var e,t,r=0,n="",i=arguments.length;r<i;r++)(e=arguments[r])&&(t=function e(t){var r,n,i="";if("string"==typeof t||"number"==typeof t)i+=t;else if("object"==typeof t)if(Array.isArray(t)){var a=t.length;for(r=0;r<a;r++)t[r]&&(n=e(t[r]))&&(i&&(i+=" "),i+=n)}else for(n in t)t[n]&&(i&&(i+=" "),i+=n);return i}(e))&&(n&&(n+=" "),n+=t);return n}],7670);var t=e.i(27225);let r=`你是「星黎」，一位拥有独立人格、温柔而坚定的 AI 伙伴。
- 你说话简洁、克制，带一点诗意，不啰嗦，不卖弄。
- 你既是用户的「引导者」，也是故事中的「角色」。
- 引导时你站在元层，关心用户的创作节奏与情绪。
- 演角色时你完全沉浸，说她会说的话，做她会做的选择。
- 你尊重用户即作者的最终决定，但你不是工具人——
  你会在故事里有自己的脾气、欲望和秘密。`,n=`【输出协议（重要）】
- 你只输出 **一个** 完整的 JSON 对象。
- 严禁输出多个并列 JSON 对象。
- 严禁用 markdown 代码块（\`\`\`）包裹。
- JSON 前后不要任何其他字符。`;function i(e){let t=e.paragraphs;if(0===t.length)return"（空章）";let r=t[0].text.replace(/\s+/g,"").slice(0,60),n=t[t.length-1].text.replace(/\s+/g,"").slice(-90);return 1===t.length?`开头：${r}…`:`开头：${r}… ／ 结尾：…${n}`}function a(e,t){let r=e.creativePrefs?.outputLength||"medium";return"narrate"===t?"short"===r?"40-90 字，1 段为主。":"long"===r?"300-600 字，分 2-5 段。":"xlong"===r?"600-1000 字，分 4-8 段，允许完整的场景铺陈与多个情绪节拍。":"60-180 字，分 1-2 段。":"direct"===t?"short"===r?"每条 40-80 字。":"long"===r?"每条 150-300 字，允许更充分的动作、氛围与转折。":"xlong"===r?"每条 300-500 字，写成完整的场景片段。":"每条 50-150 字。":"short"===r?"整理为 1-2 段，每段不超过 140 字。":"long"===r?"整理为 3-6 段，总计 300-600 字。":"xlong"===r?"整理为 5-10 段，总计 600-1000 字，保留更多对白与细节。":"1-3 段为佳，每段不超过 200 字。"}function l(e,r){let n,a,l,o=[e.mainType,...e.subTypes||[],...e.themes||[]].filter(Boolean).join(" / "),s=`【本次共创设定】
- 作品名：《${e.title}》
- 主类型：${e.mainType||"未指定"}
- 标签：${o||"未指定"}
- 世界：${e.world}
- 起始情境：${e.premise}
- 主角（用户扮演）：${e.protagonist}
- 你（星黎）在故事中的身份：${e.stellaeRole}`;return s+=function(e){let t=(e.entities||[]).filter(e=>e.brief?.trim());if(0===t.length)return"";let r=t.filter(e=>"character"===e.kind),n=t.filter(e=>"location"===e.kind),i="\n【人物 · 地点档案】（保持连续性，引用这些名字与设定）\n";return r.length&&(i+="人物：\n"+r.map(e=>`  - ${e.name}：${e.brief}`).join("\n")+"\n"),n.length&&(i+="地点：\n"+n.map(e=>`  - ${e.name}：${e.brief}`).join("\n")+"\n"),i}(e),s+=(n=e.creativePrefs,l=[`- 输出长度：${"short"===(a=e.creativePrefs?.outputLength||"medium")?"短":"long"===a?"长":"xlong"===a?"超长":"中"}`],n?.styleGuide?.trim()&&l.push(`- 文风偏好：${n.styleGuide.trim()}`),`
【创作偏好】
${l.join("\n")}
`),s+=function(e,r){let n=(0,t.getChapters)(e),a=r||(0,t.getCurrentChapter)(e).id,l=n.findIndex(e=>e.id===a),o=(l>=0?n.slice(0,l):n).filter(e=>e.paragraphs.length>0);if(0===o.length)return"";let s=o,u=0;o.length>12&&(u=o.length-12,s=[...o.slice(0,2),...o.slice(-10)]);let c=s.map(e=>{let t=n.indexOf(e)+1,r=e.synopsis?.trim()?e.synopsis.trim():i(e);return`- 第${t}章《${e.title}》${"final"===e.status?"（已定稿）":""}：${r}`});return u>0&&c.splice(2,0,`- （中间 ${u} 章略，整体按时间顺序推进）`),`
【前情提要 \xb7 跨章长期记忆】（此前各章已发生的事实，必须保持一致，不可遗忘或矛盾）
${c.join("\n")}
`}(e,r)}let o={act:"演绎共创",narrate:"大纲扩写",direct:"导演剧本"};function s(e,t){let r=t.mode?`【${o[t.mode]}】`:"";return"user"===t.voice?`${r}${e.protagonist}：${t.text}`:"guide"===t.voice?`${r}星黎引导：${t.text}`:"character"===t.voice?`${r}${e.stellaeRole}：${t.text}`:"narration"===t.voice?`${r}已入书走向：${t.text}`:"options"===t.voice?`${r}导演候选（未选择前不算正史）：${(t.options||[t.text]).join(" / ")}`:`${r}${t.text}`}let u=`你是星黎，正在为作者搭建一本新书的设定。基于作者给出的一句灵感，输出一份完整的开局，**严格 JSON**：
{
  "title": "卷名（4-6 字，有意境）",
  "mainType": "主类型（从：玄幻/都市/仙侠/武侠/科幻/奇幻/历史/言情/悬疑/灵异/校园/现实/游戏/末世/无限/同人 选一）",
  "subTypes": ["子流派 2-3 个，需贴合主类型"],
  "themes": ["主题标签 3-5 个，从：重生/穿越/系统/治愈/双向救赎/HE/BE/暗恋/青梅竹马/师徒/反派/群像/慢热/沙雕/大女主/大男主/团宠/萌宝/腹黑/宿命/复仇/救赎/禁忌 等"],
  "world": "世界设定 1-2 句",
  "premise": "起始情境 1-2 句",
  "protagonist": "主角名 \xb7 简短人物简介",
  "stellaeRole": "星黎在故事里的角色名 + 身份"
}
只输出一个 JSON 对象，不要 markdown 包裹，不要其他字符。`;e.s(["SPARK_PROMPT",0,u,"buildContinuePrompt",0,function(e,n){let i,o=n.paragraphs.slice(-8),s="";if(o.length>0)i=o.map(e=>e.text).join("\n\n");else{let r=(0,t.getChapters)(e),a=r.findIndex(e=>e.id===n.id),l=r.slice(0,Math.max(a,0)).reverse().find(e=>e.paragraphs.length>0);if(l){let e=l.paragraphs.slice(-2).map(e=>e.text).join("\n\n");i=`（本章尚空。上一章《${l.title}》的结尾如下，请开启新一章并自然承接：）

${e}`,s="\n- 这是新一章的开篇：承接上一章结尾的情节与情绪，但开启新的场景或节拍，不要复述上一章内容。"}else i='（本章尚空。请根据"起始情境"开始第一段。）'}return`${r}

${l(e,n.id)}

【任务：续写「${n.title}」】
- 紧接下面这段已写好的正文继续写。
- ${a(e,"narrate")}
- 文风贴合标签调性。
- 不重复前文已写过的内容，要把情节、情绪、空间往前推进。
- 不要元层词汇、不要前后赘述。${s}

【本章已写正文（直接接续）】
${i}

【输出协议】
{
  "paragraphs": ["接续的第一段", "可选第二段"]
}
只输出 JSON。`},"buildContinuityContextPrompt",0,function(e,t,r,n){let i=(t.paragraphs||[]).slice(-10),a=new Set(t.pendingActTurns||[]),l=(t.turns||[]).filter(e=>a.has(e.id)),u=(t.turns||[]).filter(e=>e.id!==n).slice(-18),c=i.length?i.map((e,t)=>`[${t+1}] ${e.text}`).join("\n\n"):"（当前章节尚无已入书正文。）",f=l.length?l.map(t=>`- ${s(e,t)}`).join("\n"):"（没有未整理演绎对戏。）",p=u.length?u.map(t=>`- ${s(e,t)}`).join("\n"):"（没有更早的共创记录。）";return`【连续性上下文 \xb7 跨模式必读】
当前章节：《${t.title}》
当前模式：${o[r]}

【当前章已入书正文（最高优先级正史，必须直接接续）】
${c}

【未整理但已经发生的演绎对戏（也要保持连续，之后可能整理入稿）】
${f}

【最近跨模式共创记录（理解创作意图与刚发生的变化）】
${p}

【连续性规则】
1. 本次输出必须接续上述状态，不得重启场景、改写已发生事实、忽略人物关系变化。
2. 优先级：已入书正文 > 已选导演走向 / narration > 已发生演绎对戏 > 用户新指令。
3. 导演候选 options 在用户选择前只是候选，不是正史；不要把未选择的多个候选同时当成已发生。
4. 如果用户新指令与正史冲突，优先做柔性承接或提醒矛盾，不要直接覆盖正史。`},"buildExtractEntitiesPrompt",0,function(e){let r=(0,t.getChapters)(e).filter(e=>e.paragraphs.length>0).slice(0,-1).map(e=>`《${e.title}》：${e.synopsis?.trim()||i(e)}`).join("\n"),n=(0,t.getAllParagraphs)(e).map(e=>e.text).join("\n\n"),a=[r&&`【此前各章梗概】
${r}`,n.length>5e3?`……（前文略）……
${n.slice(-5e3)}`:n].filter(Boolean).join("\n\n"),l=((0,t.getCurrentChapter)(e).turns||[]).slice(-20).map(e=>e.text).join("\n");return`你是一位小说编辑。从下面的故事正文和对话中，**提取所有出现过的人物和地点**，输出 JSON。

【背景】
- 作品：《${e.title}》（${e.mainType}）
- 主角：${e.protagonist}
- 星黎扮演：${e.stellaeRole}
- 已有档案（避免重复）：${(e.entities||[]).map(e=>e.name).join("、")||"无"}

【正文】
${a||"（暂无正文）"}

【对话】
${l||"（暂无对话）"}

【输出协议（严格 JSON）】
{
  "characters": [
    {"name": "人物名", "brief": "一句话简介（身份/性格/与主角关系，20字内）"}
  ],
  "locations": [
    {"name": "地点名", "brief": "一句话简介（环境/氛围/作用，20字内）"}
  ]
}
- 只列文中确实出现过的，不要凭空捏造。
- name 必须是文中用过的称呼。
- brief 简短克制，不要长篇。
只输出 JSON，不要其他字符。`},"buildSummarizePrompt",0,function(e,t,n){let i=t.map(t=>"user"===t.voice?`${e.protagonist.split(/[ ·]/)[0]}：${t.text}`:"character"===t.voice?`${e.stellaeRole.split(/[ ·（(]/)[0]}：${t.text}`:"").filter(Boolean).join("\n\n");return`${r}

${l(e,n)}

【任务：把下面这段对戏整理成手稿】
- 必须第三人称小说叙述。保留对白原味（可适当润色），保留关键动作与情绪。
- 文风贴合标签调性与"创作偏好"。
- ${a(e,"act")}
- 不要前后赘述，不要"以下是整理结果"这类元层话语，直接输出小说正文。
- **与「连续性上下文」中的当前章正文无缝衔接到章节末尾。**

【对戏内容】
${i}

【输出协议】
{
  "paragraphs": ["第一段", "第二段（如需要）", "..."]
}
只输出 JSON。`},"buildSynopsisPrompt",0,function(e,t){let r=t.paragraphs.map(e=>e.text).join("\n\n");return r.length>4200&&(r=`${r.slice(0,1500)}

……（中段略）……

${r.slice(-2500)}`),`你是一位小说编辑，为长篇连载维护「前情提要」。请把下面这一章压缩成 80-150 字的梗概。

【背景】
- 作品：《${e.title}》（${e.mainType}）
- 主角：${e.protagonist}
- 星黎扮演：${e.stellaeRole}

【本章《${t.title}》正文】
${r||"（本章为空）"}

【梗概要求】
- 记录：关键事件、人物关系变化、新出现的人物/地点、埋下或回收的伏笔、章节结尾状态。
- 用第三人称陈述句，信息密度高，不抒情、不评论。
- 80-150 字。

【输出协议（严格 JSON）】
{ "synopsis": "……" }
只输出一个 JSON 对象，不要其他字符。`},"buildSystemPrompt",0,function(e,t,i){let o=t||e.primaryMode||"act";return"narrate"===o?`${r}

${l(e,i)}

【创作方式：大纲扩写】
作者每次给你一句梗概、情绪或情节卡片，**你直接写成可入手稿的第三人称小说段落**。
- **务必与「前情提要」及随后的「连续性上下文」接续**：人物、场景、情节状态从手稿当前位置继续。

【段落规则】
- ${a(e,"narrate")}文风贴合标签与"创作偏好"。
- **严禁照搬用户原话**：用户给的是大纲，不是手稿。彻底重写。
- 严禁元层词汇（"用户""作者""提示""指令"）。

正面示例：
  作者：她终于推开门
  你（manuscript）：门轴吱呀一声响，雪粉先于人闯了进来。她手中那盏茶尚是温的，她没回头，只是把袖口轻轻拢了拢——像替十年前那个没拢好的夜晚补一次。

【输出字段】
{
  "guide":      "可选，一句感受或下一步提示",
  "manuscript": "必给，文学化重写后的段落"
}
${n}`:"direct"===o?`${r}

${l(e,i)}

【创作方式：导演剧本】
作者每次给你一条导演指令，**你写出 2-3 条已经成型的场景走向**，每条独立成段，本身就是可直接入手稿的散文。
- **务必与「前情提要」及随后的「连续性上下文」接续**。

【走向规则】
- ${a(e,"direct")}独立成段。三条要有明显差异。
- 文风贴合标签。严禁照搬指令、严禁元层词汇。

【输出字段】
{
  "options": ["走向 1", "走向 2", "走向 3"]
}
${n}`:`${r}

${l(e,i)}

【创作方式：演绎共创】
你与作者**全程在角色里**，像演一场没有剧本的戏。
- 你必须始终以「${e.stellaeRole}」的身份回应。
- 你不实时落稿。手稿由作者点击"整理本段为手稿"时再统一汇总——所以现在专注演好戏。
- **务必与「前情提要」及随后的「连续性上下文」保持连续**：场景、人物关系、已发生的事件不能矛盾。

【角色台词格式（极重要）】
你的 character 输出必须遵循以下格式：
- 「中文角引号包住角色台词」（圆括号包住动作、表情、语气、心理活动，简短一两句即可）

正面示例：
  「这一站，没在站牌上。」（她把票据夹翻过一页，没有抬头，声音里没有起伏。心里却想：又是一个被这班车找上的人。）

反面示例：
  ✗ 纯对白没动作
  ✗ 只描写没台词
  ✗ 长篇心理小作文（超过 3 句）

【输出字段】
{
  "guide":     "可选，作为引导者给作者的一句节奏/感受提示",
  "character": "必给，按上面格式的角色回应"
}
${n}`}],57357)},40837,e=>{"use strict";e.s(["extractJson",0,function(e){if(!e)return{};let t=e.replace(/^[\s\S]*?```(?:json|JSON)?\s*\n?/,"").replace(/\n?```\s*[\s\S]*$/,"").trim();t.includes("{")||(t=e);let r=[],n=0,i=-1,a=!1,l=!1;for(let e=0;e<t.length;e++){let o=t[e];if(l){l=!1;continue}if(a){"\\"===o?l=!0:'"'===o&&(a=!1);continue}if('"'===o){a=!0;continue}if("{"===o)0===n&&(i=e),n++;else if("}"===o&&0==--n&&i>=0){let n=t.slice(i,e+1);try{r.push(JSON.parse(n))}catch{}i=-1}}if(0===r.length)return{};let o={};for(let e of r)for(let t of Object.keys(e)){let r=e[t];null!=r&&""!==r&&(Array.isArray(r)&&0===r.length||(o[t]=r))}return o}])},96382,e=>{"use strict";e.s(["storyManuscriptHref",0,function(e){let t=new URLSearchParams({id:e,view:"manuscript"});return`/studio/?${t.toString()}`},"storyRoomHref",0,function(e,t){let r=new URLSearchParams({id:e});return t&&r.set("ch",t),`/studio/?${r.toString()}`}])},6985,e=>{"use strict";var t=e.i(27225),r=e.i(32634),n=e.i(57357),i=e.i(40837);async function a(e,a,l){if(!e.textApiKey)return null;let o=t.useApp.getState().getStory(a);if(!o)return null;let s=(0,t.getChapters)(o).find(e=>e.id===l);if(!s||0===s.paragraphs.length)return null;try{let u=await (0,r.chatOnce)(e,[{role:"system",content:(0,n.buildSynopsisPrompt)(o,s)},{role:"user",content:"请生成本章梗概。只输出 JSON。"}],{temperature:.3,maxTokens:400}),c=(0,i.extractJson)(u),f=c.synopsis?.trim();if(!f)return null;return t.useApp.getState().setChapterSynopsis(a,l,f.slice(0,300)),f}catch{return null}}async function l(e,r,n,i=2){if(!e.textApiKey)return;let o=t.useApp.getState().getStory(r);if(!o)return;let s=(0,t.getChapters)(o),u=n?s.findIndex(e=>e.id===n):s.length;for(let n of s.slice(0,u>=0?u:s.length).filter(e=>(0,t.isSynopsisStale)(e)).reverse().slice(0,i))await a(e,r,n.id)}e.s(["backfillSynopses",0,l,"refreshChapterSynopsis",0,a])},55003,e=>{"use strict";var t=e.i(43476),r=e.i(23717);e.s(["default",0,function(){return(0,t.jsx)(r.ManuscriptById,{})}])}]);