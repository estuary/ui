import { useEditorStore_id } from 'components/editor/Store/hooks';
import DetailsFormForm from 'components/shared/Entity/DetailsForm/Form';
import DetailsFormHeader from 'components/shared/Entity/DetailsForm/Header';
import { Props } from 'components/shared/Entity/DetailsForm/types';
import WrapperWithHeader from 'components/shared/Entity/WrapperWithHeader';
import { useDetailsFormStore } from 'stores/DetailsForm/Store';
import { useFormStateStore_messagePrefix } from 'stores/FormState/hooks';

function DetailsForm({ connectorTags, entityType, readOnly }: Props) {
    // Form State Store
    const messagePrefix = useFormStateStore_messagePrefix();
    const detailsFormHasErrors = useDetailsFormStore(
        (state) => state.errorsExist
    );
    const draftId = useEditorStore_id();

    const forceClose = !detailsFormHasErrors && draftId !== null;

    return (
        <WrapperWithHeader
            forceClose={forceClose}
            header={<DetailsFormHeader messagePrefix={messagePrefix} />}
            readOnly={readOnly}
        >
            <DetailsFormForm
                connectorTags={connectorTags}
                entityType={entityType}
                readOnly={readOnly}
            />
        </WrapperWithHeader>
    );
}

export default DetailsForm;
