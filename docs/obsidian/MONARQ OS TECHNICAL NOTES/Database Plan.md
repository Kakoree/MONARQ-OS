# Database Plan

## Purpose

This note defines the data model direction for MONARQ OS. It should guide how Claude Code structures tables, relationships, and app data.

## Database system

MONARQ OS uses Supabase Postgres as the primary database. Supabase provides a full Postgres database with Realtime support, extensions, backups, and integration with Auth and Storage.[supabase](https://supabase.com/docs)

## Database design principles

- Model the business clearly before building features.
    
- Use normalized core entities first.
    
- Keep relationships explicit.
    
- Design for gated membership and role-aware access from the start.
    
- Avoid feature-by-feature schema chaos.supabase+1
    

## Core entity groups

The database should likely revolve around these main groups:

## Identity and membership

- users
    
- profiles
    
- memberships
    
- roles
    
- access codes / invite codes
    

## Social and community

- posts
    
- comments
    
- reactions
    
- follows or member connections
    

## Growth and discipline

- habits
    
- check-ins
    
- streaks
    
- challenges
    
- challenge participation
    
- XP / progression / level records
    

## Content and access

- teachings
    
- teaching categories
    
- unlock rules
    
- member progress
    

## Events and drops

- events
    
- event attendance / RSVP
    
- product drops
    
- key drops
    
- redemption records
    

## System support

- notifications
    
- audit logs
    
- app settings / content settings[GOAL.jpg](https://ppl-ai-file-upload.s3.amazonaws.com/web/direct-files/attachments/images/1310357388/dbc8e448-66a8-4de1-8311-b08c21a75b50/GOAL.jpg?AWSAccessKeyId=ASIA2F3EMEYEU2E466YA&Signature=o%2BxBzEt0DNb1ZBSKRhwIr9izMF4%3D&x-amz-security-token=IQoJb3JpZ2luX2VjEBEaCXVzLWVhc3QtMSJHMEUCIQCYM5jR8znDl0XzflZsVI6AXBoEyDRBLtvbmIiZIeb4NgIgJyt3duguehg4qKLYHdB8IGxspA3lOXtPFi5v0F7lowEq%2FAQI2f%2F%2F%2F%2F%2F%2F%2F%2F%2F%2FARABGgw2OTk3NTMzMDk3MDUiDNgtksowziqJM8eA7irQBCIGPSnl0aAoeB8qwXas47IiZQQu7BV81ObZpQDWcYgEjWZTwq%2FitPw8EKFWu%2BBlpORthQbds5%2Fg7ri%2Bvl3bDypN3fl%2FZI%2F3JRyvkLhEGDOgkayYac9xfB2q6TfNKdXVFHDfdh2g4KoJYMylLuBNOywKi8kYuxl%2F%2FjnWBAiMfHN92DTyREXf3WnqVej2UwdIFauvLc%2FPyNndKWxQvWPX8XlskRSk6ZYnd7IRNvVXcNaMcaBsg%2BVPBf3ImJfWbCLfCxJq2%2FA12PGDlVjz4hb%2FYtX%2F5%2BwZZEotYsmXtoU3rlELNMndAmyKflrquToDWmAgLPLsE7pj6xBNoNZ9igkgwIdS636QzzjfYTlb%2B7QkQebZUxsbfhYQExJMk%2Bb7nY%2BPBiZxIobRvYu7RqaVeLsA%2BCDShvU1CtmLo21%2FCN5jRp53QaRt%2Fzsq23Emh7BxE%2BfTJzNyr0gBNhfcPCQOFXLWQnsh90qZYSUlGcHu8xlidLD0jUbJwN8zIDjjFSu9zgqT%2F07mZ%2FHu7hAT3vdS%2BZLX2wbEgjKHf9r2%2F5Ca78U4TmB7jJ7nVT3hhS1zN%2FHsRKigJzx1kAO7OwaDd%2F5qUBtwzhwmIRcLBhRN3elcXQrfPwkKoP5bULs%2BI2i8en33d1sHVLC9wOGLwn0EQ0Oj6xfwjYn7B89Ws8rBSLlLuiJxLc3PNJpyp9UVlwlZw7Kz%2BxyQCuxn%2FcgJbuFiSbRWUW44sKEBkGh3UsJS2eO2i3JcEmmDGhf9B1M8y4kdJH7Exy7HsvV6aD438JLw9WvAWiY5otowgtmD0wY6mAF7FzuHkiLONp%2BH4EuKxMNGPiExXhhxyZ7JZoIsZUyhlq1OoWFntorV1ivwZqj6EF81WHytmVU1UWQa5PEJ7s0zoy8gvJAszk4lyXGJj2JSBac%2Bj29p71AuReD8PxnspJoXfY1lJY3Sd2Q4pZfFDx0BdEsl3eQBt3u0qBcu6lMm%2BWDOo9F80MTWPQ2UdTMLkJ6IumZt%2BDtydg%3D%3D&Expires=1784740437)[supabase](https://supabase.com/docs)
    

## Data modeling rules

- Do not let the frontend be the source of truth.
    
- Put real relationships in the database.
    
- Keep user identity separate from profile presentation where useful.
    
- Use join tables for many-to-many relationships.
    
- Add timestamps and ownership fields to important tables.
    

## Realtime guidance

Use Realtime only where live updates create clear value, such as:

- feed updates,
    
- challenge participation,
    
- leaderboard refresh,
    
- live event presence,
    
- messaging later if added.  
    Supabase supports realtime data changes with authorization tied to RLS-aware access patterns.supabase+1
    

## What to avoid

- Building tables only around screens instead of business entities.
    
- Mixing admin-only and member-facing concerns carelessly.
    
- Weak ownership logic.
    
- Delaying access control thinking until later.
    

## Build rule

Claude Code should define schema first, then relationships, then RLS, then UI. It should not design the UI first and backfill the database later.