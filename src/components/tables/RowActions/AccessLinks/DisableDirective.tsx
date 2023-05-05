import { disableDirective } from 'api/directives';
import Progress from 'components/tables/RowActions/AccessLinks/Progress';
import { ProgressStates } from 'components/tables/RowActions/Shared/Progress';
import { useZustandStore } from 'context/Zustand/provider';
import { Dispatch, SetStateAction, useEffect, useState } from 'react';
import { SelectTableStoreNames } from 'stores/names';
import {
    SelectableTableStore,
    selectableTableStoreSelectors,
} from 'stores/Tables/Store';

const selectableTableStoreName = SelectTableStoreNames.ACCESS_GRANTS_LINKS;

export interface Props {
    linkConfig: { directiveId: string; accessLink: string };
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
}: Props) {
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
        void disableInvitation(
            linkConfig.directiveId,
            setProgress,
            setError,
            onFinish
        );
    }, [onFinish, setProgress, linkConfig.directiveId]);

    useEffect(() => {
        if (progress === ProgressStates.SUCCESS) {
            incrementSuccessfulTransformations();
        }
    }, [incrementSuccessfulTransformations, progress]);

    return (
        <Progress
            progress={progress}
            item={linkConfig.accessLink}
            runningMessageID={runningMessageID}
            successMessageID={successMessageID}
            error={error}
        />
    );
}

export default DisableDirective;
