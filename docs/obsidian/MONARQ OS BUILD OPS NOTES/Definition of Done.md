# Definition of Done

## Purpose
Defines what must be true before any MONARQ feature or change is considered done.

## Design
- Matches current MONARQ design system
- No obvious UI inconsistency
- Works in the intended layout and navigation

## Functionality
- Feature works as intended
- Edge cases handled or explicitly marked out of scope
- No fake buttons or shell behavior

## Security
- Auth and authorization rules applied where needed
- No exposed secrets
- Inputs validated

## Data
- Reads/writes correct data
- No broken state persistence
- Database changes documented if relevant

## Quality
- No obvious bugs
- No console errors in normal use
- Loading, empty, and error states handled

## Review
- Checked against feature note
- Checked against design note
- Checked against technical/security rules

## Release
- Safe to deploy
- Safe to test in preview
- Does not break current core flows