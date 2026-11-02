---
name: xlsx-tariff-modeling
title: مدل‌سازی صفحات گسترده و جداول تعرفه (XLSX & CSV Tariff Modeler)
description: پارس کردن، نرمال‌سازی و تحلیل آماری جداول نرخ چندبرگی فورواردرها، تعرفه‌های بندری (THC) و کشف ناهنجاری‌های قیمتی (MAD Z-Score).
repo: anthropics/skills/skills/xlsx
version: 2.1.0
category: analytics
agents: [analyst, procurement, finance]
tools: [rates_search, rates_benchmark, rates_anomalies, quotes_extract]
---

# مهارت مدل‌سازی صفحات گسترده و جداول تعرفه (`xlsx-tariff-modeling`)

## ۱. هدف و دامنهٔ کاربرد
این مهارت بر پایهٔ استاندارد رسمی `anthropics/skills/xlsx` و `csv-data-summarizer` طراحی شده تا عامل‌های **تحلیل‌گر بازار (`analyst`)**، **کارشناس خرید (`procurement`)** و **ممیز مالی (`finance`)** بتوانند جداول پیچیدهٔ نرخ‌نامه (Rate Sheets) را بدون خطای ستونی یا واحدی استخراج و تحلیل کنند.

## ۲. قواعد استخراج و نرمال‌سازی جداول نرخ
1. **تفکیک ستون‌های تجهیز (Equipment Normalization):**
   - `20'`, `20DC`, `20GP`, `TEU` ← نرمال‌سازی به **`20GP`**
   - `40'`, `40DC`, `40GP`, `FEU` ← نرمال‌سازی به **`40GP`**
   - `40HC`, `40HQ`, `40' High Cube` ← نرمال‌سازی به **`40HC`**
   - `40RF`, `40RH`, `Reefer` ← نرمال‌سازی به **`40RH`**
2. **کنترل نسبت کانتینر ۴۰ به ۲۰ فوت (`40ft / 20ft Ratio`):**
   - نسبت متعارف بازار دریایی بین **`1.25` تا `1.85`** است. اگر پیشنهاد قیمت خارج از بازهٔ `[1.25, 2.10]` باشد، پرچم `ratio_anomaly` ثبت شود.
3. **فرمول تشخیص ناهنجاری آماری (Modified Z-Score با میانهٔ قدرمطلق انحراف MAD):**
   - $\text{Median} = M = \text{median}(X)$
   - $\text{MAD} = \text{median}(|X_i - M|)$
   - $Z_{\text{MAD}} = \frac{0.6745 \times (X_i - M)}{\text{MAD}}$
   - هر نرخی با $|Z_{\text{MAD}}| > 3.5$ به‌عنوان ناهنجاری قیمتی (`Outlier`) علامت‌گذاری می‌شود (`suspicious-cheap` یا `expensive`).

## ۳. چک‌لیست ممیزی شیت‌های اکسل فورواردرها
- [ ] آیا نرخ اعلامی **All-In** است یا **Base Ocean Freight (FILO/LIFO)**؟
- [ ] آیا سرشارژهای **BAF, CAF, EBS, WRS, PSS, OTHC, DTHC** در ستون جداگانه یا پاورقی جدول آمده‌اند؟
- [ ] آیا تاریخ اعتبار (`Validity / Effective To`) به میلادی و جلالی کنترل شده است؟
- [ ] آیا تعداد روزهای آزاد مقصد (`Free Time at POD`) حداقل ۱۴ روز است؟
