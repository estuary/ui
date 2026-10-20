import type { PublicDataPlane } from 'src/components/onboarding/DataPlanePicker/dataPlaneMetadata';

import { groupDataPlanes } from 'src/components/onboarding/DataPlanePicker/dataPlaneMetadata';

const plane = (
    cloudProvider: string,
    region: string,
    cluster = 'c1'
): PublicDataPlane => ({
    name: `ops/dp/public/${cloudProvider.toLowerCase()}-${region}-${cluster}`,
    cloudProvider: cloudProvider as PublicDataPlane['cloudProvider'],
    region,
});

// The order production currently returns them in.
const productionPlanes = [
    plane('AWS', 'ap-southeast-2'),
    plane('AWS', 'eu-west-1'),
    plane('AWS', 'us-east-1', 'c1'),
    plane('AWS', 'us-east-1', 'c2'),
    plane('AWS', 'us-west-2'),
    plane('AZURE', 'centralus'),
    plane('GCP', 'us-central1'),
];

describe('groupDataPlanes', () => {
    test('orders provider groups AWS, GCP, then Azure', () => {
        expect(
            groupDataPlanes(productionPlanes).map(({ provider, label }) => [
                provider,
                label,
            ])
        ).toEqual([
            ['AWS', 'Amazon Web Services'],
            ['GCP', 'Google Cloud'],
            ['AZURE', 'Microsoft Azure'],
        ]);
    });

    test('orders AWS regions by usage, with Sydney last', () => {
        const [aws] = groupDataPlanes(productionPlanes);

        expect(
            aws.choices.map(({ plane: { region }, label }) => [region, label])
        ).toEqual([
            ['us-east-1', 'US East (N. Virginia)'],
            ['us-east-1', 'US East (N. Virginia)'],
            ['eu-west-1', 'Europe (Ireland)'],
            ['us-west-2', 'US West (Oregon)'],
            ['ap-southeast-2', 'Asia Pacific (Sydney)'],
        ]);
    });

    test('labels GCP and Azure regions and gives them flags', () => {
        const [, gcp, azure] = groupDataPlanes(productionPlanes);

        expect(gcp.choices[0]).toMatchObject({ label: 'Iowa', country: 'US' });
        expect(azure.choices[0]).toMatchObject({
            label: 'Central US (Iowa)',
            country: 'US',
        });
    });

    test('distinguishes planes that share a provider and region by cluster', () => {
        const [aws] = groupDataPlanes(productionPlanes);

        expect(aws.choices.map(({ disambiguator }) => disambiguator)).toEqual([
            'c1',
            'c2',
            null,
            null,
            null,
        ]);
    });

    test('falls back to the whole name when a duplicate has no cluster suffix', () => {
        const [aws] = groupDataPlanes([
            { name: 'odd-name-a', cloudProvider: 'AWS', region: 'us-east-1' },
            { name: 'odd-name-b', cloudProvider: 'AWS', region: 'us-east-1' },
        ]);

        expect(aws.choices.map(({ disambiguator }) => disambiguator)).toEqual([
            'odd-name-a',
            'odd-name-b',
        ]);
    });

    test('names regions from the expanded tables for every provider', () => {
        const [aws, gcp, azure] = groupDataPlanes([
            plane('AWS', 'eu-central-1'),
            plane('GCP', 'europe-west1'),
            plane('AZURE', 'westeurope'),
        ]);

        expect(aws.choices[0]).toMatchObject({
            label: 'Europe (Frankfurt)',
            country: 'DE',
        });
        expect(gcp.choices[0]).toMatchObject({
            label: 'Belgium',
            country: 'BE',
        });
        expect(azure.choices[0]).toMatchObject({
            label: 'West Europe (Netherlands)',
            country: 'NL',
        });
    });

    test('sorts unranked regions, known or not, after ranked ones by code', () => {
        const [aws] = groupDataPlanes([
            plane('AWS', 'us-west-2'),
            plane('AWS', 'xx-moon-1'),
            plane('AWS', 'sa-east-1'),
            plane('AWS', 'ca-central-1'),
            plane('AWS', 'us-east-1'),
        ]);

        expect(
            aws.choices.map(({ label, country }) => [label, country])
        ).toEqual([
            ['US East (N. Virginia)', 'US'],
            ['US West (Oregon)', 'US'],
            ['Canada (Central)', 'CA'],
            ['South America (São Paulo)', 'BR'],
            ['xx-moon-1', null],
        ]);
    });

    test('renders an unknown region by its code, without a country', () => {
        const [gcp] = groupDataPlanes([plane('GCP', 'mars-north1')]);

        expect(gcp.choices[0]).toMatchObject({
            label: 'mars-north1',
            country: null,
            providerKnown: true,
        });
    });

    test('puts unknown providers in title-cased groups at the end, alphabetically', () => {
        const groups = groupDataPlanes([
            plane('LOCAL', 'cluster'),
            plane('AZURE', 'centralus'),
            plane('IBM_CLOUD', 'us-south'),
            plane('AWS', 'us-east-1'),
        ]);

        expect(groups.map(({ provider, label }) => [provider, label])).toEqual([
            ['AWS', 'Amazon Web Services'],
            ['AZURE', 'Microsoft Azure'],
            ['IBM_CLOUD', 'Ibm Cloud'],
            ['LOCAL', 'Local'],
        ]);
        expect(groups[3].choices[0]).toMatchObject({
            label: 'cluster',
            country: null,
            disambiguator: null,
            providerKnown: false,
        });
        expect(groups[0].choices[0].providerKnown).toBe(true);
    });

    test('returns no groups for no planes', () => {
        expect(groupDataPlanes([])).toEqual([]);
    });
});
