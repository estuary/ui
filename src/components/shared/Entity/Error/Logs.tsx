import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import {
    Accordion,
    AccordionDetails,
    AccordionSummary,
    Box,
    Typography,
} from '@mui/material';
import Logs, { type LogProps } from 'components/Logs';
import ErrorBoundryWrapper from 'components/shared/ErrorBoundryWrapper';
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

    if (logToken) {
        return (
            <Accordion
                defaultExpanded={defaultOpen ?? false}
                TransitionProps={{ unmountOnExit: true }}
            >
                <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                    <Typography>
                        <FormattedMessage id="foo.errors.collapseTitle" />
                    </Typography>
                </AccordionSummary>
                <AccordionDetails>
                    <Box
                        sx={{
                            width: '100%',
                            height: heightVal,
                        }}
                    >
                        <ErrorBoundryWrapper>
                            <Logs
                                {...logProps}
                                token={logToken}
                                height={heightVal}
                            />
                        </ErrorBoundryWrapper>
                    </Box>
                </AccordionDetails>
            </Accordion>
        );
    } else {
        return null;
    }
}

export default ErrorLogs;
