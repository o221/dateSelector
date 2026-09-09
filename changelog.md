# Changelog

All notable changes to this project are documented in this file.

## [3.2026.9.9] - 2026-09-09

### User-visible changes

- Fixed Ctrl+drag and Ctrl+click on the range slider to move the selected period as a block.
- Improved slider bound handling so the selected range stays valid at the edges without collapsing width.
- Added a new Current Period setting: Scale Icon Text (scales with the theme text size).
- Added a new Current Period setting: Hide if Missing (When enabled, only show current-period buttons when the full period is within available scope).
- Added localized labels and descriptions for the new Current Period settings across supported locales.

### Internal and technical changes

- Refactored current-period control layout logic for clearer icon/text sizing behaviour and maintainability.
- Added reusable scope containment helper logic for current-period filtering.
- Extended step menu props to carry font size for consistent badge sizing behavior.
- Updated visual metadata and display version to the 2026-09-09 certification build.
- Refreshed capabilities and lockfile artifacts as part of packaging.
