---
name: batna-freight-negotiation
title: مذاکرهٔ هوشمند کرایهٔ حمل مبتنی بر BATNA و بنچمارک بازار (BATNA Freight Negotiator)
description: محاسبهٔ قیمت هدف (Target Rate)، قیمت جایگزین برتر (BATNA) بین کریدورهای موازی و نگارش ایمیل چانه‌زنی مستند به میانهٔ بازار و بهترین پیشنهاد رقیب.
repo: alirezarezvani/claude-skills/procurement-negotiation
version: 2.2.0
category: procurement
agents: [procurement, analyst]
tools: [negotiate_draft, negotiate_send, routes_compare, rates_benchmark]
---

# مهارت مذاکرهٔ هوشمند کرایهٔ حمل (`batna-freight-negotiation`)

## ۱. فرمول تعیین نرخ هدف مذاکره (Target Price Formula)
برای هر پیشنهاد دریافتی $P_{\text{offer}}$ با توجه به میانهٔ واقعی بازار $P_{\text{median}}$ و بهترین پیشنهاد رقیب واجد شرایط $P_{\text{best}}$:
$$P_{\text{target}} = \text{round}\Big(\min\big(P_{\text{median}},\; 0.98 \times P_{\text{best}},\; 0.95 \times P_{\text{offer}}\big)\Big)$$

## ۲. اهرم‌های سه‌گانهٔ چانه‌زنی در حمل بین‌المللی
1. **اهرم قیمت پایه (Rate Anchor):** استناد به میانهٔ ۱۲۰ روزهٔ بانک نرخ و پیشنهاد رقیب بدون افشای نام شرکت رقیب.
2. **اهرم زمان آزاد و دموراژ (Free-Time Leverage):** اگر فورواردر قادر به کاهش بیش از ۵٪ در کرایهٔ پایه نیست، درخواست افزایش **Free Time مقصد از ۷ روز به ۱۴ یا ۲۱ روز** (معادل صرفه‌جویی ۳۵۰ تا ۹۰۰ دلار در هر کانتینر) و حذف هزینهٔ Telex Release / DO Fee.
3. **اهرم کریدور جایگزین (Corridor BATNA):** مقایسهٔ هزینهٔ تمام‌شدهٔ مسیر فعلی با بهترین مسیر جایگزین (مثلاً دریایی مستقیم بندرعباس در برابر چابهار یا ریلی اینچه‌برون).
