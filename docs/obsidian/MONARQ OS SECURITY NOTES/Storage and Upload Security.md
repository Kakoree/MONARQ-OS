# Storage and Upload Security

## Purpose

This note defines how MONARQ OS handles files, uploads, and stored assets safely.

## Security goal

Uploaded files should not become an attack path or a privacy leak. File access should follow the same trust rules as the rest of the app.[devguide.owasp](https://devguide.owasp.org/en/04-design/02-web-app-checklist/01-define-security-requirements/)

## Requirements

- Require authenticated access before protected uploads.
    
- Restrict upload types to what the product actually needs.
    
- Store uploads in controlled storage locations.
    
- Apply access controls to buckets and file reads.
    
- Prevent direct execution or unsafe serving patterns for uploaded files.supabase+1
    

## Rules

- Validate file type, not just file extension.
    
- Avoid overly permissive public buckets for private assets.
    
- Keep user uploads out of unrestricted execution paths.
    
- Use size limits and type restrictions.
    

## V1 expectations

- profile image uploads
    
- post/media uploads if allowed
    
- admin-managed assets where needed
    
- storage policies tied to user role or ownership[supabase](https://supabase.com/docs/guides/storage/security/access-control)
    

## What to avoid

- public-everything bucket policies
    
- unlimited upload freedom
    
- trusting client-side validation only
    
- mixing sensitive files with public assets carelessly[devguide.owasp](https://devguide.owasp.org/en/04-design/02-web-app-checklist/01-define-security-requirements/)
    

## Build note

Claude Code should treat uploads as protected workflows and should pair every upload feature with storage access rules.