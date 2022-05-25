import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import {
    Accordion,
    AccordionDetails,
    AccordionSummary,
    Box,
    Typography,
} from '@mui/material';
import Logs from 'components/Logs';
import ErrorBoundryWrapper from 'components/shared/ErrorBoundryWrapper';
import { FormattedMessage } from 'react-intl';

export interface ErrorLogsProps {
    logToken?: string | null;
    defaultOpen?: boolean;
}

function ErrorLogs({ logToken, defaultOpen }: ErrorLogsProps) {
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
                            height: 250,
                        }}
                    >
                        <ErrorBoundryWrapper>
                            <Logs token={logToken} />
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
