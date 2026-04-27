import { useState, useEffect, useRef } from "react";

// ─── DATA ─────────────────────────────────────────────────────────────────────
const TOPICS = [
  {id:"hashing",  name:"Hashing",        phase:1, sessions:111, target:80,  sheet:23,  icon:"#️⃣", order:1},
  {id:"twoptr",   name:"Two Pointer/SW", phase:1, sessions:48,  target:48,  sheet:36,  icon:"👆", order:2},
  {id:"bsearch",  name:"Binary Search",  phase:1, sessions:50,  target:50,  sheet:23,  icon:"🔍", order:3},
  {id:"greedy",   name:"Greedy",         phase:1, sessions:100, target:50,  sheet:36,  icon:"💡", order:4},
  {id:"dp",       name:"DP",             phase:1, sessions:102, target:50,  sheet:44,  icon:"🧮", order:5},
  {id:"bit",      name:"Bit Manip",      phase:1, sessions:37,  target:37,  sheet:10,  icon:"⚡", order:6},
  {id:"math",     name:"Mathematics",    phase:1, sessions:32,  target:32,  sheet:10,  icon:"🔢", order:7},
  {id:"graph",    name:"Graph",          phase:2, sessions:37,  target:37,  sheet:113, icon:"🕸️", order:8},
  {id:"trees",    name:"Trees",          phase:2, sessions:20,  target:20,  sheet:28,  icon:"🌳", order:9},
  {id:"stack",    name:"Stack/Queue",    phase:2, sessions:17,  target:17,  sheet:66,  icon:"📚", order:10},
  {id:"heap",     name:"Heap",           phase:2, sessions:13,  target:13,  sheet:15,  icon:"⛰️", order:11},
  {id:"ll",       name:"Linked List",    phase:2, sessions:16,  target:16,  sheet:35,  icon:"🔗", order:12},
  {id:"string",   name:"String",         phase:2, sessions:44,  target:44,  sheet:44,  icon:"📝", order:13},
  {id:"recursion",name:"Recursion/BT",   phase:2, sessions:4,   target:4,   sheet:20,  icon:"🔄", order:14},
  {id:"trie",     name:"Trie",           phase:2, sessions:2,   target:2,   sheet:7,   icon:"🌲", order:15},
];

const DAY_TYPES = [
  {id:"normal",  label:"Normal",  icon:"☀️", t:2},
  {id:"college", label:"College", icon:"🎓", t:2},
  {id:"weekend", label:"Weekend", icon:"🎯", t:3},
  {id:"holiday", label:"Holiday", icon:"🎉", t:4},
  {id:"exam",    label:"Exam",    icon:"📝", t:1},
];

const MERN_MODS = [
  {id:"html",    label:"HTML",       hrs:4,  icon:"🏗️", color:"#f97316"},
  {id:"css",     label:"CSS",        hrs:8,  icon:"🎨", color:"#38bdf8"},
  {id:"js",      label:"JavaScript", hrs:14, icon:"⚡", color:"#facc15"},
  {id:"react",   label:"React",      hrs:15, icon:"⚛️", color:"#818cf8"},
  {id:"backend", label:"Backend",    hrs:24, icon:"🔧", color:"#34d399"},
];

const MILESTONES = [
  {date:"May 2026", event:"CSS + JS done",           phase:"MERN",  color:"#38bdf8"},
  {date:"Jul 2026", event:"React complete",           phase:"MERN",  color:"#818cf8"},
  {date:"Aug 2026", event:"MERN stack done ✅",       phase:"MERN",  color:"#34d399"},
  {date:"Nov 2026", event:"Phase 1 complete",         phase:"DSA",   color:"#f97316"},
  {date:"Dec 2026", event:"Project 1 live",           phase:"BUILD", color:"#fb923c"},
  {date:"Feb 2027", event:"Project 2 live",           phase:"BUILD", color:"#fb923c"},
  {date:"Apr 2027", event:"Phase 2 complete",         phase:"DSA",   color:"#a78bfa"},
  {date:"May 2027", event:"Resume + Referrals",       phase:"APPLY", color:"#f472b6"},
  {date:"Jul 2027", event:"🏆 OFFER",                 phase:"WIN",   color:"#4ade80"},
];

const PC = {1:"#f97316", 2:"#a78bfa"};
const P1T = TOPICS.filter(t=>t.phase===1).reduce((s,t)=>s+t.target,0); // 347
const P2T = TOPICS.filter(t=>t.phase===2).reduce((s,t)=>s+t.target,0); // 153
const MERN_TOTAL = 65;

// ─── HELPERS ─────────────────────────────────────────────────────────────────
const ds  = d => d.toISOString().split("T")[0];
const isWE= d => { const w=d.getDay(); return w===0||w===6; };
const DNs = ["Sun","Mon","Tue","Wed","Thu","Fri","Sat"];
function last7(){ const a=[];for(let i=6;i>=0;i--){const d=new Date();d.setDate(d.getDate()-i);a.push(d);}return a; }

function smartMsg(cons, streak){
  if(streak>=7)   return {t:"🔥 7+ day streak. Absolute consistency mode.",         c:"#4ade80"};
  if(streak===0)  return {t:"💤 No active streak. Even 1 session restarts it.",     c:"#f87171"};
  if(cons>=80)    return {t:"✅ Strong consistency. Consider bumping daily target.", c:"#4ade80"};
  if(cons>=60)    return {t:"👍 Good momentum. Keep it up this week.",              c:"#38bdf8"};
  if(cons>=40)    return {t:"⚡ Moderate pace. SDE market is competitive — push.",  c:"#f59e0b"};
  return               {t:"🚨 Low consistency. 1 session/day > 0 sessions/day.",   c:"#f87171"};
}

// ─── UI ATOMS ─────────────────────────────────────────────────────────────────
function Bar({pct,color,h=5}){
  return(
    <div style={{background:"#1e1e3f",borderRadius:99,overflow:"hidden",height:h}}>
      <div style={{width:`${Math.min(Math.max(pct,0),100)}%`,height:"100%",background:color,
        borderRadius:99,boxShadow:`0 0 6px ${color}88`,transition:"width .6s ease"}}/>
    </div>
  );
}
function Bdg({t,c}){
  return <span style={{fontSize:9,fontWeight:700,letterSpacing:"0.1em",padding:"2px 7px",borderRadius:99,
    background:`${c}18`,color:c,border:`1px solid ${c}40`}}>{t}</span>;
}
function NumIn({val,onChange,color,ph="0",max=20}){
  return(
    <input type="number" min={0} max={max} value={val||""} placeholder={ph}
      onChange={e=>onChange(Math.max(0,parseInt(e.target.value)||0))}
      style={{width:40,padding:"4px 0",borderRadius:7,border:`1px solid ${color}60`,
        background:"#080810",color,fontSize:14,fontWeight:900,textAlign:"center",fontFamily:"inherit"}}/>
  );
}

const TABS = ["🎯 Today","✅ Tracker","📚 Topics","📊 Report","🌐 MERN","🏁 Milestones"];

// ─── APP ──────────────────────────────────────────────────────────────────────
export default function App(){
  const now    = new Date();
  const todayK = ds(now);
  const impRef = useRef();
  const [tab, setTab]   = useState(0);
  const [conf, setConf] = useState(false);

  // ── Persisted State ──
  const [weekly,  setWeekly]  = useState(()=>{ try{return JSON.parse(localStorage.getItem("dsa_weekly")||"{}");}catch{return {};} });
  const [topicD,  setTopicD]  = useState(()=>{ try{return JSON.parse(localStorage.getItem("dsa_topics")||"{}");}catch{return {};} });
  const [dayT,    setDayT]    = useState(()=>{ try{return JSON.parse(localStorage.getItem("dsa_dayt")  ||"{}");}catch{return {};} });
  const [mernMod, setMernMod] = useState(()=>{ try{return JSON.parse(localStorage.getItem("dsa_mern_mod")||'{"html":4,"css":4,"js":0,"react":0,"backend":0}');}catch{return {html:4,css:4,js:0,react:0,backend:0};} });

  useEffect(()=>{localStorage.setItem("dsa_weekly",    JSON.stringify(weekly));},  [weekly]);
  useEffect(()=>{localStorage.setItem("dsa_topics",    JSON.stringify(topicD));},  [topicD]);
  useEffect(()=>{localStorage.setItem("dsa_dayt",      JSON.stringify(dayT));},    [dayT]);
  useEffect(()=>{localStorage.setItem("dsa_mern_mod",  JSON.stringify(mernMod));}, [mernMod]);

  // ── Derived ──
  const tS  = id => topicD[id]?.sessions||0;
  const tSh = id => topicD[id]?.sheet||0;

  const p1Done = TOPICS.filter(t=>t.phase===1).reduce((s,t)=>s+Math.min(tS(t.id),t.target),0);
  const p2Done = TOPICS.filter(t=>t.phase===2).reduce((s,t)=>s+Math.min(tS(t.id),t.target),0);
  const p1Pct  = Math.min(p1Done/P1T*100,100);
  const p2Pct  = Math.min(p2Done/P2T*100,100);
  const totalSess = Object.values(weekly).reduce((s,d)=>s+(d.sessions||0),0);
  const mernDone  = Object.values(mernMod).reduce((s,v)=>s+v,0);
  const mernPct   = Math.min(mernDone/MERN_TOTAL*100,100);

  const curTopic  = TOPICS.find(t=>tS(t.id)<t.target)||TOPICS[TOPICS.length-1];
  const nextTopic = TOPICS.find(t=>t.order>curTopic.order&&tS(t.id)<t.target);

  const getDT   = key => dayT[key]||(isWE(new Date(key))?"weekend":"normal");
  const getTgt  = key => DAY_TYPES.find(d=>d.id===getDT(key))?.t||2;

  const todayDT  = getDT(todayK);
  const todayDef = DAY_TYPES.find(d=>d.id===todayDT)||DAY_TYPES[0];
  const todayE   = weekly[todayK]||{sessions:0,sheet:0};
  const curTD    = topicD[curTopic.id]||{sessions:0,sheet:0,notesDone:false,notesRevised:false};

  // Streak
  const streak=(()=>{
    let n=0,d=new Date();
    while(n<365){const k=ds(d),e=weekly[k];if(e&&e.sessions>=getTgt(k)){n++;d.setDate(d.getDate()-1);}else break;}
    return n;
  })();

  // 14-day consistency
  const consistency=(()=>{
    let done=0,tot=0;
    for(let i=1;i<15;i++){const d=new Date();d.setDate(d.getDate()-i);const k=ds(d),e=weekly[k];tot++;if(e&&e.sessions>=getTgt(k))done++;}
    return tot?Math.round(done/tot*100):0;
  })();

  // Adaptive target for today
  const adaptTgt=(()=>{
    const base=todayDef.t;
    if(consistency>=80)return base+1;
    if(consistency<35&&base>1)return base-1;
    return base;
  })();

  // Delay prediction
  const delay=(()=>{
    const p1Rem=P1T-p1Done, p2Rem=P2T-p2Done;
    const avgDaily=totalSess/Math.max(Object.keys(weekly).length,1);
    const spd=Math.max(avgDaily,0.5);
    const daysToP1=Math.max(0,Math.ceil((new Date("2026-11-01")-now)/864e5));
    const needed=p1Rem/spd;
    const behind=Math.max(0,Math.ceil(needed-daysToP1));
    return {p1Rem,p2Rem,behind,onTrack:behind===0,spd:spd.toFixed(1),recov:Math.ceil(spd*1.4)};
  })();

  const sm  = smartMsg(consistency,streak);
  const days7 = last7();
  const wDone = days7.filter(d=>{const k=ds(d),e=weekly[k];return e&&e.sessions>=getTgt(k);}).length;
  const wSess = days7.reduce((s,d)=>{const e=weekly[ds(d)];return s+(e?.sessions||0);},0);
  const wSheet= days7.reduce((s,d)=>{const e=weekly[ds(d)];return s+(e?.sheet||0);},0);

  // ── Handlers ──
  function updDay(key,field,val){
    setWeekly(p=>{const e={...p[key]};e[field]=Math.max(0,parseInt(val)||0);return{...p,[key]:e};});
  }
  function updTopic(id,field,val){
    setTopicD(p=>{
      const e={sessions:0,sheet:0,notesDone:false,notesRevised:false,...p[id]};
      if(field==="sessions"||field==="sheet") e[field]=Math.max(0,parseInt(val)||0);
      else e[field]=val;
      return{...p,[id]:e};
    });
  }
  function updDayType(key,type){ setDayT(p=>({...p,[key]:type})); }
  function adjMern(id,d){ setMernMod(p=>{const mod=MERN_MODS.find(m=>m.id===id);return{...p,[id]:Math.max(0,Math.min(mod.hrs,(p[id]||0)+d))};}); }
  function resetWeek(){ setWeekly(p=>{const n={...p};last7().forEach(d=>delete n[ds(d)]);return n;});setConf(false); }

  function exportData(){
    const blob=new Blob([JSON.stringify({weekly,topicData:topicD,dayTypes:dayT,mernMod,timestamp:new Date().toISOString()},null,2)],{type:"application/json"});
    const a=document.createElement("a");a.href=URL.createObjectURL(blob);a.download=`kk-os-${todayK}.json`;a.click();
  }
  function importData(e){
    const f=e.target.files[0];if(!f)return;
    const r=new FileReader();
    r.onload=ev=>{try{const d=JSON.parse(ev.target.result);
      if(d.weekly)setWeekly(d.weekly);if(d.topicData)setTopicD(d.topicData);
      if(d.dayTypes)setDayT(d.dayTypes);if(d.mernMod)setMernMod(d.mernMod);
    }catch{alert("Invalid file");}};
    r.readAsText(f);e.target.value="";
  }

  // ── Shared styles ──
  const C  = {background:"#0e0e1a",border:"1px solid #1e1e3f",borderRadius:12,padding:14};
  const SB = {fontSize:9,color:"#404068",letterSpacing:"0.15em",textTransform:"uppercase",marginBottom:10};
  const R  = {padding:"9px 12px",background:"#080810",borderRadius:8,border:"1px solid #1e1e3f",marginBottom:7};

  return(
    <div style={{minHeight:"100vh",background:"#08080f",fontFamily:"'Space Grotesk',monospace",color:"#e2e8f0"}}>

      {/* Header */}
      <div style={{background:"linear-gradient(180deg,#0f0f24,#08080f)",borderBottom:"1px solid #1e1e3f",
        padding:"18px 16px 13px",textAlign:"center"}}>
        <div style={{fontSize:9,color:"#404068",letterSpacing:"0.3em",marginBottom:5,textTransform:"uppercase"}}>
          Vivek Patne · CSE-DS · RNSIT · Batch 2028
        </div>
        <h1 style={{fontSize:18,fontWeight:900,margin:"0 0 2px",
          background:"linear-gradient(90deg,#38bdf8,#818cf8,#f472b6)",
          WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent",letterSpacing:-0.5}}>
          KUMAR K EXECUTION SYSTEM
        </h1>
        <p style={{fontSize:10,color:"#404068",margin:0}}>Personal OS · 720 Sessions · 20–30 LPA Target</p>
      </div>

      {/* Smart Message Banner */}
      <div style={{padding:"7px 14px",background:`${sm.c}0c`,borderBottom:`1px solid ${sm.c}22`,textAlign:"center"}}>
        <span style={{fontSize:11,color:sm.c}}>{sm.t}</span>
      </div>

      {/* Tabs */}
      <div style={{display:"flex",  justifyContent:"center" ,overflowX:"auto",gap:5,padding:"9px 12px",
        borderBottom:"1px solid #1e1e3f",scrollbarWidth:"none"}}>
        {TABS.map((t,i)=>(
          <button key={i} onClick={()=>setTab(i)} style={{flexShrink:0,padding:"5px 11px",borderRadius:8,cursor:"pointer",
            border:tab===i?"1px solid #38bdf8":"1px solid #1e1e3f",
            background:tab===i?"#0c1a2e":"#0e0e1a",color:tab===i?"#38bdf8":"#404068",
            fontSize:10,fontFamily:"inherit",fontWeight:tab===i?700:400}}>
            {t}
          </button>
        ))}
      </div>

      <div style={{padding:13,maxWidth:640,margin:"0 auto"}}>

        {/* ══ TAB 0: TODAY ══════════════════════════════════════════════════ */}
        {tab===0&&(
          <div>
            {/* Quick Stats */}
            <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:6,marginBottom:12,  justifyContent:"center" }}>
              {[
                {l:"Sessions",v:totalSess,c:"#38bdf8"},
                {l:"Phase 1",  v:`${p1Pct.toFixed(0)}%`,c:"#f97316"},
                {l:"Phase 2",  v:`${p2Pct.toFixed(0)}%`,c:"#a78bfa"},
                {l:"MERN",     v:`${mernPct.toFixed(0)}%`,c:"#34d399"},
              ].map((x,i)=>(
                <div key={i} style={{background:"#0e0e1a",border:`1px solid ${x.c}22`,borderRadius:10,padding:"9px 6px",textAlign:"center"}}>
                  <div style={{fontSize:17,fontWeight:900,color:x.c}}>{x.v}</div>
                  <div style={{fontSize:9,color:"#404068"}}>{x.l}</div>
                </div>
              ))}
            </div>

            {/* Day Type */}
            <div style={{...C,marginBottom:12}}>
              <div style={SB}>DAY TYPE</div>
              <div style={{display:"flex",gap:6,flexWrap:"wrap"}}>
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

            {/* Today Plan Card */}
            <div style={{background:"#060d18",border:"2px solid #38bdf8",borderRadius:14,padding:15,marginBottom:12}}>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:14}}>
                <div>
                  <div style={{fontSize:10,color:"#38bdf8",fontWeight:700,letterSpacing:"0.15em",marginBottom:3}}>TODAY'S PLAN</div>
                  <div style={{fontSize:11,color:"#64648a"}}>{DNs[now.getDay()]} · {todayDef.icon} {todayDef.label}</div>
                </div>
                <div style={{textAlign:"right"}}>
                  <div style={{fontSize:10,color:"#64648a",marginBottom:2}}>Adaptive Target</div>
                  <div style={{fontSize:24,fontWeight:900,color:"#38bdf8",lineHeight:1}}>{adaptTgt}
                    <span style={{fontSize:11,color:"#404068"}}> sess</span>
                  </div>
                  {consistency>=80&&<div style={{fontSize:9,color:"#4ade80"}}>+1 consistent 🔥</div>}
                  {consistency<35&&<div style={{fontSize:9,color:"#f59e0b"}}>-1 catch up first</div>}
                </div>
              </div>

              {/* Current Topic Box */}
              <div style={{background:"#0a0a18",borderRadius:10,padding:12,marginBottom:12,
                border:`1px solid ${PC[curTopic.phase]}33`}}>
                <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:8}}>
                  <div>
                    <div style={{fontSize:9,color:"#404068",marginBottom:2}}>CURRENT TOPIC</div>
                    <div style={{fontSize:17,fontWeight:900,color:PC[curTopic.phase]}}>
                      {curTopic.icon} {curTopic.name}
                    </div>
                  </div>
                  <div style={{textAlign:"right"}}>
                    <div style={{fontSize:12,color:"#94a3b8",fontWeight:700}}>{tS(curTopic.id)}/{curTopic.target}s</div>
                    <div style={{fontSize:10,color:"#64648a"}}>Sheet {tSh(curTopic.id)}/{curTopic.sheet}</div>
                  </div>
                </div>
                <Bar pct={tS(curTopic.id)/curTopic.target*100} color={PC[curTopic.phase]} h={4}/>
              </div>

              {/* Inputs */}
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8,marginBottom:10}}>
                <div style={{background:"#0a0a18",borderRadius:10,padding:10,border:"1px solid #1e1e3f"}}>
                  <div style={{fontSize:9,color:"#404068",textTransform:"uppercase",letterSpacing:"0.1em",marginBottom:6}}>Sessions Done</div>
                  <div style={{display:"flex",alignItems:"center",gap:8}}>
                    <NumIn val={todayE.sessions} max={10} color="#38bdf8"
                      onChange={v=>{updDay(todayK,"sessions",v);updTopic(curTopic.id,"sessions",Math.max(tS(curTopic.id),v));}}/>
                    <span style={{fontSize:12,color:"#404068"}}>/ {adaptTgt}</span>
                    <span style={{fontSize:16}}>{(todayE.sessions||0)>=adaptTgt?"✅":"⏳"}</span>
                  </div>
                </div>
                <div style={{background:"#0a0a18",borderRadius:10,padding:10,border:"1px solid #1e1e3f"}}>
                  <div style={{fontSize:9,color:"#404068",textTransform:"uppercase",letterSpacing:"0.1em",marginBottom:6}}>Sheet Problems</div>
                  <div style={{display:"flex",alignItems:"center",gap:8}}>
                    <NumIn val={todayE.sheet} color="#818cf8"
                      onChange={v=>{updDay(todayK,"sheet",v);updTopic(curTopic.id,"sheet",Math.max(tSh(curTopic.id),v));}}/>
                    <span style={{fontSize:11,color:"#404068"}}>today</span>
                  </div>
                </div>
              </div>

              {/* Notes checkboxes */}
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8}}>
                {[{l:"Notes Created",f:"notesDone",c:"#4ade80"},{l:"Notes Revised",f:"notesRevised",c:"#f59e0b"}].map(x=>(
                  <label key={x.f} style={{display:"flex",alignItems:"center",gap:7,padding:"8px 10px",
                    background:"#0a0a18",borderRadius:8,cursor:"pointer",
                    border:`1px solid ${curTD[x.f]?x.c+"44":"#1e1e3f"}`}}>
                    <input type="checkbox" checked={!!curTD[x.f]}
                      onChange={e=>updTopic(curTopic.id,x.f,e.target.checked)}
                      style={{accentColor:x.c,cursor:"pointer"}}/>
                    <span style={{fontSize:11,color:curTD[x.f]?x.c:"#64648a"}}>{x.l}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Streak + Next Topic */}
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8,marginBottom:12}}>
              <div style={{...C,border:"1px solid #f9731622",textAlign:"center"}}>
                <div style={{fontSize:22}}>{streak>0?"🔥":"💤"}</div>
                <div style={{fontSize:22,fontWeight:900,color:"#f97316"}}>{streak}</div>
                <div style={{fontSize:10,color:"#64648a"}}>day streak</div>
              </div>
              <div style={C}>
                <div style={{fontSize:9,color:"#404068",textTransform:"uppercase",letterSpacing:"0.1em",marginBottom:6}}>NEXT TOPIC</div>
                {nextTopic
                  ?<><div style={{fontSize:13,fontWeight:700,color:"#94a3b8"}}>{nextTopic.icon} {nextTopic.name}</div>
                    <div style={{fontSize:10,color:"#404068",marginTop:2}}>{nextTopic.target} sessions</div></>
                  :<div style={{fontSize:12,color:"#4ade80"}}>🏆 All done!</div>}
              </div>
            </div>

            {/* Delay Prediction */}
            <div style={{...C,border:`1px solid ${delay.onTrack?"#4ade8033":"#f8717133"}`,marginBottom:12}}>
              <div style={SB}>⏱ DELAY PREDICTION</div>
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:7,marginBottom:delay.onTrack?0:10}}>
                {[
                  {l:"Avg/Day",v:`${delay.spd}s`,c:"#38bdf8"},
                  {l:"Status", v:delay.onTrack?"On Track ✅":`${delay.behind}d behind`,c:delay.onTrack?"#4ade80":"#f87171"},
                  {l:"P1 Left",v:`${delay.p1Rem}s`,c:"#f97316"},
                  {l:"P2 Left",v:`${delay.p2Rem}s`,c:"#a78bfa"},
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
                    ⚠️ Behind ~{delay.behind} days. Need {delay.recov}+ sessions/day to recover.
                  </span>
                </div>
              )}
            </div>

            {/* Weekend callout */}
            {(todayDT==="weekend")&&(
              <div style={{...C,border:"1px solid #818cf822",marginBottom:12}}>
                <div style={{fontSize:10,color:"#818cf8",fontWeight:700,marginBottom:6}}>🎯 WEEKEND EXECUTION</div>
                <div style={{fontSize:12,color:"#94a3b8",lineHeight:1.8}}>
                  ✅ 3 DSA sessions + sheet problems<br/>
                  ✅ MERN: 5 hrs (watch → build rule)<br/>
                  ✅ 1 contest (LC Weekly / CF Div 3/4)
                </div>
              </div>
            )}
          </div>
        )}

        {/* ══ TAB 1: TRACKER ════════════════════════════════════════════════ */}
        {tab===1&&(
          <div>
            {/* Week Summary */}
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

            {/* Day Cards */}
            {days7.map(d=>{
              const key=ds(d),isT=key===todayK,isPast=key<todayK;
              const e=weekly[key]||{sessions:0,sheet:0};
              const sess=e.sessions||0,sh=e.sheet||0;
              const tgt=getTgt(key),dt=getDT(key);
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
                        <span style={{fontSize:10,color:"#64648a"}}>{DAY_TYPES.find(x=>x.id===dt)?.icon} {tgt}s target</span>
                        <span style={{fontSize:11,fontWeight:700,color:barC}}>{sess}/{tgt} {sess>=tgt?"✅":"❌"}</span>
                      </div>
                      <Bar pct={Math.min(sess/tgt*100,100)} color={barC}/>
                      <div style={{fontSize:10,color:"#404068",marginTop:4}}>Sheet: {sh} solved today</div>
                    </div>
                    <div style={{display:"flex",flexDirection:"column",gap:5,flexShrink:0}}>
                      <NumIn val={sess} max={10} color={isT?"#38bdf8":"#64648a"} ph="s" onChange={v=>updDay(key,"sessions",v)}/>
                      <NumIn val={sh}   max={20} color="#818cf8"               ph="q" onChange={v=>updDay(key,"sheet",v)}/>
                    </div>
                  </div>
                  {isT&&(
                    <div style={{display:"flex",gap:5,marginTop:8,flexWrap:"wrap"}}>
                      {DAY_TYPES.map(dt2=>(
                        <button key={dt2.id} onClick={()=>updDayType(key,dt2.id)} style={{padding:"3px 8px",borderRadius:6,cursor:"pointer",
                          fontFamily:"inherit",fontSize:10,
                          border:`1px solid ${dt===dt2.id?"#38bdf8":"#1e1e3f"}`,
                          background:dt===dt2.id?"#0c1a2e":"transparent",
                          color:dt===dt2.id?"#38bdf8":"#404068"}}>
                          {dt2.icon} {dt2.label}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}

            {/* Actions */}
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:7,marginTop:4,marginBottom:10}}>
              {[
                {l:"📤 Export",onClick:exportData,           bg:"#0c1a2e",bd:"#38bdf822",c:"#38bdf8"},
                {l:"📥 Import",onClick:()=>impRef.current?.click(),bg:"#0e0e22",bd:"#818cf822",c:"#818cf8"},
                {l:"🔄 Reset", onClick:()=>setConf(true),    bg:"#1a0c0c",bd:"#f8717122",c:"#f87171"},
              ].map((b,i)=>(
                <button key={i} onClick={b.onClick} style={{padding:"9px 4px",borderRadius:10,
                  border:`1px solid ${b.bd}`,background:b.bg,color:b.c,
                  fontSize:11,cursor:"pointer",fontFamily:"inherit",fontWeight:700}}>{b.l}</button>
              ))}
            </div>
            <input ref={impRef} type="file" accept=".json" onChange={importData} style={{display:"none"}}/>
            {conf&&(
              <div style={{background:"#1a0c0c",border:"1px solid #f87171",borderRadius:12,padding:13,marginBottom:10,textAlign:"center"}}>
                <div style={{fontSize:12,color:"#f87171",marginBottom:8}}>Reset this week's data?</div>
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
            {[{phase:1,label:"Phase 1 — Pareto 20% First",done:p1Done,total:P1T,pct:p1Pct,col:"#f97316",eta:"Nov 2026"},
              {phase:2,label:"Phase 2 — Remaining 80%",   done:p2Done,total:P2T,pct:p2Pct,col:"#a78bfa",eta:"May 2027"}
            ].map(ph=>(
              <div key={ph.phase} style={{...C,border:`1px solid ${ph.col}22`,marginBottom:12}}>
                <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:8}}>
                  <div style={{display:"flex",gap:7,alignItems:"center"}}>
                    <Bdg t={`Phase ${ph.phase}`} c={ph.col}/>
                    <span style={{fontSize:12,fontWeight:700,color:"#f1f5f9"}}>{ph.label}</span>
                  </div>
                  <span style={{fontSize:13,fontWeight:900,color:ph.col}}>{ph.pct.toFixed(0)}%</span>
                </div>
                <Bar pct={ph.pct} color={ph.col}/>
                <div style={{marginTop:12}}>
                  {TOPICS.filter(t=>t.phase===ph.phase).map(t=>{
                    const sd=tS(t.id),shd=tSh(t.id),pct=Math.min(sd/t.target*100,100);
                    const isAct=t.id===curTopic.id,isDone=sd>=t.target;
                    return(
                      <div key={t.id} style={{...R,border:`1px solid ${isAct?ph.col:isDone?"#4ade8022":"#1e1e3f"}`,
                        background:isAct?(ph.phase===1?"#120c08":"#0e0a18"):isDone?"#080f08":"#080810"}}>
                        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:6}}>
                          <div style={{display:"flex",gap:6,alignItems:"center"}}>
                            {isAct&&<span style={{fontSize:9,color:ph.col,fontWeight:700}}>● NOW</span>}
                            {isDone&&<span style={{fontSize:9,color:"#4ade80",fontWeight:700}}>✅</span>}
                            <span style={{fontSize:12,fontWeight:700,color:isDone?"#4ade80":isAct?"#f1f5f9":"#94a3b8"}}>{t.icon} {t.name}</span>
                          </div>
                          <span style={{fontSize:11,color:ph.col,fontWeight:700}}>{pct.toFixed(0)}%</span>
                        </div>
                        <Bar pct={pct} color={isDone?"#4ade80":ph.col} h={3}/>
                        {isAct?(
                          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:6,marginTop:8}}>
                            <div>
                              <div style={{fontSize:9,color:"#404068",marginBottom:3}}>SESSIONS ({sd}/{t.target})</div>
                              <input type="number" min={0} value={sd||""} placeholder="0"
                                onChange={e=>updTopic(t.id,"sessions",Math.max(0,parseInt(e.target.value)||0))}
                                style={{width:"100%",padding:"5px 8px",borderRadius:7,border:`1px solid ${ph.col}60`,
                                  background:"#080810",color:ph.col,fontSize:13,fontWeight:700,textAlign:"center",fontFamily:"inherit"}}/>
                            </div>
                            <div>
                              <div style={{fontSize:9,color:"#404068",marginBottom:3}}>SHEET ({shd}/{t.sheet})</div>
                              <input type="number" min={0} value={shd||""} placeholder="0"
                                onChange={e=>updTopic(t.id,"sheet",Math.max(0,parseInt(e.target.value)||0))}
                                style={{width:"100%",padding:"5px 8px",borderRadius:7,border:"1px solid #818cf860",
                                  background:"#080810",color:"#818cf8",fontSize:13,fontWeight:700,textAlign:"center",fontFamily:"inherit"}}/>
                            </div>
                            <div style={{display:"flex",gap:8,gridColumn:"1/-1"}}>
                              {[{l:"Notes Created",f:"notesDone",c:"#4ade80"},{l:"Notes Revised",f:"notesRevised",c:"#f59e0b"}].map(x=>(
                                <label key={x.f} style={{display:"flex",alignItems:"center",gap:5,cursor:"pointer"}}>
                                  <input type="checkbox" checked={!!topicD[t.id]?.[x.f]}
                                    onChange={e=>updTopic(t.id,x.f,e.target.checked)}
                                    style={{accentColor:x.c,cursor:"pointer"}}/>
                                  <span style={{fontSize:10,color:topicD[t.id]?.[x.f]?x.c:"#64648a"}}>{x.l}</span>
                                </label>
                              ))}
                            </div>
                          </div>
                        ):(
                          <div style={{display:"flex",gap:10,marginTop:5}}>
                            <span style={{fontSize:10,color:"#64648a"}}>{sd}/{t.target}s</span>
                            <span style={{fontSize:10,color:"#64648a"}}>{shd}/{t.sheet}q</span>
                            {topicD[t.id]?.notesDone&&<span style={{fontSize:10,color:"#4ade80"}}>📝</span>}
                            {topicD[t.id]?.notesRevised&&<span style={{fontSize:10,color:"#f59e0b"}}>🔄</span>}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* ══ TAB 3: REPORT ════════════════════════════════════════════════ */}
        {tab===3&&(
          <div>
            {/* Consistency card */}
            <div style={{...C,marginBottom:12}}>
              <div style={SB}>14-DAY CONSISTENCY</div>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:10}}>
                <span style={{fontSize:36,fontWeight:900,color:consistency>=70?"#4ade80":consistency>=40?"#f59e0b":"#f87171"}}>{consistency}%</span>
                <div style={{textAlign:"right"}}>
                  <div style={{fontSize:13,fontWeight:700,color:"#94a3b8"}}>{streak} day streak 🔥</div>
                  <div style={{fontSize:10,color:"#64648a"}}>Total sessions: {totalSess}</div>
                  <div style={{fontSize:10,color:"#64648a"}}>Avg {delay.spd}/day</div>
                </div>
              </div>
              <Bar pct={consistency} color={consistency>=70?"#4ade80":consistency>=40?"#f59e0b":"#f87171"} h={8}/>
            </div>

            {/* Phase progress */}
            <div style={{...C,marginBottom:12}}>
              <div style={SB}>PHASE PROGRESS</div>
              {[{l:"Phase 1",d:p1Done,t:P1T,p:p1Pct,c:"#f97316",e:"Nov 2026"},
                {l:"Phase 2",d:p2Done,t:P2T,p:p2Pct,c:"#a78bfa",e:"May 2027"}].map((x,i)=>(
                <div key={i} style={{marginBottom:12}}>
                  <div style={{display:"flex",justifyContent:"space-between",marginBottom:5}}>
                    <span style={{fontSize:12,fontWeight:700,color:"#f1f5f9"}}>{x.l}</span>
                    <span style={{fontSize:11,color:"#64648a"}}><span style={{color:x.c,fontWeight:700}}>{x.p.toFixed(1)}%</span> · {x.d}/{x.t}s · ETA {x.e}</span>
                  </div>
                  <Bar pct={x.p} color={x.c} h={6}/>
                </div>
              ))}
            </div>

            {/* All topics mini bars */}
            <div style={{...C,marginBottom:12}}>
              <div style={SB}>ALL TOPICS</div>
              {TOPICS.map(t=>{
                const sd=tS(t.id),shd=tSh(t.id),pct=Math.min(sd/t.target*100,100);
                const c=t.phase===1?"#f97316":"#a78bfa";
                return(
                  <div key={t.id} style={{marginBottom:8}}>
                    <div style={{display:"flex",justifyContent:"space-between",marginBottom:3}}>
                      <span style={{fontSize:11,color:"#94a3b8"}}>{t.icon} {t.name}</span>
                      <span style={{fontSize:10,color:"#64648a"}}>{sd}/{t.target}s · {shd}/{t.sheet}q</span>
                    </div>
                    <Bar pct={pct} color={pct>=100?"#4ade80":c} h={3}/>
                  </div>
                );
              })}
            </div>

            {/* Delay + MERN */}
            <div style={{...C,border:`1px solid ${delay.onTrack?"#4ade8033":"#f8717133"}`,marginBottom:12}}>
              <div style={SB}>DELAY ANALYSIS</div>
              {delay.onTrack
                ?<div style={{fontSize:12,color:"#4ade80",padding:"8px 10px",background:"#080f08",borderRadius:8}}>✅ On track for Phase 1 (Nov 2026)</div>
                :<div style={{padding:"10px 12px",background:"#1a0c0c",borderRadius:8,border:"1px solid #f8717133"}}>
                  <div style={{fontSize:12,color:"#f87171",marginBottom:4}}>⚠️ Behind by ~{delay.behind} days</div>
                  <div style={{fontSize:11,color:"#94a3b8"}}>Current: {delay.spd}/day · Need {delay.recov}+/day to recover.</div>
                </div>}
            </div>
            <div style={{...C,border:"1px solid #34d39922"}}>
              <div style={SB}>MERN PROGRESS</div>
              <div style={{display:"flex",justifyContent:"space-between",marginBottom:6}}>
                <span style={{fontSize:12,color:"#94a3b8"}}>{mernDone}/{MERN_TOTAL} hrs</span>
                <span style={{fontSize:13,fontWeight:900,color:"#34d399"}}>{mernPct.toFixed(0)}%</span>
              </div>
              <Bar pct={mernPct} color="#34d399" h={6}/>
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
                <strong style={{color:"#f1f5f9"}}> 1h watch → 1h build.</strong> Never just watch.
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
                      <button onClick={()=>adjMern(m.id,-1)} disabled={done<=0}
                        style={{width:28,height:28,borderRadius:7,border:`1px solid ${m.color}40`,background:"#080810",
                          color:m.color,fontSize:17,cursor:done>0?"pointer":"not-allowed",fontFamily:"inherit",
                          display:"flex",alignItems:"center",justifyContent:"center",opacity:done<=0?0.3:1}}>−</button>
                      <span style={{fontSize:15,fontWeight:900,color:m.color,minWidth:22,textAlign:"center"}}>{done}</span>
                      <button onClick={()=>adjMern(m.id,1)} disabled={done>=m.hrs}
                        style={{width:28,height:28,borderRadius:7,border:`1px solid ${m.color}40`,background:"#080810",
                          color:m.color,fontSize:17,cursor:done<m.hrs?"pointer":"not-allowed",fontFamily:"inherit",
                          display:"flex",alignItems:"center",justifyContent:"center",opacity:done>=m.hrs?0.3:1}}>+</button>
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
                Nov 2026 → Phase 1 complete (347s)<br/>
                May 2027 → Phase 2 + MERN + Projects done<br/>
                <span style={{color:"#4ade80",fontWeight:700}}>Jul 2027 → 20–30 LPA OFFER 🏆</span>
              </div>
            </div>
            {MILESTONES.map((m,i)=>(
              <div key={i} style={{display:"flex",gap:12,marginBottom:5}}>
                <div style={{display:"flex",flexDirection:"column",alignItems:"center",flexShrink:0}}>
                  <div style={{width:12,height:12,borderRadius:"50%",background:m.color,border:`2px solid ${m.color}`,
                    boxShadow:`0 0 8px ${m.color}60`,marginTop:5,flexShrink:0}}/>
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

        {/* Footer */}
        <div style={{marginTop:12,padding:10,...C,textAlign:"center"}}>
          <div style={{fontSize:10,color:"#404068",lineHeight:1.9}}>
            <span style={{color:"#38bdf8"}}>Weekdays</span> = DSA {adaptTgt}s ·
            <span style={{color:"#818cf8"}}> Weekends</span> = MERN 5h + revision ·
            <span style={{color:"#f97316"}}> Summer</span> = 4s/day
          </div>
        </div>
      </div>
    </div>
  );
}

