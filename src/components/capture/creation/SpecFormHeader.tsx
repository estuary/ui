import { Alert, AlertTitle, AppBar, Toolbar, Typography } from '@mui/material';
import useConnectorImages from 'hooks/useConnectorImages';
import { useEffect } from 'react';
import { FormattedMessage } from 'react-intl';
import { ActionType } from './Reducer';

type NewCaptureSpecFormHeaderProps = {
    dispatch: any;
    endpoint: string;
    docs: string;
};

function NewCaptureSpecFormHeader(props: NewCaptureSpecFormHeaderProps) {
    const { endpoint, dispatch, docs } = props;

    const {
        connectorImageAttributes,
        connectorImageLinks,
        connectorImageError,
    } = useConnectorImages(endpoint);

    useEffect(() => {
        dispatch({
            type: ActionType.NEW_SPEC_LINK,
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
                    {docs !== '' ? <>Link here</> : null}
                </Toolbar>
            </AppBar>
        );
    } else {
        return <></>;
    }
}

export default NewCaptureSpecFormHeader;
