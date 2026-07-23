# Authorization and Roles

## Purpose

This note defines how MONARQ OS controls what each user can see and do after authentication.

## Security goal

A logged-in user should only access the records, features, and actions they are explicitly allowed to access. Access should fail closed by default.cheatsheetseries.owasp+1

## Requirements

- Enforce authorization server-side.
    
- Use role-aware and membership-aware access checks.
    
- Apply least privilege.
    
- Deny by default unless access is explicitly allowed.
    
- Separate member, moderator, and admin capabilities clearly.cheatsheetseries.owasp+1
    

## Rules

- Frontend visibility is not authorization.
    
- Protected routes must have backend enforcement.
    
- Table access must be guarded by RLS policies.
    
- Privileged actions must be separated from normal member actions.supabase+1
    

## V1 expectations

- member vs admin separation
    
- gated content by membership state
    
- profile/data isolation by owner
    
- restricted admin tools
    
- policy-aware realtime and storage accesssupabase+1
    

## What to avoid

- role checks only in components
    
- broad admin permissions everywhere
    
- insecure direct object access
    
- public-by-accident member data exposure[devguide.owasp](https://devguide.owasp.org/en/04-design/02-web-app-checklist/07-access-controls/)
    

## Build note

Claude Code must implement access checks as a real backend rule system, not as visual hiding logic.