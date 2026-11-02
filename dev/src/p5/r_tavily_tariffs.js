/* =====================================================================
   v1.18 WEB DATA · phase 4 — Tavily AI + Firecrawl v2 Search + Exa AI Tri-Engine
   پایش و استخراج مستمر هزینه‌ها و تعرفه‌های حمل‌ونقل بین‌المللی (دریایی، جاده‌ای TIR، ریلی، هوایی، مرزی، سورشارژها و گمرک/اوراسیا)
   ===================================================================== */
db.exec(`CREATE TABLE IF NOT EXISTS web_tariffs(id INTEGER PRIMARY KEY AUTOINCREMENT,mode TEXT,corridor TEXT,pol TEXT,pod TEXT,eq TEXT,low REAL,typical REAL,high REAL,cur TEXT DEFAULT 'USD',unit TEXT,transit_days INTEGER,surcharges TEXT,engines TEXT,agree INTEGER DEFAULT 0,conf TEXT,summary TEXT,quotes TEXT,sources TEXT,usd REAL DEFAULT 0,ts INTEGER,by TEXT);
CREATE INDEX IF NOT EXISTS ix_wtf_lane ON web_tariffs(mode,pol,pod,ts);`);
Object.assign(WB0,{tvCredit:0.008,tariffEvery:12});

/* --- Router helper to replace or register routes cleanly --- */
const httpRouteSet=(m,p,f,perm)=>{const re=new RegExp('^'+p.replace(/:(\w+)/g,'(?<$1>[^/]+)')+'$');const idx=R.findIndex(r=>r.m===m&&r.re.source===re.source);if(idx>=0)R[idx]={m,re,f,perm};else R.push({m,re,f,perm})};

/* --- 1) Tavily AI Search & Firecrawl v2 Search helpers --- */
async function tavilySearch(o,by,op){
 const depth=o.depth||'advanced';
 const b={query:String(o.query||'').slice(0,400),search_depth:depth,max_results:Math.min(o.n||8,20),include_answer:o.answer===false?false:'advanced',include_raw_content:!!o.raw};
 if(o.topic)b.topic=o.topic;if(o.days)b.days=+o.days;if(Array.isArray(o.include)&&o.include.length)b.include_domains=o.include;if(Array.isArray(o.exclude)&&o.exclude.length)b.exclude_domains=o.exclude;
 const est=o.est||((depth==='advanced'?2:1)*(wbCfg().tvCredit||0.008));
 return wbCall('tv',op||'search','/search',{body:b,est,timeout:o.timeout||60e3},by,o.query);
}
async function fcSearch(o,by,op){
 const b={query:String(o.query||'').slice(0,400),limit:Math.min(o.n||6,15)};
 if(o.tbs)b.tbs=o.tbs;if(o.scrape)b.scrapeOptions={formats:['markdown'],onlyMainContent:true};
 const j=await wbCall('fc',op||'search','/v2/search',{body:b,est:o.est||0.004,timeout:o.timeout||60e3},by,o.query);
 const raw=(j.data&&(Array.isArray(j.data.web)?j.data.web:Array.isArray(j.data)?j.data:null))||(Array.isArray(j.results)?j.results:[]);
 const results=raw.map(r=>({url:r.url||'',title:wbClean(r.title||r.metadata?.title,160),description:wbClean(r.description||r.snippet||r.markdown,600),markdown:String(r.markdown||'').slice(0,4000)})).filter(r=>r.url);
 return {...j,results};
}

/* --- 2) Structured rate & surcharge extraction from unstructured search snippets/answers --- */
const WB_SUR_CODES=[
 ['BAF',/\b(BAF|bunker adjustment|سوخت دریایی)\b/i,'ضریب تعدیل سوخت دریایی (BAF)'],
 ['WRS',/\b(WRS|EWR|war risk|ریسک جنگ|حق بیمه جنگ)\b/i,'سرشارژ ریسک جنگ (WRS)'],
 ['PSS',/\b(PSS|peak season|فصل اوج)\b/i,'سرشارژ فصل اوج ترافیک (PSS)'],
 ['GRI',/\b(GRI|FAK increase|general rate increase|افزایش عمومی نرخ)\b/i,'افزایش عمومی نرخ خطوط (GRI)'],
 ['THC',/\b(THC|terminal handling|تخلیه و بارگیری|هزینه بندری)\b/i,'هزینه هندلینگ ترمینال و بندر (THC)'],
 ['EBS',/\b(EBS|emergency bunker)\b/i,'سرشارژ اضطراری سوخت (EBS)'],
 ['DEM',/\b(demurrage|detention|D&D|دموراژ|حق توقف کانتینر)\b/i,'دموراژ و حق توقف کانتینر (D&D)'],
 ['FSC',/\b(FSC|fuel surcharge|سرشارژ سوخت هوایی)\b/i,'سرشارژ سوخت (FSC)'],
 ['TIR',/\b(TIR carnet|کارنه تیر|پلمپ ترانزیت)\b/i,'هزینه کارنه تیر و ترانزیت (TIR)']
];
function wbParseRatesText(text,meta={}){
 const T=enDig(String(text||''));const quotes=[];const surcharges=[];
 const lo=meta.mode==='air'?1:meta.eq==='LCL'?10:80,hi=meta.mode==='air'?50:meta.eq==='LCL'?900:28000;
 const re=/(?:\$|USD\s*)(\d{1,3}(?:,\d{3})+|\d{2,5})(?:\s*[-–—to]+\s*(?:\$|USD\s*)?(\d{1,3}(?:,\d{3})+|\d{2,5}))?|\b(\d{1,3}(?:,\d{3})+|\d{2,5})\s*(?:USD|دلار)\b/gi;
 let m;
 while((m=re.exec(T))&&quotes.length<12){
  const v1=+(String(m[1]||m[3]||'').replace(/,/g,'')),v2=m[2]?+(String(m[2]).replace(/,/g,'')):null;
  const ctx=T.slice(Math.max(0,m.index-90),m.index+110);
  if(/million|billion|thousand|year\s+\d{4}|\b202[0-9]\b/i.test(m[0]))continue;
  let isSur=false;
  for(const [code,sre,faName] of WB_SUR_CODES){
   if(sre.test(ctx)&&v1>=5&&v1<=5000){
    if(!surcharges.some(s=>s.code===code))surcharges.push({code,name:faName,usd:v2?Math.round((v1+v2)/2):v1,raw:wbClean(ctx,140)});
    isSur=true;break;
   }
  }
  if(isSur)continue;
  const eqMatch=WBEQ(ctx)||meta.eq||'40HC';
  const val=v2&&v2>=lo&&v2<=hi?Math.round((v1+v2)/2):v1;
  if(val>=lo&&val<=hi){
   const dm=ctx.match(/(\d{1,2})\s*(?:[-–to]+\s*(\d{1,2})\s*)?(?:days?|روز)/i);
   const days=dm?(dm[2]?Math.round((+dm[1]+ +dm[2])/2):+dm[1]):null;
   quotes.push({usd:val,low:v2?Math.min(v1,v2):val,high:v2?Math.max(v1,v2):val,eq:eqMatch,transitDays:days&&days<=90?days:null,snippet:wbClean(ctx,160)});
  }
 }
 return {quotes,surcharges};
}

/* --- 3) Built-in 18 Iranian International Border Crossings & Corridors Matrix --- */
const WB_BORDERS_DEF=[
 {id:'IR-BAZ',name:'مرز بازرگان (ایران – ترکیه / Gürbulak)',country:'ترکیه',modes:['road'],corridor:'کریدور غرب و اروپا (E-90 / TIR)',tirUsd:145,borderFeeUsd:185,fuelDiffUsd:220,bogieUsd:0,avgQueueHours:36,status:'open',notes:'اصلی‌ترین مرز ترانزیت جاده‌ای ایران به ترکیه و اتحادیه اروپا؛ ایکس‌ری، باسکول و مابه‌التفاوت سوخت الزامی است.'},
 {id:'IR-RAZ',name:'مرز رازی (خوی – ترکیه / Kapıköy)',country:'ترکیه',modes:['rail','road'],corridor:'کریدور ریلی ایران – ترکیه – اروپا (دریاچه وان)',tirUsd:140,borderFeeUsd:150,fuelDiffUsd:190,bogieUsd:0,avgQueueHours:18,status:'open',notes:'مرز ریلی اصلی تبریز – وان – آنکارا با فری‌بوت دریاچه وان.'},
 {id:'IR-SRV',name:'مرز سرو (ارومیه – ترکیه / Esendere)',country:'ترکیه',modes:['road'],corridor:'کریدور جاده‌ای شمال‌غرب – ترکیه',tirUsd:145,borderFeeUsd:165,fuelDiffUsd:210,bogieUsd:0,avgQueueHours:24,status:'open',notes:'جایگزین مکمل بازرگان در زمان ازدحام کامیون‌ها.'},
 {id:'IR-SRK',name:'مرز سرخس (ایران – ترکمنستان)',country:'ترکمنستان',modes:['rail','road'],corridor:'کریدور شرقی و جاده ابریشم (آسیای میانه / چین / قزاقستان)',tirUsd:150,borderFeeUsd:210,fuelDiffUsd:180,bogieUsd:480,avgQueueHours:28,status:'open',notes:'تغییر عرض خط آهن از ۱۴۳۵ میلی‌متر (ایران) به ۱۵۲۰ میلی‌متر (CIS)؛ ایستگاه اصلی تعویض بوژی واگن‌ها.'},
 {id:'IR-INC',name:'مرز اینچه‌برون (گلستان – ترکمنستان / قزاقستان)',country:'ترکمنستان',modes:['rail','road'],corridor:'کریدور شمال–جنوب شرقی (INSTC East / چین–قزاقستان–ایران)',tirUsd:150,borderFeeUsd:195,fuelDiffUsd:175,bogieUsd:460,avgQueueHours:16,status:'open',notes:'مسیر مستقیم ریلی قزاقستان – ترکمنستان – ایران به بندرعباس.'},
 {id:'IR-LOT',name:'مرز لطف‌آباد (خراسان – ترکمنستان / آرتیق)',country:'ترکمنستان',modes:['road','rail'],corridor:'کریدور ترانزیت آسیای میانه و ازبکستان',tirUsd:150,borderFeeUsd:190,fuelDiffUsd:180,bogieUsd:470,avgQueueHours:22,status:'open',notes:'مرز پرتردد برای کامیون‌های ترانزیتی ازبکستان و تاجیکستان.'},
 {id:'IR-BAJ',name:'مرز باجگیران (قوچان – ترکمنستان / عشق‌آباد)',country:'ترکمنستان',modes:['road'],corridor:'کریدور مستقیم مشهد – عشق‌آباد',tirUsd:150,borderFeeUsd:180,fuelDiffUsd:170,bogieUsd:0,avgQueueHours:14,status:'open',notes:'نزدیک‌ترین مرز جاده‌ای به پایتخت ترکمنستان.'},
 {id:'IR-AST',name:'مرز آستارا (ایران – آذربایجان)',country:'آذربایجان',modes:['road','rail'],corridor:'کریدور شمال–جنوب غربی (INSTC West / روسیه و قفقاز)',tirUsd:145,borderFeeUsd:195,fuelDiffUsd:195,bogieUsd:490,avgQueueHours:32,status:'open',notes:'ترمینال ریلی آستارا و پایانه جاده‌ای کانتینرهای یخچالی و صادراتی به روسیه.'},
 {id:'IR-BIL',name:'مرز بیله‌سوار (اردبیل – آذربایجان)',country:'آذربایجان',modes:['road'],corridor:'کریدور شمال–جنوب غربی (مکمل آستارا)',tirUsd:145,borderFeeUsd:185,fuelDiffUsd:190,bogieUsd:0,avgQueueHours:26,status:'open',notes:'گذرگاه جایگزین ترانزیت جاده‌ای به باکو و داغستان روسیه.'},
 {id:'IR-JOL',name:'مرز جلفا (آذربایجان شرقی – نخجوان)',country:'نخجوان/قفقاز',modes:['rail','road'],corridor:'کریدور قفقاز و منطقه آزاد ارس',tirUsd:140,borderFeeUsd:160,fuelDiffUsd:165,bogieUsd:450,avgQueueHours:12,status:'open',notes:'مجهز به امکانات تعویض بوژی ریلی و گمرک تخصصی منطقه آزاد ارس.'},
 {id:'IR-NRD',name:'مرز نوردوز (ایران – ارمنستان / Agarak)',country:'ارمنستان',modes:['road'],corridor:'کریدور خلیج فارس – دریای سیاه و اتحادیه اوراسیا (EAEU)',tirUsd:145,borderFeeUsd:175,fuelDiffUsd:185,bogieUsd:0,avgQueueHours:20,status:'open',notes:'تنها مرز زمینی مستقیم ایران با کشور عضو اتحادیه اقتصادی اوراسیا (EAEU).'},
 {id:'IR-PRV',name:'مرز پرویزخان (قصرشیرین – عراق)',country:'عراق',modes:['road'],corridor:'کریدور صادراتی غرب به اقلیم کردستان و مرکز عراق',tirUsd:95,borderFeeUsd:140,fuelDiffUsd:150,bogieUsd:0,avgQueueHours:24,status:'open',notes:'عملیات تخلیه و بارگیری مجدد (Back-to-Back / Cross-docking) یا تردد مستقیم کامیون.'},
 {id:'IR-BSH',name:'مرز باشماق (مریوان – سلیمانیه عراق)',country:'عراق',modes:['road'],corridor:'کریدور ترانزیت سوخت و کالای تجاری به شمال عراق',tirUsd:95,borderFeeUsd:145,fuelDiffUsd:155,bogieUsd:0,avgQueueHours:22,status:'open',notes:'مرز رسمی ترانزیت بین‌المللی در استان کردستان.'},
 {id:'IR-MHR',name:'مرز مهران (ایلام – مرکز عراق / بغداد)',country:'عراق',modes:['road'],corridor:'کریدور تجاری تهران – بغداد',tirUsd:90,borderFeeUsd:135,fuelDiffUsd:145,bogieUsd:0,avgQueueHours:20,status:'open',notes:'نزدیک‌ترین مرز تجاری به بغداد و استان‌های مرکزی عراق.'},
 {id:'IR-SHL',name:'مرز شلمچه (خرمشهر – بصره عراق)',country:'عراق',modes:['road','rail'],corridor:'کریدور جنوبی ایران – بصره و بنادر ام‌قصر',tirUsd:90,borderFeeUsd:130,fuelDiffUsd:140,bogieUsd:0,avgQueueHours:18,status:'open',notes:'هم‌جوار منطقه آزاد اروند و بندر خرمشهر.'},
 {id:'IR-DOG',name:'مرز دوغارون (تایباد – افغانستان / هرات)',country:'افغانستان',modes:['road'],corridor:'کریدور ترانزیت بندرعباس – هرات و آسیای میانه',tirUsd:110,borderFeeUsd:155,fuelDiffUsd:170,bogieUsd:0,avgQueueHours:28,status:'open',notes:'مهم‌ترین مرز ترانزیت کالای بندرعباس به شمال‌غرب افغانستان.'},
 {id:'IR-MIL',name:'مرز میلک (سیستان – افغانستان / زرنج)',country:'افغانستان',modes:['road'],corridor:'کریدور ترانزیتی چابهار – میلک – افغانستان',tirUsd:110,borderFeeUsd:145,fuelDiffUsd:160,bogieUsd:0,avgQueueHours:20,status:'open',notes:'محور کلیدی ترانزیت کانتینرهای ورودی به بندر چابهار.'},
 {id:'IR-MIR',name:'مرز میرجاوه (زاهدان – پاکستان / تفتان)',country:'پاکستان',modes:['rail','road'],corridor:'کریدور اکو (ITI: اسلام‌آباد – تهران – استانبول)',tirUsd:130,borderFeeUsd:165,fuelDiffUsd:175,bogieUsd:520,avgQueueHours:24,status:'open',notes:'تغییر عرض خط آهن از ۱۴۳۵ میلی‌متر به ۱۶۷۶ میلی‌متر (پاکستان) در زاهدان.'}
];

function wbBordersList(){
 const ov=kvGet('web:borders')||{};
 return WB_BORDERS_DEF.map(b=>{
  const x=ov[b.id]||{};
  const totalRoad=b.modes.includes('road')?(+(x.tirUsd??b.tirUsd)+ +(x.borderFeeUsd??b.borderFeeUsd)+ +(x.fuelDiffUsd??b.fuelDiffUsd)):0;
  const totalRail=b.modes.includes('rail')?(+(x.borderFeeUsd??b.borderFeeUsd)+ +(x.bogieUsd??b.bogieUsd)):0;
  return {...b,...x,totalRoadUsd:totalRoad,totalRailUsd:totalRail};
 });
}

/* --- 4) Dynamic International Freight Surcharge Rules (BAF, WRS, PSS, THC, GRI, FSC) --- */
function wbSurchargeRules(){
 const vlsfo=wbMktInternal('VLSFO')||580;
 const baf20=Math.round(180+Math.max(0,vlsfo-500)*0.35);
 const baf40=Math.round(baf20*1.85);
 const ov=kvGet('web:surcharges')||{};
 const base=[
  {code:'BAF_20',name:'ضریب تعدیل سوخت دریایی ۲۰ فوت (BAF 20\')',mode:'sea',corridor:'شرق آسیا / اروپا ↔ خلیج فارس',usd:ov.BAF_20?.usd||baf20,unit:'TEU',formula:'بر مبنای VLSFO سنگاپور ('+Math.round(vlsfo)+' $/mt)',source:ov.BAF_20?.source||'فرمول استاندارد خط کشتیرانی + VLSFO',updatedAt:ov.BAF_20?.updatedAt||Date.now()},
  {code:'BAF_40',name:'ضریب تعدیل سوخت دریایی ۴۰ فوت (BAF 40\'/HC)',mode:'sea',corridor:'شرق آسیا / اروپا ↔ خلیج فارس',usd:ov.BAF_40?.usd||baf40,unit:'FEU',formula:'۱.۸۵ × BAF 20\' (VLSFO '+Math.round(vlsfo)+' $/mt)',source:ov.BAF_40?.source||'فرمول استاندارد خط کشتیرانی + VLSFO',updatedAt:ov.BAF_40?.updatedAt||Date.now()},
  {code:'WRS_PG',name:'سرشارژ ریسک جنگ خلیج فارس و تنگه هرمز (WRS)',mode:'sea',corridor:'تنگه هرمز / بندرعباس / جبل‌علی',usd:ov.WRS_PG?.usd||125,unit:'Container',formula:'۰.۱۵٪ تا ۰.۴۵٪ ارزش بیمه یا نرخ مقطوع کانتینری',source:ov.WRS_PG?.source||'بخشنامه سرشارژ خطوط دریایی و کلوب‌های P&I',updatedAt:ov.WRS_PG?.updatedAt||Date.now()},
  {code:'WRS_RS',name:'سرشارژ ریسک جنگ و تغییر مسیر دریای سرخ (Red Sea / Bab el-Mandeb)',mode:'sea',corridor:'اروپا / مدیترانه ↔ خاورمیانه و آسیا',usd:ov.WRS_RS?.usd||450,unit:'FEU',formula:'اضافه هزینه بیمه و دور زدن دماغه امید نیک',source:ov.WRS_RS?.source||'اطلاعیه خطوط کشتیرانی بین‌المللی',updatedAt:ov.WRS_RS?.updatedAt||Date.now()},
  {code:'PSS_EA',name:'سرشارژ فصل اوج ترافیک (PSS — Peak Season)',mode:'sea',corridor:'چین و شرق آسیا ← بندرعباس / جبل‌علی',usd:ov.PSS_EA?.usd||250,unit:'FEU',formula:'اعلامیه ماهانه خطوط (پنجره اوج تقاضا)',source:ov.PSS_EA?.source||'پایش اطلاعیه‌های GRI/PSS خطوط',updatedAt:ov.PSS_EA?.updatedAt||Date.now()},
  {code:'THC_IR_20',name:'هزینه THC بندر شهید رجایی / بنادر ایران (۲۰ فوت)',mode:'port',corridor:'بنادر جنوبی ایران (PMO)',usd:ov.THC_IR_20?.usd||168,unit:'20GP',formula:'کتاب تعرفه حقوق، عوارض و هزینه‌های خدمات بندری سازمان بنادر',source:ov.THC_IR_20?.source||'سازمان بنادر و دریانوردی (PMO)',updatedAt:ov.THC_IR_20?.updatedAt||Date.now()},
  {code:'THC_IR_40',name:'هزینه THC بندر شهید رجایی / بنادر ایران (۴۰ فوت)',mode:'port',corridor:'بنادر جنوبی ایران (PMO)',usd:ov.THC_IR_40?.usd||245,unit:'40HC',formula:'کتاب تعرفه حقوق، عوارض و هزینه‌های خدمات بندری سازمان بنادر',source:ov.THC_IR_40?.source||'سازمان بنادر و دریانوردی (PMO)',updatedAt:ov.THC_IR_40?.updatedAt||Date.now()},
  {code:'BOGIE_CIS',name:'تعرفه تعویض بوژی و خدمات مرزی ریلی (سرخس / اینچه‌برون / آستارا)',mode:'rail',corridor:'ایران (۱۴۳۵mm) ↔ کشورهای همسود CIS (۱۵۲۰mm)',usd:ov.BOGIE_CIS?.usd||480,unit:'Wagon',formula:'تعرفه راه‌آهن ج.ا.ا و موافقت‌نامه SMGS/COTIF',source:ov.BOGIE_CIS?.source||'راه‌آهن ج.ا.ا — تعرفه خدمات مرزی ریلی',updatedAt:ov.BOGIE_CIS?.updatedAt||Date.now()},
  {code:'FSC_AIR',name:'سرشارژ سوخت و امنیت کارگو هوایی (FSC + SSC)',mode:'air',corridor:'فرودگاه امام خمینی (IKA) ↔ هاب‌های آسیایی و اروپایی',usd:ov.FSC_AIR?.usd||1.15,unit:'kg',formula:'بر اساس شاخص سوخت جت یاتا (IATA Jet Fuel)',source:ov.FSC_AIR?.source||'تعرفه ایرلاین‌های کارگو (امارات، قطر، ترکیش، ماهان)',updatedAt:ov.FSC_AIR?.updatedAt||Date.now()}
 ];
 return {vlsfo,items:base,liveExtracted:ov._extracted||[],lastRefresh:ov._ts||null};
}

/* --- 5) Enhance wbStatus, /api/web/keys, /api/web/test, and connectors to include Tavily AI --- */
{
 const _wbStatus0=wbStatus;
 wbStatus=function(){
  const R=_wbStatus0();
  R.tv={configured:!!wbKey('tv'),key:wbMask(wbKey('tv')),from:wbKeySrc('tv'),last:LST.tavily||null};
  R.tariffsCount=(q1('SELECT COUNT(*) n FROM web_tariffs')||{}).n||0;
  return R;
 };
 const _ce2=connExtra;
 connExtra=function(st){
  return [..._ce2(st),{
   id:'tavily',
   name:'Tavily AI — موتور جست‌وجو و پژوهش عمیق تعرفه و نرخ حمل',
   mode:'web',
   on:!!wbKey('tv')&&!wbOff(),
   status:LST.tavily||null,
   env:wbKey('tv')?'کلید '+wbMask(wbKey('tv'))+' · پژوهش پیشرفته فعال':'کلید تنظیم نشده — IFA_TAVILY_KEY'
  }];
 };
}

httpRouteSet('PUT','/api/web/keys',async(req,u)=>{
 const b=await body(req);
 for(const s of ['fc','exa','tv'])if(b[s]!=null){
  const v=String(b[s]).trim();
  if(v&&!/^[A-Za-z0-9_\-]{12,200}$/.test(v))throw E(400,'قالب کلید '+WBN[s]+' نامعتبر است');
  if(v)run('INSERT INTO web_secret(k,v,ts,by) VALUES(?,?,?,?) ON CONFLICT(k) DO UPDATE SET v=excluded.v,ts=excluded.ts,by=excluded.by',s,v,Date.now(),u.username);
  else run('DELETE FROM web_secret WHERE k=?',s);
 }
 audit(u.username,ipOf(req),'web.keys','web_secret','',{fc:b.fc!=null,exa:b.exa!=null,tv:b.tv!=null});
 return {ok:true,status:wbStatus()};
},'web.manage');

httpRouteSet('POST','/api/web/test',async(req,u)=>{
 const b=await body(req);const R={};const svc=b.svc||'all';
 if(svc==='all'||svc==='exa'){
  if(!wbKey('exa'))R.exa={ok:false,err:'کلید تنظیم نشده'};
  else try{const j=await exaSearch({query:'container shipping news',type:'instant',n:1,hl:80},u.username,'test');R.exa={ok:true,n:(j.results||[]).length,usd:+(+((j.costDollars||{}).total)||0)}}catch(e){R.exa={ok:false,err:e.message}}
 }
 if(svc==='all'||svc==='fc'){
  if(!wbKey('fc'))R.fc={ok:false,err:'کلید تنظیم نشده'};
  else try{const j=await wbCall('fc','test','/v2/scrape',{body:{url:'https://example.com',formats:['markdown'],maxAge:7*864e5},est:0.001},u.username,'example.com');R.fc={ok:true,chars:String((j.data||{}).markdown||'').length}}catch(e){R.fc={ok:false,err:e.message}}
 }
 if(svc==='tv'||(svc==='all'&&wbKey('tv'))){
  if(!wbKey('tv'))R.tv={ok:false,err:'کلید تنظیم نشده'};
  else try{const j=await tavilySearch({query:'international container freight rate index',depth:'basic',n:2,answer:false},u.username,'test');R.tv={ok:true,n:(j.results||[]).length}}catch(e){R.tv={ok:false,err:e.message}}
 }
 return R;
},'web.use');

/* --- 6) Extend wbRates, wbNews & wbJobAdd/wbJobRun with Tavily AI & Firecrawl Search --- */
{
 const _wbRates0=wbRates;
 wbRates=async function(b,by){
  const via=b.via||'all';
  if(via==='tv'){
   const pol=apCode(b.pol),pod=apCode(b.pod),eq=apCode(b.eq)||'40HC';
   if(!pol||!pod)throw E(400,'کد بندر مبدأ و مقصد (UN/LOCODE) لازم است');
   if(!wbKey('tv'))throw E(412,'کلید Tavily تنظیم نشده است');
   const pn=wbClean(b.polName,60)||pol,dn=wbClean(b.podName,60)||pod;
   const u0=wbSpent().month;
   const j=await tavilySearch({query:`current ocean freight rate ${eq} container from ${pn} (${pol}) to ${dn} (${pod}) USD spot rate ${new Date().getFullYear()}`,depth:'advanced',n:8,answer:true},by,'rates.tavily');
   const out={lane:pol+'>'+pod,items:[],errors:[],sources:[],usd:0};
   const parsed=wbParseRatesText([j.answer||'',...(j.results||[]).map(r=>r.title+' '+r.content)].join('\n'),{pol,pod,eq,mode:'sea'});
   for(const qItem of parsed.quotes.slice(0,6)){
    const r0=(j.results||[])[0]||{url:'https://tavily.com',title:'Tavily Freight Search'};
    const it=wbRateIns({origin:pn,destination:dn,equipment:qItem.eq||eq,usd:qItem.usd,transitDays:qItem.transitDays,asOf:agToday()},{pol,pod,eq,url:r0.url,title:wbClean(r0.title,120),svc:'tv',via:'Tavily',conf:0.7,inj:false},by);
    if(it)out.items.push(it);
   }
   out.sources=(j.results||[]).slice(0,6).map(r=>({url:r.url,title:wbClean(r.title,120)}));
   const U=out.items.map(i=>i.usd).sort((a,b)=>a-b);out.median=U.length?U[Math.floor(U.length/2)]:null;
   out.agree={n:out.items.length,domains:[...new Set(out.sources.map(s=>wbHost(s.url)).filter(Boolean))],ok:out.items.length>=2,svc:['Tavily']};
   out.usd=+(wbSpent().month-u0).toFixed(4);out.at=Date.now();
   return out;
  }
  const res=await _wbRates0(b,by);
  if(via==='all'&&wbKey('tv')&&!res.cached&&b.includeTavily===true){
   try{
    const pol=apCode(b.pol),pod=apCode(b.pod),eq=apCode(b.eq)||'40HC';
    const pn=wbClean(b.polName,60)||pol,dn=wbClean(b.podName,60)||pod;
    const j=await tavilySearch({query:`ocean freight rate ${eq} container ${pn} to ${dn} USD per container`,depth:'basic',n:5,answer:true},by,'rates.tavily');
    const parsed=wbParseRatesText([j.answer||'',...(j.results||[]).map(r=>r.title+' '+r.content)].join('\n'),{pol,pod,eq,mode:'sea'});
    for(const qItem of parsed.quotes.slice(0,4)){
     const r0=(j.results||[])[0]||{url:'https://tavily.com',title:'Tavily'};
     const it=wbRateIns({origin:pn,destination:dn,equipment:qItem.eq||eq,usd:qItem.usd,transitDays:qItem.transitDays,asOf:agToday()},{pol,pod,eq,url:r0.url,title:wbClean(r0.title,120),svc:'tv',via:'Tavily',conf:0.68,inj:false},by);
     if(it)res.items.push(it);
    }
    res.sources.push(...(j.results||[]).slice(0,4).map(r=>({url:r.url,title:wbClean(r.title,120)})));
   }catch(e){res.errors.push('Tavily: '+e.message)}
  }
  return res;
 };

 const _wbJobAdd0=wbJobAdd;
 wbJobAdd=function(b,by){
  if(b.engine==='tv'){
   const q0=wbClean(b.q,1500);if(q0.length<10)throw E(400,'پرسش پژوهش کوتاه است');
   if(!wbKey('tv'))throw E(412,'کلید Tavily تنظیم نشده است');
   wbBudget(0.02);
   const id=Number(run('INSERT INTO web_jobs(kind,engine,q,status,ts,by,usd) VALUES(?,?,?,?,?,?,0)','research','tv',q0,'queued',Date.now(),by).lastInsertRowid);
   setTimeout(()=>wbJobRun(id).catch(()=>{}),10);
   audit(by,'','web.research','web_jobs',String(id),{engine:'tv'});
   return {ok:true,id,engine:'tv'};
  }
  return _wbJobAdd0(b,by);
 };

 const _wbJobRun0=wbJobRun;
 wbJobRun=async function(id){
  const J=q1('SELECT * FROM web_jobs WHERE id=?',id);
  if(J&&J.engine==='tv'&&['queued','running'].includes(J.status)){
   if(WBJBUSY.has(id))return;WBJBUSY.add(id);const u0=wbSpent().month;
   try{
    run("UPDATE web_jobs SET status='running' WHERE id=?",id);
    const j=await tavilySearch({query:J.q,depth:'advanced',n:10,answer:true},J.by,'research.tavily');
    const src=(j.results||[]).slice(0,8).map(r=>({url:r.url,title:wbClean(r.title,120)}));
    const parsed=wbParseRatesText([j.answer||'',...(j.results||[]).map(r=>r.content||'')].join('\n'),{});
    const resObj={
     answer:wbClean(j.answer,3000)||(j.results||[]).slice(0,3).map(r=>wbClean(r.content,400)).join('\n\n'),
     findings:(j.results||[]).slice(0,6).map(r=>({point:wbClean(r.title,120),detail:wbClean(r.content,320)})),
     figures:parsed.quotes.slice(0,6).map(q=>({label:q.eq||'Rate',value:'$'+q.usd,unit:'USD',asOf:agToday()})),
     caveats:'استخراج‌شده با موتور پژوهش پیشرفتهٔ Tavily AI از منابع عمومی وب'
    };
    run("UPDATE web_jobs SET status='done',result=?,sources=?,done=?,usd=COALESCE(usd,0)+? WHERE id=?",JSON.stringify(resObj).slice(0,60000),JSON.stringify(src),Date.now(),+(wbSpent().month-u0).toFixed(4),id);
    wbJobMem(id);
   }catch(e){
    run("UPDATE web_jobs SET status='failed',err=?,done=? WHERE id=?",String(e.message).slice(0,300),Date.now(),id);
   }finally{WBJBUSY.delete(id)}
   return;
  }
  return _wbJobRun0(id);
 };
}

/* --- 7) TRI-ENGINE INTERNATIONAL TARIFF & FREIGHT RATE SCANNER (Tavily + Firecrawl v2 Search + Exa) --- */
const WB_TARIFF_SCHEMA={
 type:'object',
 properties:{
  low:{type:'number',description:'lowest reported rate/tariff in USD'},
  typical:{type:'number',description:'typical or median market rate/tariff in USD'},
  high:{type:'number',description:'highest reported rate/tariff in USD'},
  unit:{type:'string',description:'unit e.g. 40HC, 20GP, TEU, Truck, Wagon, kg, CBM'},
  transitDays:{type:'number',description:'typical transit time in days'},
  surcharges:{type:'array',items:{type:'object',properties:{code:{type:'string'},name:{type:'string'},usd:{type:'number'}}}},
  quotes:{type:'array',items:{type:'object',properties:{carrierOrSource:{type:'string'},usd:{type:'number'},equipment:{type:'string'},transitDays:{type:'number'},asOf:{type:'string'}}}},
  summary:{type:'string',description:'concise summary of the current tariff/rate situation on this corridor'}
 }
};

const MODE_LABELS={
 sea:{fa:'حمل دریایی (FCL / LCL)',en:'ocean container freight spot rate',unit:'40HC'},
 road:{fa:'حمل جاده‌ای بین‌المللی (TIR / کامیون چادری و یخچالی)',en:'international road freight trucking TIR rate',unit:'TRUCK'},
 rail:{fa:'حمل ریلی بین‌المللی (واگن / کانتینر ریلی / تعویض بوژی)',en:'international rail freight wagon container tariff',unit:'WAGON'},
 air:{fa:'حمل هوایی کارگو (فرودگاه به فرودگاه)',en:'air cargo freight rate per kg',unit:'KG'},
 port:{fa:'تعرفه خدمات بندری، THC و دموراژ',en:'port tariff terminal handling charge THC demurrage',unit:'CONTAINER'}
};

async function wbTariffScan(b,by){
 const mode=MODE_LABELS[b.mode]?b.mode:'sea';
 const pol=wbClean(b.pol||b.from,80),pod=wbClean(b.pod||b.to,80);
 if(!pol||!pod)throw E(400,'مبدأ و مقصد برای پایش نرخ و تعرفه لازم است');
 const eq=wbClean(b.eq,20)||MODE_LABELS[mode].unit;
 const enginesReq=Array.isArray(b.engines)&&b.engines.length?b.engines:['tv','fc','exa'];
 const avail=enginesReq.filter(k=>wbKey(k));
 if(!avail.length)throw E(412,'هیچ‌یک از کلیدهای Tavily، Firecrawl یا Exa تنظیم نشده است');
 if(wbOff())throw E(503,'اتصال دادهٔ وب خاموش است');

 const ck=`tscan|${mode}|${pol.toLowerCase()}|${pod.toLowerCase()}|${eq.toLowerCase()}`;
 if(!b.force){const c=wbCacheGet(ck,wbCfg().tariffEvery||12);if(c)return {...c,cached:true}}

 const u0=wbSpent().month;
 const year=new Date().getFullYear();
 const qBase=`${MODE_LABELS[mode].en} ${eq} from ${pol} to ${pod} USD cost tariff surcharges ${year}`;
 const engineResults={};
 const allQuotes=[];
 const allSurcharges=[];
 const allSources=[];
 const errors=[];
 const summaries=[];

 /* Run selected engines in parallel for fast multi-source extraction & cross-verification */
 await Promise.all(avail.map(async eng=>{
  try{
   if(eng==='tv'){
    const j=await tavilySearch({
     query:`${qBase} freight rate quote BAF WRS THC transit time`,
     depth:'advanced',
     n:8,
     answer:true
    },by,'tariff.tavily');
    const txt=[j.answer||'',...(j.results||[]).map(r=>`${r.title||''}: ${r.content||''}`)].join('\n');
    const P=wbParseRatesText(txt,{mode,eq,pol,pod});
    const srcs=(j.results||[]).slice(0,6).map(r=>({url:r.url,title:wbClean(r.title,140),engine:'Tavily'}));
    allSources.push(...srcs);
    for(const qItem of P.quotes){
     allQuotes.push({...qItem,engine:'Tavily',source:(srcs[0]||{}).title||'Tavily AI',url:(srcs[0]||{}).url||''});
    }
    for(const sItem of P.surcharges){
     if(!allSurcharges.some(x=>x.code===sItem.code))allSurcharges.push({...sItem,engine:'Tavily'});
    }
    if(j.answer)summaries.push({engine:'Tavily AI',text:wbClean(j.answer,700)});
    engineResults.tv={ok:true,results:(j.results||[]).length,quotesFound:P.quotes.length,surchargesFound:P.surcharges.length,answer:wbClean(j.answer,500)};
   }
   else if(eng==='fc'){
    const j=await fcSearch({
     query:`${pol} to ${pod} ${MODE_LABELS[mode].en} ${eq} USD tariff rate`,
     n:6
    },by,'tariff.fcsearch');
    const txt=(j.results||[]).map(r=>`${r.title||''}: ${r.description||''} ${r.markdown||''}`).join('\n');
    const P=wbParseRatesText(txt,{mode,eq,pol,pod});
    const srcs=(j.results||[]).slice(0,6).map(r=>({url:r.url,title:wbClean(r.title,140),engine:'Firecrawl'}));
    allSources.push(...srcs);
    for(const qItem of P.quotes){
     allQuotes.push({...qItem,engine:'Firecrawl',source:(srcs[0]||{}).title||'Firecrawl Search',url:(srcs[0]||{}).url||''});
    }
    for(const sItem of P.surcharges){
     if(!allSurcharges.some(x=>x.code===sItem.code))allSurcharges.push({...sItem,engine:'Firecrawl'});
    }
    engineResults.fc={ok:true,results:(j.results||[]).length,quotesFound:P.quotes.length,surchargesFound:P.surcharges.length};
   }
   else if(eng==='exa'){
    const j=await exaSearch({
     query:qBase,
     type:'auto',
     n:6,
     hl:500,
     system:`Extract published international freight rates, tariffs, and surcharges in USD for ${mode} transport (${eq}) from ${pol} to ${pod}. Include low, typical, and high USD figures, transitDays, surcharges (BAF, WRS, PSS, THC, TIR), and individual quotes cited in the sources.`
    },by,'tariff.exa');
    const P=wbParseRatesText((j.results||[]).map(r=>`${r.title||''}: ${(r.highlights||[]).join(' ')} ${r.text||''}`).join('\n'),{mode,eq,pol,pod});
    const C=(j.output&&j.output.content)||{quotes:P.quotes,surcharges:P.surcharges,summary:(j.results||[]).slice(0,3).map(r=>wbClean((r.highlights||[])[0]||r.title,220)).filter(Boolean).join(' · ')};
    const G=((j.output||{}).grounding)||[];
    const cites=wbCit(G);
    const srcs=(cites.length?cites:(j.results||[]).slice(0,6).map(r=>({url:r.url,title:wbClean(r.title,140)}))).map(s=>({...s,engine:'Exa'}));
    allSources.push(...srcs);
    const loB=mode==='air'?0.5:mode==='sea'&&eq==='LCL'?10:50,hiB=mode==='air'?50:30000;
    if(+C.typical>=loB&&+C.typical<=hiB){
     allQuotes.push({
      usd:Math.round(+C.typical*100)/100,
      low:+C.low>=loB?Math.round(+C.low*100)/100:Math.round(+C.typical*0.9),
      high:+C.high<=hiB&&+C.high>=+C.typical?Math.round(+C.high*100)/100:Math.round(+C.typical*1.12),
      eq,
      transitDays:+C.transitDays>0&&+C.transitDays<120?Math.round(+C.transitDays):null,
      engine:'Exa',
      source:(srcs[0]||{}).title||'Exa Deep-Lite',
      url:(srcs[0]||{}).url||''
     });
    }
    for(const qx of (Array.isArray(C.quotes)?C.quotes:[]).slice(0,6)){
     if(+qx.usd>=loB&&+qx.usd<=hiB){
      allQuotes.push({usd:Math.round(+qx.usd*100)/100,low:Math.round(+qx.usd*100)/100,high:Math.round(+qx.usd*100)/100,eq:qx.equipment||eq,transitDays:+qx.transitDays||null,engine:'Exa',source:wbClean(qx.carrierOrSource,80)||'Exa',url:(srcs[0]||{}).url||''});
     }
    }
    for(const sx of (Array.isArray(C.surcharges)?C.surcharges:[]).slice(0,6)){
     if(+sx.usd>0&&+sx.usd<8000){
      allSurcharges.push({code:wbClean(sx.code||sx.name,20).toUpperCase(),name:wbClean(sx.name||sx.code,80),usd:Math.round(+sx.usd),engine:'Exa'});
     }
    }
    if(C.summary)summaries.push({engine:'Exa AI',text:wbClean(C.summary,600)});
    engineResults.exa={ok:true,results:(j.results||[]).length,quotesFound:allQuotes.filter(q=>q.engine==='Exa').length,typical:C.typical||null};
   }
  }catch(e){
   errors.push(WBN[eng]+': '+String(e.message).slice(0,180));
   engineResults[eng]={ok:false,err:String(e.message).slice(0,180)};
  }
 }));

 /* Deduplicate sources */
 const uniqSources=[...new Map(allSources.filter(s=>s.url).map(s=>[s.url,s])).values()].slice(0,15);
 /* Compute consensus low / median(typical) / high across engines */
 const vals=allQuotes.map(q=>q.usd).filter(v=>v>0).sort((a,b)=>a-b);
 let low=vals.length?vals[0]:null;
 let typical=vals.length?vals[Math.floor(vals.length/2)]:null;
 let high=vals.length?vals[vals.length-1]:null;
 const tDays=allQuotes.map(q=>q.transitDays).filter(v=>v>0).sort((a,b)=>a-b);
 const transitDays=tDays.length?tDays[Math.floor(tDays.length/2)]:null;

 /* Attach relevant corridor surcharges from SURCHARGE_MATRIX if not already found */
 const matrix=wbSurchargeRules().items;
 if(mode==='sea'){
  const is20=/^20/.test(eq);
  const bafRule=matrix.find(m=>m.code===(is20?'BAF_20':'BAF_40'));
  if(bafRule&&!allSurcharges.some(s=>/BAF/i.test(s.code)))allSurcharges.push({code:'BAF',name:bafRule.name,usd:bafRule.usd,engine:'فرمول VLSFO'});
  if(/IR|bandar|رجایی|بندرعباس|jebel|جبل|hormuz/i.test(pol+' '+pod)&&!allSurcharges.some(s=>/WRS/i.test(s.code))){
   const wrsRule=matrix.find(m=>m.code==='WRS_PG');
   if(wrsRule)allSurcharges.push({code:'WRS',name:wrsRule.name,usd:wrsRule.usd,engine:'ماتریس ریسک خلیج فارس'});
  }
  if(/IR|bandar|رجایی|بندرعباس/i.test(pol+' '+pod)&&!allSurcharges.some(s=>/THC/i.test(s.code))){
   const thcRule=matrix.find(m=>m.code===(is20?'THC_IR_20':'THC_IR_40'));
   if(thcRule)allSurcharges.push({code:'THC',name:thcRule.name,usd:thcRule.usd,engine:'تعرفه PMO'});
  }
 }else if(mode==='rail'){
  const bogRule=matrix.find(m=>m.code==='BOGIE_CIS');
  if(bogRule&&!allSurcharges.some(s=>/BOGIE/i.test(s.code)))allSurcharges.push({code:'BOGIE',name:bogRule.name,usd:bogRule.usd,engine:'تعرفه ریلی مرزی'});
 }else if(mode==='road'){
  const bMatch=wbBordersList().find(x=>pol.includes(x.country)||pod.includes(x.country)||pol.includes(x.name.slice(4,9))||pod.includes(x.name.slice(4,9)))||wbBordersList()[0];
  if(bMatch){
   allSurcharges.push({code:'TIR_BORDER',name:'عوارض مرزی، کارنه تیر و مابه‌التفاوت سوخت ('+bMatch.name+')',usd:bMatch.totalRoadUsd,engine:'ماتریس مرزی'});
  }
 }

 const enginesWithQuotes=[...new Set(allQuotes.map(q=>q.engine))];
 const agree=enginesWithQuotes.length>=2;
 const conf=enginesWithQuotes.length>=3?'very-high':enginesWithQuotes.length===2?'high':allQuotes.length>=1?'medium':'low';
 const summaryText=summaries.map(s=>`[${s.engine}] ${s.text}`).join(' | ').slice(0,1500)||(typical?`میانهٔ نرخ استخراج‌شده برای ${pol} ← ${pod} (${eq}): $${typical} (بازه $${low} تا $${high}) از ${uniqSources.length} منبع معتبر وب.`:'پاسخ‌های متنی و منابع مرجع از موتورهای وب دریافت شد.');

 /* Optionally queue sea quotes into rc_items for approval */
 let queuedCount=0;
 if(b.queueRates!==false&&mode==='sea'&&allQuotes.length){
  const polCode=apCode(pol).slice(0,5)||'ORIG',podCode=apCode(pod).slice(0,5)||'DEST';
  for(const qItem of allQuotes.slice(0,6)){
   if(qItem.usd>=80&&qItem.usd<=25000&&qItem.url){
    const ins=wbRateIns({origin:pol,destination:pod,equipment:qItem.eq||eq,usd:qItem.usd,transitDays:qItem.transitDays,asOf:agToday()},{pol:polCode,pod:podCode,eq,url:qItem.url,title:qItem.source,svc:qItem.engine==='Tavily'?'tv':qItem.engine==='Firecrawl'?'fc':'exa',via:qItem.engine,conf:agree?0.78:0.6,inj:false},by);
    if(ins&&!ins.dup)queuedCount++;
   }
  }
 }

 const usdSpent=+(wbSpent().month-u0).toFixed(4);
 const corridor=`${pol} → ${pod}`;
 const id=Number(run('INSERT INTO web_tariffs(mode,corridor,pol,pod,eq,low,typical,high,cur,unit,transit_days,surcharges,engines,agree,conf,summary,quotes,sources,usd,ts,by) VALUES(?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)',
  mode,corridor,pol,pod,eq,low,typical,high,'USD',eq,transitDays,JSON.stringify(allSurcharges),JSON.stringify(engineResults),agree?1:0,conf,summaryText,JSON.stringify(allQuotes.slice(0,15)),JSON.stringify(uniqSources),usdSpent,Date.now(),by).lastInsertRowid);

 const out={
  ok:true,id,mode,modeFa:MODE_LABELS[mode].fa,corridor,pol,pod,eq,
  low,typical,high,cur:'USD',unit:eq,transitDays,
  surcharges:allSurcharges,
  totalAllInUsd:typical?Math.round(typical+allSurcharges.filter(s=>s.usd<5000&&mode!=='air').reduce((a,s)=>a+(+s.usd||0),0)):null,
  engines:engineResults,
  enginesActive:avail,
  enginesWithQuotes,
  agree,
  conf,
  summary:summaryText,
  quotes:allQuotes.slice(0,15),
  sources:uniqSources,
  queuedCount,
  errors,
  usd:usdSpent,
  ts:Date.now()
 };
 wbCachePut(ck,out);
 audit(by,'','web.tariff.scan','web_tariffs',String(id),{corridor,mode,typical,engines:avail});
 return out;
}

/* --- 8) Live Surcharges Extraction & Refresh (Tavily + Firecrawl + Exa) --- */
async function wbSurchargeRefresh(b,by){
 const corridor=wbClean(b.corridor,100)||'East Asia China to Persian Gulf Bandar Abbas Jebel Ali';
 if(!wbKey('tv')&&!wbKey('exa')&&!wbKey('fc'))throw E(412,'کلید وب تنظیم نشده است');
 const u0=wbSpent().month;
 const qStr=`container shipping surcharges BAF WRS war risk PSS peak season GRI THC ${corridor} USD ${new Date().getFullYear()}`;
 const extracted=[];const sources=[];const errors=[];

 if(wbKey('tv')){
  try{
   const j=await tavilySearch({query:qStr,depth:'advanced',n:6,answer:true},by,'surcharges.tavily');
   const P=wbParseRatesText([j.answer||'',...(j.results||[]).map(r=>r.title+' '+r.content)].join('\n'),{mode:'sea'});
   for(const s of P.surcharges)extracted.push({...s,engine:'Tavily',corridor});
   sources.push(...(j.results||[]).slice(0,5).map(r=>({url:r.url,title:wbClean(r.title,120),engine:'Tavily'})));
  }catch(e){errors.push('Tavily: '+e.message)}
 }
 if(wbKey('fc')){
  try{
   const j=await fcSearch({query:qStr,n:5},by,'surcharges.fc');
   const P=wbParseRatesText((j.results||[]).map(r=>r.title+' '+r.description).join('\n'),{mode:'sea'});
   for(const s of P.surcharges)if(!extracted.some(x=>x.code===s.code&&x.engine==='Firecrawl'))extracted.push({...s,engine:'Firecrawl',corridor});
   sources.push(...(j.results||[]).slice(0,4).map(r=>({url:r.url,title:wbClean(r.title,120),engine:'Firecrawl'})));
  }catch(e){errors.push('Firecrawl: '+e.message)}
 }
 const ov=kvGet('web:surcharges')||{};
 ov._extracted=extracted.slice(0,15);
 ov._sources=sources.slice(0,10);
 ov._ts=Date.now();
 kvPut('web:surcharges',ov,by||'system');
 return {ok:true,corridor,extracted:ov._extracted,sources:ov._sources,rules:wbSurchargeRules(),errors,usd:+(wbSpent().month-u0).toFixed(4)};
}

/* --- 9) Live Border Crossings & Transit Queue/Fee Refresh (Tavily + Exa + Firecrawl) --- */
async function wbBorderRefresh(b,by){
 const borderId=b.borderId?String(b.borderId).toUpperCase():'';
 const targets=borderId?WB_BORDERS_DEF.filter(x=>x.id===borderId):WB_BORDERS_DEF.slice(0,6);
 if(!targets.length)throw E(404,'مرز مورد نظر یافت نشد');
 if(!wbKey('tv')&&!wbKey('exa')&&!wbKey('fc'))throw E(412,'کلید وب تنظیم نشده است');
 const u0=wbSpent().month;
 const ov=kvGet('web:borders')||{};
 const updates=[];const errors=[];

 const qStr=borderId
  ?`${targets[0].name} عوارض مرزی صف کامیون کارنه تیر ترانزیت هزینه ${targets[0].country} transit border queue fee`
  :`صف کامیون مرز بازرگان سرخس آستارا اینچه‌برون نوردوز پرویزخان عوارض مرزی کارنه تیر ترانزیت راهداری`;

 try{
  let items=[];
  if(wbKey('tv')){
   const j=await tavilySearch({query:qStr,depth:'advanced',n:8,answer:true},by,'borders.tavily');
   items.push(...(j.results||[]).map(r=>({url:r.url,title:wbClean(r.title,160),snip:wbClean(r.content,400),engine:'Tavily'})));
   if(j.answer)items.unshift({url:'https://tavily.com',title:'خلاصهٔ هوشمند وضعیت مرزها (Tavily AI)',snip:wbClean(j.answer,600),engine:'Tavily AI'});
  }
  if(wbKey('fc')){
   const j=await fcSearch({query:qStr,n:5},by,'borders.fc');
   items.push(...(j.results||[]).map(r=>({url:r.url,title:wbClean(r.title,160),snip:wbClean(r.description,400),engine:'Firecrawl'})));
  }
  for(const bd of targets){
   const kw=bd.name.split(/[\s(–-]+/)[1]||bd.country;
   const hits=items.filter(it=>(it.title+' '+it.snip).includes(kw)||(it.title+' '+it.snip).includes(bd.country));
   const cur=ov[bd.id]||{};
   const qMatch=(hits.map(h=>enDig(h.title+' '+h.snip)).join(' ').match(/(\d{1,3})\s*(?:ساعت|hours?)/i)||[])[1];
   const dMatch=(hits.map(h=>enDig(h.title+' '+h.snip)).join(' ').match(/(\d{1,2})\s*(?:روز|days?)\s*(?:صف|انتظار|توقف)/i)||[])[1];
   const queueH=qMatch?+qMatch:dMatch?(+dMatch*24):cur.avgQueueHours||bd.avgQueueHours;
   const status=/بسته|مسدود|توقف کامل|closed/i.test(hits.map(h=>h.title).join(' '))?'closed':queueH>=48?'caution':'open';
   ov[bd.id]={
    ...cur,
    avgQueueHours:Math.min(240,Math.max(4,queueH)),
    status,
    updatedAt:Date.now(),
    liveSignals:(hits.length?hits:items.slice(0,2)).slice(0,3)
   };
   updates.push({id:bd.id,name:bd.name,avgQueueHours:ov[bd.id].avgQueueHours,status,signals:ov[bd.id].liveSignals});
  }
  kvPut('web:borders',ov,by||'system');
 }catch(e){errors.push(e.message)}

 return {ok:true,updates,borders:wbBordersList(),errors,usd:+(wbSpent().month-u0).toFixed(4)};
}

/* --- 10) Customs Duty, HS Code & EAEU Preferential Tariff Live Verification --- */
const EAEU_PREF_CH={
 '07':{prefPct:0,note:'سبزیجات و صیفی‌جات — معاف از حقوق گمرکی در موافقت‌نامه تجارت آزاد ایران و اوراسیا (EAEU FTA)'},
 '08':{prefPct:0,note:'میوه‌ها و خشکبار (پسته، خرما، کشمش، سیب، کیوی) — تعرفه صفر درصد در توافق تجارت آزاد اوراسیا'},
 '27':{prefPct:2,note:'فرآورده‌های نفتی و پتروشیمی — مشمول تخفیف ترجیحی اوراسیا'},
 '39':{prefPct:0,note:'پلیمرها و مصنوعات پلاستیکی — مشمول تعرفه صفر/ترجیحی در فهرست EAEU'},
 '72':{prefPct:0,note:'آهن و فولاد — مشمول معافیت/تخفیف تعرفه در توافق تجارت آزاد ایران و اوراسیا'},
 '10':{prefPct:0,note:'غلات (گندم، جو، ذرت وارداتی از روسیه/قزاقستان) — تعرفه ترجیحی صفر در چارچوب EAEU'},
 '15':{prefPct:2,note:'روغن‌های خوراکی و دانه آفتابگردان از اوراسیا — مشمول تعرفه ترجیحی'}
};

async function wbCustomsVerify(b,by){
 const codeRaw=enDig(String(b.hs||b.code||'')).replace(/\D/g,'');
 const desc=wbClean(b.desc||b.q,160);
 if(!codeRaw&&!desc)throw E(400,'کد HS یا شرح کالا برای استعلام تعرفه گمرکی لازم است');
 const u0=wbSpent().month;
 const hsInfo=codeRaw?hsVerify(codeRaw):(desc?{candidates:hsSuggest(desc,5)}:null);
 const hs6=codeRaw?codeRaw.slice(0,6):(((hsInfo?.candidates||[])[0]||{}).code||'');
 const ch2=hs6.slice(0,2);
 const eaeu=EAEU_PREF_CH[ch2]||{prefPct:null,note:'نیازمند بررسی ردیف ۸ رقمی در فهرست موافقت‌نامه تجارت آزاد ایران و اوراسیا (۸۷٪ کالاها مشمول تعرفه صفر هستند)'};

 /* Check internal Iran tariff book if loaded */
 const tbRows=codeRaw?q('SELECT * FROM tariff_ir WHERE hs LIKE ? ORDER BY hs LIMIT 5',codeRaw.slice(0,4)+'%'):[];
 const cfx=apCfxNow()||285000;

 /* Live web verification via Tavily AI + Exa */
 const webFindings=[];const sources=[];const errors=[];
 if((wbKey('tv')||wbKey('exa'))&&b.web!==false){
  const qCustom=`حقوق ورودی تعرفه گمرکی ${codeRaw||'کالای'} ${desc} بخشنامه گمرک ایران ارزش گمرکی اوراسیا ${new Date().getFullYear()}`;
  if(wbKey('tv')){
   try{
    const j=await tavilySearch({query:qCustom,depth:'advanced',n:6,answer:true},by,'customs.tavily');
    if(j.answer)webFindings.push({engine:'Tavily AI',summary:wbClean(j.answer,900)});
    sources.push(...(j.results||[]).slice(0,5).map(r=>({url:r.url,title:wbClean(r.title,140),snip:wbClean(r.content,300),engine:'Tavily'})));
   }catch(e){errors.push('Tavily: '+e.message)}
  }
  if(wbKey('exa')&&!webFindings.length){
   try{
    const j=await exaSearch({query:qCustom,type:'fast',n:5},by,'customs.exa');
    sources.push(...(j.results||[]).slice(0,5).map(r=>({url:r.url,title:wbClean(r.title,140),snip:wbClean((r.highlights||[]).join(' '),300),engine:'Exa'})));
   }catch(e){errors.push('Exa: '+e.message)}
  }
 }

 return {
  ok:true,
  query:{hs:codeRaw,desc},
  hsInfo,
  tariffBookRows:tbRows,
  customsFxIrr:cfx,
  vatPct:10,
  eaeu:{chapter:ch2,...eaeu},
  webFindings,
  sources,
  errors,
  usd:+(wbSpent().month-u0).toFixed(4),
  ts:Date.now()
 };
}

/* --- 11) Register Agent & MCP tools (strictly lowercase a-z and _ names per test/agents.test.js) --- */
tool('tavily_search',{
 d:'جست‌وجوی پیشرفتهٔ وب و استخراج پاسخ مستند با موتور Tavily AI برای نرخ حمل، تعرفه گمرکی، سورشارژها و قوانین تجاری',
 cls:'web',taint:true,
 args:{query:['string','عبارت جست‌وجو',1],depth:['string','basic یا advanced']},
 run:async(a,ctx)=>{
  const j=await tavilySearch({query:a.query,depth:a.depth==='basic'?'basic':'advanced',n:6,answer:true},wbAgBudget(ctx),'agent.tavily');
  return {answer:wbClean(j.answer,1200),results:(j.results||[]).slice(0,6).map(r=>({title:wbClean(r.title,120),url:r.url,snippet:wbClean(r.content,300)})),sources:wbSrcs(j.results||[])};
 }
});

tool('fc_search',{
 d:'جست‌وجوی مستقیم وب با Firecrawl v2 Search برای یافتن صفحات نرخ، تعرفه بندری و اطلاعیه‌های کشتیرانی',
 cls:'web',taint:true,
 args:{query:['string','عبارت جست‌وجو',1]},
 run:async(a,ctx)=>{
  const j=await fcSearch({query:a.query,n:6},wbAgBudget(ctx),'agent.fcsearch');
  return {results:j.results,sources:wbSrcs(j.results)};
 }
});

tool('tariff_scan',{
 d:'اسکنر سه‌موتورهٔ نرخ و تعرفهٔ حمل بین‌المللی (Tavily + Firecrawl + Exa) برای مسیر دریایی، جاده‌ای، ریلی یا هوایی با راستی‌آزمایی متقاطع',
 cls:'web',taint:true,
 args:{pol:['string','مبدأ (کد یا نام شهر/بندر)',1],pod:['string','مقصد (کد یا نام شهر/بندر)',1],mode:['string','sea/road/rail/air/port'],eq:['string','نوع تجهیز (40HC, 20GP, TRUCK, WAGON, KG)']},
 run:async(a,ctx)=>{
  const r=await wbTariffScan(a,wbAgBudget(ctx));
  return {...r,sources:wbSrcs(r.sources)};
 }
});

tool('border_tariffs',{
 d:'دریافت ماتریس هزینه‌های ۱۸ مرز بین‌المللی ایران (کارنه تیر، عوارض مرزی، تعویض بوژی ریلی، مابه‌التفاوت سوخت و صف انتظار)',
 cls:'read',
 args:{border:['string','کد مرز مانند IR-BAZ یا IR-SRK (اختیاری)']},
 run:(a)=>{
  const L=wbBordersList();
  const f=a.border?L.filter(x=>x.id===String(a.border).toUpperCase()||x.name.includes(a.border)):L;
  return {borders:f,sources:[{kind:'internal',ref:'borders',title:'ماتریس ۱۸ مرز بین‌المللی ایران'}]};
 }
});

for(const [agId,tList] of [
 ['analyst',['tavily_search','fc_search','tariff_scan','border_tariffs']],
 ['procurement',['tavily_search','tariff_scan','border_tariffs']],
 ['risk',['tavily_search','fc_search','border_tariffs']],
 ['docs',['tavily_search','border_tariffs']]
]){
 if(AGENTS[agId]){
  for(const tName of tList)if(!AGENTS[agId].tools.includes(tName))AGENTS[agId].tools.push(tName);
 }
}

/* --- 12) Register HTTP API Routes for Multi-Modal Tariff & Cost Intelligence --- */
route('GET','/api/web/tariffs',req=>{
 const s=new URL(req.url,'http://x').searchParams;
 const mode=s.get('mode')||'';
 const rows=q('SELECT * FROM web_tariffs '+(mode?'WHERE mode=? ':'')+'ORDER BY id DESC LIMIT 50',...(mode?[mode]:[])).map(r=>{
  const j=x=>{try{return JSON.parse(x||'[]')}catch(e){return []}};
  return {...r,agree:!!r.agree,surcharges:j(r.surcharges),engines:j(r.engines),quotes:j(r.quotes),sources:j(r.sources)};
 });
 return {
  items:rows,
  borders:wbBordersList(),
  surcharges:wbSurchargeRules(),
  engines:{
   tv:{configured:!!wbKey('tv'),key:wbMask(wbKey('tv')),from:wbKeySrc('tv')},
   fc:{configured:!!wbKey('fc'),key:wbMask(wbKey('fc')),from:wbKeySrc('fc')},
   exa:{configured:!!wbKey('exa'),key:wbMask(wbKey('exa')),from:wbKeySrc('exa')}
  }
 };
},'');

route('POST','/api/web/tariffs/scan',async(req,u)=>wbTariffScan(await body(req),u.username),'web.use');
route('POST','/api/web/tariffs/surcharges',async(req,u)=>wbSurchargeRefresh(await body(req),u.username),'web.use');
route('POST','/api/web/tariffs/borders/refresh',async(req,u)=>wbBorderRefresh(await body(req),u.username),'web.use');
route('POST','/api/web/tariffs/customs',async(req,u)=>wbCustomsVerify(await body(req),u.username),'web.use');
route('POST','/api/web/tavily/search',async(req,u)=>{const b=await body(req);return tavilySearch(b,u.username,'api.tavily')},'web.use');
route('POST','/api/web/firecrawl/search',async(req,u)=>{const b=await body(req);return fcSearch(b,u.username,'api.fcsearch')},'web.use');
