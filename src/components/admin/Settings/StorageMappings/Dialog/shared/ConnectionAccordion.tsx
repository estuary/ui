import type { Connection } from 'src/components/admin/Settings/StorageMappings/Dialog/shared/ConnectionTestContext';

import { useEffect, useRef } from 'react';

import {
    Accordion,
    AccordionDetails,
    AccordionSummary,
    Box,
    Button,
    CircularProgress,
    Stack,
    Typography,
} from '@mui/material';

import {
    CheckCircle,
    NavArrowDown,
    Refresh,
    WarningTriangle,
} from 'iconoir-react';
import { useIntl } from 'react-intl';

import { ConnectionInstructions } from 'src/components/admin/Settings/StorageMappings/Dialog/shared/ConnectionInstructions';
import {
    getStoreId,
    useConnectionTest,
} from 'src/components/admin/Settings/StorageMappings/Dialog/shared/ConnectionTestContext';
import { toPresentableName } from 'src/utils/dataPlane-utils';

interface ConnectionStatusBadgeProps {
    result: Connection;
    compact?: boolean;
}

function ConnectionStatusBadge({ result }: ConnectionStatusBadgeProps) {
    const badges = {
        idle: null,
        testing: {
            icon: <CircularProgress size={20} color="inherit" />,
            color: 'text.secondary',
        },
        success: {
            icon: <CheckCircle width={20} height={20} />,
            color: 'success.main',
        },
        error: {
            icon: <WarningTriangle width={20} height={20} />,
            color: 'warning.main',
        },
    } satisfies Record<
        Connection['status'],
        { icon: React.ReactNode; color: string } | null
    >;

    const badge = badges[result.status];

    if (!badge) return null;

    return (
        <Stack
            direction="row"
            spacing={1}
            alignItems="center"
            sx={{ color: badge.color }}
        >
            {badge.icon}
        </Stack>
    );
}

interface ConnectionAccordionProps {
    connection: Connection;
    expanded: boolean;
    onToggle: (expanded: boolean) => void;
    disabled?: boolean;
}

export function ConnectionAccordion({
    connection,
    expanded,
    onToggle,
    disabled = false,
}: ConnectionAccordionProps) {
    const { connections, testConnections, isTesting } = useConnectionTest();
    const intl = useIntl();

    const prevStatusRef = useRef(connection.status);
    const onToggleRef = useRef(onToggle);
    onToggleRef.current = onToggle;

    useEffect(() => {
        // Collapse only when this expanded accordion transitions from testing to success
        if (
            expanded &&
            prevStatusRef.current === 'testing' &&
            connection.status === 'success'
        ) {
            onToggleRef.current(false);
        }

        prevStatusRef.current = connection.status;
    }, [expanded, connection.status, connection.errorMessage]);

    return (
        <Accordion
            expanded={disabled ? false : expanded}
            onChange={(_event, isExpanded) => {
                if (!disabled) onToggle(isExpanded);
            }}
            disabled={disabled}
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
                    <Typography fontWeight={600} noWrap sx={{ minWidth: 0 }}>
                        {toPresentableName(connection.dataPlane)} &rarr;{' '}
                        {getStoreId(connection.store)}
                    </Typography>
                    <ConnectionStatusBadge result={connection} />
                </Stack>
            </AccordionSummary>
            <AccordionDetails sx={{ pt: 0.5 }}>
                <Stack spacing={1}>
                    <Stack
                        direction="row"
                        justifyContent="space-between"
                        alignItems="center"
                    >
                        <Box>
                            {connection.errorMessage ? (
                                <Typography
                                    variant="body2"
                                    sx={{ color: 'warning.main' }}
                                >
                                    {connection.errorMessage}
                                </Typography>
                            ) : null}
                        </Box>
                        <Button
                            variant="text"
                            size="small"
                            disabled={isTesting}
                            onClick={() => {
                                // there's a risk of breaking other connections when updating the bucket policy for AWS,
                                // so we want to test all connections using the same bucket at once.
                                // For other providers, we can just test the single connection.
                                if (connection.store.provider === 'AWS') {
                                    const storeId = getStoreId(
                                        connection.store
                                    );
                                    const sameBucket = connections.filter(
                                        (c) =>
                                            !c.orphaned &&
                                            getStoreId(c.store) === storeId
                                    );
                                    testConnections(sameBucket).catch(() => {});
                                } else {
                                    testConnections([connection]).catch(
                                        () => {}
                                    );
                                }
                            }}
                            startIcon={<Refresh width={16} height={16} />}
                        >
                            {intl.formatMessage({
                                id: 'storageMappings.dialog.connectionTests.retry',
                            })}
                        </Button>
                    </Stack>
                    <ConnectionInstructions connection={connection} />
                </Stack>
            </AccordionDetails>
        </Accordion>
    );
}
