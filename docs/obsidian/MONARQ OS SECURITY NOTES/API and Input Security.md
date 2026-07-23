# API and Input Security

## Purpose

This note defines how MONARQ OS protects APIs, forms, and user-supplied input.

## Security goal

User input should never be trusted by default. Every request and payload should be validated and handled defensively.owasp+1

## Requirements

- Validate input server-side.
    
- Sanitize and constrain user-submitted data where needed.
    
- Protect APIs and mutations behind auth and authorization checks.
    
- Use safe database access patterns through trusted tools/libraries.
    
- Restrict dangerous or unexpected request behavior.owasp+1
    

## Rules

- Never trust frontend validation alone.
    
- Do not pass raw user input directly into sensitive operations.
    
- Constrain accepted formats, sizes, and allowed values.
    
- Protect comment, profile, and content inputs from abuse.
    

## V1 expectations

- validated forms
    
- protected mutations
    
- safe profile updates
    
- safe post creation and comments
    
- safe code redemption or invite code entry
    

## What to avoid

- raw unchecked input
    
- wide-open internal endpoints
    
- overly permissive admin APIs
    
- relying on “nobody will try that” assumptions
    

## Build note

Claude Code should implement validation and access checks as part of every important write action, not as an afterthought.