# Deployment Decision

## Status

Accepted

## Context

MONARQ OS needs a clean deployment process that is easy to repeat, easy to preview, and suitable for a small team.

## Decision

Deploy the app through Vercel with Git-based previews and production release through the main branch. Use Supabase as the backend service layer.nextjs+1

## Why this was chosen

Vercel has strong support for Next.js, easy preview deployments, environment variable management, and custom domain support. This reduces deployment overhead and makes shipping progressively easier.nextjs+1

## Alternatives considered

- manual VPS deployment
    
- builder-only hosting
    
- custom DevOps setup too early
    

## Consequences

## Pros

- Fast deploy workflow
    
- Preview environments
    
- Easier production management
    
- Good team handoff modelnextjs+1
    

## Cons

- Some platform dependence
    
- Need careful environment variable management
    
- Need discipline around preview vs production data
    

## Revisit later if

- MONARQ needs more custom infrastructure control
    
- deployment costs or limitations become meaningful