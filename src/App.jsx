import { useState, useEffect, useRef } from "react";

// ─── CONSTANTS ───────────────────────────────────────────────────────────────
const P1 = 348, P2 = 372, MERN_TOTAL = 65;
const DAY_NAMES = ["Sun","Mon","Tue","Wed","Thu","Fri","Sat"];

const MERN_MODS = [
  {id:"html",    label:"HTML",       hrs:4,  icon:"🏗️", color:"#f97316"},
  {id:"css",     label:"CSS",        hrs:8,  icon:"🎨", color:"#38bdf8"},
  {id:"js",      label:"JavaScript", hrs:14, icon:"⚡", color:"#facc15"},
  {id:"react",   label:"React",      hrs:15, icon:"⚛️", color:"#818cf8"},
  {id:"backend", label:"Backend",    hrs:24, icon:"🔧", color:"#34d399"},
];

const P1_TOPICS = [
  {name:"Hashing",sessions:111,sheet:80},
  {name:"Binary Search",sessions:49,sheet:50},
  {name:"Two Ptr / SW",sessions:48,sheet:50},
  {name:"Greedy",sessions:100,sheet:50},
  {name:"Bit Manipulation",sessions:37,sheet:37},
  {name:"Maths",sessions:3,sheet:13},
];
const P2_TOPICS = [
  {name:"Trees",sessions:43,sheet:47},
  {name:"Graph",sessions:37,sheet:113},
  {name:"DP",sessions:102,sheet:44},
  {name:"Stack / Queue",sessions:17,sheet:66},
  {name:"Linked List",sessions:16,sheet:35},
  {name:"String",sessions:44,sheet:44},
  {name:"Recursion",sessions:4,sheet:20},
  {name:"Heap",sessions:13,sheet:15},
];

const TIMELINE = [
  {period:"Apr 27 – Jun 12",label:"4th Sem (Normal)",color:"#38bdf8",dsa:"P1 Start · 2s+2q",mern:"CSS → JS (weekends)",summer:false,exams:false},
  {period:"May 25–29",label:"Internal Test 2",color:"#f59e0b",dsa:"Light · 1s+1q",mern:"Pause web dev",summer:false,exams:true},
  {period:"Jun 15–27",label:"Practicals",color:"#a78bfa",dsa:"Continue · 2s+2q",mern:"React start",summer:false,exams:true},
  {period:"Jun 29 – Jul 17",label:"Theory Exams",color:"#f87171",dsa:"Minimal · 1s+1q",mern:"Pause",summer:false,exams:true},
  {period:"Jul 22 – Aug 31",label:"🔥 Summer Break",color:"#f97316",dsa:"BEAST MODE · 4s+4q",mern:"React + Backend (5h/day)",summer:true,exams:false},
  {period:"Sep – Dec 2026",label:"5th Sem",color:"#34d399",dsa:"P1 → P2 · 2s+2q",mern:"MERN complete ✅",summer:false,exams:false},
  {period:"Jan 2027",label:"5th Sem Exams",color:"#f59e0b",dsa:"Light · 1s+1q",mern:"Projects build",summer:false,exams:true},
  {period:"Feb – Jun 2027",label:"6th Sem → APPLY",color:"#818cf8",dsa:"P2 + Interview · 2s",mern:"Resume + Referrals",summer:false,exams:false},
];

const MILESTONES = [
  {date:"May 2026",event:"CSS + JS done",phase:"MERN",color:"#38bdf8"},
  {date:"Jul 2026",event:"React complete",phase:"MERN",color:"#818cf8"},
  {date:"Aug 2026",event:"MERN stack done ✅",phase:"MERN",color:"#34d399"},
  {date:"Nov 2026",event:"Phase 1 complete (348s)",phase:"DSA",color:"#f97316"},
  {date:"Dec 2026",event:"Project 1 live",phase:"BUILD",color:"#fb923c"},
  {date:"Feb 2027",event:"Project 2 live",phase:"BUILD",color:"#fb923c"},
  {date:"Apr 2027",event:"Phase 2 complete (720s)",phase:"DSA",color:"#a78bfa"},
  {date:"May 2027",event:"Resume + Referrals",phase:"APPLY",color:"#f472b6"},
  {date:"Jul 2027",event:"🏆 OFFER",phase:"WIN",color:"#4ade80"},
];

// ─── HELPERS ──────────────────────────────────────────────────────────────────
const ds = d => d.toISOString().split("T")[0];
const isWE = d => { const w=d.getDay(); return w===0||w===6; };
const getTarget = d => isWE(d)?3:2;
function last7(){
  const a=[];
  for(let i=6;i>=0;i--){const d=new Date();d.setDate(d.getDate()-i);a.push(d);}
  return a;
}

// ─── SUBCOMPONENTS ────────────────────────────────────────────────────────────
function Bar({pct,color}){
  return(
    <div style={{background:"#1e1e3f",borderRadius:99,overflow:"hidden",height:5}}>
      <div style={{width:`${Math.min(pct,100)}%`,height:"100%",background:color,borderRadius:99,
        boxShadow:`0 0 6px ${color}88`,transition:"width 0.6s ease"}}/>
    </div>
  );
}
function Badge({text,color}){
  return(
    <span style={{fontSize:9,fontWeight:700,letterSpacing:"0.1em",padding:"2px 7px",borderRadius:99,
      background:`${color}18`,color,border:`1px solid ${color}40`}}>{text}</span>
  );
}

const TABS = ["✅ Tracker","📅 Timeline","⚡ DSA Phases","🌐 MERN Stack","🏁 Milestones"];

// ─── MAIN ─────────────────────────────────────────────────────────────────────
export default function App(){
  const todayDate = new Date();
  const todayKey  = ds(todayDate);

  // ── State ──
  const [tab,setTab]       = useState(0);
  const [confirmReset,setCR] = useState(false);
  const [exP1,setExP1]     = useState(false);
  const [exP2,setExP2]     = useState(false);
  const importRef          = useRef();

  const [weekly,setWeekly] = useState(()=>{
    try{return JSON.parse(localStorage.getItem("dsa_weekly")||"{}");}catch{return {};}
  });
  const [mernMod,setMernMod] = useState(()=>{
    try{return JSON.parse(localStorage.getItem("dsa_mern_mod")||
      '{"html":4,"css":4,"js":0,"react":0,"backend":0}');}
    catch{return {html:4,css:4,js:0,react:0,backend:0};}
  });

  // ── Persist ──
  useEffect(()=>{localStorage.setItem("dsa_weekly",JSON.stringify(weekly));},[weekly]);
  useEffect(()=>{localStorage.setItem("dsa_mern_mod",JSON.stringify(mernMod));},[mernMod]);

  // ── Derived ──
  const totalSess = Object.values(weekly).reduce((s,d)=>s+(d.sessions||0),0);
  const p1Pct = Math.min(totalSess/P1*100,100);
  const p2Pct = totalSess>P1?Math.min((totalSess-P1)/P2*100,100):0;
  const mernDone = Object.values(mernMod).reduce((s,v)=>s+v,0);
  const mernPct  = Math.min(mernDone/MERN_TOTAL*100,100);

  const streak=(()=>{
    let n=0,d=new Date();
    while(n<365){
      const k=ds(d),e=weekly[k];
      if(e&&e.sessions>=getTarget(d)){n++;d.setDate(d.getDate()-1);}else break;
    }
    return n;
  })();

  const days7 = last7();
  const wDone = days7.filter(d=>{const e=weekly[ds(d)];return e&&e.sessions>=getTarget(d);}).length;
  const wSess = days7.reduce((s,d)=>{const e=weekly[ds(d)];return s+(e?.sessions||0);},0);
  const wConsistency = Math.round(wDone/7*100);

  const todayE  = weekly[todayKey]||{sessions:0,done:false};
  const todayTgt= getTarget(todayDate);

  // ── Handlers ──
  function updateDay(key,field,value){
    setWeekly(prev=>{
      const entry={...prev[key],sessions:prev[key]?.sessions||0,done:prev[key]?.done||false};
      entry[field]=value;
      if(field==="sessions"){
        const v=parseInt(value)||0;
        entry.sessions=v;
        if(v>=getTarget(new Date(key)))entry.done=true;
      }
      return{...prev,[key]:entry};
    });
  }

  function resetWeek(){
    setWeekly(prev=>{
      const n={...prev};
      last7().forEach(d=>delete n[ds(d)]);
      return n;
    });
    setCR(false);
  }

  function exportData(){
    const d={weekly_progress:weekly,totalSessionsDone:totalSess,
      mernHoursDone:mernDone,mernModuleHrs:mernMod,timestamp:new Date().toISOString()};
    const a=document.createElement("a");
    a.href=URL.createObjectURL(new Blob([JSON.stringify(d,null,2)],{type:"application/json"}));
    a.download=`dsa-progress-${todayKey}.json`;a.click();
  }

  function importData(e){
    const f=e.target.files[0];if(!f)return;
    const r=new FileReader();
    r.onload=ev=>{
      try{
        const d=JSON.parse(ev.target.result);
        if(d.weekly_progress)setWeekly(d.weekly_progress);
        if(d.mernModuleHrs)setMernMod(d.mernModuleHrs);
      }catch{alert("Invalid JSON file");}
    };
    r.readAsText(f);e.target.value="";
  }

  function adjMern(id,delta){
    setMernMod(prev=>{
      const mod=MERN_MODS.find(m=>m.id===id);
      const cur=prev[id]||0;
      return{...prev,[id]:Math.max(0,Math.min(mod.hrs,cur+delta))};
    });
  }

  // ── UI ──
  const s = {
    card: {background:"#0e0e1a",border:"1px solid #1e1e3f",borderRadius:12,padding:14},
    sub:  {fontSize:9,color:"#404068",letterSpacing:"0.15em",textTransform:"uppercase",marginBottom:10},
    row:  {padding:"9px 12px",background:"#080810",borderRadius:8,border:"1px solid #1e1e3f",marginBottom:7},
  };

  return(
    <div style={{minHeight:"100vh",background:"#08080f",fontFamily:"'Space Grotesk',monospace",color:"#e2e8f0"}}>

      {/* Header */}
      <div style={{background:"linear-gradient(180deg,#0f0f24,#08080f)",borderBottom:"1px solid #1e1e3f",
        padding:"20px 16px 16px",textAlign:"center"}}>
        <div style={{fontSize:9,color:"#404068",letterSpacing:"0.3em",marginBottom:6,textTransform:"uppercase"}}>
          Vivek Patne · CSE-DS · RNSIT · 2028
        </div>
        <h1 style={{fontSize:21,fontWeight:900,margin:"0 0 3px",
          background:"linear-gradient(90deg,#38bdf8,#818cf8,#f472b6)",
          WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent",letterSpacing:-0.5}}>
          DSA + MERN TRACKER
        </h1>
        <p style={{fontSize:11,color:"#404068",margin:0}}>Kumar K Pro Batch · 720 sessions · Apr 2026 → Offer Jul 2027</p>
      </div>

      {/* Tabs */}
      <div style={{display:"flex",overflowX:"auto",gap:6,padding:"10px 14px",borderBottom:"1px solid #1e1e3f",scrollbarWidth:"none"}}>
        {TABS.map((t,i)=>(
          <button key={i} onClick={()=>setTab(i)} style={{flexShrink:0,padding:"5px 13px",borderRadius:8,cursor:"pointer",
            border:tab===i?"1px solid #38bdf8":"1px solid #1e1e3f",
            background:tab===i?"#0c1a2e":"#0e0e1a",
            color:tab===i?"#38bdf8":"#404068",
            fontSize:11,fontFamily:"inherit",fontWeight:tab===i?700:400}}>
            {t}
          </button>
        ))}
      </div>

      <div style={{padding:14,maxWidth:640,margin:"0 auto"}}>

        {/* ══ TAB 0: TRACKER ══════════════════════════════════════════════════ */}
        {tab===0&&(
          <div>
            {/* Quick Stats */}
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8,marginBottom:12}}>
              {[
                {label:"Total Sessions",val:totalSess,sub:`of 720 total`,color:"#38bdf8"},
                {label:"Phase 1",val:`${p1Pct.toFixed(1)}%`,sub:`${Math.min(totalSess,P1)}/${P1} sess`,color:"#f97316"},
                {label:"Phase 2",val:`${p2Pct.toFixed(1)}%`,sub:`${Math.max(0,totalSess-P1)}/${P2} sess`,color:"#a78bfa"},
                {label:"MERN Stack",val:`${mernPct.toFixed(1)}%`,sub:`${mernDone}/${MERN_TOTAL} hrs`,color:"#34d399"},
              ].map((s,i)=>(
                <div key={i} style={{background:"#0e0e1a",border:`1px solid ${s.color}22`,borderRadius:12,padding:"11px 13px"}}>
                  <div style={{fontSize:9,color:"#404068",letterSpacing:"0.1em",textTransform:"uppercase",marginBottom:5}}>{s.label}</div>
                  <div style={{fontSize:20,fontWeight:900,color:s.color,marginBottom:2}}>{s.val}</div>
                  <div style={{fontSize:10,color:"#64648a"}}>{s.sub}</div>
                  <div style={{marginTop:6}}><Bar pct={typeof s.val==="number"?s.val:parseFloat(s.val)} color={s.color}/></div>
                </div>
              ))}
            </div>

            {/* Streak + Today */}
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8,marginBottom:12}}>
              <div style={{...s.card,border:"1px solid #f9731622",textAlign:"center"}}>
                <div style={{fontSize:26,marginBottom:3}}>{streak>0?"🔥":"💤"}</div>
                <div style={{fontSize:20,fontWeight:900,color:"#f97316"}}>{streak} {streak===1?"day":"days"}</div>
                <div style={{fontSize:10,color:"#64648a"}}>current streak</div>
              </div>
              <div style={{...s.card,border:"1px solid #38bdf822",textAlign:"center"}}>
                <div style={{fontSize:11,color:"#404068",marginBottom:5}}>TODAY'S TARGET</div>
                <div style={{fontSize:22,fontWeight:900,color:"#38bdf8"}}>{todayE.sessions||0}<span style={{fontSize:14,color:"#404068"}}>/{todayTgt}</span></div>
                <div style={{fontSize:11,marginTop:4,color:todayE.sessions>=todayTgt?"#4ade80":"#f87171",fontWeight:700}}>
                  {todayE.sessions>=todayTgt?"✅ Done!":"❌ Pending"}
                </div>
              </div>
            </div>

            {/* Week Summary */}
            <div style={{...s.card,marginBottom:12}}>
              <div style={s.sub}>THIS WEEK SUMMARY</div>
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:8,marginBottom:10}}>
                {[
                  {label:"Days Done",val:`${wDone}/7`,color:"#4ade80"},
                  {label:"Sessions",val:wSess,color:"#38bdf8"},
                  {label:"Consistency",val:`${wConsistency}%`,color:"#818cf8"},
                ].map((x,i)=>(
                  <div key={i} style={{textAlign:"center",padding:"8px",background:"#080810",borderRadius:8,border:"1px solid #1e1e3f"}}>
                    <div style={{fontSize:18,fontWeight:900,color:x.color}}>{x.val}</div>
                    <div style={{fontSize:10,color:"#404068"}}>{x.label}</div>
                  </div>
                ))}
              </div>
              <div style={{height:4,background:"#1e1e3f",borderRadius:99,overflow:"hidden"}}>
                <div style={{width:`${wConsistency}%`,height:"100%",
                  background:wConsistency>=80?"#4ade80":wConsistency>=50?"#f59e0b":"#f87171",
                  transition:"width 0.6s ease",borderRadius:99}}/>
              </div>
            </div>

            {/* Day Cards */}
            <div style={{marginBottom:12}}>
              {days7.map(d=>{
                const key=ds(d), isToday=key===todayKey;
                const entry=weekly[key]||{sessions:0,done:false};
                const tgt=getTarget(d), sess=entry.sessions||0, done=entry.done||false;
                const isPast=key<todayKey;
                let bdr=isPast&&sess===0?"#f8717133":sess>=tgt?"#16a34a44":sess>0?"#f59e0b33":"#1e1e3f";
                if(isToday)bdr="#38bdf8";
                const barCol=sess>=tgt?"#4ade80":sess>0?"#f59e0b":"#f87171";
                const sessColor=sess>=tgt?"#4ade80":sess>0?"#f59e0b":isPast?"#f87171":"#64648a";
                return(
                  <div key={key} style={{background:"#0e0e1a",border:`2px solid ${bdr}`,borderRadius:12,padding:"12px 14px",marginBottom:8}}>
                    <div style={{display:"flex",alignItems:"center",gap:10}}>
                      {/* Day label */}
                      <div style={{minWidth:46,flexShrink:0}}>
                        <div style={{fontSize:13,fontWeight:700,color:isToday?"#38bdf8":"#94a3b8"}}>
                          {DAY_NAMES[d.getDay()]}
                        </div>
                        <div style={{fontSize:10,color:"#404068"}}>
                          {String(d.getDate()).padStart(2,"0")}-{String(d.getMonth()+1).padStart(2,"0")}
                        </div>
                        {isToday&&<div style={{fontSize:9,color:"#38bdf8",fontWeight:700}}>TODAY</div>}
                        {!isToday&&<div style={{fontSize:9,color:"#404068"}}>{isWE(d)?"WE":"WD"}</div>}
                      </div>

                      {/* Progress bar */}
                      <div style={{flex:1}}>
                        <div style={{display:"flex",justifyContent:"space-between",marginBottom:5}}>
                          <span style={{fontSize:10,color:"#64648a"}}>
                            Target: {tgt} sess {isWE(d)?"(Weekend)":"(Weekday)"}
                          </span>
                          <span style={{fontSize:11,fontWeight:700,color:sessColor}}>
                            {sess}/{tgt} {sess>=tgt?"✅":"❌"}
                          </span>
                        </div>
                        <Bar pct={Math.min(sess/tgt*100,100)} color={barCol}/>
                      </div>

                      {/* Input */}
                      <div style={{display:"flex",flexDirection:"column",gap:5,alignItems:"center",flexShrink:0}}>
                        <input
                          type="number" min={0} max={10}
                          value={sess||""}
                          placeholder="0"
                          onChange={e=>updateDay(key,"sessions",Math.max(0,parseInt(e.target.value)||0))}
                          style={{width:40,padding:"4px 0",borderRadius:7,
                            border:`1px solid ${isToday?"#38bdf8":"#1e1e3f"}`,
                            background:"#080810",color:"#e2e8f0",
                            fontSize:14,fontWeight:700,textAlign:"center",fontFamily:"inherit"}}
                        />
                        <label style={{display:"flex",alignItems:"center",gap:3,cursor:"pointer"}}>
                          <input type="checkbox" checked={!!done}
                            onChange={e=>updateDay(key,"done",e.target.checked)}
                            style={{cursor:"pointer",accentColor:"#4ade80"}}/>
                          <span style={{fontSize:9,color:"#404068"}}>done</span>
                        </label>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Actions */}
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:8,marginBottom:12}}>
              {[
                {label:"📤 Export",onClick:exportData,border:"#38bdf822",bg:"#0c1a2e",color:"#38bdf8"},
                {label:"📥 Import",onClick:()=>importRef.current?.click(),border:"#818cf822",bg:"#0e0e22",color:"#818cf8"},
                {label:"🔄 Reset",onClick:()=>setCR(true),border:"#f8717122",bg:"#1a0c0c",color:"#f87171"},
              ].map((b,i)=>(
                <button key={i} onClick={b.onClick} style={{padding:"10px 4px",borderRadius:10,
                  border:`1px solid ${b.border}`,background:b.bg,color:b.color,
                  fontSize:11,cursor:"pointer",fontFamily:"inherit",fontWeight:700}}>
                  {b.label}
                </button>
              ))}
            </div>
            <input ref={importRef} type="file" accept=".json" onChange={importData} style={{display:"none"}}/>

            {/* Reset confirm */}
            {confirmReset&&(
              <div style={{background:"#1a0c0c",border:"1px solid #f87171",borderRadius:12,
                padding:14,marginBottom:12,textAlign:"center"}}>
                <div style={{fontSize:13,color:"#f87171",marginBottom:10}}>
                  Reset this week's data? (Total sessions history kept)
                </div>
                <div style={{display:"flex",gap:8,justifyContent:"center"}}>
                  <button onClick={resetWeek} style={{padding:"6px 20px",borderRadius:8,
                    border:"none",background:"#f87171",color:"#fff",
                    fontSize:12,cursor:"pointer",fontFamily:"inherit",fontWeight:700}}>
                    Yes, Reset
                  </button>
                  <button onClick={()=>setCR(false)} style={{padding:"6px 20px",borderRadius:8,
                    border:"1px solid #1e1e3f",background:"#0e0e1a",color:"#94a3b8",
                    fontSize:12,cursor:"pointer",fontFamily:"inherit"}}>
                    Cancel
                  </button>
                </div>
              </div>
            )}

            {/* Study rules */}
            <div style={s.card}>
              <div style={s.sub}>STUDY RULES</div>
              {[
                {icon:"📅",p:"Weekdays",r:"DSA only — 2 sessions",c:"#38bdf8"},
                {icon:"🎯",p:"Weekends",r:"MERN 5 hrs + DSA revision",c:"#818cf8"},
                {icon:"🔥",p:"Summer Break",r:"4 sessions/day — BEAST MODE",c:"#f97316"},
              ].map((x,i)=>(
                <div key={i} style={{...s.row,display:"flex",alignItems:"center",gap:10}}>
                  <span style={{fontSize:16}}>{x.icon}</span>
                  <div>
                    <span style={{fontSize:12,fontWeight:700,color:x.c}}>{x.p}</span>
                    <span style={{fontSize:11,color:"#64648a"}}> → {x.r}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ══ TAB 1: TIMELINE ═════════════════════════════════════════════════ */}
        {tab===1&&(
          <div>
            <div style={{...s.card,marginBottom:12}}>
              <div style={{display:"flex",gap:16,flexWrap:"wrap"}}>
                {[{c:"#38bdf8",l:"Normal"},{c:"#f59e0b",l:"Exam"},{c:"#f97316",l:"Summer 🔥"}].map((x,i)=>(
                  <div key={i} style={{display:"flex",alignItems:"center",gap:6}}>
                    <div style={{width:8,height:8,borderRadius:99,background:x.c}}/>
                    <span style={{fontSize:11,color:"#64648a"}}>{x.l}</span>
                  </div>
                ))}
              </div>
            </div>
            {TIMELINE.map((t,i)=>(
              <div key={i} style={{background:"#0e0e1a",
                border:`1px solid ${t.summer?"#f9731644":t.exams?"#f59e0b22":"#1e1e3f"}`,
                borderRadius:12,padding:13,marginBottom:9}}>
                <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:9}}>
                  <div>
                    <div style={{display:"flex",gap:6,alignItems:"center",marginBottom:3}}>
                      <span style={{fontSize:12,fontWeight:700,color:t.color}}>{t.period}</span>
                      {t.summer&&<Badge text="BEAST MODE" color="#f97316"/>}
                      {t.exams&&<Badge text="EXAMS" color="#f59e0b"/>}
                    </div>
                    <span style={{fontSize:11,color:"#64648a"}}>{t.label}</span>
                  </div>
                </div>
                <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8}}>
                  {[{h:"DSA",v:t.dsa},{h:"MERN (Weekends)",v:t.mern}].map((x,j)=>(
                    <div key={j} style={{padding:"8px 10px",background:"#080810",borderRadius:8,border:"1px solid #1e1e3f"}}>
                      <div style={{fontSize:9,color:"#404068",marginBottom:3,letterSpacing:"0.1em",textTransform:"uppercase"}}>{x.h}</div>
                      <div style={{fontSize:11,color:"#94a3b8"}}>{x.v}</div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* ══ TAB 2: DSA PHASES ═══════════════════════════════════════════════ */}
        {tab===2&&(
          <div>
            {/* Live Stats */}
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8,marginBottom:12}}>
              {[
                {label:"Sessions Done",val:totalSess,color:"#38bdf8"},
                {label:"Sessions Left",val:720-totalSess,color:"#64648a"},
                {label:"Phase 1",val:`${p1Pct.toFixed(1)}%`,color:"#f97316"},
                {label:"Phase 2",val:`${p2Pct.toFixed(1)}%`,color:"#a78bfa"},
              ].map((x,i)=>(
                <div key={i} style={{...s.card,border:`1px solid ${x.color}22`}}>
                  <div style={{fontSize:9,color:"#404068",letterSpacing:"0.1em",textTransform:"uppercase",marginBottom:5}}>{x.label}</div>
                  <div style={{fontSize:22,fontWeight:900,color:x.color}}>{x.val}</div>
                </div>
              ))}
            </div>

            {/* KK Rule */}
            <div style={{background:"#0c1a0c",border:"1px solid #16a34a44",borderRadius:12,padding:13,marginBottom:12}}>
              <div style={{fontSize:10,color:"#4ade80",fontWeight:700,marginBottom:5}}>⚡ KK SIR'S PARETO RULE</div>
              <p style={{fontSize:12,color:"#94a3b8",lineHeight:1.6,margin:0}}>
                Do <strong style={{color:"#4ade80"}}>20–30% of EACH topic first</strong>, not all of one topic then next.
                Cover all topics in parallel rounds.
              </p>
            </div>

            {/* Phase 1 */}
            <div style={{...s.card,border:"1px solid #f9731622",marginBottom:10}}>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:10}}>
                <div style={{display:"flex",gap:8,alignItems:"center"}}>
                  <Badge text="Phase 1" color="#f97316"/>
                  <span style={{fontSize:13,fontWeight:700,color:"#f1f5f9"}}>Pareto 20% — Do FIRST</span>
                </div>
                <button onClick={()=>setExP1(!exP1)} style={{fontSize:10,padding:"3px 10px",borderRadius:6,
                  border:"1px solid #f9731640",background:"transparent",color:"#f97316",cursor:"pointer",fontFamily:"inherit"}}>
                  {exP1?"▲ hide":"▼ show"}
                </button>
              </div>
              <div style={{marginBottom:exP1?12:0}}>
                <div style={{display:"flex",justifyContent:"space-between",marginBottom:5}}>
                  <span style={{fontSize:11,color:"#94a3b8"}}>{Math.min(totalSess,P1)} / {P1} sessions</span>
                  <span style={{fontSize:11,color:"#f97316",fontWeight:700}}>{p1Pct.toFixed(1)}% · ETA Nov 2026</span>
                </div>
                <Bar pct={p1Pct} color="#f97316"/>
              </div>
              {exP1&&P1_TOPICS.map((t,i)=>(
                <div key={i} style={{...s.row,display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                  <span style={{fontSize:12,color:"#e2e8f0",fontWeight:600}}>{t.name}</span>
                  <div style={{display:"flex",gap:6}}>
                    <span style={{fontSize:10,padding:"2px 8px",borderRadius:4,background:"#f9731615",color:"#f97316",border:"1px solid #f9731630"}}>{t.sessions}s</span>
                    <span style={{fontSize:10,padding:"2px 8px",borderRadius:4,background:"#38bdf815",color:"#38bdf8",border:"1px solid #38bdf830"}}>{t.sheet}q</span>
                  </div>
                </div>
              ))}
            </div>

            {/* Phase 2 */}
            <div style={{...s.card,border:"1px solid #a78bfa22",marginBottom:10}}>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:10}}>
                <div style={{display:"flex",gap:8,alignItems:"center"}}>
                  <Badge text="Phase 2" color="#a78bfa"/>
                  <span style={{fontSize:13,fontWeight:700,color:"#f1f5f9"}}>Remaining 80%</span>
                </div>
                <button onClick={()=>setExP2(!exP2)} style={{fontSize:10,padding:"3px 10px",borderRadius:6,
                  border:"1px solid #a78bfa40",background:"transparent",color:"#a78bfa",cursor:"pointer",fontFamily:"inherit"}}>
                  {exP2?"▲ hide":"▼ show"}
                </button>
              </div>
              <div style={{marginBottom:exP2?12:0}}>
                <div style={{display:"flex",justifyContent:"space-between",marginBottom:5}}>
                  <span style={{fontSize:11,color:"#94a3b8"}}>{Math.max(0,totalSess-P1)} / {P2} sessions</span>
                  <span style={{fontSize:11,color:"#a78bfa",fontWeight:700}}>{p2Pct.toFixed(1)}% · ETA May 2027</span>
                </div>
                <Bar pct={p2Pct} color="#a78bfa"/>
              </div>
              {exP2&&P2_TOPICS.map((t,i)=>(
                <div key={i} style={{...s.row,display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                  <span style={{fontSize:12,color:"#e2e8f0",fontWeight:600}}>{t.name}</span>
                  <div style={{display:"flex",gap:6}}>
                    <span style={{fontSize:10,padding:"2px 8px",borderRadius:4,background:"#a78bfa15",color:"#a78bfa",border:"1px solid #a78bfa30"}}>{t.sessions}s</span>
                    <span style={{fontSize:10,padding:"2px 8px",borderRadius:4,background:"#f472b615",color:"#f472b6",border:"1px solid #f472b630"}}>{t.sheet}q</span>
                  </div>
                </div>
              ))}
            </div>

            {/* Daily targets */}
            <div style={s.card}>
              <div style={s.sub}>DAILY SESSION TARGETS</div>
              {[
                {p:"Normal sem day",sess:2,color:"#38bdf8"},
                {p:"Exam period",sess:1,color:"#f59e0b"},
                {p:"Summer break 🔥",sess:4,color:"#f97316"},
              ].map((x,i)=>(
                <div key={i} style={{...s.row,display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                  <span style={{fontSize:12,color:"#94a3b8"}}>{x.p}</span>
                  <span style={{fontSize:12,fontWeight:700,color:x.color}}>{x.sess} sessions/day</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ══ TAB 3: MERN STACK ═══════════════════════════════════════════════ */}
        {tab===3&&(
          <div>
            {/* Overview */}
            <div style={{...s.card,marginBottom:12}}>
              <div style={s.sub}>MERN OVERVIEW</div>
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:8,marginBottom:10}}>
                {[
                  {label:"Done",val:`${mernDone}h`,color:"#34d399"},
                  {label:"Left",val:`${MERN_TOTAL-mernDone}h`,color:"#64648a"},
                  {label:"Progress",val:`${mernPct.toFixed(0)}%`,color:"#818cf8"},
                ].map((x,i)=>(
                  <div key={i} style={{padding:"10px",background:"#080810",borderRadius:10,border:"1px solid #1e1e3f",textAlign:"center"}}>
                    <div style={{fontSize:9,color:"#404068",textTransform:"uppercase",letterSpacing:"0.1em",marginBottom:3}}>{x.label}</div>
                    <div style={{fontSize:20,fontWeight:900,color:x.color}}>{x.val}</div>
                  </div>
                ))}
              </div>
              <Bar pct={mernPct} color="#34d399"/>
            </div>

            {/* Weekend note */}
            <div style={{background:"#0c1a2e",border:"1px solid #38bdf822",borderRadius:12,padding:13,marginBottom:12}}>
              <div style={{fontSize:10,color:"#38bdf8",fontWeight:700,marginBottom:5}}>📌 WEEKEND SCHEDULE</div>
              <p style={{fontSize:12,color:"#94a3b8",lineHeight:1.6,margin:0}}>
                <strong style={{color:"#f1f5f9"}}>Sat+Sun</strong> = 5h MERN + 1h DSA revision.
                Rule: <strong style={{color:"#f1f5f9"}}>1h watch → 1h build</strong>. Never just watch.
              </p>
            </div>

            {/* Module cards with +/- buttons */}
            {MERN_MODS.map(m=>{
              const done=mernMod[m.id]||0;
              const pct=Math.min(done/m.hrs*100,100);
              return(
                <div key={m.id} style={{...s.card,border:`1px solid ${m.color}22`,marginBottom:10}}>
                  <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:10}}>
                    <div style={{display:"flex",gap:8,alignItems:"center"}}>
                      <span style={{fontSize:18}}>{m.icon}</span>
                      <div>
                        <div style={{fontSize:13,fontWeight:700,color:"#f1f5f9"}}>{m.label}</div>
                        <div style={{fontSize:10,color:"#64648a"}}>{done}/{m.hrs} hrs done</div>
                      </div>
                    </div>
                    {/* +/- controls */}
                    <div style={{display:"flex",alignItems:"center",gap:6}}>
                      <button onClick={()=>adjMern(m.id,-1)}
                        disabled={done<=0}
                        style={{width:28,height:28,borderRadius:7,border:`1px solid ${m.color}40`,
                          background:"#080810",color:m.color,fontSize:16,cursor:done>0?"pointer":"not-allowed",
                          fontFamily:"inherit",display:"flex",alignItems:"center",justifyContent:"center",
                          opacity:done<=0?0.3:1}}>−</button>
                      <span style={{fontSize:14,fontWeight:900,color:m.color,minWidth:24,textAlign:"center"}}>{done}</span>
                      <button onClick={()=>adjMern(m.id,1)}
                        disabled={done>=m.hrs}
                        style={{width:28,height:28,borderRadius:7,border:`1px solid ${m.color}40`,
                          background:"#080810",color:m.color,fontSize:16,cursor:done<m.hrs?"pointer":"not-allowed",
                          fontFamily:"inherit",display:"flex",alignItems:"center",justifyContent:"center",
                          opacity:done>=m.hrs?0.3:1}}>+</button>
                    </div>
                  </div>
                  <Bar pct={pct} color={m.color}/>
                  {done>=m.hrs&&(
                    <div style={{fontSize:10,color:"#4ade80",marginTop:5}}>✅ Complete!</div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* ══ TAB 4: MILESTONES ═══════════════════════════════════════════════ */}
        {tab===4&&(
          <div>
            <div style={{...s.card,marginBottom:12}}>
              <div style={{fontSize:12,color:"#64648a",lineHeight:1.8}}>
                Apr 2026 → Phase 1 start<br/>
                Nov 2026 → Phase 1 done<br/>
                May 2027 → Phase 2 + MERN + Projects done<br/>
                <span style={{color:"#4ade80",fontWeight:700}}>Jul 2027 → 20–30 LPA OFFER 🏆</span>
              </div>
            </div>

            {MILESTONES.map((m,i)=>(
              <div key={i} style={{display:"flex",gap:12,marginBottom:5}}>
                <div style={{display:"flex",flexDirection:"column",alignItems:"center",flexShrink:0}}>
                  <div style={{width:12,height:12,borderRadius:"50%",background:m.color,
                    border:`2px solid ${m.color}`,boxShadow:`0 0 8px ${m.color}60`,marginTop:5,flexShrink:0}}/>
                  {i<MILESTONES.length-1&&(
                    <div style={{width:2,flex:1,background:"#1e1e3f",minHeight:20,marginTop:2}}/>
                  )}
                </div>
                <div style={{...s.card,flex:1,marginBottom:8,border:`1px solid ${m.color}22`}}>
                  <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:4}}>
                    <span style={{fontSize:13,fontWeight:700,color:"#f1f5f9"}}>{m.event}</span>
                    <span style={{fontSize:10,fontWeight:700,color:m.color}}>{m.date}</span>
                  </div>
                  <Badge text={m.phase} color={m.color}/>
                </div>
              </div>
            ))}

            <div style={{background:"linear-gradient(135deg,#0c2a0c,#080f08)",
              border:"1px solid #4ade8044",borderRadius:12,padding:16,textAlign:"center",marginTop:8}}>
              <div style={{fontSize:26,marginBottom:6}}>🏆</div>
              <div style={{fontSize:16,fontWeight:900,color:"#4ade80",marginBottom:4}}>20–30 LPA SDE-1 Offer</div>
              <div style={{fontSize:11,color:"#64648a",marginBottom:10}}>Atlassian · Adobe · Razorpay · PhonePe · CRED</div>
              <div style={{fontSize:11,color:"#94a3b8",lineHeight:1.7,padding:"10px 12px",
                background:"#080810",borderRadius:8,border:"1px solid #1e1e3f"}}>
                Kumar K referral + strong DSA + 2 live projects = offer 🎯
              </div>
            </div>
          </div>
        )}

        {/* Footer */}
        <div style={{marginTop:14,padding:12,...s.card,textAlign:"center"}}>
          <div style={{fontSize:10,color:"#404068",lineHeight:1.9}}>
            <span style={{color:"#38bdf8"}}>Weekdays</span> = DSA only (2 sessions) ·
            <span style={{color:"#818cf8"}}> Weekends</span> = Web Dev (5 hrs) + revision ·
            <span style={{color:"#f97316"}}> Summer</span> = 4 sessions/day
          </div>
        </div>
      </div>
    </div>
  );
}