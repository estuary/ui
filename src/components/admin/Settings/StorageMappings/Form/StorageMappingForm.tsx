import type { DataPlaneNode } from 'src/api/gql/dataPlanes';
import type { StorageMappingDataPlane } from 'src/api/gql/storageMappings';
import type { StorageMappingFormData } from 'src/components/admin/Settings/StorageMappings/Dialog/types';

import { useCallback, useState } from 'react';

import { Stack, Typography } from '@mui/material';

import { useFieldArray, useFormContext } from 'react-hook-form';

import { ConnectionTestsCard } from 'src/components/admin/Settings/StorageMappings/ConnectionTest/ConnectionTestsCard';
import { DataPlanesCard } from 'src/components/admin/Settings/StorageMappings/Dialog/DataPlanesCard';
import { StorageFields } from 'src/components/admin/Settings/StorageMappings/Dialog/StorageFields';
import { StorageLocationsCard } from 'src/components/admin/Settings/StorageMappings/Form/StorageMappingFormLocationsCard';
import { StorageMappingFormPrefixCard } from 'src/components/admin/Settings/StorageMappings/Form/StorageMappingFormPrefixCard';
import CardWrapper from 'src/components/shared/CardWrapper';
import ExternalLink from 'src/components/shared/ExternalLink';
import { cardHeaderSx } from 'src/context/Theme';
import { toStoreProvider } from 'src/hooks/storageMappings/utils';
import { toPresentableName } from 'src/utils/dataPlane-utils';

const DOC_LINK =
    'https://docs.estuary.dev/getting-started/installation/#configuring-your-cloud-storage-bucket-for-use-with-flow';

export interface StorageMappingFormProps {
    mode: 'create' | 'update';
}

export function StorageMappingForm({ mode }: StorageMappingFormProps) {
    return <StorageMappingFormInner mode={mode} />;
}

function StorageMappingFormInner({ mode }: StorageMappingFormProps) {
    const { watch } = useFormContext<StorageMappingFormData>();

    const {
        append: appendDataPlane,
        remove: removeDataPlane,
        move: moveDataPlane,
    } = useFieldArray<StorageMappingFormData, 'dataPlanes'>({
        name: 'dataPlanes',
        rules: {
            required: 'At least one data plane is required',
        },
    });

    const [allowPublic, setAllowPublic] = useState(false);
    const [nestedStoreFormOpen, setNestedStoreFormOpen] = useState(false);

    const dataPlanes = watch('dataPlanes');
    const dataPlaneNames = dataPlanes.map((dp) => dp.name);
    const defaultDataPlane = dataPlanes.length > 0 ? dataPlanes[0] : null;
    const defaultStoreProvider = defaultDataPlane?.storeProvider;
    const defaultRegion =
        defaultDataPlane?.cloudProvider === 'AWS'
            ? defaultDataPlane.region
            : undefined;

    const handleDataPlaneAdded = useCallback(
        (dp: DataPlaneNode) => {
            const dataPlane = toStorageMappingDataPlane(dp);
            appendDataPlane(dataPlane);
        },
        [appendDataPlane]
    );

    const handleDataPlaneRemoved = useCallback(
        (index: number) => {
            removeDataPlane(index);
        },
        [removeDataPlane]
    );

    const handleDefaultDataPlaneChanged = useCallback(
        (index: number) => {
            moveDataPlane(index, 0);
        },
        [moveDataPlane]
    );

    return (
        <Stack spacing={2}>
            {mode === 'create' ? (
                <Typography sx={{ mb: 4 }}>
                    Add a new storage location for your collection data. For
                    information and access requirements, see the&nbsp;
                    <ExternalLink link={DOC_LINK}>documentation</ExternalLink>.
                </Typography>
            ) : null}

            {mode === 'update' ? (
                <Typography sx={{ mb: 4 }}>
                    Update your data plane or collection storage configuration
                    below. For information and access requirements, see
                    the&nbsp;
                    <ExternalLink link={DOC_LINK}>documentation</ExternalLink>.
                </Typography>
            ) : null}

            <Stack spacing={2}>
                {mode === 'create' ? (
                    <CardWrapper>
                        <StorageMappingFormPrefixCard />
                    </CardWrapper>
                ) : null}

                <CardWrapper>
                    <DataPlanesCard
                        selectedNames={dataPlaneNames}
                        defaultName={defaultDataPlane?.name}
                        allowPublicChecked={allowPublic}
                        onSelect={handleDataPlaneAdded}
                        onRemove={handleDataPlaneRemoved}
                        onSelectDefault={handleDefaultDataPlaneChanged}
                        onToggleAllowPublic={setAllowPublic}
                    />
                </CardWrapper>

                {mode === 'create' ? (
                    <CardWrapper>
                        <Typography sx={cardHeaderSx}>
                            Storage Locations
                        </Typography>
                        <StorageFields
                            defaultProvider={defaultStoreProvider}
                            defaultRegion={defaultRegion}
                        />
                    </CardWrapper>
                ) : null}

                {mode === 'update' ? (
                    <CardWrapper>
                        <StorageLocationsCard
                            formOpen={nestedStoreFormOpen}
                            setFormOpen={setNestedStoreFormOpen}
                        />
                    </CardWrapper>
                ) : null}

                {mode === 'update' ? <ConnectionTestsCard /> : null}
            </Stack>
        </Stack>
    );
}

function toStorageMappingDataPlane(dp: DataPlaneNode): StorageMappingDataPlane {
    return {
        ...dp,
        displayName: toPresentableName(dp),
        storeProvider: toStoreProvider(dp.cloudProvider),
    };
}
