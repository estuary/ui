import { Link, Stack, Typography } from '@mui/material';

import DataPlanesCard from 'src/components/admin/Settings/StorageMappings/Dialog/shared/DataPlanesCard';
import { StorageLocationsCard } from 'src/components/admin/Settings/StorageMappings/Dialog/Update/StorageLocationsCard';

export function UpdateForm() {
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
                <DataPlanesCard />
                <StorageLocationsCard />
            </Stack>
        </>
    );
}
