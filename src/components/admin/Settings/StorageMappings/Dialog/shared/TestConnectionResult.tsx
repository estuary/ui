import { Link, Stack, Typography } from '@mui/material';

import { ConnectionList } from 'src/components/admin/Settings/StorageMappings/Dialog/shared/ConnectionList';

const docsBaseUrl = 'https://docs.estuary.dev/getting-started/installation/#';

export function TestConnectionResult() {
    return (
        <Stack spacing={3}>
            <Typography>
                Each data plane that processes your data needs its own access to
                your storage bucket. For more details, see the{' '}
                <Link
                    href={docsBaseUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                >
                    documentation
                </Link>
            </Typography>

            <ConnectionList />
        </Stack>
    );
}
