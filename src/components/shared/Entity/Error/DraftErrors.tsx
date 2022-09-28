import KeyValueList, { KeyValue } from 'components/shared/KeyValueList';
import useDraftSpecErrors from 'hooks/useDraftSpecErrors';

export interface DraftErrorProps {
    draftId?: string | null;
    enablePolling?: boolean;
}

function DraftErrors({ draftId, enablePolling }: DraftErrorProps) {
    const { draftSpecErrors } = useDraftSpecErrors(draftId, enablePolling);

    if (draftSpecErrors.length > 0) {
        const errors: KeyValue[] = draftSpecErrors.map((draftError) => ({
            title: draftError.detail,
            val: draftError.scope,
        }));
        return <KeyValueList data={errors} />;
    } else {
        return null;
    }
}

export default DraftErrors;
