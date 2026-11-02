---
name: multilingual-logistics-comms
title: ارتباطات چندزبانه و بومی‌سازی اصطلاحات لجستیک (Multilingual Logistics Comms)
description: نگارش پیام‌های رسمی و فوری وضعیت محموله به فارسی، انگلیسی، چینی و روسی متناسب با کانال ارتباطی (ایمیل، بله، تلگرام، پیامک) بدون افشای اطلاعات محرمانه.
repo: anthropics/skills/skills/internal-comms
version: 2.0.0
category: customer-comms
agents: [customer, procurement, tracker]
tools: [shipments_list, customer_reply, routes_list]
---

# مهارت ارتباطات چندزبانه و اطلاع‌رسانی مشتری (`multilingual-logistics-comms`)

## ۱. استانداردهای نگارش پیام بر اساس کانال ارتباطی
1. **پیامک و پیام‌رسان بله/تلگرام (`SMS / Bale / Telegram`):**
   - حداکثر ۳ تا ۴ خط کوتاه، شامل: **مرجع پرونده (`Ref`)**، **شماره کانتینر (`Container`)**، **آخرین مرحلهٔ انجام‌شده**، **مرحلهٔ بعدی و تاریخ برنامه‌ریزی‌شده (`ETA`)**.
2. **ایمیل رسمی مشتری (`Formal Email Update`):**
   - شامل جدول خلاصهٔ وضعیت، وضعیت مدارک ترخیص (قبض انبار، ترخیصیه، بارنامهٔ ظهرنویسی‌شده) و راهنمای اقدام بعدی مشتری.
3. **واژه‌نامهٔ استاندارد چهارزبانه (FA / EN / ZH / RU):**
   - ترخیصیه: `Delivery Order (D/O)` · `提货单` · `Ордер на выдачу`
   - قبض انبار الکترونیکی: `Electronic Warehouse Receipt` · `电子仓单` · `Складская квитанция`
   - دموراژ و حق توقف: `Demurrage & Detention (D&D)` · `滞期费与滞箱费` · `Демередж и детеншн`
   - ترانشیپ: `Transshipment` · `中转 / 转运` · `Трансшипмент`
