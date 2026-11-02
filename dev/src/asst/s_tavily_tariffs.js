/* ---------- v15.23: web data phase 4 — Tavily AI + Firecrawl v2 Search + Exa AI Tri-Engine Tariff & Corridor Intelligence ---------- */
{const i=WBTAB.findIndex(t=>t[0]==='rt');WBTAB.splice(i+1,0,['tf','تعرفه و کریدورها'])}
const wbSvcName=s=>s==='tv'?'Tavily AI':s==='fc'?'Firecrawl':'Exa';

/* Override wbShow header title to reflect all 3 engines */
{const _wbShow0=wbShow;wbShow=function(tab){const bg=_wbShow0(tab);if(bg){const b=$('header .t b',bg),sm=$('header .t small',bg);if(b)b.textContent='دادهٔ زندهٔ وب · Tavily AI + Firecrawl + Exa';if(sm)sm.textContent='پایش و استخراج مستمر نرخ حمل، تعرفه گمرکی، سورشارژها، هزینه‌های مرزی و ریسک کریدورها با راستی‌آزمایی سه‌موتوره'}return bg}}

/* Override wbStT to show all 3 engines (Firecrawl, Exa, Tavily AI) */
wbStT=async function(B,bg){
 const s=await svApi('/api/web/status');const c=s.cfg;
 const card=(k,n,d)=>{const x=s[k]||{};return `<div class="wb-card" data-on="${x.configured?1:0}"><b>${n}</b><small>${d}</small><div class="kv"><span>کلید</span><em dir="ltr">${x.configured?esc(x.key)+' · '+(x.from==='env'?'از .env سرور':'ذخیره در سرور'):'تنظیم نشده'}</em></div><div class="kv"><span>آخرین فراخوانی</span><em>${x.last?(x.last.ok?'✓ ':'✗ ')+esc(x.last.ok?x.last.info||'':x.last.err||'')+' · '+wbT(x.last.at):'—'}</em></div></div>`};
 B.innerHTML=`${s.off?'<p class="wb-err">اتصال دادهٔ وب روی سرور خاموش است (IFA_WEB_OFF یا IFA_LIVE_OFF).</p>':''}
 <div class="wb-g2" style="grid-template-columns:repeat(auto-fit,minmax(210px,1fr))">
  ${card('tv','Tavily AI','موتور جست‌وجو و پژوهش عمیق هوش مصنوعی برای استخراج نرخ حمل، سورشارژها، عوارض مرزی و بخشنامه‌های گمرکی')}
  ${card('fc','Firecrawl (v2 Search & Scrape)','جست‌وجوی مستقیم وب (/v2/search)، استخراج ساخت‌یافته از صفحات تعرفه، پایش تغییر صفحه و خواندن اسناد')}
  ${card('exa','Exa AI','جست‌وجوی معنایی وب و اخبار (فارسی و انگلیسی)، برآورد بازار با استناد و پایشگرهای زمان‌بندی‌شده')}
 </div>
 <div class="wb-row"><button class="wb-b pr" data-a="test">آزمایش اتصال هر سه موتور (Tavily + Firecrawl + Exa)</button><button class="wb-b" data-a="gotf">اسکنر سه‌موتورهٔ تعرفه و کریدورها ←</button><small>هزینهٔ آزمایش کمتر از ۱ سنت است</small></div>
 <h5>مصرف و بودجه</h5><div class="wb-use"><div><span>امروز</span>${wbBar(s.spent.day,c.dayUSD)}<em>${wbD(s.spent.day)} / ${wbD(c.dayUSD)}</em></div><div><span>این ماه</span>${wbBar(s.spent.month,c.monthUSD)}<em>${wbD(s.spent.month)} / ${wbD(c.monthUSD)}</em></div></div>
 ${s.byOp.length?`<table class="wb-tb"><thead><tr><th>سرویس</th><th>عملیات</th><th>تعداد</th><th>خطا</th><th>هزینه</th></tr></thead><tbody>${s.byOp.map(r=>`<tr><td>${wbSvcName(r.svc)}</td><td dir="ltr">${esc(r.op)}</td><td>${fa(r.n)}</td><td>${fa(r.err)}</td><td>${wbD(r.usd)}</td></tr>`).join('')}</tbody></table>`:'<p class="wb-mu">هنوز فراخوانی‌ای در این ماه ثبت نشده است.</p>'}
 <h5>تنظیمات <em>نیازمند نقش مدیر</em></h5><div class="g wb-cfg"><label>سقف روزانه ($)<input data-c="dayUSD" type="number" min="0" step="0.5" value="${c.dayUSD}"></label><label>سقف ماهانه ($)<input data-c="monthUSD" type="number" min="0" step="1" value="${c.monthUSD}"></label>
 <label>تازگی نرخ (ساعت)<input data-c="rateTTL" type="number" min="1" value="${c.rateTTL}"></label><label>بازه خبر ریسک (ساعت)<input data-c="riskEvery" type="number" min="1" value="${c.riskEvery}"></label><label>بازه پایش گمرکی (ساعت)<input data-c="customsEvery" type="number" min="1" value="${c.customsEvery}"></label><label>هزینهٔ هر اعتبار Firecrawl ($)<input data-c="fcCredit" type="number" min="0" step="0.0001" value="${c.fcCredit}"></label>
 <label class="ck"><input data-c="auto" type="checkbox" ${c.auto?'checked':''}> پایش زمان‌بندی‌شده (اخبار و منابع)</label><label class="ck"><input data-c="pi" type="checkbox" ${c.pi?'checked':''}> بررسی دستور مخرب جاسازی‌شده در صفحه (Firecrawl)</label>
 <label class="w">دامنه‌های مجاز (خالی = همه)<input data-c="allow" dir="ltr" value="${esc(c.allow.join(', '))}" placeholder="cogoport.com, iranimpex.com"></label><label class="w">دامنه‌های مسدود<input data-c="block" dir="ltr" value="${esc(c.block.join(', '))}"></label></div>
 <div class="wb-row"><button class="wb-b pr" data-a="cfg">ذخیرهٔ تنظیمات</button></div>
 <details class="wb-keys"><summary>تغییر کلیدهای API (Tavily / Firecrawl / Exa)</summary><div class="g">
  <label>Tavily AI API key<input data-k="tv" type="password" dir="ltr" autocomplete="off" placeholder="tvly-…"></label>
  <label>Firecrawl API key<input data-k="fc" type="password" dir="ltr" autocomplete="off" placeholder="fc-…"></label>
  <label>Exa API key<input data-k="exa" type="password" dir="ltr" autocomplete="off" placeholder="4f22…"></label>
 </div><small>کلیدها فقط روی سرور ذخیره می‌شوند و به مرورگر برنمی‌گردند. کلیدهای .env بر مقدار ذخیره‌شده اولویت دارند.</small><div class="wb-row"><button class="wb-b" data-a="keys">ذخیرهٔ کلیدها</button></div></details>
 <h5>آخرین فراخوانی‌ها</h5><div class="wb-log">${s.recent.map(r=>`<div data-ok="${r.ok}"><span>${wbT(r.ts)}</span><b>${wbSvcName(r.svc)} · <i dir="ltr">${esc(r.op)}</i></b><em>${wbD(r.usd)}</em><small dir="auto">${esc(r.err||r.ref||'')}</small></div>`).join('')||'<p class="wb-mu">—</p>'}</div>`;
 $('[data-a=test]',B).onclick=async e=>{e.target.disabled=true;e.target.textContent='در حال آزمایش هر سه موتور…';try{const r=await svApi('/api/web/test',{method:'POST',body:{svc:'all'}});toast(['tv','fc','exa'].map(k=>r[k]?wbSvcName(k)+': '+(r[k].ok?'✓ برقرار':'✗ '+r[k].err):'').filter(Boolean).join(' · '))}catch(x){toast(x.message)}wbTab(bg,'st')};
 $('[data-a=gotf]',B).onclick=()=>wbTab(bg,'tf');
 $('[data-a=cfg]',B).onclick=async()=>{const b={};$$('[data-c]',B).forEach(i=>{b[i.dataset.c]=i.type==='checkbox'?i.checked:i.type==='number'?+i.value:i.value});try{await svApi('/api/web/config',{method:'PUT',body:b});toast('تنظیمات دادهٔ وب ذخیره شد');wbTab(bg,'st')}catch(x){toast(x.message)}};
 $('[data-a=keys]',B).onclick=async()=>{const b={};$$('[data-k]',B).forEach(i=>{if(i.value.trim())b[i.dataset.k]=i.value.trim()});if(!Object.keys(b).length)return toast('کلیدی وارد نشده است');try{await svApi('/api/web/keys',{method:'PUT',body:b});toast('کلیدها روی سرور ذخیره شد');wbTab(bg,'st')}catch(x){toast(x.message)}};
};
WBFN.st=wbStT;

/* Enhance wbRt to include Tavily option in dropdown */
{const _wbRt0=wbRt;wbRt=async function(B,bg){
 await _wbRt0(B,bg);
 const sel=$('select[data-l="via"]',B);
 if(sel){
  sel.innerHTML='<option value="all">Exa + Firecrawl + Tavily</option><option value="tv">فقط Tavily AI</option><option value="exa">فقط Exa</option><option value="fc">فقط Firecrawl</option>';
 }
};WBFN.rt=wbRt}

/* Enhance wbRs to include Tavily AI engine option */
{const _wbRs0=wbRs;wbRs=async function(B,bg){
 await _wbRs0(B,bg);
 const sel=$('select[data-r="engine"]',B);
 if(sel&&!$('option[value="tv"]',sel)){
  sel.insertAdjacentHTML('afterbegin','<option value="tv">Tavily AI Research (پژوهش سریع و مستند وب، حدود ۱٫۶ سنت)</option>');
  sel.value='tv';
 }
};WBFN.rs=wbRs}

/* --- New Tab: «تعرفه و کریدورها» (wbTf) — Multi-Modal Tariff, Surcharge, Border & Customs Hub --- */
const TF_PRESETS=[
 {label:'دریایی: شانگهای ← بندرعباس (40HC)',mode:'sea',pol:'Shanghai (CNSHA)',pod:'Bandar Abbas (IRBND)',eq:'40HC'},
 {label:'دریایی: جبل‌علی ← شهید رجایی (20GP)',mode:'sea',pol:'Jebel Ali (AEJEA)',pod:'Bandar Abbas (IRBND)',eq:'20GP'},
 {label:'جاده‌ای TIR: استانبول ← بازرگان / تهران',mode:'road',pol:'Istanbul Turkey',pod:'Tehran Iran via Bazargan',eq:'TRUCK'},
 {label:'ریلی CIS: سرخس ← بندرعباس (واگن)',mode:'rail',pol:'Sarakhs Turkmenistan Border',pod:'Bandar Abbas Iran',eq:'WAGON'},
 {label:'هوایی کارگو: شنژن ← فرودگاه امام (IKA)',mode:'air',pol:'Shenzhen China (SZX)',pod:'Tehran IKA Airport',eq:'KG'},
 {label:'تعرفه بندری و THC: بندر شهید رجایی',mode:'port',pol:'Shahid Rajaee Port',pod:'Bandar Abbas Container Terminal',eq:'40HC'}
];

const wbTariffCardHtml=t=>{
 const cfMap={'very-high':['تأیید ۳ موتور (بسیار بالا)','lo'],'high':['تأیید ۲ موتور (بالا)','lo'],'medium':['تک‌موتوره (متوسط)','md'],'low':['برآورد اولیه','md']};
 const cf=cfMap[t.conf]||cfMap.medium;
 const surs=Array.isArray(t.surcharges)?t.surcharges:[];
 const quotes=Array.isArray(t.quotes)?t.quotes:[];
 const srcs=Array.isArray(t.sources)?t.sources:[];
 const engs=t.engines||{};
 return `<div class="wb-card" style="margin-bottom:12px;border:1px solid var(--line2,#333)">
  <div class="m" style="display:flex;flex-wrap:wrap;gap:8px;align-items:center;justify-content:space-between">
   <div>
    ${wbBadge(cf[0],cf[1])}
    <b style="font-size:14px;margin-right:6px">${esc(t.corridor||(t.pol+' → '+t.pod))}</b>
    <small style="margin-right:6px">(${esc(t.modeFa||t.mode)} · واحد: <i dir="ltr">${esc(t.eq||t.unit||'40HC')}</i>)</small>
   </div>
   <div style="display:flex;gap:10px;align-items:center">
    ${t.typical!=null?`<b style="font-size:15px;color:#72BC8F">میانه: ${usd(t.typical)}</b>`:'<small>نرخ عددی صریح یافت نشد (خلاصهٔ متنی را ببینید)</small>'}
    ${t.low!=null&&t.high!=null?`<small>بازه: ${usd(t.low)} – ${usd(t.high)}</small>`:''}
    ${t.totalAllInUsd?`<span class="wb-bd2" data-s="lo">کل با سورشارژ: ${usd(t.totalAllInUsd)}</span>`:''}
    ${t.transitDays?`<small>زمان حمل: حدود ${fa(t.transitDays)} روز</small>`:''}
   </div>
  </div>
  <div style="display:flex;flex-wrap:wrap;gap:8px;margin:8px 0">
   ${['tv','fc','exa'].map(k=>{const e=engs[k];if(!e)return '';return `<span style="font-size:11px;padding:2px 8px;border-radius:6px;background:rgba(94,159,232,0.12);border:1px solid rgba(94,159,232,0.3)"><b>${wbSvcName(k)}</b>: ${e.ok?`✓ ${fa(e.results||0)} منبع · ${fa(e.quotesFound||0)} نرخ`:`✗ ${esc(e.err||'خطا')}`}</span>`}).join('')}
   ${t.queuedCount?`<span style="font-size:11px;padding:2px 8px;border-radius:6px;background:rgba(114,188,143,0.15);color:#72BC8F">+${fa(t.queuedCount)} نرخ به صف تأیید بانک نرخ اضافه شد</span>`:''}
  </div>
  ${t.summary?`<p dir="auto" class="wb-ans" style="margin:6px 0;font-size:12.5px;line-height:1.7">${esc(t.summary)}</p>`:''}
  ${surs.length?`<div style="margin:8px 0"><small style="font-weight:600">سورشارژها و هزینه‌های جانبی مسیر:</small><div style="display:flex;flex-wrap:wrap;gap:6px;margin-top:4px">${surs.map(s=>`<span style="font-size:11.5px;padding:3px 8px;background:rgba(224,168,78,0.14);border:1px solid rgba(224,168,78,0.35);border-radius:6px"><b>${esc(s.code)}</b> (${esc(s.name)}): <b>${usd(s.usd)}</b> <small>[${esc(s.engine||'')}]</small></span>`).join('')}</div></div>`:''}
  ${quotes.length?`<details style="margin-top:6px"><summary>نرخ‌های استخراج‌شده به تفکیک موتور (${fa(quotes.length)} مورد)</summary><table class="wb-tb"><thead><tr><th>موتور</th><th>نرخ (USD)</th><th>بازه</th><th>واحد</th><th>زمان حمل</th><th>منبع / توضیح</th></tr></thead><tbody>${quotes.map(q=>`<tr><td><b>${esc(q.engine||'')}</b></td><td dir="ltr"><b>${usd(q.usd)}</b></td><td dir="ltr">${q.low&&q.high?usd(q.low)+' – '+usd(q.high):'—'}</td><td dir="ltr">${esc(q.eq||'')}</td><td>${q.transitDays?fa(q.transitDays)+' روز':'—'}</td><td dir="auto">${q.url?wbA(q.url,q.source||q.snippet||'منبع'):esc(q.snippet||q.source||'')}</td></tr>`).join('')}</tbody></table></details>`:''}
  ${srcs.length?`<details style="margin-top:6px"><summary>منابع و مستندات وب (${fa(srcs.length)} پیوند قابل راستی‌آزمایی)</summary><ul class="wb-src0">${srcs.map(s=>`<li>[${esc(s.engine||'وب')}] ${wbA(s.url,s.title||s.url)}</li>`).join('')}</ul></details>`:''}
 </div>`;
};

async function wbTf(B,bg){
 const L=wbLane();
 const data=await svApi('/api/web/tariffs');
 const borders=data.borders||[];
 const surData=data.surcharges||{items:[],liveExtracted:[]};
 const history=data.items||[];

 const polDef=(L.pol&&(L.pol.en||L.pol.code))||'Shanghai';
 const podDef=(L.pod&&(L.pod.en||L.pod.code))||'Bandar Abbas';

 B.innerHTML=`
 <p class="wb-mu">پایش و استخراج مستمر و هم‌زمان نرخ‌های حمل بین‌المللی (دریایی، جاده‌ای TIR، ریلی، هوایی)، سورشارژهای خطوط (BAF، WRS، PSS، THC)، هزینه‌های ۱۸ مرز بین‌المللی ایران و تعرفه‌های گمرکی/اوراسیا با ترکیب سه موتور هوش مصنوعی <b>Tavily AI</b>، <b>Firecrawl v2 Search</b> و <b>Exa AI</b>.</p>

 <h5>۱) اسکنر سه‌موتورهٔ نرخ و تعرفهٔ کریدورهای بین‌المللی <em>Tavily + Firecrawl + Exa</em></h5>
 <div class="wb-row" style="flex-wrap:wrap;gap:6px;margin-bottom:8px">
  ${TF_PRESETS.map((p,i)=>`<button type="button" class="wb-b" data-pre="${i}" style="font-size:11.5px">${esc(p.label)}</button>`).join('')}
 </div>
 <div class="g wb-add">
  <label>شیوهٔ حمل / نوع تعرفه
   <select data-tf="mode">
    <option value="sea">دریایی (FCL / LCL)</option>
    <option value="road">جاده‌ای بین‌المللی (TIR / کامیون)</option>
    <option value="rail">ریلی بین‌المللی (واگن / کانتینر ریلی)</option>
    <option value="air">هوایی کارگو (Per Kg)</option>
    <option value="port">تعرفه خدمات بندری و THC</option>
   </select>
  </label>
  <label>مبدأ (بندر / شهر / مرز)<input data-tf="pol" dir="ltr" value="${esc(polDef)}" placeholder="Shanghai / Istanbul / Sarakhs"></label>
  <label>مقصد (بندر / شهر / مرز)<input data-tf="pod" dir="ltr" value="${esc(podDef)}" placeholder="Bandar Abbas / Tehran"></label>
  <label>واحد / تجهیزات
   <select data-tf="eq">
    ${['40HC','20GP','40GP','20RF','40RF','LCL','TRUCK','WAGON','KG','CONTAINER'].map(e=>`<option value="${e}" ${e===(L.eq||'40HC')?'selected':''}>${e}</option>`).join('')}
   </select>
  </label>
 </div>
 <div class="wb-row" style="flex-wrap:wrap;gap:12px">
  <button class="wb-b pr" data-tf-go="scan">استخراج و راستی‌آزمایی سه‌موتوره</button>
  <label class="ck"><input type="checkbox" data-tf-eng="tv" checked> Tavily AI (Advanced)</label>
  <label class="ck"><input type="checkbox" data-tf-eng="fc" checked> Firecrawl v2 Search</label>
  <label class="ck"><input type="checkbox" data-tf-eng="exa" checked> Exa Deep-Lite</label>
  <label class="ck"><input type="checkbox" data-tf="force"> بدون کش (استعلام زنده)</label>
 </div>
 <div class="wb-tf-scan-res"></div>

 <h5>۲) ماتریس سورشارژهای بین‌المللی و فرمول سوخت (BAF / WRS / PSS / THC / بوژی) <em>VLSFO سنگاپور: $${fa(Math.round(surData.vlsfo||580))}/mt</em></h5>
 <div class="wb-row">
  <input data-sur="corridor" dir="ltr" value="China East Asia to Persian Gulf Bandar Abbas" style="min-width:280px" placeholder="Corridor e.g. China to Persian Gulf">
  <button class="wb-b pr" data-tf-go="surcharges">استعلام زندهٔ سورشارژهای خطوط از وب (Tavily + Firecrawl)</button>
 </div>
 <div class="wb-tf-sur-res"></div>
 <table class="wb-tb" style="margin-top:8px">
  <thead><tr><th>کد</th><th>شرح سورشارژ / تعرفه</th><th>کریدور</th><th>مبلغ</th><th>واحد</th><th>فرمول / مرجع</th></tr></thead>
  <tbody>
   ${(surData.items||[]).map(s=>`<tr><td dir="ltr"><b>${esc(s.code)}</b></td><td>${esc(s.name)}</td><td>${esc(s.corridor)}</td><td dir="ltr"><b>$${fa(s.usd)}</b></td><td dir="ltr">${esc(s.unit)}</td><td><small>${esc(s.formula)} · ${esc(s.source)}</small></td></tr>`).join('')}
  </tbody>
 </table>
 ${(surData.liveExtracted||[]).length?`<div style="margin-top:8px"><small><b>آخرین سورشارژهای استخراج‌شده از وب:</b></small><div style="display:flex;flex-wrap:wrap;gap:6px;margin-top:4px">${surData.liveExtracted.map(x=>`<span class="wb-bd2" data-s="md">${esc(x.code)}: $${fa(x.usd)} (${esc(x.engine)})</span>`).join('')}</div></div>`:''}

 <h5>۳) ماتریس هزینه‌ها، کارنه تیر، تعویض بوژی و صف ۱۸ مرز بین‌المللی ایران</h5>
 <div class="wb-row">
  <select data-bd="id" style="min-width:220px">
   <option value="">۶ مرز اصلی ترانزیتی (بازرگان، سرخس، آستارا، اینچه‌برون، نوردوز، پرویزخان)</option>
   ${borders.map(b=>`<option value="${esc(b.id)}">${esc(b.name)} (${esc(b.country)})</option>`).join('')}
  </select>
  <button class="wb-b pr" data-tf-go="borders">به‌روزرسانی زندهٔ صف و هزینه‌های مرزی از وب</button>
  <input data-bd="filter" placeholder="فیلتر نام مرز یا کشور (ترکیه، ترکمنستان، عراق…)" style="min-width:220px">
 </div>
 <div class="wb-tf-bd-res"></div>
 <div style="max-height:340px;overflow:auto;margin-top:8px">
  <table class="wb-tb wb-bd-tb">
   <thead><tr><th>مرز</th><th>کشور</th><th>شیوه‌ها</th><th>کارنه تیر</th><th>عوارض مرزی</th><th>سوخت/ترانزیت</th><th>تعویض بوژی</th><th>جمع جاده‌ای</th><th>جمع ریلی</th><th>صف انتظار</th><th>وضعیت</th></tr></thead>
   <tbody>
    ${borders.map(b=>`<tr data-bname="${esc(b.name+' '+b.country+' '+b.corridor)}">
     <td><b>${esc(b.name)}</b><br><small>${esc(b.corridor)}</small></td>
     <td>${esc(b.country)}</td>
     <td>${b.modes.map(m=>m==='rail'?'ریلی':'جاده‌ای').join(' + ')}</td>
     <td dir="ltr">${b.tirUsd?'$'+fa(b.tirUsd):'—'}</td>
     <td dir="ltr">$${fa(b.borderFeeUsd)}</td>
     <td dir="ltr">${b.fuelDiffUsd?'$'+fa(b.fuelDiffUsd):'—'}</td>
     <td dir="ltr">${b.bogieUsd?'$'+fa(b.bogieUsd):'—'}</td>
     <td dir="ltr"><b>${b.totalRoadUsd?'$'+fa(b.totalRoadUsd):'—'}</b></td>
     <td dir="ltr"><b>${b.totalRailUsd?'$'+fa(b.totalRailUsd):'—'}</b></td>
     <td>${fa(b.avgQueueHours)} ساعت</td>
     <td>${wbBadge(b.status==='open'?'باز':b.status==='caution'?'احتیاط/صف':'بسته',b.status==='open'?'lo':b.status==='caution'?'md':'hi')}</td>
    </tr>`).join('')}
   </tbody>
  </table>
 </div>

 <h5>۴) راستی‌آزمایی هوشمند تعرفهٔ گمرکی، کد HS و توافق تجارت آزاد اوراسیا (EAEU FTA)</h5>
 <div class="g wb-add">
  <label>کد HS (۴ تا ۱۰ رقم)<input data-cu="hs" dir="ltr" value="${esc((L.X&&L.X.cargo&&L.X.cargo.hsCode)||'080251')}" placeholder="080251 / 7208 / 8413"></label>
  <label class="w">شرح کالا یا موضوع بخشنامه گمرکی<input data-cu="desc" dir="auto" value="پسته و خشکبار / ورق فولادی / پمپ صنعتی" placeholder="مثلاً: ورق فولادی گرم نوردیده یا قطعات صنعتی"></label>
 </div>
 <div class="wb-row">
  <button class="wb-b pr" data-tf-go="customs">استعلام و راستی‌آزمایی تعرفه گمرکی و بخشنامه‌های وب (Tavily + Exa)</button>
 </div>
 <div class="wb-tf-cu-res"></div>

 <h5>۵) تاریخچهٔ اسکن‌های سه‌موتورهٔ نرخ و تعرفه (${fa(history.length)})</h5>
 <div class="wb-tf-hist">${history.slice(0,12).map(wbTariffCardHtml).join('')||'<p class="wb-mu">هنوز اسکن تعرفه‌ای ثبت نشده است؛ از بخش ۱ بالا یک مسیر را اسکن کنید.</p>'}</div>
 `;

 /* Preset buttons */
 $$('[data-pre]',B).forEach(btn=>btn.onclick=()=>{
  const p=TF_PRESETS[+btn.dataset.pre];if(!p)return;
  $('[data-tf="mode"]',B).value=p.mode;
  $('[data-tf="pol"]',B).value=p.pol;
  $('[data-tf="pod"]',B).value=p.pod;
  $('[data-tf="eq"]',B).value=p.eq;
 });

 /* Border table live filter */
 const bdFilter=$('[data-bd="filter"]',B);
 if(bdFilter)bdFilter.oninput=()=>{
  const q=bdFilter.value.trim();
  $$('.wb-bd-tb tbody tr',B).forEach(tr=>{
   tr.style.display=!q||tr.dataset.bname.includes(q)?'':'none';
  });
 };

 /* 1) Run Tri-Engine Tariff Scan */
 $('[data-tf-go="scan"]',B).onclick=async e=>{
  const mode=$('[data-tf="mode"]',B).value;
  const pol=$('[data-tf="pol"]',B).value.trim();
  const pod=$('[data-tf="pod"]',B).value.trim();
  const eq=$('[data-tf="eq"]',B).value;
  const force=$('[data-tf="force"]',B).checked;
  const engines=$$('[data-tf-eng]:checked',B).map(x=>x.dataset.tfEng);
  if(!pol||!pod)return toast('مبدأ و مقصد را وارد کنید');
  if(!engines.length)return toast('حداقل یک موتور جست‌وجو را انتخاب کنید');
  const box=$('.wb-tf-scan-res',B);
  e.target.disabled=true;
  box.innerHTML='<div class="pl-ld"><i class="sp"></i> در حال کاوش هم‌زمان با موتورهای منتخب ('+engines.map(wbSvcName).join(' + ')+')…</div>';
  try{
   const r=await svApi('/api/web/tariffs/scan',{method:'POST',body:{mode,pol,pod,eq,engines,force}});
   box.innerHTML=wbTariffCardHtml(r);
   wbFoot(bg);
  }catch(x){
   box.innerHTML=`<p class="wb-err">${esc(x.message)}</p>`;
  }
  e.target.disabled=false;
 };

 /* 2) Refresh Surcharges */
 $('[data-tf-go="surcharges"]',B).onclick=async e=>{
  const corridor=$('[data-sur="corridor"]',B).value.trim();
  const box=$('.wb-tf-sur-res',B);
  e.target.disabled=true;
  box.innerHTML='<div class="pl-ld"><i class="sp"></i> استخراج آخرین سورشارژهای اعلام‌شده (BAF, WRS, PSS, GRI, THC) با Tavily و Firecrawl…</div>';
  try{
   const r=await svApi('/api/web/tariffs/surcharges',{method:'POST',body:{corridor}});
   box.innerHTML=`<div class="wb-card"><div class="m"><b>✓ بروزرسانی سورشارژهای کریدور ${esc(r.corridor)}</b><small>${wbD(r.usd)}</small></div>
    ${(r.extracted||[]).length?`<div style="display:flex;flex-wrap:wrap;gap:6px;margin:6px 0">${r.extracted.map(s=>`<span class="wb-bd2" data-s="lo">${esc(s.code)}: $${fa(s.usd)} (${esc(s.engine)})</span>`).join('')}</div>`:'<p class="wb-mu">سورشارژها از منابع وب بررسی و جدول بروزرسانی شد.</p>'}
    ${wbSrcL(r.sources)}
   </div>`;
   wbFoot(bg);
  }catch(x){box.innerHTML=`<p class="wb-err">${esc(x.message)}</p>`}
  e.target.disabled=false;
 };

 /* 3) Refresh Borders */
 $('[data-tf-go="borders"]',B).onclick=async e=>{
  const borderId=$('[data-bd="id"]',B).value;
  const box=$('.wb-tf-bd-res',B);
  e.target.disabled=true;
  box.innerHTML='<div class="pl-ld"><i class="sp"></i> پایش زندهٔ وضعیت، صف کامیون و عوارض مرزی از منابع وب…</div>';
  try{
   const r=await svApi('/api/web/tariffs/borders/refresh',{method:'POST',body:{borderId}});
   box.innerHTML=`<div class="wb-card"><div class="m"><b>✓ وضعیت ${fa((r.updates||[]).length)} گذرگاه مرزی از وب بروزرسانی شد</b><small>${wbD(r.usd)}</small></div>
    ${(r.updates||[]).map(u=>`<div style="margin-top:6px;padding-top:6px;border-top:1px solid #2a2a2a"><b>${esc(u.name)}</b> — صف انتظار: <b>${fa(u.avgQueueHours)} ساعت</b> · وضعیت: ${u.status==='open'?'باز':'احتیاط'}
     ${(u.signals||[]).map(s=>`<div style="font-size:11.5px;color:#aaa;margin-top:2px">• [${esc(s.engine)}] ${s.url?wbA(s.url,s.title):esc(s.title)}: ${esc((s.snip||'').slice(0,180))}</div>`).join('')}
    </div>`).join('')}
   </div>`;
   wbFoot(bg);
  }catch(x){box.innerHTML=`<p class="wb-err">${esc(x.message)}</p>`}
  e.target.disabled=false;
 };

 /* 4) Customs & EAEU Verification */
 $('[data-tf-go="customs"]',B).onclick=async e=>{
  const hs=$('[data-cu="hs"]',B).value.trim();
  const desc=$('[data-cu="desc"]',B).value.trim();
  if(!hs&&!desc)return toast('کد HS یا شرح کالا را وارد کنید');
  const box=$('.wb-tf-cu-res',B);
  e.target.disabled=true;
  box.innerHTML='<div class="pl-ld"><i class="sp"></i> استعلام هم‌زمان از نومنکلاتور WCO HS 2022، کتاب مقررات صادرات و واردات، توافق اوراسیا و جست‌وجوی زندهٔ Tavily AI…</div>';
  try{
   const r=await svApi('/api/web/tariffs/customs',{method:'POST',body:{hs,desc}});
   const H=r.hsInfo||{};
   box.innerHTML=`<div class="wb-card">
    <div class="m"><b>نتیجهٔ راستی‌آزمایی تعرفه گمرکی و اوراسیا</b><small>نرخ ارز گمرکی مبنا: ${fa(r.customsFxIrr.toLocaleString('en-US'))} ریال · مالیات ارزش افزوده: ${fa(r.vatPct)}٪ · هزینه وب: ${wbD(r.usd)}</small></div>
    ${H.heading||H.chapter?`<div class="kv"><span>تطبیق نومنکلاتور جهانی (WCO HS 2022)</span><em>فصل ${esc(H.chapter?.code||'')}: ${esc(H.chapter?.fa||H.chapter?.en||'')} ${H.heading?' · ردیف '+esc(H.heading.code)+': '+esc(H.heading.fa||H.heading.en||''):''}</em></div>`:''}
    ${r.eaeu?`<div class="kv"><span>موافقت‌نامه تجارت آزاد ایران و اوراسیا (EAEU FTA)</span><em>${r.eaeu.prefPct===0?'<b style="color:#72BC8F">تعرفه ترجیحی ۰٪ (معاف از حقوق گمرکی با گواهی مبدأ CT-3)</b>':r.eaeu.prefPct!=null?'تعرفه ترجیحی '+fa(r.eaeu.prefPct)+'٪':'بررسی ردیف ۸ رقمی'} — ${esc(r.eaeu.note||'')}</em></div>`:''}
    ${(r.webFindings||[]).map(w=>`<p dir="auto" class="wb-ans" style="margin-top:8px"><b>[${esc(w.engine)}]</b> ${esc(w.summary)}</p>`).join('')}
    ${wbSrcL(r.sources)}
   </div>`;
   wbFoot(bg);
  }catch(x){box.innerHTML=`<p class="wb-err">${esc(x.message)}</p>`}
  e.target.disabled=false;
 };
}

WBFN.tf=wbTf;
Object.assign(IFA.web,{
 tariffs:mode=>svApi('/api/web/tariffs'+(mode?'?mode='+encodeURIComponent(mode):'')),
 tariffScan:b=>svApi('/api/web/tariffs/scan',{method:'POST',body:b||{}}),
 surchargesRefresh:corridor=>svApi('/api/web/tariffs/surcharges',{method:'POST',body:{corridor}}),
 bordersRefresh:borderId=>svApi('/api/web/tariffs/borders/refresh',{method:'POST',body:{borderId}}),
 customsVerify:(hs,desc)=>svApi('/api/web/tariffs/customs',{method:'POST',body:{hs,desc}}),
 tavilySearch:(query,depth)=>svApi('/api/web/tavily/search',{method:'POST',body:{query,depth}}),
 fcSearch:query=>svApi('/api/web/firecrawl/search',{method:'POST',body:{query}})
});
