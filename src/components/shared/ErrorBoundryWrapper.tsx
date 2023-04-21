import {
    Button,
    Collapse,
    Divider,
    IconButton,
    Paper,
    useTheme,
} from '@mui/material';
import { usePrompt } from 'hooks/useBlocker';
import { NavArrowDown } from 'iconoir-react';
import { ReactNode, useState } from 'react';
import { ErrorBoundary } from 'react-error-boundary';
import { FormattedMessage, useIntl } from 'react-intl';
import { useNavigate } from 'react-router-dom';
import { useMount } from 'react-use';
import { CustomEvents, logRocketEvent } from 'services/logrocket';
import AlertBox from './AlertBox';

interface Props {
    children: ReactNode;
}

function ErrorFallback({ error }: { error: Error }): JSX.Element {
    const intl = useIntl();
    const theme = useTheme();
    const navigate = useNavigate();

    const [offerReload, setOfferReload] = useState(false);
    const [expanded, setExpanded] = useState(false);

    usePrompt('confirm.loseData', offerReload);

    const handleExpandClick = () => {
        setExpanded(!expanded);
    };

    const reloadPage = () => {
        navigate(0);
    };

    useMount(() => {
        console.log('Error boundry displayed', error);
        if (error.name === 'ChunkLoadError') {
            setOfferReload(true);
        }
        logRocketEvent(CustomEvents.ERROR_BOUNDRY_DISPLAYED, {
            name: error.name,
            stackTrace: error.stack,
        });
    });

    return (
        <AlertBox
            short
            severity="error"
            title={<FormattedMessage id="errorBoundry.title" />}
        >
            <FormattedMessage
                id={
                    offerReload
                        ? 'errorBoundry.chunkNotFetched.message1'
                        : 'errorBoundry.message1'
                }
            />
            <FormattedMessage
                id={
                    offerReload
                        ? 'errorBoundry.chunkNotFetched.message2'
                        : 'errorBoundry.message2'
                }
            />

            <Divider />

            {offerReload ? (
                <Button onClick={reloadPage}>Reload</Button>
            ) : (
                <>
                    <IconButton
                        onClick={handleExpandClick}
                        aria-expanded={expanded}
                        aria-label={intl.formatMessage({
                            id: expanded
                                ? 'aria.closeExpand'
                                : 'aria.openExpand',
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
                </>
            )}

            <Divider />
        </AlertBox>
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
