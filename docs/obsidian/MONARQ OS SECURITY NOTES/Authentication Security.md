# Authentication Security

## Purpose

This note defines the minimum security requirements for user authentication in MONARQ OS.

## Security goal

Only legitimate users should be able to sign in, maintain sessions, and access their own accounts. Authentication should be strong enough for a gated member platform and should not rely on weak frontend logic.cheatsheetseries.owasp+1

## Requirements

- Use Supabase Auth as the authentication provider.
    
- Keep all auth flows server-trusted.
    
- Use secure password handling through the auth provider.
    
- Require proper session handling and expiration management.
    
- Protect login and signup endpoints from abuse and brute-force behavior where possible.cheatsheetseries.owasp+1
    

## Rules

- Never store passwords manually.
    
- Never expose secrets in client code.
    
- Do not create custom auth logic unless there is a clear reason.
    
- Treat session handling as security-critical.owasp+1
    

## V1 expectations

- Secure login
    
- Secure signup or gated onboarding flow
    
- Password reset flow
    
- Session-aware protected routes
    
- Sign-out support
    

## What to avoid

- DIY password storage
    
- weak custom auth logic
    
- trusting the UI alone for protected page access
    
- leaving stale sessions or broken logout behavior
    

## Build note

Claude Code should use the platform auth system properly and should not improvise custom authentication architecture unless explicitly asked.