# Tech Stack

## Purpose

This note defines the approved technology stack for MONARQ OS. It is the technical source of truth for what we are building with and what we are intentionally not using.

## Approved stack

- Frontend: Next.js
    
- Hosting: Vercel
    
- Database: Supabase Postgres
    
- Auth: Supabase Auth
    
- File storage: Supabase Storage
    
- Realtime features: Supabase Realtime where needed
    
- Server-side logic: Next.js server actions / route handlers first
    
- Edge/serverless extras: Supabase Edge Functions only when clearly needednextjs+1
    

## Why this stack

This stack gives MONARQ a modern full-stack web setup with strong support for deployment, auth, database, storage, and secure access control. Supabase provides Postgres, Auth, Storage, Realtime, and RLS-based protection in one backend, while Vercel has first-class Next.js deployment support with preview deployments, custom domains, environment variables, and HTTPS.nextjs+2

## Stack principles

- Keep the stack simple.
    
- Avoid unnecessary third-party services.
    
- Prefer built-in platform features before adding more tools.
    
- Keep the app transferable and not dependent on one low-code builder.
    
- Favor maintainability over novelty.
    

## What we are avoiding

- Too many extra APIs.
    
- A fragmented backend with many vendors.
    
- Overengineering early with queues, microservices, and unnecessary infrastructure.
    
- Feature decisions that force a future rewrite too early.
    

## Default build approach

- Build database-backed features with Supabase first.
    
- Build app routes and UI in Next.js.
    
- Deploy early to Vercel previews.
    
- Use production deployment only after preview validation.nextjs+1
    

## Technical non-negotiables

- Type-safe code where possible.
    
- Secure data access through RLS.
    
- Environment variables managed properly.
    
- No secret keys exposed client-side.
    
- Reusable architecture over one-off hacks.