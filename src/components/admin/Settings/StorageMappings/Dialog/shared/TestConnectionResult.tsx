import { useState } from 'react';

import { Link, Stack, Typography } from '@mui/material';

import { ConnectionAccordion } from 'src/components/admin/Settings/StorageMappings/Dialog/ConnectionAccordion';
import { useConnectionTest } from 'src/components/admin/Settings/StorageMappings/Dialog/ConnectionTestContext';
import { CloudProvider } from 'src/components/admin/Settings/StorageMappings/Dialog/schema';

const docsBaseUrl = 'https://docs.estuary.dev/getting-started/installation/#';

export function TestConnectionResult() {
    const { results } = useConnectionTest();
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
                {Array.from(results).map(([[dataPlane, store]]) => {
                    const provider = store.provider as CloudProvider;
                    const key = `${dataPlane.dataPlaneName}-${store.bucket}`;
                    return (
                        <ConnectionAccordion
                            key={key}
                            dataPlane={dataPlane}
                            store={{
                                bucket: store.bucket,
                                provider,
                            }}
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
