/* Crucible — cinematic schematic pipeline (one continuous camera move).
   Reads Stage/useTime from window (animations.jsx loaded first). */
const { Stage, useTime } = window;

/* ---------- palette ---------- */
const BG='#FFFFFF', INK='#0B1F39';
const LINE='rgba(11,31,57,0.80)', LINE_MUT='rgba(11,31,57,0.42)', CONN='rgba(11,31,57,0.32)';
const GRID='rgba(11,31,57,0.07)', MUTED='rgba(11,31,57,0.55)', FAINT='rgba(11,31,57,0.40)';
const TEAL='#E8A020';
const MONO="'JetBrains Mono', ui-monospace, monospace";

/* ---------- math ---------- */
const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
function cubic(P,t){const u=1-t;return{
  x:u*u*u*P.p0.x+3*u*u*t*P.c1.x+3*u*t*t*P.c2.x+t*t*t*P.p3.x,
  y:u*u*u*P.p0.y+3*u*u*t*P.c1.y+3*u*t*t*P.c2.y+t*t*t*P.p3.y};}
function bez(p0,c1,c2,p3){return{p0,c1,c2,p3,
  d:`M${p0.x} ${p0.y} C ${c1.x} ${c1.y} ${c2.x} ${c2.y} ${p3.x} ${p3.y}`,
  at:t=>cubic({p0,c1,c2,p3},t)};}
function hex(h){return[parseInt(h.slice(1,3),16),parseInt(h.slice(3,5),16),parseInt(h.slice(5,7),16)];}
function lerpColor(a,b,t){const A=hex(a),B=hex(b);
  return '#'+A.map((v,i)=>clamp(Math.round(v+(B[i]-v)*t),0,255).toString(16).padStart(2,'0')).join('');}
const easeQ=t=>t<0.5?16*t*t*t*t*t:1-Math.pow(-2*t+2,5)/2;           // inOutQuint
const easeC=t=>t<0.5?4*t*t*t:1-Math.pow(-2*t+2,3)/2;                 // inOutCubic
const backOut=t=>{const c1=1.70158,c3=c1+1;return 1+c3*Math.pow(t-1,3)+c1*Math.pow(t-1,2);};
const fract=x=>((x%1)+1)%1;
function wrap(str,max){const w=String(str).split(/\s+/);let a='',b='';
  for(const x of w){if(!b&&(a?a+' '+x:x).length<=max)a=a?a+' '+x:x;else b=b?b+' '+x:x;}
  return b?[a,b]:[a];}

/* ---------- geometry ---------- */
const CY=540, FUNNEL={x:498,y:CY};
const SOURCES=[
  {x:150,y:272,type:'db',label:'DATABASES'},{x:318,y:220,type:'api',label:'APIs'},
  {x:108,y:452,type:'doc',label:'FILES'},{x:340,y:416,type:'geo',label:'GEOSPATIAL'},
  {x:172,y:636,type:'iot',label:'IoT'},{x:372,y:606,type:'cam',label:'VISUAL'},
  {x:250,y:792,type:'drone',label:'DRONE'},
];
const DEFAULTS={
  title:'CRUCIBLE',tagline:'SEVEN SIGNALS · ONE SYSTEM · AUTONOMOUS ACTION',
  c1Title:'METADATA MGMT',c1Sub:'Integrating multi-source data.',
  c2Title:'VALIDATION',c2Sub:'Complex mapping & integrity checks.',
  c3Title:'CONTEXTUAL',c3Sub:'Industry intelligence layer.',
  c4Title:'AGENTIC ARCH.',c4Sub:'Autonomous action, not just reports.',
  accentColor:TEAL,loopDuration:12,ambientOnly:false,
};
function buildCards(p){return[
  {x:520,y:435,w:190,h:210,num:'01',title:p.c1Title||DEFAULTS.c1Title,sub:wrap(p.c1Sub||DEFAULTS.c1Sub,22),rows:['SCHEMA MAP','DEDUPLICATE','LINEAGE'],accent:false},
  {x:800,y:435,w:190,h:210,num:'02',title:p.c2Title||DEFAULTS.c2Title,sub:wrap(p.c2Sub||DEFAULTS.c2Sub,22),rows:['FIELD MAPPING','CONSTRAINTS','INTEGRITY'],checks:true,accent:false},
  {x:1080,y:423,w:210,h:234,num:'03',title:p.c3Title||DEFAULTS.c3Title,sub:wrap(p.c3Sub||DEFAULTS.c3Sub,24),rows:['INDUSTRY MODEL','ENRICHMENT','INFERENCE'],accent:false},
  {x:1380,y:435,w:230,h:210,num:'04',title:p.c4Title||DEFAULTS.c4Title,sub:wrap(p.c4Sub||DEFAULTS.c4Sub,26),rows:['EXECUTE','TRIGGER','ORCHESTRATE'],accent:true},
];}
const FUNNEL_BEZ=SOURCES.map(s=>bez({x:s.x+20,y:s.y},{x:s.x+140,y:s.y},{x:FUNNEL.x-120,y:FUNNEL.y},{x:FUNNEL.x,y:FUNNEL.y}));
const conn=(x0,x1)=>bez({x:x0,y:CY},{x:x0+42,y:CY-16},{x:x1-42,y:CY+16},{x:x1,y:CY});
const CONN_BEZ=[
  bez({x:FUNNEL.x,y:CY},{x:FUNNEL.x+8,y:CY},{x:512,y:CY},{x:520,y:CY}),
  conn(710,800),conn(990,1080),conn(1290,1380),
];
const AGENT_OUT={x:1610,y:CY};
const ACTIONS=[
  {x:1720,y:422,type:'exec',label:'EXECUTE'},
  {x:1775,y:545,type:'branch',label:'WORKFLOW'},
  {x:1720,y:668,type:'check',label:'DISPATCH'},
];
const FAN_BEZ=ACTIONS.map(a=>bez(AGENT_OUT,{x:AGENT_OUT.x+55,y:CY},{x:a.x-48,y:a.y},{x:a.x,y:a.y}));

/* ---------- camera keyframes (fraction of loop) ---------- */
const CAM=[
  {t:0.000,x:255,y:505,z:2.05},
  {t:0.155,x:305,y:520,z:1.42},
  {t:0.215,x:618,y:540,z:2.25},
  {t:0.315,x:618,y:540,z:2.25},
  {t:0.355,x:898,y:540,z:2.25},
  {t:0.450,x:898,y:540,z:2.25},
  {t:0.490,x:1188,y:540,z:2.12},
  {t:0.585,x:1188,y:540,z:2.12},
  {t:0.635,x:1500,y:540,z:1.95},
  {t:0.700,x:1585,y:540,z:1.62},
  {t:0.820,x:1585,y:540,z:1.62},
  {t:0.900,x:960,y:540,z:1.00},
  {t:1.000,x:960,y:540,z:1.00},
];
function camAt(p){
  for(let i=0;i<CAM.length-1;i++){
    const a=CAM[i],b=CAM[i+1];
    if(p>=a.t&&p<=b.t){
      const k=b.t===a.t?0:easeQ((p-a.t)/(b.t-a.t));
      return{x:a.x+(b.x-a.x)*k,y:a.y+(b.y-a.y)*k,z:a.z+(b.z-a.z)*k};
    }
  }
  return CAM[CAM.length-1];
}
const camT=(c,d)=>{ // d = parallax damping (1 = full)
  const x=960+(c.x-960)*d, y=540+(c.y-540)*d, z=1+(c.z-1)*d;
  return `translate(960 540) scale(${z}) translate(${-x} ${-y})`;
};

/* ---------- perspective grid ---------- */
function Grid(){
  const VP={x:770,y:512},lines=[];
  for(let x=-140;x<=720;x+=58)lines.push([x,1060,VP.x,VP.y]);
  for(let y=300;y<=1010;y+=66)lines.push([-100,y,VP.x,VP.y]);
  [1050,958,878,808,748,698,658,626,600].forEach(y=>lines.push([-100,y,546,y]));
  return(<g clipPath="url(#gridClip)">
    {lines.map((l,i)=><line key={i} x1={l[0]} y1={l[1]} x2={l[2]} y2={l[3]} stroke={GRID} strokeWidth="1"/>)}
  </g>);
}

/* ---------- source icons (48x48 local) ---------- */
function Icon({type}){
  const s={fill:'none',stroke:LINE,strokeWidth:1.6,strokeLinecap:'round',strokeLinejoin:'round'};
  switch(type){
    case 'db':return(<g {...s}><ellipse cx="24" cy="11" rx="15" ry="5.5"/><path d="M9 11 V37"/><path d="M39 11 V37"/><path d="M9 24 A15 5.5 0 0 0 39 24"/><path d="M9 37 A15 5.5 0 0 0 39 37"/></g>);
    case 'api':return(<g {...s}><path d="M18 12 L8 24 L18 36"/><path d="M30 12 L40 24 L30 36"/><path d="M27 11 L21 37"/></g>);
    case 'doc':return(<g {...s}><path d="M12 7 H30 L37 15 V41 H12 Z"/><path d="M30 7 V15 H37"/><path d="M16 22 H32"/><path d="M16 28 H32"/><path d="M16 34 H26"/></g>);
    case 'geo':return(<g {...s}><path d="M24 6 C15.5 6 11 12 11 19 C11 28 24 43 24 43 C24 43 37 28 37 19 C37 12 32.5 6 24 6 Z"/><circle cx="24" cy="19" r="5"/></g>);
    case 'iot':return(<g {...s}><rect x="13" y="13" width="22" height="22" rx="2"/><rect x="19" y="19" width="10" height="10"/><path d="M18 13 V8"/><path d="M24 13 V8"/><path d="M30 13 V8"/><path d="M18 35 V40"/><path d="M24 35 V40"/><path d="M30 35 V40"/><path d="M13 18 H8"/><path d="M13 24 H8"/><path d="M13 30 H8"/><path d="M35 18 H40"/><path d="M35 24 H40"/><path d="M35 30 H40"/></g>);
    case 'cam':return(<g {...s}><path d="M8 17 H40 V37 H8 Z"/><path d="M17 17 L20 11 H30 L33 17"/><circle cx="24" cy="27" r="6.5"/><circle cx="35" cy="21" r="1"/></g>);
    case 'drone':return(<g {...s}><rect x="18" y="18" width="12" height="12" rx="2"/><circle cx="10" cy="11" r="5"/><circle cx="38" cy="11" r="5"/><circle cx="10" cy="37" r="5"/><circle cx="38" cy="37" r="5"/><path d="M19 19 L13 13"/><path d="M29 19 L35 13"/><path d="M19 29 L13 35"/><path d="M29 29 L35 35"/></g>);
    default:return null;
  }
}
function ActionIcon({type,color}){
  const s={fill:'none',stroke:color,strokeWidth:1.7,strokeLinecap:'round',strokeLinejoin:'round'};
  switch(type){
    case 'exec':return(<g {...s}><circle cx="22" cy="22" r="16"/><path d="M18 15 L30 22 L18 29 Z" fill={color} stroke="none"/></g>);
    case 'branch':return(<g {...s}><circle cx="10" cy="22" r="5"/><circle cx="34" cy="10" r="5"/><circle cx="34" cy="34" r="5"/><path d="M15 22 H24 V10 H29"/><path d="M24 22 V34 H29"/></g>);
    case 'check':return(<g {...s}><rect x="6" y="8" width="32" height="28" rx="2"/><path d="M13 22 L20 29 L32 15"/></g>);
    default:return null;
  }
}

/* ---------- drawing line (self-tracing path) ---------- */
function DrawPath({P,k,stroke,width,head,headColor}){
  if(k<=0)return null;
  const kk=easeC(k);
  const h=P.at(kk);
  return(<g>
    <path d={P.d} fill="none" stroke={stroke} strokeWidth={width} pathLength="100"
          strokeDasharray="100" strokeDashoffset={100*(1-kk)}/>
    {head&&k<1&&<circle cx={h.x} cy={h.y} r="3" fill={headColor||INK} opacity="0.85"/>}
  </g>);
}

/* ---------- ambient pulse ---------- */
function Pulse({P,t,r,color,opacity}){
  const trail=[0,-0.05,-0.10,-0.16];
  const head=P.at(clamp(t,0,1));
  return(<g>
    <circle cx={head.x} cy={head.y} r={r*2.6} fill={color} opacity={opacity*0.32} filter="url(#glow)"/>
    {trail.map((dt,i)=>{const q=P.at(clamp(t+dt,0,1));
      return <circle key={i} cx={q.x} cy={q.y} r={r*(1-i*0.24)} fill={color} opacity={opacity*(1-i*0.24)}/>;})}
    <circle cx={head.x} cy={head.y} r={r*0.55} fill="#FFFFFF" opacity={opacity*0.9}/>
  </g>);
}
const edgeFade=t=>clamp(Math.min(t/0.18,(1-t)/0.18),0,1);

/* ---------- card with reveal ---------- */
function Card({c,k,glow,accent}){
  if(k<=0)return null;
  const stroke=c.accent?accent:LINE;
  const borderK=clamp(k/0.4,0,1);
  const eyebrowO=clamp((k-0.2)/0.15,0,1);
  const titleK=clamp((k-0.3)/0.3,0,1);
  const chars=Math.round(titleK*c.title.length);
  const divK=clamp((k-0.45)/0.15,0,1);
  const subO=clamp((k-0.55)/0.2,0,1);
  const per=100;
  return(<g>
    {c.accent&&glow>0&&(<g>
      <rect x={c.x-6} y={c.y-6} width={c.w+12} height={c.h+12} rx="3" fill="none" stroke={accent} strokeWidth="1" opacity={0.28+glow*0.5}/>
      <rect x={c.x} y={c.y} width={c.w} height={c.h} rx="2" fill={accent} opacity={0.05+glow*0.10}/>
    </g>)}
    <rect x={c.x} y={c.y} width={c.w} height={c.h} rx="2" fill={c.accent?'none':BG} opacity={borderK>0.15?1:0}
          stroke={stroke} strokeWidth={c.accent?1.7:1.3} pathLength={per}
          strokeDasharray={per} strokeDashoffset={per*(1-easeC(borderK))}/>
    <text x={c.x+14} y={c.y+26} fontFamily={MONO} fontSize="9.5" letterSpacing="1.5" fill={MUTED} opacity={eyebrowO}>STAGE {c.num}</text>
    <text x={c.x+14} y={c.y+48} fontFamily={MONO} fontSize="15" fontWeight="600" letterSpacing="0.3" fill={c.accent?accent:INK}>
      {c.title.slice(0,chars)}{titleK>0&&titleK<1?'▎':''}
    </text>
    {divK>0&&<line x1={c.x+14} y1={c.y+60} x2={c.x+14+(c.w-28)*easeC(divK)} y2={c.y+60}
      stroke={c.accent?accent:LINE_MUT} strokeWidth="1" opacity={c.accent?0.6:1}/>}
    {c.sub.map((ln,i)=>(
      <text key={i} x={c.x+14} y={c.y+80+i*15} fontFamily={MONO} fontSize="10.5" fontStyle="italic" fill={MUTED} opacity={subO}>{ln}</text>
    ))}
    {c.rows.map((rw,i)=>{
      const rk=clamp((k-(0.6+i*0.13))/0.13,0,1);
      if(rk<=0)return null;
      const ry=c.y+122+i*27, dy=(1-easeC(rk))*7;
      return(<g key={i} opacity={rk} transform={`translate(0,${dy})`}>
        <rect x={c.x+15} y={ry-8} width="7" height="7" fill={rk<1?(c.accent?accent:INK):'none'}
              fillOpacity={rk<1?(1-rk)*0.5:0} stroke={c.accent?accent:MUTED} strokeWidth="1.2"/>
        {c.checks&&<path d={`M${c.x+16.5} ${ry-4.5} l1.8 1.9 l3.4 -4`} fill="none" stroke={INK} strokeWidth="1.3" strokeLinecap="round" pathLength="10" strokeDasharray="10" strokeDashoffset={10*(1-rk)}/>}
        <text x={c.x+30} y={ry} fontFamily={MONO} fontSize="11" letterSpacing="0.4" fill={c.accent?INK:'rgba(11,31,57,0.72)'}>{rw}</text>
      </g>);
    })}
  </g>);
}

/* ---------- HUD progress rule ---------- */
const TICKS=[['SOURCES',0.0],['METADATA',0.215],['VALIDATION',0.355],['CONTEXT',0.49],['AGENTIC',0.635],['RESOLVE',0.9]];
function Hud({p,title,tagline,accent}){
  const x0=120,x1=1800,W=x1-x0;
  return(<g>
    <text x="60" y="90" fontFamily={MONO} fontSize="20" fontWeight="600" letterSpacing="5" fill={INK}>{title}</text>
    <text x="60" y="112" fontFamily={MONO} fontSize="11" letterSpacing="1.5" fill={MUTED}>{tagline}</text>
    <line x1={x0} y1="1024" x2={x1} y2="1024" stroke={LINE_MUT} strokeWidth="1"/>
    <line x1={x0} y1="1024" x2={x0+W*p} y2="1024" stroke={accent} strokeWidth="1.5"/>
    {TICKS.map(([lb,tt],i)=>(<g key={i}>
      <line x1={x0+W*tt} y1="1020" x2={x0+W*tt} y2="1028" stroke={p>=tt?accent:LINE_MUT} strokeWidth="1"/>
      <text x={x0+W*tt} y="1046" textAnchor={i===0?'start':i===TICKS.length-1?'end':'middle'} fontFamily={MONO} fontSize="8.5" letterSpacing="1.5" fill={p>=tt?INK:FAINT}>{lb}</text>
    </g>))}
    <circle cx={x0+W*p} cy="1024" r="3" fill={accent}/>
  </g>);
}

/* ---------- diagram ---------- */
function Diagram(props){
  const p0=props||{};
  const accent=p0.accentColor||DEFAULTS.accentColor;
  const accentBright=lerpColor(accent,'#FFFFFF',0.28);
  const amb=p0.ambientOnly===true||p0.ambientOnly==='true';
  const DUR=Number(p0.loopDuration)>0?Number(p0.loopDuration):DEFAULTS.loopDuration;
  const CARDS=buildCards(p0);
  const t=useTime();
  const p=amb?1:fract(t/DUR);
  const stage=p<0.355?0:p<0.635?1:2;
  if(!amb&&window.__crucibleStage!==stage){
    window.__crucibleStage=stage;
    window.dispatchEvent(new CustomEvent('crucible-stage',{detail:stage}));
  }
  const act=(a,b)=>amb?1:clamp((p-a)/(b-a),0,1);

  const kSrcAll=act(0.02,0.155);
  const kSrc=SOURCES.map((_,i)=>act(0.02+i*0.012,0.07+i*0.012));
  const kFunnel=SOURCES.map((_,i)=>act(0.05+i*0.011,0.15+i*0.011));
  const kConn=[act(0.165,0.212),act(0.315,0.353),act(0.452,0.488),act(0.585,0.632)];
  const kCard=[act(0.208,0.315),act(0.348,0.45),act(0.482,0.585),act(0.618,0.70)];
  const charge=act(0.70,0.748), fire=act(0.748,0.81);
  const kFan=FAN_BEZ.map((_,i)=>act(0.748+i*0.014,0.792+i*0.014));
  const kAct=ACTIONS.map((_,i)=>act(0.762+i*0.016,0.812+i*0.016));

  let agGlow=0;
  if(amb||p>0.81)agGlow=0.5+0.25*Math.sin(t*2.4);
  else if(charge>0)agGlow=charge*(0.35+0.3*Math.sin(t*22));
  agGlow=clamp(agGlow,0,1);
  const actLit=amb?0.85:(p>0.81?0.85+0.15*Math.sin(t*2.4):0);

  const cam=amb?{x:960,y:540,z:1}:camAt(p);
  const overlay=amb?0:clamp((p-0.975)/0.025,0,1)+clamp((0.02-p)/0.02,0,1);

  /* ambient flow pulses: run on each segment once it exists */
  const pulses=[];
  const cyc=1.7;
  if(kSrcAll>=1)FUNNEL_BEZ.forEach((P,i)=>{
    const tt=fract(t/cyc+i*0.14);
    pulses.push(<Pulse key={'f'+i} P={P} t={tt} r={3.4} color={lerpColor('#5B7192',accent,0.05)} opacity={edgeFade(tt)*0.9}/>);
  });
  CONN_BEZ.forEach((P,i)=>{
    if(i===0)return;
    if(kCard[i]>=1||kConn[i]>=1){
      const tt=fract(t/(cyc*0.7)+i*0.31);
      pulses.push(<Pulse key={'c'+i} P={P} t={tt} r={4.4+i*0.5} color={lerpColor('#5B7192',accent,0.2+i*0.22)} opacity={edgeFade(tt)}/>);
    }
  });
  if(amb||p>0.81)FAN_BEZ.forEach((P,i)=>{
    const tt=fract(t/(cyc*0.65)+i*0.29);
    pulses.push(<Pulse key={'a'+i} P={P} t={tt} r={4.8} color={accentBright} opacity={edgeFade(tt)}/>);
  });

  return(
    <svg width="1920" height="1080" viewBox="0 0 1920 1080" style={{position:'absolute',inset:0}}>
      <defs>
        <clipPath id="gridClip"><rect x="-120" y="250" width="666" height="820"/></clipPath>
        <filter id="glow" x="-120%" y="-120%" width="340%" height="340%"><feGaussianBlur stdDeviation="4"/></filter>
      </defs>

      <g transform={camT(cam,0.8)}><Grid/></g>

      <g transform={camT(cam,1)}>
        <text x="60" y="176" fontFamily={MONO} fontSize="10.5" letterSpacing="2" fill={FAINT} opacity={kSrcAll}>SOURCES / 07</text>

        {FUNNEL_BEZ.map((P,i)=><DrawPath key={'fd'+i} P={P} k={kFunnel[i]} stroke={CONN} width={1} head headColor={INK}/>)}
        {CONN_BEZ.map((P,i)=><DrawPath key={'cd'+i} P={P} k={kConn[i]} stroke={LINE_MUT} width={1.2} head headColor={INK}/>)}
        {FAN_BEZ.map((P,i)=><DrawPath key={'ad'+i} P={P} k={kFan[i]} stroke={actLit>0?lerpColor('#8FA0B8',accent,actLit):'#8FA0B8'} width={1.2} head headColor={accent}/>)}

        <g opacity={kConn[0]}>
          <rect x={FUNNEL.x-4} y={FUNNEL.y-4} width="8" height="8" fill={BG} stroke={LINE_MUT} strokeWidth="1.1"/>
        </g>

        {SOURCES.map((sc,i)=>(
          <g key={i} opacity={kSrc[i]} transform={`translate(0,${(1-easeC(kSrc[i]))*10})`}>
            <g transform={`translate(${sc.x-24},${sc.y-24})`}><Icon type={sc.type}/></g>
            <text x={sc.x} y={sc.y+40} textAnchor="middle" fontFamily={MONO} fontSize="9.5" letterSpacing="1" fill={MUTED}>{sc.label}</text>
          </g>
        ))}

        {CARDS.map((c,i)=><Card key={i} c={c} k={amb?1:kCard[i]} glow={c.accent?agGlow:0} accent={accent}/>)}

        {pulses}

        {ACTIONS.map((a,i)=>{
          const k=kAct[i];
          if(k<=0)return null;
          const s=backOut(easeC(k));
          const col=lerpColor(INK,accentBright,actLit);
          return(<g key={i} opacity={clamp(k*2,0,1)} transform={`translate(${a.x+22},${a.y+22}) scale(${s}) translate(-22,-22)`}>
            {actLit>0&&<circle cx="22" cy="22" r="22" fill={accent} opacity={actLit*0.16} filter="url(#glow)"/>}
            <ActionIcon type={a.type} color={col}/>
            <text x="22" y="60" textAnchor="middle" fontFamily={MONO} fontSize="9.5" letterSpacing="1.5" fill={actLit>0.3?accent:MUTED}>{a.label}</text>
          </g>);
        })}
        <text x={1837} y={CY-118} textAnchor="middle" fontFamily={MONO} fontSize="10" letterSpacing="2" fill={FAINT} opacity={kAct[0]}>ACTIONS</text>
      </g>

      <Hud p={amb?fract(t/DUR):p} title={p0.title||DEFAULTS.title} tagline={p0.tagline||DEFAULTS.tagline} accent={accent}/>
      {overlay>0&&<rect x="0" y="0" width="1920" height="1080" fill={BG} opacity={clamp(overlay,0,1)}/>}
    </svg>
  );
}

function CrucibleScene(props){
  const dur=Number(props&&props.loopDuration)>0?Number(props.loopDuration):DEFAULTS.loopDuration;
  return(
    <Stage width={1920} height={1080} duration={dur} loop background={BG}>
      <Diagram {...props}/>
    </Stage>
  );
}
window.CrucibleScene=CrucibleScene;
