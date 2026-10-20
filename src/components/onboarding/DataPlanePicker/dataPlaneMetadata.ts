import type {
    DataPlaneCloudProvider,
    PublicDataPlanesQuery,
} from 'src/gql-types/graphql';

import { getRegion, PROVIDER_LABELS } from 'src/utils/cloudRegions';

export type PublicDataPlane =
    PublicDataPlanesQuery['publicDataPlanes']['edges'][number]['node'];

export interface DataPlaneChoice {
    country: string | null;
    detail: string;
    label: string;
    plane: PublicDataPlane;
}

export interface DataPlaneGroup {
    choices: DataPlaneChoice[];
    label: string;
    provider: DataPlaneCloudProvider;
}

const GROUP_LABELS: Record<DataPlaneCloudProvider, string> = {
    ...PROVIDER_LABELS,
    LOCAL: 'Local',
};

// Hand-maintained, roughly by usage. Unlisted regions sort after these.
const PROVIDER_ORDER: DataPlaneCloudProvider[] = ['AWS', 'GCP', 'AZURE'];
const REGION_ORDER: Partial<Record<DataPlaneCloudProvider, string[]>> = {
    AWS: ['us-east-1', 'eu-west-1', 'us-west-2', 'ap-southeast-2'],
    GCP: ['us-central1'],
    AZURE: ['centralus'],
};

const rank = <T>(order: T[] | undefined, value: T) => {
    const index = order?.indexOf(value) ?? -1;

    return index === -1 ? Number.MAX_SAFE_INTEGER : index;
};

const compareDataPlanes = (a: PublicDataPlane, b: PublicDataPlane) =>
    rank(PROVIDER_ORDER, a.cloudProvider) -
        rank(PROVIDER_ORDER, b.cloudProvider) ||
    a.cloudProvider.localeCompare(b.cloudProvider) ||
    rank(REGION_ORDER[a.cloudProvider], a.region) -
        rank(REGION_ORDER[a.cloudProvider], b.region) ||
    a.region.localeCompare(b.region) ||
    a.name.localeCompare(b.name);

// `c1` from `ops/dp/public/aws-us-east-1-c1`.
const getCluster = ({ cloudProvider, name, region }: PublicDataPlane) => {
    const suffix = name.slice(name.lastIndexOf('/') + 1);
    const prefix = `${cloudProvider.toLowerCase()}-${region}-`;

    return suffix.startsWith(prefix) ? suffix.slice(prefix.length) : suffix;
};

export const groupDataPlanes = (
    planes: readonly PublicDataPlane[]
): DataPlaneGroup[] => {
    const groups = new Map<DataPlaneCloudProvider, PublicDataPlane[]>();

    [...planes].sort(compareDataPlanes).forEach((plane) => {
        const group = groups.get(plane.cloudProvider);

        if (group) {
            group.push(plane);
        } else {
            groups.set(plane.cloudProvider, [plane]);
        }
    });

    return Array.from(groups, ([provider, groupPlanes]) => ({
        provider,
        // Falls back for a provider added to the API before codegen catches up.
        label: GROUP_LABELS[provider] ?? provider,
        choices: groupPlanes.map((plane) => {
            const [label, country] = getRegion(provider, plane.region) ?? [];
            const sharesRegion =
                groupPlanes.filter(
                    ({ region: other }) => other === plane.region
                ).length > 1;

            return {
                plane,
                label: label ?? plane.region,
                country: country ?? null,
                // An unknown region's label is already its code.
                detail: [
                    label ? plane.region : null,
                    sharesRegion ? getCluster(plane) : null,
                ]
                    .filter(Boolean)
                    .join(' · '),
            };
        }),
    }));
};
