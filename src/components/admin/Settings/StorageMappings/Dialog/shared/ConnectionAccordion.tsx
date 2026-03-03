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
    const intl = useIntl();

    const badges = {
        idle: null,
        testing: {
            text: null,
            icon: <CircularProgress size={16} color="inherit" />,
            color: 'text.secondary',
        },
        success: {
            text: intl.formatMessage({
                id: 'storageMappings.dialog.connectionTests.status.ready',
            }),
            icon: <CheckCircle width={16} height={16} />,
            color: 'success.main',
        },
        error: {
            text: intl.formatMessage({
                id: 'storageMappings.dialog.connectionTests.status.needsAttention',
            }),
            icon: <WarningTriangle width={16} height={16} />,
            color: 'warning.main',
        },
    } satisfies Record<
        Connection['status'],
        { text: string | null; icon: React.ReactNode; color: string } | null
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
            {badge.text ? (
                <Typography variant="body2">{badge.text}</Typography>
            ) : null}
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
                                const storeId = getStoreId(connection.store);
                                const sameBucket = connections.filter(
                                    (c) =>
                                        !c.orphaned &&
                                        getStoreId(c.store) === storeId
                                );
                                testConnections(sameBucket).catch(() => {});
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
