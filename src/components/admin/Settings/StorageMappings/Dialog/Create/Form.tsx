import { Link, Stack, Typography } from '@mui/material';

import { StorageFields } from '../shared/StorageFields';

import { PrefixCard } from 'src/components/admin/Settings/StorageMappings/Dialog/Create/PrefixCard';
import DataPlanesCard from 'src/components/admin/Settings/StorageMappings/Dialog/shared/DataPlanesCard';
import CardWrapper from 'src/components/shared/CardWrapper';
import { cardHeaderSx } from 'src/context/Theme';

const docsUrl =
    'https://docs.estuary.dev/getting-started/installation/#configuring-your-cloud-storage-bucket-for-use-with-flow';

export function StorageMappingForm() {
    return (
        <>
            <Typography sx={{ mb: 4 }}>
                Configure a new storage mapping for your collection data. For
                information and access requirements, see the{' '}
                <Link href={docsUrl} target="_blank" rel="noopener noreferrer">
                    documentation
                </Link>
                .
            </Typography>
            <Stack spacing={2}>
                <PrefixCard />
                <DataPlanesCard />

                <CardWrapper>
                    <Typography sx={cardHeaderSx}>Storage Locations</Typography>
                    <StorageFields index={0} />
                </CardWrapper>
            </Stack>
        </>
    );
}
