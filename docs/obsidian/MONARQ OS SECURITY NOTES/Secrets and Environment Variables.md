# Secrets and Environment Variables

## Purpose

This note defines how MONARQ OS handles secrets, keys, and environment configuration.

## Security goal

Sensitive configuration values must never be exposed in the codebase or to unauthorized clients.[devguide.owasp](https://devguide.owasp.org/en/04-design/02-web-app-checklist/01-define-security-requirements/)

## Requirements

- Store secrets in environment variables, not in source code.
    
- Keep service-role credentials server-side only.
    
- Use Vercel environment variable management for deployed environments.
    
- Separate development, preview, and production values carefully.nextjs+2
    

## Rules

- Never hardcode API keys or secret tokens.
    
- Never expose service-role keys to the browser.
    
- Do not commit `.env` files with secrets.
    
- Rotate secrets if exposure is suspected.owasp+1
    

## V1 expectations

- Supabase URL and anon key handled correctly
    
- service role key server-only
    
- production secrets separate from local dev
    
- documented environment variable list
    

## What to avoid

- reusing production secrets casually
    
- putting secret config in markdown, screenshots, or prompts
    
- mixing preview and production environments badly
    

## Build note

Claude Code should assume secrets live in environment variables and should never place private credentials in client bundles or source files.