import type { PublicDataPlanesQuery } from 'src/gql-types/graphql';

import { parseDataPlaneName } from 'src/utils/dataPlane-utils';

export type PublicDataPlane =
    PublicDataPlanesQuery['publicDataPlanes']['edges'][number]['node'];

export type CountryCode = 'AU' | 'IE' | 'US';

interface ProviderMetadata {
    label: string;
    rank: number;
}

interface RegionMetadata {
    country: CountryCode;
    label: string;
    rank: number;
}

// Static display order, roughly by usage. It does not need to track usage
// dynamically; update it by hand when the mix of tenants shifts.
const PROVIDERS: Record<string, ProviderMetadata> = {
    AWS: { label: 'Amazon Web Services', rank: 0 },
    GCP: { label: 'Google Cloud', rank: 1 },
    AZURE: { label: 'Microsoft Azure', rank: 2 },
};

const REGIONS: Record<string, Record<string, RegionMetadata>> = {
    AWS: {
        'us-east-1': { country: 'US', label: 'US East (N. Virginia)', rank: 0 },
        'eu-west-1': { country: 'IE', label: 'Europe (Ireland)', rank: 1 },
        'us-west-2': { country: 'US', label: 'US West (Oregon)', rank: 2 },
        'ap-southeast-2': {
            country: 'AU',
            label: 'Asia Pacific (Sydney)',
            rank: 3,
        },
    },
    GCP: {
        'us-central1': { country: 'US', label: 'Iowa', rank: 0 },
    },
    AZURE: {
        centralus: { country: 'US', label: 'Central US (Iowa)', rank: 0 },
    },
};

export interface DataPlaneChoice {
    country: CountryCode | null;
    // Set only when another plane shares this plane's provider and region,
    // so the two options can be told apart.
    disambiguator: string | null;
    label: string;
    plane: PublicDataPlane;
}

export interface DataPlaneGroup {
    choices: DataPlaneChoice[];
    label: string;
    provider: string;
}

const compareText = (a: string, b: string) => (a < b ? -1 : a > b ? 1 : 0);

const rankOf = (metadata: { rank: number } | undefined) =>
    metadata?.rank ?? Number.MAX_SAFE_INTEGER;

const getProviderMetadata = (provider: string) =>
    PROVIDERS[provider.toUpperCase()] as ProviderMetadata | undefined;

const getRegionMetadata = (provider: string, region: string) =>
    REGIONS[provider.toUpperCase()]?.[region] as RegionMetadata | undefined;

// The cluster suffix of the plane name (e.g. `c1` in
// `ops/dp/public/aws-us-east-1-c1`), falling back to the whole name when it
// does not parse.
const getDisambiguator = (plane: PublicDataPlane) =>
    parseDataPlaneName(plane.name, 'public').cluster || plane.name;

// Groups planes by provider and sorts groups and choices into the static
// display order. Unknown providers and regions sort after the known ones,
// alphabetically.
export const groupDataPlanes = (
    planes: readonly PublicDataPlane[]
): DataPlaneGroup[] => {
    const byProvider = new Map<string, PublicDataPlane[]>();

    planes.forEach((plane) => {
        const provider = plane.cloudProvider.toUpperCase();

        byProvider.set(provider, [...(byProvider.get(provider) ?? []), plane]);
    });

    return Array.from(byProvider.entries())
        .sort(
            ([a], [b]) =>
                rankOf(getProviderMetadata(a)) -
                    rankOf(getProviderMetadata(b)) || compareText(a, b)
        )
        .map(([provider, providerPlanes]) => ({
            provider,
            label: getProviderMetadata(provider)?.label ?? provider,
            choices: [...providerPlanes]
                .sort(
                    (a, b) =>
                        rankOf(getRegionMetadata(provider, a.region)) -
                            rankOf(getRegionMetadata(provider, b.region)) ||
                        compareText(a.region, b.region) ||
                        compareText(a.name, b.name)
                )
                .map((plane) => {
                    const region = getRegionMetadata(provider, plane.region);
                    const duplicated =
                        providerPlanes.filter(
                            ({ region: other }) => other === plane.region
                        ).length > 1;

                    return {
                        country: region?.country ?? null,
                        disambiguator: duplicated
                            ? getDisambiguator(plane)
                            : null,
                        label: region?.label ?? plane.region,
                        plane,
                    };
                }),
        }));
};
