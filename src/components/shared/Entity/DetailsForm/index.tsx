import { EditorStoreState } from 'components/editor/Store';
import DetailsFormForm from 'components/shared/Entity/DetailsForm/Form';
import DetailsFormHeader from 'components/shared/Entity/DetailsForm/Header';
import { Props } from 'components/shared/Entity/DetailsForm/types';
import WrapperWithHeader from 'components/shared/Entity/WrapperWithHeader';
import { useZustandStore } from 'context/Zustand';
import { DraftSpecQuery } from 'hooks/useDraftSpecs';
import { EntityFormState } from 'stores/FormState';

function DetailsForm({
    connectorTags,
    accessGrants,
    draftEditorStoreName,
    formStateStoreName,
    entityType,
    readOnly,
}: Props) {
    // Form State Store
    const messagePrefix = useZustandStore<
        EntityFormState,
        EntityFormState['messagePrefix']
    >(formStateStoreName, (state) => state.messagePrefix);

    const draftId = useZustandStore<
        EditorStoreState<DraftSpecQuery>,
        EditorStoreState<DraftSpecQuery>['id']
    >(draftEditorStoreName, (state) => state.id);

    return (
        <WrapperWithHeader
            forceClose={draftId !== null}
            header={<DetailsFormHeader messagePrefix={messagePrefix} />}
            readOnly={readOnly}
        >
            <DetailsFormForm
                connectorTags={connectorTags}
                accessGrants={accessGrants}
                draftEditorStoreName={draftEditorStoreName}
                formStateStoreName={formStateStoreName}
                entityType={entityType}
                readOnly={readOnly}
            />
        </WrapperWithHeader>
    );
}

export default DetailsForm;
