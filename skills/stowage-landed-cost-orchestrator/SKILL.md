---
name: stowage-landed-cost-orchestrator
title: شبیه‌ساز قیمت تمام‌شدهٔ کالا و بهینه‌ساز چیدمان کانتینر (Landed Cost & 3D Stowage Engine)
description: محاسبهٔ مهندسی قیمت تمام‌شدهٔ واردات در انبار مقصد (Landed Cost)، بهینه‌سازی چیدمان پالت و کارتن در کانتینر (3D Bin Packing) و ارکستریشن فلوهای MCP.
repo: anthropics/skills/mcp-builder
version: 2.3.0
category: orchestration-calc
agents: [assist, flow, analyst, procurement]
tools: [routes_compare, fx_get, domestic_tariff, border_tariffs, hs_suggest]
---

# مهارت شبیه‌ساز قیمت تمام‌شده و چیدمان کانتینر (`stowage-landed-cost-orchestrator`)

## ۱. استاندارد ابعاد و ظرفیت واقعی کانتینرها (Container Usable Capacity)
- **کانتینر ۲۰ فوت استاندارد (`20GP`):**
  - ابعاد داخلی: $589 \times 235 \times 239\text{ cm}$
  - حجم اسمی: $33.2\text{ CBM}$ · ظرفیت عملی چیدمان (۸۵٪): **$28.0\text{ CBM}$** · حداکثر وزن بار: **$28,200\text{ kg}$** (در جاده‌های ایران حداکثر وزن ناخالص مجاز کشنده + کانتینر = ۲۲ تا ۲۴ تن بار خالص).
  - ظرفیت پالت استاندارد اروپا ($120 \times 80\text{ cm}$): **۱۱ پالت** در یک طبقه · پالت صنعتی ($120 \times 100\text{ cm}$): **۹ تا ۱۰ پالت**.
- **کانتینر ۴۰ فوت استاندارد (`40GP`):**
  - ابعاد داخلی: $1203 \times 235 \times 239\text{ cm}$ · حجم اسمی: $67.7\text{ CBM}$ · ظرفیت عملی: **$58.0\text{ CBM}$** · پالت اروپا: **۲۵ پالت** · پالت صنعتی: **۲۰ تا ۲۱ پالت**.
- **کانتینر ۴۰ فوت های‌کیوب (`40HC`):**
  - ابعاد داخلی: $1203 \times 235 \times 269\text{ cm}$ · حجم اسمی: $76.3\text{ CBM}$ · ظرفیت عملی: **$66.0\text{ CBM}$** · پالت اروپا: **۲۵ پالت** (با ارتفاع بارگیری بیشتر).

## ۲. فرمول کامل قیمت تمام‌شدهٔ کالا در انبار مقصد (Total Landed Cost)
$$\text{Total Landed Cost (USD)} = V_{\text{FOB}} + F_{\text{intl}} + S_{\text{surcharges}} + I_{\text{insurance}} + D_{\text{customs}} + T_{\text{VAT}} + P_{\text{port/THC}} + F_{\text{domestic}}$$
که در آن ضریب افزایش هزینهٔ لجستیک و گمرک نسبت به قیمت خرید ($\text{Landed Cost Multiplier}$) و قیمت تمام‌شدهٔ هر واحد کالا ($\text{Unit Landed Cost}$) به تفکیک دلاری و ریالی محاسبه می‌شود.
