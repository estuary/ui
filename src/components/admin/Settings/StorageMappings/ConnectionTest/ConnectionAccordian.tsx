import type { StorageMappingConnection } from 'src/api/gql/storageMappings';

import { useCallback, useState } from 'react';

import {
    Accordion,
    AccordionDetails,
    AccordionSummary,
    Box,
    Button,
    Stack,
    Typography,
} from '@mui/material';

import { NavArrowDown, Refresh } from 'iconoir-react';

import { ConnectionInstructions } from 'src/components/admin/Settings/StorageMappings/ConnectionTest/ConnectionInstructions';
import { ConnectionStatusBadge } from 'src/components/admin/Settings/StorageMappings/ConnectionTest/ConnectionStatusBadge';

interface ConnectionAccordianProps {
    connection: StorageMappingConnection;
    expanded?: boolean;
    disabled?: boolean;
    onToggle?: (expanded: boolean) => void;
    onRetryClick?: () => Promise<void>;
}

export function ConnectionAccordian({
    connection,
    expanded = false,
    disabled = false,
    onToggle,
    onRetryClick,
}: ConnectionAccordianProps) {
    const [isRetrying, setIsRetrying] = useState(false);

    const handleChange = useCallback(
        (_: React.SyntheticEvent, expanded: boolean) => {
            onToggle?.(expanded);
        },
        [onToggle]
    );

    const handleRetryClick = useCallback(async () => {
        // // there's a risk of breaking other connections when updating the bucket policy for AWS,
        // // so we want to test all connections using the same bucket at once.
        // // For other providers, we can just test the single connection.
        // if (connection.store.provider === 'S3') {
        //     const { key } = connection.store;
        //     const sameBucket = connections.filter(
        //         (c) => c.key === key
        //     );
        //     for (const c of sameBucket) {
        //         testConnections([c]).catch(() => {});
        //     }
        // } else {
        //     testConnections([connection]).catch(
        //         () => {}
        //     );
        // }

        setIsRetrying(true);
        await onRetryClick?.();
        setIsRetrying(false);
    }, [onRetryClick]);

    return (
        <Accordion
            expanded={expanded}
            disabled={disabled}
            onChange={handleChange}
            disableGutters
            sx={{
                'border': 1,
                '&:first-of-type': { borderRadius: 2 },
                '&:last-of-type': { borderRadius: 2 },
                'borderColor': disabled
                    ? 'divider'
                    : connection.status === 'success'
                      ? 'success.main'
                      : connection.status === 'error'
                        ? 'warning.main'
                        : 'divider',
                'opacity': disabled ? 0.6 : 1,
                '&.Mui-disabled': {
                    bgcolor: 'background.paper',
                },
            }}
        >
            <AccordionSummary
                expandIcon={<NavArrowDown />}
                sx={{
                    'minHeight': 'unset',
                    'px': 1,
                    'py': 0.75,
                    '&.Mui-expanded': { minHeight: 'unset' },
                    '& .MuiAccordionSummary-content': {
                        'gap': 2,
                        'my': 0,
                        '&.Mui-expanded': { my: 0 },
                    },
                }}
            >
                <Stack
                    component="span"
                    direction="row"
                    alignItems="center"
                    justifyContent="space-between"
                    sx={{
                        width: '100%',
                        pr: 1,
                        m: 0,
                        overflow: 'hidden',
                    }}
                >
                    <Typography
                        component="span"
                        fontWeight={600}
                        noWrap
                        sx={{ minWidth: 0 }}
                    >
                        {connection.dataPlane.displayName} &rarr;{' '}
                        {connection.fragmentStore.key}
                    </Typography>
                    <ConnectionStatusBadge status={connection.status} />
                </Stack>
            </AccordionSummary>
            <AccordionDetails sx={{ pt: 0.5 }}>
                <Stack spacing={1}>
                    <Stack
                        direction="row"
                        gap={1}
                        justifyContent="space-between"
                        alignItems="flex-start"
                    >
                        <Box sx={{ flex: 1, minWidth: 0 }}>
                            {connection.error ? (
                                <Typography
                                    variant="body2"
                                    sx={{
                                        color: 'warning.main',
                                        overflowWrap: 'anywhere',
                                    }}
                                >
                                    {connection.error}
                                </Typography>
                            ) : null}
                        </Box>
                        <Button
                            variant="text"
                            size="small"
                            disabled={isRetrying}
                            sx={{ flexShrink: 0 }}
                            onClick={handleRetryClick}
                            startIcon={<Refresh width={16} height={16} />}
                        >
                            Retry
                        </Button>
                    </Stack>
                    <ConnectionInstructions connection={connection} />
                </Stack>
            </AccordionDetails>
        </Accordion>
    );
}
