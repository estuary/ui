import type { StorageMappingFormData } from 'src/components/admin/Settings/StorageMappings/Dialog/schema';

import { Link, Stack, Typography } from '@mui/material';

import { useFieldArray, useFormContext } from 'react-hook-form';

import DataPlanesCard from 'src/components/admin/Settings/StorageMappings/Dialog/shared/DataPlanesCard';
import { ConnectionTests } from 'src/components/admin/Settings/StorageMappings/Dialog/Update/NewConnectionTests';
import { StorageLocationsCard } from 'src/components/admin/Settings/StorageMappings/Dialog/Update/StorageLocationsCard';
import CardWrapper from 'src/components/shared/CardWrapper';

export function UpdateForm() {
    const { watch, setValue } = useFormContext<StorageMappingFormData>();
    const { append, remove, move } = useFieldArray({
        name: 'data_planes',
    });
    const dataPlanes = watch('data_planes');
    const allowPublic = watch('allow_public');

    return (
        <>
            <Typography sx={{ mb: 4 }}>
                Update your data plane or collection storage configuration
                below. For information and access requirements, see the{' '}
                <Link
                    href="https://docs.estuary.dev/getting-started/installation/#configuring-your-cloud-storage-bucket-for-use-with-flow"
                    target="_blank"
                    rel="noopener noreferrer"
                >
                    documentation
                </Link>
                .
            </Typography>
            <Stack spacing={2}>
                <CardWrapper>
                    <DataPlanesCard
                        dataPlanes={dataPlanes}
                        defaultDataPlane={
                            dataPlanes.length > 0 ? dataPlanes[0] : null
                        }
                        allowPublicChecked={allowPublic}
                        onSelect={append}
                        onRemove={remove}
                        onSelectDefault={(index) => move(index, 0)}
                        onToggleAllowPublic={(value) =>
                            setValue('allow_public', value)
                        }
                    />
                </CardWrapper>
                <CardWrapper>
                    <StorageLocationsCard />
                </CardWrapper>
                <CardWrapper>
                    <ConnectionTests />
                </CardWrapper>
            </Stack>
        </>
    );
}
