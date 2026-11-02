---
name: wco-hs-eaeu-classifier
title: طبقه‌بندی تعرفه گمرکی WCO HS 2022 و موافقت‌نامه تجارت آزاد اوراسیا (WCO GRI & EAEU Classifier)
description: تعیین کد ۶ و ۸ رقمی تعرفه گمرکی بر اساس قواعد شش‌گانهٔ GRI سازمان جهانی گمرک، محاسبهٔ حقوق ورودی ایران، مالیات ارزش افزوده و معافیت‌های اوراسیا (EAEU FTA).
repo: anthropics/skills/wco-hs-classifier
version: 2.3.0
category: customs-tariff
agents: [docs, analyst, assist]
tools: [hs_suggest, tavily_search, border_tariffs]
---

# مهارت طبقه‌بندی تعرفه گمرکی و توافق اوراسیا (`wco-hs-eaeu-classifier`)

## ۱. قواعد عمومی تفسیر سیستم هماهنگ‌شده (WCO General Rules of Interpretation - GRI 1 to 6)
1. **قاعدهٔ ۱ (GRI 1):** عناوین قسمت‌ها و فصل‌ها صرفاً راهنما هستند؛ طبقه‌بندی قانونی بر اساس متن ردیف‌های تعرفه (Headings) و یادداشت‌های مقدماتی قسمت یا فصل انجام می‌شود.
2. **قاعدهٔ ۲ الف و ب (GRI 2a / 2b):** کالای غیرکامل، ناتمام یا پیاده‌شده (CKD/SKD) در صورتی که ویژگی اساسی کالای کامل را داشته باشد، در ردیف کالای کامل طبقه‌بندی می‌شود.
3. **قاعدهٔ ۳ (GRI 3a / 3b / 3c):** برای کالاهای مخلوط یا مجموعه‌ها (Sets):
   - `3a`: ردیف اخص بر اعم مقدم است (Specific over General).
   - `3b`: بر اساس ماده یا جزئی که **ویژگی اساسی (Essential Character)** را به کالا می‌دهد.
   - `3c`: در صورت تساوی، آخرین ردیف به ترتیب عددی.

## ۲. فرمول محاسبهٔ حقوق ورودی و مالیات در گمرک ایران
- **ارزش سیف ریالی ($\text{CIF}_{\text{IRR}}$):**
  $$\text{CIF}_{\text{IRR}} = (\text{FOB} + \text{Freight} + \text{Insurance}) \times \text{FX}_{\text{customs}}$$
- **حقوق ورودی ($\text{Customs Duty}$):**
  $$\text{Duty}_{\text{IRR}} = \text{CIF}_{\text{IRR}} \times \frac{\text{TariffRate}\%}{100}$$
  *(در صورت شمول موافقت‌نامهٔ تجارت آزاد ایران و اتحادیه اقتصادی اوراسیا EAEU FTA و ارائهٔ گواهی مبدأ فرم CT-3، برای ۸۷٪ ردیف‌ها $\text{TariffRate} = 0\%$ منظور می‌گردد).*
- **مالیات بر ارزش افزوده ($\text{VAT}$):**
  $$\text{VAT}_{\text{IRR}} = (\text{CIF}_{\text{IRR}} + \text{Duty}_{\text{IRR}}) \times 10\%$$
