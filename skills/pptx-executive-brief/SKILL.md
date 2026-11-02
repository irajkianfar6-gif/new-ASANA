---
name: pptx-executive-brief
title: گزارش‌ساز مدیریتی و تحلیل سری زمانی شاخص‌ها (Executive Brief & Forecasting)
description: تبدیل داده‌های شاخص‌های جهانی (SCFI, CCFI, WCI, FBX, VLSFO) و نوسانات ارزی به گزارش‌های تصمیم‌ساز هیئت‌مدیره با باند عدم‌قطعیت ۸۰٪.
repo: anthropics/skills/skills/pptx
version: 2.0.0
category: reporting
agents: [analyst, assist]
tools: [market_indices, market_forecast, report_daily, report_weekly, fx_get]
---

# مهارت گزارش‌ساز مدیریتی و پیش‌بینی بازار (`pptx-executive-brief`)

## ۱. ساختار استاندارد گزارش مدیریتی (۴ اسلاید / ۴ بخش کلیدی)
1. **خلاصهٔ اجرایی (Executive Summary):** حداکثر ۴ گزارهٔ عددی مستند دربارهٔ وضعیت فعلی شاخص‌ها، نرخ دلار آزاد/نیما و وضعیت کریدورهای ۶گانه.
2. **تحلیل روند شاخص‌ها و سوخت (Market & Bunker Drift):**
   - محاسبهٔ بازده لگاریتمی هفتگی با تعدیل محافظه‌کارانهٔ ۵۰٪:
     $$\mu = 0.5 \times \frac{1}{N}\sum \frac{\ln(V_t / V_{t-1})}{\sqrt{\Delta t}}$$
   - بازهٔ اطمینان ۸۰٪ در افق $h$ هفته:
     $$[\hat{V}_h \cdot e^{-1.2816 \sigma \sqrt{h}},\; \hat{V}_h \cdot e^{+1.2816 \sigma \sqrt{h}}]$$
3. **ریسک‌ها و ناهنجاری‌های بانک نرخ:** فهرست پیشنهادهای مشکوک به ارزانی (احتمال سرشارژ پنهان در مقصد) و پیشنهادهای بالاتر از صدک ۷۵ بازار.
4. **اقدام‌های پیشنهادی کمیتهٔ خرید (Actionable Recommendations):**
   - زمان بهینهٔ قفل کردن نرخ (Spot vs. Quarterly Contract)
   - جابه‌جایی سهمیهٔ بار بین کریدور دریایی بندرعباس، چابهار و ریلی سرخس/اینچه‌برون.
