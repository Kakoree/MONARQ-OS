# App Structure

## Purpose

This note defines the overall UI shell and layout structure of MONARQ OS.

## Core structure

The app should use a consistent operating shell:

- left sidebar for top-level navigation,
    
- top bar for utility actions and profile context,
    
- central content area for the main page experience,
    
- optional right-side contextual panel where useful
    

## Top-level navigation

The app should stay small at the top level. Core sections are:

- Home
    
- Teachings
    
- Community
    
- Challenges
    
- Events
    
- Members
    
- Leaderboard
    
- Discipline Schedule
    
- Profile / Account
    

These may evolve, but the product should avoid too many first-level destinations. Cleaner hierarchy reduces clutter and matches your preferred drill-down structure

## Layout rules

- Keep the shell calm and stable.
    
- Prioritize readability and hierarchy.
    
- Use strong spacing between major sections.
    
- Avoid too many widget blocks in one viewport.
    
- Keep the dashboard feeling premium and composed, not crowded
    

## Page composition

Each page should have:

- a clear title,
    
- a short supporting description when needed,
    
- one primary action,
    
- a strong content hierarchy,
    
- and predictable spacing.
    

## What to avoid

- Random layout changes across pages.
    
- Too many nested navigation layers.
    
- Overloaded dashboards.
    
- Admin-panel visual logic.
    
- Empty space with no purpose
    

## Build rule

Claude Code should use this note to keep the app structurally consistent. New features should fit into the existing shell rather than inventing new layout systems per page.