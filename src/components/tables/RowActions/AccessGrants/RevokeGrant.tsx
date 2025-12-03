import type { Dispatch, SetStateAction } from 'react';
import type { AccessGrantRowConfirmation } from 'src/components/tables/RowActions/AccessGrants/types';
import type { SelectableTableStore } from 'src/stores/Tables/Store';

import { useEffect, useState } from 'react';

import { useMount } from 'react-use';

import { deleteRoleGrant } from 'src/api/roleGrants';
import { deleteUserGrant } from 'src/api/userGrants';
import Progress from 'src/components/tables/RowActions/AccessGrants/Progress';
import { ProgressStates } from 'src/components/tables/RowActions/Shared/types';
import { useUserInfoSummaryStore } from 'src/context/UserInfoSummary/useUserInfoSummaryStore';
import { useZustandStore } from 'src/context/Zustand/provider';
import { SelectTableStoreNames } from 'src/stores/names';
import { selectableTableStoreSelectors } from 'src/stores/Tables/Store';

export interface Props {
    grant: AccessGrantRowConfirmation;
    onFinish: (response: any) => void;
    runningIntlKey: string;
    selectTableStoreName:
        | SelectTableStoreNames.ACCESS_GRANTS_USERS
        | SelectTableStoreNames.ACCESS_GRANTS_PREFIXES;
    successIntlKey: string;
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
    runningIntlKey,
    selectTableStoreName,
    successIntlKey,
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
            runningIntlKey={runningIntlKey}
            successIntlKey={successIntlKey}
            error={error}
        />
    );
}

export default RevokeGrant;
