import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { Button, Collapse, Stack } from '@mui/material';
import Logs, { type LogProps } from 'components/logs';
import ErrorBoundryWrapper from 'components/shared/ErrorBoundryWrapper';
import { LINK_BUTTON_STYLING } from 'context/Theme';
import { useState } from 'react';
import { FormattedMessage } from 'react-intl';

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
                    sx={{ ...LINK_BUTTON_STYLING, width: 'max-content' }}
                    onClick={toggleLogs}
                    endIcon={
                        <ExpandMoreIcon
                            sx={{
                                transform: `rotate(${
                                    showLogs ? '180' : '0'
                                }deg)`,
                                transition: (theme) =>
                                    `${theme.transitions.duration.shortest}ms`,
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
