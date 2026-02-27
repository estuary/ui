import { useState } from 'react';

import { Link, Stack, Typography } from '@mui/material';

import { ConnectionAccordion } from 'src/components/admin/Settings/StorageMappings/Dialog/shared/ConnectionAccordion';
import {
    getStoreId,
    useConnectionTest,
} from 'src/components/admin/Settings/StorageMappings/Dialog/shared/ConnectionTestContext';

const docsBaseUrl = 'https://docs.estuary.dev/getting-started/installation/#';

export function TestConnectionResult() {
    const { activeConnections, dataPlanes, stores } = useConnectionTest();
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
                {activeConnections.map((connection) => {
                    const dataPlane = dataPlanes.find(
                        (dp) =>
                            dp.dataPlaneName === connection.dataPlaneName
                    );
                    const store = stores.find(
                        (s) => getStoreId(s) === connection.storeId
                    );
                    if (!dataPlane || !store) return null;

                    const key = `${connection.dataPlaneName}-${connection.storeId}`;
                    return (
                        <ConnectionAccordion
                            key={key}
                            dataPlane={dataPlane}
                            store={store}
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
