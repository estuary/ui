import type { PublicDataPlaneNode } from 'src/api/gql/dataPlanes';
import type { CloudProvider } from 'src/utils/cloudRegions';

import { useEffect, useMemo } from 'react';

import {
    Autocomplete,
    FormControl,
    FormLabel,
    inputBaseClasses,
    TextField,
} from '@mui/material';

import { usePostHog } from '@posthog/react';

import DataPlaneIcon from 'src/components/shared/Entity/DataPlaneIcon';
import { usePublicDataPlanes } from 'src/hooks/dataPlanes/usePublicDataPlanes';

// Default to a region, not a plane: a replacement plane is opened and the old
// one closed, and only open planes are listed, so this survives c1 -> c2.
const DEFAULT_PROVIDER: CloudProvider = 'AWS';
const DEFAULT_REGION = 'us-east-1';

// The newest open plane in the default region, or the first option if the
// region has none. Names are compared numerically so `c10` beats `c9`.
const preferredDataPlane = (
    options: PublicDataPlaneNode[]
): PublicDataPlaneNode | undefined => {
    const inRegion = options
        .filter(
            (option) =>
                option.cloudProvider === DEFAULT_PROVIDER &&
                option.region === DEFAULT_REGION
        )
        .sort((a, b) =>
            a.name.localeCompare(b.name, undefined, { numeric: true })
        );

    return inRegion[inRegion.length - 1] ?? options[0];
};

const INPUT_SX = {
    maxWidth: 424,
    [`& .${inputBaseClasses.root}`]: { borderRadius: 3 },
};

// `aws-us-east-1-c1` -> `us-east-1 c1`; the provider is the group header.
const optionLabel = ({ name, region }: PublicDataPlaneNode) => {
    const suffix = name.substring(name.lastIndexOf('/') + 1);
    const marker = `${region}-`;
    const markerIndex = suffix.lastIndexOf(marker);

    if (markerIndex !== -1) {
        return `${region} ${suffix.substring(markerIndex + marker.length)}`;
    }

    return suffix.endsWith(`-${region}`) ? region : name;
};

interface Props {
    value: string | null;
    onChange: (value: string) => void;
}

export function DataPlaneSelector({ value, onChange }: Props) {
    const postHog = usePostHog();
    const { dataPlanes, loading, error } = usePublicDataPlanes();

    // groupBy requires options to be sorted by group.
    const options = useMemo(
        () =>
            [...dataPlanes].sort(
                (a, b) =>
                    a.cloudProvider.localeCompare(b.cloudProvider) ||
                    a.region.localeCompare(b.region)
            ),
        [dataPlanes]
    );

    // Preselect so an untouched picker still submits an explicit choice.
    useEffect(() => {
        const preferred = preferredDataPlane(options);
        if (!value && preferred) {
            onChange(preferred.name);
        }
    }, [onChange, options, value]);

    useEffect(() => {
        if (error) {
            postHog.capture('Onboarding:DataPlanes', {
                status: 'failure',
                error: error.message,
            });
        }
    }, [error, postHog]);

    // Render nothing on failure: the claim then omits requestedDataPlane and
    // the backend applies its default, so signup isn't blocked.
    if (error || (!loading && options.length === 0)) {
        return null;
    }

    const currentOption = options.find((option) => option.name === value);

    return (
        <FormControl>
            <FormLabel id="requestedDataPlane" sx={{ mb: 1, fontSize: 20 }}>
                Data Plane
            </FormLabel>

            <Autocomplete
                disableClearable
                loading={loading}
                options={options}
                // Null only until the default is preselected.
                value={
                    currentOption ?? (null as unknown as PublicDataPlaneNode)
                }
                onChange={(_event, option) => onChange(option.name)}
                groupBy={(option) => option.cloudProvider}
                getOptionLabel={optionLabel}
                renderOption={(props, option) => {
                    const { key, ...rest } = props;
                    return (
                        <li key={key} {...rest}>
                            <DataPlaneIcon
                                provider={option.cloudProvider}
                                scope="public"
                                size={20}
                            />
                            <span style={{ marginLeft: 8 }}>
                                {optionLabel(option)}
                            </span>
                        </li>
                    );
                }}
                renderInput={(params) => (
                    <TextField
                        {...params}
                        size="small"
                        variant="outlined"
                        helperText="Where your data is processed. Pick the region closest to your data sources."
                        sx={INPUT_SX}
                    />
                )}
            />
        </FormControl>
    );
}
