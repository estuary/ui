import { Button, Collapse, Stack, useTheme } from '@mui/material';
import Logs, { type LogProps } from 'components/logs';
import ErrorBoundryWrapper from 'components/shared/ErrorBoundryWrapper';
import { linkButtonSx } from 'context/Theme';
import { NavArrowDown } from 'iconoir-react';
import { useState } from 'react';
import { FormattedMessage } from 'react-intl';

export interface ErrorLogsProps {
    defaultOpen?: boolean;
    height?: number;
    logProps?: Omit<LogProps, 'token' | 'height'>;
    logToken?: string | null;
}

function ErrorLogs({
    logToken,
    defaultOpen,
    height,
    logProps,
}: ErrorLogsProps) {
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
                    <FormattedMessage
                        id={
                            showLogs
                                ? 'entityCreate.errors.collapseTitleOpen'
                                : 'entityCreate.errors.collapseTitle'
                        }
                    />
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
