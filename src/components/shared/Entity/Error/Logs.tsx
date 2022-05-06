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

export interface ErrorLogsProps {
    logToken?: string | null;
}

function ErrorLogs({ logToken }: ErrorLogsProps) {
    if (logToken) {
        return (
            <Accordion
                defaultExpanded={false}
                TransitionProps={{ unmountOnExit: true }}
            >
                <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                    <Typography>Expand to see build logs</Typography>
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
