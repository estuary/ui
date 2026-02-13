import { Link, Stack, Typography } from '@mui/material';

import DataPlanesCard from 'src/components/admin/Settings/StorageMappings/Dialog/shared/DataPlanesCard';
import { StorageLocationsCard } from 'src/components/admin/Settings/StorageMappings/Dialog/Update/StorageLocationsCard';

export function UpdateForm() {
    return (
        <>
            <Typography sx={{ mb: 4 }}>
                Configure a new storage mapping for your collection data. For
                more information and access requirements, see the documentation.
            </Typography>
            <Stack spacing={2}>
                <DataPlanesCard />
                <StorageLocationsCard />
            </Stack>
        </>
    );
}
