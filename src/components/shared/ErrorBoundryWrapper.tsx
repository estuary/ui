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
import React from 'react';
import { ErrorBoundary } from 'react-error-boundary';
import { FormattedMessage } from 'react-intl';

type ErrorBoundryWrapperProps = {
    handleReset?: any; //fn
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

            <Divider />
            <Button variant="contained" onClick={resetErrorBoundary}>
                Try again
            </Button>
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
            <Collapse in={expanded} timeout="auto" unmountOnExit>
                <Paper variant="outlined" square>
                    {error.stack}
                </Paper>
            </Collapse>
        </Alert>
    );
}

const ErrorBoundryWrapper: React.FC<ErrorBoundryWrapperProps> = (props) => {
    return (
        <ErrorBoundary
            FallbackComponent={ErrorFallback}
            onReset={props.handleReset ? props.handleReset : () => {}}
        >
            {props.children}
        </ErrorBoundary>
    );
};

export default ErrorBoundryWrapper;
