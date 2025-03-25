import type { Dispatch, SetStateAction } from 'react';
import type { SelectableTableStore } from 'stores/Tables/Store';
import type { AccessGrantRowConfirmation } from './types';
import { deleteRoleGrant } from 'api/roleGrants';
import { deleteUserGrant } from 'api/userGrants';
import { ProgressStates } from 'components/tables/RowActions/Shared/types';
import { useZustandStore } from 'context/Zustand/provider';
import { useEffect, useState } from 'react';
import { useMount } from 'react-use';
import { selectableTableStoreSelectors } from 'stores/Tables/Store';
import { SelectTableStoreNames } from 'stores/names';
import { useUserInfoSummaryStore } from 'context/UserInfoSummary/useUserInfoSummaryStore';
import Progress from './Progress';

export interface Props {
    grant: AccessGrantRowConfirmation;
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

    const mutate = useUserInfoSummaryStore((state) => state.mutate);

    useMount(() => {
        void revokeGrant(
            grant.id,
            onFinish,
            selectTableStoreName,
            setError,
            setProgress
        );
    });

    useEffect(() => {
        if (progress === ProgressStates.SUCCESS) {
            incrementSuccessfulTransformations();
            if (mutate) {
                void mutate();
            }
        }
    }, [incrementSuccessfulTransformations, mutate, progress]);

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
