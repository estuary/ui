import { Alert, AlertTitle, AppBar, Toolbar, Typography } from '@mui/material';
import useConnectorImages from 'hooks/useConnectorImages';
import { Dispatch, useEffect } from 'react';
import { FormattedMessage } from 'react-intl';
import { Action, ActionType, NewCaptureState } from './Reducer';

type NewCaptureSpecFormHeaderProps = {
    dispatch: Dispatch<Action>;
    endpoint: NewCaptureState['links']['connectorImage'];
    docs: NewCaptureState['links']['documentation'];
};

function NewCaptureSpecFormHeader(props: NewCaptureSpecFormHeaderProps) {
    const { endpoint, dispatch, docs } = props;

    const { data, error } = useConnectorImages(endpoint);

    useEffect(() => {
        if (data?.links) {
            dispatch({
                payload: data.links.spec,
                type: ActionType.NEW_SPEC_LINK,
            });
        }
    }, [data, dispatch]);

    if (error) {
        return (
            <Alert severity="error">
                <AlertTitle>
                    <FormattedMessage id="common.errors.heading" />
                </AlertTitle>
                {error}
            </Alert>
        );
    } else if (data?.attributes) {
        return (
            <AppBar position="relative" elevation={0} color="default">
                <Toolbar
                    variant="dense"
                    sx={{
                        justifyContent: 'space-between',
                    }}
                >
                    <Typography variant="h5" color="initial">
                        {data.attributes.name}
                    </Typography>
                    {docs.length > 0 ? { docs } : null}
                </Toolbar>
            </AppBar>
        );
    } else {
        return null;
    }
}

export default NewCaptureSpecFormHeader;
