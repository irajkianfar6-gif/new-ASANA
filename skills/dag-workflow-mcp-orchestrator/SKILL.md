---
name: dag-workflow-mcp-orchestrator
title: ارکستراتور پایپ‌لاین‌های DAG و کانکتورهای MCP (DAG Workflow & MCP Builder)
description: طراحی، اعتبارسنجی و اجرای خودکار فرایندهای چندگامی (Fan-out/Fan-in، گیت‌های شرطی، مدیریت بودجه و اتصال استاندارد JSON-RPC 2.0 MCP).
repo: alirezarezvani/claude-skills/workflow-orchestrator
version: 2.1.0
category: orchestration
agents: [flow, assist, qa]
tools: [skill_list, skill_load, skill_execute, approvals_list, report_daily]
---

# مهارت ارکستراتور پایپ‌لاین‌های تکرارپذیر و MCP (`dag-workflow-mcp-orchestrator`)

## ۱. معماری گام‌های مجاز در پایپ‌لاین‌های `flow`
1. **گام ابزار (`type: "tool"`):** فراخوانی مستقیم هر ابزار مجاز از رجیستری `TOOLS` (به‌جز `web_fetch` خام که به دلایل امنیتی مسدود است و باید از `web_search` یا `tariff_scan` استفاده شود).
2. **گام عامل (`type: "agent"`):** واگذاری زیرکار به یکی از عامل‌های تخصصی (`analyst`, `procurement`, `risk`, `docs`, `finance`, `tracker`, `customer`, `qa`) با ثبت شناسهٔ والد (`parent task`).
3. **گام دروازهٔ شرطی (`type: "gate"`):** ارزیابی عبارات شرطی (`>=, <=, ==, !=, contains`) روی خروجی گام‌های قبلی (`{{stepId.field}}`) و توقف ایمن پایپ‌لاین در صورت عدم برقراری شرط.
4. **گام مدل زبانی (`type: "llm"`):** خلاصه‌سازی داده‌های جمع‌آوری‌شده در تگ `<data trust="untrusted">` با جایگزین خودکار (`fallback`) در صورت عدم دسترسی به مدل.
5. **گام اعلان (`type: "notify"`):** ارسال گزارش نهایی به کانال‌های تیمی با کلید جلوگیری از تکرار (`dedupe`).
