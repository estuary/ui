import { Collapse, Divider, IconButton, Paper, useTheme } from '@mui/material';
import { NavArrowDown } from 'iconoir-react';
import { useState } from 'react';
import { ErrorBoundary } from 'react-error-boundary';
import { FormattedMessage, useIntl } from 'react-intl';
import { logRocketEvent } from 'services/shared';
import { CustomEvents } from 'services/types';
import type { BaseComponentProps } from 'types';
import AlertBox from './AlertBox';

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
            title={<FormattedMessage id="errorBoundry.title" />}
        >
            <FormattedMessage id="errorBoundry.message1" />
            <FormattedMessage id="errorBoundry.message2" />
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
