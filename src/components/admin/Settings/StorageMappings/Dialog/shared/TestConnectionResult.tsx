import { useState } from 'react';

import { Link, Stack, Typography } from '@mui/material';

import { ConnectionAccordion } from 'src/components/admin/Settings/StorageMappings/Dialog/shared/ConnectionAccordion';
import {
    getStoreId,
    useConnectionTest,
} from 'src/components/admin/Settings/StorageMappings/Dialog/shared/ConnectionTestContext';

const docsBaseUrl = 'https://docs.estuary.dev/getting-started/installation/#';

export function TestConnectionResult() {
    const { connections } = useConnectionTest();
    const [expandedKey, setExpandedKey] = useState<string | null>(null);

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

            <Stack spacing={1}>
                {connections.map((connection) => {
                    const key = `${connection.dataPlane.dataPlaneName}-${getStoreId(connection.store)}`;
                    return (
                        <ConnectionAccordion
                            key={key}
                            connection={connection}
                            expanded={expandedKey === key}
                            onToggle={(isExpanded) =>
                                setExpandedKey(isExpanded ? key : null)
                            }
                        />
                    );
                })}
            </Stack>
        </Stack>
    );
}
