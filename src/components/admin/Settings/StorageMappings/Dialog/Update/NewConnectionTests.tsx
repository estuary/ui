import { useMemo, useRef, useState } from 'react';

import { Box, Collapse, Link, Stack, Typography } from '@mui/material';

import { CheckCircle } from 'iconoir-react';

import { ConnectionAccordion } from 'src/components/admin/Settings/StorageMappings/Dialog/shared/ConnectionAccordion';
import {
    getStoreId,
    useConnectionTest,
} from 'src/components/admin/Settings/StorageMappings/Dialog/shared/ConnectionTestContext';
import CardWrapper from 'src/components/shared/CardWrapper';
import { cardHeaderSx } from 'src/context/Theme';

export function NewConnectionTests() {
    const {
        activeConnections,
        isOriginalConnection,
        testConnections,
        dataPlanes: contextDataPlanes,
        stores: contextStores,
    } = useConnectionTest();

    const newActiveConnections = useMemo(
        () => activeConnections.filter((c) => !isOriginalConnection(c)),
        [activeConnections, isOriginalConnection]
    );

    const [expandedKey, setExpandedKey] = useState<string | null>(null);

    // Once the card has appeared, keep it on screen even if new connections are removed
    const hasAppeared = useRef(false);
    if (newActiveConnections.length > 0) {
        hasAppeared.current = true;
    }

    const isTesting = useMemo(
        () => newActiveConnections.some((c) => c.status === 'testing'),
        [newActiveConnections]
    );

    const allPassing = useMemo(
        () =>
            newActiveConnections.length > 0 &&
            newActiveConnections.every((c) => c.status === 'success'),
        [newActiveConnections]
    );

    return (
        <Collapse
            in={newActiveConnections.length > 0 || hasAppeared.current}
            timeout="auto"
            unmountOnExit
        >
            <CardWrapper disableMinWidth sx={{ overflow: 'hidden' }}>
                <Box
                    sx={{
                        ...cardHeaderSx,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                    }}
                >
                    <Typography sx={cardHeaderSx}>New Connections</Typography>
                    {newActiveConnections.length > 0 && (
                        <Link
                            component="button"
                            variant="body2"
                            underline="hover"
                            disabled={isTesting}
                            onClick={() =>
                                void testConnections(
                                    newActiveConnections
                                ).catch(() => {})
                            }
                            sx={{
                                opacity: isTesting ? 0.5 : 1,
                                pointerEvents: isTesting ? 'none' : 'auto',
                            }}
                        >
                            Run tests
                        </Link>
                    )}
                </Box>
                <Typography>
                    New connections must pass before saving changes.
                </Typography>
                {newActiveConnections.length === 0 ? (
                    <Typography
                        variant="body2"
                        color="text.secondary"
                        sx={{ mt: 0.5, alignSelf: 'center', fontSize: 12 }}
                    >
                        (Nothing here)
                    </Typography>
                ) : (
                    <Stack spacing={1} sx={{ mt: 1 }}>
                        <Collapse in={allPassing}>
                            <Box
                                sx={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: 1,
                                    border: 1,
                                    borderColor: 'success.main',
                                    borderRadius: 2,
                                    px: 1,
                                    py: 0.75,
                                    color: 'success.main',
                                }}
                            >
                                <CheckCircle width={20} height={20} />
                                <Typography variant="body2" fontWeight={600}>
                                    All new connections passing
                                </Typography>
                            </Box>
                        </Collapse>
                        {newActiveConnections
                            .filter(
                                (c) => !allPassing || c.status !== 'success'
                            )
                            .map((connection) => {
                                const dataPlane = contextDataPlanes.find(
                                    (dp) =>
                                        dp.dataPlaneName ===
                                        connection.dataPlaneName
                                );
                                const store = contextStores.find(
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
                                            setExpandedKey(
                                                isExpanded ? key : null
                                            )
                                        }
                                    />
                                );
                            })}
                    </Stack>
                )}
            </CardWrapper>
        </Collapse>
    );
}
