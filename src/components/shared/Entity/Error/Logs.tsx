import type { LogProps } from 'src/components/logs';

import { useState } from 'react';

import { Button, Collapse, Stack, useTheme } from '@mui/material';

import { NavArrowDown } from 'iconoir-react';
import { useIntl } from 'react-intl';

import Logs from 'src/components/logs';
import ErrorBoundryWrapper from 'src/components/shared/ErrorBoundryWrapper';
import { linkButtonSx } from 'src/context/Theme';

export interface ErrorLogsProps {
    logToken?: string | null;
    defaultOpen?: boolean;
    height?: number;
    logProps?: Omit<LogProps, 'token' | 'height'>;
}

function ErrorLogs({
    logToken,
    defaultOpen,
    height,
    logProps,
}: ErrorLogsProps) {
    const intl = useIntl();

    const theme = useTheme();

    const heightVal = height ?? 250;
    const [showLogs, setShowLogs] = useState(defaultOpen ?? false);

    const toggleLogs = () => {
        setShowLogs(!showLogs);
    };

    if (logToken) {
        return (
            <Stack spacing={2}>
                <Button
                    variant="text"
                    sx={{ ...linkButtonSx, width: 'max-content' }}
                    onClick={toggleLogs}
                    endIcon={
                        <NavArrowDown
                            style={{
                                fontSize: 14,
                                color: theme.palette.primary.main,
                                transform: `rotate(${
                                    showLogs ? '180' : '0'
                                }deg)`,
                                transition: `${theme.transitions.duration.shortest}ms`,
                            }}
                        />
                    }
                >
                    {intl.formatMessage({
                        id: showLogs
                            ? 'entityCreate.errors.collapseTitleOpen'
                            : 'entityCreate.errors.collapseTitle',
                    })}
                </Button>
                <Collapse in={showLogs} unmountOnExit>
                    <ErrorBoundryWrapper>
                        <Logs
                            {...logProps}
                            token={logToken}
                            height={heightVal}
                        />
                    </ErrorBoundryWrapper>
                </Collapse>
            </Stack>
        );
    } else {
        return null;
    }
}

export default ErrorLogs;
