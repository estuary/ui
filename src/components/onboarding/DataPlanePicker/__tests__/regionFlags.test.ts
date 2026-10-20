import { existsSync } from 'node:fs';
import { resolve } from 'node:path';

import { CLOUD_REGIONS } from 'src/utils/cloudRegions';

describe('CLOUD_REGIONS', () => {
    test('every country has a flag', () => {
        const countries = Object.values(CLOUD_REGIONS).flatMap((regions) =>
            Object.values(regions).map(([, country]) => country)
        );

        expect(
            countries.filter(
                (country) =>
                    !existsSync(
                        resolve(
                            'node_modules/country-flag-icons/3x2',
                            `${country}.svg`
                        )
                    )
            )
        ).toEqual([]);
    });
});
