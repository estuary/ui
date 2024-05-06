import { deleteRoleGrant } from 'api/roleGrants';
import { deleteUserGrant } from 'api/userGrants';
import { ProgressStates } from 'components/tables/RowActions/Shared/Progress';
import { useZustandStore } from 'context/Zustand/provider';
import { Dispatch, SetStateAction, useEffect, useState } from 'react';
import {
    SelectableTableStore,
    selectableTableStoreSelectors,
} from 'stores/Tables/Store';
import { SelectTableStoreNames } from 'stores/names';
import Progress from './Progress';

export interface Props {
    grant: { id: string; message: string };
    onFinish: (response: any) => void;
    runningMessageID: string;
    selectTableStoreName:
        | SelectTableStoreNames.ACCESS_GRANTS_USERS
        | SelectTableStoreNames.ACCESS_GRANTS_PREFIXES;
    successMessageID: string;
}

const revokeGrant = async (
    grantId: string,
    onFinish: (response: any) => void,
    selectTableStoreName:
        | SelectTableStoreNames.ACCESS_GRANTS_USERS
        | SelectTableStoreNames.ACCESS_GRANTS_PREFIXES,
    setError: Dispatch<SetStateAction<any | null>>,
    setProgress: Dispatch<SetStateAction<ProgressStates>>
) => {
    const response =
        selectTableStoreName === SelectTableStoreNames.ACCESS_GRANTS_USERS
            ? await deleteUserGrant(grantId)
            : await deleteRoleGrant(grantId);

    if (!response.error && response.data) {
        setProgress(ProgressStates.SUCCESS);
    } else {
        setError(response.error ? response.error : {});
        setProgress(ProgressStates.FAILED);
    }

    onFinish(grantId);
};

function RevokeGrant({
    grant,
    onFinish,
    runningMessageID,
    selectTableStoreName,
    successMessageID,
}: Props) {
    const [progress, setProgress] = useState<ProgressStates>(
        ProgressStates.RUNNING
    );
    const [error, setError] = useState<any | null>(null);

    const incrementSuccessfulTransformations = useZustandStore<
        SelectableTableStore,
        SelectableTableStore['incrementSuccessfulTransformations']
    >(
        selectTableStoreName,
        selectableTableStoreSelectors.successfulTransformations.increment
    );

    useEffect(() => {
        void revokeGrant(
            grant.id,
            onFinish,
            selectTableStoreName,
            setError,
            setProgress
        );
    }, [grant.id, onFinish, selectTableStoreName, setProgress]);

    useEffect(() => {
        if (progress === ProgressStates.SUCCESS) {
            incrementSuccessfulTransformations();
        }
    }, [incrementSuccessfulTransformations, progress]);

    return (
        <Progress
            progress={progress}
            item={grant.message}
            runningMessageID={runningMessageID}
            successMessageID={successMessageID}
            error={error}
        />
    );
}

export default RevokeGrant;
