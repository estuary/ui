import type { PublicDataPlane } from 'src/components/onboarding/DataPlanePicker/dataPlaneMetadata';

import {
    getDefaultDataPlane,
    groupDataPlanes,
} from 'src/components/onboarding/DataPlanePicker/dataPlaneMetadata';

const plane = (
    cloudProvider: PublicDataPlane['cloudProvider'],
    region: string,
    cluster = 'c1'
): PublicDataPlane => ({
    name: `ops/dp/public/${cloudProvider.toLowerCase()}-${region}-${cluster}`,
    cloudProvider,
    region,
});

const summarize = (planes: PublicDataPlane[]) =>
    groupDataPlanes(planes).map(({ label, choices }) => [
        label,
        choices.map((choice) => [choice.label, choice.country, choice.detail]),
    ]);

describe('groupDataPlanes', () => {
    test('groups and orders production planes', () => {
        expect(
            summarize([
                plane('AWS', 'ap-southeast-2'),
                plane('AWS', 'eu-west-1'),
                plane('AWS', 'us-east-1', 'c1'),
                plane('AWS', 'us-east-1', 'c2'),
                plane('AWS', 'us-west-2'),
                plane('AZURE', 'centralus'),
                plane('GCP', 'us-central1'),
            ])
        ).toEqual([
            [
                'Amazon Web Services',
                [
                    ['US East (N. Virginia)', 'US', 'us-east-1 · c1'],
                    ['US East (N. Virginia)', 'US', 'us-east-1 · c2'],
                    ['Europe (Ireland)', 'IE', 'eu-west-1'],
                    ['US West (Oregon)', 'US', 'us-west-2'],
                    ['Asia Pacific (Sydney)', 'AU', 'ap-southeast-2'],
                ],
            ],
            [
                'Google Cloud Platform',
                [['US Central (Iowa)', 'US', 'us-central1']],
            ],
            ['Microsoft Azure', [['Central US (Iowa)', 'US', 'centralus']]],
        ]);
    });

    test('sorts unranked regions and providers last, by code', () => {
        expect(
            summarize([
                plane('LOCAL', 'cluster'),
                plane('AWS', 'xx-moon-1'),
                plane('AWS', 'sa-east-1'),
                plane('AWS', 'us-west-2'),
            ])
        ).toEqual([
            [
                'Amazon Web Services',
                [
                    ['US West (Oregon)', 'US', 'us-west-2'],
                    ['South America (São Paulo)', 'BR', 'sa-east-1'],
                    ['xx-moon-1', null, ''],
                ],
            ],
            ['Local', [['cluster', null, '']]],
        ]);
    });
});

describe('getDefaultDataPlane', () => {
    test.each([
        [['c2', 'c3'], 'c3'],
        [['c10', 'c9'], 'c10'],
    ])('picks the highest us-east-1 cluster from %j', (clusters, expected) => {
        expect(
            getDefaultDataPlane([
                plane('AWS', 'eu-west-1', 'c9'),
                ...clusters.map((cluster) =>
                    plane('AWS', 'us-east-1', cluster)
                ),
            ])?.name
        ).toBe(plane('AWS', 'us-east-1', expected).name);
    });

    test('returns nothing without an AWS us-east-1 plane', () => {
        expect(
            getDefaultDataPlane([
                plane('AWS', 'us-west-2'),
                plane('GCP', 'us-east1'),
            ])
        ).toBeUndefined();
    });
});
