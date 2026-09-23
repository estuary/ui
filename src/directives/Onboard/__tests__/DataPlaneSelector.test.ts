import type { PublicDataPlaneNode } from 'src/api/gql/dataPlanes';
import type { CloudProvider } from 'src/utils/cloudRegions';

import { preferredDataPlane } from 'src/directives/Onboard/DataPlaneSelector';

const plane = (
    cloudProvider: CloudProvider,
    region: string,
    tag: string
): PublicDataPlaneNode => ({
    name: `ops/dp/public/${cloudProvider.toLowerCase()}-${region}-${tag}`,
    cloudProvider,
    region,
});

describe('preferredDataPlane', () => {
    test('picks the newest open plane in the default region', () => {
        const newest = plane('AWS', 'us-east-1', 'c2');
        expect(
            preferredDataPlane([
                plane('AWS', 'eu-west-1', 'c9'),
                plane('AWS', 'us-east-1', 'c1'),
                newest,
                plane('GCP', 'us-central1', 'c3'),
            ])
        ).toBe(newest);
    });

    test('orders plane tags numerically', () => {
        const newest = plane('AWS', 'us-east-1', 'c10');
        expect(
            preferredDataPlane([newest, plane('AWS', 'us-east-1', 'c9')])
        ).toBe(newest);
    });

    test('falls back to the first option when the default region has no open plane', () => {
        const first = plane('AWS', 'eu-west-1', 'c1');
        expect(
            preferredDataPlane([first, plane('GCP', 'us-central1', 'c1')])
        ).toBe(first);
    });

    test('is undefined when there are no options', () => {
        expect(preferredDataPlane([])).toBeUndefined();
    });
});
