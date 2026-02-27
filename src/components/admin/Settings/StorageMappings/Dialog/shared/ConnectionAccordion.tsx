import type { DataPlaneNode } from 'src/api/dataPlanesGql';
import type { FragmentStore } from 'src/api/storageMappingsGql';
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
            text: null,
            icon: <CircularProgress size={16} color="inherit" />,
            color: 'text.secondary',
        },
        success: {
            text: 'Ready',
            icon: <CheckCircle width={16} height={16} />,
            color: 'success.main',
        },
        error: {
            text: 'Needs Attention',
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
            alignItems={'center'}
            sx={{ color: badge.color }}
        >
            {badge.text && (
                <Typography variant="body2">{badge.text}</Typography>
            )}
            {badge.icon}
        </Stack>
    );
}

interface ConnectionAccordionProps {
    dataPlane: DataPlaneNode;
    store: FragmentStore;
    expanded: boolean;
    onToggle: (expanded: boolean) => void;
    disabled?: boolean;
}

export function ConnectionAccordion({
    dataPlane,
    store,
    expanded,
    onToggle,
    disabled = false,
}: ConnectionAccordionProps) {
    const { testOne, connectionFor } = useConnectionTest();
    const testResult = connectionFor(dataPlane, store);

    const prevStatusRef = useRef(testResult.status);
    const onToggleRef = useRef(onToggle);
    onToggleRef.current = onToggle;

    useEffect(() => {
        // Collapse only when transitioning from testing to success
        if (
            prevStatusRef.current === 'testing' &&
            testResult.status === 'success'
        ) {
            onToggleRef.current(false);
        }

        prevStatusRef.current = testResult.status;
    }, [testResult.status, testResult.errorMessage]);

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
                    : testResult.status === 'success'
                      ? 'success.main'
                      : testResult.status === 'error'
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
                <Box
                    sx={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        width: '100%',
                        pr: 1,
                        m: 0,
                        overflow: 'hidden',
                    }}
                >
                    <Typography fontWeight={600} noWrap sx={{ minWidth: 0 }}>
                        {toPresentableName(dataPlane)} &rarr;{' '}
                        {getStoreId(store)}
                    </Typography>
                    <ConnectionStatusBadge result={testResult} />
                </Box>
            </AccordionSummary>
            <AccordionDetails sx={{ pt: 0.5 }}>
                <Stack spacing={1}>
                    <Box
                        sx={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                        }}
                    >
                        <Box>
                            {testResult.errorMessage ? (
                                <Typography
                                    variant="body2"
                                    sx={{ color: 'warning.main' }}
                                >
                                    {testResult.errorMessage}
                                </Typography>
                            ) : null}
                        </Box>
                        <Button
                            variant="text"
                            size="small"
                            disabled={testResult.status === 'testing'}
                            onClick={() => testOne(dataPlane, store)}
                            startIcon={<Refresh width={16} height={16} />}
                        >
                            Retry
                        </Button>
                    </Box>
                    <ConnectionInstructions
                        provider={store.provider}
                        bucket={getStoreId(store)}
                        iamArn={dataPlane.awsIamUserArn ?? ''}
                        gcpServiceAccountEmail={
                            dataPlane.gcpServiceAccountEmail ?? ''
                        }
                        storageAccountName={store.storage_account_name ?? ''}
                        azureApplicationClientId={
                            dataPlane.azureApplicationClientId ?? ''
                        }
                        azureApplicationName={
                            dataPlane.azureApplicationName ?? ''
                        }
                    />
                </Stack>
            </AccordionDetails>
        </Accordion>
    );
}
