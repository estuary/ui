# MUI

## Versions

- `@mui/material`: ^7.3.7
- `@mui/x-data-grid`: ^8.26.0
- `@mui/x-date-pickers`: ^8.26.0
- `@mui/lab`: ^7.0.1-beta.22 (beta — use sparingly, prefer `@mui/material` equivalents)
- `@mui/icons-material`: ^7.3.7 (use `iconoir-react` instead where possible — see below)
- `@emotion/react` + `@emotion/styled`: ^11

---

## Theme

Most application wide styling lives in **`src/context/Theme.tsx`** (~1,200 lines). It is the single source of truth for colors, z-indexes, spacing tokens, and component defaults.

There is random one-off styling here and there but we prefer to keep things consistent and need a good reason for a styling exception to exist.

### Providing the theme

`ThemeProvider` (from `src/context/Theme.tsx`) wraps the app in `src/context/index.tsx`. It renders MUI's `ThemeProvider` and `CssBaseline`, and exposes `useColorMode()` for dark/light toggling.

```typescript
import { useColorMode } from 'src/context/Theme';

const { toggleColorMode, colorMode } = useColorMode();
```

### Breakpoints

```typescript
xs: 0,  sm: 650,  md: 900,  lg: 1440,  xl: 1600
```

### Component defaults

Set in `createTheme()` — do not override these per-component without good reason:

| Component                                       | Default                                                |
| ----------------------------------------------- | ------------------------------------------------------ |
| `MuiButton`                                     | `variant="contained"`, `disableElevation`              |
| `MuiFormControl` / `MuiTextField` / `MuiSelect` | `variant="standard"`                                   |
| `MuiCheckbox`                                   | Iconoir `Square` / `CheckSquare` icons                 |
| `MuiButtonBase`                                 | `disableRipple: true`, custom focus ring via `::after` |
| `MuiTabs`                                       | `indicatorColor="secondary"`                           |

---

## Exported Tokens (legacy pattern — do not add new ones)

`src/context/Theme.tsx` exports ~80 loose consts (colors, backgrounds, outlines, sx snippets). Consume the existing ones instead of hardcoding values. But the loose-const pattern itself is the thing to migrate off: new design tokens go in the augmented theme (see "Adding a new design token" below), and code that uses loose consts should move to theme keys when touched.

### Z-indexes

When defining a new setting places use `zIndexIncrement` and include a comment explaining what is driving this setting.

Some examples:

```typescript
popperIndex; // 2500 — must be > 100 (reflex splitter)
headerLinkIndex; // 150
chipDeleteIndex; // 25
accordionButton; // 25
buttonHoverIndex; // 20
```

### Backgrounds (light/dark pairs)

Often we use standard backgrounds but use custom ones often for `Paper`, `Table`, and `Menu` related components

Some examples:

```typescript
paperBackground;
paperBackgroundImage;
semiTransparentBackground;
semiTransparentBackground_oneLayerElevated;
semiTransparentBackgroundIntensified;
codeBackground;
menuBackgroundColor;
```

### Borders / outlines

We use these a lot. Many times they are used for stylized dividers in the app.

Some examples:

```typescript
defaultOutline; // 1px solid, 12% opacity
defaultOutline_hovered; // 1px solid, 60% opacity
intensifiedOutline; // 1px solid, 25% opacity
intensifiedOutlineThick; // 2px solid, 25% opacity
defaultOutlineColor; // color string only (no border shorthand)
defaultOutlineColor_hovered;
```

### Predefined `sx` objects

Reusable styling objects to keep components consistent:

```typescript
cardHeaderSx;
tableAlternateRowsSx;
typographyTruncation;
truncateTextSx;
flexGrowToSiblingsSx;
defaultBoxShadow;
linkButtonSx;
outlinedIconButtonStyling;
chipOutlinedStyling;
dataGridEntireCellButtonStyling;
dataGridListStyling;
jsonFormsPadding;
editorToolBarSx;
// ... and more — search src/context/Theme.tsx for export
```

### Utility functions

We sometimes need customization that cannot be handles with basic objects/settings. We try to keep these to a minimum due to the performance impact.

```typescript
getEntityTableRowSx(theme, disabled?)    // Table row sx with disabled state
getTableHeaderWithoutHeaderColor()       // Removes header background
getStickyTableCell(headerParent?)        // Sticky column cell
getButtonIcon(theme, buttonState)        // Copy/check/warning icon switcher
```

### Custom palette extensions

The theme extends `PaletteColor` with alpha variants:

```typescript
theme.palette.primary.alpha_05; // 5% opacity
theme.palette.primary.alpha_12; // 12% opacity
theme.palette.primary.alpha_26; // 26% opacity
theme.palette.primary.alpha_50; // 50% opacity
```

### Adding a new design token

Augment the theme; do not export a const. The palette alpha variants above use this mechanism.

1. Add a `declare module '@mui/material/styles'` augmentation for `Theme` and `ThemeOptions`.
2. Set the value in `createTheme()`.
3. Consume via `theme.*` in `sx` callbacks: `borderRadius: (theme) => theme.radius.lg`.

The theme is the single source of truth for palette, spacing, typography, and transitions — new tokens are peers of those. Store px values as **strings** (`'12px'`): in `sx.borderRadius` a number is multiplied by `theme.shape.borderRadius`, while a string is literal.

---

## Conventions

### `sx` vs `styled()`

**Use `sx`** for one-off, inline, or theme-dependent styles:

```typescript
<Box sx={{ bgcolor: paperBackground[theme.palette.mode], p: 2 }} />

// Or with a theme callback:
<Box sx={{ border: (theme) => defaultOutline[theme.palette.mode] }} />
```

**Use `styled()`** when creating a reusable component variant or when conditional logic on props is complex:

```typescript
const OutlinedToggleButton = styled(ToggleButton)(({ selected, theme }) => ({
    border: selected
        ? `1px solid ${theme.palette.primary.main}`
        : defaultOutline[theme.palette.mode],
}));
```

### `slots` and `slotProps` (not `components` / `componentsProps`)

MUI v7 replaced `components`/`componentsProps` with `slots`/`slotProps`. Always use the new API:

```typescript
// Correct
<Autocomplete
    slots={{ popper: CustomPopper }}
    slotProps={{ listbox: { component: ListboxComponent } }}
/>

// Incorrect (deprecated)
<Autocomplete
    components={{ Popper: CustomPopper }}
    componentsProps={{ listbox: { component: ListboxComponent } }}
/>
```

### Icons

Prefer `iconoir-react` over `@mui/icons-material`. The project uses Iconoir throughout. MUI icons are only kept for cases where Iconoir has no equivalent or for integrations that are tied to MUI (like JsonForms).

---

## Known Gotchas

### iconoir icon sizing

iconoir icons render as `<svg width="1.5em" height="1.5em">`, so `style={{ fontSize: N }}` renders at **1.5×N px** — `fontSize: 20` is a 30px icon. The `fontSize` styling is a vestige of a brief lucide migration (reverted May 2026) that had a different multiplier. Size icons with explicit `width={N} height={N}` props instead. The global `IconoirProvider` (`src/context/Iconoir.tsx`) sets `fontSize: '14px'`, which makes unsized icons 21px.

### Popper transitions

`<Popper transition>` does not support `slotProps` for transitions — it uses a render function child instead. This is the correct MUI v7 pattern. See the comment in `src/components/shared/PopperWrapper.tsx`:

```typescript
{({ TransitionProps }) => (
    // This _looks_ like it should use slotProps but it does not (Q1 2026)
    // https://mui.com/material-ui/react-popper/#transitions
    <Fade {...TransitionProps} timeout={350}>
```

Do not "fix" this by removing the render prop.

### All inputs default to `variant="standard"`

The theme sets `standard` as the default variant for all form inputs. If a design calls for `outlined`, pass it explicitly — but prefer `standard` for consistency.

### Light mode palette is still being refined

There is a `TODO` in `src/context/Theme.tsx` about balancing the light mode palette. Some token pairs are intentionally incomplete. Check both modes when building new UI.

Dark Mode stacks opacity so nested forms get darker as they are nested. We do not have the same thing in light mode so often light mode shows nesting with outlines.

### `@mui/lab` is beta

`@mui/lab` v7 is in beta. All stable components (e.g., `LoadingButton`) have moved to `@mui/material`. Avoid adding new imports from `@mui/lab`; use `@mui/material` equivalents instead.
