import { EditorStoreState } from 'components/editor/Store';
import EndpointConfigForm from 'components/shared/Entity/EndpointConfigForm';
import EndpointConfigHeader from 'components/shared/Entity/EndpointConfigHeader';
import ValidationErrorSummary from 'components/shared/Entity/ValidationErrorSummary';
import EndpointConfigErrors from 'components/shared/Entity/ValidationErrorSummary/EndpointConfigErrors';
import WrapperWithHeader from 'components/shared/Entity/WrapperWithHeader';
import Error from 'components/shared/Error';
import { DraftEditorStoreNames, useZustandStore } from 'context/Zustand';
import useConnectorTag from 'hooks/useConnectorTag';
import { DraftSpecQuery } from 'hooks/useDraftSpecs';
import { entityCreateStoreSelectors } from 'stores/Create';

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
                <ValidationErrorSummary
                    hideIcon={true}
                    headerMessageId="entityCreate.endpointConfig.endpointConfigHaveErrors"
                    ErrorComponent={EndpointConfigErrors}
                    hasErrorsSelector={
                        entityCreateStoreSelectors.endpointConfig.hasErrors
                    }
                />
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
