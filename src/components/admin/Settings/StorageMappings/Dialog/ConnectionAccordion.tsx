import { useEffect, useRef, useState } from 'react';

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

import { ConnectionInstructions } from './ConnectionInstructions';
import {
    CheckCircle,
    NavArrowDown,
    Refresh,
    WarningTriangle,
} from 'iconoir-react';

import { DataPlaneNode } from 'src/api/dataPlanesGql';
import { FragmentStore } from 'src/api/storageMappingsGql';
import {
    ConnectionTestResult,
    useConnectionTest,
} from 'src/components/admin/Settings/StorageMappings/Dialog/ConnectionTestContext';
import { toPresentableName } from 'src/utils/dataPlane-utils';

interface ConnectionStatusBadgeProps {
    result: ConnectionTestResult;
    compact?: boolean;
}

function ConnectionStatusBadge({
    result,
    compact = false,
}: ConnectionStatusBadgeProps) {
    if (result.status === 'idle') {
        return null;
    }

    if (result.status === 'testing') {
        return (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <CircularProgress size={compact ? 16 : 20} color="inherit" />
            </Box>
        );
    }

    if (result.status === 'success') {
        return (
            <Box
                sx={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1,
                    color: 'success.main',
                }}
            >
                <Typography variant="body2">Ready</Typography>
                <CheckCircle
                    width={compact ? 16 : 20}
                    height={compact ? 16 : 20}
                />
            </Box>
        );
    }

    if (result.status === 'error') {
        return (
            <Box
                sx={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1,
                    color: 'warning.main',
                }}
            >
                <Typography variant="body2">Needs Attention</Typography>
                <WarningTriangle
                    width={compact ? 16 : 20}
                    height={compact ? 16 : 20}
                />
            </Box>
        );
    }

    return null;
}

interface ConnectionErrorProps {
    result: ConnectionTestResult;
    errorMessage?: string;
    onRetry: () => void;
}

function ConnectionError({
    result,
    errorMessage,
    onRetry,
}: ConnectionErrorProps) {
    const message = errorMessage || result.errorMessage || 'Connection failed';
    const isRetrying = result.status === 'testing';

    return (
        <Box
            sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 1,
                color: 'warning.main',
            }}
        >
            <Typography variant="body2" sx={{ flex: 1 }}>
                {message}
            </Typography>
            <Button
                variant="text"
                size="small"
                disabled={isRetrying}
                onClick={(e) => {
                    e.stopPropagation();
                    onRetry();
                }}
                startIcon={
                    !isRetrying ? <Refresh width={16} height={16} /> : null
                }
                sx={{ ml: 1 }}
            >
                {isRetrying ? 'Retrying...' : 'Retry'}
            </Button>
        </Box>
    );
}

interface ConnectionAccordionProps {
    dataPlane: DataPlaneNode;
    store: FragmentStore;
    expanded: boolean;
    onToggle: (expanded: boolean) => void;
}

export function ConnectionAccordion({
    dataPlane,
    store,
    expanded,
    onToggle,
}: ConnectionAccordionProps) {
    const { retry, resultFor } = useConnectionTest();
    const testResult = resultFor(dataPlane, store);

    const handleRetry = async () => {
        console.log('Retrying connection for', dataPlane, store);
        try {
            await retry(dataPlane, store);
        } finally {
        }
    };

    const [lastErrorMessage, setLastErrorMessage] = useState<string>();
    const prevStatusRef = useRef(testResult.status);
    const onToggleRef = useRef(onToggle);
    onToggleRef.current = onToggle;

    // Track error messages and auto-collapse on success
    useEffect(() => {
        // Capture error message when it occurs
        if (testResult.status === 'error' && testResult.errorMessage) {
            setLastErrorMessage(testResult.errorMessage);
        }

        // Collapse when status changes to success
        if (
            prevStatusRef.current !== 'success' &&
            testResult.status === 'success'
        ) {
            onToggleRef.current(false);
        }

        prevStatusRef.current = testResult.status;
    }, [testResult.status, testResult.errorMessage]);

    return (
        <Accordion
            expanded={expanded}
            onChange={(_event, isExpanded) => onToggle(isExpanded)}
            disableGutters
            sx={{
                '&:before': { display: 'none' },
                'border': 1,
                'borderColor':
                    testResult.status === 'success'
                        ? 'success.main'
                        : testResult.status === 'error'
                          ? 'warning.main'
                          : 'divider',
                'borderRadius': 2,
                '&:first-of-type': { borderRadius: 2 },
                '&:last-of-type': { borderRadius: 2 },
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
                        {toPresentableName(dataPlane)} &rarr; {store.bucket}
                        {store.prefix ? `/${store.prefix}` : ''}{' '}
                        <Typography
                            component="span"
                            variant="body2"
                        >
                            ({store.provider})
                        </Typography>
                    </Typography>
                    <ConnectionStatusBadge result={testResult} compact />
                </Box>
            </AccordionSummary>
            <AccordionDetails>
                <Stack spacing={2}>
                    {testResult.status === 'error' ||
                    (testResult.status === 'testing' && lastErrorMessage) ? (
                        <ConnectionError
                            result={testResult}
                            errorMessage={lastErrorMessage}
                            onRetry={handleRetry}
                        />
                    ) : null}
                    <ConnectionInstructions
                        provider={store.provider}
                        bucket={store.bucket}
                        iamArn={dataPlane.awsIamUserArn ?? ''}
                        gcpServiceAccountEmail={
                            dataPlane.gcpServiceAccountEmail ?? ''
                        }
                    />
                </Stack>
            </AccordionDetails>
        </Accordion>
    );
}
