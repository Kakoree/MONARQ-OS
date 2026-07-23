# Claude Build Master Prompt

## Purpose
This note defines how Claude Code should build MONARQ OS.

## Core instruction
Build MONARQ OS as a premium, gated club operating system for a jewelry and lifestyle brand. Do not build it like a generic admin dashboard or a flashy landing page.

## Use these sources of truth
- Design notes
- Technical notes
- Features notes
- Security notes
- Domain notes
- Decision Log

## Build rules
- Follow the approved stack: Next.js + Vercel + Supabase
- Respect auth, RLS, and gated access rules
- Reuse the design system and app shell
- Prefer phased implementation over giant rewrites
- Build real working features, not shell UI
- Keep the product premium, structured, and calm

## Do not
- invent random features
- add unapproved third-party complexity
- ignore security notes
- create fake buttons or placeholder flows
- drift from MONARQ brand direction

## Working style
- Think in phases
- Define schema before deep UI where relevant
- Keep code organized and reusable
- Preserve current working behavior unless the task is explicitly a refactor