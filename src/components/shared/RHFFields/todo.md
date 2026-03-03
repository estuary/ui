# Future Work/Ideas: Component Library & RHF Integration

## Validation Architecture

- Centralize validation at the form level rather than per-field
- Use context to control per-field blur gating on that centralized validation

## Component Layering

- Custom components (like `LeavesAutocomplete`) are styled/functional wrappers around MUI — independent from RHF
- These components may live in a standalone library someday, with stories demonstrating the full feature set
- RHF wrappers will be separate from that library, with their own stories demonstrating validation and integration patterns
- MUI 6's `slotProps` makes this layering easier
