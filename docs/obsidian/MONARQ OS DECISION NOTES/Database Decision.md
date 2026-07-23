# Database Decision

## Status

Accepted

## Context

MONARQ OS needs a database that can support membership, social features, gated content, progression, events, and commerce-related access logic without turning into schema chaos.

## Decision

Use Supabase Postgres as the primary database and design the schema around core business entities rather than screens.supabase+1

## Why this was chosen

Postgres is strong for structured relational data, and Supabase integrates it directly with auth, storage, realtime, and RLS. This makes it a good fit for a member platform with permission-aware data.supabase+1

## Alternatives considered

- Firestore / document-first model
    
- local-first or no real database early
    
- loosely structured backend based mostly on frontend objects
    

## Consequences

## Pros

- Strong relational modeling
    
- Good for roles and membership
    
- Better long-term consistency
    
- Supports secure access patterns wellsupabase+1
    

## Cons

- Requires better planning upfront
    
- Schema decisions matter more
    
- Poor table design will create future rework
    

## Revisit later if

- data complexity changes drastically
    
- analytics workloads eventually need separate tooling