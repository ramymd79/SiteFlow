# Data Model — First Draft

## Core tables
- organizations
- users
- memberships
- projects
- project_members
- clients
- vendors
- subcontractors
- captures
- capture_media
- supervisor_reviews
- expenses
- advances
- advance_events
- settlements
- boq_items
- progress_entries
- variations
- client_ipcs
- subcontractor_ipcs
- audit_events

## Key concepts
### captures
يحفظ المصدر الخام من WhatsApp أو التطبيق، النص الأصلي، transcript، AI JSON، confidence، والحالة.

### supervisor_reviews
يحفظ الفرق بين تفسير AI والنسخة التشغيلية التي سلّمها المشرف للحسابات.

### expenses
الحركة المالية بعد دخولها مسار الحسابات، مرتبطة بالمشروع/المورد/العهدة/المستند.

### advances
يسمح بأكثر من عهدة مفتوحة لنفس المستخدم ونفس المشروع أو مشاريع مختلفة.

### settlements
يحصر إجمالي العهد، المصروف المعتمد، المعلّق، المرتجع، وما للشركة أو للموظف.

### boq_items / progress_entries
أساس المستخلص، منفصل عن المصروفات.

### audit_events
قبل/بعد + actor + source + timestamp لكل تعديل حساس.
