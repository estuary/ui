import DetailsFormForm from 'components/shared/Entity/DetailsForm/Form';
import DetailsFormHeader from 'components/shared/Entity/DetailsForm/Header';
import { Props } from 'components/shared/Entity/DetailsForm/types';
import WrapperWithHeader from 'components/shared/Entity/WrapperWithHeader';
import { useZustandStore } from 'context/Zustand';
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

    return (
        <WrapperWithHeader
            header={<DetailsFormHeader messagePrefix={messagePrefix} />}
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
