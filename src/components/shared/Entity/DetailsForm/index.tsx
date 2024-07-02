import ShardsEditor from 'components/editor/Shards';
import { useEditorStore_id } from 'components/editor/Store/hooks';
import DetailsFormForm from 'components/shared/Entity/DetailsForm/Form';
import DetailsFormHeader from 'components/shared/Entity/DetailsForm/Header';
import { Props } from 'components/shared/Entity/DetailsForm/types';
import WrapperWithHeader from 'components/shared/Entity/WrapperWithHeader';
import { GlobalSearchParams } from 'hooks/searchParams/useGlobalSearchParams';
import { useDetailsFormStore } from 'stores/DetailsForm/Store';
import { useFormStateStore_messagePrefix } from 'stores/FormState/hooks';
import { BooleanParam, useQueryParam } from 'use-query-params';

function DetailsForm({ connectorTags, entityType, readOnly }: Props) {
    const [forcedToEnable] = useQueryParam(
        GlobalSearchParams.FORCED_SHARD_ENABLE,
        BooleanParam
    );

    // Form State Store
    const messagePrefix = useFormStateStore_messagePrefix();
    const detailsFormHasErrors = useDetailsFormStore(
        (state) => state.errorsExist
    );
    const draftId = useEditorStore_id();

    const forceOpen = Boolean(forcedToEnable);

    return (
        <WrapperWithHeader
            forceClose={
                forceOpen
                    ? undefined
                    : !detailsFormHasErrors && draftId !== null
            }
            forceOpen={forceOpen}
            header={<DetailsFormHeader messagePrefix={messagePrefix} />}
            readOnly={Boolean(!forcedToEnable && readOnly)}
        >
            <DetailsFormForm
                connectorTags={connectorTags}
                entityType={entityType}
                readOnly={readOnly}
            />

            <ShardsEditor renderOpen={forceOpen} />
        </WrapperWithHeader>
    );
}

export default DetailsForm;
