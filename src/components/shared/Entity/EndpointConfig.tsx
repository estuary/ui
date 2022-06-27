import { EditorStoreState } from 'components/editor/Store';
import EndpointConfigForm from 'components/shared/Entity/EndpointConfigForm';
import EndpointConfigHeader from 'components/shared/Entity/EndpointConfigHeader';
import WrapperWithHeader from 'components/shared/Entity/WrapperWithHeader';
import Error from 'components/shared/Error';
import { DraftEditorStoreNames, useZustandStore } from 'context/Zustand';
import useConnectorTag from 'hooks/useConnectorTag';
import { DraftSpecQuery } from 'hooks/useDraftSpecs';

interface Props {
    connectorImage: string;
    draftEditorStoreName: DraftEditorStoreNames;
}

function EndpointConfig({ connectorImage, draftEditorStoreName }: Props) {
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
                        docsPath={connectorTag.documentation_url}
                    />
                }
            >
                <EndpointConfigForm
                    endpointSchema={connectorTag.endpoint_spec_schema}
                />
            </WrapperWithHeader>
        );
    } else {
        return null;
    }
}

export default EndpointConfig;
