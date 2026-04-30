import { useState, useEffect, useRef, useCallback } from "react";

// ─── CONFIG ───────────────────────────────────────────────────────────────────
// change to your deployed backend URL
import { API } from "./app";


// ─── MASTER DATA (correct phase 1 targets) ───────────────────────────────────
const TOPICS = [
  // id, name, total sessions, phase1Target (0 = pure phase 2), sheet, icon, order
  {id:"hashing",  name:"Hashing",       total:111, p1:80,  sheet:23,  icon:"#️⃣", ord:1},
  {id:"bsearch",  name:"Binary Search", total:50,  p1:50,  sheet:23,  icon:"🔍", ord:2},
  {id:"twoptr",   name:"Two Pointer/SW",total:48,  p1:48,  sheet:36,  icon:"👆", ord:3},
  {id:"greedy",   name:"Greedy",        total:100, p1:50,  sheet:36,  icon:"💡", ord:4},
  {id:"dp",       name:"DP",            total:102, p1:50,  sheet:44,  icon:"🧮", ord:5},
  {id:"bit",      name:"Bit Manip",     total:37,  p1:37,  sheet:10,  icon:"⚡", ord:6},
  {id:"math",     name:"Mathematics",   total:32,  p1:32,  sheet:10,  icon:"🔢", ord:7},
  // Pure Phase 2
  {id:"graph",    name:"Graph",         total:37,  p1:0,   sheet:113, icon:"🕸️", ord:8},
  {id:"trees",    name:"Trees",         total:20,  p1:0,   sheet:28,  icon:"🌳", ord:9},
  {id:"stack",    name:"Stack/Queue",   total:17,  p1:0,   sheet:66,  icon:"📚", ord:10},
  {id:"heap",     name:"Heap",          total:13,  p1:0,   sheet:15,  icon:"⛰️", ord:11},
  {id:"ll",       name:"Linked List",   total:16,  p1:0,   sheet:35,  icon:"🔗", ord:12},
  {id:"string",   name:"String",        total:44,  p1:0,   sheet:44,  icon:"📝", ord:13},
  {id:"recursion",name:"Recursion/BT",  total:4,   p1:0,   sheet:20,  icon:"🔄", ord:14},
  {id:"trie",     name:"Trie",          total:2,   p1:0,   sheet:7,   icon:"🌲", ord:15},
  {id:"segtree",  name:"Segment Tree",  total:6,   p1:0,   sheet:0,   icon:"📊", ord:16},
  {id:"matrix",   name:"Matrix",        total:7,   p1:0,   sheet:0,   icon:"⬜", ord:17},
];

// ─── PHASE TOTALS ─────────────────────────────────────────────────────────────
// Phase 1 = sum of p1 targets = 347
// Phase 2 = sum of (total - p1) for all topics = 299
const P1_TOTAL = TOPICS.reduce((s,t)=>s+t.p1, 0);         // 347
const P2_TOTAL = TOPICS.reduce((s,t)=>s+(t.total-t.p1),0); // 299

const MERN_MODS = [
  {id:"html",    label:"HTML",       hrs:4,  icon:"🏗️", color:"#f97316"},
  {id:"css",     label:"CSS",        hrs:8,  icon:"🎨", color:"#38bdf8"},
  {id:"js",      label:"JavaScript", hrs:14, icon:"⚡", color:"#facc15"},
  {id:"react",   label:"React",      hrs:15, icon:"⚛️", color:"#818cf8"},
  {id:"backend", label:"Backend",    hrs:24, icon:"🔧", color:"#34d399"},
];
const MERN_TOTAL = 65;

const MILESTONES = [
  {date:"May 2026",event:"CSS + JS done",         phase:"MERN",  color:"#38bdf8"},
  {date:"Jul 2026",event:"React complete",         phase:"MERN",  color:"#818cf8"},
  {date:"Aug 2026",event:"MERN stack done ✅",     phase:"MERN",  color:"#34d399"},
  {date:"Nov 2026",event:"Phase 1 complete (347s)",phase:"DSA",   color:"#f97316"},
  {date:"Dec 2026",event:"Project 1 live",         phase:"BUILD", color:"#fb923c"},
  {date:"Feb 2027",event:"Project 2 live",         phase:"BUILD", color:"#fb923c"},
  {date:"Apr 2027",event:"Phase 2 complete (299s)",phase:"DSA",   color:"#a78bfa"},
  {date:"May 2027",event:"Resume + Referrals",     phase:"APPLY", color:"#f472b6"},
  {date:"Jul 2027",event:"🏆 OFFER",               phase:"WIN",   color:"#4ade80"},
];

const DAY_TYPES = [
  {id:"normal", label:"Normal", icon:"☀️",t:2},
  {id:"college",label:"College",icon:"🎓",t:2},
  {id:"weekend",label:"Weekend",icon:"🎯",t:3},
  {id:"holiday",label:"Holiday",icon:"🎉",t:4},
  {id:"exam",   label:"Exam",   icon:"📝",t:1},
];

// ─── HELPERS ──────────────────────────────────────────────────────────────────
const ds  = d => d.toISOString().split("T")[0];
const isWE= d => {const w=d.getDay();return w===0||w===6;};
const DNs = ["Sun","Mon","Tue","Wed","Thu","Fri","Sat"];
function last7(){const a=[];for(let i=6;i>=0;i--){const d=new Date();d.setDate(d.getDate()-i);a.push(d);}return a;}

// ─── Phase calc helpers ───────────────────────────────────────────────────────
// p1Done for a topic = min(sessionsOnTopic, p1Target)
// p2Done for a topic = max(0, sessionsOnTopic - p1Target)
function topicP1Done(t, sessMap){ return Math.min(sessMap[t.id]?.sessions||0, t.p1); }
function topicP2Done(t, sessMap){ return Math.max(0, (sessMap[t.id]?.sessions||0) - t.p1); }

// ─── UI ATOMS ─────────────────────────────────────────────────────────────────
function Bar({pct,color,h=5}){
  return(
    <div style={{background:"#1e1e3f",borderRadius:99,overflow:"hidden",height:h}}>
      <div style={{width:`${Math.min(Math.max(pct,0),100)}%`,height:"100%",background:color,
        borderRadius:99,boxShadow:`0 0 6px ${color}88`,transition:"width .5s ease"}}/>
    </div>
  );
}
function Bdg({t,c}){
  return <span style={{fontSize:9,fontWeight:700,letterSpacing:"0.1em",padding:"2px 7px",borderRadius:99,
    background:`${c}18`,color:c,border:`1px solid ${c}40`}}>{t}</span>;
}
function smartMsg(cons,streak){
  if(streak>=7) return{t:"🔥 7+ day streak — beast mode.",c:"#4ade80"};
  if(streak===0) return{t:"💤 No active streak. 1 session restarts it.",c:"#f87171"};
  if(cons>=80)  return{t:"✅ Strong consistency. Consider bumping target.",c:"#4ade80"};
  if(cons>=60)  return{t:"👍 Good momentum. Keep it up.",c:"#38bdf8"};
  if(cons>=40)  return{t:"⚡ Moderate pace. SDE market is competitive — push.",c:"#f59e0b"};
  return              {t:"🚨 Low consistency. 1 session/day > 0.",c:"#f87171"};
}

const TABS = ["🎯 Today","✅ Tracker","📚 Topics","📊 Report","🌐 MERN","🏁 Milestones"];

// ─── AUTH MODAL ───────────────────────────────────────────────────────────────
function AuthModal({onAuth}){
  const [mode,setMode]  = useState("login"); // login | register
  const [email,setEmail]= useState("");
  const [pass,setPass]  = useState("");
  const [err,setErr]    = useState("");
  const [busy,setBusy]  = useState(false);

  // Inside AuthModal component — replace the entire submit function

async function submit() {
  if (!email || !pass) { setErr("Email and password required"); return; }
  setBusy(true);
  setErr("");

  try {
    // FIX: use API.login() / API.register() — NOT fetch(`${API}/...`)
    // API is an object; `${API}` would produce "[object Object]"
    const res = mode === "login"
      ? await API.login({ email: email.trim(), password: pass })
      : await API.register({ email: email.trim(), password: pass });

    // Always parse JSON first
    const data = await res.json();

    if (!res.ok) {
      // Backend returned 4xx/5xx — show exact backend message
      setErr(data.message || data.error || "Something went wrong");
      setBusy(false);
      return;
    }

    // FIX: backend returns { token, email, userId } — read flat shape
    if (!data.token) {
      setErr("No token received. Contact support.");
      setBusy(false);
      return;
    }

    // Success — pass token + email up
    onAuth(data.token, data.email, data.userId);

  } catch (err) {
    // Only reaches here if network is TRULY down (DNS fail, no internet)
    // NOT for 4xx/5xx — those are handled above
    console.error("Auth fetch error:", err);
    setErr("Cannot reach server. Check your internet connection.");
    setBusy(false);
  }
}
 
  const C2="#0e0e1a",BD="1px solid #1e1e3f";
  return(
    <div style={{position:"fixed",inset:0,background:"#08080fee",display:"flex",
      alignItems:"center",justifyContent:"center",zIndex:999,padding:16}}>
      <div style={{background:C2,border:BD,borderRadius:16,padding:24,width:"100%",maxWidth:380}}>
        <div style={{textAlign:"center",marginBottom:20}}>
          <div style={{fontSize:18,fontWeight:900,background:"linear-gradient(90deg,#38bdf8,#818cf8)",
            WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent"}}>
            KK EXECUTION SYSTEM
          </div>
          <div style={{fontSize:11,color:"#404068",marginTop:3}}>
            {mode==="login"?"Sign in to sync progress":"Create your account"}
          </div>
        </div>
        {["email","password"].map((f,i)=>(
          <div key={f} style={{marginBottom:12}}>
            <div style={{fontSize:10,color:"#64648a",marginBottom:5,textTransform:"uppercase",letterSpacing:"0.1em"}}>{f}</div>
            <input type={f} value={f==="email"?email:pass}
              onChange={e=>f==="email"?setEmail(e.target.value):setPass(e.target.value)}
              onKeyDown={e=>e.key==="Enter"&&submit()}
              placeholder={f==="email"?"you@example.com":"••••••••"}
              style={{width:"100%",padding:"9px 12px",borderRadius:8,border:BD,background:"#080810",
                color:"#e2e8f0",fontSize:12,fontFamily:"inherit",boxSizing:"border-box"}}/>
          </div>
        ))}
        {err&&<div style={{fontSize:11,color:"#f87171",marginBottom:10}}>{err}</div>}
        <button onClick={submit} disabled={busy} style={{width:"100%",padding:"10px",borderRadius:9,
          border:"none",background:"linear-gradient(90deg,#38bdf8,#818cf8)",color:"#fff",
          fontSize:13,fontWeight:700,cursor:"pointer",fontFamily:"inherit",marginBottom:12}}>
          {busy?"…":(mode==="login"?"Sign In":"Register")}
        </button>
        <div style={{textAlign:"center",fontSize:11,color:"#404068"}}>
          {mode==="login"?"No account? ":"Have an account? "}
          <span onClick={()=>setMode(mode==="login"?"register":"login")}
            style={{color:"#38bdf8",cursor:"pointer"}}>
            {mode==="login"?"Register":"Sign In"}
          </span>
        </div>
        <div style={{textAlign:"center",marginTop:10}}>
          <span onClick={()=>onAuth(null,null)} style={{fontSize:11,color:"#404068",cursor:"pointer",
            textDecoration:"underline"}}>Continue offline →</span>
        </div>
      </div>
    </div>
  );
}

// ─── MAIN APP ─────────────────────────────────────────────────────────────────
export default function App(){
  const now    = new Date();
  const todayK = ds(now);
  const impRef = useRef();
  const syncTimer = useRef();

  const [tab,  setTab]  = useState(0);
  const [conf, setConf] = useState(false);

  // ── Auth ──
  const [token,  setToken]  = useState(()=>localStorage.getItem("kk_token")||null);
  const [userEmail,setUE]   = useState(()=>localStorage.getItem("kk_email")||null);

  const userId = userEmail; // email is your userId

  const [showAuth,setShowAuth] = useState(false);
  const [lastSync,setLastSync] = useState(null);
  const [syncing,setSyncing]   = useState(false);
  const isOnline = !!token;

  // ── Core State ──
  const [weekly,  setWeekly]  = useState(()=>{try{return JSON.parse(localStorage.getItem("dsa_weekly")||"{}");}catch{return {};}});
  const [topicD,  setTopicD]  = useState(()=>{try{return JSON.parse(localStorage.getItem("dsa_topics")||"{}");}catch{return {};}});
  const [dayT,    setDayT]    = useState(()=>{try{return JSON.parse(localStorage.getItem("dsa_dayt")  ||"{}");}catch{return {};}});
  const [mernMod, setMernMod] = useState(()=>{try{return JSON.parse(localStorage.getItem("dsa_mern_mod")||'{"html":4,"css":4,"js":0,"react":0,"backend":0}');}catch{return{html:4,css:4,js:0,react:0,backend:0};}});

  // ── Persist to localStorage always ──
  useEffect(()=>{localStorage.setItem("dsa_weekly",  JSON.stringify(weekly));},  [weekly]);
  useEffect(()=>{localStorage.setItem("dsa_topics",  JSON.stringify(topicD));},  [topicD]);
  useEffect(()=>{localStorage.setItem("dsa_dayt",    JSON.stringify(dayT));},    [dayT]);
  useEffect(()=>{localStorage.setItem("dsa_mern_mod",JSON.stringify(mernMod));}, [mernMod]);

  // ── API helpers ──
  const apiFetch = useCallback(async(path,opts={})=>{
    // 2nd apr fetch fun replace with API object methods ( one line )
    const res = await fetch(`https://dsa-tracker-private.onrender.com${path}`,{
      ...opts,
      headers:{"Content-Type":"application/json","Authorization":`Bearer ${token}`,...(opts.headers||{})}
    });
    if(res.status===401){setToken(null);setUE(null);localStorage.removeItem("kk_token");localStorage.removeItem("kk_email");return null;}
    return res.json();
  },[token]);

  // ── Fetch from backend on login ──
  useEffect(()=>{
    if(!token) return;
    // 2nd apr replace with API.loadProgress
    API.loadProgress(userId).then(data=>{
      if(!data) return;
      const remote = data.progress;
      // Conflict: last update wins
      const localTs = parseInt(localStorage.getItem("kk_local_ts")||"0");
      const remoteTs = new Date(remote?.lastUpdated||0).getTime();
      if(remoteTs>localTs){
        if(remote.weeklyData)  setWeekly(remote.weeklyData);
        if(remote.topics)      setTopicD(remote.topics);
        if(remote.mernMod)     setMernMod(remote.mernMod);
        if(remote.dayTypes)    setDayT(remote.dayTypes);
      }
      setLastSync(new Date());
    }).catch(()=>{});
  },[token]);

  // ── Debounced auto-save to backend ──
  const saveToBackend = useCallback(()=>{
    if(!token) return;
    clearTimeout(syncTimer.current);
    syncTimer.current = setTimeout(async()=>{
      setSyncing(true);
      const ts = Date.now();

      // 3rd apr replace with API.saveProgress
      await API.saveProgress({
        weeklyData:weekly,
        topics:topicD,
        mernMod,
        dayTypes:dayT,
        lastUpdated:new Date(ts).toISOString()
      }).catch(()=>{});
      localStorage.setItem("kk_local_ts",String(ts));
      setLastSync(new Date());setSyncing(false);
      },2000);
      },[token,weekly,topicD,mernMod,dayT]);


  useEffect(()=>{saveToBackend();},[weekly,topicD,mernMod,dayT]);

  // function handleAuth(tok,email){
  //   setToken(tok);setUE(email);setShowAuth(false);
  //   if(tok){localStorage.setItem("kk_token",tok);localStorage.setItem("kk_email",email);}
  // }

  // Replace handleAuth in App.jsx main component

function handleAuth(tok, email, userId) {
  setToken(tok);
  setUE(email);
  setShowAuth(false);
  if (tok) {
    localStorage.setItem("kk_token",  tok);
    localStorage.setItem("kk_email",  email);
    // FIX: store userId separately for loadProgress API call
    localStorage.setItem("kk_userId", userId || email);
  }
}

  function logout(){
    setToken(null);setUE(null);
    localStorage.removeItem("kk_token");localStorage.removeItem("kk_email");localStorage.removeItem("kk_userId");
  }
  async function syncNow(){
    if(!token)return;setSyncing(true);

    // 4th apr replace with API.loadProgress
    const data = await API.loadProgress(userId).catch(()=>null);

    if(data?.progress){
      const remote=data.progress;
      if(remote.weeklyData) setWeekly(remote.weeklyData);
      if(remote.topics)     setTopicD(remote.topics);
      if(remote.mernMod)    setMernMod(remote.mernMod);
      if(remote.dayTypes)   setDayT(remote.dayTypes);
    }
    setLastSync(new Date());setSyncing(false);
  }

  // ── PHASE CALCULATIONS (FIXED) ──
  // Phase 1 done = sum of min(done, p1Target) per topic
  const p1Done = TOPICS.reduce((s,t)=>s+topicP1Done(t,topicD),0);
  // Phase 2 done = sum of max(0, done - p1Target) per topic
  const p2Done = TOPICS.reduce((s,t)=>s+topicP2Done(t,topicD),0);
  const p1Pct  = Math.min(p1Done/P1_TOTAL*100,100);
  const p2Pct  = Math.min(p2Done/P2_TOTAL*100,100);

  const totalSess = Object.values(weekly).reduce((s,d)=>s+(d.sessions||0),0);
  const mernDone  = Object.values(mernMod).reduce((s,v)=>s+v,0);
  const mernPct   = Math.min(mernDone/MERN_TOTAL*100,100);

  // Current topic = first topic where done < total
  const curTopic  = TOPICS.find(t=>(topicD[t.id]?.sessions||0)<t.total)||TOPICS[TOPICS.length-1];
  const nextTopic = TOPICS.find(t=>t.ord>curTopic.ord&&(topicD[t.id]?.sessions||0)<t.total);

  const getDT  = key => dayT[key]||(isWE(new Date(key))?"weekend":"normal");
  const getTgt = key => DAY_TYPES.find(d=>d.id===getDT(key))?.t||2;

  const todayDT   = getDT(todayK);
  const todayDef  = DAY_TYPES.find(d=>d.id===todayDT)||DAY_TYPES[0];
  const todayE    = weekly[todayK]||{sessions:0,sheet:0};
  const curTD     = topicD[curTopic.id]||{sessions:0,sheet:0,notesDone:false,notesRevised:false};

  const streak=(()=>{let n=0,d=new Date();while(n<365){const k=ds(d),e=weekly[k];if(e&&e.sessions>=getTgt(k)){n++;d.setDate(d.getDate()-1);}else break;}return n;})();
  const consistency=(()=>{let done=0,tot=0;for(let i=1;i<15;i++){const d=new Date();d.setDate(d.getDate()-i);const k=ds(d),e=weekly[k];tot++;if(e&&e.sessions>=getTgt(k))done++;}return tot?Math.round(done/tot*100):0;})();
  const adaptTgt=(()=>{const b=todayDef.t;if(consistency>=80)return b+1;if(consistency<35&&b>1)return b-1;return b;})();
  const sm = smartMsg(consistency,streak);
  const days7 = last7();
  const wDone = days7.filter(d=>{const k=ds(d),e=weekly[k];return e&&e.sessions>=getTgt(k);}).length;
  const wSess = days7.reduce((s,d)=>{const e=weekly[ds(d)];return s+(e?.sessions||0);},0);
  const wSheet= days7.reduce((s,d)=>{const e=weekly[ds(d)];return s+(e?.sheet||0);},0);

  // Delay prediction
  const delay=(()=>{
    const avg=totalSess/Math.max(Object.keys(weekly).length,1);
    const spd=Math.max(avg,0.5);
    const p1Rem=P1_TOTAL-p1Done,p2Rem=P2_TOTAL-p2Done;
    const daysToP1=Math.max(0,Math.ceil((new Date("2026-11-01")-now)/864e5));
    const behind=Math.max(0,Math.ceil(p1Rem/spd-daysToP1));
    return{p1Rem,p2Rem,behind,onTrack:behind===0,spd:spd.toFixed(1),recov:Math.ceil(spd*1.4)};
  })();

  // ── Handlers ──
  function updDay(key,field,val){setWeekly(p=>{const e={...p[key]||{}};e[field]=Math.max(0,parseInt(val)||0);return{...p,[key]:e};});}
  function updTopic(id,field,val){
    setTopicD(p=>{
      const e={sessions:0,sheet:0,notesDone:false,notesRevised:false,...p[id]};
      if(field==="sessions"||field==="sheet") e[field]=Math.max(0,parseInt(val)||0);
      else e[field]=val;
      return{...p,[id]:e};
    });
  }
  function updDayType(key,type){setDayT(p=>({...p,[key]:type}));}
  function adjMern(id,d){setMernMod(p=>{const mod=MERN_MODS.find(m=>m.id===id);return{...p,[id]:Math.max(0,Math.min(mod.hrs,(p[id]||0)+d))};});}
  function resetWeek(){setWeekly(p=>{const n={...p};last7().forEach(d=>delete n[ds(d)]);return n;});setConf(false);}

  function exportData(){
    const b=new Blob([JSON.stringify({weekly,topicData:topicD,dayTypes:dayT,mernMod,
      p1Total:P1_TOTAL,p2Total:P2_TOTAL,timestamp:new Date().toISOString()},null,2)],{type:"application/json"});
    const a=document.createElement("a");a.href=URL.createObjectURL(b);a.download=`kk-os-${todayK}.json`;a.click();
  }
  function importData(e){
    const f=e.target.files[0];if(!f)return;
    const r=new FileReader();
    r.onload=ev=>{try{const d=JSON.parse(ev.target.result);
      if(d.weekly)setWeekly(d.weekly);if(d.topicData)setTopicD(d.topicData);
      if(d.dayTypes)setDayT(d.dayTypes);if(d.mernMod)setMernMod(d.mernMod);
    }catch{alert("Invalid file");}};r.readAsText(f);e.target.value="";
  }

  // ── Shared styles ──
  const C  = {background:"#0e0e1a",border:"1px solid #1e1e3f",borderRadius:12,padding:14};
  const SB = {fontSize:9,color:"#404068",letterSpacing:"0.15em",textTransform:"uppercase",marginBottom:10};
  const R  = {padding:"9px 12px",background:"#080810",borderRadius:8,border:"1px solid #1e1e3f",marginBottom:7};

  return(
    <div style={{minHeight:"100vh",background:"#08080f",fontFamily:"'Space Grotesk',monospace",color:"#e2e8f0"}}>
      {showAuth&&<AuthModal onAuth={handleAuth}/>}
      <input ref={impRef} type="file" accept=".json" onChange={importData} style={{display:"none"}}/>

      {/* Header */}
      <div style={{background:"linear-gradient(180deg,#0f0f24,#08080f)", borderBottom:"1px solid #1e1e3f",padding:"16px 16px 12px"}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start"}}>
          <div>
            <div style={{fontSize:9,color:"#404068",letterSpacing:"0.3em",marginBottom:4,textTransform:"uppercase"}}>
              Vivek Patne · CSE-DS · RNSIT · 2028
            </div>
            <h1 style={{fontSize:17,fontWeight:900,margin:"0 0 1px",
              background:"linear-gradient(90deg,#38bdf8,#818cf8,#f472b6)",
              WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent"}}>
              KUMAR K EXECUTION SYSTEM
            </h1>
            <p style={{fontSize:10,color:"#404068",margin:0}}>Personal OS · 720s · 20–30 LPA</p>
          </div>
          {/* Auth badge */}
          <div style={{textAlign:"right",flexShrink:0}}>
            {isOnline?(
              <div>
                <div style={{fontSize:9,color:"#4ade80",marginBottom:3}}>
                  {syncing?"⟳ syncing…":lastSync?`✅ ${lastSync.toLocaleTimeString([], {hour:"2-digit",minute:"2-digit"})}`:"● online"}
                </div>
                <div style={{fontSize:10,color:"#64648a",marginBottom:3}}>{userEmail}</div>
                <div style={{display:"flex",gap:5}}>
                  <button onClick={syncNow} style={{padding:"3px 8px",borderRadius:6,border:"1px solid #4ade8030",
                    background:"transparent",color:"#4ade80",fontSize:9,cursor:"pointer",fontFamily:"inherit"}}>Sync</button>
                  <button onClick={logout} style={{padding:"3px 8px",borderRadius:6,border:"1px solid #1e1e3f",
                    background:"transparent",color:"#404068",fontSize:9,cursor:"pointer",fontFamily:"inherit"}}>Logout</button>
                </div>
              </div>
            ):(
              <div>
                <div style={{fontSize:9,color:"#f59e0b",marginBottom:4}}>⚠ offline mode</div>
                <button onClick={()=>setShowAuth(true)} style={{padding:"4px 11px",borderRadius:7,
                  border:"1px solid #38bdf840",background:"#0c1a2e",color:"#38bdf8",
                  fontSize:10,cursor:"pointer",fontFamily:"inherit",fontWeight:700}}>Sign In →</button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Smart banner */}
      <div style={{padding:"6px 14px",background:`${sm.c}0c`,borderBottom:`1px solid ${sm.c}22`,textAlign:"center"}}>
        <span style={{fontSize:11,color:sm.c}}>{sm.t}</span>
      </div>

      {/* Tabs */}
      <div style={{display:"flex", justifyContent:"center",overflowX:"auto",gap:5,padding:"8px 12px",borderBottom:"1px solid #1e1e3f",scrollbarWidth:"none"}}>
        {TABS.map((t,i)=>(
          <button key={i} onClick={()=>setTab(i)} style={{flexShrink:0,padding:"5px 11px",borderRadius:8,cursor:"pointer",
            border:tab===i?"1px solid #38bdf8":"1px solid #1e1e3f",background:tab===i?"#0c1a2e":"#0e0e1a",
            color:tab===i?"#38bdf8":"#404068",fontSize:10,fontFamily:"inherit",fontWeight:tab===i?700:400}}>
            {t}
          </button>
        ))}
      </div>

      <div style={{padding:13,maxWidth:640,margin:"0 auto"}}>

        {/* ══ TAB 0: TODAY ══════════════════════════════════════════════════ */}
        {tab===0&&(
          <div>
            {/* Quick stats */}
            <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:6,marginBottom:12}}>
              {[
                {l:"Sessions",v:totalSess,   c:"#38bdf8"},
                {l:"Phase 1", v:`${p1Pct.toFixed(0)}%`,c:"#f97316"},
                {l:"Phase 2", v:`${p2Pct.toFixed(0)}%`,c:"#a78bfa"},
                {l:"MERN",    v:`${mernPct.toFixed(0)}%`,c:"#34d399"},
              ].map((x,i)=>(
                <div key={i} style={{background:"#0e0e1a",border:`1px solid ${x.c}22`,borderRadius:10,padding:"9px 5px",textAlign:"center"}}>
                  <div style={{fontSize:17,fontWeight:900,color:x.c}}>{x.v}</div>
                  <div style={{fontSize:9,color:"#404068"}}>{x.l}</div>
                </div>
              ))}
            </div>

            {/* Day type */}
            <div style={{...C,marginBottom:12}}>
              <div style={SB}>DAY TYPE</div>
              <div style={{display:"flex",  justifyContent:"center", gap:6,flexWrap:"wrap"}}>
                {DAY_TYPES.map(dt=>(
                  <button key={dt.id} onClick={()=>updDayType(todayK,dt.id)} style={{
                    padding:"5px 10px",borderRadius:8,cursor:"pointer",fontFamily:"inherit",
                    border:`1px solid ${todayDT===dt.id?"#38bdf8":"#1e1e3f"}`,
                    background:todayDT===dt.id?"#0c1a2e":"#080810",
                    color:todayDT===dt.id?"#38bdf8":"#64648a",fontSize:10}}>
                    {dt.icon} {dt.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Today plan */}
            <div style={{background:"#060d18",border:"2px solid #38bdf8",borderRadius:14,padding:15,marginBottom:12}}>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:14}}>
                <div>
                  <div style={{fontSize:10,color:"#38bdf8",fontWeight:700,letterSpacing:"0.15em",marginBottom:2}}>TODAY'S PLAN</div>
                  <div style={{fontSize:11,color:"#64648a"}}>{DNs[now.getDay()]} · {todayDef.icon} {todayDef.label}</div>
                </div>
                <div style={{textAlign:"right"}}>
                  <div style={{fontSize:9,color:"#64648a",marginBottom:1}}>Adaptive Target</div>
                  <div style={{fontSize:24,fontWeight:900,color:"#38bdf8",lineHeight:1}}>{adaptTgt}
                    <span style={{fontSize:11,color:"#404068"}}> sess</span>
                  </div>
                  {consistency>=80&&<div style={{fontSize:9,color:"#4ade80"}}>+1 for consistency</div>}
                  {consistency<35&&<div style={{fontSize:9,color:"#f59e0b"}}>-1 catch up first</div>}
                </div>
              </div>

              {/* Current topic */}
              <div style={{background:"#0a0a18",borderRadius:10,padding:12,marginBottom:12,
                border:`1px solid ${curTopic.p1>0?"#f9731633":"#a78bfa33"}`}}>
                <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:8}}>
                  <div>
                    <div style={{fontSize:9,color:"#404068",marginBottom:2}}>CURRENT TOPIC</div>
                    <div style={{fontSize:17,fontWeight:900,color:curTopic.p1>0?"#f97316":"#a78bfa"}}>
                      {curTopic.icon} {curTopic.name}
                    </div>
                    {/* Show phase 1 / phase 2 split for mixed topics */}
                    {curTopic.p1>0&&curTopic.p1<curTopic.total&&(
                      <div style={{fontSize:9,color:"#64648a",marginTop:2}}>
                        P1 target: {curTopic.p1} · Total: {curTopic.total}
                        {topicP1Done(curTopic,topicD)>=curTopic.p1&&
                          <span style={{color:"#4ade80"}}> · P1 ✅ now in P2</span>}
                      </div>
                    )}
                  </div>
                  <div style={{textAlign:"right"}}>
                    <div style={{fontSize:13,color:"#94a3b8",fontWeight:700}}>{curTD.sessions||0}/{curTopic.total}s</div>
                    <div style={{fontSize:10,color:"#64648a"}}>{curTD.sheet||0}/{curTopic.sheet}q</div>
                  </div>
                </div>
                <Bar pct={(curTD.sessions||0)/curTopic.total*100} color={curTopic.p1>0?"#f97316":"#a78bfa"} h={4}/>
              </div>

              {/* Inputs */}
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8,marginBottom:10}}>
                {[
                  {l:"Sessions Done",v:todayE.sessions||0,c:"#38bdf8",
                   chg:v=>{updDay(todayK,"sessions",v);updTopic(curTopic.id,"sessions",Math.max(curTD.sessions||0,v));}},
                  {l:"Sheet Problems",v:todayE.sheet||0,c:"#818cf8",
                   chg:v=>{updDay(todayK,"sheet",v);updTopic(curTopic.id,"sheet",Math.max(curTD.sheet||0,v));}}
                ].map((x,i)=>(
                  <div key={i} style={{background:"#0a0a18",borderRadius:10,padding:10,border:"1px solid #1e1e3f"}}>
                    <div style={{fontSize:9,color:"#404068",textTransform:"uppercase",letterSpacing:"0.1em",marginBottom:6}}>{x.l}</div>
                    <div style={{display:"flex",alignItems:"center",gap:6}}>
                      <input type="number" min={0} max={i===0?10:30} value={x.v||""}
                        onChange={e=>x.chg(Math.max(0,parseInt(e.target.value)||0))}
                        placeholder="0"
                        style={{width:44,padding:"4px 0",borderRadius:7,border:`1px solid ${x.c}60`,
                          background:"#080810",color:x.c,fontSize:15,fontWeight:900,textAlign:"center",fontFamily:"inherit"}}/>
                      {i===0&&<span style={{fontSize:13,color:"#404068"}}>/ {adaptTgt} {x.v>=adaptTgt?"✅":"⏳"}</span>}
                    </div>
                  </div>
                ))}
              </div>
              {/* Notes */}
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8}}>
                {[{l:"Notes Created",f:"notesDone",c:"#4ade80"},{l:"Notes Revised",f:"notesRevised",c:"#f59e0b"}].map(x=>(
                  <label key={x.f} style={{display:"flex",alignItems:"center",gap:7,padding:"8px 10px",
                    background:"#0a0a18",borderRadius:8,cursor:"pointer",border:`1px solid ${curTD[x.f]?x.c+"44":"#1e1e3f"}`}}>
                    <input type="checkbox" checked={!!curTD[x.f]}
                      onChange={e=>updTopic(curTopic.id,x.f,e.target.checked)}
                      style={{accentColor:x.c,cursor:"pointer"}}/>
                    <span style={{fontSize:11,color:curTD[x.f]?x.c:"#64648a"}}>{x.l}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Streak + Next */}
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8,marginBottom:12}}>
              <div style={{...C,border:"1px solid #f9731622",textAlign:"center"}}>
                <div style={{fontSize:20}}>{streak>0?"🔥":"💤"}</div>
                <div style={{fontSize:22,fontWeight:900,color:"#f97316"}}>{streak}</div>
                <div style={{fontSize:10,color:"#64648a"}}>day streak</div>
              </div>
              <div style={C}>
                <div style={{fontSize:9,color:"#404068",textTransform:"uppercase",letterSpacing:"0.1em",marginBottom:6}}>NEXT TOPIC</div>
                {nextTopic
                  ?<><div style={{fontSize:13,fontWeight:700,color:"#94a3b8"}}>{nextTopic.icon} {nextTopic.name}</div>
                    <div style={{fontSize:10,color:"#404068",marginTop:2}}>{nextTopic.total} sessions</div></>
                  :<div style={{fontSize:12,color:"#4ade80"}}>🏆 All done!</div>}
              </div>
            </div>

            {/* Delay */}
            <div style={{...C,border:`1px solid ${delay.onTrack?"#4ade8033":"#f8717133"}`,marginBottom:12}}>
              <div style={SB}>⏱ DELAY PREDICTION</div>
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:7}}>
                {[
                  {l:"Avg/Day",  v:`${delay.spd}s`,                                             c:"#38bdf8"},
                  {l:"Status",   v:delay.onTrack?"On Track ✅":`${delay.behind}d behind`,        c:delay.onTrack?"#4ade80":"#f87171"},
                  {l:"P1 Left",  v:`${delay.p1Rem}s`,                                            c:"#f97316"},
                  {l:"P2 Left",  v:`${delay.p2Rem}s`,                                            c:"#a78bfa"},
                ].map((x,i)=>(
                  <div key={i} style={{...R,margin:0}}>
                    <div style={{fontSize:9,color:"#404068",marginBottom:2}}>{x.l}</div>
                    <div style={{fontSize:14,fontWeight:900,color:x.c}}>{x.v}</div>
                  </div>
                ))}
              </div>
              {!delay.onTrack&&(
                <div style={{padding:"8px 10px",background:"#1a0c0c",borderRadius:8,border:"1px solid #f8717133",marginTop:8}}>
                  <span style={{fontSize:11,color:"#f87171"}}>
                    ⚠️ Behind ~{delay.behind}d. Need {delay.recov}+ sessions/day to recover.
                  </span>
                </div>
              )}
            </div>

            {todayDT==="weekend"&&(
              <div style={{...C,border:"1px solid #818cf822",marginBottom:12}}>
                <div style={{fontSize:10,color:"#818cf8",fontWeight:700,marginBottom:5}}>🎯 WEEKEND PLAN</div>
                <div style={{fontSize:12,color:"#94a3b8",lineHeight:1.8}}>
                  ✅ 3 DSA sessions + sheet problems<br/>
                  ✅ MERN: 5 hrs (watch → build)<br/>
                  ✅ 1 contest (LC Weekly / CF Div3/4)
                </div>
              </div>
            )}
          </div>
        )}

        {/* ══ TAB 1: TRACKER ════════════════════════════════════════════════ */}
        {tab===1&&(
          <div>
            <div style={{...C,marginBottom:12}}>
              <div style={SB}>THIS WEEK</div>
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:8,marginBottom:10}}>
                {[{l:"Days Done",v:`${wDone}/7`,c:"#4ade80"},{l:"Sessions",v:wSess,c:"#38bdf8"},{l:"Sheet Qs",v:wSheet,c:"#818cf8"}].map((x,i)=>(
                  <div key={i} style={{...R,margin:0,textAlign:"center"}}>
                    <div style={{fontSize:18,fontWeight:900,color:x.c}}>{x.v}</div>
                    <div style={{fontSize:10,color:"#404068"}}>{x.l}</div>
                  </div>
                ))}
              </div>
              <Bar pct={wDone/7*100} color={wDone>=5?"#4ade80":wDone>=3?"#f59e0b":"#f87171"}/>
            </div>

            {days7.map(d=>{
              const key=ds(d),isT=key===todayK,isPast=key<todayK;
              const e=weekly[key]||{},sess=e.sessions||0,sh=e.sheet||0;
              const tgt=getTgt(key),dtId=getDT(key);
              const barC=sess>=tgt?"#4ade80":sess>0?"#f59e0b":"#f87171";
              const bdr=isT?"#38bdf8":sess>=tgt?"#16a34a44":sess>0?"#f59e0b33":isPast&&sess===0?"#f8717133":"#1e1e3f";
              return(
                <div key={key} style={{background:"#0e0e1a",border:`2px solid ${bdr}`,borderRadius:12,padding:"11px 13px",marginBottom:8}}>
                  <div style={{display:"flex",alignItems:"center",gap:10}}>
                    <div style={{minWidth:44,flexShrink:0}}>
                      <div style={{fontSize:12,fontWeight:700,color:isT?"#38bdf8":"#94a3b8"}}>{DNs[d.getDay()]}</div>
                      <div style={{fontSize:10,color:"#404068"}}>{String(d.getDate()).padStart(2,"0")}-{String(d.getMonth()+1).padStart(2,"0")}</div>
                      {isT&&<div style={{fontSize:9,color:"#38bdf8",fontWeight:700}}>TODAY</div>}
                    </div>
                    <div style={{flex:1}}>
                      <div style={{display:"flex",justifyContent:"space-between",marginBottom:4}}>
                        <span style={{fontSize:10,color:"#64648a"}}>{DAY_TYPES.find(x=>x.id===dtId)?.icon} {tgt}s target</span>
                        <span style={{fontSize:11,fontWeight:700,color:barC}}>{sess}/{tgt} {sess>=tgt?"✅":"❌"}</span>
                      </div>
                      <Bar pct={Math.min(sess/tgt*100,100)} color={barC}/>
                      <div style={{fontSize:10,color:"#404068",marginTop:3}}>Sheet: {sh}q today</div>
                    </div>
                    <div style={{display:"flex",flexDirection:"column",gap:4,flexShrink:0}}>
                      {[{f:"sessions",c:"#38bdf8",ph:"s",max:10},{f:"sheet",c:"#818cf8",ph:"q",max:30}].map(x=>(
                        <input key={x.f} type="number" min={0} max={x.max}
                          value={(weekly[key]?.[x.f])||""}
                          placeholder={x.ph}
                          onChange={e=>updDay(key,x.f,Math.max(0,parseInt(e.target.value)||0))}
                          style={{width:40,padding:"3px 0",borderRadius:6,
                            border:`1px solid ${isT?x.c+"80":"#1e1e3f"}`,
                            background:"#080810",color:x.c,fontSize:13,fontWeight:700,textAlign:"center",fontFamily:"inherit"}}/>
                      ))}
                    </div>
                  </div>
                  {isT&&(
                    <div style={{display:"flex",gap:4,marginTop:8,flexWrap:"wrap"}}>
                      {DAY_TYPES.map(dt2=>(
                        <button key={dt2.id} onClick={()=>updDayType(key,dt2.id)}
                          style={{padding:"3px 7px",borderRadius:6,cursor:"pointer",fontFamily:"inherit",fontSize:9,
                            border:`1px solid ${dtId===dt2.id?"#38bdf8":"#1e1e3f"}`,
                            background:dtId===dt2.id?"#0c1a2e":"transparent",
                            color:dtId===dt2.id?"#38bdf8":"#404068"}}>
                          {dt2.icon} {dt2.label}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}

            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:7,marginBottom:10}}>
              {[
                {l:"📤 Export",fn:exportData,           bg:"#0c1a2e",bd:"#38bdf822",c:"#38bdf8"},
                {l:"📥 Import",fn:()=>impRef.current?.click(),bg:"#0e0e22",bd:"#818cf822",c:"#818cf8"},
                {l:"🔄 Reset", fn:()=>setConf(true),    bg:"#1a0c0c",bd:"#f8717122",c:"#f87171"},
              ].map((b,i)=>(
                <button key={i} onClick={b.fn} style={{padding:"9px 4px",borderRadius:10,
                  border:`1px solid ${b.bd}`,background:b.bg,color:b.c,
                  fontSize:11,cursor:"pointer",fontFamily:"inherit",fontWeight:700}}>{b.l}</button>
              ))}
            </div>
            {conf&&(
              <div style={{background:"#1a0c0c",border:"1px solid #f87171",borderRadius:12,padding:13,marginBottom:10,textAlign:"center"}}>
                <div style={{fontSize:12,color:"#f87171",marginBottom:8}}>Reset this week's daily data?</div>
                <div style={{display:"flex",gap:8,justifyContent:"center"}}>
                  <button onClick={resetWeek} style={{padding:"6px 18px",borderRadius:8,border:"none",background:"#f87171",color:"#fff",fontSize:11,cursor:"pointer",fontFamily:"inherit",fontWeight:700}}>Yes, Reset</button>
                  <button onClick={()=>setConf(false)} style={{padding:"6px 18px",borderRadius:8,border:"1px solid #1e1e3f",background:"#0e0e1a",color:"#94a3b8",fontSize:11,cursor:"pointer",fontFamily:"inherit"}}>Cancel</button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ══ TAB 2: TOPICS ════════════════════════════════════════════════ */}
        {tab===2&&(
          <div>
            {/* Phase summary */}
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8,marginBottom:12}}>
              {[
                {l:"Phase 1",d:p1Done,t:P1_TOTAL,p:p1Pct,c:"#f97316",e:"Nov 2026",
                 sub:`Pareto 20% of each topic (${P1_TOTAL} total sessions)`},
                {l:"Phase 2",d:p2Done,t:P2_TOTAL,p:p2Pct,c:"#a78bfa",e:"May 2027",
                 sub:`Remaining sessions + new topics (${P2_TOTAL} total)`},
              ].map((x,i)=>(
                <div key={i} style={{...C,border:`1px solid ${x.c}22`}}>
                  <div style={{display:"flex",justifyContent:"space-between",marginBottom:5}}>
                    <div style={{fontSize:11,fontWeight:700,color:x.c}}>{x.l}</div>
                    <Bdg t={`${x.p.toFixed(0)}%`} c={x.c}/>
                  </div>
                  <Bar pct={x.p} color={x.c} h={5}/>
                  <div style={{fontSize:9,color:"#404068",marginTop:4}}>{x.d}/{x.t}s · ETA {x.e}</div>
                  <div style={{fontSize:9,color:"#64648a",marginTop:2}}>{x.sub}</div>
                </div>
              ))}
            </div>

            {/* All topics */}
            {TOPICS.map(t=>{
              const sd=topicD[t.id]?.sessions||0,shd=topicD[t.id]?.sheet||0;
              const p1d=topicP1Done(t,topicD),p2d=topicP2Done(t,topicD);
              const overallPct=Math.min(sd/t.total*100,100);
              const isAct=t.id===curTopic.id,isDone=sd>=t.total;
              const inP2phase=t.p1===0||(t.p1>0&&p1d>=t.p1&&p2d>0);
              const mainColor=t.p1>0?"#f97316":"#a78bfa";
              return(
                <div key={t.id} style={{...C,border:`1px solid ${isAct?mainColor:isDone?"#4ade8022":"#1e1e3f"}`,
                  background:isAct?"#0b0b18":isDone?"#080f08":"#0e0e1a",marginBottom:8}}>
                  <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:8}}>
                    <div>
                      <div style={{display:"flex",gap:6,alignItems:"center"}}>
                        {isAct&&<Bdg t="NOW" c={mainColor}/>}
                        {isDone&&<Bdg t="✅ DONE" c="#4ade80"/>}
                        <span style={{fontSize:13,fontWeight:700,color:isDone?"#4ade80":isAct?"#f1f5f9":"#94a3b8"}}>
                          {t.icon} {t.name}
                        </span>
                      </div>
                      {/* Phase split labels */}
                      {t.p1>0&&(
                        <div style={{display:"flex",gap:8,marginTop:3}}>
                          <span style={{fontSize:9,color:p1d>=t.p1?"#4ade80":"#f97316"}}>
                            P1: {p1d}/{t.p1}s {p1d>=t.p1?"✅":""}
                          </span>
                          {t.p1<t.total&&(
                            <span style={{fontSize:9,color:p2d>0?"#a78bfa":"#404068"}}>
                              P2: {p2d}/{t.total-t.p1}s
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                    <div style={{textAlign:"right",flexShrink:0}}>
                      <div style={{fontSize:12,fontWeight:700,color:mainColor}}>{overallPct.toFixed(0)}%</div>
                      <div style={{fontSize:10,color:"#64648a"}}>{sd}/{t.total}s</div>
                      <div style={{fontSize:10,color:"#64648a"}}>{shd}/{t.sheet}q</div>
                    </div>
                  </div>

                  {/* Dual progress bar for split topics */}
                  {t.p1>0&&t.p1<t.total?(
                    <div style={{display:"grid",gridTemplateColumns:"auto 1fr",gap:4,alignItems:"center",marginBottom:isAct?10:0}}>
                      <div style={{display:"flex",gap:4,alignItems:"center"}}>
                        <div style={{width:22,height:3,background:"#f97316",borderRadius:99,
                          opacity:Math.min(p1d/t.p1,1)}}/>
                        <div style={{width:22,height:3,background:"#a78bfa",borderRadius:99,
                          opacity:Math.min(p2d/Math.max(t.total-t.p1,1),1)}}/>
                      </div>
                      <Bar pct={overallPct} color={isDone?"#4ade80":mainColor} h={3}/>
                    </div>
                  ):(
                    <div style={{marginBottom:isAct?10:0}}>
                      <Bar pct={overallPct} color={isDone?"#4ade80":mainColor} h={3}/>
                    </div>
                  )}

                  {/* Inline edit for active topic */}
                  {isAct&&(
                    <div>
                      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:6,marginBottom:8}}>
                        <div>
                          <div style={{fontSize:9,color:"#404068",marginBottom:3}}>SESSIONS ({sd}/{t.total})</div>
                          <input type="number" min={0} max={t.total} value={sd||""} placeholder="0"
                            onChange={e=>updTopic(t.id,"sessions",Math.max(0,parseInt(e.target.value)||0))}
                            style={{width:"100%",padding:"6px 8px",borderRadius:7,border:`1px solid ${mainColor}60`,
                              background:"#080810",color:mainColor,fontSize:14,fontWeight:700,textAlign:"center",fontFamily:"inherit",boxSizing:"border-box"}}/>
                        </div>
                        {t.sheet>0&&(
                          <div>
                            <div style={{fontSize:9,color:"#404068",marginBottom:3}}>SHEET ({shd}/{t.sheet})</div>
                            <input type="number" min={0} max={t.sheet} value={shd||""} placeholder="0"
                              onChange={e=>updTopic(t.id,"sheet",Math.max(0,parseInt(e.target.value)||0))}
                              style={{width:"100%",padding:"6px 8px",borderRadius:7,border:"1px solid #818cf860",
                                background:"#080810",color:"#818cf8",fontSize:14,fontWeight:700,textAlign:"center",fontFamily:"inherit",boxSizing:"border-box"}}/>
                          </div>
                        )}
                      </div>
                      <div style={{display:"flex",gap:8}}>
                        {[{l:"Notes Created",f:"notesDone",c:"#4ade80"},{l:"Revised",f:"notesRevised",c:"#f59e0b"}].map(x=>(
                          <label key={x.f} style={{display:"flex",alignItems:"center",gap:5,cursor:"pointer"}}>
                            <input type="checkbox" checked={!!topicD[t.id]?.[x.f]}
                              onChange={e=>updTopic(t.id,x.f,e.target.checked)}
                              style={{accentColor:x.c,cursor:"pointer"}}/>
                            <span style={{fontSize:10,color:topicD[t.id]?.[x.f]?x.c:"#64648a"}}>{x.l}</span>
                          </label>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* ══ TAB 3: REPORT ════════════════════════════════════════════════ */}
        {tab===3&&(
          <div>
            <div style={{...C,marginBottom:12}}>
              <div style={SB}>14-DAY CONSISTENCY</div>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:10}}>
                <span style={{fontSize:38,fontWeight:900,color:consistency>=70?"#4ade80":consistency>=40?"#f59e0b":"#f87171"}}>{consistency}%</span>
                <div style={{textAlign:"right"}}>
                  <div style={{fontSize:13,fontWeight:700,color:"#94a3b8"}}>{streak} day streak 🔥</div>
                  <div style={{fontSize:10,color:"#64648a"}}>Total sessions: {totalSess}</div>
                  <div style={{fontSize:10,color:"#64648a"}}>Avg {delay.spd}/day</div>
                </div>
              </div>
              <Bar pct={consistency} color={consistency>=70?"#4ade80":consistency>=40?"#f59e0b":"#f87171"} h={8}/>
            </div>

            {/* Phase bars — fixed totals */}
            <div style={{...C,marginBottom:12}}>
              <div style={SB}>PHASE PROGRESS (CORRECT TOTALS)</div>
              {[
                {l:"Phase 1 — Pareto targets", d:p1Done,t:P1_TOTAL,p:p1Pct,c:"#f97316",e:"Nov 2026",
                 note:`${P1_TOTAL} sessions = first 20% of 7 topics`},
                {l:"Phase 2 — Deep dive",      d:p2Done,t:P2_TOTAL,p:p2Pct,c:"#a78bfa",e:"May 2027",
                 note:`${P2_TOTAL} sessions = remaining 80% + new topics`},
              ].map((x,i)=>(
                <div key={i} style={{marginBottom:14}}>
                  <div style={{display:"flex",justifyContent:"space-between",marginBottom:4}}>
                    <span style={{fontSize:12,fontWeight:700,color:"#f1f5f9"}}>{x.l}</span>
                    <span style={{fontSize:11,color:x.c,fontWeight:700}}>{x.p.toFixed(1)}%</span>
                  </div>
                  <Bar pct={x.p} color={x.c} h={6}/>
                  <div style={{display:"flex",justifyContent:"space-between",marginTop:4}}>
                    <span style={{fontSize:10,color:"#64648a"}}>{x.note}</span>
                    <span style={{fontSize:10,color:"#64648a"}}>{x.d}/{x.t}s · ETA {x.e}</span>
                  </div>
                </div>
              ))}
            </div>

            {/* Topic-by-topic with split */}
            <div style={{...C,marginBottom:12}}>
              <div style={SB}>TOPIC BREAKDOWN</div>
              {TOPICS.map(t=>{
                const sd=topicD[t.id]?.sessions||0,shd=topicD[t.id]?.sheet||0;
                const p=Math.min(sd/t.total*100,100);
                const c=t.p1>0?"#f97316":"#a78bfa";
                return(
                  <div key={t.id} style={{marginBottom:9}}>
                    <div style={{display:"flex",justifyContent:"space-between",marginBottom:3}}>
                      <span style={{fontSize:11,color:"#94a3b8"}}>{t.icon} {t.name}</span>
                      <span style={{fontSize:10,color:"#64648a"}}>{sd}/{t.total}s{t.sheet>0?` · ${shd}/${t.sheet}q`:""}</span>
                    </div>
                    <Bar pct={p} color={p>=100?"#4ade80":c} h={3}/>
                    {t.p1>0&&t.p1<t.total&&(
                      <div style={{fontSize:9,color:"#404068",marginTop:2}}>
                        P1: {topicP1Done(t,topicD)}/{t.p1} · P2: {topicP2Done(t,topicD)}/{t.total-t.p1}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            <div style={{...C,border:`1px solid ${delay.onTrack?"#4ade8033":"#f8717133"}`}}>
              <div style={SB}>DELAY ANALYSIS</div>
              {delay.onTrack
                ?<div style={{fontSize:12,color:"#4ade80",padding:"8px 10px",background:"#080f08",borderRadius:8}}>✅ On track for Phase 1 ETA (Nov 2026)</div>
                :<div style={{padding:"10px 12px",background:"#1a0c0c",borderRadius:8,border:"1px solid #f8717133"}}>
                  <div style={{fontSize:12,color:"#f87171",marginBottom:4}}>⚠️ Behind by ~{delay.behind} days</div>
                  <div style={{fontSize:11,color:"#94a3b8"}}>Current: {delay.spd}/day · Need {delay.recov}+/day to recover.</div>
                </div>}
            </div>
          </div>
        )}

        {/* ══ TAB 4: MERN ═════════════════════════════════════════════════ */}
        {tab===4&&(
          <div>
            <div style={{...C,marginBottom:12}}>
              <div style={SB}>MERN OVERVIEW</div>
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:8,marginBottom:10}}>
                {[{l:"Done",v:`${mernDone}h`,c:"#34d399"},{l:"Left",v:`${MERN_TOTAL-mernDone}h`,c:"#64648a"},{l:"Progress",v:`${mernPct.toFixed(0)}%`,c:"#818cf8"}].map((x,i)=>(
                  <div key={i} style={{padding:"10px",background:"#080810",borderRadius:10,border:"1px solid #1e1e3f",textAlign:"center"}}>
                    <div style={{fontSize:9,color:"#404068",textTransform:"uppercase",letterSpacing:"0.1em",marginBottom:3}}>{x.l}</div>
                    <div style={{fontSize:20,fontWeight:900,color:x.c}}>{x.v}</div>
                  </div>
                ))}
              </div>
              <Bar pct={mernPct} color="#34d399"/>
            </div>
            <div style={{background:"#0c1a2e",border:"1px solid #38bdf822",borderRadius:12,padding:12,marginBottom:12}}>
              <div style={{fontSize:10,color:"#38bdf8",fontWeight:700,marginBottom:4}}>📌 RULE</div>
              <div style={{fontSize:12,color:"#94a3b8",lineHeight:1.6}}>
                <strong style={{color:"#f1f5f9"}}>Sat+Sun</strong>: 5h MERN + 1h DSA revision. 
                <strong style={{color:"#f1f5f9"}}> 1h watch → 1h build</strong>. Never just watch.
              </div>
            </div>
            {MERN_MODS.map(m=>{
              const done=mernMod[m.id]||0,pct=Math.min(done/m.hrs*100,100);
              return(
                <div key={m.id} style={{...C,border:`1px solid ${m.color}22`,marginBottom:10}}>
                  <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:10}}>
                    <div style={{display:"flex",gap:8,alignItems:"center"}}>
                      <span style={{fontSize:18}}>{m.icon}</span>
                      <div>
                        <div style={{fontSize:13,fontWeight:700,color:"#f1f5f9"}}>{m.label}</div>
                        <div style={{fontSize:10,color:"#64648a"}}>{done}/{m.hrs} hrs</div>
                      </div>
                    </div>
                    <div style={{display:"flex",alignItems:"center",gap:7}}>
                      {[[-1,"−"],[1,"+"]].map(([d,lbl])=>(
                        <button key={d} onClick={()=>adjMern(m.id,d)}
                          disabled={d<0?done<=0:done>=m.hrs}
                          style={{width:28,height:28,borderRadius:7,border:`1px solid ${m.color}40`,background:"#080810",
                            color:m.color,fontSize:17,cursor:(d<0?done>0:done<m.hrs)?"pointer":"not-allowed",fontFamily:"inherit",
                            display:"flex",alignItems:"center",justifyContent:"center",opacity:(d<0?done<=0:done>=m.hrs)?0.3:1}}>
                          {lbl}
                        </button>
                      ))}
                    </div>
                  </div>
                  <Bar pct={pct} color={m.color}/>
                  {done>=m.hrs&&<div style={{fontSize:10,color:"#4ade80",marginTop:4}}>✅ Complete!</div>}
                </div>
              );
            })}
          </div>
        )}

        {/* ══ TAB 5: MILESTONES ════════════════════════════════════════════ */}
        {tab===5&&(
          <div>
            <div style={{...C,marginBottom:12}}>
              <div style={{fontSize:12,color:"#64648a",lineHeight:1.9}}>
                Apr 2026 → Phase 1 start<br/>
                Nov 2026 → Phase 1 done (347s)<br/>
                May 2027 → Phase 2 + MERN + Projects<br/>
                <span style={{color:"#4ade80",fontWeight:700}}>Jul 2027 → 20–30 LPA OFFER 🏆</span>
              </div>
            </div>
            {MILESTONES.map((m,i)=>(
              <div key={i} style={{display:"flex",gap:12,marginBottom:5}}>
                <div style={{display:"flex",flexDirection:"column",alignItems:"center",flexShrink:0}}>
                  <div style={{width:12,height:12,borderRadius:"50%",background:m.color,
                    border:`2px solid ${m.color}`,boxShadow:`0 0 8px ${m.color}60`,marginTop:5,flexShrink:0}}/>
                  {i<MILESTONES.length-1&&<div style={{width:2,flex:1,background:"#1e1e3f",minHeight:20,marginTop:2}}/>}
                </div>
                <div style={{...C,flex:1,marginBottom:8,border:`1px solid ${m.color}22`}}>
                  <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:4}}>
                    <span style={{fontSize:13,fontWeight:700,color:"#f1f5f9"}}>{m.event}</span>
                    <span style={{fontSize:10,fontWeight:700,color:m.color}}>{m.date}</span>
                  </div>
                  <Bdg t={m.phase} c={m.color}/>
                </div>
              </div>
            ))}
            <div style={{background:"linear-gradient(135deg,#0c2a0c,#080f08)",border:"1px solid #4ade8044",
              borderRadius:12,padding:16,textAlign:"center",marginTop:8}}>
              <div style={{fontSize:26,marginBottom:6}}>🏆</div>
              <div style={{fontSize:16,fontWeight:900,color:"#4ade80",marginBottom:4}}>20–30 LPA SDE-1 Offer</div>
              <div style={{fontSize:11,color:"#64648a",marginBottom:10}}>Atlassian · Adobe · Razorpay · PhonePe · CRED</div>
              <div style={{fontSize:11,color:"#94a3b8",lineHeight:1.7,padding:"10px 12px",background:"#080810",borderRadius:8,border:"1px solid #1e1e3f"}}>
                Kumar K referral + strong DSA + 2 live MERN projects = offer 🎯
              </div>
            </div>
          </div>
        )}

        <div style={{marginTop:12,padding:10,...C,textAlign:"center"}}>
          <div style={{fontSize:10,color:"#404068",lineHeight:1.9}}>
            P1 = {P1_TOTAL}s (Pareto 20%) · P2 = {P2_TOTAL}s (remaining) · Total = {P1_TOTAL+P2_TOTAL}s
          </div>
        </div>
      </div>
    </div>
  );
}