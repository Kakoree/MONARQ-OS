# Initial Database Schema

## Purpose
Defines the first-pass MONARQ data model before implementation.

## Core tables
- users
- profiles
- memberships
- roles
- access_codes
- redemptions
- teachings
- teaching_progress
- habits
- check_ins
- challenges
- challenge_participation
- xp_events
- events
- event_rsvps
- posts
- comments
- drops
- purchases
- notifications

## Important relationships
- user -> profile
- user -> membership
- user -> role
- access_code -> redemption -> user
- user -> check_ins
- user -> challenge_participation
- user -> xp_events
- user -> event_rsvps
- user -> posts
- post -> comments
- teaching -> teaching_progress
- drop -> purchase

## Rules
- Use RLS on protected tables
- Separate identity from access state where useful
- Avoid mixing admin-only data into member-facing tables
- Add timestamps to important records
- Add owner/user references clearly

## Open questions
- Do key drops create access directly or through redemption records?
- Is rank stored directly or derived from XP?
- Are teachings unlocked by role, XP, or both?