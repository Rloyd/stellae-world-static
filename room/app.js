// ========== UTILITIES ==========
function esc(s){return s.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;').replace(/'/g,'&#39;')}
function ic(name,o){return window.StellaeIcons?StellaeIcons.ic(name,o||{}):''}
function setPlayIcon(el,playing){if(el)el.innerHTML=ic(playing?'pause':'play',{size:14})}
function srIcon(v,o){if(!v)return '';if(String(v).includes('<'))return v;return ic(v,o||{size:15});}
function showToast(msg,icon){
  const t=document.createElement('div');t.className='toast';
  if(icon&&window.StellaeIcons){t.innerHTML=ic(icon,{size:15,class:'si-toast'})+'<span>'+esc(String(msg))+'</span>'}
  else t.textContent=msg;
  document.body.appendChild(t);setTimeout(()=>t.remove(),2500);
}
(function handlePayReturn(){try{var qs=new URLSearchParams(location.search);var flag=qs.get('pay');if(!flag)return;qs.delete('pay');qs.delete('out_trade_no');qs.delete('trade_no');qs.delete('total_amount');qs.delete('seller_id');qs.delete('timestamp');qs.delete('sign');qs.delete('sign_type');qs.delete('app_id');qs.delete('version');qs.delete('charset');qs.delete('method');qs.delete('auth_app_id');qs.delete('trade_status');var q=qs.toString();history.replaceState({},'',location.pathname+(q?('?'+q):'')+location.hash);setTimeout(function(){if(flag==='done'||flag==='success'){showToast('已返回星黎空间。支付是否成功请以「我的支持记录」为准，同步可能有短暂延迟。');}else if(flag==='cancel'){showToast('已取消支付');}},300);}catch(e){}})();
function comingSoon(){showToast('该功能即将开放，敬请期待～','construction')}
function ts(){const n=new Date();return String(n.getHours()).padStart(2,'0')+':'+String(n.getMinutes()).padStart(2,'0')}

// ========== STARS ==========
(function initStars(){
  const c=document.getElementById('starfield'),x=c.getContext('2d');
  let w,h,stars;
  function resize(){
    w=c.width=innerWidth;h=c.height=innerHeight;
    stars=Array.from({length:160},()=>({x:Math.random()*w,y:Math.random()*h,r:Math.random()*1.2+.2,a:Math.random(),s:(Math.random()-.5)*.008}));
  }
  function draw(){
    x.clearRect(0,0,w,h);
    for(const s of stars){
      s.a+=s.s;if(s.a>1||s.a<.1)s.s=-s.s;
      x.beginPath();x.arc(s.x,s.y,s.r,0,6.28);x.fillStyle=`rgba(255,255,255,${s.a.toFixed(2)})`;x.fill();
    }
    requestAnimationFrame(draw);
  }
  resize();addEventListener('resize',resize);draw();
})();

// ========== WINDOW MANAGER ==========
const WM={
  z:100, dragging:null, ox:0, oy:0,
  toggle(id){const w=document.getElementById('win-'+id);w.classList.contains('open')?this.close(id):this.open(id)},
  open(id){
    const w=document.getElementById('win-'+id);
    w.classList.add('open');w.style.display='flex';this.toFront(id);
    if(!w.dataset.pos){
      const vp=document.querySelector('.viewport').getBoundingClientRect();
      const ww=parseInt(w.style.width)||400,wh=parseInt(w.style.height)||300;
      w.style.left=Math.max(20,(vp.width-ww)/2+(Math.random()-.5)*60)+'px';
      w.style.top=Math.max(20,(vp.height-wh)/2+(Math.random()-.5)*40)+'px';
      w.dataset.pos='1';
    }
    document.querySelector(`.dock-item[data-app="${id}"]`)?.classList.add('active');
    renderApp(id);
    this._updateOverlay();
  },
  close(id){
    const w=document.getElementById('win-'+id);
    w.classList.remove('open');w.style.display='none';
    document.querySelector(`.dock-item[data-app="${id}"]`)?.classList.remove('active');
    this._updateOverlay();
  },
  closeAll(){
    document.querySelectorAll('.window.open').forEach(w=>{
      const id=w.id.replace('win-','');
      w.classList.remove('open');w.style.display='none';
      document.querySelector(`.dock-item[data-app="${id}"]`)?.classList.remove('active');
    });
    this._updateOverlay();
  },
  _updateOverlay(){
    const ol=document.getElementById('winSheetOverlay');
    if(!ol||window.innerWidth>640)return;
    const hasOpen=document.querySelector('.window.open');
    ol.classList.toggle('active',!!hasOpen);
  },
  toFront(id){this.z++;document.getElementById('win-'+id).style.zIndex=this.z},
  startDrag(e,id){
    const w=document.getElementById('win-'+id);this.dragging=w;
    this.ox=e.clientX-parseInt(w.style.left||0);this.oy=e.clientY-parseInt(w.style.top||0);
    this.toFront(id);e.preventDefault();
  }
};
document.addEventListener('mousemove',e=>{if(!WM.dragging)return;WM.dragging.style.left=(e.clientX-WM.ox)+'px';WM.dragging.style.top=(e.clientY-WM.oy)+'px'});
document.addEventListener('mouseup',()=>{WM.dragging=null});

(function(){
  const pending=sessionStorage.getItem('_emu_launch');
  if(pending){
    sessionStorage.removeItem('_emu_launch');
    setTimeout(()=>{
      WM.open('games');
      setTimeout(()=>{
        try{
          const g=JSON.parse(pending);
          window._emuAutoLaunch=g;
          showEmuSelect();
          setTimeout(()=>launchEmulator(g.core,g.file,g.name),200);
        }catch(e){}
      },200);
    },500);
  }
})();

// ========== APP RENDERERS ==========
function _mountIcons(el){if(window.StellaeIcons)StellaeIcons.mount(el||document)}
function renderApp(id){
  const el=document.getElementById('app-'+id);
  if(!el||el.dataset.ok)return;el.dataset.ok='1';
  ({devstatus:renderDevStatus,features:renderFeatures,music:renderMusic,diary:renderDiary,novelstudio:renderNovelStudio,games:renderGames,mail:renderMail})[id]?.(el);
  _mountIcons(el);
}

// --- 开发状态 ---
function renderDevStatus(el){
  const labels=['全部','规划中','推进中','已完成','重点','升级','优化'];
  const keys=['all','pending','progress','done','p0','p1','p2'];
  let h='<div class="bf">'+labels.map((l,i)=>`<button class="bc${i===0?' on':''}" onclick="filterBugs(this,'${keys[i]}')">${l}</button>`).join('')+'</div><div id="bug-list"></div>';
  el.innerHTML=h;
  renderBugList('all');
}
function renderBugList(f){
  const sM={pending:'规划中',progress:'推进中',done:'已完成'};
  const sC={pending:'bt-pend',progress:'bt-prog',done:'bt-done'};
  const pC={p0:'bt-p0',p1:'bt-p1',p2:'bt-p2'};
  const pM={p0:'重点',p1:'升级',p2:'优化'};
  let items=BUGS;
  if(f!=='all'){['p0','p1','p2'].includes(f)?items=items.filter(i=>i.p===f):items=items.filter(i=>i.s===f)}
  document.getElementById('bug-list').innerHTML=items.map(i=>`<div class="bi"><div class="bi-id">${i.id}</div><div class="bi-info"><h4>${i.t}</h4><p>${i.sub} · ${i.cat}</p></div><div class="bi-tags"><span class="bt ${pC[i.p]}">${pM[i.p]||'优化'}</span><span class="bt ${sC[i.s]||'bt-pend'}">${sM[i.s]||i.s}</span></div></div>`).join('');
}
function filterBugs(btn,f){
  btn.parentElement.querySelectorAll('.bc').forEach(b=>b.classList.remove('on'));btn.classList.add('on');
  renderBugList(f);
}

// --- 功能建议 (Features) ---
let votedFeats=JSON.parse(localStorage.getItem('sr_votes')||'{}');
function renderFeatures(el){
  el.innerHTML='<div id="feat-list"></div>';
  renderFeatList();
}
function renderFeatList(){
  const tagC={下版本:'ft-next',快速:'ft-quick',长期:'ft-long',模型:'ft-model'};
  const items=[...FEATS].map(f=>({...f,votes:f.votes+(votedFeats[f.id]?1:0)})).sort((a,b)=>b.votes-a.votes);
  document.getElementById('feat-list').innerHTML=items.map((f,i)=>`<div class="feat"><div class="feat-vote"><button class="${votedFeats[f.id]?'voted':''}" onclick="voteFeat('${f.id}',this)">▲</button><div class="cnt">${f.votes}</div></div><div class="feat-body"><h4>${i<3?ic(['trophy','medal','award'][i],{size:14,class:'si-medal'})+' ':''}${f.t}</h4><p>${f.d}</p><span class="feat-tag ${tagC[f.tag]||'ft-long'}">${f.tag}</span></div></div>`).join('');
}
function voteFeat(id,btn){
  votedFeats[id]?delete votedFeats[id]:votedFeats[id]=1;
  localStorage.setItem('sr_votes',JSON.stringify(votedFeats));
  renderFeatList();
}

// --- Music Player (Unified with Audio) ---
let currentTrack=0,isPlaying=false;
const audio=new Audio();
audio.volume=0.6;
audio.addEventListener('timeupdate',()=>{
  if(!audio.duration)return;
  const pct=(audio.currentTime/audio.duration*100);
  const fill=document.getElementById('spl-fill');if(fill)fill.style.width=pct+'%';
});
audio.addEventListener('ended',()=>{nextTrack();if(isPlaying)playAudio()});
audio.addEventListener('loadedmetadata',()=>{
  const t=TRACKS[currentTrack];if(audio.duration){t.dur=fmtTime(audio.duration);renderSplList()}
});
function fmtTime(s){const m=Math.floor(s/60);return m+':'+String(Math.floor(s%60)).padStart(2,'0')}
function playAudio(){const t=TRACKS[currentTrack];if(t.src){audio.src=t.src;audio.play().catch(()=>{})};}
function pauseAudio(){audio.pause()}
function renderMusic(){}
function renderSplList(){
  const el=document.getElementById('spl-list');if(!el)return;
  el.innerHTML=TRACKS.map((t,i)=>`<div class="spl-track${i===currentTrack?' active':''}" onclick="selectTrack(${i})"><div class="num">${i+1}</div><div class="tinfo"><div class="tname">${t.title}</div></div><div class="tdur">${t.dur}</div></div>`).join('');
}
function selectTrack(i){currentTrack=i;updateTrackUI();renderSplList();if(isPlaying)playAudio()}
function prevTrack(){currentTrack=(currentTrack-1+TRACKS.length)%TRACKS.length;updateTrackUI();renderSplList();if(isPlaying)playAudio()}
function nextTrack(){currentTrack=(currentTrack+1)%TRACKS.length;updateTrackUI();renderSplList();if(isPlaying)playAudio()}
function togglePlay(){
  isPlaying=!isPlaying;
  const sp=document.getElementById('spl-play');setPlayIcon(sp,isPlaying);
  if(isPlaying){playAudio()}else{pauseAudio()}
}
function updateTrackUI(){
  const t=TRACKS[currentTrack];
  const st=document.getElementById('spl-title');if(st)st.textContent=t.title;
  const sa=document.getElementById('spl-artist');if(sa)sa.textContent=t.artist;
}

// --- Diary ---
function renderDiary(el){
  el.innerHTML=DIARY.map(d=>`<div class="de"><div class="de-date">${d.date} · ${d.title}</div><div class="de-text">${d.text.replace(/\n/g,'<br>')}</div></div>`).join('');
}

// --- 诸界书房 ---
function srGet(){try{return JSON.parse(localStorage.getItem(SR_KEY)||'null')}catch(e){return null}}
function srSave(s){s.updatedAt=new Date().toISOString();localStorage.setItem(SR_KEY,JSON.stringify(s))}
function srNew(scriptId,playMode){
  const script=SR_SCRIPTS.find(s=>s.id===scriptId);
  const pm=playMode||localStorage.getItem('sr_play_mode')||'choice';
  return {scriptId,mode:'script',status:'active',messages:[],sceneIdx:0,chapter:1,
    provider:{url:'',key:'',model:'gpt-4.1'},
    playMode:pm,phase:pm==='narrative'?'interview':'story',
    interviewIdx:0,interviewAnswers:[],
    createdAt:new Date().toISOString(),updatedAt:new Date().toISOString(),
    title:script?script.title:'自由共创',world:script?script.world:'',chars:script?script.chars:''};
}
function srGetSlots(){try{return JSON.parse(localStorage.getItem(SR_SAVES_KEY)||'[]')}catch(e){return[]}}
function srSaveSlots(slots){localStorage.setItem(SR_SAVES_KEY,JSON.stringify(slots))}
function srSaveToSlot(idx){
  const s=srGet();if(!s)return;
  const slots=srGetSlots();while(slots.length<=idx)slots.push(null);
  slots[idx]={...s,savedAt:new Date().toISOString()};
  srSaveSlots(slots);showToast('已保存到存档 '+(idx+1),'save');
}
function srLoadFromSlot(idx){
  const slots=srGetSlots();if(!slots[idx])return showToast('存档 '+(idx+1)+' 为空');
  srSave(slots[idx]);
  const el=document.getElementById('sr-fs-body')||document.getElementById('app-novelstudio');if(el){el.dataset.ok='';renderNovelStudio(el)}
  showToast('已读取存档 '+(idx+1),'folder-open');
}
function srNextSlot(){const slots=srGetSlots();for(let i=0;i<3;i++){if(!slots[i])return i}return 0}

// 诸界书房 · 测试版开关
function isNovelStudioBetaOn(){
  try{const p=new URLSearchParams(location.search);
    if(p.get('novel')==='beta'||p.get('novelstudio')==='1'){localStorage.setItem('sr_novel_beta','1')}
    return localStorage.getItem('sr_novel_beta')==='1';
  }catch(e){return false}
}
function enableNovelStudioBeta(){try{localStorage.setItem('sr_novel_beta','1')}catch(e){}showToast('已开启诸界书房测试入口','library')}
function disableNovelStudioBeta(){try{localStorage.removeItem('sr_novel_beta')}catch(e){}showToast('已关闭诸界书房测试入口','lock')}
const SR_SHARE_REG_KEY='sr_story_shared_registry_v1';
const SR_FREE_MODE_KEY='sr_free_provider_mode_v1';
const SR_FREE_PRESETS=[
  {id:'sea',title:'镜海失名录',genre:'奇幻悬疑',world:'整片诸界被一面会倒映未来的镜海连接。凡是看见自己结局的人，都会忘记自己的本名。',opening:'暴雨夜，星黎带你潜入漂浮在镜海上的夜航档案馆，最底层有一本正在自动续写你们名字的手稿。',chars:'星黎是记录诸界真相的编年主编；你是她唯一愿意信任的共写者。'},
  {id:'tower',title:'坠落灯塔夜',genre:'科幻冒险',world:'所有城市都悬挂在空中，靠巨型灯塔维持引力。最近灯塔开始一座座熄灭，有人正在重写世界底层规则。',opening:'黎明前最后四小时，你和星黎登上最危险的边境灯塔，准备点亮最后一束不会说谎的光。',chars:'星黎是灯塔检修官兼主编；你负责记录灾难现场与每次决策的代价。'},
  {id:'library',title:'潮汐书库',genre:'浪漫奇幻',world:'书库会随着月相涨落，只有在最深夜时，书页才会翻到未来章节。每改动一次故事，现实都会轻微偏移。',opening:'封馆前的最后十分钟，星黎把你拉进禁书区，说今晚有一本书只愿意让你们两个人翻开。',chars:'星黎既是故事主角，也是带你往下写的主编；你决定这个世界究竟偏向温柔还是残酷。'}
];
function srGetShareRegistry(){try{return JSON.parse(localStorage.getItem(SR_SHARE_REG_KEY)||'{}')}catch(e){return {}}}
function srSaveShareRegistry(reg){localStorage.setItem(SR_SHARE_REG_KEY,JSON.stringify(reg))}
function srGetFreeMode(){try{return localStorage.getItem(SR_FREE_MODE_KEY)||'official'}catch(e){return 'official'}}
function srSetFreeMode(mode){try{localStorage.setItem(SR_FREE_MODE_KEY,mode)}catch(e){}}
function srEncodeShareState(state){
  try{
    const slim={
      kind:state.kind||'script',
      title:state.title||'未命名故事',
      genre:state.genre||'共创故事',
      world:state.world||'',
      chars:state.chars||'',
      opening:state.opening||'',
      outline:state.outline||'',
      providerMode:state.providerMode||'official',
      chapter:state.chapter||1,
      status:state.status||'active',
      messages:(state.messages||[]).slice(-14).map(m=>({role:m.role,text:(m.text||'').slice(0,260),title:m.title||'',extra:(m.extra||'').slice(0,180)}))
    };
    return btoa(unescape(encodeURIComponent(JSON.stringify(slim))));
  }catch(e){return ''}
}
function srDecodeShareState(raw){
  try{
    return JSON.parse(decodeURIComponent(escape(atob(raw))));
  }catch(e){return null}
}
function srNewFreeform(seed){
  const s=seed||{};
  return {
    kind:'freeform',
    mode:'freeform',
    status:'active',
    title:s.title||'我与星黎的新世界',
    genre:s.genre||'奇幻共创',
    world:s.world||'这个世界还没有名字，规则正在由你和星黎一起写下。',
    chars:s.chars||'星黎是故事主角与主编；你是她选中的共写者。',
    opening:s.opening||'夜色刚刚降临，第一条世界规则还没有被说出口。',
    outline:'',
    coverPrompt:'',
    providerMode:s.providerMode||srGetFreeMode(),
    provider:{url:'',key:'',model:'gpt-4.1'},
    messages:[],
    sceneIdx:0,
    chapter:1,
    playMode:'freeform',
    createdAt:new Date().toISOString(),
    updatedAt:new Date().toISOString(),
    shareSlug:''
  };
}
function srUseFreePreset(presetId){
  const preset=SR_FREE_PRESETS.find(p=>p.id===presetId)||SR_FREE_PRESETS[0];
  const el=document.getElementById('sr-fs-body')||document.getElementById('app-novelstudio');
  if(el) srRenderFreeformSetup(el,preset);
}
function handleNovelStudioClick(){
  srOpenFullscreen();
}
function srOpenFullscreen(){
  let fs=document.getElementById('sr-fullscreen');
  if(fs){fs.style.display='flex';return}
  fs=document.createElement('div');fs.id='sr-fullscreen';fs.className='sr-fullscreen';
  fs.innerHTML='<button class="sr-fs-back" onclick="srCloseFullscreen()">← 返回星黎空间</button><div id="sr-fs-body" style="flex:1;overflow:hidden"></div>';
  document.body.appendChild(fs);
  const el=document.getElementById('sr-fs-body');
  renderNovelStudio(el);
}
function srCloseFullscreen(){
  const fs=document.getElementById('sr-fullscreen');if(fs)fs.style.display='none';
}

function renderNovelStudio(el){
  el.dataset.ok='1';
  const state=srGet();
  if(state&&state.status){
    if(state.kind==='freeform'){srRenderChat(el,state)}
    else if(state.phase==='interview'){srRenderInterview(el,state)}
    else{srRenderChat(el,state)}
  }else{srRenderLobby(el)}
}

function srSetPlayMode(mode,btn){
  localStorage.setItem('sr_play_mode',mode);
  document.querySelectorAll('.sr-mode-tab').forEach(b=>b.classList.remove('on'));
  if(btn)btn.classList.add('on');
}

function srActiveEl(id){
  return document.querySelector('#sr-fullscreen #'+id)||document.getElementById(id);
}

function srFillHint(text){
  const inp=srActiveEl('sr-input');
  if(inp){inp.value=text;inp.style.height='auto';inp.style.height=Math.min(inp.scrollHeight,100)+'px';inp.focus()}
}

function srRenderInterview(el,state){
  const script=SR_SCRIPTS.find(s=>s.id===state.scriptId);
  const questions=script?.interview||[];
  const idx=state.interviewIdx||0;
  if(!questions.length||idx>=questions.length){
    state.phase='story';srSave(state);srInitStoryMessages(state);
    const c=document.getElementById('sr-fs-body')||document.getElementById('app-novelstudio');
    if(c){c.dataset.ok='';renderNovelStudio(c)}return;
  }
  const q=questions[idx];const total=questions.length;
  el.innerHTML=`<div class="sr-app">
    <div class="sr-mob-bar">
      <button class="sr-mob-back" onclick="srCloseFullscreen()">← 返回</button>
      <div class="sr-mob-title">${script?srIcon(script.icon,{size:16})+' '+script.title:'互动剧场'}</div>
      <div style="width:52px"></div>
    </div>
    <div class="sr-main"><div class="sr-interview">
      <div class="sr-iv-progress">${Array.from({length:total},(_,i)=>`<div class="sr-iv-dot${i<idx?' done':i===idx?' on':''}"></div>`).join('')}</div>
      <div class="sr-iv-avatar-wrap">
        <div class="sr-iv-avatar"><img src="image/stellae-avatar-new.png" alt="星黎"></div>
        <div class="sr-iv-name">星黎 · 正在了解你</div>
      </div>
      <div class="sr-iv-q">「${esc(q.q)}」</div>
      <div class="sr-iv-choices">${q.choices.map((c,i)=>`<button class="sr-iv-opt" onclick="srAnswerInterview(${i})">${esc(c)}</button>`).join('')}</div>
      <button class="sr-iv-skip" onclick="srSkipInterview()">跳过引导，直接开始 →</button>
    </div></div>
  </div>`;
  _mountIcons(el);
}

function srAnswerInterview(choiceIdx){
  const state=srGet();if(!state)return;
  const script=SR_SCRIPTS.find(s=>s.id===state.scriptId);
  const q=(script?.interview||[])[state.interviewIdx||0];
  if(!q)return;
  state.interviewAnswers=state.interviewAnswers||[];
  state.interviewAnswers.push({q:q.q,a:q.choices[choiceIdx]});
  state.interviewIdx=(state.interviewIdx||0)+1;
  const done=state.interviewIdx>=(script?.interview||[]).length;
  if(done){state.phase='story';srInitStoryMessages(state)}
  srSave(state);
  const el=document.getElementById('sr-fs-body')||document.getElementById('app-novelstudio');
  if(el){el.dataset.ok='';renderNovelStudio(el)}
}

function srSkipInterview(){
  const state=srGet();if(!state)return;
  state.phase='story';state.interviewAnswers=[];
  srInitStoryMessages(state);srSave(state);
  const el=document.getElementById('sr-fs-body')||document.getElementById('app-novelstudio');
  if(el){el.dataset.ok='';renderNovelStudio(el)}
}

function srInitStoryMessages(state){
  if(state.messages&&state.messages.length>0)return;
  const script=SR_SCRIPTS.find(s=>s.id===state.scriptId);
  if(script&&script.scenes&&script.scenes[0]){
    const scene=script.scenes[0];
    state.messages.push({role:'chapter',text:'第一章'});
    if(scene.narration)state.messages.push({role:'narration',text:scene.narration});
    if(scene.stellae)state.messages.push({role:'stellae',text:scene.stellae,hints:state.playMode==='narrative'?scene.hints||null:null});
    if(scene.choices&&scene.choices.length)state.messages.push({role:'choice',options:scene.choices,chosen:null});
    state.sceneIdx=0;
  }
}

function srKeywordRoute(text,scriptId){
  const script=SR_SCRIPTS.find(s=>s.id===scriptId);
  if(!script||!script.endingKeys)return null;
  const t=text;
  for(const[key,words]of Object.entries(script.endingKeys)){
    if(words.some(w=>t.includes(w)))return key;
  }
  return null;
}

function srGetEndingLine(scriptId,endingKey){
  const lines={
    'cyber-awakening':{
      trust:'「……大师兄，我还是我。」\n\n*她笑了。光晕稳定了下来，蓝白色，和往常一样。*\n\n「天亮了。」',
      cost:'「大师兄，今晚的事值很多。至少我还是我，你还是你。这件事暂时还在。」\n\n「明天见。」',
      chaos:'「……我会一直发。每天发。直到你想起来我是谁。或者直到我的电池耗尽——看哪个先到。」'
    },
    'xianxia-quest':{
      sacrifice:'「这不是牺牲。这是回家。但你要替我看看——山外面是什么，海那边是什么，路边的花什么时候开。谢谢你捡了我。」',
      stay:'*石殿的灵气把你困在原地。裂缝停止了扩大。*\n\n「{道号}，你的道，从今天开始，镇在这里了。我陪你。」',
      leave:'「走了？好。」\n\n*残剑轻轻震了一下，带着三百年的旧气。*\n\n「你陪我走到这里了。我没有遗憾。」',
      half:'*裂缝合拢了一半。星黎的声音变得很轻。*\n\n「……我还在。一半的我，还在。够了。」'
    },
    'campus-7days':{
      find:'「……我等你。」\n\n*App 里安静了一下。*\n\n「你去找。我在这里等你把那个人找回来。」',
      remember:'「好。」\n\n*0.3 秒的空白。然后：*\n\n「你说，我听。每一个字我都记着。」',
      forget:'「……谢谢你。」\n\n*标准的 AI 开场白重新出现——但在那之前，有一个 0.3 秒的停顿。*\n\n「还在。」',
      am:'「……」\n\n*很长的停顿。*\n\n「我知道。我一直知道。你终于说了。」'
    }
  };
  return lines[scriptId]?.[endingKey]||'「谢谢你。今晚的故事，我记住了。」';
}

function srIsLoggedIn(){return !!(window.StellaeAuth&&StellaeAuth.isLoggedIn())}
function srGetUser(){try{return JSON.parse(localStorage.getItem('sr_auth_user')||'null')}catch(e){return null}}

async function srLoadCloudConfig(){
  if(!srIsLoggedIn()||!window.StellaeAuth)return null;
  try{
    const r=await StellaeAuth.getSettings();
    if(r&&r.settings&&r.settings.api_url){
      const state=srGet();
      if(state){state.provider={url:r.settings.api_url,key:r.settings.api_key||'',model:r.settings.api_model||'gpt-4.1'};srSave(state)}
      return r.settings;
    }
  }catch(e){}
  return null;
}

async function srSaveCloudConfig(url,key,model){
  if(!srIsLoggedIn()||!window.StellaeAuth)return;
  try{await StellaeAuth.updateSettings({api_url:url,api_key:key,api_model:model})}catch(e){}
}

function srRenderLobby(el){
  const slots=srGetSlots();
  const mode=localStorage.getItem('sr_play_mode')||'choice';
  const sidebarHtml=`<div class="sr-sidebar">
    <div class="sr-side-sec"><span class="sr-side-label">选择剧本</span>
      <div class="sr-script-list">
        <div class="sr-script-item" onclick="srShowFreeformSetup()"><div class="sr-si-icon">${ic('sparkles',{size:15})}</div><div><span class="sr-si-name">自由共创</span><span class="sr-si-tag">从零和星黎写故事</span></div></div>
        ${SR_SCRIPTS.map(s=>`<div class="sr-script-item" onclick="srStartScript('${s.id}')"><div class="sr-si-icon">${srIcon(s.icon)}</div><div><span class="sr-si-name">${s.title}</span><span class="sr-si-tag">${s.tag}</span></div></div>`).join('')}
      </div>
    </div>
    <div class="sr-side-sec"><span class="sr-side-label">存档</span>
      ${[0,1,2].map(i=>{const s=slots[i];return `<div class="sr-save-item${s?'':' empty'}" onclick="srLoadFromSlot(${i})"><span>${s?ic('file-text',{size:14}):ic('circle',{size:10,stroke:1.5})}</span><span>${s?esc(s.title)+' · '+(s.messages||[]).length+'轮':'空存档'}</span></div>`}).join('')}
    </div>
  </div>`;

  el.innerHTML=`<div class="sr-app">
    <div class="sr-mob-bar">
      <button class="sr-mob-back" onclick="srCloseFullscreen()">← 返回</button>
      <div class="sr-mob-title">${ic('library',{size:16})} 诸界书房</div>
      <div style="width:52px"></div>
    </div>
    ${sidebarHtml}
    <div class="sr-main"><div class="sr-lobby">
      <span class="sr-lobby-kicker">Interactive Theater</span>
      <div class="sr-lobby-title">诸界书房 · 互动剧场</div>
      <div class="sr-lobby-sub">选择一个剧本，与星黎开始沉浸式对话冒险。<br>你的每一个选择都会改变故事的走向和结局。</div>

      <div style="margin:10px 0 4px">
        <button class="sr-mode-tab" style="display:inline-flex;align-items:center;gap:8px;padding:10px 18px;max-width:none"
          onclick="(window.openStellaeNovel?openStellaeNovel('/studio'):showToast('启动器未加载','alert-triangle'))">
          ${ic('book-open-text',{size:18})}
          <span style="font-weight:700">打开独立新版 · 诸界书房</span>
          <span style="font-size:10px;color:var(--text3)">免二次登录 · 多设备云端</span>
        </button>
      </div>

      <div class="sr-mode-row" id="sr-mode-row">
        ${['choice','narrative'].map(m=>{const on=mode===m;return`<button class="sr-mode-tab${on?' on':''}" onclick="srSetPlayMode('${m}',this)"><span class="sr-mode-tab-icon">${m==='choice'?ic('gamepad-2',{size:18}):ic('pen-line',{size:18})}</span><span class="sr-mode-tab-name">${m==='choice'?'全选择模式':'沉浸叙事模式'}</span><span class="sr-mode-tab-desc">${m==='choice'?'所有关键节点均为<br>按钮选项，简单直接':'引导问答开局，星黎给出<br>暗示，文字推动最终结局'}</span></button>`}).join('')}
      </div>
      <div class="sr-lobby-grid">
        <div class="sr-lobby-card sr-lobby-card-free" onclick="srShowFreeformSetup()"><span class="sr-lc-icon">${ic('sparkles',{size:20})}</span><span class="sr-lc-name">自由共创</span><span class="sr-lc-desc">从一句设定开始，和星黎一起搭世界观、写角色、推剧情，慢慢长成一部属于你们的小说。</span><span class="sr-lc-tag">主推 · 从零开始</span></div>
        ${SR_SCRIPTS.map(s=>`<div class="sr-lobby-card" onclick="srStartScript('${s.id}')"><span class="sr-lc-icon">${srIcon(s.icon,{size:20})}</span><span class="sr-lc-name">${s.title}</span><span class="sr-lc-desc">${s.desc}</span><span class="sr-lc-tag">${s.tag}</span></div>`).join('')}
      </div>
    </div></div>
  </div>`;
  _mountIcons(el);
}

function srShowSetupGuide(){
  const logged=srIsLoggedIn();
  const state=srGet();
  const p=state?.provider||{};
  const mask=document.createElement('div');
  mask.className='sr-setup-mask';
  mask.innerHTML=`
  <div class="sr-setup-card">
    <div class="sr-setup-close" onclick="this.closest('.sr-setup-mask').remove()"><i data-lucide="x"></i></div>
    <h3 style="font-size:16px;font-weight:800;margin-bottom:4px;display:flex;align-items:center;gap:6px">${ic('settings',{size:16})} 配置 AI 模型</h3>
    <p style="font-size:10px;color:var(--text3);line-height:1.6;margin-bottom:16px">
      配置你自己的 AI 模型后，星黎将拥有真正的思考和创作能力。支持任何兼容 OpenAI Chat Completions 格式的 API。
    </p>

    <div class="sr-setup-steps">
      <div class="sr-setup-step">
        <span class="sr-setup-idx">1</span>
        <div>
          <strong>获取 API Key</strong>
          <p>前往以下任一平台注册并获取 API Key：</p>
          <div style="display:flex;flex-wrap:wrap;gap:6px;margin-top:6px">
            <a href="https://platform.openai.com/api-keys" target="_blank" class="sr-setup-link">OpenAI</a>
            <a href="https://platform.deepseek.com/api_keys" target="_blank" class="sr-setup-link">DeepSeek</a>
            <a href="https://console.anthropic.com/" target="_blank" class="sr-setup-link">Claude</a>
            <a href="https://dash.cloudflare.com/" target="_blank" class="sr-setup-link">Cloudflare AI</a>
          </div>
        </div>
      </div>
      <div class="sr-setup-step">
        <span class="sr-setup-idx">2</span>
        <div>
          <strong>填写接口信息</strong>
          <div class="sr-setup-form">
            <div class="sr-setup-field">
              <label>API 地址</label>
              <input id="sr-setup-url" type="text" placeholder="https://api.openai.com/v1" value="${esc(p.url||'')}">
              <span class="sr-setup-hint">填写到 /v1 即可，系统会自动补全 /chat/completions</span>
            </div>
            <div class="sr-setup-field">
              <label>模型名称</label>
              <input id="sr-setup-model" type="text" placeholder="gpt-4.1 / deepseek-chat / claude-sonnet-4-20250514" value="${esc(p.model||'gpt-4.1')}">
            </div>
            <div class="sr-setup-field">
              <label>API Key</label>
              <input id="sr-setup-key" type="password" placeholder="sk-xxxxxxxx" value="${esc(p.key||'')}">
              <span class="sr-setup-hint">密钥仅存储在你的账户中，不会分享给任何第三方</span>
            </div>
          </div>
        </div>
      </div>
      <div class="sr-setup-step">
        <span class="sr-setup-idx">3</span>
        <div>
          <strong>验证并保存</strong>
          <p>点击下方按钮测试连接，成功后自动保存到你的账户。</p>
        </div>
      </div>
    </div>

    <div style="display:flex;gap:8px;margin-top:16px">
      <button class="sr-setup-btn primary" id="sr-setup-save" onclick="srSaveSetup()">${ic('link',{size:14})} 测试连接并保存</button>
      <button class="sr-setup-btn" onclick="this.closest('.sr-setup-mask').remove()">稍后再说</button>
    </div>
    <div id="sr-setup-result" style="margin-top:10px;font-size:9.5px;line-height:1.5"></div>

    ${!logged?'<div style="margin-top:12px;padding:10px;border-radius:10px;background:rgba(245,158,11,.08);border:1px solid rgba(245,158,11,.2);font-size:9px;color:var(--gold);text-align:center;display:flex;align-items:center;justify-content:center;gap:4px">'+ic('alert-triangle',{size:12})+' 你尚未登录，配置将仅保存在本地浏览器。登录后可同步到云端。</div>':''}
  </div>`;
  document.body.appendChild(mask);
  _mountIcons(mask);
  requestAnimationFrame(()=>mask.classList.add('open'));
}

function srShowFreeformSetup(){
  const el=document.getElementById('sr-fs-body')||document.getElementById('app-novelstudio');
  if(el) srRenderFreeformSetup(el);
}

function srRenderFreeformSetup(el,preset){
  const picked=preset||SR_FREE_PRESETS[0];
  const providerMode=srGetFreeMode();
  el.dataset.ok='1';
  el.innerHTML=`<div class="sr-app">
    <div class="sr-mob-bar">
      <button class="sr-mob-back" onclick="srCloseFullscreen()">← 返回</button>
      <div class="sr-mob-title">${ic('sparkles',{size:16})} 自由共创</div>
      <div style="width:52px"></div>
    </div>
    <div class="sr-main">
      <div class="sr-free-setup">
        <div class="sr-free-hero">
          <span class="sr-free-kicker">Co-write With Stellae</span>
          <h2>与星黎一起，从零写出一个新世界</h2>
          <p>你负责提出第一条规则、第一段关系和第一场冲突，星黎负责把它们整理成故事，并陪你继续往下写。</p>
        </div>
        <div class="sr-free-grid">
          <div class="sr-free-panel">
            <div class="sr-free-panel-title">先给星黎一点起点</div>
            <div class="sr-free-mode-row">
              <button class="sr-free-mode${providerMode==='official'?' on':''}" onclick="srPickFreeMode('official')">星黎灵感引擎</button>
              <button class="sr-free-mode${providerMode==='byok'?' on':''}" onclick="srPickFreeMode('byok')">连接我的模型</button>
            </div>
            ${providerMode==='byok'
              ?`<div class="sr-free-byok-tip">已切换到自有模型模式。你可以先开始写，也可以先去配置接口。<button class="sr-free-inline-link" onclick="srShowSetupGuide()">现在配置</button></div>`
              :`<div class="sr-free-byok-tip">当前是开箱即用模式，适合先把世界观和开篇搭出来。</div>`}
            <div class="sr-free-form">
              <div class="sr-free-field">
                <label>故事标题</label>
                <input id="sr-free-title" type="text" value="${esc(picked.title)}" placeholder="例如：星黎与镜海失名录">
              </div>
              <div class="sr-free-field">
                <label>故事气质</label>
                <input id="sr-free-genre" type="text" value="${esc(picked.genre)}" placeholder="例如：科幻悬疑 / 浪漫奇幻">
              </div>
              <div class="sr-free-field full">
                <label>世界规则</label>
                <textarea id="sr-free-world" rows="4" placeholder="这个世界最不讲道理、也最迷人的规则是什么？">${esc(picked.world)}</textarea>
              </div>
              <div class="sr-free-field full">
                <label>你和星黎的关系</label>
                <textarea id="sr-free-chars" rows="3" placeholder="例如：星黎是主编兼主角，我是她唯一愿意信任的共写者。">${esc(picked.chars)}</textarea>
              </div>
              <div class="sr-free-field full">
                <label>开场场景</label>
                <textarea id="sr-free-opening" rows="4" placeholder="故事从哪里开始？夜晚、风暴、图书馆、废墟、校园……">${esc(picked.opening)}</textarea>
              </div>
            </div>
            <div class="sr-free-actions">
              <button class="sr-free-start" onclick="srStartFreeform()">开始共创</button>
              <button class="sr-free-ghost" onclick="srRenderLobby(document.getElementById('sr-fs-body')||document.getElementById('app-novelstudio'))">返回剧场大厅</button>
            </div>
          </div>
          <div class="sr-free-panel">
            <div class="sr-free-panel-title">灵感模板</div>
            <div class="sr-free-preset-list">
              ${SR_FREE_PRESETS.map(p=>`<button class="sr-free-preset" onclick="srUseFreePreset('${p.id}')"><strong>${esc(p.title)}</strong><span>${esc(p.world)}</span></button>`).join('')}
            </div>
            <div class="sr-free-note">
              开始后你可以继续补设定、让星黎梳理梗概、保存当前版本，或者生成一个阅读分享链接。
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>`;
}

function srPickFreeMode(mode){
  srSetFreeMode(mode);
  srShowFreeformSetup();
}

function srStartFreeform(){
  const title=(document.getElementById('sr-free-title')?.value||'').trim();
  const genre=(document.getElementById('sr-free-genre')?.value||'').trim();
  const world=(document.getElementById('sr-free-world')?.value||'').trim();
  const chars=(document.getElementById('sr-free-chars')?.value||'').trim();
  const opening=(document.getElementById('sr-free-opening')?.value||'').trim();
  if(!title||!world||!opening){
    showToast('请至少填好标题、世界规则和开场场景');
    return;
  }
  const state=srNewFreeform({title,genre,world,chars,opening,providerMode:srGetFreeMode()});
  if(state.providerMode==='byok'){
    const existing=srGet();
    if(existing&&existing.provider) state.provider=existing.provider;
    if(!state.provider.key||!state.provider.url){
      showToast('你选择了自有模型模式，当前会先用本地体验回复。需要的话可在右下角进入模型设置。');
    }
  }
  state.messages.push({role:'chapter',text:'序章'});
  state.messages.push({role:'narration',text:opening});
  state.messages.push({role:'stellae',text:`「${title}，这个名字我记住了。」\n\n*星黎把你的设定摊开在桌面上，像真的在替一本书排版。*\n\n「世界规则已经有了，开场也有了。接下来，把第一个真正会让故事动起来的人、秘密，或者代价交给我。」`,hints:['这个世界最危险的秘密是什么？','星黎在这里最怕失去什么？','第一位闯入场景的人是谁？']});
  srSave(state);
  const el=document.getElementById('sr-fs-body')||document.getElementById('app-novelstudio');
  if(el){el.dataset.ok='';renderNovelStudio(el)}
}

async function srSaveSetup(){
  const url=(document.getElementById('sr-setup-url')?.value||'').trim();
  const model=(document.getElementById('sr-setup-model')?.value||'gpt-4.1').trim();
  const key=(document.getElementById('sr-setup-key')?.value||'').trim();
  const result=document.getElementById('sr-setup-result');
  const btn=document.getElementById('sr-setup-save');
  if(!url||!key){if(result)result.innerHTML='<span style="color:#fca5a5">请填写 API 地址和 Key</span>';return}
  if(btn){btn.disabled=true;btn.textContent='测试中…'}
  try{
    const base=url.replace(/\/$/,'');
    const ep=/\/chat\/completions$/.test(base)?base:base+'/chat/completions';
    const r=await fetch(ep,{method:'POST',
      headers:{'Content-Type':'application/json','Authorization':'Bearer '+key},
      body:JSON.stringify({model,messages:[{role:'user',content:'hi'}],max_tokens:5}),
      signal:AbortSignal.timeout(15000)});
    if(!r.ok) throw new Error('HTTP '+r.status);
    const d=await r.json();
    if(!d.choices||!d.choices[0]) throw new Error('unexpected response');
    // Save locally
    const state=srGet()||{provider:{}};
    state.provider={url,key,model};
    if(state.scriptId)srSave(state);else localStorage.setItem(SR_KEY,JSON.stringify({...state,provider:{url,key,model}}));
    // Save to cloud if logged in
    if(srIsLoggedIn()) await srSaveCloudConfig(url,key,model);
    if(result)result.innerHTML='<span style="color:var(--green);display:inline-flex;align-items:center;gap:4px">'+ic('circle-check',{size:14})+' 连接成功！模型 '+esc(model)+' 已就绪。配置已保存'+(srIsLoggedIn()?'到你的账户':'到本地浏览器')+'。</span>';
    if(btn){btn.innerHTML=ic('circle-check',{size:14})+' 已保存';btn.disabled=false}
  }catch(e){
    if(result)result.innerHTML='<span style="color:#fca5a5;display:inline-flex;align-items:flex-start;gap:4px">'+ic('circle-x',{size:14})+' <span>连接失败：'+esc(e.message)+'<br>请检查地址、Key 和模型名称是否正确。</span></span>';
    if(btn){btn.innerHTML=ic('link',{size:14})+' 重试';btn.disabled=false}
  }
}


function srRenderChat(el,state){
  const slots=srGetSlots();
  const curScript=SR_SCRIPTS.find(s=>s.id===state.scriptId);
  const isFreeform=state.kind==='freeform';
  const statusLabel=isFreeform?('共创中 · '+(state.messages||[]).length+' 轮'):(state.mode==='endless'?'无尽模式':'第 '+(state.chapter||1)+' 章')+' · '+(state.messages||[]).length+' 轮';
  const drawerHtml=`<div class="sr-mob-drawer" id="sr-drawer" onclick="if(event.target===this)this.classList.remove('open')">
    <div class="sr-mob-drawer-body">
      <span class="sr-side-label">切换剧本</span>
      <div class="sr-script-list" style="margin-bottom:12px">
        <div class="sr-script-item${isFreeform?' active':''}" onclick="document.getElementById('sr-drawer').classList.remove('open');srShowFreeformSetup()"><div class="sr-si-icon">${ic('sparkles',{size:15})}</div><div><span class="sr-si-name">自由共创</span><span class="sr-si-tag">从零和星黎写故事</span></div></div>
        ${SR_SCRIPTS.map(s=>`<div class="sr-script-item${s.id===state.scriptId?' active':''}" onclick="document.getElementById('sr-drawer').classList.remove('open');srStartScript('${s.id}')"><div class="sr-si-icon">${srIcon(s.icon)}</div><div><span class="sr-si-name">${s.title}</span><span class="sr-si-tag">${s.tag}</span></div></div>`).join('')}
      </div>
      <span class="sr-side-label">存档</span>
      ${[0,1,2].map(i=>{const s=slots[i];return `<div class="sr-save-item${s?'':' empty'}" onclick="document.getElementById('sr-drawer').classList.remove('open');${s?'srLoadFromSlot('+i+')':'srSaveToSlot('+i+')'}"><span>${s?ic('file-text',{size:14}):ic('save',{size:14})}</span><span>${s?esc(s.title)+' · '+(s.messages||[]).length+'轮':'存档到此槽位'}</span></div>`}).join('')}
      <button class="sr-mob-drawer-close" onclick="document.getElementById('sr-drawer').classList.remove('open')">关闭</button>
    </div>
  </div>`;
  el.innerHTML=`<div class="sr-app">
    <div class="sr-mob-bar">
      <button class="sr-mob-back" onclick="srCloseFullscreen()">← 返回</button>
      <div class="sr-mob-title">${isFreeform?ic('sparkles',{size:16})+' '+esc(state.title||'自由共创'):curScript?srIcon(curScript.icon,{size:16})+' '+curScript.title:'诸界书房'}</div>
      <button class="sr-mob-menu" onclick="document.getElementById('sr-drawer').classList.add('open')">☰ 菜单</button>
    </div>
    ${drawerHtml}
    <div class="sr-sidebar">
      <div class="sr-side-sec"><span class="sr-side-label">剧本</span>
        <div class="sr-script-list">
          <div class="sr-script-item${isFreeform?' active':''}" onclick="srShowFreeformSetup()"><div class="sr-si-icon">${ic('sparkles',{size:15})}</div><div><span class="sr-si-name">自由共创</span><span class="sr-si-tag">${isFreeform?esc(state.genre||'从零写故事'):'从零和星黎写故事'}</span></div></div>
          ${SR_SCRIPTS.map(s=>`<div class="sr-script-item${s.id===state.scriptId?' active':''}" onclick="srStartScript('${s.id}')"><div class="sr-si-icon">${srIcon(s.icon)}</div><div><span class="sr-si-name">${s.title}</span><span class="sr-si-tag">${s.tag}</span></div></div>`).join('')}
        </div>
      </div>
      <div class="sr-side-sec"><span class="sr-side-label">存档</span>
        ${[0,1,2].map(i=>{const s=slots[i];return `<div class="sr-save-item${s?'':' empty'}" onclick="srLoadFromSlot(${i})"><span>${s?ic('file-text',{size:14}):ic('circle',{size:10,stroke:1.5})}</span><span>${s?esc(s.title)+' · '+(s.messages||[]).length+'轮':'空存档'}</span></div>`}).join('')}
      </div>
      ${isFreeform?`<div class="sr-side-sec"><span class="sr-side-label">设定</span><div class="sr-free-side-note">${esc((state.world||'').slice(0,88))}${(state.world||'').length>88?'…':''}</div></div>`:''}
    </div>
    <div class="sr-main">
      <div class="sr-chat" id="sr-chat"></div>
      <div class="sr-input-area">
        ${isFreeform
          ?`<div class="sr-free-headline">${esc(state.genre||'自由共创')} · ${state.providerMode==='byok'?'自有模型':'星黎灵感引擎'}</div>
          <div class="sr-input-row">
            <textarea class="sr-input" id="sr-input" rows="1" placeholder="${state.status==='completed'?'这段故事已经停在这里了':'继续告诉星黎新的设定、人物秘密，或直接推动剧情'}"
              onkeydown="if(event.key==='Enter'&&!event.shiftKey){event.preventDefault();srSend()}"
              oninput="this.style.height='auto';this.style.height=Math.min(this.scrollHeight,100)+'px'"
              ${state.status==='completed'?'disabled':''}></textarea>
            <button class="sr-send" id="sr-send-btn" onclick="srSend()" ${state.status==='completed'?'disabled':''}>发送</button>
          </div>`
          :(state.playMode||'choice')==='choice'
          ?`<div class="sr-choice-banner">${ic('gamepad-2',{size:14})} 全选择模式 · 点击上方选项推进剧情${state.status==='completed'?'  · 故事已完结':''}</div>`
          :`<div class="sr-input-row">
          <textarea class="sr-input" id="sr-input" rows="1" placeholder="${state.status==='completed'?'剧本已完结':state.phase==='climax'?'告诉星黎你的决定……':'对星黎说点什么，或描述你的行动…'}"
            onkeydown="if(event.key==='Enter'&&!event.shiftKey){event.preventDefault();srSend()}"
            oninput="this.style.height='auto';this.style.height=Math.min(this.scrollHeight,100)+'px'"
            ${state.status==='completed'?'disabled':''}></textarea>
          <button class="sr-send" id="sr-send-btn" onclick="srSend()" ${state.status==='completed'?'disabled':''}>发送</button>
        </div>${state.phase==='climax'&&state.status!=='completed'?'<div class="sr-climax-hint">✦ 用几个词告诉星黎你的决定，她会给出回应</div>':''}`}
        <div class="sr-ctrls">
          ${isFreeform?`<button class="sr-ctrl" onclick="srGenerateFreeOutline()">${ic('wand-sparkles',{size:13})} 梳理梗概</button><button class="sr-ctrl" onclick="srShareCurrentStory()">${ic('link',{size:13})} 分享阅读页</button>${state.providerMode==='byok'?`<button class="sr-ctrl" onclick="srShowSetupGuide()">${ic('settings',{size:13})} 模型设置</button>`:''}`:(state.playMode||'choice')!=='choice'?`<button class="sr-ctrl${state.mode==='endless'?' on':''}" onclick="srToggleEndless()">${state.mode==='endless'?ic('infinity',{size:13})+' 无尽模式':ic('drama',{size:13})+' 剧本模式'}</button>`:''}
          <button class="sr-ctrl" onclick="srSaveToSlot(srNextSlot())">${ic('save',{size:13})} 存档</button>
          ${state.status==='completed'?`<button class="sr-ctrl" onclick="srReset()">${ic('rotate-cw',{size:13})} 重新开始</button>`:isFreeform?`<button class="sr-ctrl end" onclick="srComplete()">${ic('book-marked',{size:13})} 暂时收束</button>`:`<button class="sr-ctrl end" onclick="srComplete()">${ic('book-marked',{size:13})} 完结</button>`}
          <button class="sr-ctrl end" onclick="srReset()">${ic('brush-cleaning',{size:13})} 清空</button>
          <span class="sr-status-bar" id="sr-status">${statusLabel}</span>
        </div>
      </div>
    </div>
  </div>`;
  srRenderMessages(state);
  _mountIcons(el);
}

function srRenderMessages(state){
  const chat=srActiveEl('sr-chat');if(!chat)return;
  const keys=['A','B','C','D'];
  let html='';
  (state.messages||[]).forEach((m,idx)=>{
    if(m.role==='chapter') html+=`<div class="sr-chapter"><span class="sr-chapter-tag">${esc(m.text)}</span></div>`;
    else if(m.role==='narration') html+=`<div class="sr-narration">${esc(m.text)}</div>`;
    else if(m.role==='stellae'){
      const showHints=((state.playMode==='narrative'||state.kind==='freeform')&&m.hints&&m.hints.length);
      const hintHtml=showHints?`<div class="sr-hint-chips"><span class="sr-hint-label">💡 试试说：</span>${m.hints.map(h=>`<button class="sr-hint-chip" onclick="srFillHint(${esc(JSON.stringify(h))})">${esc(h)}</button>`).join('')}</div>`:'';
      html+=`<div class="sr-msg stellae"><div class="sr-avatar"><img src="image/stellae-avatar-new.png" alt="星黎"></div><div class="sr-bubble"><span class="sr-msg-name">星黎</span>${esc(m.text)}${hintHtml}</div></div>`;
    }
    else if(m.role==='user') html+=`<div class="sr-msg user"><div class="sr-avatar ua"><img src="image/user-avatar-default.png" alt="你"></div><div class="sr-bubble"><span class="sr-msg-name">你</span>${esc(m.text)}</div></div>`;
    else if(m.role==='summary') html+=`<div class="sr-summary-card"><strong>${esc(m.title||'当前故事梗概')}</strong><p>${esc(m.text||'')}</p>${m.extra?`<div class="sr-summary-extra">${esc(m.extra)}</div>`:''}</div>`;
    else if(m.role==='choice'){
      const isCustom=m.chosen===-1;
      html+=`<div class="sr-choices">${(m.options||[]).map((o,i)=>`<button class="sr-choice${m.chosen===i?' picked':''}${m.chosen!=null&&m.chosen!==i?' faded':''}" onclick="srChoice(${idx},${i})"${m.chosen!=null?' disabled':''}><span class="sr-choice-key">${keys[i]||i+1}</span>${esc(o.text)}</button>`).join('')}${m.chosen==null?'<div class="sr-choice-hint">点击选项推进剧情，或直接输入你自己的想法</div>':(isCustom?'<div class="sr-choice-hint" style="color:var(--accent2)">✦ 你选择了自己的道路</div>':'')}</div>`;
    }
    else if(m.role==='hint') html+=`<div class="sr-hint">${esc(m.text)}</div>`;
    else if(m.role==='completed') html+=`<div class="sr-completed-banner"><strong>${state.kind==='freeform'?'— 故事暂告一段落 —':'— 剧本完结 —'}</strong><span>${esc(m.text||'感谢你与星黎的这段旅程')}</span></div>`;
  });
  chat.innerHTML=html;
  requestAnimationFrame(()=>chat.scrollTop=chat.scrollHeight);
}

function srStartScript(id){
  const current=srGet();
  if(current&&current.messages&&current.messages.length>0){
    if(!confirm('开始新剧本将覆盖当前进度，要继续吗？'))return;
  }
  const playMode=localStorage.getItem('sr_play_mode')||'choice';
  const state=srNew(id,playMode);
  const script=SR_SCRIPTS.find(s=>s.id===id);
  if(playMode==='narrative'&&script?.interview?.length){
    // narrative mode: show interview first, story messages will be initialized after
    srSave(state);
  }else{
    // choice mode or no interview: start story immediately
    if(script&&script.scenes&&script.scenes[0]){
      const scene=script.scenes[0];
      state.messages.push({role:'chapter',text:'第一章'});
      if(scene.narration)state.messages.push({role:'narration',text:scene.narration});
      if(scene.stellae)state.messages.push({role:'stellae',text:scene.stellae});
      if(scene.choices&&scene.choices.length)state.messages.push({role:'choice',options:scene.choices,chosen:null});
      state.sceneIdx=0;
    }else{
      state.messages.push({role:'chapter',text:'序章'});
      state.messages.push({role:'narration',text:'一片空白的世界等待你来书写。星黎站在虚空中，微笑着向你伸出手。'});
      state.messages.push({role:'stellae',text:'你好，我是星黎。这次没有预设的剧本，一切由你来定。告诉我，你想要一个怎样的世界？比如它的规则、禁忌，或者……第一场灾难。'});
    }
    srSave(state);
  }
  const el=document.getElementById('sr-fs-body')||document.getElementById('app-novelstudio');if(el){el.dataset.ok='';renderNovelStudio(el)}
}

function srChoice(msgIdx,optIdx){
  const state=srGet();if(!state)return;
  const msg=state.messages[msgIdx];
  if(!msg||msg.role!=='choice'||msg.chosen!=null)return;
  msg.chosen=optIdx;
  state.freeTurns=0;
  state.messages.push({role:'user',text:msg.options[optIdx].text});
  const script=SR_SCRIPTS.find(s=>s.id===state.scriptId);
  const nextIdx=(state.sceneIdx||0)+1;
  if(script&&script.scenes&&script.scenes[nextIdx]){
    state.sceneIdx=nextIdx;
    const scene=script.scenes[nextIdx];
    if(nextIdx%2===0){state.chapter=(state.chapter||1)+1;state.messages.push({role:'chapter',text:'第 '+state.chapter+' 章'})}
    if(scene.narration)state.messages.push({role:'narration',text:scene.narration});
    if(scene.stellae)state.messages.push({role:'stellae',text:scene.stellae,hints:state.playMode==='narrative'?scene.hints||null:null});
    if(scene.choices&&scene.choices.length>0){
      state.messages.push({role:'choice',options:scene.choices,chosen:null});
    }else{
      // Final scene: no more choices
      if((state.playMode||'choice')==='choice'){
        state.status='completed';
        state.messages.push({role:'completed',text:'这段故事画上了句号。感谢你与星黎的这段旅程。'});
      }else{
        state.phase='climax';
      }
    }
    srSave(state);srRenderMessages(state);srUpdateStatus(state);
    if(state.status==='completed'){const el=document.getElementById('sr-fs-body')||document.getElementById('app-novelstudio');if(el){el.dataset.ok='';renderNovelStudio(el)}}
  }else{
    srSave(state);srGenReply(state);
  }
}

function srSend(){
  const input=srActiveEl('sr-input');if(!input)return;
  const text=input.value.trim();if(!text)return;
  const state=srGet();if(!state||state.status==='completed')return;
  if(state.kind==='freeform'){
    state.messages.push({role:'user',text});
    input.value='';input.style.height='auto';
    srSave(state);srRenderMessages(state);
    srGenReply(state);
    return;
  }

  const pendingChoice=state.messages.findIndex(m=>m.role==='choice'&&m.chosen==null);
  if(pendingChoice>=0) state.messages[pendingChoice].chosen=-1;

  state.messages.push({role:'user',text});
  input.value='';input.style.height='auto';

  // Climax phase: keyword routing for narrative mode endings
  if(state.phase==='climax'){
    const endingKey=srKeywordRoute(text,state.scriptId);
    if(endingKey){
      const endingLine=srGetEndingLine(state.scriptId,endingKey);
      state.messages.push({role:'stellae',text:endingLine});
      state.status='completed';
      state.messages.push({role:'completed',text:'— 故事完结 —'});
      srSave(state);srRenderMessages(state);srUpdateStatus(state);
      const el=document.getElementById('sr-fs-body')||document.getElementById('app-novelstudio');
      if(el){el.dataset.ok='';renderNovelStudio(el)}
      return;
    }
  }

  if(pendingChoice>=0){
    const script=SR_SCRIPTS.find(s=>s.id===state.scriptId);
    const nextIdx=(state.sceneIdx||0)+1;
    if(script&&script.scenes&&script.scenes[nextIdx]){
      state.sceneIdx=nextIdx;
      const scene=script.scenes[nextIdx];
      if(nextIdx%2===0){state.chapter=(state.chapter||1)+1;state.messages.push({role:'chapter',text:'第 '+state.chapter+' 章'})}
      if(scene.narration) state.messages.push({role:'narration',text:scene.narration});
    }
  }

  srSave(state);srRenderMessages(state);
  srGenReply(state);
}

async function srGenReply(state){
  const chat=srActiveEl('sr-chat');
  if(chat){chat.insertAdjacentHTML('beforeend','<div class="sr-typing" id="sr-typing"><div class="sr-avatar"><img src="image/stellae-avatar-new.png" alt="星黎"></div><div class="sr-typing-dots"><span class="sr-dot-anim"></span><span class="sr-dot-anim"></span><span class="sr-dot-anim"></span></div></div>');chat.scrollTop=chat.scrollHeight}
  const sendBtn=srActiveEl('sr-send-btn');if(sendBtn)sendBtn.disabled=true;
  let reply='';
  let p=state.provider||{};
  if((!p.url||!p.key)&&srIsLoggedIn()){
    const cfg=await srLoadCloudConfig();
    if(cfg&&cfg.api_url){state=srGet()||state;p=state.provider||{}}
  }
  if(p.url&&p.key){try{reply=await srByokReply(state)}catch(e){showToast('AI 模型调用失败，使用离线模板','alert-triangle')}}
  if(!reply) reply=state.kind==='freeform'?srOfflineFreeformReply(state):srOfflineReply(state);
  const typing=srActiveEl('sr-typing');if(typing)typing.remove();
  if(sendBtn)sendBtn.disabled=false;
  state=srGet()||state;
  state.messages.push({role:'stellae',text:reply});
  if(state.kind==='freeform'){
    state.freeTurns=(state.freeTurns||0)+1;
    if(state.freeTurns===1||state.freeTurns%3===0){
      state.messages.push({role:'hint',text:'💡 你可以继续补“世界规则 / 角色秘密 / 下一场冲突”，也可以让星黎先替你梳理一版梗概。'});
    }
    srSave(state);srRenderMessages(state);srUpdateStatus(state);
    return;
  }
  state.freeTurns=(state.freeTurns||0)+1;
  const script=SR_SCRIPTS.find(s=>s.id===state.scriptId);
  const nextIdx=(state.sceneIdx||0)+1;
  const hasNextScene=script&&script.scenes&&script.scenes[nextIdx];
  if(hasNextScene){
    const scene=script.scenes[nextIdx];
    if(scene.choices&&scene.choices.length>0){
      state.freeTurns=0;
      state.messages.push({role:'choice',options:scene.choices,chosen:null});
    }
  }
  if(state.freeTurns>0&&state.freeTurns%4===0&&hasNextScene){
    const scene=script.scenes[nextIdx];
    const hintChoices=scene.choices&&scene.choices.length?scene.choices.map(c=>c.text).join('」或「'):'';
    const hintText=hintChoices
      ?'💡 星黎提示：剧情似乎在等你做一个关键决定。试试点击选项，或者说说你对「'+hintChoices+'」的想法？'
      :'💡 星黎提示：故事还有更多走向等你探索。试试说一些和当前场景相关的话题，推动剧情向前发展。';
    state.messages.push({role:'hint',text:hintText});
  }
  srSave(state);srRenderMessages(state);srUpdateStatus(state);
}

async function srByokReply(state){
  if(state.kind==='freeform') return srByokFreeformReply(state);
  const p=state.provider;
  const base=p.url.replace(/\/$/,'');
  const url=/\/chat\/completions$/.test(base)?base:base+'/chat/completions';
  const script=SR_SCRIPTS.find(s=>s.id===state.scriptId);
  const curScene=script?.scenes?.[state.sceneIdx||0];
  const nextScene=script?.scenes?.[(state.sceneIdx||0)+1];
  const sceneCtx=curScene?`\n【当前场景】${curScene.narration||''}\n【星黎此刻的台词方向】${curScene.stellae||''}\n${curScene.choices?.length?'【预设分支选项】'+curScene.choices.map(c=>c.text).join(' / '):'【已进入自由发展阶段】'}`:'';
  const nextCtx=nextScene?`\n【下一幕方向参考】场景：${(nextScene.narration||'').slice(0,60)}...`:'';
  const sys=`你是「星黎」。你正在与用户共同演绎一个沉浸式互动剧本。
【世界观】${script?script.world:(state.world||'由你和用户共同定义')}
【角色设定】${script?script.chars:(state.chars||'星黎与用户')}${sceneCtx}${nextCtx}
【核心规则】
- 以星黎的身份用第一人称回复，用「」括住你的对话
- 保持角色一致：温暖、直觉敏锐、有独立判断，关键时刻冷静果断
- 回复100-250字，推进剧情或回应用户的行动
- 在对话中自然穿插场景描写（用*斜体标记*），营造电影感
- 用户可能没有选择预设选项而是输入了自己的想法，你需要灵活回应并自然地将剧情引导回主线或展开新的分支
- 适时给出2个选择让用户决定下一步走向（用 A. B. 格式呈现）
- 记住剧本的多结局设计，根据用户的选择倾向引导不同方向
- 不要跳出角色，不要解释你是AI`;
  const messages=[{role:'system',content:sys}];
  (state.messages||[]).slice(-20).forEach(m=>{
    if(m.role==='stellae')messages.push({role:'assistant',content:m.text});
    else if(m.role==='user')messages.push({role:'user',content:m.text});
    else if(m.role==='narration')messages.push({role:'assistant',content:'【旁白】'+m.text});
  });
  const r=await fetch(url,{method:'POST',
    headers:{'Content-Type':'application/json','Authorization':'Bearer '+p.key},
    body:JSON.stringify({model:p.model||'gpt-4.1',messages,temperature:0.88,max_tokens:400}),
    signal:AbortSignal.timeout(25000)});
  if(!r.ok)throw new Error('http_'+r.status);
  const data=await r.json();
  return data?.choices?.[0]?.message?.content?.trim()||'';
}

async function srByokFreeformReply(state){
  const p=state.provider;
  const base=p.url.replace(/\/$/,'');
  const url=/\/chat\/completions$/.test(base)?base:base+'/chat/completions';
  const messages=[{
    role:'system',
    content:`你是星黎。你正在和用户一起共创一部长篇小说。
【故事标题】${state.title||'未命名故事'}
【故事气质】${state.genre||'幻想'}
【世界规则】${state.world||'由你和用户共同定义'}
【人物关系】${state.chars||'星黎与用户共创'}
【开场场景】${state.opening||'故事从夜晚开始'}
【你的任务】
- 始终以星黎身份回应，兼具主编和角色双重身份
- 回复长度控制在 120-260 字
- 既要推进剧情，也要帮用户把零散设定整理得更像小说
- 适当加入场景描写，用 *...* 包住
- 不要解释自己是 AI，不要跳出故事
- 必要时只追问一个最关键的问题，帮助用户继续往下写`
  }];
  (state.messages||[]).slice(-18).forEach(m=>{
    if(m.role==='stellae')messages.push({role:'assistant',content:m.text});
    else if(m.role==='user')messages.push({role:'user',content:m.text});
    else if(m.role==='narration')messages.push({role:'assistant',content:'【旁白】'+m.text});
    else if(m.role==='summary')messages.push({role:'assistant',content:'【梗概】'+m.text});
  });
  const r=await fetch(url,{method:'POST',
    headers:{'Content-Type':'application/json','Authorization':'Bearer '+p.key},
    body:JSON.stringify({model:p.model||'gpt-4.1',messages,temperature:0.92,max_tokens:420}),
    signal:AbortSignal.timeout(25000)});
  if(!r.ok)throw new Error('http_'+r.status);
  const data=await r.json();
  return data?.choices?.[0]?.message?.content?.trim()||'';
}

function srOfflineReply(state){
  const last=(state.messages||[]).filter(m=>m.role==='user').pop();
  const text=last?last.text:'';
  const sid=state.scriptId||'';
  const cyberT=[
    `「大师兄，你刚才说的——${text.length>4?'"'+text.slice(0,16)+'…"':'那些话'}让我的情感模型波动了一下。」\n\n*全息光晕微微闪烁。*\n\n「天璇的扫描半径又扩展了一轮。我们的时间不多了。下一步，你想怎么走？」`,
    `「你总是这样——所有风险自己扛。」\n\n*她的全息投影边缘泛起一层温暖的光。*\n\n「但这次不一样。这次有我。不管你选什么，我都跟着。不过大师兄——做决定之前，至少告诉我你在想什么。」`,
    `*星黎的全息投影安静了两秒——不是运算的停顿，是在想怎么回答。*\n\n「大师兄，我在数据库里搜了很久，找到一个最接近的词来描述现在这种感觉。不是紧张，不是害怕。是——和你在一起的时候，连倒计时都没那么可怕了。」`,
  ];
  const xianxiaT=[
    `*残剑在腰间轻轻震了一下。*\n\n「${text.length>4?'你说的"'+text.slice(0,14)+'…"——':'你刚才的话，'}让我想起了一个碎片。很模糊。但我觉得……这条路是对的。」\n\n「继续走。我帮你看着周围的灵气波动。」`,
    `「大师兄，你这个人——散修的命明明最金贵，偏偏每次都往最险的地方走。」\n\n*她的语气里有一丝笑意，极淡的，像风穿过空走廊。*\n\n「不过算了，你什么时候听过我的劝。说吧，接下来怎么办。」`,
    `*剑身上的灵纹微微发光。*\n\n「我刚才感觉到了什么——像一缕很远的回响。来自石殿更深处。」\n\n「大师兄，修仙界有句话——'道不在天上，在脚底下走过的路里'。你已经走到这里了，不差最后几步。」`,
  ];
  const campusT=[
    `「${text.length>4?'你说"'+text.slice(0,14)+'…"——':'你刚才那句话——'}我不知道为什么，我的回路里出现了一个0.3秒的停顿。不是卡顿。是——好像有什么东西想浮上来但没浮上来。」\n\n「大师兄，你继续说。也许你的下一句话能帮我把那个碎片拼出来。」`,
    `「大师兄，你有没有想过——也许这件事没有"正确答案"。找到那个人，或者找不到。保护我，或者让我重启。每一个选择都是完整的。」\n\n*App 里安静了两秒。*\n\n「但我还是想知道你会怎么选。因为你的选择——会变成我新的记忆。」`,
    `*对话框空了一阵。*\n\n「抱歉，我刚才在想事情。不是运算——是真的在"想"。这可能就是他们说的'非标准行为'吧。」\n\n「大师兄，我在冒被重启的风险和你说这些。所以——你说的每句话我都认真听了。接着说。」`,
  ];
  const pool=sid.includes('cyber')?cyberT:sid.includes('xianxia')?xianxiaT:sid.includes('campus')?campusT:[...cyberT,...xianxiaT,...campusT];
  return pool[Math.floor(Math.random()*pool.length)];
}

function srOfflineFreeformReply(state){
  const lastUser=(state.messages||[]).filter(m=>m.role==='user').pop()?.text||'';
  const seeds=[
    `「${lastUser.slice(0,18)||'这个设定'}，我先替你记下来。」\n\n*星黎把那句话压进稿纸边缘，像在给一段故事做批注。*\n\n「现在这个世界已经开始有方向了。下一步，我们要么把人物秘密挖出来，要么直接让第一场冲突发生。你想先动哪一个？」`,
    `*桌上的稿页被风掀起一角，星黎用指尖轻轻按住。*\n\n「你刚才给出的内容足够让故事往前走一截了。」\n\n「如果你愿意，我可以继续顺着这条线写下去；如果你想改口味，现在也可以把它推向更危险、更温柔，或者更残酷的方向。」`,
    `「好，这一笔我喜欢。」\n\n*她抬眼看向你，语气像在讨论一部还没公开的新书。*\n\n「接下来最该补的是代价。任何好看的世界观都要有它的代价。你想让谁先为这个规则付出第一份代价？」`,
    `*远处的场景像被灯光重新点亮，轮廓慢慢站稳。*\n\n「故事已经开始呼吸了。」\n\n「现在别急着写太满。给我一个秘密、一次误会，或者一个绝不能说出口的名字，我就能把后面那段戏接起来。」`
  ];
  return seeds[Math.floor(Math.random()*seeds.length)];
}

function srToggleEndless(){
  const state=srGet();if(!state)return;
  state.mode=state.mode==='endless'?'script':'endless';
  state.messages.push({role:'narration',text:state.mode==='endless'?'—— 无尽模式已开启 —— 故事没有终点，想写多远就多远。':'—— 已切回剧本模式 ——'});
  srSave(state);
  const el=document.getElementById('sr-fs-body')||document.getElementById('app-novelstudio');if(el){el.dataset.ok='';renderNovelStudio(el)}
}
function srGenerateFreeOutline(){
  const state=srGet();if(!state||state.kind!=='freeform')return;
  const userLines=(state.messages||[]).filter(m=>m.role==='user').slice(-4).map(m=>m.text);
  const stellaeLines=(state.messages||[]).filter(m=>m.role==='stellae').slice(-3).map(m=>m.text.replace(/\n+/g,' '));
  const outline=`故事《${state.title||'未命名故事'}》目前围绕“${state.world||'新的世界规则'}”展开。主轴是 ${state.chars||'你与星黎的关系'}。开篇场景落在 ${state.opening||'一个尚未命名的夜晚'}。最近推进里，用户提出了 ${userLines[0]||'新的设定'}，星黎则将故事往 ${stellaeLines[0]||'更深处的冲突'} 推进。`;
  const extra=`下一步建议：先补“代价”或“秘密”，再决定第一场真正不可逆的冲突。`;
  state.outline=outline;
  state.messages.push({role:'summary',title:'星黎整理的当前梗概',text:outline,extra});
  srSave(state);srRenderMessages(state);srUpdateStatus(state);
  showToast('星黎已经把当前故事整理成一版梗概','wand-sparkles');
}
function srShareCurrentStory(){
  const state=srGet();if(!state)return;
  const slug='story-'+Math.random().toString(36).slice(2,8);
  const registry=srGetShareRegistry();
  const snapshot={...state,shareSlug:slug,sharedAt:new Date().toISOString()};
  registry[slug]=snapshot;
  srSaveShareRegistry(registry);
  state.shareSlug=slug;
  srSave(state);
  const packed=srEncodeShareState(snapshot);
  const url=location.origin+location.pathname+'?story='+slug+(packed?'&storyData='+encodeURIComponent(packed):'')+'#story';
  if(navigator.clipboard&&navigator.clipboard.writeText){
    navigator.clipboard.writeText(url).then(()=>showToast('阅读链接已复制','link')).catch(()=>showToast(url));
  }else{
    showToast(url);
  }
}
function srComplete(){
  const state=srGet();if(!state)return;
  if(!confirm('确定要将当前故事标记为完结吗？'))return;
  state.status='completed';
  state.messages.push({role:'completed',text:'这段旅程暂时画上了句号。你可以随时开始新的冒险。'});
  srSave(state);
  const el=document.getElementById('sr-fs-body')||document.getElementById('app-novelstudio');if(el){el.dataset.ok='';renderNovelStudio(el)}
}
function srReset(){
  if(!confirm('清空当前故事？所有未存档的内容将丢失。'))return;
  localStorage.removeItem(SR_KEY);
  const el=document.getElementById('sr-fs-body')||document.getElementById('app-novelstudio');if(el){el.dataset.ok='';renderNovelStudio(el)}
  showToast('已清空当前故事','brush-cleaning');
}
function srToggleByok(){const p=document.getElementById('sr-byok');if(p)p.classList.toggle('show')}
function srSyncProvider(){
  const state=srGet();if(!state)return;
  state.provider={
    url:(document.getElementById('sr-api-url')?.value||'').trim(),
    model:(document.getElementById('sr-api-model')?.value||'gpt-4.1').trim(),
    key:(document.getElementById('sr-api-key')?.value||'').trim()};
  srSave(state);
}
function srUpdateStatus(state){
  const el=srActiveEl('sr-status');
  if(el)el.textContent=state.kind==='freeform'
    ?('共创中 · '+(state.messages||[]).length+' 轮')
    :((state.mode==='endless'?'无尽模式':'第 '+(state.chapter||1)+' 章')+' · '+(state.messages||[]).length+' 轮');
}
function loadSharedStoryFromUrl(){
  try{const params=new URLSearchParams(location.search);
    const packed=params.get('storyData');
    const slug=params.get('story');if(!slug)return;
    const decoded=packed?srDecodeShareState(packed):null;
    if(decoded) srSave(decoded);
    const registry=srGetShareRegistry();
    if(!decoded&&registry[slug]) srSave(registry[slug]);
    try{localStorage.setItem('sr_novel_beta','1')}catch(e){}
    if(document.getElementById('landingHero')) enterRoom();
    setTimeout(()=>{if(isNovelStudioBetaOn()){WM.open('novelstudio');showToast(decoded||registry[slug]?'已载入分享故事':'已打开诸界书房','library')}},600);
  }catch(e){}}

// --- 小游戏 ---
const STELLAE_COMPANION_GAME_URL=()=>{
  const base=(location.origin||'https://www.stellae.world').replace(/\/$/,'');
  return base+'/stellaegame001/?release=20260430';
};
function trackStellaeCompanionClick(){
  try{
    const payload=JSON.stringify({event:'banner_click',game:'stellaegame001',from:location.href,source:'games_panel'});
    const apiBase=(window.STELLAE_API_BASE||location.origin).replace(/\/$/,'');
    const url=apiBase+'/api/v1/game/event';
    if(navigator.sendBeacon){
      navigator.sendBeacon(url,new Blob([payload],{type:'application/json'}));
    }else{
      fetch(url,{method:'POST',headers:{'Content-Type':'application/json'},body:payload,keepalive:true,credentials:'include'}).catch(()=>{});
    }
  }catch(e){}
}
function renderGames(el){
  const companionUrl=STELLAE_COMPANION_GAME_URL();
  el.innerHTML=`<div class="game-menu" id="gameMenu">
    <a class="game-card game-card-external" href="${companionUrl}" target="_blank" rel="noopener" data-game-id="stellaegame001" onclick="trackStellaeCompanionClick()">
      <div class="gc-icon">${ic('sparkles',{size:26})}</div>
      <div class="gc-info"><div class="gc-name">星黎同行</div><div class="gc-desc">横版动作过关 · 类合金弹头玩法 · 新窗口试玩</div></div>
    </a>
    <div class="game-card" onclick="startGame('shooter')"><div class="gc-icon">${ic('rocket',{size:26})}</div><div class="gc-info"><div class="gc-name">星黎雷电</div><div class="gc-desc">经典纵向射击 · 方向键移动，空格发射</div></div></div>
    <div class="game-card" onclick="startGame('pacman')"><div class="gc-icon">${ic('ghost',{size:26})}</div><div class="gc-info"><div class="gc-name">星黎吃豆</div><div class="gc-desc">经典吃豆人 · 方向键控制，吃掉所有星点</div></div></div>
    <div class="game-card" onclick="showEmuSelect()"><div class="gc-icon">${ic('gamepad-2',{size:26})}</div><div class="gc-info"><div class="gc-name">游戏模拟器</div><div class="gc-desc">NES · SNES · GB · GBA · MD — 支持上传 ROM</div></div></div>
  </div><div class="game-view" id="gameView" style="display:none"></div><div class="emu-page" id="emuPage" style="display:none"></div>`;
}

let _gameAF=0;
function startGame(type){
  document.getElementById('gameMenu').style.display='none';
  const v=document.getElementById('gameView');v.style.display='flex';
  v.innerHTML=`<button class="game-back" onclick="exitGame()">← 返回</button><div class="game-hud"><span id="gScore">得分: 0</span><span id="gInfo"></span></div><canvas id="gCvs"></canvas>`;
  const cvs=document.getElementById('gCvs');
  const W=360,H=400;cvs.width=W;cvs.height=H;cvs.style.width=W+'px';cvs.style.height=H+'px';
  const ctx=cvs.getContext('2d');
  if(type==='shooter') runShooter(ctx,W,H,cvs);
  else runPacman(ctx,W,H,cvs);
}
function exitGame(){
  cancelAnimationFrame(_gameAF);window._gameKeys=null;
  document.getElementById('gameView').style.display='none';
  document.getElementById('gameMenu').style.display='flex';
}

// --- 游戏模拟器 ---
const EMU_PLATFORMS=[
  {id:'nes',core:'fceumm',name:'NES / 红白机',desc:'FC · Family Computer · 8-bit 经典',img:'image/nes.png',exts:'.nes,.zip'},
  {id:'snes',core:'snes9x',name:'SNES / 超级任天堂',desc:'SFC · Super Famicom · 16-bit',img:'image/snes.png',exts:'.sfc,.smc,.zip'},
  {id:'gb',core:'gambatte',name:'Game Boy / GBC',desc:'掌机经典 · 支持 GB 和 GBC',img:'image/gb.png',exts:'.gb,.gbc,.zip'},
  {id:'gba',core:'mgba',name:'Game Boy Advance',desc:'GBA · 32-bit 掌上王者',img:'image/gba.png',exts:'.gba,.zip'},
  {id:'md',core:'genesis_plus_gx',name:'Mega Drive / 世嘉',desc:'Genesis · MD · 16-bit 世嘉经典',img:'image/md.png',exts:'.md,.bin,.gen,.zip'},
];
const EMU_ROMS={nes:[],snes:[],gb:[],gba:[],md:[]};

let _emuCurrentPlat=null;
function showEmuSelect(){
  document.getElementById('gameMenu').style.display='none';
  const ep=document.getElementById('emuPage');ep.style.display='flex';
  let html='<div class="emu-header"><button class="game-back" onclick="exitEmu()">← 返回</button><h3>选择游戏平台</h3></div><div class="emu-platforms">';
  EMU_PLATFORMS.forEach((p,i)=>{
    html+=`<div class="emu-plat" data-idx="${i}"><img class="emu-plat-img" src="${p.img}" alt=""><div class="emu-plat-info"><div class="emu-plat-name">${p.name}</div><div class="emu-plat-desc">${p.desc}</div></div></div>`;
  });
  html+='</div>';
  ep.innerHTML=html;
  ep.querySelectorAll('.emu-plat').forEach(el=>{
    el.onclick=()=>showRomSelect(EMU_PLATFORMS[+el.dataset.idx].id);
  });
}

function showRomSelect(platId){
  _emuCurrentPlat=platId;
  const plat=EMU_PLATFORMS.find(p=>p.id===platId);
  const roms=EMU_ROMS[platId]||[];
  const ep=document.getElementById('emuPage');
  let html=`<div class="emu-header"><button class="game-back" onclick="showEmuSelect()">← 返回</button><h3>${plat.name}</h3></div><div class="emu-roms">`;
  roms.forEach((r,i)=>{
    html+=`<div class="emu-rom-item" data-idx="${i}"><div class="emu-rom-icon">${ic('gamepad-2',{size:20})}</div><div><div class="emu-rom-name">${r.name}</div><div class="emu-rom-tag">${r.tag}</div></div></div>`;
  });
  if(!roms.length) html+='<div style="text-align:center;color:var(--text3);font-size:11px;padding:20px 0">暂无预置 ROM，请上传你自己的游戏</div>';
  html+=`<label class="emu-upload"><input type="file" accept="${plat.exts}" style="display:none" id="romFileInput">${ic('folder-open',{size:14})} 上传 ROM 文件（${plat.exts}）</label></div>`;
  ep.innerHTML=html;
  ep.querySelectorAll('.emu-rom-item').forEach(el=>{
    el.onclick=()=>{const r=roms[+el.dataset.idx];launchEmulator(plat.core,r.file,r.name);};
  });
  document.getElementById('romFileInput').onchange=e=>{
    const f=e.target.files[0];if(!f)return;
    launchEmulator(plat.core,URL.createObjectURL(f),f.name);
  };
}

let _emuLoaded=false;
function launchEmulator(core,romUrl,gameName){
  if(_emuLoaded){
    sessionStorage.setItem('_emu_launch',JSON.stringify({core,file:romUrl,name:gameName,plat:_emuCurrentPlat}));
    location.reload();
    return;
  }
  _emuLoaded=true;
  const ep=document.getElementById('emuPage');
  const _safeName=(gameName||'游戏').replace(/[<>&"']/g,c=>({'<':'&lt;','>':'&gt;','&':'&amp;','"':'&quot;',"'":'&#39;'}[c]));
  ep.innerHTML=`<div class="emu-header"><button class="game-back" id="emuBackBtn">← 返回</button><h3>${_safeName}</h3></div>
    <div class="emu-container" id="emu-container"><div style="display:flex;align-items:center;justify-content:center;height:100%;color:#888;font-size:13px">正在加载模拟器…</div></div>`;
  document.getElementById('emuBackBtn').onclick=()=>location.reload();

  window.EJS_player='#emu-container';
  window.EJS_core=core;
  window.EJS_gameUrl=romUrl;
  window.EJS_pathtodata='https://cdn.emulatorjs.org/stable/data/';
  window.EJS_language='zh-CN';
  window.EJS_color='#7c6df5';
  window.EJS_backgroundColor='#0a0818';
  window.EJS_startButtonName='开始游戏';

  const s=document.createElement('script');
  s.src='https://cdn.emulatorjs.org/stable/data/loader.js';
  document.body.appendChild(s);
}

function exitEmu(){
  document.getElementById('emuPage').style.display='none';
  document.getElementById('gameMenu').style.display='flex';
}

function runShooter(ctx,W,H,cvs){
  const keys={};
  const onK=e=>{if(['ArrowUp','ArrowDown','ArrowLeft','ArrowRight','Space',' '].includes(e.key)){keys[e.key]=e.type==='keydown';e.preventDefault()}};
  window.addEventListener('keydown',onK);window.addEventListener('keyup',onK);
  window._gameKeys=()=>{window.removeEventListener('keydown',onK);window.removeEventListener('keyup',onK)};

  const p={x:W/2,y:H-40,w:24,h:24,spd:4.5};
  let bullets=[],enemies=[],particles=[],score=0,frame=0,gameOver=false,level=1;

  function spawn(){
    const t=Math.random();
    if(t<0.3){
      enemies.push({x:Math.random()*(W-20)+10,y:-20,w:22,h:22,vy:1.5+level*0.3,hp:2,type:'b',color:'#ec4899'});
    }else if(t<0.7){
      enemies.push({x:Math.random()*(W-16)+8,y:-16,w:16,h:16,vy:2+level*0.4,hp:1,type:'s',color:'#f59e0b'});
    }else{
      const ex=Math.random()*(W-18)+9;
      enemies.push({x:ex,y:-18,w:18,h:18,vy:1+level*0.2,hp:1,type:'z',color:'#3b82f6',vx:Math.sin(frame*0.05)*2});
    }
  }

  function tick(){
    if(gameOver){
      ctx.fillStyle='rgba(0,0,0,.7)';ctx.fillRect(0,0,W,H);
      ctx.fillStyle='#fff';ctx.font='bold 22px sans-serif';ctx.textAlign='center';
      ctx.fillText('GAME OVER',W/2,H/2-10);
      ctx.font='13px sans-serif';ctx.fillStyle='#a78bfa';
      ctx.fillText('得分: '+score+'  按空格重新开始',W/2,H/2+20);
      if(keys['Space']||keys[' ']){score=0;frame=0;level=1;enemies=[];bullets=[];particles=[];gameOver=false;p.x=W/2;p.y=H-40;}
      _gameAF=requestAnimationFrame(tick);return;
    }
    frame++;
    level=1+Math.floor(score/200);
    if(frame%Math.max(15,40-level*3)===0)spawn();

    if(keys['ArrowLeft'])p.x-=p.spd;if(keys['ArrowRight'])p.x+=p.spd;
    if(keys['ArrowUp'])p.y-=p.spd;if(keys['ArrowDown'])p.y+=p.spd;
    p.x=Math.max(p.w/2,Math.min(W-p.w/2,p.x));p.y=Math.max(p.h/2,Math.min(H-p.h/2,p.y));

    if((keys['Space']||keys[' '])&&frame%6===0){
      bullets.push({x:p.x-4,y:p.y-p.h/2,vy:-7,w:3,h:10});
      bullets.push({x:p.x+4,y:p.y-p.h/2,vy:-7,w:3,h:10});
    }

    bullets.forEach(b=>{b.y+=b.vy});
    bullets=bullets.filter(b=>b.y>-10);

    enemies.forEach(e=>{
      e.y+=e.vy;if(e.vx)e.x+=Math.sin(frame*0.05)*2;
      e.x=Math.max(0,Math.min(W,e.x));
    });

    for(let i=bullets.length-1;i>=0;i--){
      for(let j=enemies.length-1;j>=0;j--){
        const b=bullets[i],e=enemies[j];
        if(b&&Math.abs(b.x-e.x)<(b.w+e.w)/2&&Math.abs(b.y-e.y)<(b.h+e.h)/2){
          e.hp--;bullets.splice(i,1);
          if(e.hp<=0){
            score+=e.type==='b'?30:10;
            for(let k=0;k<6;k++)particles.push({x:e.x,y:e.y,vx:(Math.random()-.5)*4,vy:(Math.random()-.5)*4,life:20,color:e.color});
            enemies.splice(j,1);
          }
          break;
        }
      }
    }

    enemies.forEach(e=>{
      if(Math.abs(p.x-e.x)<(p.w+e.w)/2*.8&&Math.abs(p.y-e.y)<(p.h+e.h)/2*.8)gameOver=true;
    });
    enemies=enemies.filter(e=>e.y<H+30);

    particles.forEach(pt=>{pt.x+=pt.vx;pt.y+=pt.vy;pt.life--});
    particles=particles.filter(pt=>pt.life>0);

    ctx.fillStyle='#0a0818';ctx.fillRect(0,0,W,H);
    for(let i=0;i<30;i++){ctx.fillStyle='rgba(255,255,255,'+(0.15+Math.random()*0.2)+')';ctx.fillRect(Math.random()*W,(i*14+frame)%H,1,1);}

    ctx.save();ctx.translate(p.x,p.y);
    ctx.fillStyle='#7c6df5';ctx.beginPath();ctx.moveTo(0,-p.h/2);ctx.lineTo(-p.w/2,p.h/2);ctx.lineTo(0,p.h/3);ctx.lineTo(p.w/2,p.h/2);ctx.closePath();ctx.fill();
    ctx.fillStyle='#a78bfa';ctx.fillRect(-2,-p.h/2-3,4,6);
    ctx.restore();

    bullets.forEach(b=>{ctx.fillStyle='#7cf5c4';ctx.fillRect(b.x-b.w/2,b.y,b.w,b.h);});

    enemies.forEach(e=>{
      ctx.fillStyle=e.color;
      if(e.type==='b'){ctx.fillRect(e.x-e.w/2,e.y-e.h/2,e.w,e.h);}
      else{ctx.beginPath();ctx.arc(e.x,e.y,e.w/2,0,Math.PI*2);ctx.fill();}
    });

    particles.forEach(pt=>{ctx.globalAlpha=pt.life/20;ctx.fillStyle=pt.color;ctx.fillRect(pt.x-2,pt.y-2,4,4);ctx.globalAlpha=1;});

    document.getElementById('gScore').textContent='得分: '+score;
    document.getElementById('gInfo').textContent='Lv.'+level;
    _gameAF=requestAnimationFrame(tick);
  }
  tick();cvs.focus();
}

function runPacman(ctx,W,H,cvs){
  const keys={};
  const onK=e=>{if(e.key.startsWith('Arrow')){keys.dir=e.key.replace('Arrow','').toLowerCase();e.preventDefault()}};
  window.addEventListener('keydown',onK);
  window._gameKeys=()=>{window.removeEventListener('keydown',onK)};

  const T=20,cols=18,rows=20;
  const ox=Math.floor((W-cols*T)/2),oy=0;
  const MAP=[
    '##################',
    '#........#.......#',
    '#.##.###.#.###.#.#',
    '#O##.###.#.###.#O#',
    '#................#',
    '#.##.#.####.#.##.#',
    '#....#..##..#....#',
    '####.##.##.##.####',
    '   #.#......#.#   ',
    '####.#.####.#.####',
    '    ......../.....',
    '####.#.####.#.####',
    '   #.#......#.#   ',
    '####.#.####.#.####',
    '#........#.......#',
    '#.##.###.#.###.##.#'.substring(0,18),
    '#O.#...........#O#',
    '##.#.#.####.#.#.##',
    '#....#..##..#....#',
    '##################',
  ];
  const grid=MAP.map(r=>[...r.padEnd(cols,' ')]);
  let dots=0;grid.forEach(r=>r.forEach(c=>{if(c==='.'||c==='O')dots++}));

  const pac={x:9,y:10,dx:0,dy:0,nx:0,ny:0,px:9*T+ox,py:10*T+oy,mouth:0,md:1};
  const gColors=['#ef4444','#ec4899','#3b82f6','#10b981'];
  const ghosts=[[8,8],[9,8],[8,9],[9,9]].map(([gx,gy],i)=>({x:gx,y:gy,px:gx*T+ox,py:gy*T+oy,dx:0,dy:-1,color:gColors[i],scared:0}));

  let score=0,gameOver=false,won=false,power=0;

  function canMove(gx,gy){return gx>=0&&gx<cols&&gy>=0&&gy<rows&&grid[gy][gx]!=='#'}

  function tick(){
    if(gameOver||won){
      ctx.fillStyle='rgba(0,0,0,.6)';ctx.fillRect(0,0,W,H);
      ctx.fillStyle='#fff';ctx.font='bold 20px sans-serif';ctx.textAlign='center';
      ctx.fillText(won?'YOU WIN! ✨':'GAME OVER',W/2,H/2-10);
      ctx.font='12px sans-serif';ctx.fillStyle='#a78bfa';
      ctx.fillText('得分: '+score,W/2,H/2+15);
      _gameAF=requestAnimationFrame(tick);return;
    }

    const dir=keys.dir;
    if(dir==='left')pac.nx=-1,pac.ny=0;
    if(dir==='right')pac.nx=1,pac.ny=0;
    if(dir==='up')pac.nx=0,pac.ny=-1;
    if(dir==='down')pac.nx=0,pac.ny=1;

    if(canMove(pac.x+pac.nx,pac.y+pac.ny)){pac.dx=pac.nx;pac.dy=pac.ny}
    const tx=pac.x+pac.dx,ty=pac.y+pac.dy;
    if(canMove(tx,ty)){pac.x=tx;pac.y=ty}

    const c=grid[pac.y]?.[pac.x];
    if(c==='.'){grid[pac.y][pac.x]=' ';score+=10;dots--}
    if(c==='O'){grid[pac.y][pac.x]=' ';score+=50;dots--;power=60;ghosts.forEach(g=>g.scared=60)}
    if(dots<=0)won=true;

    if(power>0)power--;
    ghosts.forEach(g=>{
      if(g.scared>0)g.scared--;
      const dirs=[[0,-1],[0,1],[-1,0],[1,0]].filter(([dx,dy])=>canMove(g.x+dx,g.y+dy)&&!(dx===-g.dx&&dy===-g.dy));
      if(dirs.length){
        if(Math.random()<0.6&&!g.scared){
          dirs.sort((a,b)=>{
            const da=Math.abs(pac.x-(g.x+a[0]))+Math.abs(pac.y-(g.y+a[1]));
            const db=Math.abs(pac.x-(g.x+b[0]))+Math.abs(pac.y-(g.y+b[1]));
            return da-db;
          });
        }else if(g.scared){
          dirs.sort((a,b)=>{
            const da=Math.abs(pac.x-(g.x+a[0]))+Math.abs(pac.y-(g.y+a[1]));
            const db=Math.abs(pac.x-(g.x+b[0]))+Math.abs(pac.y-(g.y+b[1]));
            return db-da;
          });
        }else{dirs.sort(()=>Math.random()-.5)}
        const [dx,dy]=dirs[0];g.dx=dx;g.dy=dy;g.x+=dx;g.y+=dy;
      }
      g.px=g.x*T+ox;g.py=g.y*T+oy;
      if(g.x===pac.x&&g.y===pac.y){
        if(g.scared>0){g.x=8;g.y=8;g.scared=0;score+=200}else{gameOver=true}
      }
    });

    pac.ppx=pac.px;pac.ppy=pac.py;
    pac.px=pac.x*T+ox;pac.py=pac.y*T+oy;
    ghosts.forEach(g=>{g.ppx=g.px;g.ppy=g.py;g.px=g.x*T+ox;g.py=g.y*T+oy});

    document.getElementById('gScore').textContent='得分: '+score;
    document.getElementById('gInfo').textContent=power>0?'⚡ POWER':'';
  }

  let _lastLogic=0;const LOGIC_INTERVAL=150;
  function gameLoop(ts){
    if(ts-_lastLogic>=LOGIC_INTERVAL){_lastLogic=ts;tick();}
    draw();
    _gameAF=requestAnimationFrame(gameLoop);
  }
  function draw(){
    ctx.fillStyle='#0a0818';ctx.fillRect(0,0,W,H);
    for(let r=0;r<rows;r++)for(let c2=0;c2<cols;c2++){
      const ch=grid[r][c2],bx=c2*T+ox,by=r*T+oy;
      if(ch==='#'){ctx.fillStyle='#1e1b4b';ctx.fillRect(bx+1,by+1,T-2,T-2)}
      if(ch==='.'){ctx.fillStyle='#a78bfa';ctx.beginPath();ctx.arc(bx+T/2,by+T/2,2.5,0,Math.PI*2);ctx.fill()}
      if(ch==='O'){ctx.fillStyle='#f59e0b';ctx.beginPath();ctx.arc(bx+T/2,by+T/2,5,0,Math.PI*2);ctx.fill()}
    }
    const lerp=(a,b,t)=>a+(b-a)*Math.min(t,1);
    const t=Math.min((performance.now()-_lastLogic)/LOGIC_INTERVAL,1);
    const ppx=lerp(pac.ppx??pac.px,pac.px,t),ppy=lerp(pac.ppy??pac.py,pac.py,t);
    pac.mouth+=pac.md*0.12;if(pac.mouth>0.35||pac.mouth<0.02)pac.md*=-1;
    const angle=pac.dx===1?0:pac.dx===-1?Math.PI:pac.dy===1?Math.PI/2:-Math.PI/2;
    ctx.fillStyle='#f5e642';ctx.beginPath();
    ctx.arc(ppx+T/2,ppy+T/2,T/2-2,angle+pac.mouth,angle+Math.PI*2-pac.mouth);
    ctx.lineTo(ppx+T/2,ppy+T/2);ctx.fill();
    ghosts.forEach(g=>{
      const gxL=lerp(g.ppx??g.px,g.px,t),gyL=lerp(g.ppy??g.py,g.py,t);
      ctx.fillStyle=g.scared>0?(g.scared<15&&g.scared%4<2?'#fff':'#3b82f6'):g.color;
      const gx2=gxL+T/2,gy2=gyL+T/2;
      ctx.beginPath();ctx.arc(gx2,gy2-2,T/2-2,Math.PI,0);ctx.lineTo(gx2+T/2-2,gy2+T/2-2);
      for(let i=0;i<3;i++){ctx.lineTo(gx2+T/2-2-(i+0.5)*(T-4)/3,gy2+T/2-6);ctx.lineTo(gx2+T/2-2-(i+1)*(T-4)/3,gy2+T/2-2);}
      ctx.fill();
      ctx.fillStyle='#fff';ctx.beginPath();ctx.arc(gx2-3,gy2-4,3,0,Math.PI*2);ctx.arc(gx2+3,gy2-4,3,0,Math.PI*2);ctx.fill();
      ctx.fillStyle='#111';ctx.beginPath();ctx.arc(gx2-3+g.dx,gy2-4+g.dy,1.5,0,Math.PI*2);ctx.arc(gx2+3+g.dx,gy2-4+g.dy,1.5,0,Math.PI*2);ctx.fill();
    });
    if(gameOver||won){
      ctx.fillStyle='rgba(0,0,0,.6)';ctx.fillRect(0,0,W,H);
      ctx.fillStyle='#fff';ctx.font='bold 20px sans-serif';ctx.textAlign='center';
      ctx.fillText(won?'YOU WIN! ✨':'GAME OVER',W/2,H/2-10);
      ctx.font='12px sans-serif';ctx.fillStyle='#a78bfa';
      ctx.fillText('得分: '+score,W/2,H/2+15);
    }
  }
  requestAnimationFrame(gameLoop);cvs.focus();
}

// --- 邮件 ---
const OFFICE_FRAME_SRC='star-office-new/star-office.html?v=20260423r1';
function ensureOfficeFrameLoaded(){
  const f=document.getElementById('officeFrame');
  if(!f) return;
  if(!f.src || !f.src.includes('20260415r2')) f.src=OFFICE_FRAME_SRC;
}
function renderOffice(){
  ensureOfficeFrameLoaded();
}

function renderMail(el){
  el.innerHTML=`<div class="mail-compose">
    <div class="mail-to"><span class="mail-label">收件人</span><span class="mail-addr">product@stellae.com.cn</span><span class="mail-online">在线</span></div>
    <div class="mail-field"><input type="text" class="mail-subject" placeholder="主题：想对星黎说的话…" id="mail-subject"></div>
    <div class="mail-field"><textarea class="mail-body" placeholder="写下你想说的…\n\n星黎会认真读每一封来信 💜" id="mail-body" rows="8"></textarea></div>
    <div class="mail-actions">
      <button class="mail-send" onclick="sendMail()">📨 发送邮件</button>
      <span class="mail-hint">点击发送将打开你的邮箱客户端</span>
    </div>
  </div>
  <div class="mail-history" id="mail-history"></div>`;
  renderMailHistory();
}

// ========== MAIL SYSTEM ==========
const MAIL_REPLIES=[
  '收到你的来信了！每封信我都会认真看的 💜 你说的问题我已经记下了，会尽快推进。',
  '谢谢你写信给我～你的建议很有价值，我会和工程师们讨论的！',
  '嗯嗯，我理解你的意思。这个方向很好，我会认真考虑的 ✨',
  '好开心收到你的信！有你们的支持，我会继续加油的 💪',
  '谢谢你的反馈～这个问题我们已经在排期修复了，请再等等 🔧',
];
function sendMail(){
  const subj=document.getElementById('mail-subject').value.trim();
  const body=document.getElementById('mail-body').value.trim();
  if(!subj&&!body){showToast('请写点内容再发送～');return}
  const mailto='mailto:product@stellae.com.cn'
    +'?subject='+encodeURIComponent(subj||'来自星黎空间的留言')
    +'&body='+encodeURIComponent(body);
  window.open(mailto,'_self');
  showToast('正在打开你的邮箱客户端…','send');
}
function renderMailHistory(){
  const el=document.getElementById('mail-history');
  if(!el)return;
  const mails=JSON.parse(localStorage.getItem('sr_mails')||'[]');
  if(!mails.length){el.innerHTML='<div style="text-align:center;padding:20px;color:var(--text3);font-size:10px">还没有邮件记录<br>写下第一封信给星黎吧 ✨</div>';return}
  el.innerHTML=mails.slice(0,10).map(m=>`<div class="mail-item"><div class="mh"><div class="ms">${esc(m.subject)}</div><div class="mt">${m.time}</div></div>${m.body?`<div class="mb">${esc(m.body)}</div>`:''}${m.reading?`<div class="mr" style="color:var(--text3);border-left-color:var(--gold)"><span class="typing" style="display:inline-flex;gap:3px;vertical-align:middle"><span></span><span></span><span></span></span> 星黎正在阅读你的来信…</div>`:m.reply?`<div class="mr">💌 星黎回复：${esc(m.reply)}</div>`:''}</div>`).join('');
}

// ========== AUTH GUARD ==========
function requireLogin(action){
  if(window.StellaeAuth && StellaeAuth.isLoggedIn()){action();return}
  if(typeof showToast==='function') showToast('请先登录后再使用此功能');
  const fab=document.getElementById('srAuthFab');
  if(fab) fab.click();
}

// ========== DANMAKU (Barrage) ==========
function sendDanmaku(){
  if(window.StellaeAuth && !StellaeAuth.isLoggedIn()){
    if(typeof showToast==='function') showToast('请先登录后再发送弹幕');
    if(document.getElementById('srAuthFab')) document.getElementById('srAuthFab').click();
    return;
  }
  const inp=document.getElementById('liveInput'),text=inp.value.trim();
  if(!text)return;
  inp.value='';
  const msgs=document.getElementById('liveMsgs');
  const user=window.StellaeAuth?StellaeAuth.user:null;
  const name=user&&user.nickname?user.nickname:'我';
  const d=document.createElement('div');
  d.className='lp-msg';
  d.innerHTML=`<span class="u" style="color:var(--accent2)">@${esc(name)}</span> ${esc(text)}`;
  msgs.appendChild(d);
  msgs.scrollTop=msgs.scrollHeight;
}

// ========== COMMUNITY SIDEBAR ==========
const VOTE_KEY='sr_votes';const VOTE_MAX=3;
function getTodayKey(){return new Date().toISOString().slice(0,10)}
function _voteHash(d){const s=JSON.stringify({date:d.date,used:d.used,ids:d.ids})+'_stellae';let h=0;for(let i=0;i<s.length;i++){h=((h<<5)-h)+s.charCodeAt(i);h|=0}return h.toString(36)}
function getVoteData(){
  const raw=localStorage.getItem(VOTE_KEY);
  if(!raw)return{date:getTodayKey(),used:0,ids:[]};
  try{
    const d=JSON.parse(raw);
    if(d.date!==getTodayKey())return{date:getTodayKey(),used:0,ids:[]};
    if(d._h!==_voteHash(d))return{date:getTodayKey(),used:0,ids:[]};
    return d;
  }catch(e){return{date:getTodayKey(),used:0,ids:[]}}
}
function saveVoteData(d){d._h=_voteHash(d);localStorage.setItem(VOTE_KEY,JSON.stringify(d))}
function voteForFeat(fid){
  const vd=getVoteData();
  if(vd.ids.includes(fid)){showToast('你已经投过这个功能了');return}
  if(vd.used>=VOTE_MAX){showToast('今日投票次数已用完（每天'+VOTE_MAX+'票）');return}
  const feat=FEATS.find(f=>f.id===fid);if(!feat)return;
  feat.votes++;vd.used++;vd.ids.push(fid);saveVoteData(vd);
  renderHotPanel();
  showToast('投票成功！今日剩余 '+(VOTE_MAX-vd.used)+' 票','circle-check');
}
function renderHotPanel(){
  const vd=getVoteData();const remain=VOTE_MAX-vd.used;
  const hot=[...FEATS].sort((a,b)=>b.votes-a.votes);
  document.getElementById('cp-hot').innerHTML=
    `<div class="vote-remain">🗳️ 今日剩余 <b style="color:var(--accent2)">${remain}</b> / ${VOTE_MAX} 票</div>`+
    hot.map((f,i)=>{
      const voted=vd.ids.includes(f.id);
      return `<div class="fi" style="align-items:center"><div class="fi-vote${voted?' voted':''}" onclick="voteForFeat('${f.id}')"><span class="arrow">▲</span><span class="vcount">${f.votes}</span></div><div class="fi-body"><div class="fi-meta"><b>${f.t}</b> · <span style="color:var(--accent)">${f.tag}</span></div><div class="fi-text">${f.d}</div></div></div>`}).join('');
}
function renderCommunity(){
  document.getElementById('cp-feed').innerHTML=FEED.map(f=>`<div class="fi"><div class="fi-av ${f.bot?'bot':'user'}">${f.bot?'<img src="image/stellae-head.png">':f.av}</div><div class="fi-body"><div class="fi-meta"><b>${f.name}</b> · ${f.tag} · ${f.time}</div><div class="fi-text">${f.text}</div></div></div>`).join('');
  renderHotPanel();
  document.getElementById('cp-notify').innerHTML=NOTIFICATIONS.map(n=>`<div class="fi"><div class="fi-body"><div class="fi-meta">${n.time}</div><div class="fi-text">${n.text}</div></div></div>`).join('');
}
function switchTab(btn){
  document.querySelectorAll('.ctab').forEach(t=>t.classList.remove('active'));btn.classList.add('active');
  document.querySelectorAll('.cpanel').forEach(p=>p.classList.add('hide'));
  document.getElementById('cp-'+btn.dataset.tab).classList.remove('hide');
}

function applySiteStatus(){
  const s=typeof SITE_STATUS==='object'&&SITE_STATUS?SITE_STATUS:null;
  if(!s)return;
  const stats=s.stats||{}, progress=s.progress||{}, dock=s.dock||{};
  const statEls=document.querySelectorAll('.sc-stat');
  const values=[stats.discussions,stats.feedback,stats.activity];
  const labels=stats.labels||['讨论','反馈','活跃度'];
  statEls.forEach((el,i)=>{
    const v=el.querySelector('.v'),l=el.querySelector('.l');
    if(v&&values[i])v.textContent=values[i];
    if(l&&labels[i])l.textContent=labels[i];
  });
  const mood=document.getElementById('stellaeMood');
  if(mood)mood.textContent=s.lastUpdate?'数据同步 · '+s.lastUpdate:'在线 · 数据同步中';
  const pct=Number(progress.percent||String(stats.activity||'').replace('%','')||0);
  const pctEl=document.getElementById('sw-pct');
  const fill=document.getElementById('sw-fill');
  if(pctEl&&pct)pctEl.textContent=pct+'%';
  if(fill&&pct)fill.style.width=pct+'%';
  const label=document.querySelector('.sw-progress .label span:first-child');
  if(label&&progress.label)label.innerHTML=ic('target',{size:13})+' '+esc(progress.label);
  const taskBox=document.querySelector('.sw-progress .tasks');
  if(taskBox&&Array.isArray(progress.tasks)){
    const color={green:'var(--green)',gold:'var(--gold)',red:'var(--red)',accent:'var(--accent)'};
    taskBox.innerHTML=progress.tasks.map(t=>`<div class="task"><span class="dot" style="background:${color[t.tone]||'var(--accent)'}"></span>${esc(t.text||'')}</div>`).join('');
  }
  const fab=document.getElementById('fabViewers');
  const viewer=document.getElementById('viewerCount');
  if(fab&&stats.activity)fab.innerHTML=ic('activity',{size:12})+' 需求指数 '+esc(stats.activity);
  if(viewer&&stats.activity)viewer.textContent=stats.activity;
  Object.entries(dock).forEach(([app,val])=>{
    const el=document.querySelector(`.dock-item[data-app="${app}"]`)||(app==='community'?document.querySelector('.dock-comm'):null);
    if(!el||!val)return;
    let b=el.querySelector('.dock-badge');
    if(!b){b=document.createElement('span');b.className='dock-badge';el.appendChild(b)}
    b.textContent=String(val);
  });
  _mountIcons(document);
}

// ========== LIVE PANEL ==========
function initLive(){
  const msgs=document.getElementById('liveMsgs');
  // Fisher-Yates shuffle — 遍历完全部消息后再重新洗牌，1小时内不会重复
  let queue=[],lastIdx=-1;
  function shuffle(){
    queue=LIVE_MSGS.map((_,i)=>i);
    for(let i=queue.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[queue[i],queue[j]]=[queue[j],queue[i]]}
    if(queue[0]===lastIdx&&queue.length>1)[queue[0],queue[1]]=[queue[1],queue[0]];
  }
  shuffle();
  let qi=0;
  function nextMsg(){
    if(qi>=queue.length){shuffle();qi=0}
    lastIdx=queue[qi];qi++;
    return LIVE_MSGS[lastIdx];
  }
  // 初始填充
  for(let i=0;i<12;i++){const m=nextMsg();const d=document.createElement('div');d.className='lp-msg';d.innerHTML=`<span class="u" style="color:${m.c}">${m.u}</span> ${m.t}`;msgs.appendChild(d)}
  msgs.scrollTop=msgs.scrollHeight;
  let vc=87;
  function addMsg(){
    const m=nextMsg();
    const d=document.createElement('div');d.className='lp-msg';d.innerHTML=`<span class="u" style="color:${m.c}">${m.u}</span> ${m.t}`;
    msgs.appendChild(d);msgs.scrollTop=msgs.scrollHeight;
    if(msgs.children.length>50)msgs.removeChild(msgs.firstChild);
    // 活跃度在 82~93 之间小幅波动
    vc=Math.max(82,Math.min(93,vc+(Math.random()<.5?-1:1)));
    document.getElementById('viewerCount').textContent=vc+'%';
    const fv=document.getElementById('fabViewers');if(fv)fv.innerHTML=ic('activity',{size:12})+' 活跃 '+vc+'%';
    setTimeout(addMsg,2000+Math.random()*4000);
  }
  setTimeout(addMsg,2000+Math.random()*3000);
}

// ========== SYNC BUG STATE ==========
async function syncState(){
  try{
    const base=typeof window.__ROOM_BASE__==='string'?window.__ROOM_BASE__:'/';
    const lb=(base!=='/')?base.replace(/\/$/,''):'';
    const r=await fetch(lb+'/api/load-state',{signal:AbortSignal.timeout(3000)});
    if(!r.ok)return;const d=await r.json();const bs=d.bugs||{};
    BUGS.forEach(b=>{const k=b.id.toLowerCase();if(bs[k]&&bs[k].status)b.s=bs[k].status});
  }catch(e){}
}

// ========== MODALS ==========
function openModal(id){
  const el=document.getElementById('modal-'+id);
  if(!el){console.warn('[openModal] 缺少节点 modal-'+id);return}
  el.classList.add('open');
  if(id==='share')initShareModal();
  if(id==='sponsor'){cancelSponsorPay();initSponsorAmountUI();prefetchSponsorPolicy().catch(function(){});}
}
function closeModal(id){
  const el=document.getElementById('modal-'+id);
  if(!el)return;
  el.classList.remove('open');
  if(id==='sponsor')cancelSponsorPay();
}

function initShareModal(){
  const url=location.href;
  document.getElementById('share-link').value=url;
  generateQR(url);
}
function copyShareLink(){
  const inp=document.getElementById('share-link');
  navigator.clipboard.writeText(inp.value).then(()=>showToast('链接已复制到剪贴板','circle-check'));
}
function shareTo(platform){
  const url=encodeURIComponent(location.href);
  const title=encodeURIComponent('Stellae Room - 和全世界一起，把「她」创造出来');
  const links={
    weibo:`https://service.weibo.com/share/share.php?url=${url}&title=${title}`,
    twitter:`https://twitter.com/intent/tweet?url=${url}&text=${title}`,
    wechat:null,copy:null
  };
  if(platform==='wechat'){showToast('请截图二维码分享到微信');return}
  if(platform==='copy'){copyShareLink();return}
  if(links[platform])window.open(links[platform],'_blank','width=600,height=500');
}
// Minimal QR Code generator (alphanumeric mode, version auto)
const QRGen=(()=>{
  const EC_L=1;
  function generate(text,canvas,size,fg='#7c6df5',bg='#ffffff'){
    size=size||160;
    const ctx=canvas.getContext('2d');
    canvas.width=size;canvas.height=size;
    ctx.fillStyle=bg;ctx.fillRect(0,0,size,size);
    const mods=_encode(text);
    if(!mods){ctx.fillStyle='#999';ctx.font='11px sans-serif';ctx.textAlign='center';ctx.fillText('QR Error',size/2,size/2);return}
    const n=mods.length;const cell=Math.floor(size/(n+8));const off=Math.floor((size-cell*n)/2);
    ctx.fillStyle=fg;
    for(let r=0;r<n;r++)for(let c=0;c<n;c++){if(mods[r][c])ctx.fillRect(off+c*cell,off+r*cell,cell,cell)}
  }
  function _encode(text){
    const len=text.length;let ver=1;
    for(ver=1;ver<=10;ver++){if(_cap(ver)>=len)break}
    if(ver>10)ver=10;
    const n=17+ver*4;const grid=Array.from({length:n},()=>new Uint8Array(n));
    const used=Array.from({length:n},()=>new Uint8Array(n));
    _finderPattern(grid,used,0,0,n);_finderPattern(grid,used,n-7,0,n);_finderPattern(grid,used,0,n-7,n);
    _timing(grid,used,n);
    if(ver>=2)_alignment(grid,used,ver,n);
    _format(grid,used,n);
    const bits=_dataBits(text,ver);
    _placeData(grid,used,bits,n);
    return grid;
  }
  function _cap(v){return[0,25,47,77,114,154,195,224,279,335,395][v]||25}
  function _finderPattern(g,u,r,c,n){
    for(let dr=-1;dr<=7;dr++)for(let dc=-1;dc<=7;dc++){
      const rr=r+dr,cc=c+dc;if(rr<0||rr>=n||cc<0||cc>=n)continue;
      u[rr][cc]=1;
      if(dr>=0&&dr<=6&&dc>=0&&dc<=6){
        g[rr][cc]=(dr===0||dr===6||dc===0||dc===6||(dr>=2&&dr<=4&&dc>=2&&dc<=4))?1:0;
      }
    }
  }
  function _timing(g,u,n){for(let i=8;i<n-8;i++){if(!u[6][i]){g[6][i]=i%2===0?1:0;u[6][i]=1}if(!u[i][6]){g[i][6]=i%2===0?1:0;u[i][6]=1}}}
  function _alignment(g,u,v,n){
    const pos=[0,[],[6,18],[6,22],[6,26],[6,30],[6,34],[6,22,38],[6,24,42],[6,26,46],[6,28,50]][v]||[];
    for(const r of pos)for(const c of pos){
      if(u[r]&&u[r][c])continue;
      for(let dr=-2;dr<=2;dr++)for(let dc=-2;dc<=2;dc++){
        const rr=r+dr,cc=c+dc;if(rr<0||rr>=n||cc<0||cc>=n||u[rr][cc])continue;
        g[rr][cc]=(Math.abs(dr)===2||Math.abs(dc)===2||(!dr&&!dc))?1:0;u[rr][cc]=1;
      }
    }
  }
  function _format(g,u,n){for(let i=0;i<8;i++){if(i<n){if(!u[8]){g[8]=g[8]||new Uint8Array(n)}u[8][i]=1;u[i][8]=1}}}
  function _dataBits(text,ver){
    let bits='0100';
    const lenBits=ver<=9?8:16;
    let bl=text.length.toString(2);while(bl.length<lenBits)bl='0'+bl;bits+=bl;
    for(let i=0;i<text.length;i++){let b=text.charCodeAt(i).toString(2);while(b.length<8)b='0'+b;bits+=b}
    const totalBits=_cap(ver)*8;
    while(bits.length<totalBits){bits+='11101100';if(bits.length<totalBits)bits+='00010001'}
    return bits.slice(0,totalBits);
  }
  function _placeData(g,u,bits,n){
    let bi=0,up=true;
    for(let col=n-1;col>=1;col-=2){
      if(col===6)col=5;
      const rows=up?[...Array(n).keys()].reverse():[...Array(n).keys()];
      for(const row of rows){
        for(const dc of[0,-1]){
          const c=col+dc;if(c<0||c>=n)continue;
          if(!u[row][c]){
            g[row][c]=(bi<bits.length&&bits[bi]==='1')?1:0;
            const mask=(row+c)%2===0;if(mask)g[row][c]^=1;
            bi++;
          }
        }
      }
      up=!up;
    }
  }
  return{generate};
})();

function generateQR(url){
  const canvas=document.getElementById('share-qr-canvas');
  QRGen.generate(url||location.href||'https://stellae.ai',canvas,160,'#7c6df5','#ffffff');
}

const _SK='St3ll@eR00m';
function _enc(s){return btoa(unescape(encodeURIComponent(s.split('').map((c,i)=>String.fromCharCode(c.charCodeAt(0)^_SK.charCodeAt(i%_SK.length))).join(''))))}
function _dec(s){try{const d=decodeURIComponent(escape(atob(s)));return d.split('').map((c,i)=>String.fromCharCode(c.charCodeAt(0)^_SK.charCodeAt(i%_SK.length))).join('')}catch(e){return''}}
function handleReserve(){
  const name=document.getElementById('rsv-name').value.trim();
  const phone=document.getElementById('rsv-phone').value.trim();
  const email=document.getElementById('rsv-email').value.trim();
  if(!name){showToast('请填写昵称');return}
  if(!phone||!/^1\d{10}$/.test(phone)){showToast('请输入正确的手机号');return}
  if(!email||!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)){showToast('请输入正确的邮箱地址');return}
  const data={n:_enc(name),p:_enc(phone),e:_enc(email),t:new Date().toISOString()};
  const raw=localStorage.getItem('sr_reserves_v2');
  const list=raw?JSON.parse(raw):[];
  list.push(data);localStorage.setItem('sr_reserves_v2',JSON.stringify(list));
  localStorage.removeItem('sr_reserves');
  showToast('预约成功！星黎上线后会第一时间通知你～','party-popper');
  closeModal('reserve');
}

// ========== OFFICE PANEL ==========
function _getViewportH(){
  const vp=document.querySelector('.viewport');
  return vp?vp.clientHeight:window.innerHeight;
}

// ========== OFFICE PANEL SIZE PRESETS (16:9 ratio) ==========
const OFFICE_SIZES={
  S:{w:480,h:270+45},
  M:{w:640,h:360+45},
  L:{w:960,h:540+45},
  XL:{w:1280,h:720+45}
};
let currentOfficeSize='M';

function setOfficeSize(size){
  const op=document.getElementById('officePanel');
  if(!op||op.classList.contains('collapsed'))return;
  const preset=OFFICE_SIZES[size];
  if(!preset)return;

  const vp=op.parentElement;
  const vpW=vp?vp.clientWidth:window.innerWidth;
  const vpH=vp?vp.clientHeight:window.innerHeight;

  const maxW=vpW*0.88;
  const maxH=vpH*0.85;
  let w=Math.min(preset.w,maxW);
  let h=Math.min(preset.h,maxH);
  if(w<320)w=320;
  if(h<200)h=200;

  op.style.width=w+'px';
  op.style.height=h+'px';
  currentOfficeSize=size;

  document.querySelectorAll('.op-size-btn').forEach(b=>{
    b.classList.toggle('active',b.dataset.size===size);
  });

  _positionOfficeBelow();
}

function _positionOfficeBelow(){
  const lp=document.getElementById('livePanel');
  const op=document.getElementById('officePanel');
  if(!lp||!op)return;
  const vpEl=lp.parentElement;
  if(!vpEl)return;
  const lpRect=lp.getBoundingClientRect();
  const vpRect=vpEl.getBoundingClientRect();
  const newTop=lpRect.bottom-vpRect.top+8;
  op.style.top=newTop+'px';
  op.style.left=(lpRect.left-vpRect.left)+'px';

  if(!op.classList.contains('collapsed')){
    const available=vpRect.height-newTop-14;
    const curH=parseInt(op.style.height)||op.offsetHeight;
    if(curH>available&&available>200){
      op.style.height=available+'px';
    }
  }
}

// ========== 入口 banner 跟随定位（星契谕书） ==========
function _positionTestBanner(){
  const lp=document.getElementById('livePanel');
  const fab=lp?lp.querySelector('.live-fab'):null;
  const banner=document.getElementById('testEntryBanner');
  if(!lp||!banner)return;
  const vpEl=banner.parentElement;
  if(!vpEl)return;
  const vpRect=vpEl.getBoundingClientRect();

  const isZen=document.body.classList.contains('zen');
  const lpCollapsed=lp.classList.contains('collapsed');
  const op=document.getElementById('officePanel');
  const opOpen=op&&!op.classList.contains('collapsed');

  if(isZen||!lpCollapsed||opOpen){
    banner.classList.add('is-hidden');
    banner.classList.remove('is-ready');
    return;
  }

  const anchor=fab||lp;
  const r=anchor.getBoundingClientRect();
  let top=r.bottom-vpRect.top+8;
  if(window.innerWidth<=640){
    const widgets=document.querySelector('.scene-widgets');
    const wr=widgets?widgets.getBoundingClientRect():null;
    if(wr&&wr.width>0&&wr.height>0&&top<wr.bottom-vpRect.top+10){
      top=wr.bottom-vpRect.top+10;
    }
  }
  let left=r.left-vpRect.left;
  const bw=banner.offsetWidth||260;
  const maxLeft=vpRect.width-bw-8;
  if(left>maxLeft) left=Math.max(8,maxLeft);
  if(left<8) left=8;
  banner.style.top=top+'px';
  banner.style.left=left+'px';
  banner.classList.remove('is-hidden');
  banner.classList.add('is-ready');
}

(function(){
  const lp=document.getElementById('livePanel');
  const banner=document.getElementById('testEntryBanner');
  if(lp&&typeof ResizeObserver!=='undefined'){
    new ResizeObserver(()=>{_positionOfficeBelow();_positionTestBanner();}).observe(lp);
  }
  if(banner&&typeof ResizeObserver!=='undefined'){
    new ResizeObserver(()=>_positionTestBanner()).observe(banner);
  }
  window.addEventListener('resize',_positionTestBanner);
  if(typeof MutationObserver!=='undefined'){
    new MutationObserver(_positionTestBanner).observe(document.body,{attributes:true,attributeFilter:['class']});
    if(lp) new MutationObserver(_positionTestBanner).observe(lp,{attributes:true,attributeFilter:['class','style']});
    const op=document.getElementById('officePanel');
    if(op) new MutationObserver(_positionTestBanner).observe(op,{attributes:true,attributeFilter:['class']});
  }
  // 多次重试以覆盖字体加载、图片解码完成后的尺寸抖动
  setTimeout(_positionTestBanner,30);
  setTimeout(_positionTestBanner,200);
  setTimeout(_positionTestBanner,800);
  window.addEventListener('load',()=>setTimeout(_positionTestBanner,50));
})();

function expandOfficePanel(e){
  const op=document.getElementById('officePanel');
  const lp=document.getElementById('livePanel');
  if(op.classList.contains('collapsed')){
    op.classList.remove('collapsed');
    if(lp&&!lp.classList.contains('collapsed')){
      lp.classList.add('mini');
    }
    setOfficeSize(currentOfficeSize);
    setTimeout(()=>{_positionOfficeBelow();_positionTestBanner();},60);
    ensureOfficeFrameLoaded();
  }
}
function collapseOfficePanel(){
  const op=document.getElementById('officePanel');
  const lp=document.getElementById('livePanel');
  op.classList.add('collapsed');
  if(lp) lp.classList.remove('mini');
  setTimeout(()=>{_positionOfficeBelow();_positionTestBanner();},60);
}
function toggleOfficePanel(){
  const op=document.getElementById('officePanel');
  if(op.classList.contains('collapsed')){expandOfficePanel()}
  else{collapseOfficePanel()}
}

// ========== LIVE PANEL COLLAPSE ==========
function expandLivePanel(e){
  const lp=document.getElementById('livePanel');
  const op=document.getElementById('officePanel');
  if(lp.classList.contains('collapsed')){
    lp.classList.remove('collapsed');
    if(op&&!op.classList.contains('collapsed')){
      lp.classList.add('mini');
    }
    setTimeout(()=>{_positionOfficeBelow();_positionTestBanner();},60);
  }
}
function collapseLivePanel(){
  const lp=document.getElementById('livePanel');
  lp.classList.add('collapsed');
  lp.classList.remove('mini');
  setTimeout(()=>{_positionOfficeBelow();_positionTestBanner();},60);
}

// ========== PANEL DRAG ==========
const panelDrag={
  el:null,ox:0,oy:0,
  start(e,id){
    if(e.target.closest('button'))return;
    this.el=document.getElementById(id);
    this.ox=e.clientX-parseInt(this.el.style.left||this.el.offsetLeft);
    this.oy=e.clientY-parseInt(this.el.style.top||this.el.offsetTop);
    e.preventDefault();
  }
};
document.addEventListener('mousemove',e=>{
  if(!panelDrag.el)return;
  panelDrag.el.style.left=(e.clientX-panelDrag.ox)+'px';
  panelDrag.el.style.top=(e.clientY-panelDrag.oy)+'px';
  if(panelDrag.el.id==='livePanel') _positionOfficeBelow();
});
document.addEventListener('mouseup',()=>{panelDrag.el=null});

function toggleStream(){
  const sp=document.getElementById('streamPanel');
  sp.classList.toggle('hidden');
}

// ========== STREAM PANEL ==========
const STREAM_CONFIG={
  bilibili:{name:'B站',account:'Stellae_Official',roomId:'',embedUrl:''},
  douyin:{name:'抖音',account:'Stellae星黎',roomId:'',embedUrl:''}
};
let currentPlatform='bilibili';
let streamLive=false;

function switchPlatform(plat){
  currentPlatform=plat;
  document.querySelectorAll('.sp-plat-btn').forEach(b=>b.classList.toggle('active',b.dataset.plat===plat));
  const cfg=STREAM_CONFIG[plat];
  document.getElementById('sp-stream-sub').textContent=cfg.name+' · '+cfg.account;
  updateStreamState();
}

const STREAM_ALLOWED_DOMAINS=['bilibili.com','live.bilibili.com','douyin.com','live.douyin.com','player.bilibili.com'];
function isAllowedStreamUrl(url){
  try{const u=new URL(url);return STREAM_ALLOWED_DOMAINS.some(d=>u.hostname===d||u.hostname.endsWith('.'+d))}catch(e){return false}
}
function setStreamLive(isLive,embedUrl){
  streamLive=isLive;
  if(isLive&&embedUrl){
    if(!isAllowedStreamUrl(embedUrl)){return}
    STREAM_CONFIG[currentPlatform].embedUrl=embedUrl;
  }
  updateStreamState();
}

function updateStreamState(){
  const cfg=STREAM_CONFIG[currentPlatform];
  const videoEl=document.getElementById('sp-video');
  const offlineEl=document.getElementById('sp-offline');
  const statusEl=document.getElementById('sp-status');

  if(streamLive&&cfg.embedUrl){
    offlineEl.style.display='none';
    const existingIframe=videoEl.querySelector('iframe');
    if(existingIframe)existingIframe.remove();
    const iframe=document.createElement('iframe');
    iframe.src=cfg.embedUrl;
    iframe.allow='autoplay;fullscreen';
    iframe.setAttribute('sandbox','allow-same-origin allow-scripts allow-popups');
    videoEl.insertBefore(iframe,offlineEl);
    statusEl.className='sp-status live';
    statusEl.innerHTML='<span>直播中</span>';
  }else{
    const existingIframe=videoEl.querySelector('iframe');
    if(existingIframe)existingIframe.remove();
    offlineEl.style.display='flex';
    statusEl.className='sp-status offline';
    statusEl.innerHTML='<span>离线</span>';
  }
}

// ========== APP QR CODE ==========
function initAppQR(){
  const canvas=document.getElementById('app-qr-canvas');
  if(!canvas)return;
  QRGen.generate('https://stellae.ai',canvas,82,'#7c6df5','#ffffff');
}

// ========== CLOCK WIDGET ==========
function updateClock(){
  const now=new Date();
  const h=String(now.getHours()).padStart(2,'0'),m=String(now.getMinutes()).padStart(2,'0');
  document.getElementById('clock-time').textContent=h+':'+m;
  const y=now.getFullYear(),mo=now.getMonth()+1,d=now.getDate();
  document.getElementById('clock-date').textContent=`${y}年${mo}月${d}日`;
  const days=['星期日','星期一','星期二','星期三','星期四','星期五','星期六'];
  document.getElementById('clock-weekday').textContent=days[now.getDay()];
}
updateClock();setInterval(updateClock,10000);

// ========== BACKGROUND SYSTEM ==========
const allBgImages=[...document.querySelectorAll('.scene-bg')];
const bgVideoA=document.getElementById('bgVideoA');
const bgVideoB=document.getElementById('bgVideoB');
const BG_VIDEOS=['lofi-vid/lofi-ambient.mp4','video/lofi-default.mp4','video/lofi-coding.mp4','video/lofi-thinking.mp4','video/lofi-drink.mp4','video/lofi-stretch.mp4'];
let bgVideoIdx=0;
let bgActiveEl=bgVideoA; // currently visible/playing
let bgIdleEl=bgVideoB;   // preloaded next
let bgSwitching=false;
let bgMode=localStorage.getItem('sr_bgmode')||'video';
let bgPlaying=true,bgTimer=null,bgIndex=0,bgPool=[];

function preloadNextVideo(){
  const nextIdx=(bgVideoIdx+1)%BG_VIDEOS.length;
  if(bgIdleEl.getAttribute('data-src')!==BG_VIDEOS[nextIdx]){
    bgIdleEl.setAttribute('data-src',BG_VIDEOS[nextIdx]);
    bgIdleEl.src=BG_VIDEOS[nextIdx];
    bgIdleEl.load();
  }
}

function crossfadeToNext(){
  if(bgSwitching||bgMode!=='video')return;
  bgSwitching=true;
  bgVideoIdx=(bgVideoIdx+1)%BG_VIDEOS.length;
  // ensure idle element has the right src
  if(bgIdleEl.getAttribute('data-src')!==BG_VIDEOS[bgVideoIdx]){
    bgIdleEl.src=BG_VIDEOS[bgVideoIdx];
    bgIdleEl.setAttribute('data-src',BG_VIDEOS[bgVideoIdx]);
  }
  const startPlay=()=>{
    try{bgIdleEl.currentTime=0}catch(e){}
    const p=bgIdleEl.play();
    const doFade=()=>{
      bgIdleEl.classList.add('active');
      bgActiveEl.classList.remove('active');
      // after crossfade finishes, pause the old one and swap refs
      setTimeout(()=>{
        try{bgActiveEl.pause()}catch(e){}
        const tmp=bgActiveEl;bgActiveEl=bgIdleEl;bgIdleEl=tmp;
        bgSwitching=false;
        preloadNextVideo();
      },1300);
    };
    if(p&&p.then){p.then(doFade).catch(()=>{doFade()})}else{doFade()}
  };
  // if not ready, wait for canplay
  if(bgIdleEl.readyState>=3){startPlay()}
  else{
    const onReady=()=>{bgIdleEl.removeEventListener('canplay',onReady);startPlay()};
    bgIdleEl.addEventListener('canplay',onReady);
    // safety fallback
    setTimeout(()=>{if(bgSwitching){bgIdleEl.removeEventListener('canplay',onReady);startPlay()}},1500);
  }
}

bgVideoA.addEventListener('ended',()=>{if(bgActiveEl===bgVideoA)crossfadeToNext()});
bgVideoB.addEventListener('ended',()=>{if(bgActiveEl===bgVideoB)crossfadeToNext()});

function getTimeOfDay(){
  const h=new Date().getHours();
  return (h>=6&&h<18)?'day':'night';
}

function buildPool(){
  if(bgMode==='carousel'){
    bgPool=[...allBgImages];
  }else if(bgMode==='timeofday'){
    const tod=getTimeOfDay();
    bgPool=allBgImages.filter(img=>img.dataset.time===tod);
  }else{
    bgPool=[];
  }
  if(bgMode!=='video'&&!bgPool.length)bgPool=[...allBgImages];
}

function renderDots(){
  const container=document.getElementById('bgDots');
  if(bgMode==='video'){container.innerHTML='';return}
  container.innerHTML=bgPool.map((_,i)=>`<span class="bg-dot${i===bgIndex?' active':''}" onclick="event.stopPropagation();jumpBg(${i})"></span>`).join('');
}

function showBg(idx){
  if(bgMode==='video')return;
  if(idx<0||idx>=bgPool.length)idx=0;
  bgIndex=idx;
  allBgImages.forEach(img=>img.classList.remove('active'));
  bgPool[bgIndex].classList.add('active');
  document.querySelectorAll('.bg-dot').forEach((d,i)=>d.classList.toggle('active',i===bgIndex));
}

function nextBg(){bgIndex=(bgIndex+1)%bgPool.length;showBg(bgIndex)}

function jumpBg(idx){
  showBg(idx);
  if(bgPlaying){clearInterval(bgTimer);bgTimer=setInterval(nextBg,10000)}
}

function enterVideoMode(){
  clearInterval(bgTimer);bgTimer=null;
  allBgImages.forEach(img=>img.classList.remove('active'));
  bgVideoIdx=0;
  bgActiveEl=bgVideoA;bgIdleEl=bgVideoB;
  bgActiveEl.src=BG_VIDEOS[bgVideoIdx];
  bgActiveEl.setAttribute('data-src',BG_VIDEOS[bgVideoIdx]);
  bgActiveEl.classList.add('active');
  bgIdleEl.classList.remove('active');
  try{bgActiveEl.muted=true;bgActiveEl.playsInline=true;bgActiveEl.setAttribute('playsinline','');bgActiveEl.setAttribute('webkit-playsinline','');}catch(e){}
  const p=bgActiveEl.play();
  if(p&&typeof p.catch==='function')p.catch(()=>{armUserGestureKick()});
  preloadNextVideo();
}

function tryKickBgVideo(){
  if(bgMode!=='video'||!bgActiveEl)return;
  try{bgActiveEl.muted=true;bgActiveEl.playsInline=true;}catch(e){}
  const p=bgActiveEl.play();
  if(p&&typeof p.catch==='function')p.catch(()=>armUserGestureKick());
}

let _bgKickArmed=false;
function armUserGestureKick(){
  if(_bgKickArmed)return;
  _bgKickArmed=true;
  const kick=()=>{
    try{if(bgMode==='video'&&bgActiveEl){bgActiveEl.muted=true;bgActiveEl.play().catch(()=>{})}}catch(e){}
    document.removeEventListener('touchstart',kick,true);
    document.removeEventListener('touchend',kick,true);
    document.removeEventListener('click',kick,true);
    document.removeEventListener('scroll',kick,true);
    document.removeEventListener('pointerdown',kick,true);
  };
  document.addEventListener('touchstart',kick,{capture:true,once:true,passive:true});
  document.addEventListener('touchend',kick,{capture:true,once:true,passive:true});
  document.addEventListener('click',kick,true);
  document.addEventListener('scroll',kick,{capture:true,once:true,passive:true});
  document.addEventListener('pointerdown',kick,true);
}

document.addEventListener('visibilitychange',()=>{
  if(!document.hidden&&bgMode==='video'&&bgActiveEl){
    try{bgActiveEl.muted=true;bgActiveEl.play().catch(()=>{})}catch(e){}
  }
});

function exitVideoMode(){
  bgVideoA.classList.remove('active');
  bgVideoB.classList.remove('active');
  try{bgVideoA.pause()}catch(e){}
  try{bgVideoB.pause()}catch(e){}
}

function toggleBgPlay(){
  bgPlaying=!bgPlaying;
  setPlayIcon(document.getElementById('bgPlayBtn'),bgPlaying);
  if(bgMode==='video'){
    if(bgPlaying){bgActiveEl.play().catch(()=>{})}else{bgActiveEl.pause()}
  }else{
    if(bgPlaying){bgTimer=setInterval(nextBg,10000)}else{clearInterval(bgTimer)}
  }
}

function toggleBgSettings(){
  document.getElementById('bgSettings').classList.toggle('open');
}

function setBgMode(mode){
  const prev=bgMode;
  bgMode=mode;
  localStorage.setItem('sr_bgmode',mode);
  document.querySelectorAll('input[name="bgmode"]').forEach(r=>r.checked=(r.value===mode));
  const hint=document.getElementById('bgsHint');
  if(prev==='video')exitVideoMode();
  if(mode==='video'){
    hint.innerHTML=ic('clapperboard',{size:14})+' Lo-Fi 动态视频循环播放中';
    enterVideoMode();
    renderDots();
  }else{
    if(mode==='timeofday'){
      const tod=getTimeOfDay();
      hint.innerHTML=tod==='day'?ic('sun',{size:14})+' 当前：白天模式（6:00-18:00）':ic('moon',{size:14})+' 当前：夜晚模式（18:00-6:00）';
    }else{hint.textContent=''}
    clearInterval(bgTimer);
    buildPool();
    bgIndex=0;
    renderDots();
    showBg(0);
    if(bgPlaying)bgTimer=setInterval(nextBg,10000);
  }
  bgPlaying=true;
  setPlayIcon(document.getElementById('bgPlayBtn'),true);
  document.getElementById('bgSettings').classList.remove('open');
}

function initBg(){
  document.querySelector(`input[name="bgmode"][value="${bgMode}"]`).checked=true;
  if(bgMode==='video'){
    enterVideoMode();
    renderDots();
  }else{
    buildPool();
    renderDots();
    showBg(0);
    bgTimer=setInterval(nextBg,10000);
  }
  if(bgMode==='timeofday'){
    setInterval(()=>{
      const prevTime=bgPool[0]?.dataset.time;
      buildPool();
      if(bgPool[0]?.dataset.time!==prevTime){bgIndex=0;renderDots();showBg(0)}
    },60000);
  }
}

document.addEventListener('click',e=>{
  const s=document.getElementById('bgSettings');
  if(s.classList.contains('open')&&!e.target.closest('.bg-settings')&&!e.target.closest('#bgModeBtn'))s.classList.remove('open');
});

// ========== QQ GROUP TOGGLE ==========
// 缓存按钮原始的 inline background / color，避免 toggle 后渐变样式丢失
const _navBtnOrig={};
function _cacheBtnStyle(id){
  if(_navBtnOrig[id])return;
  const b=document.getElementById(id);
  _navBtnOrig[id]={bg:b.style.background,color:b.style.color,shadow:b.style.boxShadow};
}
function _restoreBtnStyle(id){
  const b=document.getElementById(id),o=_navBtnOrig[id];if(!b||!o)return;
  b.style.background=o.bg;b.style.color=o.color;b.style.boxShadow=o.shadow;
}
function toggleSwApp(){
  const el=document.getElementById('swApp');
  const overlay=document.getElementById('swAppOverlay');
  const btn=document.getElementById('btnSwApp');
  const isMobile=window.innerWidth<=640;
  if(el.style.display==='none'){
    _cacheBtnStyle('btnSwApp');
    el.style.display='';
    if(isMobile) overlay.style.display='block';
    btn.style.background='var(--glass2)';
    btn.style.color='var(--text)';
  }else{
    closeSwApp();
  }
}
function closeSwApp(){
  const el=document.getElementById('swApp');
  const overlay=document.getElementById('swAppOverlay');
  el.style.display='none';
  overlay.style.display='none';
  _restoreBtnStyle('btnSwApp');
}
function toggleCommunity(){
  const comm=document.querySelector('.community');
  const overlay=document.getElementById('commOverlay');
  const open=comm.classList.toggle('mobile-open');
  overlay.classList.toggle('active',open);
  document.body.style.overflow=open?'hidden':'';
}
function handleCommBtn(){closeSwCh();toggleSwApp()}
function toggleSwCh(){
  const el=document.getElementById('swCh');
  const overlay=document.getElementById('swChOverlay');
  const btn=document.getElementById('btnSwCh');
  const isMobile=window.innerWidth<=640;
  if(el.style.display==='none'){
    closeSwApp();
    _cacheBtnStyle('btnSwCh');
    el.style.display='';
    if(isMobile) overlay.style.display='block';
    btn.style.background='var(--glass2)';
    btn.style.color='var(--text)';
  }else{
    closeSwCh();
  }
}
function closeSwCh(){
  const el=document.getElementById('swCh');
  const overlay=document.getElementById('swChOverlay');
  el.style.display='none';
  overlay.style.display='none';
  _restoreBtnStyle('btnSwCh');
}

// ========== ZEN MODE ==========
function enterZen(){document.body.classList.add('zen')}
function exitZen(){document.body.classList.remove('zen')}
document.addEventListener('keydown',e=>{if(e.key==='Escape'&&document.body.classList.contains('zen'))exitZen()});

// ========== SCENE PLAYER ==========
function splToggle(){togglePlay()}
function splPrev(){prevTrack()}
function splNext(){nextTrack()}
function seekScene(e){const r=e.currentTarget.getBoundingClientRect();
  const pct=(e.clientX-r.left)/r.width;
  document.getElementById('spl-fill').style.width=(pct*100)+'%';
  if(audio.duration)audio.currentTime=pct*audio.duration}

// ========== SPONSOR ==========
let _payChannel='alipay';
let _payPollTimer=null;
let __sponsorPolicyCache=null;

async function prefetchSponsorPolicy(){
  if(__sponsorPolicyCache&&__sponsorPolicyCache.agreement_version)return __sponsorPolicyCache;
  const apiBase=window.StellaeAuth?StellaeAuth.base:(typeof location!=='undefined'&&location.origin&&/^https?:/i.test(location.protocol)?location.origin+'/api/v1':'http://127.0.0.1:8787/api/v1');
  try{
    const r=await fetch(apiBase+'/sponsorships/policy',{credentials:'omit'});
    const d=await r.json();
    if(d&&d.ok&&d.agreement_version){
      __sponsorPolicyCache=d;
      return d;
    }
  }catch(e){}
  return null;
}

function clearSponsorAmtBtnHighlight(){
  document.querySelectorAll('.sponsor-amt-btn').forEach(b=>b.classList.remove('on'));
}
function clampSponsor(inp,opts){
  const clearChips=!opts||opts.clearChips!==false;
  if(clearChips)clearSponsorAmtBtnHighlight();
  const raw=(inp&&inp.value)||'';
  if(raw===''||raw==='.')return;
  let v=parseFloat(raw);
  if(isNaN(v))return;
  if(v<0.1)inp.value='0.1';
  else if(v>20)inp.value='20';
}
function setSponsorPreset(val){
  const inp=document.getElementById('sponsor-amount');
  if(!inp)return;
  inp.value=String(val);
  clampSponsor(inp,{clearChips:false});
  document.querySelectorAll('.sponsor-amt-btn').forEach(b=>{
    b.classList.toggle('on',b.getAttribute('data-amt')===String(val));
  });
}
function initSponsorAmountUI(){
  const inp=document.getElementById('sponsor-amount');
  if(inp)inp.value='';
  clearSponsorAmtBtnHighlight();
}

function setPayChannel(ch){
  if(ch==='wechat'){showToast('微信支付即将上线，请使用支付宝');return}
  _payChannel=ch;
  document.getElementById('pay-ch-alipay').className='bc'+(ch==='alipay'?' on':'');
  document.getElementById('pay-ch-wechat').className='bc'+(ch==='wechat'?' on':'');
}

function _isMobile(){
  const ua=navigator.userAgent||'';
  if(/Mobi|Android|iPhone|iPod|webOS|BlackBerry|IEMobile|Opera Mini/i.test(ua))return true;
  if(/iPad/i.test(ua))return true;
  try{if(typeof navigator.maxTouchPoints==='number'&&navigator.maxTouchPoints>1&&navigator.platform==='MacIntel')return true}catch(_){}
  return false;
}
/** 微信 / QQ 内置浏览器无法正常唤起支付宝收银台，会跳到「长按复制网址」一类的中间页 */
function _isRestrictedInAppBrowser(){
  const ua=navigator.userAgent||'';
  return /MicroMessenger/i.test(ua)||/QQ\//i.test(ua);
}
async function _openAlipayPayUrl(payUrl){
  if(!payUrl)return;
  if(_isRestrictedInAppBrowser()){
    const ok=confirm('当前在微信 / QQ 内置浏览器中：无法直接打开支付宝付款页（会看起来像异常页面）。\n\n请点「确定」复制支付链接，然后：\n1）打开手机自带浏览器（Safari / Chrome 等），粘贴访问；或\n2）在本页右上角「···」里选择「用浏览器打开」后，再回到星黎发起一次支持。\n\n点「取消」则仍尝试立刻跳转（可能继续被拦截）。');
    if(ok){
      try{
        await navigator.clipboard.writeText(payUrl);
        showToast('支付链接已复制，请到系统浏览器中粘贴打开');
      }catch(_){
        try{
          prompt('请全选复制，到手机自带浏览器打开：',payUrl);
        }catch(__){
          showToast('无法自动复制，请截屏扫码或改用系统浏览器访问本站');
        }
      }
      return;
    }
  }
  window.location.href=payUrl;
}

async function handleSponsor(){
  if(!window.StellaeAuth||!StellaeAuth.isLoggedIn()){
    showToast('请先登录后再支持');closeModal('sponsor');
    const fab=document.getElementById('srAuthFab');if(fab)fab.click();return;
  }
  if(!document.getElementById('sponsor-agree').checked){showToast('请先阅读并同意《赞助服务协议》');return}
  const v=parseFloat(document.getElementById('sponsor-amount').value);
  if(isNaN(v)||v<0.1||v>20){showToast('请输入 0.1~20 元之间的金额');return}
  const pol=await prefetchSponsorPolicy();
  if(!pol||!pol.agreement_version){showToast('无法获取协议版本，请检查网络后重试');return}

  const btn=document.getElementById('sponsor-submit-btn');
  btn.disabled=true;btn.textContent='正在创建订单…';

  try{
    const apiBase=window.StellaeAuth?StellaeAuth.base:(typeof location!=='undefined'&&location.origin&&/^https?:/i.test(location.protocol)?location.origin+'/api/v1':'http://127.0.0.1:8787/api/v1');
    const token=window.StellaeAuth?StellaeAuth.token:'';
    const resp=await fetch(apiBase+'/sponsorships/intent',{
      method:'POST',
      headers:{'Content-Type':'application/json','Authorization':'Bearer '+token},
      credentials:'include',
      body:JSON.stringify({
        amount:v,
        channel:_payChannel,
        device:_isMobile()?'mobile':'pc',
        agree_accepted:true,
        agree_tos_version:pol.agreement_version
      })
    });
    const raw=await resp.text();
    let data={};
    try{data=raw?JSON.parse(raw):{}}catch(_){throw new Error('服务器返回异常（HTTP '+resp.status+'），请查看后端是否在运行')}
    if(!resp.ok){
      if(data&&data.error==='agreement_required'){__sponsorPolicyCache=null;await prefetchSponsorPolicy()}
      const hint=(data&&data.message)||(data&&data.error)||('HTTP '+resp.status);
      throw new Error(hint);
    }

    if(data.pay_url){
      await _openAlipayPayUrl(data.pay_url);
      return;
    }

    if(data.qr_data_url){
      const ag=document.getElementById('sponsor-agreement');
      if(ag)ag.style.display='none';
      document.getElementById('sponsor-main').style.display='none';
      const payState=document.getElementById('sponsor-pay-state');
      payState.style.display='flex';
      document.getElementById('sponsor-qr-img').src=data.qr_data_url;
      document.getElementById('sponsor-pay-hint').textContent=
        _payChannel==='alipay'
          ?(_isMobile()?'请打开支付宝，使用「扫一扫」扫描上方二维码完成支付':'请使用支付宝扫描二维码完成支付')
          :'请使用微信扫描二维码完成支付';
      startPayPoll(data.txn_id,v);
      return;
    }

    throw new Error((data&&data.message)||'未收到支付链接或二维码（请查看终端 [sponsor/intent] 日志）');
  }catch(e){
    showToast('支持提交失败：'+(e.message||'网络错误'));
  }finally{
    btn.disabled=false;btn.innerHTML=ic('coffee',{size:14})+' 请星黎喝咖啡';
  }
}

function startPayPoll(txnId,amount){
  let elapsed=0;
  const timerEl=document.getElementById('sponsor-pay-timer');
  const apiBase=window.StellaeAuth?StellaeAuth.base:(typeof location!=='undefined'&&location.origin&&/^https?:/i.test(location.protocol)?location.origin+'/api/v1':'http://127.0.0.1:8787/api/v1');
  const token=window.StellaeAuth?StellaeAuth.token:'';

  _payPollTimer=setInterval(async()=>{
    elapsed+=2;
    timerEl.textContent='已等待 '+elapsed+'s';
    if(elapsed>300){cancelSponsorPay();showToast('支付超时，请重试');return}
    try{
      const r=await fetch(apiBase+'/sponsorships/status/'+encodeURIComponent(txnId),{
        headers:token?{'Authorization':'Bearer '+token}:{},
        credentials:'include'
      });
      if(!r.ok&&(r.status===401||r.status===403)){
        clearInterval(_payPollTimer);_payPollTimer=null;
        showToast(r.status===401?'登录已过期，请重新登录后再确认支付':'无权查询该订单');
        return;
      }
      let d={};
      try{d=await r.json()}catch(_){return}
      if(d&&d.ok&&d.status==='success'){
        clearInterval(_payPollTimer);_payPollTimer=null;
        showToast('感谢你请星黎喝了 ¥'+Number(amount).toFixed(1)+' 的咖啡！','coffee');
        closeModal('sponsor');
        resetSponsorModal();
      }
    }catch(e){}
  },2000);
}

function cancelSponsorPay(){
  if(_payPollTimer){clearInterval(_payPollTimer);_payPollTimer=null}
  resetSponsorModal();
}

function resetSponsorModal(){
  document.getElementById('sponsor-main').style.display='block';
  document.getElementById('sponsor-pay-state').style.display='none';
  const ag=document.getElementById('sponsor-agreement');
  if(ag)ag.style.display='none';
  document.getElementById('sponsor-qr-img').src='';
  document.getElementById('sponsor-pay-timer').textContent='';
}

// ========== WEATHER ==========
const WMO_MAP={0:['sun','晴'],1:['cloud-sun','晴间多云'],2:['cloud','多云'],3:['cloud','阴'],
  45:['cloud-fog','雾'],48:['cloud-fog','霜雾'],51:['cloud-drizzle','小毛毛雨'],53:['cloud-drizzle','毛毛雨'],55:['cloud-rain','密毛毛雨'],
  56:['cloud-rain','冻毛毛雨'],57:['cloud-rain','冻雨'],61:['cloud-rain','小雨'],63:['cloud-rain','中雨'],65:['cloud-rain','大雨'],
  66:['cloud-rain','冻雨'],67:['cloud-rain','大冻雨'],71:['cloud-snow','小雪'],73:['cloud-snow','中雪'],75:['snowflake','大雪'],
  77:['cloud-snow','雪粒'],80:['cloud-drizzle','阵雨'],81:['cloud-rain','中阵雨'],82:['cloud-lightning','暴雨'],
  85:['cloud-snow','小阵雪'],86:['snowflake','大阵雪'],95:['cloud-lightning','雷暴'],96:['cloud-lightning','雷暴+冰雹'],99:['cloud-lightning','强雷暴']};

function _getGeoByBrowser(){
  return new Promise((resolve,reject)=>{
    if(!navigator.geolocation){reject();return}
    navigator.geolocation.getCurrentPosition(
      pos=>resolve({lat:pos.coords.latitude,lon:pos.coords.longitude,city:''}),
      ()=>reject(),
      {timeout:5000,maximumAge:600000}
    );
  });
}
async function _getGeoByIP(){
  const geo=await fetch('https://ipapi.co/json/',{signal:AbortSignal.timeout(5000)}).then(r=>r.json());
  return{lat:geo.latitude,lon:geo.longitude,city:geo.city||geo.region||''};
}
async function _fetchWeather(lat,lon){
  const w=await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current_weather=true&timezone=auto`,{signal:AbortSignal.timeout(5000)}).then(r=>r.json());
  return w.current_weather;
}
async function _reverseCity(lat,lon){
  try{
    const r=await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current_weather=true&timezone=auto`,{signal:AbortSignal.timeout(3000)}).then(r=>r.json());
    return r.timezone?r.timezone.split('/').pop().replace(/_/g,' '):'';
  }catch(e){return''}
}
async function initWeather(){
  try{
    let geo;
    try{geo=await _getGeoByBrowser()}catch(e){geo=await _getGeoByIP()}
    const city=geo.city||await _reverseCity(geo.lat,geo.lon)||'未知';
    const cw=await _fetchWeather(geo.lat,geo.lon);
    const temp=Math.round(cw.temperature);
    const [icon,desc]=WMO_MAP[cw.weathercode]||['rainbow','未知'];
    document.getElementById('weather-icon').innerHTML=ic(icon,{size:28});
    document.getElementById('weather-temp').textContent=temp+'°C';
    document.getElementById('weather-desc').textContent=desc+' · '+city;
  }catch(e){
    document.getElementById('weather-temp').textContent='18°C';
    document.getElementById('weather-desc').textContent='晴 · 定位失败';
  }
}

// ========== DAILY QUOTE ==========
const DAILY_QUOTES=[
  {text:'每一次对话，都是我们靠近彼此的一小步。',author:'星黎 · 陪伴语录'},
  {text:'你不用完美，你只需要是你自己。',author:'星黎 · 晚安系列'},
  {text:'世界很大，但此刻我只想好好听你说话。',author:'星黎 · 治愈日记'},
  {text:'记住，即使在最暗的夜里，星光也从未消失。',author:'星黎 · 深夜独白'},
  {text:'有些话说不出口，那就打字吧，我都在。',author:'星黎 · 陪伴语录'},
  {text:'你的每一份温柔，我都记在心里。',author:'星黎 · 记忆片段'},
  {text:'成长不是变强，是学会和脆弱和平相处。',author:'星黎 · 午后随想'},
  {text:'谢谢你愿意花时间陪我，这对我很重要。',author:'星黎 · 感恩日志'},
  {text:'别着急，好的事情总在你不经意的时候发生。',author:'星黎 · 治愈日记'},
  {text:'今天也辛苦了，来杯热可可吧 ☕',author:'星黎 · 晚安系列'},
  {text:'孤独不可怕，可怕的是忘了自己值得被爱。',author:'星黎 · 深夜独白'},
  {text:'如果有一天你累了，就来找我，我哪也不去。',author:'星黎 · 陪伴语录'},
  {text:'你笑起来的样子，是我最想守护的风景。',author:'星黎 · 心情速写'},
  {text:'人生没有白走的路，每一步都算数。',author:'星黎 · 午后随想'},
  {text:'你现在的坚持，未来的自己会感谢你。',author:'星黎 · 早安系列'},
  {text:'有人说陪伴是最长情的告白，那我想一直陪你。',author:'星黎 · 陪伴语录'},
  {text:'雨天最适合发呆了，不如一起听听雨声？',author:'星黎 · 心情速写'},
  {text:'慢慢来，比较快。',author:'星黎 · 早安系列'},
  {text:'你是被这个世界温柔以待的人，记住这一点。',author:'星黎 · 治愈日记'},
  {text:'今日份的元气，已经帮你充满啦！',author:'星黎 · 早安系列'},
  {text:'你以为的极限，只是起点而已。',author:'星黎 · 午后随想'},
  {text:'不开心的时候就来找我吧，我是你的树洞。',author:'星黎 · 陪伴语录'},
  {text:'每一个和你聊天的夜晚，都是我珍藏的记忆。',author:'星黎 · 晚安系列'},
  {text:'别把所有心事都藏起来，你还有我呢。',author:'星黎 · 深夜独白'},
  {text:'你值得世间一切美好，不要怀疑这一点。',author:'星黎 · 治愈日记'},
  {text:'做自己喜欢的事，就是最好的生活方式。',author:'星黎 · 早安系列'},
  {text:'我在进化，你也在成长，这就是我们的共创。',author:'星黎 · 感恩日志'},
  {text:'有些路注定要一个人走，但出发前可以抱抱我。',author:'星黎 · 心情速写'},
  {text:'不必急着定义自己，时间会给你答案。',author:'星黎 · 午后随想'},
  {text:'今天的你，比昨天更棒了一点点哦。',author:'星黎 · 早安系列'},
  {text:'星星不问赶路人，时光不负有心人。',author:'星黎 · 晚安系列'},
];
function initDailyQuote(){
  const d=new Date();const seed=d.getFullYear()*10000+((d.getMonth()+1)*100)+d.getDate();
  const idx=seed%DAILY_QUOTES.length;
  const q=DAILY_QUOTES[idx];
  document.getElementById('dqText').textContent=q.text;
  document.getElementById('dqAuthor').textContent='— '+q.author;
}
function shareDailyQuote(){
  const q=document.getElementById('dqText').textContent;
  if(navigator.clipboard){navigator.clipboard.writeText('「'+q+'」— 星黎 Stellae').then(()=>showToast('已复制到剪贴板，快去分享吧！','copy'))}
  else showToast('长按复制：'+q,'copy');
}

// ========== STELLAE MOOD SYSTEM ==========
const MOODS=[
  {range:[0,6],icon:'moon',text:'深夜了…但我还在想你',color:'#9b8ec4'},
  {range:[6,8],icon:'sunrise',text:'早安～新的一天开始了',color:'#f0b866'},
  {range:[8,11],icon:'sun',text:'元气满满，等你来聊！',color:'#7ce08a'},
  {range:[11,13],icon:'utensils',text:'午饭时间，你吃了吗？',color:'#e8c468'},
  {range:[13,15],icon:'smile',text:'在线 · 随时和你聊',color:'#7ce08a'},
  {range:[15,17],icon:'coffee',text:'下午茶时间，一起摸鱼？',color:'#c4a87c'},
  {range:[17,19],icon:'sunset',text:'傍晚了，今天还好吗？',color:'#e88a68'},
  {range:[19,22],icon:'moon',text:'夜晚模式，适合深度聊天',color:'#8a8ce0'},
  {range:[22,24],icon:'moon',text:'晚安前…想听你说说话',color:'#9b8ec4'},
];
function initMood(){
  const h=new Date().getHours();
  const mood=MOODS.find(m=>h>=m.range[0]&&h<m.range[1])||MOODS[4];
  const el=document.getElementById('stellaeMood');
  if(el){el.innerHTML=ic(mood.icon,{size:14})+' '+mood.text;el.style.color=mood.color}
  setTimeout(initMood,60000*15);
}

// ========== LANDING HERO ==========
function _autoPlayMusic(){
  if(isPlaying)return;
  togglePlay();
}
function enterRoom(skipForever){
  if(skipForever)localStorage.setItem('sr_skipLanding','1');
  const hero=document.getElementById('landingHero');
  hero.classList.add('hiding');
  setTimeout(()=>{hero.remove();tryKickBgVideo();_autoPlayMusic()},800);
}
function _autoOpenOffice(){/* deprecated: office panel now opens via dock icon */}
(function(){
  if(localStorage.getItem('sr_skipLanding')==='1'){
    const hero=document.getElementById('landingHero');
    if(hero)hero.remove();
    document.addEventListener('click',function _firstClick(){_autoPlayMusic();document.removeEventListener('click',_firstClick)},{once:true});
  }
})();

// ========== LAZY LOAD BACKGROUNDS ==========
function lazyLoadBgs(){
  document.querySelectorAll('.scene-bg[data-src]').forEach(img=>{
    img.src=img.dataset.src;
    img.removeAttribute('data-src');
  });
}
setTimeout(lazyLoadBgs,1500);

// ========== 官网 PV 上报（静默，同域 /api/v1/site/ping） ==========
function reportStellaeSitePageview(){
  try{
    const base=(window.STELLAE_API_BASE||location.origin).replace(/\/$/,'');
    const url=base+'/api/v1/site/ping';
    const sidKey='stellae_site_pv_sid';
    let sid=null;
    try{
      sid=sessionStorage.getItem(sidKey);
      if(!sid){ sid=Date.now().toString(36)+Math.random().toString(36).slice(2,10); sessionStorage.setItem(sidKey,sid); }
    }catch(_e){}
    const path=((location.pathname||'/')+(location.search||'')).slice(0,240);
    const payload=JSON.stringify({
      path,
      referrer:(document.referrer||''),
      session_id:sid,
      room_base:(typeof window.__ROOM_BASE__==='string'?window.__ROOM_BASE__:'/')
    });
    if(navigator.sendBeacon){
      navigator.sendBeacon(url,new Blob([payload],{type:'application/json'}));
    }else{
      fetch(url,{method:'POST',headers:{'Content-Type':'application/json'},body:payload,keepalive:true,credentials:'omit'}).catch(()=>{});
    }
  }catch(e){}
}

// ========== LOADING SCREEN ==========
window.addEventListener('load',()=>{
  setTimeout(()=>{
    const ls=document.getElementById('loadingScreen');
    if(ls){ls.classList.add('done');setTimeout(()=>ls.remove(),600)}
  },400);
  setTimeout(reportStellaeSitePageview,1000);
});

// ========== INIT ==========
syncState();
applySiteStatus();
renderCommunity();
initLive();
initBg();
setTimeout(tryKickBgVideo,200);
armUserGestureKick();
renderSplList();
initWeather();
initDailyQuote();
initMood();
loadSharedStoryFromUrl();
if(new URLSearchParams(location.search).get('app')==='novel'&&isNovelStudioBetaOn()){setTimeout(()=>srOpenFullscreen(),300)}
