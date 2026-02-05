import { Link, Stack, Typography } from '@mui/material';

import { PrefixCard } from './PrefixCard';

import { DataPlanesCard } from 'src/components/admin/Settings/StorageMappings/Dialog/DataPlanesCard';
import { StorageCard } from 'src/components/admin/Settings/StorageMappings/Dialog/StorageCard';

const docsUrl =
    'https://docs.estuary.dev/getting-started/installation/#configuring-your-cloud-storage-bucket-for-use-with-flow';

export function StorageMappingForm() {
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
                <PrefixCard />
                <DataPlanesCard />
                <StorageCard />
            </Stack>
        </>
    );
}
