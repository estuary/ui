import { getContrastRatio } from '@mui/material/styles';

import { MONOGRAM_TEXT_COLOR } from 'src/components/admin/ServiceAccounts/shared';
import { stringToReadableColor } from 'src/utils/stableColor';

// Enough distinct strings to land on every hue the hash can produce.
const SAMPLES = Array.from({ length: 2000 }, (_, index) => `sample-${index}`);

// The real consumer, plus the extremes that exercise both walk directions.
const SURFACES = [
    ['monogram text', MONOGRAM_TEXT_COLOR],
    ['white', '#FFFFFF'],
    ['black', '#000000'],
] as const;

describe('stringToReadableColor', () => {
    test.each(SURFACES)('clears AA against the %s', (_label, surface) => {
        const failures = SAMPLES.filter(
            (sample) =>
                getContrastRatio(
                    stringToReadableColor(sample, surface),
                    surface
                ) < 4.5
        );

        expect(failures).toEqual([]);
    });

    test('honors a raised target ratio', () => {
        const surface = '#FFFFFF';

        const failures = SAMPLES.filter(
            (sample) =>
                getContrastRatio(
                    stringToReadableColor(sample, surface, { targetRatio: 7 }),
                    surface
                ) < 7
        );

        expect(failures).toEqual([]);
    });

    test('returns the same color for the same string', () => {
        const surface = '#FFFFFF';

        expect(stringToReadableColor('acme/ci-bot', surface)).toBe(
            stringToReadableColor('acme/ci-bot', surface)
        );
    });

    test('varies the color across strings', () => {
        const distinct = new Set(
            SAMPLES.map((sample) => stringToReadableColor(sample, '#FFFFFF'))
        );

        expect(distinct.size).toBeGreaterThan(100);
    });
});
