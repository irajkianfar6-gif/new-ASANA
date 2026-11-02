---
name: geopolitical-contingency-routing
title: تحلیل ریسک ژئوپلیتیک و مسیریابی اضطراری کریدورها (Contingency Corridor Router)
description: شبیه‌سازی سناریوهای انسداد تنگه هرمز، باب‌المندب، سرخس یا بازرگان، محاسبهٔ هزینهٔ خواب سرمایه و رتبه‌بندی خودکار مسیرهای جایگزین.
repo: alirezarezvani/claude-skills/risk-management
version: 2.0.0
category: risk
agents: [risk, tracker, assist, procurement]
tools: [routes_list, routes_compare, border_tariffs, routes_set_status]
---

# مهارت مسیریابی اضطراری و تحلیل سناریوی ریسک (`geopolitical-contingency-routing`)

## ۱. مدل ریاضی هزینهٔ کل کریدور با احتساب ریسک و خواب سرمایه
برای هر کریدور $r$ با کرایهٔ بین‌المللی $F_{\text{main}}$، کرایهٔ جاده‌ای داخلی $F_{\text{dom}}$، تعداد کانتینر $Q$، ارزش کل محموله $V$، زمان ترانزیت میانه $D$ روز، نرخ هزینهٔ سرمایهٔ سالانه $C_{\text{carry}}$ و ضریب ریسک وضعیت مسیر $R_{\text{status}}$:
$$\text{CarryCost} = V \times \frac{C_{\text{carry}}}{100} \times \frac{D}{365}$$
$$\text{RiskPremium} = V \times \frac{R_{\text{status}}}{100} \quad (\text{Open}=0.2\%,\; \text{Caution}=1.0\%,\; \text{Closed}=5.0\%)$$
$$\text{TotalCost}_r = Q \times (F_{\text{main}} + F_{\text{dom}}) + \text{CarryCost} + \text{RiskPremium}$$

## ۲. ماتریس جایگزینی فوری کریدورها (Contingency Switchboard)
- **در صورت انسداد یا ازدحام شدید بندرعباس (`sea-bnd`):**
  1. برای کالاهای با ارزش بالا یا مهلت تحویل زیر ۲۵ روز ← سوئیچ به **ریلی چین–قزاقستان–ترکمنستان (`rail-kz` از مرز سرخس یا اینچه‌برون)**.
  2. برای بارهای سنگین/حجیم ← سوئیچ به **بندر چابهار (`sea-chb`)** در خارج از تنگه هرمز.
- **در صورت صف طولانی واگن در سرخس (`IR-SRK`):**
  - تغییر مرز ورودی ریلی به **اینچه‌برون (`IR-INC`)** یا مسیر ترکیبی **آکتائو + دریای خزر (`casp`)**.
