import type { StorageMappingFormData } from 'src/components/admin/Settings/StorageMappings/Dialog/schema';

import { Link, Stack, TextField, Typography } from '@mui/material';

import { useFormContext } from 'react-hook-form';

import { DataPlanesCard } from 'src/components/admin/Settings/StorageMappings/Dialog/DataPlanesCard';
import { StorageCard } from 'src/components/admin/Settings/StorageMappings/Dialog/StorageCard';
import CardWrapper from 'src/components/shared/CardWrapper';

const docsUrl =
    'https://docs.estuary.dev/getting-started/installation/#configuring-your-cloud-storage-bucket-for-use-with-flow';

export function StorageMappingForm() {
    const {
        register,
        formState: { errors },
    } = useFormContext<StorageMappingFormData>();

    return (
        <>
            <Typography sx={{ mb: 4 }}>
                Configure a new storage mapping for your collection data. For
                more information and access requirements, see the{' '}
                <Link href={docsUrl} target="_blank" rel="noopener noreferrer">
                    documentation
                </Link>
                .
            </Typography>
            <Stack spacing={2}>
                <CardWrapper>
                    <TextField
                        {...register('catalog_prefix', {
                            required: 'Estuary prefix is required',
                        })}
                        label="Estuary Prefix"
                        required
                        error={!!errors.catalog_prefix}
                        helperText={errors.catalog_prefix?.message}
                        fullWidth
                        size="small"
                    />
                </CardWrapper>
                <DataPlanesCard />
                <StorageCard />
            </Stack>
        </>
    );
}
