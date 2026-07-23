# Logging and Audit Trail

## Purpose

This note defines how MONARQ OS tracks security-relevant and operationally important actions.

## Security goal

Important actions should leave a reliable trail so the team can investigate issues, understand changes, and review sensitive behavior.cheatsheetseries.owasp+1

## Requirements

- Log important auth and authorization events.
    
- Record meaningful admin actions.
    
- Record destructive or high-impact changes.
    
- Keep logs useful, structured, and reviewable.
    
- Avoid logging secrets or raw sensitive credentials.cheatsheetseries.owasp+1
    

## Rules

- Log what matters, not everything.
    
- Never store passwords or secret keys in logs.
    
- Track who did what and when for important actions.
    
- Use audit trails for changes to access, content, settings, and other high-impact areas.cheatsheetseries.owasp+1
    

## V1 expectations

- login / logout related event visibility where appropriate
    
- admin action logging
    
- content change logging for important actions
    
- access change or role change logging
    
- destructive action history
    

## What to avoid

- no logging at all
    
- noisy logs with no signal
    
- logs containing secrets
    
- unauditable admin actions[cheatsheetseries.owasp](https://cheatsheetseries.owasp.org/cheatsheets/Logging_Cheat_Sheet.html)
    

## Build note

Claude Code should include auditability for important actions, especially those involving access, moderation, content control, or destructive changes.