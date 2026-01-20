import { DialogContent, Link, Typography } from '@mui/material';

import { StorageMappingForm } from 'src/components/admin/Settings/StorageMappings/Dialog/Form';
import ErrorBoundryWrapper from 'src/components/shared/ErrorBoundryWrapper';

const docsUrl =
    'https://docs.estuary.dev/getting-started/installation/#configuring-your-cloud-storage-bucket-for-use-with-flow';

function StorageMappingContent() {
    return (
        <DialogContent>
            <Typography sx={{ mb: 4 }}>
                Configure a new storage mapping for your collection data. For
                more information and access requirements, see the{' '}
                <Link href={docsUrl} target="_blank" rel="noopener noreferrer">
                    documentation
                </Link>
                .
            </Typography>

            <ErrorBoundryWrapper>
                <StorageMappingForm />
            </ErrorBoundryWrapper>
        </DialogContent>
    );
}

export default StorageMappingContent;
