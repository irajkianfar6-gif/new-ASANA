---
name: dcsa-ripple-tracker
title: رهگیری استاندارد DCSA و تحلیل زنجیره‌ای تأخیر محموله (DCSA Track & Ripple Delay Analyzer)
description: استانداردسازی رویدادهای کانتینر و کشتی بر پایهٔ کدهای جهانی DCSA و محاسبهٔ اثر دومینویی تأخیر بر کات‌آف‌های VGM/SI/CY، فیدر ترانشیپ و زمان آزاد مقصد.
repo: modelcontextprotocol/servers/sequentialthinking
version: 2.0.0
category: operations
agents: [tracker, customer, risk]
tools: [shipments_list, shipments_overdue, web_vessel, team_notify, customer_reply]
---

# مهارت رهگیری استاندارد DCSA و تحلیل اثر موجی تأخیر (`dcsa-ripple-tracker`)

## ۱. نگاشت رویدادهای استاندارد جهانی کشتیرانی (DCSA Event Taxonomy)
- `GTOT` (Gate Out Empty): تحویل کانتینر خالی از دپو به شیپر
- `GTIN` (Gate In Full): ورود کانتینر پر به ترمینال بندر مبدأ (کنترل کات‌آف `CY` و `VGM`)
- `LOAD` (Loaded on Vessel): بارگیری کانتینر روی کشتی مادر یا فیدر
- `DEPA` (Vessel Departure): حرکت کشتی از بندر بارگیری (`ATD`)
- `ARRI` (Vessel Arrival): ورود کشتی به بندر ترانشیپ یا مقصد (`ATA`)
- `DISC` (Discharged from Vessel): تخلیهٔ کانتینر در بندر مقصد (شروع شمارش `Demurrage Free Time`)
- `GTOT_FULL` (Gate Out Full at POD): خروج کانتینر از بندر مقصد برای حمل داخلی (شروع شمارش `Detention`)
- `RTNE` (Empty Returned): عودت کانتینر خالی به دپوی خط کشتیرانی (پایان کامل مسئولیت دموراژ/دیتنشن)

## ۲. تحلیل زنجیره‌ای اثر تأخیر (Sequential Ripple Effect)
هر زمان در مرحلهٔ $k$ تأخیری به میزان $\Delta t$ ساعت رخ دهد:
1. محاسبهٔ ریسک از دست رفتن کشتی فیدر در بندر ترانشیپ (مثلاً جبل‌علی ← بندرعباس): اگر $\Delta t > \text{Buffer}_{\text{transshipment}}$، تأخیر نهایی به میزان فاصلهٔ سرویس فیدر بعدی (+۵ تا +۷ روز) افزایش می‌یابد.
2. بررسی انقضای کوتاژ ثبت سفارش، اعتبار اسنادی (L/C Latest Shipment Date) و نوبت ناوگان حمل داخلی.
