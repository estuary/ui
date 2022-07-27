import { EditorStoreState } from 'components/editor/Store';
import EndpointConfigForm from 'components/shared/Entity/EndpointConfigForm';
import EndpointConfigHeader from 'components/shared/Entity/EndpointConfigHeader';
import WrapperWithHeader from 'components/shared/Entity/WrapperWithHeader';
import Error from 'components/shared/Error';
import {
    DraftEditorStoreNames,
    EndpointConfigStoreNames,
    useZustandStore,
} from 'context/Zustand';
import useConnectorTag from 'hooks/useConnectorTag';
import { DraftSpecQuery } from 'hooks/useDraftSpecs';

interface Props {
    connectorImage: string;
    draftEditorStoreName: DraftEditorStoreNames;
    endpointConfigStoreName: EndpointConfigStoreNames;
}

function EndpointConfig({
    connectorImage,
    draftEditorStoreName,
    endpointConfigStoreName,
}: Props) {
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
                header={
                    <EndpointConfigHeader
                        endpointConfigStoreName={endpointConfigStoreName}
                        docsPath={connectorTag.documentation_url}
                    />
                }
            >
                <EndpointConfigForm
                    endpointConfigStoreName={endpointConfigStoreName}
                />
            </WrapperWithHeader>
        );
    } else {
        return null;
    }
}

export default EndpointConfig;
