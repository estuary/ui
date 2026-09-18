import type { PublicDataPlaneNode } from 'src/api/gql/dataPlanes';

import { useEffect, useMemo } from 'react';

import {
    Autocomplete,
    FormControl,
    FormLabel,
    inputBaseClasses,
    TextField,
} from '@mui/material';

import { useIntl } from 'react-intl';

import DataPlaneIcon from 'src/components/shared/Entity/DataPlaneIcon';
import {
    useOnboardingStore_requestedDataPlane,
    useOnboardingStore_setRequestedDataPlane,
} from 'src/directives/Onboard/Store/hooks';
import { usePublicDataPlanes } from 'src/hooks/dataPlanes/usePublicDataPlanes';

// Matches est-dry-dock's phased rollout of colocated trial buckets: this is
// the plane new tenants land on when nothing else is picked.
const DEFAULT_PUBLIC_DATA_PLANE = 'ops/dp/public/aws-us-east-1-c1';

const INPUT_SX = {
    maxWidth: 424,
    [`& .${inputBaseClasses.root}`]: { borderRadius: 3 },
};

// The region and full catalog name are both shown: multiple public planes can
// share a region, so the name is what makes the choice unambiguous.
const optionLabel = (option: PublicDataPlaneNode) =>
    `${option.region} (${option.name})`;

function DataPlaneSelector() {
    const intl = useIntl();
    const { dataPlanes, loading, error } = usePublicDataPlanes();

    const selected = useOnboardingStore_requestedDataPlane();
    const setSelected = useOnboardingStore_setRequestedDataPlane();

    // Sorted by provider first because groupBy only groups correctly when the
    // list is already ordered by group; sorting on name alone worked only
    // because the names happen to embed the provider.
    const options = useMemo(
        () =>
            [...dataPlanes].sort(
                (a, b) =>
                    a.cloudProvider.localeCompare(b.cloudProvider) ||
                    a.region.localeCompare(b.region)
            ),
        [dataPlanes]
    );

    // Preselect the platform default so submitting without touching the
    // picker still records an explicit, valid choice.
    useEffect(() => {
        if (!selected && options.length > 0) {
            const preferred =
                options.find(
                    (option) => option.name === DEFAULT_PUBLIC_DATA_PLANE
                ) ?? options[0];
            setSelected(preferred.name);
        }
    }, [options, selected, setSelected]);

    // Fail safe: if the plane list can't be fetched, render nothing. The
    // claim simply omits requestedDataPlane and the backend applies its
    // own default instead of blocking signup on this field.
    if (error || (!loading && options.length === 0)) {
        return null;
    }

    const currentOption = options.find((option) => option.name === selected);

    return (
        <FormControl>
            <FormLabel id="requestedDataPlane" sx={{ mb: 1, fontSize: 20 }}>
                {intl.formatMessage({ id: 'tenant.dataPlane.label' })}
            </FormLabel>

            <Autocomplete
                loading={loading}
                options={options}
                value={currentOption ?? null}
                onChange={(_event, value) => setSelected(value?.name ?? null)}
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
                        helperText={intl.formatMessage({
                            id: 'tenant.dataPlane.helper',
                        })}
                        sx={INPUT_SX}
                    />
                )}
            />
        </FormControl>
    );
}

export default DataPlaneSelector;
