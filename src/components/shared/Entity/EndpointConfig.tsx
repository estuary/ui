import { Alert } from '@mui/material';
import { EditorStoreState } from 'components/editor/Store';
import EndpointConfigForm from 'components/shared/Entity/EndpointConfigForm';
import EndpointConfigHeader from 'components/shared/Entity/EndpointConfigHeader';
import WrapperWithHeader from 'components/shared/Entity/WrapperWithHeader';
import Error from 'components/shared/Error';
import {
    DraftEditorStoreNames,
    FormStateStoreNames,
    useZustandStore,
} from 'context/Zustand';
import useConnectorTag from 'hooks/useConnectorTag';
import { DraftSpecQuery } from 'hooks/useDraftSpecs';
import { useIntl } from 'react-intl';
import { JsonFormsData } from 'types';

interface Props {
    connectorImage: string;
    draftEditorStoreName: DraftEditorStoreNames;
    formStateStoreName: FormStateStoreNames;
    readOnly?: boolean;
    initialEndpointConfig?: JsonFormsData | null;
}

function EndpointConfig({
    connectorImage,
    draftEditorStoreName,
    formStateStoreName,
    readOnly = false,
    initialEndpointConfig,
}: Props) {
    const intl = useIntl();

    const { connectorTag, error } = useConnectorTag(connectorImage);

    const draftId = useZustandStore<
        EditorStoreState<DraftSpecQuery>,
        EditorStoreState<DraftSpecQuery>['id']
    >(draftEditorStoreName, (state) => state.id);

    if (error) {
        return <Error error={error} />;
    } else if (connectorTag) {
        return (
            <WrapperWithHeader
                forceClose={draftId !== null}
                readOnly={readOnly}
                header={
                    <EndpointConfigHeader
                        docsPath={connectorTag.documentation_url}
                    />
                }
            >
                <Alert color="info" style={{ marginBottom: 8 }}>
                    {intl.formatMessage({
                        id: 'entityEdit.alert.endpointConfigDisabled',
                    })}
                </Alert>

                <EndpointConfigForm
                    formStateStoreName={formStateStoreName}
                    readOnly={readOnly}
                    initialEndpointConfig={initialEndpointConfig}
                />
            </WrapperWithHeader>
        );
    } else {
        return null;
    }
}

export default EndpointConfig;
