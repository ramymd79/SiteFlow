# WhatsApp Product Design

## Principle
WhatsApp هو **Capture Layer** وليس التطبيق بالكامل.

## User Mapping
Phone number → User → Organization → Role → Allowed Projects

## Inbound Types
### P0
- expense
- receipt
- voice note
- progress update
- site photo/note

### P1
- material delivery
- issue
- request
- task

## Response Style
الافتراضي:
> تم الاستلام ✅

نتجنب Bot كثير الأسئلة. الغموض يذهب للمراجعة إلا لو هناك مشكلة أمان أو لا يمكن تحديد المستخدم/الشركة.

## Original Evidence
Always keep:
- original message
- original voice
- original image
- transcript
- AI interpretation
- supervisor edits
- finance edits

## WhatsApp Groups
ليست P0.
قد تستخدم لاحقًا كسياق للمشروع وSite Diary، لكن ليس كل كلام الجروب يتحول Record.
كل extraction يظل Draft حتى المراجعة.
