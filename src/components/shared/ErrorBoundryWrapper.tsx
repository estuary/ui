import { ExpandMore } from '@mui/icons-material';
import {
    Alert,
    AlertTitle,
    Button,
    Collapse,
    Divider,
    IconButton,
    Paper,
} from '@mui/material';
import React, { ReactNode } from 'react';
import { ErrorBoundary } from 'react-error-boundary';
import { FormattedMessage } from 'react-intl';

interface ErrorBoundryWrapperProps {
    children: ReactNode;
    handleReset?: any; //fn
}

function ErrorFallback({
    error,
    resetErrorBoundary,
}: {
    error: Error;
    resetErrorBoundary: any;
}): JSX.Element {
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
            {resetErrorBoundary ? (
                <Button variant="contained" onClick={resetErrorBoundary}>
                    Try again
                </Button>
            ) : null}
            <IconButton
                onClick={handleExpandClick}
                aria-expanded={expanded}
                aria-label="show more"
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

const ErrorBoundryWrapper = (props: ErrorBoundryWrapperProps) => {
    const { handleReset, children } = props;

    return (
        <ErrorBoundary
            FallbackComponent={ErrorFallback}
            onReset={handleReset ? handleReset : () => {}}
        >
            {children}
        </ErrorBoundary>
    );
};

export default ErrorBoundryWrapper;
