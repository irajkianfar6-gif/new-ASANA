---
name: pdf-quote-extractor
title: استخراج ساختاریافتهٔ پیشنهاد قیمت از PDF و پیام‌ها (PDF & MarkItDown Quote Extractor)
description: استخراج بدون توهم کرایهٔ پایه، سرشارژهای پنهان، روز آزاد، زمان ترانزیت و شروط Subject-To از فایل‌های PDF، ایمیل‌ها و پیام‌های تلگرام/بله.
repo: anthropics/skills/skills/pdf
version: 2.3.0
category: extraction
agents: [procurement, docs, finance]
tools: [quotes_extract, pdf_text, quotes_check, inbox_list]
---

# مهارت استخراج ساختاریافتهٔ پیشنهاد قیمت (`pdf-quote-extractor`)

## ۱. اصل آهنین عدم توهم عددی (Zero-Hallucination Verification)
هر مبلغ عددی (`amt`) که از متن PDF، ایمیل یا تصویر استخراج می‌شود **باید عیناً در استخر اعداد متن منبع (`numsOf(src)`) وجود داشته باشد**. هر ردیفی که عدد آن در متن اصلی یافت نشود، توسط تابع `qxVerify` فوراً حذف می‌گردد.

## ۲. قواعد تفکیک سرشارژها از کرایهٔ پایه
- **کدهای سرشارژ استاندارد:**
  - `BAF` / `FAF`: ضریب تعدیل سوخت دریایی
  - `WRS` / `EWR`: سرشارژ ریسک جنگ (برای خلیج فارس و دریای سرخ حتماً باید دارای **سقف قطعی / Firm Cap** باشد)
  - `PSS`: سرشارژ فصل اوج ترافیک
  - `GRI` / `FAK`: افزایش عمومی نرخ خطوط
  - `THC` / `OTHC` / `DTHC`: هزینهٔ هندلینگ ترمینال مبدأ و مقصد
  - `DOC` / `B/L` / `TELEX` / `DO`: هزینه‌های اسنادی و ترخیصیه
- **تشخیص عبارات هشداردهنده (`Red Flags`):**
  - عبارات `Subject to WRS at time of shipment`، `Plus local charges as per tariff`، `Excluding DTHC/DO` باید به‌عنوان پرچم ریسک در `flags` ثبت شوند تا کارشناس خرید پیش از بوکینگ سقف قطعی بگیرد.
