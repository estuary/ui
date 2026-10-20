import type { PublicDataPlanesQuery } from 'src/gql-types/graphql';

import { REGIONS } from 'src/components/onboarding/DataPlanePicker/regions';
import { parseDataPlaneName } from 'src/utils/dataPlane-utils';

export type PublicDataPlane =
    PublicDataPlanesQuery['publicDataPlanes']['edges'][number]['node'];

interface ProviderMetadata {
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

// Regions we run public planes in today, in display order. Every other
// region sorts after these, alphabetically by code.
const RANKED_REGIONS: Record<string, readonly string[]> = {
    AWS: ['us-east-1', 'eu-west-1', 'us-west-2', 'ap-southeast-2'],
    GCP: ['us-central1'],
    AZURE: ['centralus'],
};

export interface DataPlaneChoice {
    // ISO 3166-1 alpha-2 code, or null when the region is not in `REGIONS`.
    country: string | null;
    // Set only when another plane shares this plane's provider and region,
    // so the two options can be told apart.
    disambiguator: string | null;
    label: string;
    plane: PublicDataPlane;
    providerKnown: boolean;
}

export interface DataPlaneGroup {
    choices: DataPlaneChoice[];
    label: string;
    provider: string;
}

const compareText = (a: string, b: string) => (a < b ? -1 : a > b ? 1 : 0);

const UNRANKED = Number.MAX_SAFE_INTEGER;

const getProviderMetadata = (provider: string) =>
    PROVIDERS[provider] as ProviderMetadata | undefined;

const getProviderRank = (provider: string) =>
    getProviderMetadata(provider)?.rank ?? UNRANKED;

const getRegionRank = (provider: string, region: string) => {
    const index = RANKED_REGIONS[provider]?.indexOf(region) ?? -1;

    return index === -1 ? UNRANKED : index;
};

const getRegionMetadata = (provider: string, region: string) => {
    const entry = REGIONS[provider]?.[region];

    return entry ? { label: entry[0], country: entry[1] } : null;
};

// `LOCAL` → `Local`, `IBM_CLOUD` → `Ibm Cloud`.
const toTitleCase = (value: string) =>
    value
        .toLowerCase()
        .split(/[\s_-]+/)
        .filter(Boolean)
        .map((word) => word[0].toUpperCase() + word.slice(1))
        .join(' ');

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
                getProviderRank(a) - getProviderRank(b) || compareText(a, b)
        )
        .map(([provider, providerPlanes]) => ({
            provider,
            label:
                getProviderMetadata(provider)?.label ?? toTitleCase(provider),
            choices: [...providerPlanes]
                .sort(
                    (a, b) =>
                        getRegionRank(provider, a.region) -
                            getRegionRank(provider, b.region) ||
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
                        providerKnown: Boolean(getProviderMetadata(provider)),
                    };
                }),
        }));
};
