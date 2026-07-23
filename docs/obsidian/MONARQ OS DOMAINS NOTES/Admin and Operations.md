# Admin and Operations

## Purpose

This domain defines the internal control layer used to manage MONARQ OS.

## What this domain owns

- moderation actions
    
- settings and content control
    
- admin-only changes
    
- operational records
    
- audit-relevant internal actions
    
- management interfaces
    

## What this domain is responsible for

This domain is responsible for controlling and operating the system behind the scenes. It supports moderation, configuration, content management, access overrides, event/drop management, and operational visibility.

## What it does not own

- member-facing identity
    
- social content as a domain concept
    
- progression rules themselves
    
- business meaning of teachings
    
- business meaning of drops
    

## Main entities

- admin action
    
- moderation action
    
- settings record
    
- content control record
    
- audit record
    
- internal management object
    

## Key relationships

This domain connects to every other domain because it administers them, but it should not absorb their business meaning.martinfowler+1

## Modeling note

Admin and Operations is a control context, not the core business domain. It should remain separate so the product model does not become “whatever the admin panel can edit.”