---
name: firecrawl-carrier-advisory
title: اسکرپینگ و استخراج اطلاعیه‌های خطوط کشتیرانی و مرزها (Firecrawl Carrier & Border Scraper)
description: پایش و استخراج ساختاریافتهٔ اطلاعیه‌های سرشارژ اضطراری (WRS, EBS, GRI, PSS)، تغییر مسیر کشتی‌ها و صف کامیون در ۱۸ مرز بین‌المللی ایران.
repo: mendableai/firecrawl-mcp-server
version: 2.4.0
category: web-intelligence
agents: [risk, analyst, procurement]
tools: [fc_search, tavily_search, tariff_scan, news_scan, border_tariffs]
---

# مهارت استخراج اطلاعیه‌های کشتیرانی و مرزی (`firecrawl-carrier-advisory`)

## ۱. پروتکل راستی‌آزمایی سه‌موتوره (Tri-Engine Cross-Verification)
- ترکیب نتایج **Tavily AI (جستجوی عمیق تحلیلی)**، **Firecrawl v2 (اسکرپینگ مستقیم جداول و اطلاعیه‌ها)** و **Exa AI (جستجوی معنایی با Grounding)**.
- ضرایب اطمینان (`Confidence Tier`):
  - توافق هر ۳ موتور (`very-high`): انحراف معیار کمتر از ۱۰٪ بین اعداد استخراج‌شده.
  - توافق ۲ موتور (`high`): تأیید متقاطع از دو منبع مستقل.
  - تک‌منبع (`medium` / `low`): نیازمند تأیید کارشناس پیش از اعمال در بانک نرخ.

## ۲. قواعد پیشنهاد تغییر وضعیت کریدور (`routes_set_status`)
- تغییر وضعیت یک کریدور به **`closed` (بسته)** تنها زمانی پیشنهاد می‌شود که **حداقل ۲ خبر مستقل از ۲ دامنهٔ خبری متفاوت** بر انسداد کامل مسیر دلالت داشته باشند.
- تمامی پیشنهادهای تغییر وضعیت کریدور باید همراه با لینک منبع معتبر (`source URL`) به کارتابل تأیید انسانی ارسال شوند.
