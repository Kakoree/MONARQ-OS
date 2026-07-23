# UI Components

## Purpose

This note defines the core reusable component system for MONARQ OS.

## Main component families

The MVP component set should include:

- buttons,
    
- inputs,
    
- search bars,
    
- tabs,
    
- cards,
    
- post/feed items,
    
- challenge cards,
    
- event cards,
    
- member cards,
    
- progress bars,
    
- badges/tags,
    
- habit rows,
    
- modals/drawers,
    
- notifications/toasts
    

## Component style

Components should feel:

- dark,
    
- refined,
    
- slightly sharp,
    
- low-noise,
    
- premium,
    
- and consistent.
    

Borders should be subtle. Corners should not be overly round. Shadows and glow should be restrained. Components should feel designed, not decorative.

## State rules

Every important component should define:

- default,
    
- hover,
    
- active,
    
- selected,
    
- disabled,
    
- loading,
    
- completed,
    
- locked,
    
- and error states
    

## Priority components first

The first components to define properly are:

- primary / secondary button,
    
- card,
    
- input,
    
- tab bar,
    
- progress bar,
    
- member rank badge,
    
- feed post card.  
    A minimal design system often starts with a small set of core components and expands later from actual use
    

## What to avoid

- Many one-off component styles.
    
- Component variants with no real need.
    
- Bright accent overload.
    
- Decorative UI with weak usability.
    
- Inconsistent hover/focus states
    

## Build rule

Claude Code should reuse these core components and extend them carefully rather than inventing page-specific UI styles for every screen.