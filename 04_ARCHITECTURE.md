# Architecture

## Product Surfaces
1. **WhatsApp** — site users, supervisors, fast capture.
2. **Web Dashboard** — supervisors, finance, management, admin.
3. **Client Portal** — client-facing visibility.

## Suggested Stack
- Frontend: Next.js
- Backend: Next.js API/server layer
- Database: PostgreSQL
- Platform: Supabase
- Auth: Supabase Auth
- Storage: Supabase Storage
- AI: pluggable model provider
- Messaging: WhatsApp Business Platform / Cloud API
- Observability: structured logs + error tracking
- Deploy: Vercel / Railway حسب القرار النهائي

## Core Services
- Identity Service
- Capture Service
- Review Service
- Finance Operations Service
- Project Controls Service
- Certification Service
- Audit Service

## State Boundaries
### Capture
received → parsed → draft → supervisor_reviewed → submitted_to_finance

### Finance
submitted → under_review → approved / rejected / returned

### Advance
draft → approved → disbursed → active → settling → settled → closed

### IPC
draft → internal_review → submitted → certified / rejected → paid

## Security Principles
- strict tenant isolation
- row-level access
- signed media access
- minimum data sent to AI providers
- no financial finalization by AI
- immutable evidence references
