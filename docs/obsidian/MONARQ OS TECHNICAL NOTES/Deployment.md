# Deployment

## Purpose

This note defines how MONARQ OS is deployed, previewed, and published.

## Deployment model

The app should be deployed as a Next.js application on Vercel. Vercel has first-class support for Next.js, including custom domains, HTTPS, preview deployments, and environment variable management.nextjs+2

## Backend deployment model

Supabase handles:

- database
    
- auth
    
- storage
    
- realtime
    
- optional edge functions[supabase](https://supabase.com/docs)
    

## Publish flow

The preferred flow is:

1. Develop locally.
    
2. Push to GitHub.
    
3. Let Vercel create preview deployments for branches or pull requests.
    
4. Test preview deployment.
    
5. Merge to main.
    
6. Vercel publishes production deployment.[nextjs](https://nextjs.org/learn/pages-router/deploying-nextjs-app-platform-details)
    

## Domain setup

Use a custom domain connected to Vercel. Vercel supports custom domains and automatic HTTPS for production deployments.nextjs+1

## Environment variables

Environment variables must be stored in Vercel and locally in the appropriate development environment files. Secrets must never be hardcoded in the codebase.nextjs+1

Likely env variables will include:

- Supabase URL
    
- Supabase anon key
    
- Supabase service role key, server-side only
    
- app URL
    
- any future private integration keys
    

## Deployment principles

- Preview before production.
    
- Keep production stable.
    
- Use branch-based testing.
    
- Do not ship directly without a preview check.
    
- Keep deployment easy for the team to repeat.nextjs+1
    

## What to avoid

- Manual ad hoc deployments with no testing path.
    
- Exposing secrets.
    
- Mixing staging and production values carelessly.
    
- Publishing major schema-dependent features without migration planning.
    

## Build rule

Claude Code should assume a Vercel + Supabase deployment target and should generate code that fits that workflow.nextjs+1

## Recommendation

These 4 notes are enough to give MONARQ a real technical foundation without overbuilding the docs. They cover the minimum technical decisions that are most likely to reduce confusion and rework later: stack, database, auth, and deployment.dev+1

The next best step is to create a small `Decision Log` note and record the first key decisions:

- Next.js chosen
    
- Vercel chosen
    
- Supabase chosen
    
- gated membership model
    
- progressive phased build approach