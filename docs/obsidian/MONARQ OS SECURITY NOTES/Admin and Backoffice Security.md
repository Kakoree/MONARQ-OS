# Admin and Backoffice Security

## Purpose

This note defines how MONARQ OS protects admin-only capabilities and operational tooling.

## Security goal

Administrative power should be tightly restricted, clearly separated, and auditable. Admin tools should never be casually exposed to normal members.devguide.owasp+1

## Requirements

- Admin pages must require real admin authorization.
    
- Privileged actions must be separated from normal app flows.
    
- Sensitive configuration tools must not be reachable by member routes.
    
- Admin-only reads and writes should be limited to the minimum needed.[devguide.owasp](https://devguide.owasp.org/en/04-design/02-web-app-checklist/07-access-controls/)
    

## Rules

- Do not rely on hidden buttons as protection.
    
- Do not mix admin and member capabilities in the same uncontrolled interface.
    
- High-impact actions should be explicit and auditable.
    
- Destructive actions should be harder to trigger than normal actions.
    

## V1 expectations

- admin-only content management
    
- access management controls
    
- moderation capability if needed
    
- drop/event management tools
    
- safe separation between public/member/admin data operations
    

## What to avoid

- super-admin logic spread across the codebase
    
- undocumented admin actions
    
- weak separation of privileges
    
- fragile manual security assumptions[devguide.owasp](https://devguide.owasp.org/en/04-design/02-web-app-checklist/07-access-controls/)
    

## Build note

Claude Code should treat admin tools as a separate trust layer and should require stricter access controls for them than normal product features.