import type { PublicDataPlaneNode } from 'src/api/gql/dataPlanes';

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

// The platform's default plane for new tenants.
const DEFAULT_PUBLIC_DATA_PLANE = 'ops/dp/public/aws-us-east-1-c1';

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
        if (!value && options.length > 0) {
            const preferred =
                options.find(
                    (option) => option.name === DEFAULT_PUBLIC_DATA_PLANE
                ) ?? options[0];
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
