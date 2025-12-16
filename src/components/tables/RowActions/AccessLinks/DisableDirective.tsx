import type { Dispatch, SetStateAction } from 'react';
import type { RowConfirmation } from 'src/components/tables/RowActions/types';
import type { SelectableTableStore } from 'src/stores/Tables/Store';

import { useEffect, useState } from 'react';

import { disableDirective } from 'src/api/directives';
import Progress from 'src/components/tables/RowActions/AccessLinks/Progress';
import { ProgressStates } from 'src/components/tables/RowActions/Shared/types';
import { useZustandStore } from 'src/context/Zustand/provider';
import { SelectTableStoreNames } from 'src/stores/names';
import { selectableTableStoreSelectors } from 'src/stores/Tables/Store';

const selectableTableStoreName = SelectTableStoreNames.ACCESS_GRANTS_LINKS;

export interface DisableDirectiveProps {
    linkConfig: RowConfirmation;
    runningIntlKey: string;
    successIntlKey: string;
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
    runningIntlKey,
    successIntlKey,
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
            runningIntlKey={runningIntlKey}
            successIntlKey={successIntlKey}
            error={error}
        />
    );
}

export default DisableDirective;
