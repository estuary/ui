import type { Dispatch, SetStateAction } from 'react';
import type { SelectableTableStore } from 'stores/Tables/Store';
import type { RowConfirmation } from '../types';
import { disableDirective } from 'api/directives';
import Progress from 'components/tables/RowActions/AccessLinks/Progress';
import { ProgressStates } from 'components/tables/RowActions/Shared/types';
import { useZustandStore } from 'context/Zustand/provider';
import { useEffect, useState } from 'react';
import { SelectTableStoreNames } from 'stores/names';
import { selectableTableStoreSelectors } from 'stores/Tables/Store';

const selectableTableStoreName = SelectTableStoreNames.ACCESS_GRANTS_LINKS;

export interface DisableDirectiveProps {
    linkConfig: RowConfirmation;
    runningMessageID: string;
    successMessageID: string;
    onFinish: (response: any) => void;
}

const disableInvitation = async (
    directiveId: string,
    setProgress: Dispatch<SetStateAction<ProgressStates>>,
    setError: Dispatch<SetStateAction<any | null>>,
    onFinish: (response: any) => void
) => {
    const response = await disableDirective(directiveId);

    if (!response.error && response.data) {
        setProgress(ProgressStates.SUCCESS);
    } else {
        setError(response.error ? response.error : {});
        setProgress(ProgressStates.FAILED);
    }

    onFinish(directiveId);
};

function DisableDirective({
    linkConfig,
    runningMessageID,
    successMessageID,
    onFinish,
}: DisableDirectiveProps) {
    const [progress, setProgress] = useState<ProgressStates>(
        ProgressStates.RUNNING
    );
    const [error, setError] = useState<any | null>(null);

    const incrementSuccessfulTransformations = useZustandStore<
        SelectableTableStore,
        SelectableTableStore['incrementSuccessfulTransformations']
    >(
        selectableTableStoreName,
        selectableTableStoreSelectors.successfulTransformations.increment
    );

    useEffect(() => {
        void disableInvitation(linkConfig.id, setProgress, setError, onFinish);
    }, [onFinish, setProgress, linkConfig.id]);

    useEffect(() => {
        if (progress === ProgressStates.SUCCESS) {
            incrementSuccessfulTransformations();
        }
    }, [incrementSuccessfulTransformations, progress]);

    return (
        <Progress
            progress={progress}
            item={linkConfig.message}
            runningMessageID={runningMessageID}
            successMessageID={successMessageID}
            error={error}
        />
    );
}

export default DisableDirective;
