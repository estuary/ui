import { stringToReadableColor } from 'src/utils/stableColor';

// Split a catalog name into its containing prefix (including the trailing
// slash) and its leaf segment, e.g. "acmeCo/staging/ci-bot" ->
// { prefix: "acmeCo/staging/", leaf: "ci-bot" }.
export function splitCatalogName(catalogName: string): {
    prefix: string;
    leaf: string;
} {
    const trimmed = catalogName.replace(/\/$/, '');
    const lastSlash = trimmed.lastIndexOf('/');

    if (lastSlash === -1) {
        return { prefix: '', leaf: trimmed };
    }

    return {
        prefix: trimmed.slice(0, lastSlash + 1),
        leaf: trimmed.slice(lastSlash + 1),
    };
}

// The single letter an entity's tile carries, taken from its leaf name. A leaf
// with nothing alphanumeric in it falls back to a question mark, so the tile
// never sits empty.
export function monogram(catalogName: string): string {
    const { leaf } = splitCatalogName(catalogName);
    const alphanumeric = leaf.replace(/[^a-z0-9]/gi, '');

    return (alphanumeric.slice(0, 1) || '?').toUpperCase();
}

// The monogram itself is always this near-black, in both themes, so the tile
// behind it carries the entity's color and the letter stays a constant.
export const MONOGRAM_TEXT_COLOR = '#06121F';

// Stable per-entity background color for the monogram tile, derived from the
// catalog name. The color is lightened until it clears AA against
// `MONOGRAM_TEXT_COLOR`, so no hue leaves the letter unreadable.
export function monogramColor(catalogName: string): string {
    return stringToReadableColor(catalogName, MONOGRAM_TEXT_COLOR, {
        saturation: 80,
    });
}
