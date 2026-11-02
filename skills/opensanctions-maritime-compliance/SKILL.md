---
name: opensanctions-maritime-compliance
title: غربالگری تحریم‌های دریایی، پرچم کشتی و ذی‌نفع نهایی (OpenSanctions Maritime Screener)
description: تطبیق فازی و دقیق نام شرکت‌ها، بانک‌ها، کشتی‌ها (شماره IMO) و مالکان ذی‌نفع (UBO) با فهرست‌های OFAC SDN، سازمان ملل (UN) و اتحادیه اروپا (EU).
repo: opensanctions/opensanctions
version: 2.1.0
category: compliance
agents: [risk, docs, procurement]
tools: [sanctions_screen, web_party]
---

# مهارت غربالگری تحریم‌های دریایی و طرفین تجاری (`opensanctions-maritime-compliance`)

## ۱. الگوریتم نرمال‌سازی و تطبیق نام (Entity Resolution)
1. حذف پسوندهای حقوقی عام (`Co, Ltd, Limited, Inc, LLC, FZE, FZCO, Shipping, Logistics, Trading, PJSC, GmbH`) و نرمال‌سازی یونیکد (`NFKD`).
2. امتیازدهی تطابق (`Match Score`):
   - `1.00`: تطابق کامل کلید نرمال‌شده با نام اصلی یا Alias ثبت‌شده در فهرست تحریم.
   - `0.90`: حضور تمامی توکن‌های کلید تحریمی در نام طرف معامله (ریسک بالا — مسدودسازی خودکار در ارسال RFQ).
   - `0.85`: شباهت زیرمجموعه‌ای توکن‌ها (ریسک متوسط — نیازمند بررسی شماره ثبت، کشور و تاریخ تولد/IMO).

## ۲. چک‌لیست ۵گانهٔ انطباق دریایی (Maritime Due Diligence)
- [ ] غربالگری نام **Shipper**, **Consignee**, **Notify Party** و **Forwarder/Carrier**.
- [ ] بررسی نام کشتی (`Vessel Name`) و شمارهٔ ۷ رقمی **IMO** در برابر لیست کشتی‌های تحریمی.
- [ ] کنترل پرچم کشتی (`Flag State`) و باشگاه بیمهٔ P&I.
- [ ] بررسی سابقهٔ خاموش کردن سیستم AIS (Dark Activity / Spoofing) یا انتقال کشتی‌به‌کشتی (STS) مشکوک در ۹۰ روز اخیر.
