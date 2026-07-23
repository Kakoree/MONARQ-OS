# Data Protection

## Purpose

This note defines how member and app data should be protected in MONARQ OS.

## Security goal

Sensitive data should be stored, accessed, and exposed in ways that minimize unnecessary risk. Member data should only be visible to the right parties and only for the right reasons.knowledgelib+1

## Requirements

- Use RLS for sensitive table access.
    
- Limit who can read and write protected records.
    
- Only collect data that is necessary.
    
- Protect private member records from broad exposure.
    
- Use secure transport and platform defaults for encrypted connections.supabase+1
    

## Rules

- Do not expose private fields casually in APIs.
    
- Do not send unnecessary sensitive data to the client.
    
- Keep internal metadata separate from public profile data when useful.
    
- Protect logs and exports that may contain user information.cheatsheetseries.owasp+1
    

## V1 expectations

- member profile privacy rules
    
- gated teachings access
    
- challenge participation visibility rules
    
- notifications and audit data handled carefully
    

## What to avoid

- bloated user records exposed client-side
    
- mixing public and private fields carelessly
    
- storing secrets or high-risk data in normal tables
    
- treating “logged in” as enough protection
    

## Build note

Claude Code should prefer minimal data exposure and should keep trust boundaries on the server where possible.