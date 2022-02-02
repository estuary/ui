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
import { FormattedMessage } from 'react-intl';

type ErrorBoundryWrapperProps = {
    children: ReactNode;
};

function ErrorFallback({
    error,
    resetErrorBoundary,
}: {
    error: any;
    resetErrorBoundary: any;
}): any {
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
            <IconButton
                onClick={handleExpandClick}
                aria-expanded={expanded}
                aria-label="show more"
                sx={{
                    marginRight: 0,
                    transform: !expanded ? 'rotate(0deg)' : 'rotate(180deg)',
                    transition: 'all 250ms ease-in-out',
                }}
            >
                <ExpandMore />
            </IconButton>
            <Divider />
            <Collapse in={expanded} timeout="auto" unmountOnExit>
                <Paper variant="outlined" square>
                    {error.stack}
                </Paper>
            </Collapse>
        </Alert>
    );
}

function ErrorBoundryWrapper(props: ErrorBoundryWrapperProps) {
    return (
        <ErrorBoundary FallbackComponent={ErrorFallback}>
            {props.children}
        </ErrorBoundary>
    );
}

export default ErrorBoundryWrapper;
