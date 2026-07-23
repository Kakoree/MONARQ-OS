# Auth and Access Decision

## Status

Accepted

## Context

MONARQ is meant to feel gated and intentional, not like an open public app. Access needs to support invite logic, key redemption, private content, and membership-aware permissions.

## Decision

Use Supabase Auth for identity and sessions, and enforce permissions through membership logic plus Row Level Security. The app should support invite-based or code-based entry rather than default public signup.supabase+1

## Why this was chosen

This model aligns with the MONARQ concept: private access, tiered identity, and member-only experiences. RLS gives backend-level protection instead of depending only on frontend hiding.supabase+2

## Alternatives considered

- open signup first
    
- frontend-only access checks
    
- lighter auth model without strong role/membership structure
    

## Consequences

## Pros

- Stronger security
    
- Better fit for the club model
    
- Cleaner gated-content foundation
    
- Better long-term control over accesssupabase+1
    

## Cons

- More setup complexity early
    
- Access states must be thought through carefully
    
- Testing policies becomes important
    

## Revisit later if

- MONARQ opens public waitlists or broader signups
    
- tier structure becomes more complex than expected