import type { BaseComponentProps } from 'src/types';

import { useState } from 'react';

import {
    Collapse,
    Divider,
    IconButton,
    Paper,
    Typography,
    useTheme,
} from '@mui/material';

import { NavArrowDown } from 'iconoir-react';
import { ErrorBoundary } from 'react-error-boundary';
import { useIntl } from 'react-intl';

import AlertBox from 'src/components/shared/AlertBox';
import { logRocketEvent } from 'src/services/shared';
import { CustomEvents } from 'src/services/types';

const logErrorToLogRocket = (error: Error) => {
    // Let LogRocket know this was rendered since there is almost never
    //  a time where it is good that this was shown to a user.
    logRocketEvent(CustomEvents.ERROR_BOUNDARY_DISPLAYED, {
        name: error.name,
        stack: error.stack ?? 'No stack trace available',
    });
};

function ErrorFallback({ error }: { error: Error }): JSX.Element {
    const intl = useIntl();
    const theme = useTheme();

    const [expanded, setExpanded] = useState(false);

    const handleExpandClick = () => {
        setExpanded(!expanded);
    };

    return (
        <AlertBox
            short
            severity="error"
            title={intl.formatMessage({ id: 'errorBoundry.title' })}
        >
            <Typography>
                {intl.formatMessage({ id: 'errorBoundry.message1' })}
            </Typography>
            <Typography>
                {intl.formatMessage({ id: 'errorBoundry.message2' })}
            </Typography>

            <Divider />

            <IconButton
                onClick={handleExpandClick}
                aria-expanded={expanded}
                aria-label={intl.formatMessage({
                    id: expanded ? 'aria.closeExpand' : 'aria.openExpand',
                })}
                // TODO (show more): The concept of "show more/show less" buttons are duplicated and this specific styling is for sure
                sx={{
                    marginRight: 0,
                    transform: `rotate(${expanded ? '180' : '0'}deg)`,
                    transition: 'all 250ms ease-in-out',
                }}
            >
                <NavArrowDown
                    style={{
                        fontSize: 14,
                        color: theme.palette.text.primary,
                    }}
                />
            </IconButton>

            <Collapse in={expanded} timeout="auto" unmountOnExit>
                <Paper variant="outlined" square>
                    {error.stack}
                </Paper>
            </Collapse>
            <Divider />
        </AlertBox>
    );
}

const ErrorBoundryWrapper = ({ children }: BaseComponentProps) => {
    return (
        <ErrorBoundary
            FallbackComponent={ErrorFallback}
            onError={logErrorToLogRocket}
        >
            {children}
        </ErrorBoundary>
    );
};

export default ErrorBoundryWrapper;
