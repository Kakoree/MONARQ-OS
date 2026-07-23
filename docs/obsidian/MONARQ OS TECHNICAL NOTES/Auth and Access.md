# Auth and Access

## Purpose

This note defines how users gain access to MONARQ OS, what permissions they have, and how private data is protected.

## Auth system

MONARQ OS uses Supabase Auth for user identity and session handling. Supabase Auth supports email/password and other login flows, but the chosen MONARQ access flow should be implemented in a way that fits gated membership logic rather than open public sign-up by default.[supabase](https://supabase.com/docs)

## Access philosophy

MONARQ is not meant to be open to everyone. Access should feel intentional, selective, and controlled. The technical model must support invite-based or code-based entry, role-aware permissions, and gated content.[GOAL.jpg](https://ppl-ai-file-upload.s3.amazonaws.com/web/direct-files/attachments/images/1310357388/dbc8e448-66a8-4de1-8311-b08c21a75b50/GOAL.jpg?AWSAccessKeyId=ASIA2F3EMEYEU2E466YA&Signature=o%2BxBzEt0DNb1ZBSKRhwIr9izMF4%3D&x-amz-security-token=IQoJb3JpZ2luX2VjEBEaCXVzLWVhc3QtMSJHMEUCIQCYM5jR8znDl0XzflZsVI6AXBoEyDRBLtvbmIiZIeb4NgIgJyt3duguehg4qKLYHdB8IGxspA3lOXtPFi5v0F7lowEq%2FAQI2f%2F%2F%2F%2F%2F%2F%2F%2F%2F%2FARABGgw2OTk3NTMzMDk3MDUiDNgtksowziqJM8eA7irQBCIGPSnl0aAoeB8qwXas47IiZQQu7BV81ObZpQDWcYgEjWZTwq%2FitPw8EKFWu%2BBlpORthQbds5%2Fg7ri%2Bvl3bDypN3fl%2FZI%2F3JRyvkLhEGDOgkayYac9xfB2q6TfNKdXVFHDfdh2g4KoJYMylLuBNOywKi8kYuxl%2F%2FjnWBAiMfHN92DTyREXf3WnqVej2UwdIFauvLc%2FPyNndKWxQvWPX8XlskRSk6ZYnd7IRNvVXcNaMcaBsg%2BVPBf3ImJfWbCLfCxJq2%2FA12PGDlVjz4hb%2FYtX%2F5%2BwZZEotYsmXtoU3rlELNMndAmyKflrquToDWmAgLPLsE7pj6xBNoNZ9igkgwIdS636QzzjfYTlb%2B7QkQebZUxsbfhYQExJMk%2Bb7nY%2BPBiZxIobRvYu7RqaVeLsA%2BCDShvU1CtmLo21%2FCN5jRp53QaRt%2Fzsq23Emh7BxE%2BfTJzNyr0gBNhfcPCQOFXLWQnsh90qZYSUlGcHu8xlidLD0jUbJwN8zIDjjFSu9zgqT%2F07mZ%2FHu7hAT3vdS%2BZLX2wbEgjKHf9r2%2F5Ca78U4TmB7jJ7nVT3hhS1zN%2FHsRKigJzx1kAO7OwaDd%2F5qUBtwzhwmIRcLBhRN3elcXQrfPwkKoP5bULs%2BI2i8en33d1sHVLC9wOGLwn0EQ0Oj6xfwjYn7B89Ws8rBSLlLuiJxLc3PNJpyp9UVlwlZw7Kz%2BxyQCuxn%2FcgJbuFiSbRWUW44sKEBkGh3UsJS2eO2i3JcEmmDGhf9B1M8y4kdJH7Exy7HsvV6aD438JLw9WvAWiY5otowgtmD0wY6mAF7FzuHkiLONp%2BH4EuKxMNGPiExXhhxyZ7JZoIsZUyhlq1OoWFntorV1ivwZqj6EF81WHytmVU1UWQa5PEJ7s0zoy8gvJAszk4lyXGJj2JSBac%2Bj29p71AuReD8PxnspJoXfY1lJY3Sd2Q4pZfFDx0BdEsl3eQBt3u0qBcu6lMm%2BWDOo9F80MTWPQ2UdTMLkJ6IumZt%2BDtydg%3D%3D&Expires=1784740437)

## Likely access model

The likely model is:

- user authenticates,
    
- profile is created,
    
- membership/access state is checked,
    
- invite code or key redemption may be required,
    
- permissions and content visibility depend on role + membership status.
    

## Roles

The system should support role-aware access from the start, likely including:

- guest / pending
    
- member
    
- premium or inner-circle member if needed later
    
- moderator
    
- admin
    

## Security model

Data protection should be enforced through Row Level Security in Supabase. RLS is a Postgres-level protection layer and is a core security model in Supabase for app data, including realtime and storage access.supabase+2

## Access control rules

- Never trust frontend visibility alone.
    
- Sensitive content must be protected by database policies.
    
- Storage access should also follow RLS-aware policy rules.
    
- Realtime subscriptions should expose only data users are allowed to read.supabase+2
    

## Membership gating examples

Access rules may control:

- who can enter the app,
    
- who can view gated teachings,
    
- who can join certain events,
    
- who can see private groups,
    
- who can redeem key-drop access,
    
- who can access admin tools.[supabase](https://supabase.com/docs/guides/storage/security/access-control)
    

## What to avoid

- Public-by-default content when it should be gated.
    
- Role logic only in the UI.
    
- Hardcoded access rules scattered across the app.
    
- Building auth without thinking through membership states.
    

## Build rule

Claude Code must implement access as a backend-enforced system, not just a visual UX flow. Every protected area should map to real auth and data rules.