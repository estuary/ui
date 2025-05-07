import type { Props } from 'src/components/shared/Entity/DetailsForm/types';

import { BooleanParam, useQueryParam } from 'use-query-params';

import ShardsEditor from 'src/components/editor/Shards';
import { useEditorStore_id } from 'src/components/editor/Store/hooks';
import DetailsFormForm from 'src/components/shared/Entity/DetailsForm/Form';
import DetailsFormHeader from 'src/components/shared/Entity/DetailsForm/Header';
import WrapperWithHeader from 'src/components/shared/Entity/WrapperWithHeader';
import { GlobalSearchParams } from 'src/hooks/searchParams/useGlobalSearchParams';
import { useDetailsFormStore } from 'src/stores/DetailsForm/Store';
import { useFormStateStore_messagePrefix } from 'src/stores/FormState/hooks';

function DetailsForm({ entityType, readOnly }: Props) {
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
            <DetailsFormForm entityType={entityType} readOnly={readOnly} />
            <ShardsEditor renderOpen={forceOpen} />
        </WrapperWithHeader>
    );
}

export default DetailsForm;
