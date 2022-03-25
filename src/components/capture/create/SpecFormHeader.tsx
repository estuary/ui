import { Alert, AlertTitle, AppBar, Toolbar, Typography } from '@mui/material';
import useCaptureCreationStore, {
    CaptureCreationState,
} from 'components/capture/create/Store';
import useConnectorImages from 'hooks/useConnectorImages';
import { useEffect } from 'react';
import { FormattedMessage } from 'react-intl';
import shallow from 'zustand/shallow';

const linksSelector = (state: CaptureCreationState) => [
    state.links.connectorImage,
    state.links.documentation,
];
const setLinkSelector = (state: CaptureCreationState) => state.setLink;

function NewCaptureSpecFormHeader() {
    const setLink = useCaptureCreationStore(setLinkSelector, shallow);

    const [endpoint, docs] = useCaptureCreationStore(linksSelector, shallow);
    const { data, error } = useConnectorImages(endpoint);

    useEffect(() => {
        if (endpoint && data?.links.spec && data.links.spec.length > 0) {
            setLink('spec', data.links.spec);
        }
    }, [endpoint, data, setLink]);

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
