import KeyValueList, { KeyValue } from 'components/shared/KeyValueList';
import useDraftSpecErrors from 'hooks/useDraftSpecErrors';

export interface DraftErrorProps {
    draftId?: string | null;
}

function DraftErrors({ draftId }: DraftErrorProps) {
    const { draftSpecErrors } = useDraftSpecErrors(draftId);

    if (draftSpecErrors.length > 0) {
        const errors: KeyValue[] = draftSpecErrors.map((draftError) => ({
            title: draftError.scope,
            val: draftError.detail,
        }));
        return <KeyValueList data={errors} />;
    } else {
        return null;
    }
}

export default DraftErrors;
