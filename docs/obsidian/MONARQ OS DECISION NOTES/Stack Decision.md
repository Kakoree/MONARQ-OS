# Stack Decision

## Status

Accepted

## Context

MONARQ OS needs a stack that is modern, scalable, relatively simple to maintain, and realistic for a small team with one primary developer. The stack also needs to work well with Claude Code and support a premium web app experience.

## Decision

Use:

- Next.js for the app
    
- Vercel for hosting
    
- Supabase for database, auth, storage, and realtimenextjs+1
    

## Why this was chosen

This stack gives MONARQ a strong full-stack foundation with fewer moving parts than a fragmented multi-vendor setup. It also supports deployment speed, managed infrastructure, and a clear path from MVP to a more serious production app.nextjs+2

## Alternatives considered

- Firebase stack
    
- custom backend + VPS
    
- builder-led hosting only
    
- more fragmented “best tool per layer” setup
    

## Consequences

## Pros

- Faster setup
    
- Lower infrastructure complexity
    
- Good fit for Claude-assisted building
    
- Easier deployment path
    
- Built-in support for auth, storage, and databasenextjs+1
    

## Cons

- Some platform coupling
    
- Need to design RLS carefully
    
- Need discipline to avoid messy schema growth[supabase](https://supabase.com/docs/guides/database/postgres/row-level-security)
    

## Revisit later if

- MONARQ needs infrastructure capabilities that clearly exceed the current stack
    
- costs or constraints materially change