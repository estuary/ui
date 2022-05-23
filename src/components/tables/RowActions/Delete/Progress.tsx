import { createEntityDraft } from 'api/drafts';
import { createDraftSpec } from 'api/draftSpecs';
import { createPublication } from 'api/publications';
import SharedProgress, {
    ProgressStates,
} from 'components/tables/RowActions/Shared/Progress';
import { useEffect, useState } from 'react';

interface Props {
    deleting: any;
    onFinish: (response: any) => void;
}

function DeleteProgress({ deleting, onFinish }: Props) {
    const [state, setState] = useState<ProgressStates>(ProgressStates.RUNNING);
    const [error, setError] = useState<any | null>(null);

    useEffect(() => {
        const failed = (response: any) => {
            console.log('response.error', response.error);

            setState(ProgressStates.FAILED);
            setError(response.error);
            onFinish(response);
        };

        const succeeded = (response: any) => {
            setState(ProgressStates.SUCCESS);
            onFinish(response);
        };

        const makeDeleteCall = async (spec: any) => {
            const entityResponse = await createEntityDraft(spec.catalog_name);
            if (entityResponse.error) {
                return failed(entityResponse);
            }

            const draftSpecResponse = await createDraftSpec(
                entityResponse.data[0].id,
                entityResponse.data[0].detail,
                null
            );
            if (draftSpecResponse.error) {
                return failed(draftSpecResponse);
            }

            const publishResponse = await createPublication(spec.id, true);
            if (publishResponse.error) {
                return failed(publishResponse);
            }

            return succeeded(publishResponse);
        };

        void makeDeleteCall(deleting);
    }, [deleting, onFinish]);

    return (
        <SharedProgress
            name={deleting.catalog_name}
            error={error}
            state={state}
            successMessageID="common.deleted"
            runningMessageID="common.deleting"
        />
    );
}

export default DeleteProgress;
