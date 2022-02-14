import { Alert, AlertTitle, AppBar, Toolbar, Typography } from '@mui/material';
import useConnectorImages from 'hooks/useConnectorImages';
import { useEffect } from 'react';
import { FormattedMessage } from 'react-intl';
import { useNewCaptureContext } from './NewCaptureContext';
import { ActionType } from './NewCaptureReducer';

type NewCaptureSpecFormHeaderProps = {};

function NewCaptureSpecFormHeader(props: NewCaptureSpecFormHeaderProps) {
    const { state, dispatch } = useNewCaptureContext();

    const {
        connectorImageAttributes,
        connectorImageLinks,
        connectorImageError,
    } = useConnectorImages(state.details.data.image);

    useEffect(() => {
        dispatch({
            type: ActionType.ENDPOINT_CHANGED_SPEC,
            payload: connectorImageLinks.spec,
        });
    }, [connectorImageLinks.spec, dispatch]);

    if (connectorImageError !== null) {
        return (
            <Alert severity="error">
                <AlertTitle>
                    <FormattedMessage id="common.errors.heading" />
                </AlertTitle>
                {connectorImageError}
            </Alert>
        );
    } else if (
        connectorImageAttributes !== null &&
        connectorImageLinks !== null
    ) {
        return (
            <AppBar position="relative" elevation={0} color="default">
                <Toolbar
                    variant="dense"
                    sx={{
                        justifyContent: 'space-between',
                    }}
                >
                    <Typography variant="h5" color="initial">
                        {connectorImageAttributes!.name}
                    </Typography>
                </Toolbar>
            </AppBar>
        );
    } else {
        return <></>;
    }
}

export default NewCaptureSpecFormHeader;
