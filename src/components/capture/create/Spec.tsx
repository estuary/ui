import { Divider, Paper, Skeleton } from '@mui/material';
import NewCaptureSpecForm from 'components/capture/create/SpecForm';
import NewCaptureSpecFormHeader from 'components/capture/create/SpecFormHeader';
import useCaptureCreationStore, {
    CaptureCreationState,
} from 'components/capture/create/Store';
import Error from 'components/shared/Error';
import useConnectorTags from 'hooks/useConnectorTags';

const selectors = {
    captureImage: (state: CaptureCreationState) => state.details.data.image,
};

function NewCaptureSpec(props: {
    displayValidation: boolean;
    readonly: boolean;
}) {
    const { readonly, displayValidation } = props;
    const captureImage = useCaptureCreationStore(selectors.captureImage);
    const {
        data: connector,
        isError,
        isSuccess,
        isLoading,
        error,
    } = useConnectorTags(captureImage);

    if (isError) {
        return <Error error={error} />;
    } else if (isLoading) {
        return <Skeleton variant="rectangular" height={40} width="50%" />;
    } else if (isSuccess && connector) {
        return (
            <Paper sx={{ width: '100%' }} variant="outlined">
                <NewCaptureSpecFormHeader
                    name={connector.image_name}
                    docsPath={connector.documentation_url}
                />
                <Divider />
                <NewCaptureSpecForm
                    endpointSchema={connector.endpoint_spec_schema}
                    displayValidation={displayValidation}
                    readonly={readonly}
                />
            </Paper>
        );
    } else {
        return null;
    }
}

export default NewCaptureSpec;
