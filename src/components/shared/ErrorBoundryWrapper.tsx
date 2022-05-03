import { ExpandMore } from '@mui/icons-material';
import {
    Alert,
    AlertTitle,
    Collapse,
    Divider,
    IconButton,
    Paper,
} from '@mui/material';
import React, { ReactNode } from 'react';
import { ErrorBoundary } from 'react-error-boundary';
import { FormattedMessage, useIntl } from 'react-intl';

interface Props {
    children: ReactNode;
}

function ErrorFallback({ error }: { error: Error }): JSX.Element {
    const intl = useIntl();

    const [expanded, setExpanded] = React.useState(false);

    const handleExpandClick = () => {
        setExpanded(!expanded);
    };

    return (
        <Alert severity="error">
            <AlertTitle>
                <FormattedMessage id="errorBoundry.title" />
            </AlertTitle>
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
                <ExpandMore />
            </IconButton>
            <Collapse in={expanded} timeout="auto" unmountOnExit>
                <Paper variant="outlined" square>
                    {error.stack}
                </Paper>
            </Collapse>
        </Alert>
    );
}

const ErrorBoundryWrapper = ({ children }: Props) => {
    return (
        <ErrorBoundary FallbackComponent={ErrorFallback}>
            {children}
        </ErrorBoundary>
    );
};

export default ErrorBoundryWrapper;
