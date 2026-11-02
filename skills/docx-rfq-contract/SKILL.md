---
name: docx-rfq-contract
title: نگارش دوزبانهٔ استعلام قیمت و قرارداد حمل (Bilingual RFQ & SOP Builder)
description: تولید اسناد رسمی درخواست پیشنهاد قیمت (RFQ)، شرایط عمومی حمل (SOP/SLA) و مکاتبات رسمی دوزبانه (فارسی/انگلیسی) با بندهای حفاظتی دموراژ و سقف WRS.
repo: anthropics/skills/skills/docx
version: 1.9.0
category: documents
agents: [procurement, customer]
tools: [rfq_draft, rfq_send, customer_reply]
---

# مهارت نگارش دوزبانهٔ استعلام قیمت و قرارداد (`docx-rfq-contract`)

## ۱. بندهای الزامی در هر استعلام قیمت (Mandatory RFQ Clauses)
1. **تفکیک کامل هزینه‌ها (Full Itemization):** فورواردر موظف است کرایهٔ پایه (Main Ocean/Rail/Road Freight) و تمامی سرشارژها (BAF, THC, WRS, PSS, DOC, DO, Seal, Telex Release) را به تفکیک اعلام کند.
2. **سقف قطعی سرشارژ ریسک جنگ (Firm War Risk Surcharge Cap):** عبارات مبهم مانند `WRS as per carrier` پذیرفته نمی‌شود و باید سقف دلاری هر کانتینر درج گردد.
3. **زمان آزاد کانتینر در مقصد (Destination Free Time):** برای بنادر ایران (بندرعباس/چابهار/انزلی) حداقل **۱۴ تا ۲۱ روز تقویمی** زمان آزاد ترکیبی (Combined Demurrage & Detention) درخواست شود.
4. **تعهد زمان ترانزیت و کشتی (Schedule & Transshipment):** ذکر نام خط کشتیرانی، بندر ترانشیپ (مثلاً جبل‌علی یا مستقیم) و حداکثر زمان ترانزیت (T/T).
