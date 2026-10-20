import { existsSync } from 'node:fs';
import { resolve } from 'node:path';

import { REGIONS } from 'src/components/onboarding/DataPlanePicker/regions';

const countries = [
    ...new Set(
        Object.values(REGIONS).flatMap((table) =>
            Object.values(table).map(([, country]) => country)
        )
    ),
];

describe('REGIONS', () => {
    // A country code with no flag would quietly render without one; catch
    // typos such as `UK` for `GB` here instead.
    test.each(countries)('has a flag for %s', (country) => {
        expect(
            existsSync(
                resolve(
                    __dirname,
                    `../../../../../node_modules/country-flag-icons/3x2/${country}.svg`
                )
            )
        ).toBe(true);
    });
});
