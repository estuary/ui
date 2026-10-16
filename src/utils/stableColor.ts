import { getContrastRatio, getLuminance } from '@mui/material/styles';

interface ReadableColorOptions {
    saturation?: number;
    targetRatio?: number;
}

// Where the lightness search starts. Hues read as fully saturated here, so most
// strings keep this value and only the hues that fail the check have to move.
const START_LIGHTNESS = 55;

// WCAG AA for body text.
const DEFAULT_TARGET_RATIO = 4.5;

/**
 * Picks a stable color for a string that stays legible next to `against`.
 *
 * A hash of the string sets the hue, so a given string always gets the same
 * hue. Lightness then steps away from `against` until the pair clears
 * `targetRatio`. HSL lightness does not track perceived luminance — a yellow
 * and a blue at lightness 55 differ by more than 4x in contrast against a white
 * page — so the ratio has to be measured rather than assumed.
 *
 * `against` must be opaque. Contrast math ignores alpha, so a translucent value
 * is read as its own color instead of as the blend that reaches the screen.
 */
export function stringToReadableColor(
    str: string,
    against: string,
    options: ReadableColorOptions = {}
): string {
    const { saturation = 65, targetRatio = DEFAULT_TARGET_RATIO } = options;

    const hue = hashToHue(str);

    // Darken against a light color, lighten against a dark one.
    const step = getLuminance(against) > 0.5 ? -1 : 1;

    let lightness = START_LIGHTNESS;
    while (lightness >= 0 && lightness <= 100) {
        const candidate = hslToHex(hue, saturation, lightness);

        if (getContrastRatio(candidate, against) >= targetRatio) {
            return candidate;
        }

        lightness += step;
    }

    // Black or white — the most contrast this hue can reach.
    return hslToHex(hue, saturation, step < 0 ? 0 : 100);
}

// FNV-1a over the string, reduced to a hue on the color wheel.
function hashToHue(str: string): number {
    let hash = 0x811c9dc5;
    for (let i = 0; i < str.length; i++) {
        hash ^= str.charCodeAt(i);
        hash = Math.imul(hash, 0x01000193);
    }

    return (hash >>> 0) % 360;
}

function hslToHex(h: number, s: number, l: number): string {
    s /= 100;
    l /= 100;
    const a = s * Math.min(l, 1 - l);
    const f = (n: number): string => {
        const k = (n + h / 30) % 12;
        const c = l - a * Math.max(-1, Math.min(k - 3, 9 - k, 1));
        return Math.round(255 * c)
            .toString(16)
            .padStart(2, '0');
    };
    return `#${f(0)}${f(8)}${f(4)}`;
}
